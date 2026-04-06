

| InTrainin Product Requirements Document A Role-Based Learning Environment for Informal Sector Workers Version 1.0   |   April 2026   |   CONFIDENTIAL |
| :---- |

| Document Status Draft for Review | Prepared By Product Team | Target Audience Claude Code / Dev Team |
| :---- | :---- | :---- |

| 1\. Product Overview Purpose, Vision & Scope |
| :---- |

## **1.1 Product Summary**

InTrainin is a role-based digital learning platform purpose-built for workers and job seekers in the informal and underserved employment sector across sub-Saharan Africa, starting from Nigeria. It is not a general-purpose LMS. Every feature, piece of content, and user flow is designed around one specific outcome: ***getting informal sector workers trained, certified, and employed faster.***

## **1.2 Vision Statement**

| "Every cashier, waiter, cleaner, and store attendant deserves structured training, portable proof of competence, and a fair shot at better employment — regardless of where they started." |
| :---- |

## **1.3 Core Platform Components**

| Component | Description | Strategic Role |
| :---- | :---- | :---- |
| Learning Engine | Structured, role-specific curricula (Modules → Topics → Guides → Case Studies → Workflows → Tests) | Primary value driver. All roles share this engine. |
| Certification System | Verifiable digital certificates issued on passing all role assessments | Creates portable proof of competence. |
| Job Hub | Matching layer connecting certified workers to employers | Monetisation and retention lever. |
| Business Dashboard | Employer-facing tool for team training management and hiring | B2B revenue stream. |
| Enterprise Package | Subscription plan giving a business's full workforce access to role curricula | High LTV revenue stream. |

## **1.4 Platform Positioning**

| Dimension | Detail |
| :---- | :---- |
| Primary Market | Nigeria (Enugu, Lagos, Abuja, Kano, Port Harcourt) — Phase 1 |
| Expansion Target | Ghana, Kenya, Uganda — Phase 2 (12–18 months post-launch) |
| Device Target | Web-first progressive web app (mobile-first responsive on phone, tablet, desktop) |
| Language | English primary; Pidgin and local language audio via TTS in Phase 2 |
| Sector Focus | Informal / semi-formal employment: retail, F\&B, hospitality, logistics, beauty, admin |

| 2\. Problem Statement Why This Platform Needs to Exist |
| :---- |

## **2.1 The Core Gaps**

Three reinforcing problems create the market opportunity:

| Problem | Description | Impact |
| :---- | :---- | :---- |
| No Standards | There is no widely accepted definition of what a "trained cashier" or "competent waiter" looks like. Skills are passed down verbally, inconsistently, and incompletely — meaning quality varies by employer, by city, and even by shift supervisor. | Workers have no benchmark; employers cannot verify readiness. |
| No Credentials | Professional certifications do not exist for informal sector roles. Workers have no portable proof of competence they can carry from job to job. Without credentials, negotiating for better pay or applying confidently to new roles is nearly impossible. | Every worker starts the job search cycle at zero. |
| No Infrastructure | Existing EdTech platforms (Coursera, Udemy, ALX, etc.) focus exclusively on white-collar, tech, or academic skills. There is a near-complete absence of structured, accessible, role-specific training for the 60%+ of Nigeria's workforce in informal employment. | An entire workforce is excluded from the digital upskilling movement. |

## **2.2 Business-Side Problem (SME Employers)**

* New hires require 2–3 weeks of hand-holding from a supervisor before they can operate independently — time that costs revenue.

* Staff turnover is high. When a trained employee leaves, all training investment is lost with them.

* No standard exists to verify whether a job candidate is actually trained. Interviews cannot reliably assess practical skills.

* Onboarding is repeated identically for every new hire with no documented curriculum or process.

## **2.3 Worker-Side Problem (Job Seekers & Employees)**

* Entry-level candidates are rejected with "no experience" even when they have applicable knowledge, simply because they cannot prove it.

* Training is inaccessible — expensive, time-consuming, or simply not available for their role category.

* Workers cannot differentiate themselves in a competitive informal labour market.

* Passive job discovery is non-existent; workers must physically walk job sites or rely on word-of-mouth.

| 3\. User Personas Detailed Profiles & Behavioural Contexts |
| :---- |

## **3.1 Persona 1 — Amara (Individual Learner / Job Seeker)**

| Attribute | Detail |
| :---- | :---- |
| Age / Location | 22, Lagos, Nigeria |
| Role Target | Cashier (retail or supermarket) |
| Device | Tecno or Infinix Android, mobile data (often prepaid) |
| Income | Unemployed or earning \<₦50,000/month in informal work |
| Digital Literacy | Moderate — uses WhatsApp, Instagram, TikTok daily |
| Education | Secondary school certificate (WAEC), no tertiary |

