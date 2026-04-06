# InTrainin Implementation Prompt (Layered)

Use this document as the master prompt structure for implementing InTrainin in iterative, production-ready layers.

---

## How To Use
- Copy the full template below into your agent prompt.
- Fill in `Context Pack` for the current sprint.
- Keep completed layers as immutable decisions unless explicitly changed.
- Run each layer in order; do not skip foundational layers.

---

## Master Layered Prompt Template

```md
You are implementing InTrainin as a web-first responsive PWA.

Follow the InTrainin design-system skill in `skill.md` strictly.

## Context Pack
- Product doc: InTrainin_PRD_v1.docx.md
- Current sprint goal: finish the product.
- Constraints: no hardcoding, no deviations from the design system, no gradients, clean design, cripsy edges design.
- Existing codebase status: new codebase
- Non-goals for this sprint: <fill>

## Layer 0: Non-Negotiables
1. Web-first PWA only (no native app dependency).
2. Stack: Next.js App Router + TypeScript + Tailwind + shadcn/ui.
3. Mobile-first responsive behavior.
4. Accessibility baseline WCAG 2.1 AA.
5. Keep code modular, typed, testable.
6. Never use one-off styling when tokens/components exist.

## Layer 1: Product Intent Mapping
Translate PRD goals into implementation outcomes:
- Learner journey (discover -> enroll -> learn -> certify -> job match -> upskill)
- Business journey (register -> assign workers -> track progress -> hire)

Output:
- Feature map by user type
- Explicit in-scope/out-of-scope for this sprint
- Acceptance criteria per flow

## Layer 2: Information Architecture
Define route tree and app shells:
- Public marketing + role catalogue
- Auth + onboarding
- Learner dashboard and learning engine
- Certification + verification pages
- Job Hub
- Business admin panel

Output:
- Route list
- Layout hierarchy
- Navigation model (mobile + desktop)

## Layer 3: Design System and UI Contracts
Apply `skill.md` and define:
- Token usage rules
- Component composition rules
- Table/form/card patterns
- Loading/empty/error standards

Output:
- UI contract list for each core screen
- Reusable component inventory

## Layer 4: Domain and Data Modeling
Use PRD section 7 models to define:
- Core entities and relationships
- Validation schemas
- Access boundaries by account type

Output:
- Domain model map
- API contract stubs (request/response shapes)
- Error taxonomy

## Layer 5: Backend Service Design
Implement service modules:
- auth
- learning
- assessments
- certification
- jobs
- business
- notifications

Output:
- Endpoint list grouped by module
- Authorization matrix
- Event hooks (payment confirmed, test passed, certificate issued, job matched)

## Layer 6: Frontend Feature Slices
Build vertical slices in this order:
1. Auth + profile setup
2. Role catalogue + enrollment/payment unlock
3. Learning engine + progress persistence
4. Tests + exam gating + cooldown rules
5. Certificate generation + verification page
6. Job Hub worker + employer interactions
7. Business admin workflows

Output per slice:
- Route components
- State model
- API integration
- Edge states

## Layer 7: PWA and Offline Behavior
Implement:
- Manifest + icons + install affordance
- Service worker caching strategy
- Offline fallback for last-viewed topic
- Sync queue for progress writes

Output:
- Caching matrix by asset/data type
- Offline/online transition behavior
- Failure recovery logic

## Layer 8: Integrations and Messaging
Integrate:
- Paystack (verified webhook unlock)
- SMS/email providers
- Web push provider
- CMS content ingestion
- analytics/monitoring

Output:
- Integration checklist
- Retry/idempotency strategy
- Secrets/config matrix

## Layer 9: Security, Privacy, and Compliance
Apply:
- AuthN/AuthZ enforcement
- RLS/data ownership boundaries
- Rate limiting for public verification
- NDPA-aware data handling controls

Output:
- Threat/risk checklist
- Data exposure review
- Audit logs requirements

## Layer 10: Quality and Release
Define:
- Test plan (unit/integration/e2e)
- Performance budgets (3G targets)
- Accessibility checks
- Observability dashboards and alerts

Output:
- Release checklist
- Rollout strategy (staged)
- Post-release KPI tracking plan

## Execution Rules
- Prefer existing project patterns over introducing new abstractions.
- Keep commits/scopes small and reviewable.
- After each layer, summarize decisions and unresolved risks.
- If blocked by ambiguity, propose default assumptions and proceed.
```

---

## Suggested Layer Ownership
- Layer 0-3: Product + Design + Frontend Lead
- Layer 4-5: Backend Lead + Architect
- Layer 6-8: Full-stack squad
- Layer 9-10: Security + QA + DevOps

---

## Sprint Prompt Variants

### Variant A: MVP Slice Prompt
Use when implementing one learner flow end-to-end.

```md
Execute Layers 0-7 only for this MVP slice:
<slice name>

Focus on:
- production-quality UX
- complete happy path + key error paths
- measurable analytics events
```

### Variant B: Hardening Prompt
Use after feature completeness.

```md
Execute Layers 7-10 for hardening and release readiness.

Focus on:
- offline resilience
- accessibility and performance targets
- monitoring, alerting, and incident response readiness
```

### Variant C: Refactor Prompt
Use when quality is drifting.

```md
Apply Layers 3, 4, and 10 to refactor existing modules.

Focus on:
- consistency with skill.md
- reducing UI and domain duplication
- preserving behavior while improving maintainability
```
