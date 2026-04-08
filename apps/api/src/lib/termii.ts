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

async function termiiFetch<T>(input: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(input, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Termii POST ${input} failed (${res.status}): ${text}`)
  }
  return res.json() as Promise<T>
}

export const termii = {
  /**
   * Send a plain notification SMS to a Nigerian phone number.
   * Uses the 'dnd' channel so messages reach DND-activated SIMs —
   * requires an approved Termii sender ID.
   */
  async sendSms(params: { to: string; sms: string }) {
    return termiiFetch(`${BASE}/sms/send`, {
      api_key: termiiKey(),
      to:      params.to,
      from:    process.env.TERMII_SENDER_ID ?? 'InTrainin',
      sms:     params.sms,
      type:    'plain',
      channel: 'dnd',
    })
  },

  /**
   * Send a 6-digit numeric OTP via Termii's token API.
   * OTP expires after 10 minutes and allows up to 3 verification attempts.
   */
  async sendOtp(params: { phone_number: string }) {
    return termiiFetch(`${BASE}/sms/otp/send`, {
      api_key:         termiiKey(),
      message_type:    'NUMERIC',
      to:              params.phone_number,
      from:            process.env.TERMII_SENDER_ID ?? 'InTrainin',
      channel:         'dnd',
      pin_attempts:    3,
      pin_time_to_live: 10, // minutes
      pin_length:      6,
      pin_placeholder: '< 1234 >',
      message_text:    'Your InTrainin OTP is < 1234 >. Valid for 10 minutes. Do not share.',
    })
  },
}
