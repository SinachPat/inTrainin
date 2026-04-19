-- =============================================================================
-- Migration 013 — phone OTP storage for USSD delivery
--
-- Supabase's "Send SMS" auth hook intercepts every OTP before delivery and
-- calls our /webhooks/supabase/sms endpoint, which upserts the raw code here.
-- The /ussd endpoint then reads this table when a user dials in via Qrios.
--
-- Design notes:
--   • phone is PRIMARY KEY — one live OTP per number at a time.
--   • expires_at is 10 minutes from upsert (Supabase OTPs expire in 10 min).
--   • We clean up expired rows lazily in the USSD lookup rather than via cron.
-- =============================================================================

CREATE TABLE IF NOT EXISTS phone_otps (
  phone       TEXT        PRIMARY KEY,        -- E.164 format, e.g. +2348012345678
  code        TEXT        NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast expiry pruning (used in the USSD handler cleanup)
CREATE INDEX IF NOT EXISTS phone_otps_expires_at_idx ON phone_otps (expires_at);

-- Row-level security: this table is only accessed server-side via the
-- service-role key — no client access needed.
ALTER TABLE phone_otps ENABLE ROW LEVEL SECURITY;

-- Deny all client-side access; service role bypasses RLS automatically.
CREATE POLICY "no_client_access" ON phone_otps AS RESTRICTIVE
  FOR ALL USING (false);
