---
name: auth-audit
description: Audit the InTrainin auth and onboarding flows — login, signup, routing, account-type handling, and UX connections between auth pages. Use this after any change to login/page.tsx, signup/page.tsx, proxy.ts, or lib/auth.ts.
---

You are auditing the InTrainin authentication and onboarding flows. Work through the checklist below, reading the relevant files as you go. Report every issue you find with the file path and line number. At the end, produce a clear summary: what passes, what fails, and what needs fixing.

## Files to review

- `apps/web/src/app/(auth)/login/page.tsx`
- `apps/web/src/app/(auth)/signup/page.tsx`
- `apps/web/src/app/(auth)/login/layout.tsx` (if it exists)
- `apps/web/src/proxy.ts`
- `apps/web/src/lib/auth.ts`
- `apps/api/src/domains/auth/index.ts`

## Checklist

### 1 — Routing correctness
- [ ] After learner signup/login, does `router.push` land on `/dashboard`?
- [ ] After business signup/login, does `router.push` land on `/admin`?
- [ ] Is the routing decision based on a reliable source (API response or authoritative React state), not a stale closure?
- [ ] Does the proxy (`proxy.ts`) protect all learner routes (`/dashboard`, `/explore`, `/learn`, `/certificates`, `/profile`, `/job-hub`) and all business routes (`/admin`, `/team`, `/hire`, `/account`)?
- [ ] Does `signOut` call the correct API logout endpoint (not a non-existent proxy route)?

### 2 — New-user vs returning-user branching
- [ ] When `profileComplete = false` (new user), does the signup page show the profile step?
- [ ] When `profileComplete = true` (returning user) on the **login** page, does it route by `user.account_type` from `/auth/me`?
- [ ] When `profileComplete = true` on the **signup** page with business intent but a learner DB type, does it show the `'convert'` confirmation step instead of silently routing to `/dashboard`?
- [ ] After the convert confirmation, does completing the profile step correctly update `account_type` to `'business'` and route to `/admin`?

### 3 — Account-type state integrity
- [ ] Is `accountType` React state set correctly before `handleProfileSubmit` runs? (No stale closure risk from Suspense remount, etc.)
- [ ] Does `handleProfileSubmit` send the correct `accountType` to `/auth/profile/complete`?
- [ ] Does the API `profile/complete` upsert both the `public.users` row **and** the Supabase auth metadata (`user_metadata.account_type`)? If not, the next `otp/verify` will reset the type.

### 4 — Intuitive page connections (UX)
- [ ] Does every auth step have a CTA for the opposite action? (e.g., signup page has "sign in" links, login page has "sign up" link)
- [ ] Does `?type=business` in the URL pre-select business on both `/login` and `/signup`?
- [ ] On the signup type selector, are there two separate sign-in links (one to `/login`, one to `/login?type=business`)?
- [ ] On the phone step of signup, does the "Already have an account?" link point to `/login?type=business` when `accountType === 'business'`?

### 5 — Session cookie and proxy
- [ ] Does `setSession()` set the `intrainin_has_session` cookie **before** `router.push()` is called, so the proxy has the cookie on the very next request?
- [ ] Is the cookie set with `path=/` so the proxy sees it on all protected routes?
- [ ] Does `signOut` clear the cookie (`max-age=0`) as well as localStorage?

### 6 — Dead code / stale patterns
- [ ] Is there any leftover `needsProfile=1` sessionStorage logic?
- [ ] Are there any references to `/api/proxy/auth/logout` (the old non-existent route)?
- [ ] Are there any stale `/roles` links in the learner section that should be `/explore`?

## Report format

After completing the checklist, output:

**PASS** — items that are correctly implemented  
**FAIL** — items that are broken, with file:line and a one-line description of the fix needed  
**WARN** — items that work but are fragile or could be improved
