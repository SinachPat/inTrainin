-- =============================================================================
-- InTrainin — 001_init.sql
-- Full schema: all tables in FK-safe creation order
-- Version: 1.0.0 | 2026-04
--
-- CREATION ORDER (dependency chain):
--   categories → roles → users (+ ALTER FK) → modules → topics → tests
--   → role_progressions → enrollments → topic_progress → test_attempts
--   → badges → user_badges → businesses → certificates → job_hub_profiles
--   → hire_requests → job_matches → business_members → notifications
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Shared trigger: auto-update updated_at on every row change
-- Applied to any table that has an updated_at column.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =============================================================================
-- ROLES & CONTENT
-- =============================================================================

-- -----------------------------------------------------------------------------
-- categories
-- Top-level groupings: Retail, F&B, Hospitality, etc.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  slug          VARCHAR(100) NOT NULL UNIQUE,
  icon_name     VARCHAR(50),
  display_order INTEGER      NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- roles
-- Specific job roles (Cashier, Waiter, Delivery Rider, etc.)
-- Each role belongs to one category and has its own curriculum.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id                         UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id                UUID           NOT NULL REFERENCES categories(id),
  title                      VARCHAR(150)   NOT NULL,
  slug                       VARCHAR(150)   NOT NULL UNIQUE,
  description                TEXT,
  price_ngn                  INTEGER        NOT NULL DEFAULT 0,
  estimated_hours            DECIMAL(4,1),
  is_published               BOOLEAN        NOT NULL DEFAULT false,
  free_preview_module_count  INTEGER        NOT NULL DEFAULT 1,
  phase                      INTEGER        NOT NULL DEFAULT 1,
  sanity_id                  VARCHAR(100),
  created_at                 TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'roles_set_updated_at') THEN
    CREATE TRIGGER roles_set_updated_at
      BEFORE UPDATE ON roles
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;


-- =============================================================================
-- USERS & AUTH
-- =============================================================================

-- -----------------------------------------------------------------------------
-- users
-- Core user record — created via Supabase Auth.
-- id matches auth.uid() for RLS.
--
-- WATCH-OUT: career_goal_role_id references roles(id) but if we add it inline
-- here and roles already exists, it would work — HOWEVER the spec prescribes
-- ALTER TABLE to make the ordering dependency explicit and safe for future
-- migration reruns or reordering. The column is created without a constraint
-- and the FK is added immediately after.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id                         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  phone                      VARCHAR(20)  UNIQUE,
  email                      VARCHAR(255) UNIQUE,
  full_name                  VARCHAR(255) NOT NULL,
  location_city              VARCHAR(100),
  location_state             VARCHAR(100),
  career_goal_role_id        UUID,                    -- FK added below
  account_type               VARCHAR(20)  NOT NULL DEFAULT 'learner'
                               CHECK (account_type IN ('learner', 'business', 'admin')),
  avatar_url                 TEXT,
  xp_total                   INTEGER      NOT NULL DEFAULT 0,
  streak_current             INTEGER      NOT NULL DEFAULT 0,
  streak_last_activity_date  DATE,
  fcm_token                  TEXT,
  notification_prefs         JSONB        NOT NULL DEFAULT '{"push": true, "sms": true, "email": true}',
  created_at                 TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at                 TIMESTAMPTZ
);

-- Add the FK now that roles exists — avoids inline circular dependency concern
ALTER TABLE users
  ADD CONSTRAINT fk_users_career_goal_role
  FOREIGN KEY (career_goal_role_id) REFERENCES roles(id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'users_set_updated_at') THEN
    CREATE TRIGGER users_set_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;


-- =============================================================================
-- CURRICULUM CONTENT
-- =============================================================================