| Goal | Pain Point | How InTrainin Solves It |
| :---- | :---- | :---- |
| Get hired at a retail shop | Keeps being rejected: "no experience" | Completes Cashier curriculum on phone; earns shareable certificate |
| Stand out from other applicants | No way to demonstrate knowledge before interview | Certificate link sent with job applications as proof of competence |
| Learn proper POS and cash handling | No accessible, affordable training for her specific role | Step-by-step Guides and Workflows tailored to retail cashier tasks |
| Find a job without endless searching | Job hunting is expensive and time-consuming | Job Hub passive matching sends her curated opportunities |

## **3.2 Persona 2 — Chukwudi (Business Owner / SME Employer)**

| Attribute | Detail |
| :---- | :---- |
| Age / Location | 38, Abuja, Nigeria |
| Business Type | Supermarket / retail store, 8–12 staff |
| Role on Platform | Business subscriber (Enterprise Package) |
| Spend Profile | Pays for productivity tools; cost-sensitive on recurring fees |
| Pain Threshold | Loses \~₦150,000 in supervisor time per new hire during onboarding |

| Goal | Pain Point | How InTrainin Solves It |
| :---- | :---- | :---- |
| Hire trained staff faster | New hires need 2–3 weeks of hand-holding | Posts hiring request on Job Hub; reviews certified candidates pre-interview |
| Reduce onboarding burden | Repeats same training for every new hire | Enterprise Package: assigns role curricula to new hires before Day 1 |
| Retain investment in staff training | Staff leave after being trained, wasting money | Certification is worker-owned — reduces resentment; increases loyalty |
| Assess readiness before hiring | No way to verify skills from CV or interview alone | Hiring Dashboard shows training history, test scores, and certificates |

## **3.3 Persona 3 — Fatima (Experienced Worker / Job Hub Subscriber)**

| Attribute | Detail |
| :---- | :---- |
| Age / Location | 29, Kano, Nigeria |
| Current Role | Casual / contract waitress at a local restaurant |
| Role Target | Permanent waitress or supervisor at a hotel / restaurant chain |
| Device | Samsung mid-range Android, WiFi at home and work |
| Digital Literacy | High — uses multiple apps for work and personal use |

| Goal | Pain Point | How InTrainin Solves It |
| :---- | :---- | :---- |
| Move to permanent employment | Has skills but no proof for formal employers | Certification gives her verifiable credentials that command trust |
| Access higher-paying hospitality roles | Premium employers require formal credentials she doesn't have | InTrainin certificate meets informal sector hiring criteria |
| Get job offers without active hunting | Job hunting is exhausting and expensive | Job Hub subscription: passive matching sends curated alerts |
| Expand her skill set | No structured path to go from waitress to supervisor | Roadmap feature shows adjacent roles and upskill paths |

| 4\. Product Features Complete Feature Specifications |
| :---- |

## **4.1 Role Discovery & Enrollment**

### **Description**

The entry point for all learners. Users browse a catalogue of all available roles, view each role's full curriculum breakdown before committing, and enrol with a single payment action.

### **Functional Requirements**

* Display all available roles grouped by category (7 categories, see Section 6).

* Each role card shows: role title, category, number of modules, estimated completion time, price, and a "Preview Curriculum" CTA.

* Curriculum preview screen: lists all Modules and their Topics without requiring payment.

* Search and filter: by role name, category, price range, completion time.

* Enrolment flow: select role → view price → pay (Paystack integration) → unlock course.

* On successful payment: redirect to learner dashboard with role added and progress at 0%.

* Free trial option: allow preview of Module 1 of any course without payment (configurable per role).

### **Technical Notes**

* Role catalogue served from CMS (Sanity or Contentful recommended) to allow non-dev content updates.

* Paystack webhook must confirm payment before unlocking course content — never trust client-side payment confirmation.

* Cache role catalogue with 15-minute TTL; invalidate on content update.

## **4.2 Learning Engine & Content Structure**

### **Content Hierarchy**

| Role → Modules → Topics → Guides \+ Case Studies \+ Workflows → Module Test → \[repeat\] → Final Certification Exam |
| :---- |

| Content Type | Purpose | Example |
| :---- | :---- | :---- |
| Module | Top-level competency area within a role | "Cash Handling" in Cashier role |
| Topic | Individual lesson within a module | "Counting Change Accurately" |
| Guide | Step-by-step how-to for a practical task | "How to Process a Card Payment on POS" |
| Case Study | Real-world scenario \+ professional resolution | "A customer claims they gave ₦5000; till shows ₦2000" |
| Workflow | Visual process map for an end-to-end task | Opening shift checklist with sequence steps |
| Module Test | Assessment at end of each module | 10–15 MCQ \+ scenario questions; 70% pass mark |
| Final Exam | Role certification exam on completion of all modules | 30–50 questions; 75% pass mark required |

### **Functional Requirements**

