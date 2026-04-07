export const SECTORS = [
  'Retail',
  'Food & Beverage',
  'Hospitality',
  'Logistics',
  'Beauty & Wellness',
  'Administration',
] as const

export type Sector = (typeof SECTORS)[number]

/** Hours a learner must wait before retrying a failed assessment */
export const ASSESSMENT_COOLDOWN_HOURS = 24

/** Max assessment attempts before a mandatory 72-hour cooldown */
export const ASSESSMENT_MAX_ATTEMPTS = 3

/** Number of free roles available without payment */
export const FREE_ROLES_LIMIT = 1

/** Minimum passing score (percentage) for assessments */
export const PASSING_SCORE_PCT = 70

/** App-wide date format for display */
export const DATE_FORMAT = 'dd MMM yyyy'
