/**
 * InTrainin — Supabase Database Types
 *
 * Hand-authored to match 001_init.sql until `supabase gen types typescript` can
 * be run against a live project. Once the schema is deployed, REPLACE this file
 * with the generator output:
 *
 *   npx supabase gen types typescript \
 *     --project-id <your-project-id> \
 *     --schema public > packages/db/src/database.types.ts
 *
 * ─── JSONB FIELD SHAPES ──────────────────────────────────────────────────────
 * The three JSONB columns below use explicit TypeScript interfaces.
 * These shapes are consumed by the API (apps/api) and frontend (apps/web).
 *
 * TODO (your contribution): Review the QuestionItem, ContentBody, and
 * NotificationData interfaces below. Do the field names and shapes match
 * what you expect the assessment engine and content renderer to consume?
 * Adjust field names, add fields, or change option types before wiring
 * these into the API domain handlers.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// =============================================================================
// JSONB sub-types — shared across tables
// =============================================================================

/** A single multiple-choice question stored inside tests.questions */
export interface QuestionItem {
  id: string
  question: string
  options: string[]
  correct: number         // index into options[]
  explanation: string
}

/** The structured content body of a topic (text | guide | case_study | workflow) */
export interface ContentBody {
  // Used by 'text' and 'guide' content types
  sections?: Array<{
    heading: string
    body: string
  }>
  key_points?: string[]
  estimated_read_minutes?: number

  // Used by 'workflow' content type
  steps?: Array<{
    step: number
    title: string
    description: string
  }>

  // Used by 'case_study' content type
  scenario?: string
  what_went_wrong?: string
  correct_response?: Record<string, string>
  what_not_to_do?: string[]
  learning_outcome?: string
}

/** Payload stored in notifications.data — varies by notification type */
export interface NotificationData {
  hire_request_id?: string
  role_id?: string
  role_title?: string
  certificate_id?: string
  badge_slug?: string
  [key: string]: string | number | boolean | null | undefined
}

/** Shape of users.notification_prefs */
export interface NotificationPrefs {
  push: boolean
  sms: boolean
  email: boolean
}

/** Shape of badges.trigger_value — interpreted by the gamification engine */
export interface BadgeTriggerValue {
  count?: number        // for 'module_completed', 'roles_enrolled', 'certificate_issued'
  days?: number         // for 'streak_days'
  min_pct?: number      // for 'test_score'
  attempt_number?: number // for 'test_score' (optional: restrict to first attempt)
}

// =============================================================================
// String literal union helpers
// =============================================================================

export type AccountType     = 'learner' | 'business' | 'admin'
export type ContentType     = 'text' | 'guide' | 'case_study' | 'workflow'
export type TestType        = 'module' | 'final'
export type ProgressionType = 'next' | 'adjacent'
export type EnrollmentStatus = 'active' | 'completed' | 'paused'
export type TopicStatus     = 'not_started' | 'in_progress' | 'completed'
export type PaymentType     = 'individual' | 'enterprise' | 'free_trial'
export type Availability    = 'immediate' | 'two_weeks' | 'one_month'
export type EmploymentType  = 'full_time' | 'part_time' | 'contract' | 'any'
export type MatchStatus     = 'pending' | 'accepted' | 'declined' | 'shortlisted' | 'hired' | 'rejected'
export type MemberStatus    = 'invited' | 'active' | 'removed'
export type HireStatus      = 'open' | 'filled' | 'closed' | 'draft'
export type SubscriptionPlan = 'starter' | 'growth' | 'business' | 'enterprise_plus'

// =============================================================================
// Database type — consumed by createClient<Database>()
// =============================================================================

