import { supabaseAdmin } from '../../lib/supabase';
import { sendSMS } from '../../lib/twilio';

const TEST_MODE = process.env.SMS_TEST_MODE === 'true';

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const { shift_id, action, coach_id, coach_name, code } = req.body;

  // VERIFY COACH CODE
  if (action === 'verify_code') {
    if (!code) return res.status(400).json({ error: 'Code is required' });

    const { data, error } = await supabaseAdmin
      .from('coaches')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('active', true)
      .single();

    if (error || !data) return res.status(401).json({ error: 'Code not found or coach is inactive.' });
    return res.status(200).json(data);
  }

  if (!shift_id || !action) {
    return res.status(400).json({ error: 'shift_id and action are required' });
  }

  // CLAIM
  if (action === 'claim') {
    const { data, error } = await supabaseAdmin
      .from('shifts')
      .update({
        status: 'claimed',
        claimed_by_id: coach_id,
        claimed_by_name: coach_name,
        claimed_at: new Date().toISOString(),
      })
      .eq('id', shift_id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    const dateStr = formatLongDate(data.date);
    const instrShort = shortName(data.instructor_name);
    const coachShort = shortName(coach_name);

    // 1. Text admin so they can confirm
    const adminPhone = process.env.ADMIN_PHONE;
    if (adminPhone && isWithinTextingHours()) {
      const adminMsg =
        `Bay Aerials: ${coachShort} claimed the sub shift!\n` +
        `📅 ${dateStr} ${data.time} – ${data.cls}\n` +
        `Covering: ${instrShort}\n` +
        `Confirm in the app.`;
      await sendOrLog(adminPhone, adminMsg, 'Admin', shift_id);
    }

    // 2. Text the coach back so they know we got it
    const { data: coach } = await supabaseAdmin
      .from('coaches')
      .select('phone')
      .eq('id', coach_id)
      .single();

    if (coach?.phone && isWithinTextingHours()) {
      const coachMsg =
        `Bay Aerials: We got your claim! 👍\n` +
        `📅 ${dateStr} ${data.time}\n` +
        `🤸 ${data.cls}\n` +
        `Covering: ${instrShort}\n` +
        `We'll text you again when admin confirms.`;
      await sendOrLog(coach.phone, coachMsg, coach_name, shift_id);
    }

    return res.status(200).json(data);
  }

  // CONFIRM
  if (action === 'confirm') {
    const { data, error } = await supabaseAdmin
      .from('shifts')
      .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
      .eq('id', shift_id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    const { data: coach } = await supabaseAdmin
      .from('coaches')
      .select('phone')
      .eq('name', data.claimed_by_name)
      .single();

    if (coach?.phone && isWithinTextingHours()) {
      const dateStr = formatLongDate(data.date);
      const instrShort = shortName(data.instructor_name);
      const msg =
        `Bay Aerials: You're confirmed as sub! ✅\n` +
        `📅 ${dateStr} ${data.time}\n` +
        `🤸 ${data.cls}\n` +
        `Covering: ${instrShort}\n` +
        `${data.notes ? `Note: ${data.notes}\n` : ''}` +
        `See you there!`;
      await sendOrLog(coach.phone, msg, data.claimed_by_name, shift_id);
    }

    return res.status(200).json(data);
  }

  return res.status(400).json({ error: 'Invalid action' });
}
