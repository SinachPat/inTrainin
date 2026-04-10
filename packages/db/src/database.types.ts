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
// Relationship helper — required by Supabase JS ≥ 2.65 for all table types
// =============================================================================

type Relationship = {
  foreignKeyName: string
  columns: string[]
  isOneToOne?: boolean
  referencedRelation: string
  referencedColumns: string[]
}

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
          job_location_pref: 'onsite' | 'remote' | 'hybrid' | 'any' | null
          resume_url: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          phone?: string | null
          email?: string | null
          full_name: string
          location_city?: string | null
          location_state?: string | null
          career_goal_role_id?: string | null
          account_type?: AccountType
          avatar_url?: string | null
          xp_total?: number
          streak_current?: number
          streak_last_activity_date?: string | null
          fcm_token?: string | null
          notification_prefs?: NotificationPrefs
          job_location_pref?: 'onsite' | 'remote' | 'hybrid' | 'any' | null
          resume_url?: string | null
          deleted_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['users']['Insert']>
        Relationships: Relationship[]
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
        Insert: {
          id?: string
          name: string
          slug: string
          icon_name?: string | null
          display_order?: number
        }
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
        Relationships: Relationship[]
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
        Insert: {
          id?: string
          category_id: string
          title: string
          slug: string
          description?: string | null
          price_ngn: number
          estimated_hours?: number | null
          is_published?: boolean
          free_preview_module_count?: number
          phase?: number
          sanity_id?: string | null
        }
        Update: Partial<Database['public']['Tables']['roles']['Insert']>
        Relationships: [
          {
            foreignKeyName: "roles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
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
        Insert: {
          id?: string
          role_id: string
          title: string
          order_index: number
          is_published?: boolean
        }
        Update: Partial<Database['public']['Tables']['modules']['Insert']>
        Relationships: [
          {
            foreignKeyName: "modules_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          }
        ]
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
        Insert: {
          id?: string
          module_id: string
          title: string
          content_type: ContentType
          content_body?: ContentBody | null
          sanity_id?: string | null
          order_index: number
          estimated_minutes?: number
          is_published?: boolean
        }
        Update: Partial<Database['public']['Tables']['topics']['Insert']>
        Relationships: [
          {
            foreignKeyName: "topics_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          }
        ]
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
        Insert: {
          id?: string
          module_id?: string | null
          role_id?: string | null
          test_type: TestType
          title: string
          questions?: QuestionItem[]
          pass_mark_pct?: number
          time_limit_minutes?: number | null
          cooldown_hours?: number
        }
        Update: Partial<Database['public']['Tables']['tests']['Insert']>
        Relationships: [
          {
            foreignKeyName: "tests_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tests_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          }
        ]
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
        Insert: {
          id?: string
          from_role_id: string
          to_role_id: string
          progression_type: ProgressionType
          display_order?: number
        }
        Update: Partial<Database['public']['Tables']['role_progressions']['Insert']>
        Relationships: Relationship[]
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
        Insert: {
          id?: string
          user_id: string
          role_id: string
          status?: EnrollmentStatus
          payment_reference?: string | null
          payment_type?: PaymentType | null
          completed_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['enrollments']['Insert']>
        Relationships: [
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          }
        ]
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
        Insert: {
          id?: string
          user_id: string
          topic_id: string
          status?: TopicStatus
          started_at?: string | null
          completed_at?: string | null
          time_spent_seconds?: number
        }
        Update: Partial<Database['public']['Tables']['topic_progress']['Insert']>
        Relationships: [
          {
            foreignKeyName: "topic_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topic_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          }
        ]
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
        Insert: {
          id?: string
          user_id: string
          test_id: string
          score_pct: number
          passed: boolean
          answers: Array<{ question_id: string; selected: number; selected_text: string }>
          attempt_number?: number
        }
        Update: never   // attempts are immutable once recorded
        Relationships: [
          {
            foreignKeyName: "test_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_attempts_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          }
        ]
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
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          icon_url?: string | null
          trigger_type: string
          trigger_value?: BadgeTriggerValue | null
        }
        Update: Partial<Database['public']['Tables']['badges']['Insert']>
        Relationships: Relationship[]
      }

      // ── user_badges ──────────────────────────────────────────────────────────
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: never   // badge awards are immutable
        Relationships: Relationship[]
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
        Insert: {
          id?: string
          owner_user_id: string
          name: string
          category?: string | null
          size_range?: string | null
          location_city?: string | null
          location_state?: string | null
          subscription_plan?: SubscriptionPlan | null
          subscription_starts_at?: string | null
          subscription_expires_at?: string | null
          seat_limit?: number
          payment_reference?: string | null
        }
        Update: Partial<Database['public']['Tables']['businesses']['Insert']>
        Relationships: [
          {
            foreignKeyName: "businesses_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
        Insert: {
          id?: string
          business_id: string
          user_id?: string | null
          invited_phone?: string | null
          invited_email?: string | null
          assigned_role_id?: string | null
          job_title?: string | null
          status?: MemberStatus
          joined_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['business_members']['Insert']>
        Relationships: [
          {
            foreignKeyName: "business_members_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_members_assigned_role_id_fkey"
            columns: ["assigned_role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          }
        ]
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
        Insert: {
          id?: string
          user_id: string
          role_id: string
          enrollment_id: string
          verification_code?: string
          image_url?: string | null
          is_revoked?: boolean
        }
        Update: {
          image_url?: string | null
          is_revoked?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          }
        ]
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
        Insert: {
          id?: string
          user_id: string
          is_subscribed?: boolean
          subscription_plan?: string | null
          subscription_starts_at?: string | null
          subscription_expires_at?: string | null
          preferred_roles?: string[]
          location_city?: string | null
          location_state?: string | null
          availability?: Availability | null
          employment_type_pref?: EmploymentType | null
          is_visible?: boolean
        }
        Update: Partial<Database['public']['Tables']['job_hub_profiles']['Insert']>
        Relationships: [
          {
            foreignKeyName: "job_hub_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── job_hub_credits ──────────────────────────────────────────────────────
      job_hub_credits: {
        Row: {
          id: string
          user_id: string
          amount: number           // positive = top-up, negative = spend
          reason: string           // 'monthly_grant' | 'purchase' | 'apply'
          reference: string | null // Paystack reference for purchases
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          reason: string
          reference?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['job_hub_credits']['Insert']>
        Relationships: [
          {
            foreignKeyName: "job_hub_credits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }

      // ── hire_requests ────────────────────────────────────────────────────────
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
        Insert: {
          id?: string
          business_id: string
          role_id: string
          location_city: string
          location_state?: string | null
          positions_count?: number
          pay_min?: number | null
          pay_max?: number | null
          start_date?: string | null
          requirements?: string | null
          certification_required?: boolean
          status?: HireStatus
          expires_at?: string | null
          payment_reference?: string | null
        }
        Update: Partial<Database['public']['Tables']['hire_requests']['Insert']>
        Relationships: [
          {
            foreignKeyName: "hire_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hire_requests_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          }
        ]
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
        Insert: {
          id?: string
          hire_request_id: string
          user_id: string
          match_score: number
          status?: MatchStatus
          worker_notified_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['job_matches']['Insert']>
        Relationships: [
          {
            foreignKeyName: "job_matches_hire_request_id_fkey"
            columns: ["hire_request_id"]
            isOneToOne: false
            referencedRelation: "hire_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          body?: string | null
          data?: NotificationData | null
          is_read?: boolean
        }
        Update: {
          is_read?: boolean
        }
        Relationships: Relationship[]
      }
    }

    Views: Record<string, never>

    Functions: Record<string, never>

    Enums: Record<string, never>
  }
}