-- -----------------------------------------------------------------------------
-- modules
-- A role is divided into ordered modules (e.g. "Module 1: POS Operations").
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS modules (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id      UUID         NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  title        VARCHAR(200) NOT NULL,
  order_index  INTEGER      NOT NULL,
  is_published BOOLEAN      NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- topics
-- Individual learning units within a module.
-- content_body stores the structured content as JSONB — see database.types.ts
-- for the ContentBody interface shape.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS topics (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id          UUID        NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title              VARCHAR(200) NOT NULL,
  content_type       VARCHAR(30) NOT NULL
                       CHECK (content_type IN ('text', 'guide', 'case_study', 'workflow')),
  content_body       JSONB,
  sanity_id          VARCHAR(100),
  order_index        INTEGER     NOT NULL,
  estimated_minutes  INTEGER     NOT NULL DEFAULT 5,
  is_published       BOOLEAN     NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- tests
-- Either a module checkpoint test or a role final exam.
-- questions stores an array of QuestionItem objects — see database.types.ts.
--
-- CONSTRAINT: A test belongs to exactly one of module_id OR role_id,
-- enforced by the CHECK constraint to prevent orphaned or ambiguous tests.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tests (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id           UUID        REFERENCES modules(id) ON DELETE CASCADE,
  role_id             UUID        REFERENCES roles(id) ON DELETE CASCADE,
  test_type           VARCHAR(20) NOT NULL CHECK (test_type IN ('module', 'final')),
  title               VARCHAR(200) NOT NULL,
  questions           JSONB       NOT NULL DEFAULT '[]',
  pass_mark_pct       INTEGER     NOT NULL DEFAULT 70,
  time_limit_minutes  INTEGER,
  cooldown_hours      INTEGER     NOT NULL DEFAULT 24,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT test_belongs_to_one CHECK (
    (module_id IS NOT NULL AND role_id IS NULL     AND test_type = 'module') OR
    (role_id   IS NOT NULL AND module_id IS NULL   AND test_type = 'final')
  )
);

-- -----------------------------------------------------------------------------
-- role_progressions
-- Directed edges for the career path graph.
-- 'next' = natural next step, 'adjacent' = lateral related role.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_progressions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  from_role_id     UUID        NOT NULL REFERENCES roles(id),
  to_role_id       UUID        NOT NULL REFERENCES roles(id),
  progression_type VARCHAR(20) NOT NULL CHECK (progression_type IN ('next', 'adjacent')),
  display_order    INTEGER     NOT NULL DEFAULT 0,
  UNIQUE(from_role_id, to_role_id)
);


-- =============================================================================
-- ENROLMENTS & PROGRESS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- enrollments
-- Records a user's access to a role curriculum.
-- UNIQUE(user_id, role_id) prevents duplicate enrollments.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS enrollments (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES users(id),
  role_id             UUID        NOT NULL REFERENCES roles(id),
  status              VARCHAR(20) NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'completed', 'paused')),
  payment_reference   VARCHAR(100),
  payment_type        VARCHAR(20) CHECK (payment_type IN ('individual', 'enterprise', 'free_trial')),
  enrolled_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ,
  UNIQUE(user_id, role_id)
);

-- -----------------------------------------------------------------------------
-- topic_progress
-- Granular per-topic completion tracking.
-- time_spent_seconds accumulates across sessions.
-- -----------------------------------------------------------------------------
CREATE TABLE topic_progress (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES users(id),
  topic_id            UUID        NOT NULL REFERENCES topics(id),
  status              VARCHAR(20) NOT NULL DEFAULT 'not_started'
                        CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at          TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  time_spent_seconds  INTEGER     NOT NULL DEFAULT 0,
  UNIQUE(user_id, topic_id)
);

-- -----------------------------------------------------------------------------
-- test_attempts
-- Every attempt at a test is stored — used for cooldown enforcement,
-- attempt numbering, and showing score history to learners.
-- -----------------------------------------------------------------------------
CREATE TABLE test_attempts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id),
  test_id         UUID        NOT NULL REFERENCES tests(id),
  score_pct       INTEGER     NOT NULL,
  passed          BOOLEAN     NOT NULL,
  attempt_number  INTEGER     NOT NULL DEFAULT 1,
  answers         JSONB       NOT NULL DEFAULT '[]',
  taken_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =============================================================================
-- GAMIFICATION
-- =============================================================================

-- -----------------------------------------------------------------------------
-- badges
-- Defines earnable badges. trigger_type + trigger_value are consumed by the
-- gamification engine to determine when a badge is awarded.
-- Example trigger shapes:
--   first_module   → {"count": 1}
--   seven_day_streak → {"days": 7}
--   top_score      → {"min_pct": 90}
--   multi_role     → {"count": 2}
--   first_cert     → {"count": 1}
-- -----------------------------------------------------------------------------
CREATE TABLE badges (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          VARCHAR(100) NOT NULL UNIQUE,
  name          VARCHAR(100) NOT NULL,
  description   TEXT,
  icon_url      TEXT,
  trigger_type  VARCHAR(50) NOT NULL,
  trigger_value JSONB
);

-- -----------------------------------------------------------------------------
-- user_badges
-- Junction table: which badges a user has earned and when.
-- -----------------------------------------------------------------------------
CREATE TABLE user_badges (
  id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID        NOT NULL REFERENCES users(id),
  badge_id  UUID        NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);


