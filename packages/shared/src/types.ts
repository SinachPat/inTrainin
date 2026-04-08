// ─── Re-exported from Zod schemas (single source of truth) ───────────────────
// All types below are inferred from packages/shared/src/schemas.ts.
// Do NOT define types independently here — edit the schema and re-infer.

export type {
  // Enums
  AccountType,
  AccountStatus,
  ContentType,
  TestType,
  EnrollmentStatus,
  TopicStatus,
  PaymentType,
  Availability,
  EmploymentType,
  MatchStatus,
  MemberStatus,
  HireStatus,
  ProgressionType,
  SubscriptionPlan,

  // JSONB sub-types
  NotificationPrefs,
  ContentSection,
  ContentStep,
  ContentBody,
  QuestionItem,
  NotificationData,
  BadgeTriggerValue,
  TestAnswer,

  // Core entities
  User,
  Category,
  Role,
  Module,
  Topic,
  Test,
  RoleProgression,
  Enrollment,
  TopicProgress,
  TestAttempt,
  Badge,
  UserBadge,
  Certificate,
  Business,
  BusinessMember,
  JobHubProfile,
  HireRequest,
  JobMatch,
  Notification,

  // API request inputs
  RequestOtpInput,
  VerifyOtpInput,
  CompleteProfileInput,
  UpdateNotificationPrefsInput,
  EnrolRequest,
  CompleteTopicInput,
  SubmitTestInput,
  UpdateJobHubProfileInput,
  RespondToMatchInput,
  InviteMemberInput,
  PostHireRequestInput,
  UpdateHireRequestInput,

  // API response
  ApiError,
} from './schemas'
