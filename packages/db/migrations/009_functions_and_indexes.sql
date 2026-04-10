-- ─── 009: Atomic XP increment RPC + credit double-spend guard ─────────────────

-- Atomic XP increment via a stored function so concurrent `awardXp` calls
-- never overwrite each other with a stale read. The UPDATE is a single
-- statement and runs inside its own implicit transaction.
CREATE OR REPLACE FUNCTION increment_user_xp(p_user_id uuid, p_amount int)
RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
  new_xp int;
BEGIN
  UPDATE public.users
     SET xp_total = xp_total + p_amount
   WHERE id = p_user_id
   RETURNING xp_total INTO new_xp;

  RETURN COALESCE(new_xp, 0);
END;
$$;

-- Unique index that enforces one deduction row per (user, match) pair.
-- With reason = 'apply' the partial index only covers application deductions,
-- not monthly grants or purchases, so those remain unrestricted.
-- Requires: job_hub_credits.reference column (added in migration 008).
CREATE UNIQUE INDEX IF NOT EXISTS idx_jhc_user_reference_apply
  ON job_hub_credits(user_id, reference)
  WHERE reason = 'apply';

-- resume_url column on users (for CV/resume storage added in auth resume flow)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS resume_url text;
