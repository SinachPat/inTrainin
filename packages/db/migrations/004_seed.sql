-- =============================================================================
-- InTrainin — 004_seed.sql
-- Reference seed data: categories, 3 roles, curriculum, badges, progressions
-- Version: 1.0.0 | 2026-04
--
-- UUID CONVENTIONS (deterministic for FK consistency across deploys):
--   Categories:     a000000{n}-0000-0000-0000-000000000000
--   Roles:          b000000{n}-0000-0000-0000-000000000000
--   Modules:        c000000{n}-0000-0000-0000-000000000000
--   Topics:         d000000{n}-0000-0000-0000-000000000000 (01–12)
--   Tests:          e000000{n}-0000-0000-0000-000000000000 (01–09)
--   Badges:         f000000{n}-0000-0000-0000-000000000000
--   Progressions:   b1000000-0000-0000-0000-0000000000{n}
--
-- This seed is IDEMPOTENT — INSERT ... ON CONFLICT DO NOTHING so it can be
-- safely re-run without duplicating rows.
-- =============================================================================


-- =============================================================================
-- CATEGORIES  (7 — from the PRD)
-- =============================================================================
INSERT INTO categories (id, name, slug, icon_name, display_order) VALUES
  ('a0000001-0000-0000-0000-000000000000', 'Retail',               'retail',       'ShoppingCart',  1),
  ('a0000002-0000-0000-0000-000000000000', 'Food & Beverage',      'food-beverage','UtensilsCrossed',2),
  ('a0000003-0000-0000-0000-000000000000', 'Hospitality',          'hospitality',  'Hotel',          3),
  ('a0000004-0000-0000-0000-000000000000', 'Logistics',            'logistics',    'Truck',          4),
  ('a0000005-0000-0000-0000-000000000000', 'Beauty & Wellness',    'beauty',       'Sparkles',       5),
  ('a0000006-0000-0000-0000-000000000000', 'Admin & Office',       'admin',        'Briefcase',      6),
  ('a0000007-0000-0000-0000-000000000000', 'Cleaning & Facilities','cleaning',     'Brush',          7)
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- ROLES  (3 seed roles)
-- =============================================================================
INSERT INTO roles (id, category_id, title, slug, description, price_ngn, estimated_hours, is_published, free_preview_module_count, phase) VALUES

  -- Cashier (Retail)
  ('b0000001-0000-0000-0000-000000000000',
   'a0000001-0000-0000-0000-000000000000',
   'Cashier',
   'cashier',
   'Master POS operations, cash handling, and customer checkout service. Earn a verifiable certificate recognised by supermarkets, pharmacies, and retail chains across Nigeria.',
   2500, 4.0, true, 1, 1),

  -- Waiter / Waitress (Food & Beverage)
  ('b0000002-0000-0000-0000-000000000000',
   'a0000002-0000-0000-0000-000000000000',
   'Waiter / Waitress',
   'waiter-waitress',
   'Learn professional table service, menu knowledge, and guest experience management. Certified waitstaff are hired faster by restaurants, hotels, and events companies.',
   2500, 4.5, true, 1, 1),

  -- Delivery Rider (Logistics)
  ('b0000003-0000-0000-0000-000000000000',
   'a0000004-0000-0000-0000-000000000000',
   'Delivery Rider',
   'delivery-rider',
   'Build skills in route planning, package safety, and professional customer communication. A certified rider stands out on any delivery platform or in-house fleet.',
   2000, 3.5, true, 1, 1)

ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- MODULES  (2 per role = 6 total)
-- =============================================================================
INSERT INTO modules (id, role_id, title, order_index, is_published) VALUES

  -- Cashier modules
  ('c0000001-0000-0000-0000-000000000000', 'b0000001-0000-0000-0000-000000000000', 'POS Operations & Cash Handling',   1, true),
  ('c0000002-0000-0000-0000-000000000000', 'b0000001-0000-0000-0000-000000000000', 'Customer Service at Checkout',     2, true),

  -- Waiter modules
  ('c0000003-0000-0000-0000-000000000000', 'b0000002-0000-0000-0000-000000000000', 'Table Service Fundamentals',       1, true),
  ('c0000004-0000-0000-0000-000000000000', 'b0000002-0000-0000-0000-000000000000', 'Guest Experience & Upselling',     2, true),

  -- Delivery Rider modules
  ('c0000005-0000-0000-0000-000000000000', 'b0000003-0000-0000-0000-000000000000', 'Safe & Efficient Delivery',        1, true),
  ('c0000006-0000-0000-0000-000000000000', 'b0000003-0000-0000-0000-000000000000', 'Professionalism & Communication',  2, true)

ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- TOPICS  (3 per module = 18 total)
-- =============================================================================
INSERT INTO topics (id, module_id, title, content_type, order_index, estimated_minutes, is_published, content_body) VALUES

  -- ── Cashier / Module 1: POS Operations & Cash Handling ──────────────────────

  ('d0000001-0000-0000-0000-000000000000',
   'c0000001-0000-0000-0000-000000000000',
   'Operating the POS System',
   'guide', 1, 8, true,
   '{"sections":[{"heading":"What is a POS?","body":"A Point of Sale (POS) terminal is the machine used to process customer payments — card, transfer, or cash. Every transaction you complete goes through here."},{"heading":"Starting Your Shift","body":"Before the first customer arrives: log in with your cashier ID, confirm the till float matches the opening amount recorded in the handover book, and run a test transaction."},{"heading":"Processing a Sale","body":"Scan each item barcode. Confirm the total matches the customer expectation. Select the payment method. For card payments, insert or tap — never swipe unless prompted. Print the receipt."}],"key_points":["Always verify the float before opening","Never leave the POS screen unlocked when stepping away","If a transaction declines, never retry more than twice without supervisor approval"]}'::jsonb),

  ('d0000002-0000-0000-0000-000000000000',
   'c0000001-0000-0000-0000-000000000000',
   'Cash Counting & Float Management',
   'guide', 2, 7, true,
   '{"sections":[{"heading":"The Float","body":"The float is the starting cash in your till at the beginning of a shift — typically ₦5,000–₦20,000. It is not your money or the store''s profit. It exists purely to make change."},{"heading":"Counting Cash","body":"Count all notes in descending denomination order: ₦1,000, ₦500, ₦200, ₦100, ₦50. Count each denomination twice, separately. Record the total."},{"heading":"Variance","body":"A variance is when your counted total does not match the POS records. A variance of more than ₦200 must be reported to your supervisor immediately — never adjust the books yourself."}],"key_points":["Count cash away from customer view","Always double-count before confirming a total","Report any variance immediately — no matter how small"]}'::jsonb),

  ('d0000003-0000-0000-0000-000000000000',
   'c0000001-0000-0000-0000-000000000000',
   'End-of-Shift Cash Reconciliation',
   'workflow', 3, 6, true,
   '{"steps":[{"step":1,"title":"Print Z-Report","description":"At shift end, print the Z-report from the POS. This shows total sales, voids, and refunds for your session."},{"step":2,"title":"Count Till","description":"Remove cash from the till. Count all denominations. Subtract the opening float to get net cash received."},{"step":3,"title":"Compare to POS","description":"Your net cash should equal the POS cash total. Any gap is your variance."},{"step":4,"title":"Complete Handover Sheet","description":"Record your Z-report totals, counted cash, and variance on the handover sheet. Sign it."},{"step":5,"title":"Supervisor Sign-Off","description":"Hand the sheet and the cash bag to your supervisor. Get their signature. Your shift is officially closed."}],"key_points":["Never leave the till unattended during reconciliation","Both you and your supervisor must sign the handover sheet"]}'::jsonb),

  -- ── Cashier / Module 2: Customer Service at Checkout ──────────────────────

  ('d0000004-0000-0000-0000-000000000000',
   'c0000002-0000-0000-0000-000000000000',
   'Checkout Greeting & Etiquette',
   'guide', 1, 5, true,
   '{"sections":[{"heading":"First Impressions","body":"A customer reaching your checkout has already done the hard work. Your job is to make the final interaction smooth and pleasant. Acknowledge every customer within 10 seconds of them arriving at your till."},{"heading":"Standard Greeting","body":"Use a warm, clear greeting: ''Good morning/afternoon/evening, did you find everything you needed today?'' This opens a conversation without sounding scripted."},{"heading":"Closing the Transaction","body":"After payment: hand over the receipt, say ''Thank you for shopping with us'' and make brief eye contact. Do not start scanning the next customer before the current one has collected their bags."}],"key_points":["Acknowledge customers within 10 seconds","Never eat, use your phone, or have side conversations while serving","Make eye contact — it builds trust"]}'::jsonb),

  ('d0000005-0000-0000-0000-000000000000',
   'c0000002-0000-0000-0000-000000000000',
   'Handling a Price Discrepancy Complaint',
   'case_study', 2, 8, true,
   '{"scenario":"A customer presents a ₦1,200 jar of tomato paste. When scanned, the POS shows ₦1,500. The customer insists the shelf price was ₦1,200 and becomes visibly frustrated.","what_went_wrong":"The store did not update shelf labels after a price change. The customer has a legitimate grievance.","correct_response":{"step1":"Stay calm. Say: ''I understand — let me check that for you right away.''","step2":"Call your supervisor or price-check colleague on the radio. Never argue about price with the customer.","step3":"If a supervisor confirms the shelf error, honour the lower price and log the discrepancy.","step4":"Apologise sincerely: ''I''m sorry for the confusion — we will update the label immediately.'' "},"what_not_to_do":["Do not insist the POS is always correct","Do not dismiss the complaint","Do not make the customer wait more than 2 minutes without an update"],"learning_outcome":"Price errors are a store problem, not a customer problem. Your job is to de-escalate, verify, and honour a fair resolution."}'::jsonb),

  ('d0000006-0000-0000-0000-000000000000',
   'c0000002-0000-0000-0000-000000000000',
   'Processing Returns & Refunds',
   'workflow', 3, 7, true,
   '{"steps":[{"step":1,"title":"Verify Receipt","description":"Ask the customer for the original receipt. Without it, no refund is possible — politely explain the store policy."},{"step":2,"title":"Inspect the Item","description":"Check that the item is unused (or within the acceptable return condition per policy) and has original packaging."},{"step":3,"title":"Call Supervisor","description":"Cashiers typically cannot process refunds independently. Call your supervisor for authorisation before proceeding."},{"step":4,"title":"Process Refund","description":"With authorisation, select Refund on the POS. Scan the item. Confirm the amount. Issue refund to the original payment method where possible."},{"step":5,"title":"Log the Return","description":"Record the return in the return register: date, item, amount, reason, customer name if available, and supervisor initials."}],"key_points":["Never process a refund without supervisor approval","Always issue refunds to the original payment method","Log every return — missing logs create audit problems"]}'::jsonb),

  -- ── Waiter / Module 1: Table Service Fundamentals ──────────────────────────

  ('d0000007-0000-0000-0000-000000000000',
   'c0000003-0000-0000-0000-000000000000',
   'Table Setup & Mise en Place',
   'guide', 1, 7, true,
   '{"sections":[{"heading":"What is Mise en Place?","body":"''Mise en place'' is French for ''everything in its place.'' Before service begins, your station must be fully prepared so you can focus entirely on guests during service."},{"heading":"Standard Cover Setup","body":"Each place setting: dinner plate position (or space for it), fork to the left, knife to the right (blade facing in), spoon to the right of the knife, water glass above the knife tip, napkin folded on the plate or to the left of the fork."},{"heading":"Checking Your Station","body":"Before guests arrive: condiments filled and clean, menus clean and in order, specials board updated, ice bucket and water jug ready."}],"key_points":["A complete mise en place means zero scrambling during service","Check expiry dates on condiments at every setup","Report any broken crockery or glassware to the kitchen immediately"]}'::jsonb),

  ('d0000008-0000-0000-0000-000000000000',
   'c0000003-0000-0000-0000-000000000000',
   'Taking Orders Accurately',
   'guide', 2, 8, true,
   '{"sections":[{"heading":"Approaching the Table","body":"Approach within 2 minutes of guests being seated. Greet warmly, introduce yourself, and offer water. Give the menu and allow 2–3 minutes before returning for orders."},{"heading":"Writing Orders","body":"Use a notepad or POS handheld. Write the table number and seat positions (1, 2, 3...) so you can serve each guest without asking ''who had the chicken?''. Note modifications clearly: ''no onion'', ''sauce on side''."},{"heading":"Reading Back the Order","body":"After noting all orders, read them back to the table. This is your one chance to catch misunderstandings before the order reaches the kitchen."}],"key_points":["Always seat-position your orders — never ask who ordered what","Modifications must reach the kitchen word-for-word","If you are unsure about an item, ask the kitchen — never guess"]}'::jsonb),

  ('d0000009-0000-0000-0000-000000000000',
   'c0000003-0000-0000-0000-000000000000',
   'Food & Drink Service Sequence',
   'workflow', 3, 6, true,
   '{"steps":[{"step":1,"title":"Drinks First","description":"Always serve drinks before food. Take drink orders at the table, bring them promptly, then proceed to food orders."},{"step":2,"title":"Serve from the Left","description":"Food is served from the guest''s left side. Always announce what you are placing: ''Your grilled chicken, sir.''"},{"step":3,"title":"Ladies First, Elders First","description":"Where practical, serve ladies first, then elders, then others at the table. Maintain consistency at your establishment."},{"step":4,"title":"Check Back","description":"Return to the table 2 minutes after the first guest begins eating: ''Is everything to your satisfaction?'' This is your window to catch problems early."},{"step":5,"title":"Clear from the Right","description":"Remove finished plates from the guest''s right side, one plate at a time. Never stack plates visibly at the table."}],"key_points":["Serve left, clear right — always","Never reach across a guest","Check back within 2 minutes of food being served"]}'::jsonb),

  -- ── Waiter / Module 2: Guest Experience & Upselling ──────────────────────

  ('d000000a-0000-0000-0000-000000000000',
   'c0000004-0000-0000-0000-000000000000',
   'Menu Knowledge & Upselling',
   'guide', 1, 9, true,
   '{"sections":[{"heading":"Know Your Menu","body":"You must know every item on the menu: ingredients, preparation method, allergens, and portion size. Guests will ask. Saying ''I don''t know'' damages trust and costs sales."},{"heading":"Recommending Dishes","body":"Lead with enthusiasm: ''Our jollof rice is very popular today'' or ''The pepper soup is excellent — it is made fresh this morning.'' Personal recommendations feel authentic and help indecisive guests decide."},{"heading":"Upselling Without Pressure","body":"Upselling is offering a guest something that genuinely adds to their experience — not pushing unwanted items. ''Would you like a chilled drink with that?'' or ''We have a house dessert that goes perfectly with that'' are natural, non-pressured suggestions."}],"key_points":["Know every menu item before your shift","Upsell by describing the benefit to the guest, not the price","If a guest declines, accept graciously — never push twice"]}'::jsonb),

  ('d000000b-0000-0000-0000-000000000000',
   'c0000004-0000-0000-0000-000000000000',
   'Handling an Unhappy Guest',
   'case_study', 2, 10, true,
   '{"scenario":"A guest flags you down and says their food is cold. They are visibly unhappy and speak sharply. Other guests at nearby tables can hear the exchange.","what_went_wrong":"The kitchen was backed up, the dish sat too long under the lamp, and service was slower than normal tonight.","correct_response":{"step1":"Remain calm. Do not become defensive. Say: ''I am so sorry about that. Let me take care of it right away.''","step2":"Remove the plate immediately. Do not argue about whether the food was actually cold.","step3":"Go to the kitchen. Explain the situation to the chef. Request a fresh plate or reheating — whichever is faster and appropriate.","step4":"Return to the table with an update: ''Your dish is being prepared fresh — it will be about 5 minutes. Can I bring you a complimentary drink while you wait?''","step5":"When the food arrives, personally deliver it and confirm satisfaction within 2 minutes."},"what_not_to_do":["Do not say ''the kitchen is busy'' — that is your problem, not the guest''s","Do not offer a discount without manager approval","Do not ignore the table for more than 2 minutes after the complaint"],"learning_outcome":"A guest who has a complaint handled well is more loyal than one who had no complaint at all. Every recovery is a relationship-building opportunity."}'::jsonb),

  ('d000000c-0000-0000-0000-000000000000',
   'c0000004-0000-0000-0000-000000000000',
   'Closing a Table & End-of-Service',
   'workflow', 3, 5, true,
   '{"steps":[{"step":1,"title":"Present the Bill","description":"When the guest signals for the bill, bring it promptly in a bill folder. Never leave a guest waiting for the bill — it is the last impression of the service."},{"step":2,"title":"Process Payment","description":"Accept cash or card at the table. For card: use the portable POS. For cash: return change promptly in the bill folder. Never pocket change and wait to be asked."},{"step":3,"title":"Thank the Guests","description":"As guests prepare to leave: ''Thank you for dining with us — it was a pleasure. We hope to see you again soon.'' Make eye contact. Mean it."},{"step":4,"title":"Clear & Reset","description":"Clear the table completely. Wipe down with a clean cloth. Reset the cover for the next guests within 3 minutes of the previous party leaving."},{"step":5,"title":"End-of-Shift Sidework","description":"Restock your station, wipe all surfaces, fold napkins, and clean condiments. Leave your station as you would want to find it."}],"key_points":["The bill is part of the service — bring it promptly","Always return full change immediately","Reset the table within 3 minutes"]}'::jsonb),

  -- ── Delivery / Module 1: Safe & Efficient Delivery ─────────────────────────

  ('d000000d-0000-0000-0000-000000000000',
   'c0000005-0000-0000-0000-000000000000',
   'Route Planning & Navigation',
   'guide', 1, 7, true,
   '{"sections":[{"heading":"Before You Leave","body":"Before mounting your bike: review all deliveries for the shift, group them by proximity, and plan a logical sequence. A well-planned route saves fuel, time, and prevents the stress of criss-crossing the city."},{"heading":"Using Navigation Apps","body":"Google Maps and Apple Maps are your tools. Download offline maps for your delivery zones — data cuts out in traffic. Always set the destination before moving, never while riding."},{"heading":"When Routes Change","body":"Traffic, road closures, or new orders will change your plan. Re-route calmly. If a new order is added, check whether completing it is time-feasible before accepting."}],"key_points":["Plan your route before leaving the depot","Always download offline maps for your area","Never use your phone while the bike is moving — pull over first"]}'::jsonb),

  ('d000000e-0000-0000-0000-000000000000',
   'c0000005-0000-0000-0000-000000000000',
   'Package Handling & Proof of Delivery',
   'guide', 2, 6, true,
   '{"sections":[{"heading":"Receiving Packages","body":"Inspect every package before accepting it at pickup. Note any visible damage and photograph it. If a package is already damaged, report it before leaving — do not accept responsibility for damage you did not cause."},{"heading":"Safe Transport","body":"Fragile items (food, electronics, breakables) go in the front box or secured compartment first. Heavy items at the bottom. Nothing loose in the box."},{"heading":"Proof of Delivery (POD)","body":"POD protects you. Always: get the recipient''s signature on the app or paper form, photograph the delivered package at the door, and note any delivery notes (''left with security'', ''dropped at gate'')."}],"key_points":["Photograph all damage at pickup before accepting","Secure fragile items separately from heavy items","Always collect proof of delivery — it is your protection against disputes"]}'::jsonb),

  ('d000000f-0000-0000-0000-000000000000',
   'c0000005-0000-0000-0000-000000000000',
   'Completing a Delivery Run',
   'workflow', 3, 5, true,
   '{"steps":[{"step":1,"title":"Arrive at Drop-off","description":"Park safely — not blocking traffic or pedestrian access. Collect the correct package for this address. Double-check the recipient name against the label."},{"step":2,"title":"Contact the Recipient","description":"Call or text the recipient when you are 5 minutes away. This reduces wait time and failed deliveries."},{"step":3,"title":"Hand Over the Package","description":"Greet the recipient professionally. Hand over the package carefully. For food: ensure packaging is intact before handing over."},{"step":4,"title":"Collect Proof of Delivery","description":"Get the signature or take a photo (depending on platform requirements). Mark the delivery as complete in the app immediately."},{"step":5,"title":"Move to Next Drop","description":"Only leave after confirming the delivery is logged. Proceed to the next address using your planned route."}],"key_points":["Call ahead 5 minutes before arrival","Always verify recipient name against label","Log the completion before leaving the drop-off point"]}'::jsonb),

  -- ── Delivery / Module 2: Professionalism & Communication ──────────────────

  ('d0000010-0000-0000-0000-000000000000',
   'c0000006-0000-0000-0000-000000000000',
   'Customer Communication Standards',
   'guide', 1, 6, true,
   '{"sections":[{"heading":"Your Voice is Your Brand","body":"As a delivery rider, you are often the only human face of the company the customer sees. How you speak and behave determines whether they use the service again."},{"heading":"Communication Rules","body":"Always identify yourself: ''Good afternoon, this is Emeka from [company], I have your delivery.'' Speak clearly. Never use slang or be overly familiar with a customer you do not know. Keep calls brief and professional."},{"heading":"Handling Delays","body":"If you are running late: call the customer proactively. Do not wait for them to chase you. Say: ''I apologise — I am stuck in traffic on Lekki Expressway. I estimate I will arrive in 15 minutes.'' Customers respect honesty over silence."}],"key_points":["Identify yourself on every call","Proactively communicate delays — never let the customer chase you","Keep all customer interactions courteous regardless of their tone"]}'::jsonb),

  ('d0000011-0000-0000-0000-000000000000',
   'c0000006-0000-0000-0000-000000000000',
   'Handling a Failed or Disputed Delivery',
   'case_study', 2, 9, true,
   '{"scenario":"You arrive at a delivery address. The recipient claims they never received the package, but your app shows the delivery was completed and you have a photo of the package at a door. The customer is angry and demanding a refund.","what_went_wrong":"The delivery photo shows the correct address plate, but the package may have been taken by a third party (neighbour, security) without the recipient''s knowledge.","correct_response":{"step1":"Stay calm. Do not argue. Say: ''I understand your frustration. Let me help resolve this.''","step2":"Show the customer the delivery photo and timestamp in your app.","step3":"Ask: ''Is there a security guard or neighbour who may have accepted it on your behalf?''","step4":"If the package is located, the matter is closed. If not, escalate to your dispatcher immediately — do not try to resolve a refund yourself.","step5":"File a full incident report with your dispatcher: time, address, POD photo, and a written account."},"what_not_to_do":["Do not offer to pay for the package yourself","Do not leave without filing an incident report","Do not argue or accuse the customer of lying"],"learning_outcome":"Your proof of delivery evidence and incident report are your professional protection. File them thoroughly every time."}'::jsonb),

  ('d0000012-0000-0000-0000-000000000000',
   'c0000006-0000-0000-0000-000000000000',
   'Incident Reporting & End-of-Day Process',
   'workflow', 3, 5, true,
   '{"steps":[{"step":1,"title":"Log All Incidents During Shift","description":"Any accident, near-miss, damaged package, failed delivery, or customer complaint must be logged in real time using the incident log form in your app or paper book."},{"step":2,"title":"Return All Undelivered Items","description":"At shift end, return all undelivered packages to the depot. Never take packages home. Record each undelivered item and the reason on the returns sheet."},{"step":3,"title":"Fuel & Vehicle Check","description":"Record the ending fuel level. Report any vehicle damage, tyre issues, or mechanical concerns to your fleet manager before leaving — never leave a problem for the next rider."},{"step":4,"title":"Submit Daily Completion Report","description":"Fill in the daily completion report: total deliveries attempted, completed, failed, and any incidents. Submit it to your dispatcher before leaving."},{"step":5,"title":"Clean Your Compartment","description":"Remove all packaging, wrappers, or leftover materials from your delivery box. Leave the vehicle clean for the next shift."}],"key_points":["Log incidents in real time — memory fades","Return all undelivered packages the same day","Never leave a vehicle problem unreported"]}'::jsonb)

ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- TESTS  (1 module test per module = 6, + 1 final per role = 3; total = 9)
-- =============================================================================

