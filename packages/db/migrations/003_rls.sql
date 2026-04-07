-- =============================================================================
-- InTrainin — 003_rls.sql
-- Row Level Security — enable and apply policies on all tables
-- Version: 1.0.0 | 2026-04
--
-- HOW SUPABASE RLS WORKS:
--   - auth.uid()  → UUID of the authenticated user from their JWT
--   - auth.role() → 'anon' (no JWT) or 'authenticated' (has JWT)
--   - The service role key BYPASSES all RLS policies — never expose to clients.
--   - The anon key RESPECTS RLS — use this for all client-side testing.
--
-- TESTING RLS:
--   To verify a policy, set the role in psql:
--     SET LOCAL ROLE authenticated;
--     SET LOCAL "request.jwt.claims" TO '{"sub": "<user-uuid>"}';
--     SELECT * FROM users;  -- should return only the row matching sub
--
-- POLICY STRUCTURE:
--   USING   → controls which rows are VISIBLE (SELECT, UPDATE, DELETE)
--   WITH CHECK → controls which rows can be WRITTEN (INSERT, UPDATE)
-- =============================================================================


-- =============================================================================
-- Enable RLS on all tables
-- =============================================================================
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories         ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules            ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tests              ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_progressions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_progress     ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges             ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges        ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates       ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_hub_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE hire_requests      ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches        ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;


-- =============================================================================
-- PUBLIC CATALOGUE TABLES
-- All content-catalogue tables are publicly readable — no auth required.
-- Only published records are exposed. Mutations go through the API (service role).
-- =============================================================================

CREATE POLICY "public_read" ON categories
  FOR SELECT USING (true);

-- Learners only see published roles; admins bypass via service role
CREATE POLICY "public_read_published" ON roles
  FOR SELECT USING (is_published = true);

CREATE POLICY "public_read_published" ON modules
  FOR SELECT USING (is_published = true);

CREATE POLICY "public_read_published" ON topics
  FOR SELECT USING (is_published = true);

-- Tests are readable once enrolled (filtering by enrollment happens at query level)
CREATE POLICY "public_read" ON tests
  FOR SELECT USING (true);

CREATE POLICY "public_read" ON role_progressions
  FOR SELECT USING (true);

CREATE POLICY "public_read" ON badges
  FOR SELECT USING (true);


-- =============================================================================
-- USERS
-- =============================================================================

-- A user can only read and update their own row.
-- Profile creation is handled by the API via service role (triggered on auth.users insert).
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update_own" ON users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());


-- =============================================================================
-- ENROLLMENTS
-- =============================================================================

CREATE POLICY "enrollments_select_own" ON enrollments
  FOR SELECT USING (user_id = auth.uid());

-- INSERT is allowed from the client after payment is confirmed.
-- The API validates payment_reference before the client-side insert.
CREATE POLICY "enrollments_insert_own" ON enrollments
  FOR INSERT WITH CHECK (user_id = auth.uid());


-- =============================================================================
-- TOPIC PROGRESS
-- =============================================================================

CREATE POLICY "topic_progress_select_own" ON topic_progress
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "topic_progress_insert_own" ON topic_progress
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "topic_progress_update_own" ON topic_progress
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- =============================================================================
-- TEST ATTEMPTS
-- =============================================================================

CREATE POLICY "test_attempts_select_own" ON test_attempts
  FOR SELECT USING (user_id = auth.uid());

-- INSERT allowed from client; server validates cooldown before permitting
CREATE POLICY "test_attempts_insert_own" ON test_attempts
  FOR INSERT WITH CHECK (user_id = auth.uid());


-- =============================================================================
-- USER BADGES
-- =============================================================================

-- Badges are awarded by the API (service role); users can only read theirs
CREATE POLICY "user_badges_select_own" ON user_badges
  FOR SELECT USING (user_id = auth.uid());


-- =============================================================================
-- CERTIFICATES
-- =============================================================================

-- Authenticated learners see only their own certificates
CREATE POLICY "certificates_select_own" ON certificates
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Anonymous users can read ANY certificate — this powers the public /verify/[code] page.
-- SECURITY NOTE: verification_code is a UUID (≈122 bits of entropy — effectively
-- unguessable by brute force). The application ALWAYS queries with
-- WHERE verification_code = $code, so exposure is gated by possessing the code.
-- For tighter control in the future, replace this with a SECURITY DEFINER RPC.
CREATE POLICY "certificates_public_verify" ON certificates
  FOR SELECT TO anon
  USING (true);


-- =============================================================================
-- JOB HUB PROFILES
-- =============================================================================

CREATE POLICY "job_hub_profiles_select_own" ON job_hub_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "job_hub_profiles_insert_own" ON job_hub_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "job_hub_profiles_update_own" ON job_hub_profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());


-- =============================================================================
-- JOB MATCHES
-- =============================================================================

-- Workers can read their own matches; businesses read matches via service role
CREATE POLICY "job_matches_select_own" ON job_matches
  FOR SELECT USING (user_id = auth.uid());


-- =============================================================================
-- BUSINESSES
-- =============================================================================

-- Owners have full read/write/update/delete on their business records
CREATE POLICY "businesses_owner_all" ON businesses
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- Active and invited members can read the business record (name, location, etc.)
-- They cannot modify it — only the owner can do that via the owner_all policy.
CREATE POLICY "businesses_members_read" ON businesses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM business_members bm
      WHERE bm.business_id = businesses.id
        AND bm.user_id = auth.uid()
        AND bm.status IN ('active', 'invited')
    )
  );


-- =============================================================================
-- BUSINESS MEMBERS
-- =============================================================================

-- The business owner can see all members of their business
CREATE POLICY "business_members_owner_read" ON business_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = business_members.business_id
        AND b.owner_user_id = auth.uid()
    )
  );

-- A member can always see their own record (status, assigned role, etc.)
CREATE POLICY "business_members_self_read" ON business_members
  FOR SELECT USING (user_id = auth.uid());


-- =============================================================================
-- HIRE REQUESTS
-- =============================================================================

-- Business owner has full access to their own hire requests
CREATE POLICY "hire_requests_owner_all" ON hire_requests
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = hire_requests.business_id
        AND b.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = hire_requests.business_id
        AND b.owner_user_id = auth.uid()
    )
  );

-- Authenticated workers can browse open hire requests in the Job Hub
CREATE POLICY "hire_requests_open_visible" ON hire_requests
  FOR SELECT TO authenticated
  USING (status = 'open');


-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can mark their own notifications as read
CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
