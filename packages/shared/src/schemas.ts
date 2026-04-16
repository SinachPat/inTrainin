import { z } from 'zod'

// =============================================================================
// Primitives
// =============================================================================

const uuid = z.string().uuid()

/**
 * ISO-8601 datetime — used for timestamps returned by the database.
 * Supabase returns timestamptz values as "2024-03-15T10:30:00" (no offset suffix)
 * when the stored value is UTC, so we allow strings without an explicit offset.
 * Example: "2024-03-15T10:30:00" or "2024-03-15T10:30:00Z"
 */
const isoDateTime = z.string().datetime({ offset: false })

/**
 * Calendar date only — used for human-entered date fields like startDate on
 * hire requests or streakLastActivityDate on users.
 * Example: "2024-03-15"
 */
const isoDateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')

/**
 * Nigerian mobile phone number.
 * Accepts international format (+2348012345678) or local format (08012345678).
 * Country code 234 + 10 digits, or leading 0 + 10 digits.
 */
const phone = z.string().regex(
  /^(\+234|0)[0-9]{10}$/,
  'Invalid phone number — use +2348012345678 or 08012345678 format',
)

// =============================================================================
// Enums  (aligned 1-to-1 with database.types.ts string literals)
// =============================================================================

export const AccountTypeSchema = z.enum(['learner', 'business', 'admin'])
export type AccountType = z.infer<typeof AccountTypeSchema>

/**
 * Planned for a future migration — the users table does not yet have a status
 * column. Reserved here so the enum is defined before the DB column is added.
 */
export const AccountStatusSchema = z.enum(['active', 'suspended', 'pending_verification'])
export type AccountStatus = z.infer<typeof AccountStatusSchema>

export const ContentTypeSchema = z.enum(['text', 'guide', 'case_study', 'workflow'])
export type ContentType = z.infer<typeof ContentTypeSchema>

export const TestTypeSchema = z.enum(['module', 'final'])
export type TestType = z.infer<typeof TestTypeSchema>

export const EnrollmentStatusSchema = z.enum(['active', 'completed', 'paused'])
export type EnrollmentStatus = z.infer<typeof EnrollmentStatusSchema>

export const TopicStatusSchema = z.enum(['not_started', 'in_progress', 'completed'])
export type TopicStatus = z.infer<typeof TopicStatusSchema>

export const PaymentTypeSchema = z.enum(['individual', 'enterprise', 'free_trial'])
export type PaymentType = z.infer<typeof PaymentTypeSchema>

export const AvailabilitySchema = z.enum(['immediate', 'two_weeks', 'one_month'])
export type Availability = z.infer<typeof AvailabilitySchema>

export const EmploymentTypeSchema = z.enum(['full_time', 'part_time', 'contract', 'any'])
export type EmploymentType = z.infer<typeof EmploymentTypeSchema>

export const MatchStatusSchema = z.enum([
  'pending', 'accepted', 'declined', 'shortlisted', 'hired', 'rejected',
])
export type MatchStatus = z.infer<typeof MatchStatusSchema>

export const MemberStatusSchema = z.enum(['invited', 'active', 'removed'])
export type MemberStatus = z.infer<typeof MemberStatusSchema>

export const HireStatusSchema = z.enum(['open', 'filled', 'closed', 'draft'])
export type HireStatus = z.infer<typeof HireStatusSchema>

export const ProgressionTypeSchema = z.enum(['next', 'adjacent'])
export type ProgressionType = z.infer<typeof ProgressionTypeSchema>

export const SubscriptionPlanSchema = z.enum(['starter', 'growth', 'business', 'enterprise_plus'])
export type SubscriptionPlan = z.infer<typeof SubscriptionPlanSchema>

// =============================================================================
// JSONB sub-type schemas
// These validate the structured JSONB columns stored in the database.
// =============================================================================

