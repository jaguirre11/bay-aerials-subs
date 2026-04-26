import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send an SMS via Twilio
 * @param {string} to - E.164 phone number e.g. "+15105551234"
 * @param {string} body - Message text
 */
export async function sendSMS(to, body) {
  const digits = to.replace(/\D/g, '');
  const e164 = digits.length === 10 ? `+1${digits}` : `+${digits}`;

  try {
    const msg = await client.messages.create({
      body,
      from: process.env.TWILIO_FROM_NUMBER,
      to: e164,
    });
    console.log(`SMS sent to ${e164}: ${msg.sid}`);
    return { success: true, sid: msg.sid };
  } catch (err) {
    console.error(`SMS failed to ${e164}:`, err.message);
    return { success: false, error: err.message };
  }
}