export interface Database {
  public: {
    Tables: {

      // ── users ───────────────────────────────────────────────────────────────
      users: {
        Row: {
          id: string
          phone: string | null
          email: string | null
          full_name: string
          location_city: string | null
          location_state: string | null
          career_goal_role_id: string | null
          account_type: AccountType
          avatar_url: string | null
          xp_total: number
          streak_current: number
          streak_last_activity_date: string | null
          fcm_token: string | null
          notification_prefs: NotificationPrefs
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: Omit<
          Database['public']['Tables']['users']['Row'],
          'xp_total' | 'streak_current' | 'created_at' | 'updated_at'
        > & {
          xp_total?: number
          streak_current?: number
        }
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }

      // ── categories ──────────────────────────────────────────────────────────
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon_name: string | null
          display_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }

      // ── roles ────────────────────────────────────────────────────────────────
      roles: {
        Row: {
          id: string
          category_id: string
          title: string
          slug: string
          description: string | null
          price_ngn: number
          estimated_hours: number | null
          is_published: boolean
          free_preview_module_count: number
          phase: number
          sanity_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['roles']['Row'],
          'is_published' | 'free_preview_module_count' | 'phase' | 'created_at' | 'updated_at'
        > & {
          is_published?: boolean
          free_preview_module_count?: number
          phase?: number
        }
        Update: Partial<Database['public']['Tables']['roles']['Insert']>
      }

      // ── modules ──────────────────────────────────────────────────────────────
      modules: {
        Row: {
          id: string
          role_id: string
          title: string
          order_index: number
          is_published: boolean
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['modules']['Row'],
          'is_published' | 'created_at'
        > & { is_published?: boolean }
        Update: Partial<Database['public']['Tables']['modules']['Insert']>
      }

      // ── topics ───────────────────────────────────────────────────────────────
      topics: {
        Row: {
          id: string
          module_id: string
          title: string
          content_type: ContentType
          content_body: ContentBody | null
          sanity_id: string | null
          order_index: number
          estimated_minutes: number
          is_published: boolean
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['topics']['Row'],
          'estimated_minutes' | 'is_published' | 'created_at'
        > & {
          estimated_minutes?: number
          is_published?: boolean
        }
        Update: Partial<Database['public']['Tables']['topics']['Insert']>
      }

      // ── tests ────────────────────────────────────────────────────────────────
      tests: {
        Row: {
          id: string
          module_id: string | null
          role_id: string | null
          test_type: TestType
          title: string
          questions: QuestionItem[]
          pass_mark_pct: number
          time_limit_minutes: number | null
          cooldown_hours: number
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['tests']['Row'],
          'questions' | 'pass_mark_pct' | 'cooldown_hours' | 'created_at'
        > & {
          questions?: QuestionItem[]
          pass_mark_pct?: number
          cooldown_hours?: number
        }
        Update: Partial<Database['public']['Tables']['tests']['Insert']>
      }

      // ── role_progressions ────────────────────────────────────────────────────
      role_progressions: {
        Row: {
          id: string
          from_role_id: string
          to_role_id: string
          progression_type: ProgressionType
          display_order: number
        }
        Insert: Omit<
          Database['public']['Tables']['role_progressions']['Row'],
          'display_order'
        > & { display_order?: number }
        Update: Partial<Database['public']['Tables']['role_progressions']['Insert']>
      }

      // ── enrollments ──────────────────────────────────────────────────────────
      enrollments: {
        Row: {
          id: string
          user_id: string
          role_id: string
          status: EnrollmentStatus
          payment_reference: string | null
          payment_type: PaymentType | null
          enrolled_at: string
          completed_at: string | null
        }
        Insert: Omit<
          Database['public']['Tables']['enrollments']['Row'],
          'status' | 'enrolled_at'
        > & { status?: EnrollmentStatus }
        Update: Partial<Database['public']['Tables']['enrollments']['Insert']>
      }

      // ── topic_progress ───────────────────────────────────────────────────────
      topic_progress: {
        Row: {
          id: string
          user_id: string
          topic_id: string
          status: TopicStatus
          started_at: string | null
          completed_at: string | null
          time_spent_seconds: number
        }
        Insert: Omit<
          Database['public']['Tables']['topic_progress']['Row'],
          'status' | 'time_spent_seconds'
        > & {
          status?: TopicStatus
          time_spent_seconds?: number
        }
        Update: Partial<Database['public']['Tables']['topic_progress']['Insert']>
      }

      // ── test_attempts ────────────────────────────────────────────────────────
      test_attempts: {
        Row: {
          id: string
          user_id: string
          test_id: string
          score_pct: number
          passed: boolean
          attempt_number: number
          answers: Array<{ question_id: string; selected: number; selected_text: string }>
          taken_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['test_attempts']['Row'],
          'attempt_number' | 'taken_at'
        > & { attempt_number?: number }
        Update: never   // attempts are immutable once recorded
      }

      // ── badges ───────────────────────────────────────────────────────────────
      badges: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          icon_url: string | null
          trigger_type: string
          trigger_value: BadgeTriggerValue | null
        }
        Insert: Omit<Database['public']['Tables']['badges']['Row'], never>
        Update: Partial<Database['public']['Tables']['badges']['Insert']>
      }

      // ── user_badges ──────────────────────────────────────────────────────────
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_badges']['Row'], 'earned_at'>
        Update: never   // badge awards are immutable
      }

      // ── businesses ───────────────────────────────────────────────────────────
      businesses: {
        Row: {
          id: string
          owner_user_id: string
          name: string
          category: string | null
          size_range: string | null
          location_city: string | null
          location_state: string | null
          subscription_plan: SubscriptionPlan | null
          subscription_starts_at: string | null
          subscription_expires_at: string | null
          seat_limit: number
          payment_reference: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['businesses']['Row'],
          'seat_limit' | 'created_at' | 'updated_at'
        > & { seat_limit?: number }
        Update: Partial<Database['public']['Tables']['businesses']['Insert']>
      }

      // ── business_members ─────────────────────────────────────────────────────
      business_members: {
        Row: {
          id: string
          business_id: string
          user_id: string | null
          invited_phone: string | null
          invited_email: string | null
          assigned_role_id: string | null
          job_title: string | null
          status: MemberStatus
          invited_at: string
          joined_at: string | null
        }
        Insert: Omit<
          Database['public']['Tables']['business_members']['Row'],
          'status' | 'invited_at'
        > & { status?: MemberStatus }
        Update: Partial<Database['public']['Tables']['business_members']['Insert']>
      }

      // ── certificates ─────────────────────────────────────────────────────────
      certificates: {
        Row: {
          id: string
          user_id: string
          role_id: string
          enrollment_id: string
          verification_code: string
          issued_at: string
          image_url: string | null
          is_revoked: boolean
        }
        Insert: Omit<
          Database['public']['Tables']['certificates']['Row'],
          'verification_code' | 'issued_at' | 'is_revoked'
        > & {
          verification_code?: string
          is_revoked?: boolean
        }
        Update: Pick<
          Database['public']['Tables']['certificates']['Row'],
          'image_url' | 'is_revoked'
        >
      }

      // ── job_hub_profiles ─────────────────────────────────────────────────────
      job_hub_profiles: {
        Row: {
          id: string
          user_id: string
          is_subscribed: boolean
          subscription_plan: string | null
          subscription_starts_at: string | null
          subscription_expires_at: string | null
          preferred_roles: string[]
          location_city: string | null
          location_state: string | null
          availability: Availability | null
          employment_type_pref: EmploymentType | null
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['job_hub_profiles']['Row'],
          'is_subscribed' | 'preferred_roles' | 'is_visible' | 'created_at' | 'updated_at'
        > & {
          is_subscribed?: boolean
          preferred_roles?: string[]
          is_visible?: boolean
        }
        Update: Partial<Database['public']['Tables']['job_hub_profiles']['Insert']>
      }

      // ── hire_requests ─────────────────────────────────────────────────────────
      hire_requests: {
        Row: {
          id: string
          business_id: string
          role_id: string
          location_city: string
          location_state: string | null
          positions_count: number
          pay_min: number | null
          pay_max: number | null
          start_date: string | null
          requirements: string | null
          certification_required: boolean
          status: HireStatus
          posted_at: string
          expires_at: string | null
          payment_reference: string | null
        }
        Insert: Omit<
          Database['public']['Tables']['hire_requests']['Row'],
          'positions_count' | 'certification_required' | 'status' | 'posted_at'
        > & {
          positions_count?: number
          certification_required?: boolean
          status?: HireStatus
        }
        Update: Partial<Database['public']['Tables']['hire_requests']['Insert']>
      }

      // ── job_matches ───────────────────────────────────────────────────────────
      job_matches: {
        Row: {
          id: string
          hire_request_id: string
          user_id: string
          match_score: number
          status: MatchStatus
          worker_notified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['job_matches']['Row'],
          'status' | 'created_at' | 'updated_at'
        > & { status?: MatchStatus }
        Update: Partial<Database['public']['Tables']['job_matches']['Insert']>
      }

      // ── notifications ─────────────────────────────────────────────────────────
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          body: string | null
          data: NotificationData | null
          is_read: boolean
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['notifications']['Row'],
          'is_read' | 'created_at'
        > & { is_read?: boolean }
        Update: Pick<Database['public']['Tables']['notifications']['Row'], 'is_read'>
      }
    }

    Views: Record<string, never>

    Functions: {
      // Placeholder — add Supabase RPC function types here as they are created
      // e.g. get_user_progress: { Args: { p_user_id: string }; Returns: {...} }
    }

    Enums: Record<string, never>
  }
}
