import { supabaseAdmin } from '../../lib/supabase';
import { sendSMS } from '../../lib/twilio';
import { STAFF_CONTACTS } from '../../lib/coachData';

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Los_Angeles',
  });

  console.log(`Cron running for ${today}`);

  const { data: shifts, error } = await supabaseAdmin
    .from('shifts')
    .select('*')
    .eq('date', today)
    .eq('status', 'confirmed')
    .eq('reminder_sent', false);

  if (error) {
    console.error('Cron DB error:', error.message);
    return res.status(500).json({ error: error.message });
  }

  console.log(`Found ${shifts.length} confirmed shifts to remind`);

  const results = [];

  for (const shift of shifts) {
    const contact = STAFF_CONTACTS[shift.claimed_by_name] || {};

    if (!contact.phone) continue;

    const msg =
      `🤸 Bay Aerials reminder!\n` +
      `You're subbing today:\n` +
      `📅 ${shift.time}\n` +
      `Class: ${shift.cls}\n` +
      `Covering: ${shift.instructor_name}\n` +
      `${shift.notes ? `Note: ${shift.notes}\n` : ''}` +
      `See you soon!`;

    const result = await sendSMS(contact.phone, msg);

    await supabaseAdmin
      .from('shifts')
      .update({ reminder_sent: true })
      .eq('id', shift.id);

    await supabaseAdmin.from('sms_log').insert([{
      to_name: shift.claimed_by_name,
      to_phone: contact.phone,
      message: msg,
      shift_id: shift.id,
    }]);

    results.push({ coach: shift.claimed_by_name, shift: shift.cls, ...result });
  }

  return res.status(200).json({
    date: today,
    reminders_sent: results.length,
    results,
  });
}
