/**
 * PostHog analytics wrapper.
 * All event tracking in the app goes through this module — never call
 * posthog directly — so we can swap providers without touching feature code.
 */

type Properties = Record<string, string | number | boolean | null>

function getPostHog() {
  if (typeof window === 'undefined') return null
  // @ts-expect-error — posthog-js is loaded via snippet; typed separately if needed
  return window.posthog ?? null
}

export const analytics = {
  /** Identify a logged-in user. Call after successful login/signup. */
  identify(userId: string, traits?: Properties) {
    getPostHog()?.identify(userId, traits)
  },

  /** Track a named event with optional properties. */
  track(event: string, properties?: Properties) {
    getPostHog()?.capture(event, properties)
  },

  /** Reset identity on logout. */
  reset() {
    getPostHog()?.reset()
  },
}

// ─── Typed event catalogue ────────────────────────────────────────────────────
// Define event names here to avoid magic strings across the codebase.

export const Events = {
  // Auth
  SIGNED_UP: 'signed_up',
  SIGNED_IN: 'signed_in',
  SIGNED_OUT: 'signed_out',

  // Learning
  ROLE_ENROLLED: 'role_enrolled',
  TOPIC_STARTED: 'topic_started',
  TOPIC_COMPLETED: 'topic_completed',

  // Assessment
  TEST_STARTED: 'test_started',
  TEST_PASSED: 'test_passed',
  TEST_FAILED: 'test_failed',

  // Certification
  CERTIFICATE_EARNED: 'certificate_earned',
  CERTIFICATE_SHARED: 'certificate_shared',

  // Jobs
  JOB_HUB_OPT_IN: 'job_hub_opt_in',
  HIRE_REQUEST_SENT: 'hire_request_sent',
} as const