-- =============================================================================
-- BUSINESSES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- businesses
-- An employer/business account. Linked to an owner user.
-- seat_limit is set by the subscription plan and enforced at the API layer.
-- -----------------------------------------------------------------------------
CREATE TABLE businesses (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id           UUID        NOT NULL REFERENCES users(id),
  name                    VARCHAR(200) NOT NULL,
  category                VARCHAR(100),
  size_range              VARCHAR(30),
  location_city           VARCHAR(100),
  location_state          VARCHAR(100),
  subscription_plan       VARCHAR(20) CHECK (subscription_plan IN ('starter', 'growth', 'business', 'enterprise_plus')),
  subscription_starts_at  TIMESTAMPTZ,
  subscription_expires_at TIMESTAMPTZ,
  seat_limit              INTEGER     NOT NULL DEFAULT 5,
  payment_reference       VARCHAR(100),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER businesses_set_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- business_members
-- Workers invited to or active under a business account.
-- user_id is nullable until the invited worker signs up.
-- -----------------------------------------------------------------------------
CREATE TABLE business_members (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id      UUID        NOT NULL REFERENCES businesses(id),
  user_id          UUID        REFERENCES users(id),
  invited_phone    VARCHAR(20),
  invited_email    VARCHAR(255),
  assigned_role_id UUID        REFERENCES roles(id),
  job_title        VARCHAR(100),
  status           VARCHAR(20) NOT NULL DEFAULT 'invited'
                     CHECK (status IN ('invited', 'active', 'removed')),
  invited_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at        TIMESTAMPTZ,
  UNIQUE(business_id, user_id)
);


-- =============================================================================
-- CERTIFICATES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- certificates
-- Issued on passing the final exam for a role.
-- verification_code is a public UUID — used by the /verify/[code] page.
-- image_url points to the rendered certificate PNG in Cloudinary.
-- -----------------------------------------------------------------------------
CREATE TABLE certificates (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES users(id),
  role_id           UUID        NOT NULL REFERENCES roles(id),
  enrollment_id     UUID        NOT NULL REFERENCES enrollments(id),
  verification_code UUID        NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  issued_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  image_url         TEXT,
  is_revoked        BOOLEAN     NOT NULL DEFAULT false
);


-- =============================================================================
-- JOB HUB
-- =============================================================================

-- -----------------------------------------------------------------------------
-- job_hub_profiles
-- A learner's job-seeker profile — separate from the core user record so
-- it can be toggled on/off independently of account status.
-- preferred_roles stores an array of role UUIDs the worker is interested in.
-- -----------------------------------------------------------------------------
CREATE TABLE job_hub_profiles (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID        NOT NULL UNIQUE REFERENCES users(id),
  is_subscribed           BOOLEAN     NOT NULL DEFAULT false,
  subscription_plan       VARCHAR(20),
  subscription_starts_at  TIMESTAMPTZ,
  subscription_expires_at TIMESTAMPTZ,
  preferred_roles         UUID[]      NOT NULL DEFAULT '{}',
  location_city           VARCHAR(100),
  location_state          VARCHAR(100),
  availability            VARCHAR(30) CHECK (availability IN ('immediate', 'two_weeks', 'one_month')),
  employment_type_pref    VARCHAR(30) CHECK (employment_type_pref IN ('full_time', 'part_time', 'contract', 'any')),
  is_visible              BOOLEAN     NOT NULL DEFAULT true,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER job_hub_profiles_set_updated_at
  BEFORE UPDATE ON job_hub_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- hire_requests
-- Posted by a business when they need to hire for a specific role.
-- Matched workers are created in job_matches.
-- -----------------------------------------------------------------------------
CREATE TABLE hire_requests (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id             UUID        NOT NULL REFERENCES businesses(id),
  role_id                 UUID        NOT NULL REFERENCES roles(id),
  location_city           VARCHAR(100) NOT NULL,
  location_state          VARCHAR(100),
  positions_count         INTEGER     NOT NULL DEFAULT 1,
  pay_min                 INTEGER,
  pay_max                 INTEGER,
  start_date              DATE,
  requirements            TEXT,
  certification_required  BOOLEAN     NOT NULL DEFAULT false,
  status                  VARCHAR(20) NOT NULL DEFAULT 'open'
                            CHECK (status IN ('open', 'filled', 'closed', 'draft')),
  posted_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at              TIMESTAMPTZ,
  payment_reference       VARCHAR(100)
);

-- -----------------------------------------------------------------------------
-- job_matches
-- System-generated (or manually created) candidate-to-hire pairing.
-- match_score is computed by the matching algorithm in the jobhub domain.
-- -----------------------------------------------------------------------------
CREATE TABLE job_matches (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  hire_request_id  UUID           NOT NULL REFERENCES hire_requests(id),
  user_id          UUID           NOT NULL REFERENCES users(id),
  match_score      DECIMAL(5,2)   NOT NULL,
  status           VARCHAR(20)    NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'accepted', 'declined', 'shortlisted', 'hired', 'rejected')),
  worker_notified_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  UNIQUE(hire_request_id, user_id)
);

CREATE TRIGGER job_matches_set_updated_at
  BEFORE UPDATE ON job_matches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- notifications
-- In-app notification inbox. data is a flexible JSONB payload — e.g.
-- {"hire_request_id": "...", "role": "Cashier"} for a job match notification.
-- -----------------------------------------------------------------------------
CREATE TABLE notifications (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id),
  type       VARCHAR(50) NOT NULL,
  title      VARCHAR(200) NOT NULL,
  body       TEXT,
  data       JSONB,
  is_read    BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