* Learner must complete Topics in sequence within a Module (linear progression).

* Module Test unlocks only after all Topics in that Module are completed.

* Final Exam unlocks only after all Module Tests are passed.

* Learner may re-attempt Module Tests after a 24-hour cooldown; Final Exam after 48 hours.

* Progress is saved at the Topic level — learner can close and resume from exact position.

* Each Topic tracks: time spent, read/not read, quiz score (if applicable).

* Admins can add, edit, reorder, or retire content without a code deployment (CMS-driven).

## **4.3 Text-to-Audio (Read-Aloud Feature)**

### **Description**

A read-aloud feature that converts all text content to audio in the learner's preferred language. Critical for learners with lower literacy levels or those who prefer audio learning.

### **Functional Requirements**

* Available on all Topic, Guide, Case Study, and Workflow content screens.

* Language options: English (default); Yoruba, Igbo, Hausa (Phase 2 via TTS API).

* Controls: play, pause, rewind 10s, forward 10s, playback speed (0.75x, 1x, 1.25x, 1.5x).

* Audio continues playing while the learner navigates within the web app. Background/locked-screen playback should be supported where the browser and OS permit it.

* TTS engine: Google Cloud TTS or ElevenLabs API (configurable). Cache audio files to reduce API costs.

* User can set language preference once in profile; persists across all content.

## **4.4 Learner Dashboard**

### **Functional Requirements**

* Enrolled roles: list with completion percentage progress bar per role.

* Active module: shows current module title, next topic, and estimated time to module completion.

* Test history: list of all Module Tests and Final Exams with score, pass/fail status, date.

* Certificates earned: tile display of all certificates with share CTA.

* Job Hub status: subscribed / not subscribed; if subscribed, shows match count and latest alerts.

* Notifications panel: course reminders, test results, job match alerts.

* Resume CTA: always-visible button to jump to last active content item.

## **4.5 Gamification System**

### **Description**

Lightweight gamification to drive engagement, reduce dropout, and reward progress milestones.

### **Functional Requirements**

* XP Points: awarded for completing Topics (10 XP), passing Module Tests (50 XP), passing Final Exam (200 XP), and daily login streaks (5 XP/day).

* Badges: visual achievement markers — e.g. "First Module Complete", "7-Day Streak", "Top Score" (90%+ on exam), "Multi-Role Learner" (enrolled in 2+ roles).

* Leaderboard: optional opt-in; ranks learners within same role by XP. Visible to all learners in that role.

* Streak tracking: consecutive days with any learning activity. Broken streak resets to 0 with a recovery notification.

* Milestone notifications: push/in-app alerts at 25%, 50%, 75%, and 100% role completion.

## **4.6 Certificate Generation & Sharing**

### **Functional Requirements**

* Auto-generated on Final Exam pass. No manual action by admin required.

* Certificate contains: learner full name, role name, date of completion, unique verification ID, InTrainin branding.

* Formats: downloadable PNG image, shareable URL link (public verification page).

* Verification page: publicly accessible at intrainin.com/verify/\[ID\]; shows name, role, date. No personal data beyond that.

* Share targets: WhatsApp (primary), LinkedIn, direct link copy, download to device.

* Certificate is permanent — not revoked if learner re-takes the exam.

* Generation: server-side image rendering (Puppeteer or canvas-based); stored in cloud storage (AWS S3 or Cloudinary).

## **4.7 Job Hub**

### **Description**

A two-sided matching layer. Workers subscribe to receive job match alerts. Businesses post hiring requests. The system matches by role, location, and certification status.

### **Worker-Side Requirements**

* Job Hub is open to all users — not limited to InTrainin-certified learners (but certification improves match ranking).

* Subscription: monthly or annual fee unlocks active job matching.

* Profile inputs for matching: role(s), location (city \+ borough), availability (immediate / within 2 weeks / 1 month), preferred employment type (full-time / part-time / contract).

* Match algorithm inputs: role match (exact \+ adjacent roles), location proximity, certification status, InTrainin test scores, experience level declared.

* Job alerts: push notification \+ SMS when a new matching role is posted.

* Alert detail: employer name (optional — employer may remain anonymous), role, location, pay range (if disclosed), requirements.

* Worker can accept or decline a match. Accepted matches notify the employer.

### **Employer-Side Requirements**

* Hire request form: role, location, number of positions, pay range (optional), start date, requirements (min experience, certifications preferred).

* Matching: system surfaces top 10 certified candidates ranked by relevance score.

* Employer can shortlist, message, or request an interview from the dashboard.

* Integration with ShopUrban: hire requests from ShopUrban merchants are automatically ingested into the Job Hub.

## **4.8 Business Admin Panel**

### **Description**

A dedicated dashboard for business subscribers to manage team training, track progress, and hire.

### **Functional Requirements**

* Team management: add workers by email/phone; assign role curricula to specific workers.