-- ── Cashier Module 1 Test ─────────────────────────────────────────────────────
INSERT INTO tests (id, module_id, role_id, test_type, title, pass_mark_pct, time_limit_minutes, cooldown_hours, questions)
VALUES (
  'e0000001-0000-0000-0000-000000000000',
  'c0000001-0000-0000-0000-000000000000',
  NULL, 'module',
  'POS Operations & Cash Handling — Module Test',
  70, 10, 24,
  '[
    {
      "id": "q1",
      "question": "What does POS stand for?",
      "options": ["Point of Sale", "Point of Service", "Point of Stock", "Point of System"],
      "correct": 0,
      "explanation": "POS stands for Point of Sale — the terminal where customer payment transactions are processed."
    },
    {
      "id": "q2",
      "question": "You count your till at shift end and find it is ₦500 short of the POS total. What should you do first?",
      "options": ["Add ₦500 from your own money to balance", "Report the variance to your supervisor immediately", "Recount the till and hope the number changes", "Ignore it — small variances are normal and expected"],
      "correct": 1,
      "explanation": "Any variance — no matter the size — must be reported to your supervisor immediately. Never adjust the books yourself."
    },
    {
      "id": "q3",
      "question": "A customer''s card transaction declines at the POS. What is the correct next step?",
      "options": ["Retry the transaction five times until it works", "Ask the customer to try a different payment method or retry once", "Manually override the terminal to force the payment through", "Tell the customer their card is blocked"],
      "correct": 1,
      "explanation": "Offer one retry or an alternative payment method. Never retry more than twice without supervisor approval, and never claim to know why a card declined."
    }
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ── Cashier Module 2 Test ─────────────────────────────────────────────────────
INSERT INTO tests (id, module_id, role_id, test_type, title, pass_mark_pct, time_limit_minutes, cooldown_hours, questions)
VALUES (
  'e0000002-0000-0000-0000-000000000000',
  'c0000002-0000-0000-0000-000000000000',
  NULL, 'module',
  'Customer Service at Checkout — Module Test',
  70, 10, 24,
  '[
    {
      "id": "q1",
      "question": "How quickly should you acknowledge a customer who arrives at your till?",
      "options": ["Within 30 seconds", "Within 10 seconds", "Only after finishing your current task completely", "When they speak to you first"],
      "correct": 1,
      "explanation": "Acknowledge every customer within 10 seconds of them arriving at your till — even if you are still serving the previous customer."
    },
    {
      "id": "q2",
      "question": "A customer complains that a shelf price is lower than the scanned price. What should you do?",
      "options": ["Tell the customer the POS is always correct", "Call your supervisor to verify and honour the lower price if the shelf is wrong", "Ask the customer to go back to the shelf and photograph it as proof", "Charge the higher price and offer to escalate later"],
      "correct": 1,
      "explanation": "Price errors are the store''s responsibility. Call your supervisor, verify the shelf, and honour the lower price if it is a genuine labelling error."
    },
    {
      "id": "q3",
      "question": "A customer wants to return an item. They do not have a receipt. What is the correct action?",
      "options": ["Accept the return and process the refund anyway", "Politely explain the store''s no-receipt return policy and call your supervisor", "Refuse the return outright without explanation", "Exchange it for a different item without further process"],
      "correct": 1,
      "explanation": "Without a receipt, follow store policy — typically no refund. Explain politely and involve your supervisor. Never make exceptions alone."
    }
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ── Cashier Final Exam ────────────────────────────────────────────────────────
INSERT INTO tests (id, module_id, role_id, test_type, title, pass_mark_pct, time_limit_minutes, cooldown_hours, questions)
VALUES (
  'e0000003-0000-0000-0000-000000000000',
  NULL,
  'b0000001-0000-0000-0000-000000000000',
  'final',
  'Cashier — Final Certification Exam',
  70, 20, 48,
  '[
    {
      "id": "q1",
      "question": "At the start of every shift, what is the first thing a cashier must verify?",
      "options": ["That the store is clean", "That the opening float matches the recorded amount", "That the POS receipt paper is loaded", "That the queue barriers are in place"],
      "correct": 1,
      "explanation": "Verifying the opening float is the first duty — it establishes a clean baseline for end-of-shift reconciliation."
    },
    {
      "id": "q2",
      "question": "Which of the following is a correct step in the end-of-shift reconciliation process?",
      "options": ["Pocket surplus cash as a tip", "Subtract the opening float from your total counted cash to get net cash received", "Estimate the total without counting individual denominations", "Leave the till unlocked for the next cashier to verify"],
      "correct": 1,
      "explanation": "Net cash = total counted − opening float. This must equal the POS cash sales total. Any difference is a variance to be reported."
    },
    {
      "id": "q3",
      "question": "A customer becomes aggressive about a pricing error. The correct first response is to:",
      "options": ["Match their energy to establish authority", "Remain calm, apologise, and involve your supervisor", "Give an immediate discount without authorisation to calm them", "Ask them to leave and return when they are calm"],
      "correct": 1,
      "explanation": "De-escalation begins with calm acknowledgement. Involve your supervisor — never make financial decisions (discounts, refunds) without authorisation."
    },
    {
      "id": "q4",
      "question": "When processing a card refund, where should the refund go?",
      "options": ["To the customer in cash regardless of original payment", "To the original payment method where possible", "To a store credit voucher by default", "To whichever method is fastest for the cashier"],
      "correct": 1,
      "explanation": "Refunds should be returned to the original payment method. This prevents fraud and is standard retail practice."
    },
    {
      "id": "q5",
      "question": "What document must both the cashier and supervisor sign at the end of every shift?",
      "options": ["The daily sales report only", "The handover sheet", "The stock receiving note", "The staff attendance register"],
      "correct": 1,
      "explanation": "The handover sheet records the Z-report totals, counted cash, and any variance. Both signatures make the record official and protect both parties."
    }
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ── Waiter Module 1 Test ──────────────────────────────────────────────────────
INSERT INTO tests (id, module_id, role_id, test_type, title, pass_mark_pct, time_limit_minutes, cooldown_hours, questions)
VALUES (
  'e0000004-0000-0000-0000-000000000000',
  'c0000003-0000-0000-0000-000000000000',
  NULL, 'module',
  'Table Service Fundamentals — Module Test',
  70, 10, 24,
  '[
    {
      "id": "q1",
      "question": "Where is the fork placed in a standard table cover?",
      "options": ["To the right of the plate", "To the left of the plate", "Above the plate", "Directly on the napkin"],
      "correct": 1,
      "explanation": "The fork is placed to the left of the plate in a standard Western cover setting."
    },
    {
      "id": "q2",
      "question": "When taking a food order, what is the main purpose of noting seat positions?",
      "options": ["To bill different guests separately", "So you can serve each guest without asking who ordered what", "To record how many people are at the table", "For the kitchen to know plate presentation order"],
      "correct": 1,
      "explanation": "Seat positioning prevents the embarrassing ''who had the chicken?'' moment. Each order is mapped to a seat number so service is smooth and professional."
    },
    {
      "id": "q3",
      "question": "At which point should you check back with a table after food is served?",
      "options": ["After 10 minutes when plates should be nearly empty", "Within 2 minutes of the first guest beginning to eat", "Only if the guests signal you", "At the end of the meal during billing"],
      "correct": 1,
      "explanation": "Checking back within 2 minutes catches problems early — while you can still fix them. Waiting longer means problems fester into complaints."
    }
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ── Waiter Module 2 Test ──────────────────────────────────────────────────────
INSERT INTO tests (id, module_id, role_id, test_type, title, pass_mark_pct, time_limit_minutes, cooldown_hours, questions)
VALUES (
  'e0000005-0000-0000-0000-000000000000',
  'c0000004-0000-0000-0000-000000000000',
  NULL, 'module',
  'Guest Experience & Upselling — Module Test',
  70, 10, 24,
  '[
    {
      "id": "q1",
      "question": "A guest asks what you recommend on the menu. You are unsure about one dish. What should you do?",
      "options": ["Guess confidently to avoid appearing unknowledgeable", "Say you do not know and change the subject", "Recommend items you know well and offer to ask the kitchen about the unfamiliar dish", "Tell the guest all dishes are equally good"],
      "correct": 2,
      "explanation": "Honesty builds trust. Confidently recommend what you know; for uncertain items, offer to check with the kitchen — guests respect that."
    },
    {
      "id": "q2",
      "question": "A guest complains that their food is cold. What is the correct first response?",
      "options": ["Tell them the kitchen was very busy tonight", "Apologise calmly and remove the plate to have it corrected immediately", "Ask them if they are sure it is cold before acting", "Offer an immediate discount without manager approval"],
      "correct": 1,
      "explanation": "Do not argue or explain — apologise, act. Remove the plate and resolve it. Discounts require manager approval."
    },
    {
      "id": "q3",
      "question": "How quickly should you reset a table after guests leave?",
      "options": ["Within 10 minutes", "Before the next shift", "Within 3 minutes", "Only when the next guests arrive"],
      "correct": 2,
      "explanation": "A 3-minute reset target keeps the restaurant turning tables efficiently and ensures a clean presentation for arriving guests."
    }
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ── Waiter Final Exam ─────────────────────────────────────────────────────────
INSERT INTO tests (id, module_id, role_id, test_type, title, pass_mark_pct, time_limit_minutes, cooldown_hours, questions)
VALUES (
  'e0000006-0000-0000-0000-000000000000',
  NULL,
  'b0000002-0000-0000-0000-000000000000',
  'final',
  'Waiter / Waitress — Final Certification Exam',
  70, 20, 48,
  '[
    {
      "id": "q1",
      "question": "''Mise en place'' means:",
      "options": ["Clean as you go", "Everything in its place", "First in, first out", "Set the table after guests arrive"],
      "correct": 1,
      "explanation": "Mise en place — French for ''everything in its place'' — is the principle of fully preparing your station before service begins."
    },
    {
      "id": "q2",
      "question": "In what order should you ideally serve guests at a table?",
      "options": ["Whoever asks first", "Ladies first, then elders, then others", "Clockwise starting from seat 1", "The host last"],
      "correct": 1,
      "explanation": "The standard courtesy order is ladies first, then elders, then remaining guests. Consistency is key — apply it uniformly at your establishment."
    },
    {
      "id": "q3",
      "question": "Food should be served from the guest''s _____ and cleared from their _____.",
      "options": ["Right; left", "Left; right", "Left; left", "Right; right"],
      "correct": 1,
      "explanation": "Serve from the left, clear from the right. This is the professional standard in formal service and prevents awkward reaches over guests."
    },
    {
      "id": "q4",
      "question": "An unhappy guest''s complaint handled well typically results in:",
      "options": ["A guaranteed poor review regardless", "A guest who is more loyal than one with no complaint", "The guest leaving immediately without paying", "Loss of the table for the rest of the evening"],
      "correct": 1,
      "explanation": "Service recovery done right creates loyalty. A guest who saw you solve a problem remembers the quality of your response, not just the original issue."
    },
    {
      "id": "q5",
      "question": "When presenting the bill, the correct approach is:",
      "options": ["Leave it on the table and walk away immediately", "Bring it promptly in a bill folder when requested; return change immediately", "Wait until the guest asks for it twice before bringing it", "Add a service charge without informing the guest"],
      "correct": 1,
      "explanation": "The bill is the final impression. Bring it promptly, handle payment professionally, and return change immediately — never make the guest ask for it."
    }
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ── Delivery Module 1 Test ────────────────────────────────────────────────────
INSERT INTO tests (id, module_id, role_id, test_type, title, pass_mark_pct, time_limit_minutes, cooldown_hours, questions)
VALUES (
  'e0000007-0000-0000-0000-000000000000',
  'c0000005-0000-0000-0000-000000000000',
  NULL, 'module',
  'Safe & Efficient Delivery — Module Test',
  70, 10, 24,
  '[
    {
      "id": "q1",
      "question": "Before accepting a package at pickup, you notice the packaging is already damaged. What should you do?",
      "options": ["Accept it and deliver anyway — damage is the sender''s problem", "Photograph the damage and report it before accepting responsibility", "Refuse to carry it regardless of the situation", "Re-wrap it yourself and proceed"],
      "correct": 1,
      "explanation": "Photograph existing damage before accepting. This protects you from being blamed for damage you did not cause."
    },
    {
      "id": "q2",
      "question": "What is Proof of Delivery (POD) and why does it matter?",
      "options": ["A fuel receipt showing you made the trip", "Evidence (signature, photo) that the package reached the recipient — it protects you from disputes", "A text message from the customer saying thank you", "Your dispatcher''s confirmation that the order was assigned"],
      "correct": 1,
      "explanation": "POD is your professional protection. Without it, a disputed delivery becomes your word against the customer''s."
    },
    {
      "id": "q3",
      "question": "You are running 20 minutes late on a delivery. What is the professional action?",
      "options": ["Say nothing and deliver as quickly as possible", "Call the customer proactively to explain the delay and give an updated ETA", "Cancel the delivery to avoid a bad review", "Text the dispatcher only — the customer will figure it out"],
      "correct": 1,
      "explanation": "Proactive communication turns a frustrating situation into a manageable one. Customers respect honesty far more than silence."
    }
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ── Delivery Module 2 Test ────────────────────────────────────────────────────
INSERT INTO tests (id, module_id, role_id, test_type, title, pass_mark_pct, time_limit_minutes, cooldown_hours, questions)
VALUES (
  'e0000008-0000-0000-0000-000000000000',
  'c0000006-0000-0000-0000-000000000000',
  NULL, 'module',
  'Professionalism & Communication — Module Test',
  70, 10, 24,
  '[
    {
      "id": "q1",
      "question": "When calling a recipient, how should you open the call?",
      "options": ["''Your package is here'' and give the address", "''Good afternoon, this is [your name] from [company]. I have your delivery''", "''Hello, are you home?''", "Send a text instead of calling"],
      "correct": 1,
      "explanation": "Identify yourself and your company immediately. This is professional, builds trust, and reassures the customer before they open their door."
    },
    {
      "id": "q2",
      "question": "A customer claims they never received their package, but you have a delivery photo. What do you do first?",
      "options": ["Offer to replace the package at your own expense", "Show the customer the photo, ask if a neighbour or security accepted it, then escalate to your dispatcher", "Argue that your records prove delivery was made", "Ignore the complaint and move on"],
      "correct": 1,
      "explanation": "Stay calm, present your evidence, investigate the likely cause (third-party acceptance), and involve your dispatcher. Never try to resolve refund disputes yourself."
    },
    {
      "id": "q3",
      "question": "At the end of your shift, what must you do with all undelivered packages?",
      "options": ["Leave them secured on your bike overnight", "Return them to the depot and record each one on the returns sheet", "Attempt re-delivery on your own time", "Leave them with a nearby shopkeeper for safekeeping"],
      "correct": 1,
      "explanation": "Undelivered packages must be returned the same day. Taking them home or leaving them elsewhere creates liability and chain-of-custody problems."
    }
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- ── Delivery Final Exam ───────────────────────────────────────────────────────
INSERT INTO tests (id, module_id, role_id, test_type, title, pass_mark_pct, time_limit_minutes, cooldown_hours, questions)
VALUES (
  'e0000009-0000-0000-0000-000000000000',
  NULL,
  'b0000003-0000-0000-0000-000000000000',
  'final',
  'Delivery Rider — Final Certification Exam',
  70, 20, 48,
  '[
    {
      "id": "q1",
      "question": "The safest practice when using a navigation app on your bike is:",
      "options": ["Check the map at traffic lights while moving slowly", "Set your destination before moving; pull over if you need to change route", "Memorise the route and do not use the phone at all", "Have a passenger hold the phone so you can glance at it"],
      "correct": 1,
      "explanation": "Never use your phone while the bike is moving. Set the destination before you start, and pull over safely to make any changes."
    },
    {
      "id": "q2",
      "question": "When loading packages into your delivery box, what is the correct packing order?",
      "options": ["Lightest items first, heaviest on top", "Heaviest items at the bottom; fragile items secured separately", "Alphabetical by recipient surname", "Chronological by pickup time only"],
      "correct": 1,
      "explanation": "Heavy items at the bottom prevent crushing fragile packages. Secure fragile items separately to prevent movement during transit."
    },
    {
      "id": "q3",
      "question": "You experience a minor road accident during your shift. What must you do?",
      "options": ["Complete your remaining deliveries first, then report it at shift end", "Log the incident immediately and report it to your dispatcher before continuing", "Only report it if there was injury", "Handle it privately to avoid affecting your performance score"],
      "correct": 1,
      "explanation": "All incidents must be logged in real time. An unreported accident creates legal, insurance, and liability risks for both you and the company."
    },
    {
      "id": "q4",
      "question": "Proof of Delivery should include:",
      "options": ["A call log showing you rang the customer''s number", "Recipient signature or delivery photo with timestamp, logged in the app immediately", "Your dispatcher''s verbal confirmation", "A photo of the package before it leaves the depot"],
      "correct": 1,
      "explanation": "POD must be collected at the point of delivery and logged immediately. A pre-departure photo does not prove the package reached the recipient."
    },
    {
      "id": "q5",
      "question": "What should you do if your bike develops a mechanical fault during a shift?",
      "options": ["Continue delivering — it is probably fine", "Report it to the fleet manager before leaving at end of shift and do not leave a problem unreported", "Attempt to fix it yourself on the roadside", "Park it and take public transport to complete deliveries"],
      "correct": 1,
      "explanation": "Report mechanical issues to your fleet manager before leaving — never leave a vehicle problem for the next rider. Their safety and your liability are at stake."
    }
  ]'::jsonb
) ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- BADGES  (5)
-- trigger_type values consumed by the gamification engine:
--   'module_completed'  → check xp events for module completion count
--   'streak_days'       → check streak_current on users table
--   'test_score'        → check score_pct on test_attempts
--   'roles_enrolled'    → check enrollment count across distinct roles
--   'certificate_issued'→ check certificates issued count
-- =============================================================================
INSERT INTO badges (id, slug, name, description, trigger_type, trigger_value) VALUES

  ('f0000001-0000-0000-0000-000000000000',
   'first_module',
   'First Step',
   'Awarded for completing your first module on InTrainin.',
   'module_completed',
   '{"count": 1}'::jsonb),

  ('f0000002-0000-0000-0000-000000000000',
   'seven_day_streak',
   '7-Day Streak',
   'Awarded for learning on InTrainin for 7 consecutive days.',
   'streak_days',
   '{"days": 7}'::jsonb),

  ('f0000003-0000-0000-0000-000000000000',
   'top_score',
   'Sharp Mind',
   'Awarded for scoring 90% or above on any test on your first attempt.',
   'test_score',
   '{"min_pct": 90, "attempt_number": 1}'::jsonb),

  ('f0000004-0000-0000-0000-000000000000',
   'multi_role',
   'Versatile',
   'Awarded for enrolling in 2 or more role curricula.',
   'roles_enrolled',
   '{"count": 2}'::jsonb),

  ('f0000005-0000-0000-0000-000000000000',
   'first_cert',
   'Certified',
   'Awarded for earning your first InTrainin certificate.',
   'certificate_issued',
   '{"count": 1}'::jsonb)

ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- ROLE PROGRESSIONS
-- Career path edges between the 3 seed roles.
-- 'next'     = the natural next step in a career progression
-- 'adjacent' = a related role worth exploring laterally
-- =============================================================================
INSERT INTO role_progressions (id, from_role_id, to_role_id, progression_type, display_order) VALUES

  -- Cashier → Waiter/Waitress (adjacent — both are customer-facing retail roles)
  ('b1000000-0000-0000-0000-000000000001',
   'b0000001-0000-0000-0000-000000000000',
   'b0000002-0000-0000-0000-000000000000',
   'adjacent', 1),

  -- Cashier → Delivery Rider (adjacent — both require reliability & customer contact)
  ('b1000000-0000-0000-0000-000000000002',
   'b0000001-0000-0000-0000-000000000000',
   'b0000003-0000-0000-0000-000000000000',
   'adjacent', 2),

  -- Waiter → Cashier (adjacent — shared customer service skills)
  ('b1000000-0000-0000-0000-000000000003',
   'b0000002-0000-0000-0000-000000000000',
   'b0000001-0000-0000-0000-000000000000',
   'adjacent', 1),

  -- Delivery Rider → Cashier (next — riders often move to in-store roles)
  ('b1000000-0000-0000-0000-000000000004',
   'b0000003-0000-0000-0000-000000000000',
   'b0000001-0000-0000-0000-000000000000',
   'next', 1)

ON CONFLICT (id) DO NOTHING;
