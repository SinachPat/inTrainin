/**
 * Paystack client — minimal typed wrapper around the Paystack REST API.
 * TODO Layer 8: replace with a full SDK or expand as needed.
 */

const BASE = 'https://api.paystack.co'

function paystackHeaders() {
  const key = process.env.PAYSTACK_SECRET_KEY
  if (!key) throw new Error('PAYSTACK_SECRET_KEY must be set')
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
}

export const paystack = {
  /** Initialise a transaction. Returns the payment authorisation URL. */
  async initializeTransaction(params: {
    email: string
    amount: number // in kobo
    reference: string
    metadata?: Record<string, unknown>
  }) {
    const res = await fetch(`${BASE}/transaction/initialize`, {
      method: 'POST',
      headers: paystackHeaders(),
      body: JSON.stringify(params),
    })
    return res.json()
  },

  /** Verify a transaction by reference. */
  async verifyTransaction(reference: string) {
    const res = await fetch(`${BASE}/transaction/verify/${reference}`, {
      headers: paystackHeaders(),
    })
    return res.json()
  },
}