* Bulk enrollment: upload CSV of worker contacts; system sends invitation SMS/email with onboarding link.

* Progress tracking: per-worker view — enrolled roles, module completion, test scores, certificate status.

* Aggregate view: overall team completion rate per role; identify lagging workers.

* Hiring dashboard: access to Job Hub candidate pool; post hire requests; view applications.

* Subscription management: view current plan, usage (seats used vs allowed), renewal date, billing history.

* Role assignment by job title: e.g. "All Cashiers" → auto-assigned Cashier curriculum when added.

## **4.9 Notifications & Progress Nudges**

### **Functional Requirements**

* Web push notifications (FCM/Web Push): course reminders, test reminders, streak alerts, job match alerts.

* SMS notifications (via Termii or Twilio): job match alerts, certificate issued, account activity.

* Email notifications (via Resend or SendGrid): welcome email, certificate PDF attachment, weekly progress summary (opt-in).

* Notification preferences: learner can toggle each notification type on/off independently.

* Smart re-engagement: if learner is inactive for 3 days, send re-engagement push. If 7 days, send SMS. If 14 days, send email.

* No notification spam: maximum 3 push notifications per day per learner.

## **4.10 Roadmap Feature**

### **Description**

Shows a learner's full career progression path for their chosen role(s) and surfaces adjacent roles they can unlock next.

### **Functional Requirements**

* Visual roadmap: horizontal or vertical progression showing current role → intermediate role → advanced role (e.g. Cashier → Store Attendant → Store Manager).

* Adjacent role suggestions: roles in the same category that complement current certification.

* Locked/unlocked states: completed roles shown with certificate badge; next role shown with CTA to enrol.

* "Your Career Path" personalisation: learner sets career goal on signup; roadmap adjusts to show relevant path.

| 5\. User Journeys & Product Flows Step-by-Step Implementation Flows |
| :---- |

## **5.1 Individual Learner Journey**

| \# | Stage | Detail |
| :---- | :---- | :---- |
| 1 | Discovery & Sign Up | Learner finds InTrainin via social media ad, WhatsApp referral, or organic search. Lands on role catalogue or marketing landing page. Signs up with phone number (OTP verification) or email. Profile setup: name, location, career goal, preferred role. |
| 2 | Browse & Select Role | Views role catalogue. Taps role to see curriculum preview (all modules/topics visible). Taps "Enrol" → price shown → payment screen (Paystack). On payment success: role added to dashboard, Module 1 unlocked. |
| 3 | Learn | Opens Module 1, Topic 1\. Reads or listens (TTS). Completes all Topics in Module. Takes Module Test (must score 70%+). Continues to next Module. Gamification events trigger throughout (XP, badges, streaks). |
| 4 | Certify | Completes all Modules. Final Exam unlocks. Takes Final Exam (must score 75%+). On pass: certificate auto-generated. Notification sent. Certificate downloadable and shareable immediately. |
| 5 | Job Match | Learner opts into Job Hub (subscription required). Sets matching preferences. Receives job match alerts. Accepts or declines matches. Shortlisted by employer via Hiring Dashboard. |
| 6 | Upskill | Roadmap surfaces next recommended role. Learner browses adjacent roles. Repeats enrolment → learn → certify cycle. |

## **5.2 Enterprise (Business) Journey**

| \# | Stage | Detail |
| :---- | :---- | :---- |
| 1 | Discovery & Registration | Business owner finds InTrainin via B2B outreach, ShopUrban integration, or referral. Registers with business details (name, category, size, location). Verifies email. |
| 2 | Choose Package | Views Enterprise pricing (3-month, 6-month, 12-month). Selects number of seats. Completes payment (Paystack or bank transfer for larger accounts). |
| 3 | Add Workers | Inputs worker phone numbers/emails individually or via CSV upload. Assigns role curricula to each worker (or by job title group). System sends invitation SMS/email to each worker. |
| 4 | Workers Onboard | Workers receive invitation, click link, create account, and immediately see assigned course ready to start. No payment required for workers on Enterprise accounts. |
| 5 | Monitor Progress | Admin dashboard shows real-time completion rates, test scores, and certificate status per worker. Automated alerts flag workers who haven't started or have stalled. |
| 6 | Hire via Job Hub | Business posts hire request on Job Hub. System surfaces certified candidates. Business reviews profiles, test scores, and shortlists. Requests interview directly from dashboard. |

| 6\. Role Catalogue All Supported Roles by Category |
| :---- |

InTrainin organises all roles into 7 categories. Phase 1 launch targets the highest-demand roles (marked with ★). Full catalogue represents the 18-month product roadmap.

## **Category 1 — Retail & Store Operations**