export const NotificationPrefsSchema = z.object({
  push:  z.boolean(),
  sms:   z.boolean(),
  email: z.boolean(),
})
export type NotificationPrefs = z.infer<typeof NotificationPrefsSchema>

export const ContentSectionSchema = z.object({
  heading: z.string().min(1),
  body:    z.string().min(1),
})
export type ContentSection = z.infer<typeof ContentSectionSchema>

export const ContentStepSchema = z.object({
  step:        z.number().int().positive(),
  title:       z.string().min(1),
  description: z.string().min(1),
})
export type ContentStep = z.infer<typeof ContentStepSchema>

/**
 * Structured body of a topic — shape varies by content_type.
 *
 * 'text'       → sections + key_points
 * 'guide'      → steps
 * 'workflow'   → steps
 * 'case_study' → scenario, what_went_wrong, correct_response, what_not_to_do, learning_outcome
 *
 * All fields are optional at the schema level so the same schema covers every
 * content type. Stricter per-type validation is enforced at write-time in the
 * API domain handler (learning/topics).
 */
export const ContentBodySchema = z.object({
  // text & guide
  sections:               z.array(ContentSectionSchema).optional(),
  key_points:             z.array(z.string()).optional(),
  estimated_read_minutes: z.number().int().positive().optional(),
  // guide & workflow
  steps:                  z.array(ContentStepSchema).optional(),
  // case_study
  scenario:               z.string().optional(),
  what_went_wrong:        z.string().optional(),
  correct_response:       z.record(z.string(), z.string()).optional(),
  what_not_to_do:         z.array(z.string()).optional(),
  learning_outcome:       z.string().optional(),
})
export type ContentBody = z.infer<typeof ContentBodySchema>

/** A single MCQ stored as JSONB inside tests.questions */
export const QuestionItemSchema = z.object({
  id:          z.string().min(1),
  question:    z.string().min(1),
  options:     z.array(z.string()).min(2).max(5),
  correct:     z.number().int().nonnegative(), // index into options[]
  explanation: z.string(),
})
export type QuestionItem = z.infer<typeof QuestionItemSchema>

/**
 * Notification payload — known fields are strongly typed; any additional
 * event-specific fields pass through as primitives via .catchall().
 * Intentionally open-ended so new notification types don't require schema changes.
 */
export const NotificationDataSchema = z
  .object({
    hire_request_id: z.string().optional(),
    role_id:         z.string().optional(),
    role_title:      z.string().optional(),
    certificate_id:  z.string().optional(),
    badge_slug:      z.string().optional(),
  })
  .catchall(z.union([z.string(), z.number(), z.boolean(), z.null()]))
export type NotificationData = z.infer<typeof NotificationDataSchema>

export const BadgeTriggerValueSchema = z.object({
  count:          z.number().int().optional(), // module_completed, roles_enrolled, certificate_issued
  days:           z.number().int().optional(), // streak_days
  min_pct:        z.number().optional(),       // test_score
  attempt_number: z.number().int().optional(), // test_score (first attempt only)
})
export type BadgeTriggerValue = z.infer<typeof BadgeTriggerValueSchema>

// =============================================================================
// Core entity schemas
// All fields are camelCase (application domain). The API layer maps to/from
// the snake_case columns stored in Supabase.
// =============================================================================

// ── User ──────────────────────────────────────────────────────────────────────

export const JobLocationPrefSchema = z.enum(['onsite', 'remote', 'hybrid', 'any'])
export type JobLocationPref = z.infer<typeof JobLocationPrefSchema>

