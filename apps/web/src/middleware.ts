/**
 * Next.js App Router middleware — must live at src/middleware.ts.
 * Any other filename is silently ignored by Next.js.
 *
 * Redirects unauthenticated users to /login for all protected routes.
 * The intrainin_has_session cookie is written by setSession() in lib/auth.ts
 * when a user logs in. It carries no sensitive data — it is a presence signal
 * only. The actual JWT lives in localStorage (read by client components).
 */

export { proxy as default, config } from './proxy'
