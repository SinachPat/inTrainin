-- =============================================================================
-- InTrainin — 005_fixes.sql
-- Post-launch fixes: missing unique constraints
-- Version: 1.0.0 | 2026-04
-- =============================================================================

-- businesses.owner_user_id must be unique so upsert ON CONFLICT works correctly.
-- Each user can own at most one business.
ALTER TABLE businesses
  ADD CONSTRAINT businesses_owner_user_id_unique UNIQUE (owner_user_id);