| Role (★ \= Phase 1\) | Curriculum Focus |
| :---- | :---- |
| Cashier ★ | Core retail cash handling, POS operations, customer interaction, closing procedures |
| Store Attendant ★ | Product knowledge, shelf management, customer service, loss prevention basics |
| Storekeeper | Inventory management, stock-taking, receiving goods, FIFO principles |
| Business Owner (Retail) | Basic bookkeeping, staff management, supplier relations, retail operations |
| Store Manager | Team leadership, KPI management, shrinkage control, scheduling |

## **Category 2 — Food & Beverage**

| Role (★ \= Phase 1\) | Curriculum Focus |
| :---- | :---- |
| Waiter / Waitress ★ | Table service, menu knowledge, order taking, upselling, complaint handling |
| Bartender | Drink preparation, responsible service, cash handling at bar, hygiene |
| Cashier (F\&B) | F\&B-specific POS, split bills, void transactions, customer disputes |
| Food Vendor | Food safety, pricing, customer service, basic recordkeeping |
| Kitchen Assistant ★ | Food safety and hygiene, prep techniques, kitchen workflow, waste management |
| Restaurant Supervisor | Team management, service standards, shift operations, conflict resolution |
| Delivery Rider (Food) | Route planning, order accuracy, customer handoff, safety protocols |
| Catering Staff | Event service, volume cooking basics, hygiene, client communication |
| Restaurant Owner | P\&L basics, supplier management, staff scheduling, menu costing |
| Baker / Confectioner | Baking fundamentals, product consistency, food safety, customer orders |

## **Category 3 — Sales & Marketing**

| Role (★ \= Phase 1\) | Curriculum Focus |
| :---- | :---- |
| Sales Representative ★ | Sales process, objection handling, product knowledge, reporting |
| Field Sales Agent | Territory management, prospecting, closing techniques, CRM basics |
| Marketer (SME) | SME marketing fundamentals, offline and digital channels, budgeting |
| Social Media Manager | Content strategy, platform mechanics, engagement, basic analytics |
| Brand Ambassador | Brand messaging, event representation, social selling |
| Customer Service Rep ★ | Communication skills, complaint resolution, escalation, SLA basics |
| Sales Team Lead | Coaching reps, pipeline management, target setting, performance reviews |

## **Category 4 — Hospitality & Facilities Management**

| Role (★ \= Phase 1\) | Curriculum Focus |
| :---- | :---- |
| Cleaner / Janitor ★ | Cleaning standards, chemical safety, hygiene protocols, equipment handling |
| Housekeeper | Room preparation, linen management, guest interaction, lost & found |
| Security Guard | Access control, incident reporting, customer interaction, emergency response |
| Hotel Receptionist ★ | Front desk operations, check-in/out, PMS basics, guest complaints |
| Porter | Guest assistance, luggage handling, local knowledge, service standards |
| Facility Supervisor | Maintenance scheduling, vendor management, team oversight, compliance |
| Event Manager | Event logistics, vendor coordination, on-site management, client communication |
| Hotel Owner / Manager | Revenue management, staff oversight, quality standards, guest satisfaction |
| Laundry Attendant | Fabric care, machine operations, hygiene, turnaround standards |
| Parking Attendant | Vehicle handling, ticketing, customer service, safety basics |

## **Category 5 — Administrative & Office Support**

| Role (★ \= Phase 1\) | Curriculum Focus |
| :---- | :---- |
| Office Assistant ★ | Filing, scheduling, communication, office equipment, professionalism |
| Receptionist ★ | Front desk management, call handling, visitor management, scheduling |
| Data Entry Clerk | Accuracy standards, Excel basics, data hygiene, speed typing fundamentals |
| Personal Assistant | Diary management, travel booking, communication on behalf of principal |
| Bookkeeper (SME) | Basic accounting, expense tracking, reconciliation, invoicing |
| Front Desk Manager | Team management, guest experience, escalation handling, reporting |

## **Category 6 — Logistics, Delivery & Transport**

| Role (★ \= Phase 1\) | Curriculum Focus |
| :---- | :---- |
| Delivery Rider ★ | Route optimisation, order accuracy, customer handoff, safety, app usage |
| Packer / Sorter | Sorting accuracy, packaging standards, warehouse safety, throughput |
| Logistics Coordinator | Shipment tracking, documentation, vendor management, exception handling |
| Fleet Officer | Vehicle maintenance basics, driver management, fuel tracking, compliance |
| Driver | Defensive driving, route planning, customer interaction, vehicle care |

## **Category 7 — Beauty, Wellness & Personal Care**

| Role (★ \= Phase 1\) | Curriculum Focus |
| :---- | :---- |
| Hair Stylist / Barber ★ | Technique fundamentals, client consultation, hygiene, salon safety |
| Salon Attendant | Salon operations, client welcome, retail products, appointment management |
| Salon Owner | Business operations, staff management, pricing, client retention |
| Nail Technician | Application techniques, hygiene, client care, product knowledge |
| Spa Therapist | Treatment techniques, client consultation, hygiene, health precautions |
| Makeup Artist | Skin types, colour theory, technique, client brief, product hygiene |
| Gym Attendant | Equipment safety, client interaction, cleanliness standards, emergency response |