export const UserSchema = z.object({
  id:                     uuid,
  phone:                  phone.nullable(),
  email:                  z.string().email().trim().toLowerCase().nullable(),
  fullName:               z.string().trim().min(1),
  locationCity:           z.string().trim().nullable(),
  locationState:          z.string().trim().nullable(),
  careerGoalRoleId:       uuid.nullable(),
  accountType:            AccountTypeSchema,
  avatarUrl:              z.string().url().nullable(),
  xpTotal:                z.number().int().nonnegative(),
  streakCurrent:          z.number().int().nonnegative(),
  streakLastActivityDate: isoDateOnly.nullable(),
  fcmToken:               z.string().nullable(),
  notificationPrefs:      NotificationPrefsSchema,
  jobLocationPref:        JobLocationPrefSchema.nullable(),
  resumeUrl:              z.string().url().nullable(),
  createdAt:              isoDateTime,
  updatedAt:              isoDateTime,
  deletedAt:              isoDateTime.nullable(),
})
export type User = z.infer<typeof UserSchema>

// ── Category ──────────────────────────────────────────────────────────────────

export const CategorySchema = z.object({
  id:           uuid,
  name:         z.string().min(1),
  slug:         z.string().min(1),
  iconName:     z.string().nullable(),
  displayOrder: z.number().int().nonnegative(),
  createdAt:    isoDateTime,
})
export type Category = z.infer<typeof CategorySchema>

// ── Role ──────────────────────────────────────────────────────────────────────

export const RoleSchema = z.object({
  id:                    uuid,
  categoryId:            uuid,
  title:                 z.string().min(1),
  slug:                  z.string().min(1),
  description:           z.string().nullable(),
  priceNgn:              z.number().int().nonnegative(), // 0 = free
  estimatedHours:        z.number().positive().nullable(),
  isPublished:           z.boolean(),
  freePreviewModuleCount: z.number().int().nonnegative(),
  phase:                 z.number().int().positive(),
  sanityId:              z.string().nullable(),
  createdAt:             isoDateTime,
  updatedAt:             isoDateTime,
})
export type Role = z.infer<typeof RoleSchema>

// ── Module ────────────────────────────────────────────────────────────────────

export const ModuleSchema = z.object({
  id:          uuid,
  roleId:      uuid,
  title:       z.string().min(1),
  orderIndex:  z.number().int().nonnegative(),
  isPublished: z.boolean(),
  createdAt:   isoDateTime,
})
export type Module = z.infer<typeof ModuleSchema>

// ── Topic ─────────────────────────────────────────────────────────────────────

export const TopicSchema = z.object({
  id:               uuid,
  moduleId:         uuid,
  title:            z.string().min(1),
  contentType:      ContentTypeSchema,
  contentBody:      ContentBodySchema.nullable(),
  sanityId:         z.string().nullable(),
  orderIndex:       z.number().int().nonnegative(),
  estimatedMinutes: z.number().int().positive(),
  isPublished:      z.boolean(),
  createdAt:        isoDateTime,
})
export type Topic = z.infer<typeof TopicSchema>

// ── Test ──────────────────────────────────────────────────────────────────────

export const TestSchema = z.object({
  id:               uuid,
  moduleId:         uuid.nullable(), // null for final exams
  roleId:           uuid.nullable(), // set for final exams
  testType:         TestTypeSchema,
  title:            z.string().min(1),
  questions:        z.array(QuestionItemSchema).min(1),
  passMarkPct:      z.number().int().min(1).max(100),
  timeLimitMinutes: z.number().int().positive().nullable(),
  cooldownHours:    z.number().int().nonnegative(),
  createdAt:        isoDateTime,
})
export type Test = z.infer<typeof TestSchema>

// ── Role Progression ──────────────────────────────────────────────────────────

export const RoleProgressionSchema = z.object({
  id:              uuid,
  fromRoleId:      uuid,
  toRoleId:        uuid,
  progressionType: ProgressionTypeSchema,
  displayOrder:    z.number().int().nonnegative(),
})
export type RoleProgression = z.infer<typeof RoleProgressionSchema>

// ── Enrollment ────────────────────────────────────────────────────────────────

