import { supabaseAdmin } from '../../lib/supabase';
import { sendSMS } from '../../lib/twilio';
import { STAFF_CONTACTS } from '../../lib/coachData';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  const { shift_id, action, coach_id, coach_name } = req.body;

  if (!shift_id || !action) {
    return res.status(400).json({ error: 'shift_id and action are required' });
  }

  if (action === 'claim') {
    const { data, error } = await supabaseAdmin
      .from('shifts')
      .update({ status: 'claimed', claimed_by_id: coach_id, claimed_by_name: coach_name })
      .eq('id', shift_id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    const adminPhone = process.env.ADMIN_PHONE;
    if (adminPhone) {
      await sendSMS(adminPhone,
        `Bay Aerials: ${coach_name} claimed the sub shift!\n` +
        `📅 ${data.day} ${data.time} – ${data.cls}\n` +
        `Covering: ${data.instructor_name}\n` +
        `Confirm in the app.`
      );
    }

    return res.status(200).json(data);
  }

  if (action === 'confirm') {
    const { data, error } = await supabaseAdmin
      .from('shifts')
      .update({ status: 'confirmed' })
      .eq('id', shift_id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    const contact = STAFF_CONTACTS[data.claimed_by_name] || {};
    if (contact.phone) {
      await sendSMS(contact.phone,
        `Bay Aerials: You're confirmed as sub! ✅\n` +
        `📅 ${data.day} ${data.time}\n` +
        `🤸 ${data.cls}\n` +
        `Covering: ${data.instructor_name}\n` +
        `${data.notes ? `Note: ${data.notes}\n` : ''}` +
        `See you there!`
      );
    }

    return res.status(200).json(data);
  }

  return res.status(400).json({ error: 'Invalid action' });
}
