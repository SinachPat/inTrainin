-- ─── 008: Job Hub credits ledger + job location preference ───────────────────

-- Credit ledger: every top-up, deduction, and monthly grant is a row.
-- balance is never stored — it's always derived as SUM(amount).
-- amount > 0 = credit added, amount < 0 = credit consumed.
CREATE TABLE IF NOT EXISTS job_hub_credits (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount      integer     NOT NULL,                          -- positive = top-up, negative = spend
  reason      varchar(64) NOT NULL,                          -- 'monthly_grant' | 'purchase' | 'apply'
  reference   text,                                          -- Paystack reference for purchases
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jhc_user_id ON job_hub_credits(user_id);

-- Give every existing user their first 10 free credits (one-time back-fill).
INSERT INTO job_hub_credits (user_id, amount, reason)
SELECT id, 10, 'monthly_grant'
FROM   public.users
ON CONFLICT DO NOTHING;

-- Job location preference: onsite | remote | hybrid | any
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS job_location_pref varchar(16)
    DEFAULT 'any'
    CHECK (job_location_pref IN ('onsite', 'remote', 'hybrid', 'any'));

-- Helper view: current credit balance per user (sum of the ledger)
CREATE OR REPLACE VIEW job_hub_credit_balances AS
SELECT user_id, COALESCE(SUM(amount), 0)::integer AS balance
FROM   job_hub_credits
GROUP  BY user_id;