export const EnrollmentSchema = z.object({
  id:               uuid,
  userId:           uuid,
  roleId:           uuid,
  status:           EnrollmentStatusSchema,
  paymentReference: z.string().nullable(),
  paymentType:      PaymentTypeSchema.nullable(),
  enrolledAt:       isoDateTime,
  completedAt:      isoDateTime.nullable(),
})
export type Enrollment = z.infer<typeof EnrollmentSchema>

// ── Topic Progress ────────────────────────────────────────────────────────────

export const TopicProgressSchema = z.object({
  id:               uuid,
  userId:           uuid,
  topicId:          uuid,
  status:           TopicStatusSchema,
  startedAt:        isoDateTime.nullable(),
  completedAt:      isoDateTime.nullable(),
  timeSpentSeconds: z.number().int().nonnegative(),
})
export type TopicProgress = z.infer<typeof TopicProgressSchema>

// ── Test Attempt ──────────────────────────────────────────────────────────────

/**
 * A single answer — camelCase in the application domain.
 * Layer 5 note: when writing to/reading from test_attempts.answers (JSONB),
 * convert to snake_case: questionId→question_id, selectedText→selected_text.
 */
export const TestAnswerSchema = z.object({
  questionId:   z.string(),
  selected:     z.number().int().nonnegative(), // index into options[]
  selectedText: z.string(),
})
export type TestAnswer = z.infer<typeof TestAnswerSchema>

export const TestAttemptSchema = z.object({
  id:            uuid,
  userId:        uuid,
  testId:        uuid,
  scorePct:      z.number().min(0).max(100),
  passed:        z.boolean(),
  attemptNumber: z.number().int().positive(),
  answers:       z.array(TestAnswerSchema),
  takenAt:       isoDateTime,
})
export type TestAttempt = z.infer<typeof TestAttemptSchema>

// ── Badge ─────────────────────────────────────────────────────────────────────

export const BadgeSchema = z.object({
  id:           uuid,
  slug:         z.string().min(1),
  name:         z.string().min(1),
  description:  z.string().nullable(),
  iconUrl:      z.string().url().nullable(),
  triggerType:  z.string().min(1),
  triggerValue: BadgeTriggerValueSchema.nullable(),
})
export type Badge = z.infer<typeof BadgeSchema>

export const UserBadgeSchema = z.object({
  id:       uuid,
  userId:   uuid,
  badgeId:  uuid,
  earnedAt: isoDateTime,
})
export type UserBadge = z.infer<typeof UserBadgeSchema>

// ── Certificate ───────────────────────────────────────────────────────────────

export const CertificateSchema = z.object({
  id:               uuid,
  userId:           uuid,
  roleId:           uuid,
  enrollmentId:     uuid,
  verificationCode: z.string().uuid(), // DB stores this as UUID type
  issuedAt:         isoDateTime,
  imageUrl:         z.string().url().nullable(),
  isRevoked:        z.boolean(),
})
export type Certificate = z.infer<typeof CertificateSchema>

// ── Business ──────────────────────────────────────────────────────────────────

export const BusinessSchema = z.object({
  id:                    uuid,
  ownerUserId:           uuid,
  name:                  z.string().min(1),
  category:              z.string().nullable(),
  sizeRange:             z.string().nullable(),
  locationCity:          z.string().nullable(),
  locationState:         z.string().nullable(),
  subscriptionPlan:      SubscriptionPlanSchema.nullable(),
  subscriptionStartsAt:  isoDateTime.nullable(),
  subscriptionExpiresAt: isoDateTime.nullable(),
  seatLimit:             z.number().int().positive(),
  paymentReference:      z.string().nullable(),
  createdAt:             isoDateTime,
  updatedAt:             isoDateTime,
})
export type Business = z.infer<typeof BusinessSchema>

// ── Business Member ───────────────────────────────────────────────────────────

