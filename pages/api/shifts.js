import { supabaseAdmin } from '../../lib/supabase';
import { sendSMS } from '../../lib/twilio';

const TEST_MODE = process.env.SMS_TEST_MODE === 'true';

function shortName(fullName) {
  if (!fullName) return '';
  const parts = fullName.split(',').map(s => s.trim());
  if (parts.length === 2) {
    return `${parts[1]} ${parts[0].charAt(0)}.`;
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

function formatLongDate(isoDate) {
  if (!isoDate) return '';
  return new Date(isoDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

async function sendOrLog(phone, msg, name, shift_id) {
  let result;
  if (TEST_MODE) {
    console.log(`[TEST MODE] Would send to ${name} (${phone}): ${msg}`);
    result = { success: true, testMode: true, sid: 'TEST_MODE_NO_SEND' };
  } else {
    result = await sendSMS(phone, msg);
  }
  await supabaseAdmin.from('sms_log').insert([{
    to_name: name,
    to_phone: TEST_MODE ? `[TEST] ${phone}` : phone,
    message: TEST_MODE ? `[TEST MODE - NOT SENT] ${msg}` : msg,
    shift_id,
  }]);
  return result;
}

// Check for claims older than 4 hours that haven't been confirmed yet,
// text admin a reminder. Runs opportunistically on GET so we don't need
// a paid Vercel cron tier for hourly polling.
async function checkStaleClaims() {
  if (!isWithinTextingHours()) return;
  const adminPhone = process.env.ADMIN_PHONE;
  if (!adminPhone) return;

  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

  const { data: stale } = await supabaseAdmin
    .from('shifts')
    .select('*')
    .eq('status', 'claimed')
    .lte('claimed_at', fourHoursAgo)
    .eq('admin_reminder_sent', false);

  if (!stale || stale.length === 0) return;

  for (const shift of stale) {
    const dateStr = formatLongDate(shift.date);
    const instrShort = shortName(shift.instructor_name);
    const coachShort = shortName(shift.claimed_by_name);
    const msg =
      `⏰ Bay Aerials reminder:\n` +
      `${coachShort} claimed a shift 4+ hrs ago and still needs confirmation.\n` +
      `📅 ${dateStr} ${shift.time} – ${shift.cls}\n` +
      `Covering: ${instrShort}\n` +
      `Confirm in the app.`;

    await sendOrLog(adminPhone, msg, 'Admin', shift.id);
    await supabaseAdmin
      .from('shifts')
      .update({ admin_reminder_sent: true })
      .eq('id', shift.id);
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    checkStaleClaims().catch(err => console.error('Stale claim check failed:', err));

    const { data, error } = await supabaseAdmin
      .from('shifts')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { instructor_name, date, day, time, cls, notes } = req.body;
    if (!instructor_name || !date || !day || !time || !cls) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabaseAdmin
      .from('shifts')
      .insert([{ instructor_name, date, day, time, cls, notes, status: 'open' }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'id is required' });

    const { data: shift, error: fetchErr } = await supabaseAdmin
      .from('shifts')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr) return res.status(500).json({ error: fetchErr.message });

    if (shift && (shift.status === 'claimed' || shift.status === 'confirmed') && shift.claimed_by_name) {
      const { data: coach } = await supabaseAdmin
        .from('coaches')
        .select('phone')
        .eq('name', shift.claimed_by_name)
        .single();

      if (coach?.phone && isWithinTextingHours()) {
        const dateStr = formatLongDate(shift.date);
        const instrShort = shortName(shift.instructor_name);
        const msg =
          `Bay Aerials: Sub shift cancelled ❌\n` +
          `You're no longer needed for:\n` +
          `📅 ${dateStr} ${shift.time}\n` +
          `🤸 ${shift.cls}\n` +
          `Covering: ${instrShort}\n` +
          `Thanks for being available!`;
        await sendOrLog(coach.phone, msg, shift.claimed_by_name, id);
      }
    }

    const { error } = await supabaseAdmin.from('shifts').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