| 7\. Data Architecture Core Data Models for Implementation |
| :---- |

## **7.1 User Model**

| users { id, phone, email, full\_name, location\_city, location\_state, career\_goal\_role\_id, account\_type: \[learner|business|admin\], created\_at, updated\_at, deleted\_at } |
| :---- |

## **7.2 Role & Content Models**

| roles { id, title, category\_id, slug, description, price\_ngn, estimated\_hours, is\_published, phase, created\_at } |
| :---- |

| modules { id, role\_id, title, order\_index, is\_published }topics { id, module\_id, title, content\_type: \[text|guide|case\_study|workflow\], content\_body (rich text / JSON), order\_index, estimated\_minutes }tests { id, module\_id | role\_id, type: \[module|final\], questions (JSON array), pass\_mark\_pct, time\_limit\_minutes } |
| :---- |

## **7.3 Learner Progress Models**

| enrollments { id, user\_id, role\_id, status: \[active|completed|paused\], enrolled\_at, completed\_at, payment\_reference }topic\_progress { id, user\_id, topic\_id, status: \[not\_started|in\_progress|completed\], started\_at, completed\_at, time\_spent\_seconds }test\_attempts { id, user\_id, test\_id, score\_pct, passed, attempt\_number, answers (JSON), taken\_at } |
| :---- |

## **7.4 Certificate Model**

| certificates { id, user\_id, role\_id, enrollment\_id, verification\_code (UUID), issued\_at, image\_url, is\_revoked } |
| :---- |

## **7.5 Job Hub Models**

| job\_hub\_profiles { id, user\_id, is\_subscribed, subscription\_expires\_at, preferred\_roles (array), location, availability, employment\_type\_pref }hire\_requests { id, business\_id, role\_id, location, positions\_count, pay\_min, pay\_max, start\_date, status: \[open|filled|closed\], posted\_at }job\_matches { id, hire\_request\_id, user\_id, match\_score, status: \[pending|accepted|declined|hired\], created\_at } |
| :---- |

## **7.6 Business / Enterprise Models**

| businesses { id, owner\_user\_id, name, category, size\_range, location, subscription\_plan, subscription\_expires\_at, created\_at }business\_members { id, business\_id, user\_id, role\_assignment (role\_id), added\_at, status: \[active|removed\] } |
| :---- |

| 8\. Technical Architecture Recommended Stack & Implementation Guidelines |
| :---- |

## **8.1 Recommended Stack**

| Layer | Technology | Rationale |
| :---- | :---- | :---- |
| Frontend Web App (PWA) | Next.js (App Router) \+ TypeScript | Single responsive web codebase for learner, business, and admin experiences. Supports installable PWA behavior across modern mobile and desktop browsers. |
| UI System | Tailwind CSS \+ shadcn/ui | Accessible, reusable component primitives and consistent design tokens for rapid UI delivery and maintainability. |
| Backend API | Node.js \+ Fastify or Hono | Lightweight, fast REST API. Structured around domain modules (auth, learning, jobs, certs, business). |
| Database | PostgreSQL (Supabase) | Relational data. Supabase provides auth, storage, realtime, and row-level security out of the box. |
| CMS | Sanity.io | Structured content management for role curricula. GROQ query language. Non-dev editors can update content. |
| Payments | Paystack | Dominant payment gateway in Nigeria. Card, bank transfer, USSD. Webhooks for payment confirmation. |
| File Storage | Cloudinary or AWS S3 | Certificate image storage, audio file caching, user profile images. |
| Push Notifications | Firebase Cloud Messaging (FCM) or standards-based Web Push | Browser push for installed PWA and supported browsers; use fallback channels (SMS/email/in-app) where push is unavailable. |
| SMS | Termii (NG-first) | Nigerian SMS gateway. OTP, job alerts, re-engagement SMS. |
| TTS (Audio) | Google Cloud TTS | High-quality Nigerian English voice. Cache audio per content block. |
| Email | Resend | Transactional email. Developer-friendly. React Email for templates. |
| Analytics | PostHog (self-hosted or cloud) | Product analytics, funnel analysis, feature flags. Privacy-compliant. |
| Monitoring | Sentry \+ Uptime Robot | Error tracking and uptime monitoring. |

## **8.2 Web App & PWA Requirements**

* Build as mobile-first responsive UI with breakpoints for phone, tablet, and desktop.

* PWA manifest and install prompt: support "Add to Home Screen" on compatible browsers.

* Service worker strategy: cache static assets and shell routes; network-first for dynamic API data.

