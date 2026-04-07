import { z } from 'zod'

// ─── Primitives ───────────────────────────────────────────────────────────────

const uuid = z.string().uuid()
const isoDate = z.string().datetime()
const kobo = z.number().int().nonnegative() // Nigerian Naira, stored in kobo (1 NGN = 100 kobo)

// ─── Enums ────────────────────────────────────────────────────────────────────

export const UserRoleSchema = z.enum(['learner', 'business_owner', 'admin'])
export type UserRole = z.infer<typeof UserRoleSchema>

export const AccountStatusSchema = z.enum(['active', 'suspended', 'pending_verification'])
export type AccountStatus = z.infer<typeof AccountStatusSchema>

export const TopicContentTypeSchema = z.enum(['guide', 'case_study', 'workflow', 'test'])
export type TopicContentType = z.infer<typeof TopicContentTypeSchema>

export const AttemptStatusSchema = z.enum(['in_progress', 'passed', 'failed'])
export type AttemptStatus = z.infer<typeof AttemptStatusSchema>

export const JobStatusSchema = z.enum(['open', 'filled', 'closed'])
export type JobStatus = z.infer<typeof JobStatusSchema>

export const HireRequestStatusSchema = z.enum(['pending', 'accepted', 'rejected', 'withdrawn'])
export type HireRequestStatus = z.infer<typeof HireRequestStatusSchema>

export const BusinessPlanSchema = z.enum(['free', 'starter', 'enterprise'])
export type BusinessPlan = z.infer<typeof BusinessPlanSchema>

// ─── User ─────────────────────────────────────────────────────────────────────

export const UserSchema = z.object({
  id: uuid,
  email: z.string().email(),
  phone: z.string().nullable(),
  fullName: z.string().min(1).nullable(),
  avatarUrl: z.string().url().nullable(),
  role: UserRoleSchema,
  status: AccountStatusSchema,
  createdAt: isoDate,
  updatedAt: isoDate,
})
export type User = z.infer<typeof UserSchema>

// ─── Category ─────────────────────────────────────────────────────────────────

export const CategorySchema = z.object({
  id: uuid,
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  iconUrl: z.string().url().nullable(),
})
export type Category = z.infer<typeof CategorySchema>

// ─── Role ─────────────────────────────────────────────────────────────────────

export const RoleSchema = z.object({
  id: uuid,
  categoryId: uuid,
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  sector: z.string().min(1),
  estimatedHours: z.number().positive(),
  priceKobo: kobo, // 0 = free
  moduleCount: z.number().int().nonnegative(),
  publishedAt: isoDate.nullable(),
})
export type Role = z.infer<typeof RoleSchema>

// ─── Module ───────────────────────────────────────────────────────────────────

export const ModuleSchema = z.object({
  id: uuid,
  roleId: uuid,
  title: z.string().min(1),
  description: z.string().nullable(),
  order: z.number().int().nonnegative(),
})
export type Module = z.infer<typeof ModuleSchema>

// ─── Topic ────────────────────────────────────────────────────────────────────

export const TopicSchema = z.object({
  id: uuid,
  moduleId: uuid,
  title: z.string().min(1),
  contentType: TopicContentTypeSchema,
  estimatedMinutes: z.number().int().positive(),
  order: z.number().int().nonnegative(),
  isGated: z.boolean().default(false), // true = requires prior topics complete
})
export type Topic = z.infer<typeof TopicSchema>

// ─── Test ─────────────────────────────────────────────────────────────────────

export const TestQuestionSchema = z.object({
  id: uuid,
  testId: uuid,
  text: z.string().min(1),
  options: z.array(z.string()).min(2).max(5),
  correctIndex: z.number().int().nonnegative(),
  explanation: z.string().nullable(),
  order: z.number().int().nonnegative(),
})
export type TestQuestion = z.infer<typeof TestQuestionSchema>

export const TestSchema = z.object({
  id: uuid,
  topicId: uuid,
  title: z.string().min(1),
  passingScorePct: z.number().int().min(1).max(100).default(70),
  timeLimitMinutes: z.number().int().positive().nullable(),
  maxAttempts: z.number().int().positive().default(3),
  cooldownHours: z.number().int().nonnegative().default(24),
  questions: z.array(TestQuestionSchema),
})
export type Test = z.infer<typeof TestSchema>

// ─── Enrollment ───────────────────────────────────────────────────────────────

