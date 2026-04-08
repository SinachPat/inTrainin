// =============================================================================
// App-wide constants shared between API and frontend
// =============================================================================

// ── Sectors / Categories ──────────────────────────────────────────────────────

export const SECTORS = [
  'Retail',
  'Food & Beverage',
  'Hospitality',
  'Logistics',
  'Beauty & Wellness',
  'Administration',
] as const
export type Sector = (typeof SECTORS)[number]

// ── Assessment rules ──────────────────────────────────────────────────────────

/** Hours a learner must wait before retrying a failed module test */
export const ASSESSMENT_COOLDOWN_HOURS = 24

/** Hours a learner must wait before retrying a failed final exam */
export const FINAL_EXAM_COOLDOWN_HOURS = 48

/** Max attempts before a mandatory extended cooldown kicks in */
export const ASSESSMENT_MAX_ATTEMPTS = 3

/** Minimum passing score (%) for all assessments */
export const PASSING_SCORE_PCT = 70

/** Number of roles freely accessible without payment */
export const FREE_ROLES_LIMIT = 1

// ── Display formats ───────────────────────────────────────────────────────────

/** App-wide date format for display (use with date-fns or similar) */
export const DATE_FORMAT = 'dd MMM yyyy'

// ── Availability options (Job Hub) ────────────────────────────────────────────

export const AVAILABILITY_OPTIONS = [
  { value: 'immediate',   label: 'Immediately'    },
  { value: 'two_weeks',   label: 'Within 2 weeks' },
  { value: 'one_month',   label: 'Within 1 month' },
] as const satisfies ReadonlyArray<{ value: string; label: string }>

// ── Employment type options (Job Hub) ─────────────────────────────────────────

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract',  label: 'Contract'  },
  { value: 'any',       label: 'Any'       },
] as const satisfies ReadonlyArray<{ value: string; label: string }>

// ── Match status labels (Job Hub) ─────────────────────────────────────────────

export const MATCH_STATUS_LABELS: Record<string, string> = {
  pending:     'Pending',
  accepted:    'Accepted',
  declined:    'Declined',
  shortlisted: 'Shortlisted',
  hired:       'Hired',
  rejected:    'Not selected',
}

// ── Hire status labels (Business) ────────────────────────────────────────────

export const HIRE_STATUS_LABELS: Record<string, string> = {
  open:   'Open',
  filled: 'Filled',
  closed: 'Closed',
  draft:  'Draft',
}

// ── Member status labels (Business) ──────────────────────────────────────────

export const MEMBER_STATUS_LABELS: Record<string, string> = {
  invited: 'Invited',
  active:  'Active',
  removed: 'Removed',
}

// ── Subscription plans (Job Hub worker) ──────────────────────────────────────

export const JOB_HUB_PLANS = [
  {
    key:      'monthly' as const,
    label:    'Monthly',
    priceNgn: 1_000,
    sub:      '/month',
    billing:  'Billed monthly',
  },
  {
    key:      'annual' as const,
    label:    'Annual',
    priceNgn: 8_000,
    sub:      '/year',
    billing:  'Save ₦4,000 vs monthly',
    highlight: true,
  },
]

// ── Business subscription plans ───────────────────────────────────────────────

export const BUSINESS_PLANS = [
  {
    key:      'starter' as const,
    label:    'Starter',
    priceNgn: 15_000,
    seats:    10,
    features: ['Up to 10 staff', 'All learning content', 'Progress dashboard'],
  },
  {
    key:      'growth' as const,
    label:    'Growth',
    priceNgn: 40_000,
    seats:    30,
    features: ['Up to 30 staff', 'All learning content', 'Progress dashboard', 'Priority support'],
  },
  {
    key:      'business' as const,
    label:    'Business',
    priceNgn: 80_000,
    seats:    100,
    features: ['Up to 100 staff', 'All learning content', 'Advanced analytics', 'Dedicated account manager'],
  },
  {
    key:      'enterprise_plus' as const,
    label:    'Enterprise+',
    priceNgn: 0,    // custom pricing — contact sales
    seats:    Infinity,
    features: ['Unlimited staff', 'Custom curriculum', 'White-label certificates', 'SLA support'],
  },
]

// ── Nigerian cities (common — for city picker dropdowns) ──────────────────────

export const NG_CITIES = [
  'Abuja',
  'Abeokuta',
  'Aba',
  'Asaba',
  'Benin City',
  'Calabar',
  'Enugu',
  'Ibadan',
  'Ilorin',
  'Jos',
  'Kaduna',
  'Kano',
  'Lagos',
  'Maiduguri',
  'Nnewi',
  'Onitsha',
  'Owerri',
  'Port Harcourt',
  'Uyo',
  'Warri',
  'Zaria',
] as const
export type NgCity = (typeof NG_CITIES)[number]

// ── API error codes (machine-readable, returned in ApiError.code) ─────────────

export const ERROR_CODES = {
  // Auth
  OTP_EXPIRED:        'OTP_EXPIRED',
  OTP_INVALID:        'OTP_INVALID',
  OTP_MAX_ATTEMPTS:   'OTP_MAX_ATTEMPTS',
  PHONE_ALREADY_USED: 'PHONE_ALREADY_USED',
  UNAUTHORIZED:       'UNAUTHORIZED',
  // Learning
  NOT_ENROLLED:       'NOT_ENROLLED',
  TOPIC_LOCKED:       'TOPIC_LOCKED',
  // Assessment
  COOLDOWN_ACTIVE:    'COOLDOWN_ACTIVE',
  MAX_ATTEMPTS:       'MAX_ATTEMPTS',
  TEST_NOT_UNLOCKED:  'TEST_NOT_UNLOCKED',
  // Payment
  PAYMENT_FAILED:     'PAYMENT_FAILED',
  ALREADY_ENROLLED:   'ALREADY_ENROLLED',
  // Business
  SEAT_LIMIT_REACHED: 'SEAT_LIMIT_REACHED',
  // General
  NOT_FOUND:          'NOT_FOUND',
  VALIDATION_ERROR:   'VALIDATION_ERROR',
  INTERNAL_ERROR:     'INTERNAL_ERROR',
} as const
export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]