* Offline scope (MVP): last-viewed topic and learner progress queue available offline; sync on reconnect.

* Browser capability fallbacks: if push, background audio, or install prompt is unsupported, degrade gracefully to in-app notifications and SMS/email where configured.

* Performance budget: initial load optimized for low-bandwidth 3G/4G users in target markets.

## **8.3 Authentication**

* Primary: Phone number \+ OTP (Termii for delivery). Most accessible for target users.

* Secondary: Email \+ password for business accounts.

* Social login: Google sign-in (Phase 2).

* Session management: JWT (access token 15min) \+ refresh token (30 days) stored securely.

* Business accounts require email verification in addition to phone OTP.

## **8.4 Performance Requirements**

| Metric | Target |
| :---- | :---- |
| Content load time (topic page) | \< 2 seconds on 3G connection |
| API response time (p95) | \< 500ms for all non-generative endpoints |
| Certificate generation time | \< 10 seconds from exam pass to certificate available |
| Offline support | Last-viewed topic available offline; progress syncs on reconnect |
| Uptime target | 99.5% (allows \~3.6 hours downtime/month) |

## **8.5 Security Requirements**

* All API endpoints require authentication except: role catalogue (public), certificate verification (public), landing pages.

* Row-level security on all user data: users can only read/write their own records.

* Payment webhooks: verify Paystack HMAC signature on every webhook event.

* Certificate verification page: rate-limited to prevent enumeration (max 20 lookups/minute per IP).

* No PII in URLs: use UUIDs, never names or phone numbers in paths.

* GDPR-equivalent data handling: users can request full data export and account deletion.

| 9\. Monetisation Model Revenue Streams & Pricing Framework |
| :---- |

## **9.1 Revenue Streams**

| Stream | Who Pays | Indicative Price | Notes |
| :---- | :---- | :---- | :---- |
| Individual Course Credit Purchase | Learner buys credit per role enrolment | ₦2,000 – ₦5,000 per role (this is bought as credits, varies by role complexity) | Primary early revenue; low barrier to entry |
| Job Hub Subscription (Learners/Workers) | Learners/Worker pays to activate passive job matching | ₦1,000/month or ₦8,000/year | Recurring; high intent signal |
| Enterprise Package (Business) | Business pays for team-wide access to all curricula | ₦15,000–₦80,000/month based on seat count | Highest LTV; B2B sales motion |
| Hire Request (Employer) | Business pays per hire request posted to Job Hub | ₦3,000–₦10,000 per request (volume discounts) | Performance-aligned; scales with hiring activity |
| Individual Seat (Business) | Business pays for one worker's access to one role | ₦1,500 per seat per role | Entry-level B2B for small employers |

## **9.2 Enterprise Package Tiers**

| Tier | Seats | Price | Includes |
| :---- | :---- | :---- | :---- |
| Starter | Up to 5 workers | ₦15,000/month | All role access, basic dashboard, email support |
| Growth | Up to 20 workers | ₦40,000/month | All Starter features \+ Job Hub posting credits (3/month), priority support |
| Business | Up to 50 workers | ₦80,000/month | All Growth features \+ unlimited Job Hub requests, dedicated account manager, onboarding support |
| Custom / Enterprise+ | 50+ workers | Negotiated | Custom integrations, SLA, training analytics export |

| 10\. MVP Scope & Phased Roadmap What Gets Built First |
| :---- |

## **10.1 MVP (Phase 1 — Months 1–4)**

| Target: Prove the core learning → certification loop with 5 high-demand roles. Generate first revenue. Validate learner engagement and completion metrics. |
| :---- |

### **MVP Roles (15)**

* Cashier (Retail)

* Store Attendant / Store keeper

* Waiter / Waitress

* Bartender

* Cashier (F\&B)

* Food Vendor

* Customer Service Representative

* Sales Representative

* Cleaner / Janitor

* Facility manager

* Office Assistant

* Front desk manager

* Fleet officer

* Delivery Rider

* Salon Attendant

### **MVP Features**

* Role catalogue with 15 roles

* Web-first responsive PWA foundation (mobile, tablet, desktop)

* Full learning engine: Modules, Topics, Guides, Case Studies & Scenario based stories, Workflows

* Module Tests \+ Final Certification Exam

* Certificate generation and sharing (PNG \+ verification URL)

* Learner dashboard (progress, certificates, notifications)

* Paystack payment integration (individual course purchase)

* Phone number OTP authentication

* Basic gamification (XP, streaks, milestone notifications)

* Job Hub (worker subscription \+ employer hire requests \+ matching)

* Business Admin Panel \+ Enterprise Package

* Text-to-Audio (English)

* Roadmap Feature

* shadcn/ui-based component system for consistent, accessible UI primitives

### **Explicitly Out of MVP**

* Leaderboard (Phase 2\)

* ShopUrban Integration for hire requests

