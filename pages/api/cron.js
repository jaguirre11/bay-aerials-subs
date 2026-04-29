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

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Los_Angeles',
  });

  console.log(`Cron running for ${today}`);

  // ===== TASK 1: Day-of reminders to confirmed subs =====
  const dayOfResults = [];
  const { data: confirmedShifts, error: confErr } = await supabaseAdmin
    .from('shifts')
    .select('*')
    .eq('date', today)
    .eq('status', 'confirmed')
    .eq('reminder_sent', false);

  if (confErr) {
    console.error('Day-of reminder DB error:', confErr.message);
  } else {
    console.log(`Found ${confirmedShifts.length} confirmed shifts to remind`);

    for (const shift of confirmedShifts) {
      // Look up coach by name in coaches table
      const { data: coach } = await supabaseAdmin
        .from('coaches')
        .select('phone')
        .eq('name', shift.claimed_by_name)
        .single();

      if (!coach?.phone) continue;
      if (!isWithinTextingHours()) continue;

      const instrShort = shortName(shift.instructor_name);
      const msg =
        `🤸 Bay Aerials reminder!\n` +
        `You're subbing today:\n` +
        `📅 ${shift.time}\n` +
        `Class: ${shift.cls}\n` +
        `Covering: ${instrShort}\n` +
        `${shift.notes ? `Note: ${shift.notes}\n` : ''}` +
        `See you soon!`;

      const result = await sendOrLog(coach.phone, msg, shift.claimed_by_name, shift.id);

      await supabaseAdmin
        .from('shifts')
        .update({ reminder_sent: true })
        .eq('id', shift.id);

      dayOfResults.push({ coach: shift.claimed_by_name, shift: shift.cls, ...result });
    }
  }

  // ===== TASK 2: 4-hour reminder to admin for unconfirmed claims =====
  const adminReminderResults = [];
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

  const { data: staleClaims, error: staleErr } = await supabaseAdmin
    .from('shifts')
    .select('*')
    .eq('status', 'claimed')
    .lte('claimed_at', fourHoursAgo)
    .eq('admin_reminder_sent', false);

  if (staleErr) {
    console.error('Stale claim DB error:', staleErr.message);
  } else {
    console.log(`Found ${staleClaims.length} unconfirmed claims older than 4 hours`);

    const adminPhone = process.env.ADMIN_PHONE;
    if (adminPhone && isWithinTextingHours()) {
      for (const shift of staleClaims) {
        const dateStr = formatLongDate(shift.date);
        const instrShort = shortName(shift.instructor_name);
        const coachShort = shortName(shift.claimed_by_name);
        const msg =
          `⏰ Bay Aerials reminder:\n` +
          `${coachShort} claimed a shift 4+ hrs ago and still needs confirmation.\n` +
          `📅 ${dateStr} ${shift.time} – ${shift.cls}\n` +
          `Covering: ${instrShort}\n` +
          `Confirm in the app.`;

        const result = await sendOrLog(adminPhone, msg, 'Admin', shift.id);

        await supabaseAdmin
          .from('shifts')
          .update({ admin_reminder_sent: true })
          .eq('id', shift.id);

        adminReminderResults.push({ shift_id: shift.id, ...result });
      }
    }
  }

  return res.status(200).json({
    date: today,
    day_of_reminders: dayOfResults.length,
    admin_reminders: adminReminderResults.length,
    results: { dayOfResults, adminReminderResults },
  });
}
