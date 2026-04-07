/**
 * Termii SMS client — sends OTP and notification SMS via Termii API.
 * TODO Layer 8: add retry logic and delivery status polling.
 */

const BASE = 'https://api.ng.termii.com/api'

function termiiKey() {
  const key = process.env.TERMII_API_KEY
  if (!key) throw new Error('TERMII_API_KEY must be set')
  return key
}

export const termii = {
  /** Send a plain SMS to a Nigerian phone number. */
  async sendSms(params: { to: string; sms: string }) {
    const res = await fetch(`${BASE}/sms/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: termiiKey(),
        to: params.to,
        from: process.env.TERMII_SENDER_ID ?? 'InTrainin',
        sms: params.sms,
        type: 'plain',
        channel: 'dnd',
      }),
    })
    return res.json()
  },

  /** Send a numeric OTP via Termii's token API. */
  async sendOtp(params: { phone_number: string }) {
    const res = await fetch(`${BASE}/sms/otp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: termiiKey(),
        message_type: 'NUMERIC',
        to: params.phone_number,
        from: process.env.TERMII_SENDER_ID ?? 'InTrainin',
        channel: 'dnd',
        pin_attempts: 3,
        pin_time_to_live: 10,
        pin_length: 6,
        pin_placeholder: '< 1234 >',
        message_text: 'Your InTrainin OTP is < 1234 >. Valid for 10 minutes.',
      }),
    })
    return res.json()
  },
}
