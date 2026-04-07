-- =============================================================================
-- InTrainin — 002_indexes.sql
-- Performance indexes on all high-traffic query paths
-- Version: 1.0.0 | 2026-04
--
-- INDEX STRATEGY NOTES:
--   - Partial indexes (WHERE clause) are used for boolean filters to keep index
--     size small and maintenance cost low — only index rows that queries care about.
--   - Composite indexes match the most common WHERE + ORDER BY patterns.
--   - The verification_code index is UNIQUE (duplicate of the table constraint)
--     but explicit here for documentation clarity.
-- =============================================================================


-- =============================================================================
-- USERS
-- =============================================================================

-- Phone / email lookups for auth and deduplication
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);

-- Filter by account type (learner vs business vs admin)
CREATE INDEX idx_users_account_type ON users(account_type);

-- Soft-delete filter — partial index only covers non-deleted rows,
-- keeping the index lean for the 99% of queries that ignore deleted users
CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL;


-- =============================================================================
-- ROLES & CONTENT
-- =============================================================================

-- Browse roles by category, only published ones are shown to learners
CREATE INDEX idx_roles_category_published ON roles(category_id, is_published);

-- Module listing — always ordered by order_index within a role
CREATE INDEX idx_modules_role_order ON modules(role_id, order_index);

-- Topic listing — always ordered by order_index within a module
CREATE INDEX idx_topics_module_order ON topics(module_id, order_index);


-- =============================================================================
-- ENROLLMENTS
-- =============================================================================

-- Most common query: "fetch all enrollments for this user"
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);

-- "How many learners enrolled in this role?" (analytics, admin)
CREATE INDEX idx_enrollments_role_id ON enrollments(role_id);

-- Filter active enrollments for a user's dashboard
CREATE INDEX idx_enrollments_user_status ON enrollments(user_id, status);


-- =============================================================================
-- TOPIC PROGRESS
-- =============================================================================

-- Progress lookup: given user + topic, return status (upsert pattern)
CREATE INDEX idx_topic_progress_user_topic ON topic_progress(user_id, topic_id);


-- =============================================================================
-- TEST ATTEMPTS
-- =============================================================================

-- Fetch all attempts for a given user+test (attempt history, cooldown check)
CREATE INDEX idx_test_attempts_user_test ON test_attempts(user_id, test_id);

-- Cooldown check: get the most recent attempt timestamp DESC
CREATE INDEX idx_test_attempts_user_taken ON test_attempts(user_id, taken_at DESC);


-- =============================================================================
-- CERTIFICATES
-- =============================================================================

-- Public verification lookup — must be fast, called from unauthenticated page
CREATE UNIQUE INDEX idx_certificates_verification_code ON certificates(verification_code);

-- Learner's own certificate list
CREATE INDEX idx_certificates_user_id ON certificates(user_id);


-- =============================================================================
-- HIRE REQUESTS
-- =============================================================================

-- Primary browse query: "open cashier jobs in Lagos"
CREATE INDEX idx_hire_requests_status_role_city ON hire_requests(status, role_id, location_city);

-- Business owner's own hire requests
CREATE INDEX idx_hire_requests_business_id ON hire_requests(business_id);

-- Expiry background job: find open requests past expires_at
-- Partial index — only open requests ever expire
CREATE INDEX idx_hire_requests_open_expires ON hire_requests(expires_at)
  WHERE status = 'open';


-- =============================================================================
-- JOB MATCHES
-- =============================================================================

-- "All candidates for this hire request" (business owner view)
CREATE INDEX idx_job_matches_hire_request_id ON job_matches(hire_request_id);

-- "All job matches for this worker" (learner Job Hub view)
CREATE INDEX idx_job_matches_user_id ON job_matches(user_id);

-- Filter by status for a worker (pending, shortlisted, etc.)
CREATE INDEX idx_job_matches_user_status ON job_matches(user_id, status);


-- =============================================================================
-- BUSINESS MEMBERS
-- =============================================================================

-- "All members of this business" (business dashboard team view)
CREATE INDEX idx_business_members_business_id ON business_members(business_id);

-- "All businesses this user belongs to" (member lookup)
CREATE INDEX idx_business_members_user_id ON business_members(user_id);


-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

-- Unread badge count + notification list — most common query
-- Partial index on unread only: avoids indexing the majority of read rows
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read)
  WHERE is_read = false;

-- Notification feed ordered by recency
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);