export const BusinessMemberSchema = z.object({
  id:             uuid,
  businessId:     uuid,
  userId:         uuid.nullable(),   // null until the invite is accepted
  invitedPhone:   phone.nullable(),
  invitedEmail:   z.string().email().nullable(),
  assignedRoleId: uuid.nullable(),
  jobTitle:       z.string().nullable(),
  status:         MemberStatusSchema,
  invitedAt:      isoDateTime,
  joinedAt:       isoDateTime.nullable(),
})
export type BusinessMember = z.infer<typeof BusinessMemberSchema>

// ── Job Hub Profile ───────────────────────────────────────────────────────────

export const JobHubProfileSchema = z.object({
  id:                    uuid,
  userId:                uuid,
  isSubscribed:          z.boolean(),
  subscriptionPlan:      SubscriptionPlanSchema.nullable(),
  subscriptionStartsAt:  isoDateTime.nullable(),
  subscriptionExpiresAt: isoDateTime.nullable(),
  preferredRoles:        z.array(z.string()),
  locationCity:          z.string().nullable(),
  locationState:         z.string().nullable(),
  availability:          AvailabilitySchema.nullable(),
  employmentTypePref:    EmploymentTypeSchema.nullable(),
  isVisible:             z.boolean(),
  createdAt:             isoDateTime,
  updatedAt:             isoDateTime,
})
export type JobHubProfile = z.infer<typeof JobHubProfileSchema>

// ── Hire Request ──────────────────────────────────────────────────────────────

export const HireRequestSchema = z.object({
  id:                   uuid,
  businessId:           uuid,
  roleId:               uuid,
  locationCity:         z.string().min(1),
  locationState:        z.string().nullable(),
  positionsCount:       z.number().int().positive(),
  payMin:               z.number().int().nonnegative().nullable(),
  payMax:               z.number().int().nonnegative().nullable(),
  startDate:            isoDateOnly.nullable(),
  requirements:         z.string().nullable(),
  certificationRequired: z.boolean(),
  status:               HireStatusSchema,
  postedAt:             isoDateTime,
  expiresAt:            isoDateTime.nullable(),
  paymentReference:     z.string().nullable(),
})
export type HireRequest = z.infer<typeof HireRequestSchema>

// ── Job Match ─────────────────────────────────────────────────────────────────

export const JobMatchSchema = z.object({
  id:               uuid,
  hireRequestId:    uuid,
  userId:           uuid,
  matchScore:       z.number().min(0).max(100),
  status:           MatchStatusSchema,
  workerNotifiedAt: isoDateTime.nullable(),
  createdAt:        isoDateTime,
  updatedAt:        isoDateTime,
})
export type JobMatch = z.infer<typeof JobMatchSchema>

// ── Notification ──────────────────────────────────────────────────────────────

export const NotificationSchema = z.object({
  id:        uuid,
  userId:    uuid,
  type:      z.string().min(1),
  title:     z.string().min(1),
  body:      z.string().nullable(),
  data:      NotificationDataSchema.nullable(),
  isRead:    z.boolean(),
  createdAt: isoDateTime,
})
export type Notification = z.infer<typeof NotificationSchema>

// =============================================================================
// API Request Schemas
// One schema per API action. These are validated at the Hono route boundary
// before any domain logic runs.
// =============================================================================

// ── Auth ──────────────────────────────────────────────────────────────────────

/** Step 1 — request an OTP to be sent via SMS */
export const RequestOtpSchema = z.object({
  phone: phone,
})
export type RequestOtpInput = z.infer<typeof RequestOtpSchema>

/** Step 2 — verify the 6-digit OTP */
export const VerifyOtpSchema = z.object({
  phone: phone,
  code:  z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must be 6 digits'),
})
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>

