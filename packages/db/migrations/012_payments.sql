-- =============================================================================
-- Migration 012 — payments ledger table
-- Every Paystack transaction is recorded here before the user is redirected,
-- then updated to 'completed' or 'failed' exclusively via the webhook handler.
-- =============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reference        VARCHAR(100) NOT NULL UNIQUE,
  user_id          UUID        NOT NULL REFERENCES users(id),
  business_id      UUID        REFERENCES businesses(id),
  payment_type     VARCHAR(30) NOT NULL,
  amount_kobo      INTEGER     NOT NULL,
  status           VARCHAR(20) NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'completed', 'failed')),
  metadata         JSONB       NOT NULL DEFAULT '{}',
  paystack_response JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);

-- Fast lookups used by webhook handler and status endpoint
CREATE INDEX IF NOT EXISTS payments_reference_idx  ON payments (reference);
CREATE INDEX IF NOT EXISTS payments_user_id_idx    ON payments (user_id);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users may read their own payment records (for /payments/status/:reference)
CREATE POLICY "payments: own read"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- All inserts/updates are service-role only (API server uses service key)
