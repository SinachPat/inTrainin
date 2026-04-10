-- ─── 007: Backfill phone from auth.users → public.users ──────────────────────
-- Existing rows in public.users may have phone = NULL because profile/complete
-- did not include the phone field in its upsert payload (fixed in API). This
-- migration copies the canonical phone from auth.users for every row where
-- public.users.phone is currently NULL.

UPDATE public.users u
SET    phone = au.phone
FROM   auth.users au
WHERE  u.id    = au.id
AND    u.phone IS NULL
AND    au.phone IS NOT NULL;
