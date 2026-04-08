/**
 * Paystack client — minimal typed wrapper around the Paystack REST API.
 * TODO Layer 8: replace with the official @paystack/paystack-sdk or expand as needed.
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

async function paystackFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Paystack ${init?.method ?? 'GET'} ${input} failed (${res.status}): ${body}`)
  }
  return res.json() as Promise<T>
}

export const paystack = {
  /**
   * Initialise a transaction — returns the payment authorisation URL.
   *
   * Note: Paystack requires an email address. Since InTrainin users sign up
   * with phone only, generate a synthetic email when none is available:
   *   `${userId}@users.intrainin.com`
   */
  async initializeTransaction(params: {
    email: string
    amount: number // in kobo (1 NGN = 100 kobo)
    reference: string
    metadata?: Record<string, unknown>
  }) {
    return paystackFetch(`${BASE}/transaction/initialize`, {
      method: 'POST',
      headers: paystackHeaders(),
      body: JSON.stringify(params),
    })
  },

  /** Verify a transaction by reference. */
  async verifyTransaction(reference: string) {
    return paystackFetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: paystackHeaders(),
    })
  },
}
