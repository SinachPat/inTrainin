# InTrainin Frontend Design System Skill

## Purpose
Use this skill for every frontend task in InTrainin to keep visual quality, UX behavior, and implementation consistency aligned with the **Dub.co design language** — a modern, minimalist, product-led aesthetic built on neutral restraint, typographic hierarchy, and purposeful whitespace.

This is a **design implementation skill**, not a branding replacement. Keep InTrainin naming, mission, and domain context.

---

## Brand Direction: Dub.co Visual Language

InTrainin adopts Dub.co's exact design philosophy:
- **Monochromatic foundation** — neutral black/white/grey palette carries the UI. No decorative color.
- **Grid-structured layouts** — visible 1px border dividers create structure and scanability.
- **Typographic hierarchy** — weight and size contrast do the heavy lifting, not color.
- **Generous whitespace** — spacing reduces cognitive load; never cramped.
- **Minimal motion** — functional micro-interactions only; no decorative animation.
- **High contrast by default** — black on white for maximum readability on low-end devices.

---

## Core Design Direction

### Brand Character
- Clean, modern, product-led interface.
- High information clarity with minimal visual noise.
- Confident typography hierarchy, generous spacing, crisp data presentation.
- Fast-feeling interactions with restrained motion.
- Professional and trust-first — appropriate for certification, credentials, and employment.

### UX Principles
- Always optimize for **task completion speed** and readability.
- Every screen must answer: "What can I do now?" in under 3 seconds.
- Prioritize progressive disclosure: compact summary first, details on demand.
- Use consistent empty/loading/error states.

### Accessibility Baseline
- WCAG 2.1 AA contrast minimum.
- Keyboard reachable controls and visible focus states.
- Semantic HTML landmarks and correctly labeled form controls.
- Motion must respect `prefers-reduced-motion`.

---

## Stack Requirements
- Next.js (App Router) + TypeScript
- Tailwind CSS (v4)
- shadcn/ui (base-nova style, `@base-ui/react` primitives) as default components
- Lucide icons
- Recharts for charts where needed

Do not build custom primitives when equivalent shadcn/ui components exist.

---

## Visual System

### Color Palette (Dub.co Exact Values)

Use these as the CSS token source of truth. Never hardcode arbitrary hex in components.

**Backgrounds**
| Token | Hex | Usage |
|---|---|---|
| `background` | `#FFFFFF` | Page background |
| `background-subtle` | `#FAFAFA` | Sidebar, panel backgrounds |
| `background-muted` | `#F5F5F5` | Input backgrounds, table rows |

**Borders**
| Token | Hex | Usage |
|---|---|---|
| `border` | `#E5E5E5` | Default borders, dividers, grid lines |
| `border-strong` | `#D4D4D4` | Emphasized separators, active states |

**Text**
| Token | Hex | Usage |
|---|---|---|
| `foreground` | `#000000` | Primary headings, body text |
| `foreground-secondary` | `#404040` | Secondary labels, descriptions |
| `foreground-muted` | `#737373` | Placeholders, captions, metadata |
| `foreground-subtle` | `#A3A3A3` | Disabled text, timestamps |

**Primary (Brand Action)**
| Token | Hex | Usage |
|---|---|---|
| `primary` | `#000000` | CTAs, active nav, key interactive elements |
| `primary-foreground` | `#FFFFFF` | Text on primary bg |

**Semantic**
| Token | Purpose |
|---|---|
| `success` | Positive state (pass, complete, verified) |
| `warning` | Caution state (cooldown, expiry) |
| `destructive` | Error state (fail, remove) |
| `ring` | Focus ring on interactive elements |

### Typography

Dub.co uses a two-font system: a **geometric/display serif** for headlines and a **clean sans-serif** for body.

| Role | Size/Line-height | Weight | Usage |
|---|---|---|---|
| Display | 48/56px | 700 | Hero headings, certificate names |
| H1 | 36/44px | 700 | Page titles |
| H2 | 28/36px | 700 | Section headings |
| H3 | 22/30px | 600 | Card titles, module headers |
| H4 | 18/26px | 600 | Subsection labels |
| Body | 16/24px | 400–500 | Content, descriptions |
| Small | 14/20px | 400–500 | Form labels, metadata |
| Caption | 12/16px | 500 | Timestamps, badge labels |

### Spacing and Radius

4px base grid. All spacing must be a multiple of 4.

**Spacing scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96

**Border radius** (matching Dub.co)
| Context | Value |
|---|---|
| Cards, panels, dialogs | `0.5rem` (8px) — `rounded-lg` |
| Inputs, buttons | `0.5rem` (8px) — `rounded-lg` |
| Pills, badges, tags | `9999px` — `rounded-full` |
| Tooltips, dropdowns | `0.375rem` (6px) — `rounded-md` |