/** Step 3 — complete profile after first-time OTP verification */
export const CompleteProfileSchema = z.object({
  fullName:         z.string().trim().min(1, 'Full name is required').max(120),
  email:            z.string().trim().toLowerCase().email('Enter a valid email address').optional(),
  locationCity:     z.string().trim().min(1, 'City is required'),
  accountType:      z.enum(['learner', 'business']),
  // Job location preference (onsite / remote / hybrid / any)
  jobLocationPref:  z.enum(['onsite', 'remote', 'hybrid', 'any']).optional(),
  // Learner-only: the role they want to pursue — either UUID or slug accepted
  careerGoalRoleId:   uuid.optional(),
  careerGoalRoleSlug: z.string().optional(),
  // Business-only: the name of the business being registered
  businessName:     z.string().trim().min(1).max(200).optional(),
}).superRefine((data, ctx) => {
  if (data.accountType === 'business' && !data.businessName?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Business name is required for business accounts',
      path: ['businessName'],
    })
  }
})
export type CompleteProfileInput = z.infer<typeof CompleteProfileSchema>

/** Update notification preferences */
export const UpdateNotificationPrefsSchema = NotificationPrefsSchema
export type UpdateNotificationPrefsInput = z.infer<typeof UpdateNotificationPrefsSchema>

// ── Enrollment & Payment ──────────────────────────────────────────────────────

export const EnrolRequestSchema = z.object({
  roleId:           uuid,
  paymentReference: z.string().optional(), // Paystack reference; absent for free roles
  paymentType:      PaymentTypeSchema.optional(),
})
export type EnrolRequest = z.infer<typeof EnrolRequestSchema>

// ── Learning Progress ─────────────────────────────────────────────────────────

/** Sent when a learner marks a topic complete */
export const CompleteTopicSchema = z.object({
  timeSpentSeconds: z.number().int().nonnegative(),
})
export type CompleteTopicInput = z.infer<typeof CompleteTopicSchema>

// ── Assessment ────────────────────────────────────────────────────────────────

/** Sent when a learner submits a completed test */
export const SubmitTestSchema = z.object({
  answers: z.array(TestAnswerSchema).min(1),
})
export type SubmitTestInput = z.infer<typeof SubmitTestSchema>

// ── Job Hub ───────────────────────────────────────────────────────────────────

export const UpdateJobHubProfileSchema = z.object({
  availability:       AvailabilitySchema.optional(),
  employmentTypePref: EmploymentTypeSchema.optional(),
  preferredRoles:     z.array(z.string()).optional(),
  locationCity:       z.string().optional(),
  locationState:      z.string().optional(),
  isVisible:          z.boolean().optional(),
})
export type UpdateJobHubProfileInput = z.infer<typeof UpdateJobHubProfileSchema>

/** Worker accepts or declines a job match */
export const RespondToMatchSchema = z.object({
  status: z.enum(['accepted', 'declined']),
})
export type RespondToMatchInput = z.infer<typeof RespondToMatchSchema>

// ── Business ──────────────────────────────────────────────────────────────────

export const InviteMemberSchema = z.object({
  phone:          phone.optional(),
  email:          z.string().trim().toLowerCase().email('Enter a valid email address').optional(),
  jobTitle:       z.string().trim().min(1, 'Job title is required').max(100),
  assignedRoleId: uuid.optional(),
}).superRefine((data, ctx) => {
  if (!data.phone && !data.email) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Either phone or email is required to invite a member',
      path: ['phone'],
    })
  }
})
export type InviteMemberInput = z.infer<typeof InviteMemberSchema>

/**
 * Base shape shared by both PostHireRequest and UpdateHireRequest.
 * Defined separately so .partial() and .extend() can be called on the raw
 * ZodObject — .refine() wraps it in ZodEffects which has no .partial() method.
 */
const HireRequestBaseSchema = z.object({
  roleId:                uuid,
  locationCity:          z.string().min(1, 'Location is required'),
  locationState:         z.string().optional(),
  positionsCount:        z.number().int().positive().default(1),
  payMin:                z.number().int().nonnegative().optional(),
  payMax:                z.number().int().nonnegative().optional(),
  startDate:             isoDateOnly.optional(),
  requirements:          z.string().max(1000).optional(),
  certificationRequired: z.boolean().default(false),
})