export const EnrollmentSchema = z.object({
  id: uuid,
  userId: uuid,
  roleId: uuid,
  progressPct: z.number().min(0).max(100).default(0),
  enrolledAt: isoDate,
  completedAt: isoDate.nullable(),
  paymentReference: z.string().nullable(), // Paystack reference if paid
})
export type Enrollment = z.infer<typeof EnrollmentSchema>

// ─── Topic Progress ───────────────────────────────────────────────────────────

export const TopicProgressSchema = z.object({
  id: uuid,
  userId: uuid,
  topicId: uuid,
  completedAt: isoDate.nullable(),
  timeSpentSeconds: z.number().int().nonnegative().default(0),
})
export type TopicProgress = z.infer<typeof TopicProgressSchema>

// ─── Test Attempt ─────────────────────────────────────────────────────────────

export const TestAttemptSchema = z.object({
  id: uuid,
  userId: uuid,
  testId: uuid,
  topicId: uuid,
  status: AttemptStatusSchema,
  score: z.number().min(0).max(100),
  answers: z.record(z.string(), z.number()), // { questionId: selectedIndex }
  startedAt: isoDate,
  completedAt: isoDate.nullable(),
  cooldownUntil: isoDate.nullable(),
})
export type TestAttempt = z.infer<typeof TestAttemptSchema>

// ─── Certificate ──────────────────────────────────────────────────────────────

export const CertificateSchema = z.object({
  id: uuid,
  userId: uuid,
  roleId: uuid,
  verificationCode: z.string().min(8),
  imageUrl: z.string().url().nullable(), // Cloudinary URL
  issuedAt: isoDate,
})
export type Certificate = z.infer<typeof CertificateSchema>

// ─── Job Hub: Worker Profile ──────────────────────────────────────────────────

export const JobHubProfileSchema = z.object({
  id: uuid,
  userId: uuid,
  isVisible: z.boolean().default(true),
  preferredLocation: z.string().nullable(),
  preferredSectors: z.array(z.string()).default([]),
  expectedSalaryKobo: kobo.nullable(),
  bio: z.string().max(500).nullable(),
  updatedAt: isoDate,
})
export type JobHubProfile = z.infer<typeof JobHubProfileSchema>

// ─── Job Match ────────────────────────────────────────────────────────────────

export const JobMatchSchema = z.object({
  id: uuid,
  userId: uuid,
  jobId: uuid,
  matchScore: z.number().min(0).max(1), // 0–1 relevance score
  matchedAt: isoDate,
  seenAt: isoDate.nullable(),
})
export type JobMatch = z.infer<typeof JobMatchSchema>

// ─── Hire Request ─────────────────────────────────────────────────────────────

export const HireRequestSchema = z.object({
  id: uuid,
  businessId: uuid,
  workerId: uuid,
  roleId: uuid,
  message: z.string().max(1000).nullable(),
  status: HireRequestStatusSchema,
  createdAt: isoDate,
  updatedAt: isoDate,
})
export type HireRequest = z.infer<typeof HireRequestSchema>

// ─── Business ─────────────────────────────────────────────────────────────────

export const BusinessSchema = z.object({
  id: uuid,
  ownerId: uuid,
  name: z.string().min(1),
  logoUrl: z.string().url().nullable(),
  sector: z.string().nullable(),
  location: z.string().nullable(),
  plan: BusinessPlanSchema.default('free'),
  planExpiresAt: isoDate.nullable(),
  createdAt: isoDate,
})
export type Business = z.infer<typeof BusinessSchema>

// ─── Business Member ─────────────────────────────────────────────────────────

export const BusinessMemberSchema = z.object({
  id: uuid,
  businessId: uuid,
  userId: uuid,
  assignedRoleId: uuid.nullable(), // Which InTrainin role they're assigned to train for
  invitedAt: isoDate,
  joinedAt: isoDate.nullable(),
})
export type BusinessMember = z.infer<typeof BusinessMemberSchema>

// ─── Request/Response Schemas (API boundary) ──────────────────────────────────

export const SignupRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  phone: z.string().optional(),
  role: z.enum(['learner', 'business_owner']),
})
export type SignupRequest = z.infer<typeof SignupRequestSchema>

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
export type LoginRequest = z.infer<typeof LoginRequestSchema>

export const EnrolRequestSchema = z.object({
  roleId: uuid,
  paymentReference: z.string().optional(),
})
export type EnrolRequest = z.infer<typeof EnrolRequestSchema>

export const SubmitTestRequestSchema = z.object({
  answers: z.record(z.string(), z.number()),
})
export type SubmitTestRequest = z.infer<typeof SubmitTestRequestSchema>