## **10.2 Phase 2 — Months 5–9**

* ShopUrban integration for hire requests

* Enhanced PWA capabilities (improved offline coverage, install prompts optimization, push delivery quality tuning)

## **10.3 Phase 3 — Months 10–18**

* Expand to 30+ roles across all 7 categories

* TTS in Pidgin, Yoruba, Igbo, Hausa

* Leaderboard and social features

* Ghana / Kenya market entry

* API for third-party integrations (payroll platforms, HR tools)

* Cohort-based learning (enterprise team learning together)

| 11\. Success Metrics KPIs & Measurement Framework |
| :---- |

## **11.1 North Star Metric**

| Number of learners who complete a role certification and are matched to a job within 90 days of certification. |
| :---- |

## **11.2 KPIs by Category**

| Category | Metric | Target | Source |
| :---- | :---- | :---- | :---- |
| Acquisition | New signups per week | 100 in Month 1; 500 in Month 3 | Mixpanel / PostHog |
| Activation | % of signups who enrol in a role within 7 days | \>40% | PostHog funnel |
| Engagement | Daily Active Users / Monthly Active Users ratio | \>20% | PostHog |
| Learning | Role completion rate (enrolled → certified) | \>35% at 90 days | Internal DB query |
| Revenue | Monthly Recurring Revenue (MRR) | ₦500K by Month 3 | Paystack dashboard |
| Job Hub | % of certified learners who subscribe to Job Hub | \>25% | Internal DB |
| B2B | Number of active Enterprise accounts | 5 by Month 6 | CRM |
| Retention | 30-day learner retention (any activity on Day 30\) | \>30% | PostHog |
| NPS | Net Promoter Score | \>40 | In-app survey (Typeform) |

| 12\. Open Questions & Decisions Required Items Requiring Product / Business Sign-Off |
| :---- |

| ID | Open Question |
| :---- | :---- |
| OQ-01 | Should Job Hub be free to browse and paid to apply/match, or paid to access entirely? Affects acquisition vs. monetisation balance. |
| OQ-02 | Will InTrainin create all curriculum content in-house, or partner with subject matter experts / industry bodies? This has major content quality and timeline implications. |
| OQ-03 | What is the certificate renewal policy? Does a Cashier certificate expire? If so, after how long, and what is the re-certification process? |
| OQ-04 | Should individual learners who are employed by an Enterprise subscriber also be able to use the platform for personal role exploration (outside their assigned role)? |
| OQ-05 | Is the ShopUrban integration bidirectional (InTrainin sends/receives data to/from ShopUrban) or one-directional (ShopUrban pushes hire requests to InTrainin only)? |
| OQ-06 | What is the data retention and privacy policy for test scores and performance data used by employers in hiring decisions? NDPA compliance required. |
| OQ-07 | Will the platform support instructor-led or cohort-based learning as a premium tier, or remain fully self-paced? |
| OQ-08 | What is the fraud prevention policy for certificate sharing? Can employers verify a certificate directly via API (not just the verification URL)? |

| 13\. Appendix Glossary, Assumptions & References |
| :---- |

## **13.1 Glossary**

| Term | Definition |
| :---- | :---- |
| LMS | Learning Management System — software for creating, delivering, and tracking training content |
| SME | Small and Medium Enterprise — businesses with fewer than 250 employees |
| TTS | Text-to-Speech — technology that converts written text into spoken audio |
| Job Hub | InTrainin's two-sided job-matching marketplace |
| Enterprise Package | B2B subscription that gives a business team access to all role curricula |
| Hire Request | A job posting submitted by an employer to the Job Hub |
| Verification Code | A unique ID on each certificate that anyone can check on the public verification page |
| Phase 1 Roles | The 5 roles launched with the MVP; marked with ★ in the role catalogue |
| Roadmap (Feature) | The in-app career path visualisation showing progression between roles |
| ShopUrban | The parent platform / marketplace that InTrainin integrates with for merchant hire requests |

## **13.2 Assumptions**

1. The majority of target learners own Android smartphones with intermittent 3G/4G access.

2. Paystack is available and sufficient for all payment use cases in Phase 1 (Nigeria only).

3. Curriculum content will be created by the InTrainin team (with SME review) before launch.

4. ShopUrban merchant data is accessible via API for Job Hub integration in Phase 2\.

5. NDPA (Nigeria Data Protection Act) compliance is required from launch; GDPR alignment is a Phase 2 goal.

6. All pricing listed is indicative and subject to market validation testing.

## **13.3 Document History**

| Version | Date | Notes |
| :---- | :---- | :---- |
| v1.0 | April 2026 | Initial PRD compiled from product overview. Expanded with implementation detail for Claude Code. |

InTrainin — Product Requirements Document   |   Confidential   |   v1.0

*This document is intended for the InTrainin product and engineering team. Do not distribute externally.*