/**
 * Shared pay-range invariant — reused by both create and update schemas.
 * Uses `=== undefined` (not falsy) so that payMin: 0 is a valid lower bound
 * and is still compared against payMax rather than short-circuiting.
 */
const payRangeRefinement = (data: { payMin?: number; payMax?: number }) =>
  data.payMin === undefined || data.payMax === undefined || data.payMin <= data.payMax

export const PostHireRequestSchema = HireRequestBaseSchema.refine(payRangeRefinement, {
  message: 'Minimum pay cannot exceed maximum pay',
  path: ['payMin'],
})
export type PostHireRequestInput = z.infer<typeof PostHireRequestSchema>

export const UpdateHireRequestSchema = HireRequestBaseSchema
  .partial()
  .extend({ status: HireStatusSchema.optional() })
  .refine(payRangeRefinement, {
    message: 'Minimum pay cannot exceed maximum pay',
    path: ['payMin'],
  })
export type UpdateHireRequestInput = z.infer<typeof UpdateHireRequestSchema>

// =============================================================================
// API Response envelope
// Every API endpoint returns { success: true, data: T } or { success: false, error: string }
// =============================================================================

/**
 * Factory that builds a typed API success response schema.
 * This is a function, NOT a schema — call it with a data schema to produce one.
 *
 * Usage:
 *   const UserResponseSchema = ApiSuccessSchema(UserSchema)
 *   type UserResponse = z.infer<typeof UserResponseSchema>
 *   // → { success: true; data: User }
 */
export const ApiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data:    dataSchema,
  })

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error:   z.string(),
  code:    z.string().optional(), // machine-readable error code e.g. "COOLDOWN_ACTIVE"
})
export type ApiError = z.infer<typeof ApiErrorSchema>

// ── Email Auth ────────────────────────────────────────────────────────────────

/** Email + password login for existing users */
export const EmailLoginSchema = z.object({
  email:    z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})
export type EmailLoginInput = z.infer<typeof EmailLoginSchema>

/** Email + password sign-up — profile completion is handled by /auth/profile/complete */
export const EmailRegisterSchema = z.object({
  email:    z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
})
export type EmailRegisterInput = z.infer<typeof EmailRegisterSchema>

// ── Roadmap ───────────────────────────────────────────────────────────────────

/** Set or update the user's career goal role */
export const UpdateGoalSchema = z.object({
  role_id: z.string().uuid('Invalid role ID'),
})
export type UpdateGoalInput = z.infer<typeof UpdateGoalSchema>

// ── Payments ──────────────────────────────────────────────────────────────────

/** Initiate a course purchase */
export const InitiateCoursePaymentSchema = z.object({
  role_id: z.string().uuid('Invalid role ID'),
})
export type InitiateCoursePaymentInput = z.infer<typeof InitiateCoursePaymentSchema>

/** Initiate a Job Hub credits pack purchase */
export const InitiateJobHubCreditsSchema = z.object({
  credits: z.union([z.literal(20), z.literal(50), z.literal(100)]),
})
export type InitiateJobHubCreditsInput = z.infer<typeof InitiateJobHubCreditsSchema>

/** Initiate a hire-request payment */
export const InitiateHireRequestPaymentSchema = z.object({
  hire_request_id: z.string().uuid('Invalid hire request ID'),
})
export type InitiateHireRequestPaymentInput = z.infer<typeof InitiateHireRequestPaymentSchema>

/**
 * Initiate an enterprise package payment.
 * NOTE: 'enterprise_plus' is intentionally excluded — it requires custom pricing
 * and is handled via a separate sales/contact flow, not Paystack self-serve.
 */
export const InitiateEnterprisePaymentSchema = z.object({
  plan:   z.enum(['starter', 'growth', 'business']),
  months: z.union([z.literal(1), z.literal(3), z.literal(6), z.literal(12)]),
})
export type InitiateEnterprisePaymentInput = z.infer<typeof InitiateEnterprisePaymentSchema>