### Elevation

Dub.co uses **borders over shadows**. Elevation is expressed through:
1. Background color contrast (`#FFFFFF` over `#FAFAFA`)
2. 1px `border` in `#E5E5E5`
3. Subtle `drop-shadow-sm` only on popovers/dropdowns that float above content

Never use heavy box shadows for cards or panels.

---

## Layout System (Dub.co Grid Pattern)

- **Grid-structured layouts**: Use 1px border dividers to create visual structure — avoid floating card soup.
- **Sidebar + content split** (desktop): Left sidebar with border-right; main content area.
- **Mobile**: Top bar + bottom navigation for critical actions.
- Max content width: `1200px` centered. Readable prose max-width: `720px`.
- Dashboard sections: headline metric → trend/context → detail table.

---

## Component Rules (shadcn-first)

### Required Component Set
- Navigation: `Tabs`, `Breadcrumb`, `NavigationMenu`, `Sheet`
- Inputs: `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`
- Actions: `Button`, `DropdownMenu`, `Dialog`, `AlertDialog`
- Data: `Table`, `Badge`, `Card`, `Progress`, `Tooltip`
- Feedback: `Toast`, `Skeleton`, `Alert`

### Component Behavior
- Buttons must have loading and disabled states.
- Forms must have inline validation and actionable error copy.
- Tables on mobile must collapse to cards or horizontal scroll with sticky key columns.
- Use skeleton loaders for initial load and optimistic updates where possible.

### Dub.co Button Style
- Primary: `bg-black text-white hover:bg-neutral-800` with `rounded-lg`
- Secondary: `bg-white text-black border border-neutral-200 hover:bg-neutral-50`
- Ghost: `text-neutral-600 hover:bg-neutral-100 hover:text-black`
- Destructive: follows semantic `destructive` token

---

## Motion Guidelines

Matching Dub.co's restrained motion:
- Duration: **120ms–220ms** only
- Easing: `ease-out` for entrances, `ease-in` for exits
- Fade + slight translate (`translateY(4px) → 0`) for panels and dropdowns
- No bounce, spring, or decorative animation
- Avoid all animation in learning flows and assessments
- Always wrap animations in `prefers-reduced-motion` guard

---

## Product-Specific UX Patterns (InTrainin)

### Learning Content Pages
- Persistent progress indicator (top of screen, always visible)
- Resume CTA always accessible
- Topic completion feedback with next-step prompt
- Clean reading layout: max-width prose, generous line-height

### Assessments
- Clear timer and attempt state displayed prominently
- Save progress on every answer; reconnect-safe
- Cooldown state shown clearly: time remaining + retry CTA disabled until ready

### Certificates & Job Hub
- Trust-first UI: verification metadata, status clarity, issued date visible
- Strong CTA hierarchy: primary share action, secondary download
- Certificate display uses Display typography weight — this is a credentialing moment

### Dashboards (Business Admin)
- Dub.co-style metric rows: label | value | trend, separated by 1px borders
- No chart-heavy dashboards unless data justifies it
- Empty states with clear next action (not just "No data")

---

## Copy and Tone
- Plain, supportive, confidence-building language.
- Keep labels short and action-oriented.
- Avoid corporate filler and technical jargon in learner-facing screens.
- Certificate and milestone copy should feel earned — weighty, not casual.

---

## Definition of Done (Frontend)

A task is done only when:
1. Uses shadcn/ui primitives or documented extension.
2. Responsive on mobile, tablet, desktop.
3. Meets WCAG 2.1 AA accessibility baseline.
4. Uses semantic tokens only — **no hardcoded hex values**.
5. Includes loading, empty, and error states.
6. Passes lint and TypeScript type checks.
7. Follows Dub.co layout patterns: border-grid structure, neutral palette, whitespace discipline.

---

## Reusable Prompt Block

Use this block when asking an agent to implement UI:

```md
Apply InTrainin Frontend Design System Skill:
- Stack: Next.js App Router + Tailwind v4 + shadcn/ui (base-nova / @base-ui/react)
- Brand: Dub.co visual language — neutral black/white/grey palette, border-grid layouts,
  typographic hierarchy, generous whitespace, no decorative color
- Color tokens: #000000 primary, #FFFFFF background, #F5F5F5 muted, #E5E5E5 borders,
  #404040/#737373 secondary text
- Border radius: rounded-lg (8px) for cards/inputs/buttons; rounded-full for badges/pills
- Elevation: 1px borders + background contrast, not heavy shadows
- Mobile-first responsive behavior required
- Accessibility WCAG 2.1 AA required
- Semantic token usage only — no arbitrary hex in components
- Include loading, empty, and error states
- Reuse existing components before creating new ones
```
