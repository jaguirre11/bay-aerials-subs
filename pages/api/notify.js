import { supabaseAdmin } from '../../lib/supabase';
import { sendSMS } from '../../lib/twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const { shift_id, coaches } = req.body;

  if (!shift_id || !coaches?.length) {
    return res.status(400).json({ error: 'shift_id and coaches are required' });
  }

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

    const result = await sendSMS(coach.phone, msg);

    await supabaseAdmin.from('sms_log').insert([{
      to_name: coach.name,
      to_phone: coach.phone,
      to_email: coach.email || '',
      message: msg,
      shift_id,
    }]);

    results.push({ coach: coach.name, ...result });
  }

  return res.status(200).json({ sent: results.length, results });
}
