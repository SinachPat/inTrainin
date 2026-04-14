/**
 * Email client — thin wrapper around Resend.
 * Renders @intrainin/emails React templates to HTML before sending.
 *
 * Required env var: RESEND_API_KEY
 * Required env var: EMAIL_FROM  (e.g. "InTrainin <hello@intrainin.com>")
 */

import { Resend } from 'resend'
import { render } from '@react-email/render'
import { WelcomeEmail } from '@intrainin/emails'

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY must be set')
  return new Resend(key)
}

const FROM = process.env.EMAIL_FROM ?? 'InTrainin <hello@intrainin.com>'
const APP_URL = process.env.APP_URL ?? 'https://intrainin.com'

export const email = {
  /**
   * Send a welcome email to a newly signed-up user.
   * Fire-and-forget — errors are logged but never thrown so they don't
   * block the signup response.
   */
  async sendWelcome({
    to,
    firstName,
  }: {
    to: string
    firstName: string
  }): Promise<void> {
    try {
      const resend = getResend()
      const html   = await render(WelcomeEmail({ firstName, appUrl: APP_URL }))

      const { error } = await resend.emails.send({
        from:    FROM,
        to,
        subject: `Welcome to InTrainin, ${firstName}`,
        html,
      })

      if (error) {
        console.error('[email/sendWelcome] Resend error:', error)
      }
    } catch (err) {
      console.error('[email/sendWelcome] unexpected error:', err)
    }
  },
}
