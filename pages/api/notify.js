import { supabaseAdmin } from '../../lib/supabase';
import { sendSMS } from '../../lib/twilio';

const TEST_MODE = process.env.SMS_TEST_MODE === 'true';

// Only send texts between 8 AM and 8 PM Pacific time
function isWithinTextingHours() {
  const now = new Date();
  const pacificHour = parseInt(
    now.toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
      hour: 'numeric',
      hour12: false,
    })
  );
  return pacificHour >= 8 && pacificHour < 20; // 8 AM to 8 PM
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const { shift_id, coaches } = req.body;

  if (!shift_id || !coaches?.length) {
    return res.status(400).json({ error: 'shift_id and coaches are required' });
  }

  // Check texting hours
  if (!isWithinTextingHours()) {
    const currentTime = getCurrentPacificHour();
    console.log(`SMS blocked — outside texting hours (current: ${currentTime} Pacific)`);

    // Log the blocked attempt in Supabase so admin can see it
    await supabaseAdmin.from('sms_log').insert([{
      to_name: `${coaches.length} coaches`,
      to_phone: 'BLOCKED',
      to_email: '',
      message: `SMS blocked — sent outside texting hours (${currentTime} Pacific). Texts will not be sent between 8 PM and 8 AM.`,
      shift_id,
    }]);

    return res.status(200).json({
      sent: 0,
      blocked: true,
      reason: `Outside texting hours (${currentTime} Pacific). Texts only sent 8 AM – 8 PM.`,
      results: [],
    });
  }

  // Fetch the shift for message content
  const { data: shift, error: shiftErr } = await supabaseAdmin
    .from('shifts')
    .select('*')
    .eq('id', shift_id)
    .single();

  if (shiftErr) return res.status(500).json({ error: shiftErr.message });

  const results = [];

  for (const coach of coaches) {
    if (!coach.phone) continue;

    const msg =
      `Bay Aerials: Sub needed!\n` +
      `📅 ${shift.day} ${shift.time}\n` +
      `🤸 ${shift.cls}\n` +
      `Covering: ${shift.instructor_name}\n` +
      `Log in with code: ${coach.code}\n` +
      `bayaerials-subs.vercel.app`;

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
      shift_id,
    }]);

    results.push({ coach: coach.name, ...result });
  }

  return res.status(200).json({ sent: results.length, testMode: TEST_MODE, results });
}
