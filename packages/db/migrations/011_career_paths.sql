-- =============================================================================
-- Migration 011 — Career Paths
-- Adds the career_paths and career_path_roles tables that power the Roadmap
-- domain (Prompt 10). These tables define named, ordered tracks (e.g. "Retail
-- Operations Track") whose spine roles are displayed as the vertical roadmap
-- visual. Separate from role_progressions which defines graph edges between
-- individual roles.
-- =============================================================================

-- ── career_paths ──────────────────────────────────────────────────────────────
-- A named career track (e.g. "Retail Operations Track").
-- entry_role_id is the first role in the spine — used to match a user's
-- career_goal_role_id to a path during onboarding.

CREATE TABLE IF NOT EXISTS career_paths (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          VARCHAR(100) NOT NULL UNIQUE,
  title         VARCHAR(150) NOT NULL,
  description   TEXT,
  entry_role_id UUID        NOT NULL REFERENCES roles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── career_path_roles ─────────────────────────────────────────────────────────
-- Defines the ordered spine of a career path.
-- level: 1 = entry, 2 = intermediate, 3 = advanced.
-- display_order controls vertical sort on the roadmap visual.
-- A role can appear in multiple paths (e.g. "Store Attendant" in Retail and
-- Food Service tracks).

CREATE TABLE IF NOT EXISTS career_path_roles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_path_id UUID NOT NULL REFERENCES career_paths(id) ON DELETE CASCADE,
  role_id        UUID NOT NULL REFERENCES roles(id),
  level          INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
  display_order  INTEGER NOT NULL,
  UNIQUE(career_path_id, role_id)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_career_path_roles_path  ON career_path_roles(career_path_id);
CREATE INDEX IF NOT EXISTS idx_career_path_roles_role  ON career_path_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_career_paths_entry_role ON career_paths(entry_role_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────
-- Career paths are read-only public data — no user-specific rows.

ALTER TABLE career_paths      ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_path_roles ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can read career paths — needed for the public
-- /roadmap/paths endpoint used on the marketing + onboarding pages.
CREATE POLICY "career_paths_public_read"
  ON career_paths FOR SELECT
  USING (true);

CREATE POLICY "career_path_roles_public_read"
  ON career_path_roles FOR SELECT
  USING (true);

-- =============================================================================
-- Seed data
-- Wires up the 3 seed roles from migration 004 into named career paths.
-- Uses slugs so this is idempotent and order-independent.
-- =============================================================================

DO $$
DECLARE
  -- role IDs resolved by slug
  r_cashier        UUID;
  r_waiter         UUID;
  r_delivery       UUID;
  r_store_attend   UUID;
  r_store_manager  UUID;
  r_rest_super     UUID;
  r_logistics_coord UUID;

  -- path IDs
  p_retail   UUID;
  p_food     UUID;
  p_logistics UUID;
BEGIN
  -- Resolve role IDs (roles must exist from migration 004 / 006 seed)
  SELECT id INTO r_cashier       FROM roles WHERE slug = 'cashier'            LIMIT 1;
  SELECT id INTO r_waiter        FROM roles WHERE slug = 'waiter-waitress'    LIMIT 1;
  SELECT id INTO r_delivery      FROM roles WHERE slug = 'dispatch-rider'     LIMIT 1;
  SELECT id INTO r_store_attend  FROM roles WHERE slug = 'store-attendant'    LIMIT 1;
  SELECT id INTO r_store_manager FROM roles WHERE slug = 'store-manager'      LIMIT 1;
  SELECT id INTO r_rest_super    FROM roles WHERE slug = 'restaurant-supervisor' LIMIT 1;
  SELECT id INTO r_logistics_coord FROM roles WHERE slug = 'logistics-coordinator' LIMIT 1;

  -- ── Retail Operations Track ──────────────────────────────────────────────
  IF r_cashier IS NOT NULL THEN
    INSERT INTO career_paths (slug, title, description, entry_role_id)
    VALUES (
      'retail-operations',
      'Retail Operations Track',
      'From cashier to store manager — the complete retail career path.',
      r_cashier
    )
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO p_retail;

    IF p_retail IS NULL THEN
      SELECT id INTO p_retail FROM career_paths WHERE slug = 'retail-operations';
    END IF;

    -- Spine: Cashier (level 1) → Store Attendant (level 2) → Store Manager (level 3)
    INSERT INTO career_path_roles (career_path_id, role_id, level, display_order)
    VALUES (p_retail, r_cashier, 1, 1)
    ON CONFLICT (career_path_id, role_id) DO NOTHING;

    IF r_store_attend IS NOT NULL THEN
      INSERT INTO career_path_roles (career_path_id, role_id, level, display_order)
      VALUES (p_retail, r_store_attend, 2, 2)
      ON CONFLICT (career_path_id, role_id) DO NOTHING;
    END IF;

    IF r_store_manager IS NOT NULL THEN
      INSERT INTO career_path_roles (career_path_id, role_id, level, display_order)
      VALUES (p_retail, r_store_manager, 3, 3)
      ON CONFLICT (career_path_id, role_id) DO NOTHING;
    END IF;
  END IF;

  -- ── Food Service Track ───────────────────────────────────────────────────
  IF r_waiter IS NOT NULL THEN
    INSERT INTO career_paths (slug, title, description, entry_role_id)
    VALUES (
      'food-service',
      'Food Service Track',
      'From waiter to restaurant supervisor — grow in hospitality.',
      r_waiter
    )
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO p_food;

    IF p_food IS NULL THEN
      SELECT id INTO p_food FROM career_paths WHERE slug = 'food-service';
    END IF;

    INSERT INTO career_path_roles (career_path_id, role_id, level, display_order)
    VALUES (p_food, r_waiter, 1, 1)
    ON CONFLICT (career_path_id, role_id) DO NOTHING;

    IF r_rest_super IS NOT NULL THEN
      INSERT INTO career_path_roles (career_path_id, role_id, level, display_order)
      VALUES (p_food, r_rest_super, 2, 2)
      ON CONFLICT (career_path_id, role_id) DO NOTHING;
    END IF;
  END IF;

  -- ── Logistics Track ──────────────────────────────────────────────────────
  IF r_delivery IS NOT NULL THEN
    INSERT INTO career_paths (slug, title, description, entry_role_id)
    VALUES (
      'logistics',
      'Logistics Track',
      'From dispatch rider to logistics coordinator.',
      r_delivery
    )
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO p_logistics;

    IF p_logistics IS NULL THEN
      SELECT id INTO p_logistics FROM career_paths WHERE slug = 'logistics';
    END IF;

    INSERT INTO career_path_roles (career_path_id, role_id, level, display_order)
    VALUES (p_logistics, r_delivery, 1, 1)
    ON CONFLICT (career_path_id, role_id) DO NOTHING;

    IF r_logistics_coord IS NOT NULL THEN
      INSERT INTO career_path_roles (career_path_id, role_id, level, display_order)
      VALUES (p_logistics, r_logistics_coord, 2, 2)
      ON CONFLICT (career_path_id, role_id) DO NOTHING;
    END IF;
  END IF;
END $$;
