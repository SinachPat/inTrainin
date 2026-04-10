-- Migration 009: atomic XP increment RPC + credits double-spend guard
-- Run in Supabase SQL Editor.

-- ── 1. Atomic XP increment ────────────────────────────────────────────────────
-- Replaces the unsafe read-modify-write pattern in gamification.ts.
-- Returns the new xp_total so the caller can confirm the update landed.

CREATE OR REPLACE FUNCTION increment_user_xp(p_user_id uuid, p_amount int)
RETURNS int
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.users
  SET    xp_total = xp_total + p_amount
  WHERE  id = p_user_id
  RETURNING xp_total;
$$;

-- Grant execute to the service_role key used by the API
GRANT EXECUTE ON FUNCTION increment_user_xp(uuid, int) TO service_role;

-- ── 2. Credits double-spend guard ─────────────────────────────────────────────
-- Prevents two simultaneous match-accepts from both deducting credits.
-- The unique index only applies to 'apply' rows (not purchases or grants),
-- using the match ID as the reference.

CREATE UNIQUE INDEX IF NOT EXISTS job_hub_credits_apply_reference_idx
  ON public.job_hub_credits (user_id, reference)
  WHERE reason = 'apply';
