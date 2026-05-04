import { supabaseAdmin } from '../../lib/supabase';
import { sendSMS } from '../../lib/twilio';

const TEST_MODE = process.env.SMS_TEST_MODE === 'true';

// Short last-name shortener: "Bryan, Julia" -> "Julia B."
function shortName(fullName) {
  if (!fullName) return '';
  const parts = fullName.split(',').map(s => s.trim());
  if (parts.length === 2) {
    const last = parts[0];
    const first = parts[1];
    return `${first} ${last.charAt(0)}.`;
  }
  return fullName;
}

function isWithinTextingHours() {
  const now = new Date();
  const pacificHour = parseInt(
    now.toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      hour: 'numeric',
      hour12: false,
    })
  );
  return pacificHour >= 8 && pacificHour < 20;
}

function getCurrentPacificHour() {
  const now = new Date();
  return now.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatLongDate(isoDate) {
  if (!isoDate) return '';
  return new Date(isoDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const { shift_id, shift_ids, coaches, callout_admin, callout_coach_name, callout_note } = req.body;

  // CALL-OUT admin notification path: text Admin that a coach called out
  if (callout_admin) {
    if (!shift_ids || shift_ids.length === 0) {
      return res.status(400).json({ error: 'shift_ids required for call-out admin notification' });
    }

    if (!isWithinTextingHours()) {
      return res.status(200).json({ sent: 0, blocked: true, reason: 'Outside texting hours' });
    }

    const { data: shifts, error: sErr } = await supabaseAdmin
      .from('shifts')
      .select('*')
      .in('id', shift_ids);

    if (sErr) return res.status(500).json({ error: sErr.message });
    if (!shifts || shifts.length === 0) return res.status(404).json({ error: 'No shifts found' });

    const dateStr = formatLongDate(shifts[0].date);
    const sorted = [...shifts].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    const classList = sorted.map(s => `  • ${s.time} – ${s.cls}`).join('\n');
    const coachShort = shortName(callout_coach_name || shifts[0].instructor_name);

    const adminMsg =
      `⚠️ Bay Aerials call-out:\n` +
      `${coachShort} — ${dateStr}\n` +
      `${classList}\n` +
      (callout_note ? `Note: ${callout_note}\n` : '') +
      `Subs already notified.`;

    const adminPhone = process.env.ADMIN_PHONE;
    const results = [];
    if (adminPhone) {
      let result;
      if (TEST_MODE) {
        console.log(`[TEST MODE] Would text Admin (${adminPhone}): ${adminMsg}`);
        result = { success: true, testMode: true };
      } else {
        result = await sendSMS(adminPhone, adminMsg);
      }
      await supabaseAdmin.from('sms_log').insert([{
        to_name: 'Admin (call-out)',
        to_phone: TEST_MODE ? `[TEST] ${adminPhone}` : adminPhone,
        message: TEST_MODE ? `[TEST MODE - NOT SENT] ${adminMsg}` : adminMsg,
        shift_id: shift_ids[0],
      }]);
      results.push({ recipient: 'Admin', ...result });
    }

    return res.status(200).json({ sent: results.length, testMode: TEST_MODE, results });
  }

  // STANDARD post-shift / sub-needed notification path
  if ((!shift_id && !shift_ids) || !coaches?.length) {
    return res.status(400).json({ error: 'shift_id (or shift_ids) and coaches are required' });
  }

  const idsToFetch = shift_ids && shift_ids.length > 0 ? shift_ids : [shift_id];

  if (!isWithinTextingHours()) {
    const currentTime = getCurrentPacificHour();
    console.log(`SMS blocked — outside texting hours (current: ${currentTime} Pacific)`);

    await supabaseAdmin.from('sms_log').insert([{
      to_name: `${coaches.length} coaches`,
      to_phone: 'BLOCKED',
      to_email: '',
      message: `SMS blocked — sent outside texting hours (${currentTime} Pacific). Texts will not be sent between 8 PM and 8 AM.`,
      shift_id: idsToFetch[0],
    }]);

    return res.status(200).json({
      sent: 0,
      blocked: true,
      reason: `Outside texting hours (${currentTime} Pacific). Texts only sent 8 AM – 8 PM.`,
      results: [],
    });
  }

  const { data: shifts, error: shiftErr } = await supabaseAdmin
    .from('shifts')
    .select('*')
    .in('id', idsToFetch);

  if (shiftErr) return res.status(500).json({ error: shiftErr.message });
  if (!shifts || shifts.length === 0) return res.status(404).json({ error: 'No shifts found' });

  const firstShift = shifts[0];
  const dateStr = formatLongDate(firstShift.date);
  const instructorShort = shortName(firstShift.instructor_name);
  const sorted = [...shifts].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  const classList = sorted.map(s => `  • ${s.time} – ${s.cls}`).join('\n');

  const results = [];

  for (const coach of coaches) {
    if (!coach.phone) continue;

    const msg =
      `Bay Aerials: Sub needed ${dateStr}!\n` +
      `${classList}\n` +
      `Covering: ${instructorShort}\n` +
      `Code: ${coach.code}`;

    let result;
    if (TEST_MODE) {
      console.log(`[TEST MODE] Would send to ${coach.name} (${coach.phone}): ${msg}`);
      result = { success: true, testMode: true, sid: 'TEST_MODE_NO_SEND' };
    } else {
      result = await sendSMS(coach.phone, msg);
    }

    await supabaseAdmin.from('sms_log').insert([{
      to_name: coach.name,
      to_phone: TEST_MODE ? `[TEST] ${coach.phone}` : coach.phone,
      to_email: coach.email || '',
      message: TEST_MODE ? `[TEST MODE - NOT SENT] ${msg}` : msg,
      shift_id: idsToFetch[0],
    }]);

    results.push({ coach: coach.name, ...result });
  }

  return res.status(200).json({ sent: results.length, testMode: TEST_MODE, results });
}
