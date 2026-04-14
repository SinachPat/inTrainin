/**
 * Paystack client — typed wrapper around the Paystack REST API.
 * All monetary values are in kobo (1 NGN = 100 kobo).
 */

// ─── Response types ────────────────────────────────────────────────────────────

export interface PaystackInitData {
  authorization_url: string
  access_code:       string
  reference:         string
}

export interface PaystackInitResponse {
  status:  boolean
  message: string
  data:    PaystackInitData
}

export interface PaystackVerifyData {
  status:    'success' | 'failed' | 'abandoned' | string
  reference: string
  amount:    number   // kobo
  currency:  string
  metadata:  Record<string, unknown>
  customer:  { email: string; phone?: string }
}

export interface PaystackVerifyResponse {
  status:  boolean
  message: string
  data:    PaystackVerifyData
}

// ─── Request types ─────────────────────────────────────────────────────────────

export interface PaystackInitParams {
  email:        string
  amount:       number
  reference:    string
  callback_url?: string
  metadata?:    Record<string, unknown>
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

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

// ─── Public client ─────────────────────────────────────────────────────────────

export const paystack = {
  /**
   * Initialise a Paystack transaction.
   * Returns an authorization_url to redirect the user to.
   *
   * Note: Paystack requires an email. For phone-only accounts use the
   * synthetic address: `${userId}@users.intrainin.com`
   */
  initializeTransaction(params: PaystackInitParams): Promise<PaystackInitResponse> {
    return paystackFetch(`${BASE}/transaction/initialize`, {
      method:  'POST',
      headers: paystackHeaders(),
      body:    JSON.stringify(params),
    })
  },

  /** Verify a transaction by reference — used in enrollment endpoint and webhook. */
  verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    return paystackFetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: paystackHeaders(),
    })
  },
}
