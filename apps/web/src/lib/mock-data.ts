/**
 * Mock data for all InTrainin UI screens.
 * Swap for real API calls in Layer 3 (API integration).
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContentType = 'text' | 'guide' | 'case_study' | 'workflow'
export type TopicStatus = 'not_started' | 'in_progress' | 'completed'
export type TestType = 'module' | 'final'

export interface ContentSection { heading: string; body: string }
export interface ContentStep { step: number; title: string; description: string }

export interface ContentBody {
  sections?: ContentSection[]
  key_points?: string[]
  estimated_read_minutes?: number
  steps?: ContentStep[]
  scenario?: string
  what_went_wrong?: string
  correct_response?: Record<string, string>
  what_not_to_do?: string[]
  learning_outcome?: string
}

export interface Question {
  id: string
  question: string
  options: string[]
  correct: number
  explanation: string
}

export interface MockTest {
  id: string
  title: string
  testType: TestType
  passMarkPct: number
  timeLimitMinutes: number | null
  questions: Question[]
}

export interface MockTopic {
  id: string
  title: string
  contentType: ContentType
  contentBody: ContentBody
  estimatedMinutes: number
  orderIndex: number
}

export interface MockModule {
  id: string
  title: string
  orderIndex: number
  topics: MockTopic[]
  test: MockTest
}

export interface MockRole {
  slug: string
  title: string
  category: string
  icon: string
  priceNgn: number
  estimatedHours: number
  description: string
  about: string
  modules: MockModule[]
  finalExam: MockTest
  outcomes: string[]
}

export interface MockEnrollment {
  id: string
  roleSlug: string
  roleTitle: string
  categoryName: string
  enrolledAt: string
  completedTopicIds: string[]
  passedTestIds: string[]
}

export interface MockCertificate {
  id: string
  roleSlug: string
  roleTitle: string
  roleCategory: string
  holderName: string
  issuedAt: string
  verificationCode: string
  imageUrl: string | null
}

export interface MockBadge {
  slug: string
  name: string
  description: string
  icon: string
  earnedAt: string
}

export interface MockBusinessMember {
  id: string
  name: string
  phone: string
  jobTitle: string
  assignedRoleSlug: string | null
  assignedRoleTitle: string | null
  status: 'invited' | 'active' | 'removed'
  invitedAt: string
  joinedAt: string | null
  completedTopics: number
  totalTopics: number
  certificates: number
}

export interface MockJobMatch {
  id: string
  roleTitle: string
  roleCategory: string
  employer: string | null     // null = employer chose to remain anonymous
  locationCity: string
  payMin: number | null
  payMax: number | null
  startDate: string | null
  certificationRequired: boolean
  requirements: string | null
  postedAt: string
  status: 'pending' | 'accepted' | 'declined'
  matchScore: number
}

export interface MockHireRequest {
  id: string
  roleSlug: string
  roleTitle: string
  locationCity: string
  positionsCount: number
  payMin: number | null
  payMax: number | null
  startDate: string | null
  certificationRequired: boolean
  status: 'open' | 'filled' | 'closed' | 'draft'
  postedAt: string
  matchCount: number
}

export interface MockCandidate {
  id: string
  name: string
  locationCity: string
  roleTitle: string
  certified: boolean
  testScore: number | null
  availability: 'immediate' | 'two_weeks' | 'one_month'
  matchScore: number
  status: 'pending' | 'shortlisted' | 'hired' | 'rejected'
}

export interface MockRoadmapStep {
  roleSlug: string
  roleTitle: string
  icon: string
  status: 'completed' | 'in_progress' | 'locked'
}

export interface MockRoadmap {
  id: string
  title: string
  category: string
  description: string
  steps: MockRoadmapStep[]
}

// ─── User ─────────────────────────────────────────────────────────────────────

export const MOCK_USER = {
  id: 'usr-emeka-01',
  fullName: 'Emeka Johnson',
  phone: '+2348012345678',
  email: null as string | null,
  locationCity: 'Lagos',
  locationState: 'Lagos',
  careerGoalRoleSlug: 'cashier',
  accountType: 'learner' as const,
  streakCurrent: 5,
  streakDays: [true, true, true, true, true, false, false],
  jobHubSubscribed: false,
  jobHubExpiry: null as string | null,
  notificationPrefs: { push: true, sms: true, email: false },
}

// ─── Roles ────────────────────────────────────────────────────────────────────

export const MOCK_ROLES: MockRole[] = [
  {
    slug: 'cashier',
    title: 'Cashier',
    category: 'Retail & Store Operations',
    icon: '🛒',
    priceNgn: 2500,
    estimatedHours: 3.5,
    description: 'Master POS operations, cash handling, and customer checkout service.',
    about: 'The Cashier curriculum covers everything from operating a point-of-sale system to handling customer queries, counting change accurately, and closing out your register. Designed around the day-to-day reality of retail cashiers in Nigerian stores.',
    outcomes: [
      'Operate a POS terminal confidently for cash and card transactions',
      'Count and verify cash denominations without errors',
      'Handle customer complaints professionally at the checkout',
      'Identify and respond to counterfeit currency',
      'Perform accurate end-of-day till reconciliation',
      'Apply upselling techniques at the point of sale',
    ],
    modules: [
      {
        id: 'mod-cash-1',
        title: 'Module 1: Introduction to Cash Handling',
        orderIndex: 1,
        topics: [
          {
            id: 'top-cash-1-1',
            title: 'Your Role as a Cashier',
            contentType: 'text',
            estimatedMinutes: 5,
            orderIndex: 1,
            contentBody: {
              sections: [
                {
                  heading: 'What Does a Cashier Do?',
                  body: 'A cashier is the last point of contact between a customer and the store. Your job is to process transactions accurately, provide a positive final impression, and ensure the customer leaves satisfied. You are the face of the business at the most critical moment — when money changes hands.',
                },
                {
                  heading: 'Why Your Role Matters',
                  body: 'Studies show that 68% of customers who stop visiting a store do so because of poor service at the point of sale. A skilled cashier directly protects the revenue and reputation of their employer. Getting this role right opens doors to supervisory and management positions.',
                },
                {
                  heading: 'Your Daily Responsibilities',
                  body: 'Your typical day includes: opening your till and verifying the float, processing cash and card transactions, issuing receipts and change, handling customer questions at checkout, reporting discrepancies to your supervisor, and closing your till accurately at end of shift.',
                },
              ],
              key_points: [
                'Always greet customers when they approach your counter',
                'Never leave your till unattended and unlocked',
                'Report any discrepancy — no matter how small — to your supervisor immediately',
                'You are responsible for every naira in your till during your shift',
              ],
              estimated_read_minutes: 5,
            },
          },
          {
            id: 'top-cash-1-2',
            title: 'Operating the POS System',
            contentType: 'guide',
            estimatedMinutes: 8,
            orderIndex: 2,
            contentBody: {
              steps: [
                { step: 1, title: 'Log In to the System', description: 'Enter your unique cashier ID and PIN. Never share your login credentials with another staff member. Each transaction is logged under your ID.' },
                { step: 2, title: 'Verify Your Till Float', description: 'Count the float amount against the opening balance recorded on the till sheet. If there is a discrepancy, notify your supervisor before processing any transactions.' },
                { step: 3, title: 'Scan the Items', description: 'Pass each item\'s barcode under the scanner. Wait for the beep before moving to the next item. For loose items without barcodes, enter the PLU code manually.' },
                { step: 4, title: 'Announce the Total', description: 'Clearly state the total amount to the customer. Example: "Your total is one thousand, four hundred and fifty naira."' },
                { step: 5, title: 'Process the Payment', description: 'For cash: receive the money, place it on the till ledge (not inside the till yet), count change, hand over change first, then place the customer\'s cash in the till. For card: insert/tap card, wait for approval, hand receipt to customer.' },
                { step: 6, title: 'Issue the Receipt', description: 'Always offer a receipt. Some customers will decline — that is fine. But never skip offering it. The receipt is the customer\'s proof of purchase and your transaction record.' },
              ],
              estimated_read_minutes: 8,
            },
          },
          {
            id: 'top-cash-1-3',
            title: 'Counting Cash and Giving Change',
            contentType: 'workflow',
            estimatedMinutes: 6,
            orderIndex: 3,
            contentBody: {
              steps: [
                { step: 1, title: 'Receive and Place Cash on Ledge', description: 'Customer hands you ₦1,000. Place it on the till ledge — visible to both you and the customer. Do not put it in the till yet.' },
                { step: 2, title: 'State What You Received', description: 'Say aloud: "From one thousand naira." This confirms to the customer how much they gave and protects you from disputes.' },
                { step: 3, title: 'Calculate the Change', description: 'Total is ₦650. Change = ₦1,000 − ₦650 = ₦350. Use your POS display to verify. Never calculate change in your head without double-checking.' },
                { step: 4, title: 'Count Change Back to the Customer', description: 'Count the change into the customer\'s hand: "Fifty naira, one hundred, two hundred, three hundred and fifty." Count each denomination clearly.' },
                { step: 5, title: 'Confirm Acceptance', description: 'Customer accepts the change. Now place the customer\'s original note into the till. This sequence prevents disputes about whether you received the right amount.' },
                { step: 6, title: 'Close the Transaction', description: 'Issue the receipt, thank the customer, and close the till drawer immediately. Never leave your till drawer open.' },
              ],
            },
          },
        ],
        test: {
          id: 'test-cash-mod1',
          title: 'Module 1 Test: Cash Handling Basics',
          testType: 'module',
          passMarkPct: 70,
          timeLimitMinutes: 15,
          questions: [
            {
              id: 'q1',
              question: 'A customer gives you ₦2,000 for a purchase of ₦1,350. How much change should you give?',
              options: ['₦550', '₦650', '₦750', '₦850'],
              correct: 1,
              explanation: '₦2,000 − ₦1,350 = ₦650.',
            },
            {
              id: 'q2',
              question: 'When should you place a customer\'s cash into the till?',
              options: [
                'As soon as you receive it',
                'After you have counted and handed over the change',
                'After the customer has left',
                'Only at end of shift',
              ],
              correct: 1,
              explanation: 'Place cash in the till AFTER giving change. This prevents disputes about the denomination received.',
            },
            {
              id: 'q3',
              question: 'You notice a ₦200 discrepancy in your opening float. What should you do?',
              options: [
                'Add ₦200 from your own money to balance it',
                'Ignore it — small differences happen',
                'Notify your supervisor before processing any transactions',
                'Make a note and report it at end of shift',
              ],
              correct: 2,
              explanation: 'Any discrepancy must be reported to a supervisor before trading. You should not absorb it personally or trade through it.',
            },
            {
              id: 'q4',
              question: 'Which of these is the correct order for processing a cash transaction?',
              options: [
                'Scan items → take cash → give receipt → give change',
                'Scan items → announce total → receive cash → give change → give receipt',
                'Take cash → scan items → give change → give receipt',
                'Announce total → scan items → take cash → give change',
              ],
              correct: 1,
              explanation: 'The correct sequence: scan items, announce total, receive cash (place on ledge), count change, give change, place cash in till, give receipt.',
            },
            {
              id: 'q5',
              question: 'A colleague asks to borrow your till login because they forgot theirs. You should:',
              options: [
                'Share it quietly — you can change it later',
                'Refuse. Never share your login credentials with anyone',
                'Share it only if a supervisor is present',
                'Share it only if the colleague is senior to you',
              ],
              correct: 1,
              explanation: 'Login credentials are personal. Every transaction logged under your ID is your responsibility. Never share.',
            },
            {
              id: 'q6',
              question: 'What does PLU code stand for in retail?',
              options: [
                'Purchase Limit Unit',
                'Price Look-Up',
                'Product Level Update',
                'Point of Last Use',
              ],
              correct: 1,
              explanation: 'PLU stands for Price Look-Up — a numeric code used to identify loose or unpackaged items in a POS system.',
            },
            {
              id: 'q7',
              question: 'A customer disputes the change you gave them after you\'ve already put their cash in the till. The best response is:',
              options: [
                'Apologise and give them extra change to avoid conflict',
                'Tell them to come back later when you close your till',
                'Politely call your supervisor and do not touch the till until they arrive',
                'Count your till immediately and give them what they say they are owed',
              ],
              correct: 2,
              explanation: 'Never resolve till disputes without a supervisor. The till balance at the moment of dispute is evidence — do not disturb it.',
            },
            {
              id: 'q8',
              question: 'At what point should you offer a customer their receipt?',
              options: [
                'Only if they ask for one',
                'Only for transactions above ₦1,000',
                'Always — after every completed transaction',
                'Only for card payments',
              ],
              correct: 2,
              explanation: 'Always offer a receipt. The customer may decline, but you must always offer. It is the customer\'s proof of purchase.',
            },
            {
              id: 'q9',
              question: 'What is a till float?',
              options: [
                'The total sales for the day',
                'A starting cash amount placed in the till before trading begins',
                'The amount left in the till after closing',
                'A record of cash discrepancies',
              ],
              correct: 1,
              explanation: 'The float is a set amount of cash (usually in small denominations) placed in the till before opening so the cashier can give change from the first sale.',
            },
            {
              id: 'q10',
              question: 'Why should you announce the denomination received from a customer?',
              options: [
                'Store policy requires it',
                'To help you calculate change faster',
                'To confirm the amount to both you and the customer and prevent disputes',
                'So the supervisor can hear',
              ],
              correct: 2,
              explanation: 'Verbally confirming the denomination prevents disputes. If a customer later claims they gave ₦5,000 when they gave ₦2,000, your verbal confirmation — and the witness of other customers — protects you.',
            },
          ],
        },
      },
      {
        id: 'mod-cash-2',
        title: 'Module 2: Customer Service at Checkout',
        orderIndex: 2,
        topics: [
          {
            id: 'top-cash-2-1',
            title: 'Greeting and Engaging Customers',
            contentType: 'guide',
            estimatedMinutes: 5,
            orderIndex: 1,
            contentBody: {
              steps: [
                { step: 1, title: 'Make Eye Contact', description: 'As the customer approaches, make eye contact and smile. This signals that you are ready and welcoming.' },
                { step: 2, title: 'Greet Warmly', description: 'Use a warm, clear greeting: "Good afternoon! How are you?" Avoid monotone or rushed greetings.' },
                { step: 3, title: 'Acknowledge Their Items', description: 'A brief comment — "Let me get that scanned for you" — reassures the customer that you are focused on them.' },
                { step: 4, title: 'Keep Conversation Appropriate', description: 'Keep small talk friendly but brief. You have a queue to manage. A customer who feels acknowledged, not interrogated, is satisfied.' },
                { step: 5, title: 'Thank and Close', description: 'Always end with: "Thank you, have a lovely day." or "Thank you, see you again!" — even if the customer is in a rush.' },
              ],
              estimated_read_minutes: 5,
            },
          },
          {
            id: 'top-cash-2-2',
            title: 'Handling a Customer Complaint at Checkout',
            contentType: 'case_study',
            estimatedMinutes: 7,
            orderIndex: 2,
            contentBody: {
              scenario: 'You scan a customer\'s groceries and the total comes to ₦4,800. The customer insists that the cooking oil they bought is priced at ₦1,200 on the shelf, but it scanned as ₦1,500. They become visibly frustrated and say "You people are always overcharging!" Others in the queue are watching.',
              what_went_wrong: 'The shelf price and system price do not match. This is likely a price update error — the system price was updated but the shelf label was not. The customer has a legitimate grievance.',
              correct_response: {
                'Step 1 — Stay calm': 'Do not argue. Do not become defensive. Say: "I completely understand your concern, and I\'m sorry for the confusion."',
                'Step 2 — Acknowledge': '"The price on the shelf should match what you\'re charged — let me sort this out for you right now."',
                'Step 3 — Call a supervisor': 'Use your radio or call button: "Supervisor to till 3, please." Do not leave your till.',
                'Step 4 — Keep the queue moving': 'If another cashier is free, ask them to assist the next customer while you resolve this.',
                'Step 5 — Resolution': 'The supervisor will verify the shelf price. If confirmed, the lower price is honoured. Thank the customer for their patience.',
              },
              what_not_to_do: [
                'Do not argue about which price is correct — you do not make pricing decisions',
                'Do not make the adjustment yourself without supervisor authorisation',
                'Do not dismiss the complaint or imply the customer is wrong',
                'Do not raise your voice or match the customer\'s frustration',
              ],
              learning_outcome: 'A calm, structured response to pricing complaints — acknowledge, escalate correctly, resolve — converts a frustrated customer into a satisfied one. This directly protects store reputation.',
            },
          },
          {
            id: 'top-cash-2-3',
            title: 'Upselling at the Checkout',
            contentType: 'text',
            estimatedMinutes: 5,
            orderIndex: 3,
            contentBody: {
              sections: [
                {
                  heading: 'What is Upselling?',
                  body: 'Upselling means suggesting an additional or upgraded product to a customer who is already buying. At the checkout, this is subtle and conversational — never pushy. Examples: "We have a deal on batteries near the entrance — would you like to grab some?" or "This comes in a larger pack that saves you ₦200 — would that be better?"',
                },
                {
                  heading: 'Why Cashiers Upsell',
                  body: 'Cashiers who actively upsell can increase a store\'s daily revenue by 5–15% without any marketing spend. Managers notice this. Skilled cashiers who contribute to revenue are promoted faster and earn better pay.',
                },
                {
                  heading: 'How to Upsell Without Being Pushy',
                  body: 'The key is relevance. Suggest something that genuinely helps the customer. If they\'re buying bread, mention the new spread that\'s on offer. If they\'re buying a single battery, mention the multi-pack deal. Always frame it as helpful information, not pressure. And if they say no — accept it immediately and move on.',
                },
              ],
              key_points: [
                'Only suggest products genuinely relevant to what they\'re buying',
                'Always accept "no" gracefully — never push twice',
                'Keep it brief — you have a queue',
                'Know your store\'s current promotions before each shift',
              ],
              estimated_read_minutes: 5,
            },
          },
        ],
        test: {
          id: 'test-cash-mod2',
          title: 'Module 2 Test: Customer Service',
          testType: 'module',
          passMarkPct: 70,
          timeLimitMinutes: 15,
          questions: [
            {
              id: 'q1',
              question: 'A customer is angry about a pricing discrepancy. Your first response should be:',
              options: [
                'Explain why the system price is correct',
                'Tell them to come back another day',
                'Stay calm, acknowledge their concern, and call a supervisor',
                'Give them the lower price immediately to avoid conflict',
              ],
              correct: 2,
              explanation: 'Acknowledge first, then escalate. Never make pricing decisions without supervisor authorisation.',
            },
            {
              id: 'q2',
              question: 'Which of these is an example of effective upselling?',
              options: [
                '"You should buy more items."',
                '"This bread goes well with our spread that\'s currently on promotion — would you like one?"',
                '"Buy two and I\'ll give you a discount."',
                '"We have everything in the store."',
              ],
              correct: 1,
              explanation: 'Effective upselling is relevant, specific, and helpful — not generic or pressure-based.',
            },
            {
              id: 'q3',
              question: 'A customer declines your upsell suggestion. You should:',
              options: [
                'Try again with a different suggestion',
                'Accept immediately and proceed with their transaction',
                'Ask why they are not interested',
                'Mention the suggestion again after they pay',
              ],
              correct: 1,
              explanation: 'One suggestion only. Accepting "no" gracefully is a professional quality. Pushing twice damages trust.',
            },
            {
              id: 'q4',
              question: 'What is the correct greeting when a customer approaches your till?',
              options: [
                'Nod your head and wait for them to speak',
                '"Next!"',
                'Make eye contact, smile, and greet warmly: "Good afternoon! How are you?"',
                'Ask immediately what they want to buy',
              ],
              correct: 2,
              explanation: 'Warm, personalised greetings create positive first impressions at the critical checkout moment.',
            },
            {
              id: 'q5',
              question: 'While you are handling a customer complaint, the queue behind them grows. You should:',
              options: [
                'Rush through the complaint to move the queue faster',
                'Ask the queue to be patient, or signal another cashier to assist',
                'Ask the complaining customer to step aside and come back',
                'Ignore the queue — it is not your responsibility',
              ],
              correct: 1,
              explanation: 'Both the complainant and the queue deserve good service. If possible, signal another cashier to help without abandoning your current customer.',
            },
            {
              id: 'q6',
              question: 'A shelf shows ₦800 for a product that scans at ₦950. Who decides which price the customer pays?',
              options: [
                'You, the cashier',
                'The customer',
                'A supervisor, after verifying the shelf label',
                'The price scanner is always correct',
              ],
              correct: 2,
              explanation: 'Pricing decisions belong to a supervisor. The cashier\'s role is to escalate, not decide. Most stores honour the lower shelf price once verified.',
            },
            {
              id: 'q7',
              question: 'Why is it important to say "thank you" to every customer, even if they were difficult?',
              options: [
                'It is store policy',
                'It helps you feel better',
                'It closes the interaction professionally and encourages return visits',
                'It is required by law',
              ],
              correct: 2,
              explanation: 'A professional close — regardless of how the interaction went — leaves the customer with a positive final impression and increases the likelihood they return.',
            },
          ],
        },
      },
      {
        id: 'mod-cash-3',
        title: 'Module 3: Security and End of Day',
        orderIndex: 3,
        topics: [
          {
            id: 'top-cash-3-1',
            title: 'Identifying Counterfeit Notes',
            contentType: 'guide',
            estimatedMinutes: 7,
            orderIndex: 1,
            contentBody: {
              steps: [
                { step: 1, title: 'Check the Feel', description: 'Genuine naira notes have a distinct texture from the raised print. Counterfeits often feel flat or smooth. Run your thumb across the printing.' },
                { step: 2, title: 'Hold to Light — Security Thread', description: 'Hold the note up to light. Look for the embedded security thread running vertically. On genuine notes, it reads "CBN" and is woven into the paper.' },
                { step: 3, title: 'Check the Watermark', description: 'Hold the note to light and look for the watermark — an image of an eagle and the denomination number should appear.' },
                { step: 4, title: 'Check Colour-Shifting Ink', description: 'On ₦500 and ₦1000 notes, the CBN logo changes colour when tilted. Tilt the note and watch the logo shift from gold to green.' },
                { step: 5, title: 'Examine the Serial Number', description: 'Genuine notes have sharp, clean serial numbers. Counterfeits often have blurry, unevenly spaced, or slightly misaligned numbers.' },
                { step: 6, title: 'Do Not Accuse — Escalate', description: 'If you suspect a note is counterfeit, do NOT accuse the customer. Calmly call your supervisor. Say you need to verify the note. Let your supervisor handle what happens next.' },
              ],
              estimated_read_minutes: 7,
            },
          },
          {
            id: 'top-cash-3-2',
            title: 'End of Day Cash Reconciliation',
            contentType: 'workflow',
            estimatedMinutes: 8,
            orderIndex: 2,
            contentBody: {
              steps: [
                { step: 1, title: 'Wait for Supervisor Sign-Off', description: 'Never start reconciliation without your supervisor present or without their explicit instruction to close your till.' },
                { step: 2, title: 'Print the Z-Report', description: 'On your POS, print the Z-report (end of day report). This shows total sales by payment type — cash, card, voucher.' },
                { step: 3, title: 'Count All Cash', description: 'Remove all cash from the till and count it by denomination. Write down: ₦1,000 × 5 = ₦5,000; ₦500 × 8 = ₦4,000; etc. Total it up.' },
                { step: 4, title: 'Subtract the Float', description: 'Subtract your opening float from the total cash counted. The result should equal the Z-report cash total.' },
                { step: 5, title: 'Identify Any Variance', description: 'If your count differs from the Z-report: document the exact variance (+ or −). Do not adjust. Sign the reconciliation sheet with the actual figure.' },
                { step: 6, title: 'Complete the Till Sheet', description: 'Fill in the till reconciliation sheet: opening float, total cash counted, Z-report total, variance. Sign and hand to your supervisor.' },
                { step: 7, title: 'Hand Over Cash', description: 'Place counted cash (excluding float) into the cash bag or safe as per store procedure. Never take cash out of the store.' },
              ],
            },
          },
        ],
        test: {
          id: 'test-cash-mod3',
          title: 'Module 3 Test: Security & End of Day',
          testType: 'module',
          passMarkPct: 70,
          timeLimitMinutes: 12,
          questions: [
            {
              id: 'q1',
              question: 'You suspect a ₦1,000 note is counterfeit. You should:',
              options: [
                'Refuse it and tell the customer to leave',
                'Accept it to avoid conflict and report later',
                'Calmly call your supervisor without accusing the customer',
                'Tear it up in front of the customer',
              ],
              correct: 2,
              explanation: 'Never accuse a customer. Escalate to supervisor who will handle the situation correctly.',
            },
            {
              id: 'q2',
              question: 'On a genuine naira note, the CBN logo on ₦500 and ₦1000 notes:',
              options: [
                'Glows under UV light',
                'Changes colour when tilted',
                'Disappears when wet',
                'Shows a hologram of the president',
              ],
              correct: 1,
              explanation: 'Colour-shifting ink is a key security feature on higher denomination naira notes.',
            },
            {
              id: 'q3',
              question: 'What is a Z-report?',
              options: [
                'A list of all products in stock',
                'A record of staff attendance',
                'An end-of-day report showing total sales by payment type',
                'A report of all customer complaints',
              ],
              correct: 2,
              explanation: 'The Z-report is generated at end of day and shows the total transactions by payment method — used to reconcile the till.',
            },
            {
              id: 'q4',
              question: 'During reconciliation, your cash count is ₦200 MORE than the Z-report shows. You should:',
              options: [
                'Keep the extra ₦200',
                'Give the ₦200 to charity',
                'Document the +₦200 variance on the till sheet and inform your supervisor',
                'Recount until it matches',
              ],
              correct: 2,
              explanation: 'Always document the actual variance — positive or negative. Never "fix" it by removing or adding cash.',
            },
            {
              id: 'q5',
              question: 'When should you start end-of-day cash reconciliation?',
              options: [
                'When you feel like closing',
                'After the last customer',
                'Only when your supervisor is present or has explicitly instructed you to close',
                'At exactly 6pm every day',
              ],
              correct: 2,
              explanation: 'Reconciliation must happen with supervisor oversight. It is a security and accountability procedure.',
            },
          ],
        },
      },
    ],
    finalExam: {
      id: 'exam-cashier-final',
      title: 'Cashier Certification Exam',
      testType: 'final',
      passMarkPct: 75,
      timeLimitMinutes: 45,
      questions: [
        { id: 'fe1', question: 'What is the first action when you notice a discrepancy in your opening float?', options: ['Begin trading and note it', 'Notify supervisor before processing transactions', 'Add from your own money', 'Ignore if under ₦500'], correct: 1, explanation: 'Always report discrepancies before trading.' },
        { id: 'fe2', question: 'A customer gives ₦5,000 for a ₦3,750 purchase. Change owed is:', options: ['₦1,250', '₦2,250', '₦1,750', '₦1,500'], correct: 0, explanation: '₦5,000 − ₦3,750 = ₦1,250.' },
        { id: 'fe3', question: 'Colour-shifting ink on naira notes is found on:', options: ['All denominations', '₦500 and ₦1,000 only', '₦200 and below', '₦100 only'], correct: 1, explanation: 'Colour-shifting ink is a feature of higher-value naira notes.' },
        { id: 'fe4', question: 'The correct upselling approach at checkout is:', options: ['Suggest everything in the store', 'One relevant suggestion, accept "no" gracefully', 'Suggest the most expensive item', 'Ask the customer what else they want'], correct: 1, explanation: 'One relevant, helpful suggestion. Never push twice.' },
        { id: 'fe5', question: 'Before handing change to a customer, where should their cash be?', options: ['In the till', 'On the counter ledge', 'In your hand', 'Under the till'], correct: 1, explanation: 'Cash stays on the ledge until change is counted and handed over.' },
        { id: 'fe6', question: 'The Z-report is used for:', options: ['Counting inventory', 'End-of-day sales reconciliation', 'Clocking in staff', 'Recording customer complaints'], correct: 1, explanation: 'Z-report shows end-of-day totals used to reconcile the till.' },
        { id: 'fe7', question: 'When a customer complains about a pricing error, you should:', options: ['Apply the lower price yourself', 'Argue the system is correct', 'Acknowledge calmly and call a supervisor', 'Ask them to return later'], correct: 2, explanation: 'Acknowledge + escalate. Pricing decisions belong to supervisors.' },
        { id: 'fe8', question: 'What does the security thread in a genuine naira note do?', options: ['It glows in the dark', 'It reads "CBN" and is woven into the paper', 'It changes colour', 'It shows the denomination'], correct: 1, explanation: 'The security thread is embedded into the paper and reads "CBN" when held to light.' },
        { id: 'fe9', question: 'You should share your POS login credentials:', options: ['With trusted senior colleagues', 'With your supervisor only', 'With no one, ever', 'When a colleague forgets theirs'], correct: 2, explanation: 'Login credentials are personal and must never be shared.' },
        { id: 'fe10', question: 'A +₦500 variance in your till reconciliation means:', options: ['You gave ₦500 too much change', 'Your till has ₦500 more than expected', 'You have ₦500 shortage', 'The Z-report is wrong'], correct: 1, explanation: 'A positive variance means the physical cash exceeds the expected total.' },
      ],
    },
  },
  {
    slug: 'waiter-waitress',
    title: 'Waiter / Waitress',
    category: 'Food & Beverage',
    icon: '🍽️',
    priceNgn: 2500,
    estimatedHours: 4.0,
    description: 'Master table service, menu knowledge, and professional restaurant floor skills.',
    about: 'The Waiter / Waitress curriculum prepares you for professional service in restaurants, hotels, and events. Covers everything from setting a table correctly to handling a customer complaint about food — calmly and professionally.',
    outcomes: [
      'Take orders accurately using a service pad or POS',
      'Describe menu items and make relevant suggestions',
      'Manage multiple tables without errors',
      'Handle food and beverage complaints professionally',
      'Perform proper table clearing and reset procedures',
      'Apply upselling techniques without being pushy',
    ],
    modules: [
      {
        id: 'mod-wait-1',
        title: 'Module 1: Table Service Fundamentals',
        orderIndex: 1,
        topics: [
          {
            id: 'top-wait-1-1',
            title: 'The Role of a Waiter / Waitress',
            contentType: 'text',
            estimatedMinutes: 5,
            orderIndex: 1,
            contentBody: {
              sections: [
                { heading: 'What Your Role Means', body: 'A waiter or waitress is the primary point of contact for a guest from the moment they are seated until they leave. You represent the restaurant\'s entire service promise. Guests tip — and return — based on their interaction with you.' },
                { heading: 'Station Management', body: 'You will typically be assigned a station — a group of tables that are your responsibility. You must know exactly which tables are in your station and manage them simultaneously, ensuring no guest is ignored.' },
              ],
              key_points: [
                'Acknowledge every guest within 60 seconds of seating',
                'Know the menu inside out — including allergens and daily specials',
                'Your section is your responsibility — no guests left waiting',
                'Professional appearance matters: clean uniform, neat hair',
              ],
              estimated_read_minutes: 5,
            },
          },
          {
            id: 'top-wait-1-2',
            title: 'Taking Orders Correctly',
            contentType: 'guide',
            estimatedMinutes: 7,
            orderIndex: 2,
            contentBody: {
              steps: [
                { step: 1, title: 'Approach the Table Promptly', description: 'Aim to greet a new table within 2 minutes of seating. Smile, make eye contact, introduce yourself: "Good evening, my name is Chidi, I\'ll be taking care of you tonight."' },
                { step: 2, title: 'Take Drinks First', description: 'Always take drink orders before food. This gives guests time to review the menu while you prepare their drinks.' },
                { step: 3, title: 'Take Food Orders Systematically', description: 'Start with the most senior guest or the person who appears ready. Work around the table consistently — clockwise or counter-clockwise. Write down every order — never rely on memory for a table of 3+.' },
                { step: 4, title: 'Repeat the Order Back', description: 'Always repeat the full order back to the table before leaving. This catches mistakes before they reach the kitchen.' },
                { step: 5, title: 'Note Special Requests', description: 'Write down any modifications (no onions, extra spicy, allergies) and communicate them clearly to the kitchen. Allergy requests must be taken extremely seriously.' },
                { step: 6, title: 'Confirm Timings', description: 'Let the guest know approximately how long their food will take. If there will be a delay, proactively tell them before they ask.' },
              ],
              estimated_read_minutes: 7,
            },
          },
          {
            id: 'top-wait-1-3',
            title: 'Serving Food and Clearing Tables',
            contentType: 'workflow',
            estimatedMinutes: 6,
            orderIndex: 3,
            contentBody: {
              steps: [
                { step: 1, title: 'Announce the Dish', description: 'When serving, announce the dish: "Grilled chicken with jollof rice for the lady?" Never place a dish in front of a guest without confirming it is their order.' },
                { step: 2, title: 'Serve in the Correct Order', description: 'Serve ladies first, then gentlemen, then children. At a business table, follow seniority if apparent.' },
                { step: 3, title: 'Check Back After First Bites', description: 'Return to the table approximately 2 minutes after serving food. Ask: "Is everything okay with your meals?" This is your chance to catch problems before they become complaints.' },
                { step: 4, title: 'Clear Used Items', description: 'Clear empty plates only after everyone at the table has finished. Never clear while one guest is still eating — it is poor form.' },
                { step: 5, title: 'Reset the Table', description: 'Once all guests have left, clear all items, wipe the table, and reset cutlery, napkins, and condiments to the standard layout. A reset table is ready for the next guests within 3 minutes.' },
              ],
            },
          },
        ],
        test: {
          id: 'test-wait-mod1',
          title: 'Module 1 Test: Table Service',
          testType: 'module',
          passMarkPct: 70,
          timeLimitMinutes: 12,
          questions: [
            { id: 'q1', question: 'How soon should you greet a newly seated table?', options: ['5 minutes', 'When they wave at you', 'Within 2 minutes', 'After they finish reading the menu'], correct: 2, explanation: 'Guest acknowledgement within 2 minutes of seating is the service standard.' },
            { id: 'q2', question: 'At a table of 4 guests, you should take orders:', options: ['From whoever speaks first', 'Starting with the most senior or ready guest, systematically around the table', 'Ladies first, then gentlemen', 'In alphabetical order of their names'], correct: 1, explanation: 'Systematic order-taking prevents confusion about who ordered what.' },
            { id: 'q3', question: 'When serving food to a mixed table of adults:', options: ['Serve the most expensive dish first', 'Serve the host first', 'Serve ladies first, then gentlemen', 'Serve whoever is nearest to you'], correct: 2, explanation: 'Ladies first is the traditional service protocol at most restaurants.' },
            { id: 'q4', question: 'A guest mentions they are allergic to peanuts. You should:', options: ['Note it down and mention it to the kitchen', 'Suggest dishes without peanuts from memory', 'Write it down, communicate clearly to the kitchen, and confirm with the chef that the dish is safe', 'Ask them to inform the kitchen themselves'], correct: 2, explanation: 'Allergy information must be written, communicated explicitly to the kitchen, and confirmed safe. Verbal-only handling is insufficient.' },
            { id: 'q5', question: 'When should you begin clearing plates from a table?', options: ['As soon as one person finishes', 'After every guest has finished eating', 'When you need the space', 'Immediately when dishes are empty'], correct: 1, explanation: 'Clearing while a guest is still eating is considered poor service etiquette.' },
          ],
        },
      },
    ],
    finalExam: {
      id: 'exam-waiter-final',
      title: 'Waiter / Waitress Certification Exam',
      testType: 'final',
      passMarkPct: 75,
      timeLimitMinutes: 45,
      questions: [
        { id: 'fe1', question: 'A guest complains their food is cold. Your first response is:', options: ['Apologise and offer to replace it', 'Tell them it was hot when it left the kitchen', 'Ask them to wait while you check with the chef', 'Offer a discount instead'], correct: 0, explanation: 'Acknowledge and offer to make it right immediately. Do not argue.' },
        { id: 'fe2', question: 'You should repeat an order back to the table because:', options: ['It is company policy', 'It catches mistakes before they reach the kitchen', 'Guests enjoy hearing their order repeated', 'It shows you were listening'], correct: 1, explanation: 'Order confirmation is a practical error-prevention step.' },
      ],
    },
  },
]

// ─── Enrollments & Progress ────────────────────────────────────────────────────

export const MOCK_ENROLLMENTS: MockEnrollment[] = [
  {
    id: 'enr-1',
    roleSlug: 'cashier',
    roleTitle: 'Cashier',
    categoryName: 'Retail & Store Operations',
    enrolledAt: '2026-03-15T10:00:00Z',
    completedTopicIds: ['top-cash-1-1', 'top-cash-1-2', 'top-cash-1-3', 'top-cash-2-1'],
    passedTestIds: ['test-cash-mod1'],
  },
  {
    id: 'enr-2',
    roleSlug: 'waiter-waitress',
    roleTitle: 'Waiter / Waitress',
    categoryName: 'Food & Beverage',
    enrolledAt: '2026-03-28T14:00:00Z',
    completedTopicIds: ['top-wait-1-1'],
    passedTestIds: [],
  },
]

export const MOCK_TEST_ATTEMPTS = [
  { id: 'att-1', testId: 'test-cash-mod1', scorePct: 80, passed: true, attemptNumber: 1, takenAt: '2026-03-20T11:00:00Z' },
  { id: 'att-2', testId: 'test-cash-mod2', scorePct: 57, passed: false, attemptNumber: 1, takenAt: '2026-03-25T09:30:00Z' },
]

// ─── Certificates ─────────────────────────────────────────────────────────────

export const MOCK_CERTIFICATES: MockCertificate[] = [
  // No certificates yet for Emeka (final exam not passed)
]

// ─── Badges ───────────────────────────────────────────────────────────────────

export const MOCK_BADGES: MockBadge[] = [
  { slug: 'first_module', name: 'First Step', description: 'Completed your first module', icon: '⭐', earnedAt: '2026-03-20T11:01:00Z' },
  { slug: 'five_day_streak', name: '5-Day Streak', description: 'Learned for 5 days in a row', icon: '🔥', earnedAt: '2026-04-02T08:00:00Z' },
]

// ─── Roadmaps ─────────────────────────────────────────────────────────────────

export const MOCK_ROADMAPS: MockRoadmap[] = [
  {
    id: 'roadmap-retail',
    title: 'Retail Career Track',
    category: 'Retail & Store Ops',
    description: 'From cashier to retail supervisor — the certified path.',
    steps: [
      { roleSlug: 'cashier', roleTitle: 'Cashier', icon: '🛒', status: 'in_progress' },
      { roleSlug: 'store-keeper', roleTitle: 'Store Keeper', icon: '🧾', status: 'locked' },
      { roleSlug: 'retail-supervisor', roleTitle: 'Retail Supervisor', icon: '📋', status: 'locked' },
    ],
  },
  {
    id: 'roadmap-hospitality',
    title: 'Hospitality Track',
    category: 'Hospitality',
    description: 'Build a career in hotels and food service.',
    steps: [
      { roleSlug: 'waiter-waitress', roleTitle: 'Waiter / Waitress', icon: '🍽️', status: 'in_progress' },
      { roleSlug: 'hotel-receptionist', roleTitle: 'Hotel Receptionist', icon: '🏨', status: 'locked' },
      { roleSlug: 'fb-supervisor', roleTitle: 'F&B Supervisor', icon: '🍳', status: 'locked' },
    ],
  },
]

// ─── Business data ────────────────────────────────────────────────────────────

export const MOCK_BUSINESS = {
  id: 'biz-sunshine-01',
  name: 'Sunshine Supermart',
  category: 'Retail',
  locationCity: 'Abuja',
  plan: 'Starter' as const,
  planExpiry: '2026-12-31',
  seatLimit: 10,
  seatsUsed: 7,
  initials: 'SS',
}

export const MOCK_BUSINESS_MEMBERS: MockBusinessMember[] = [
  { id: 'mem-1', name: 'Adaeze Obi', phone: '+2348031111111', jobTitle: 'Cashier', assignedRoleSlug: 'cashier', assignedRoleTitle: 'Cashier', status: 'active', invitedAt: '2026-03-01T09:00:00Z', joinedAt: '2026-03-02T10:00:00Z', completedTopics: 6, totalTopics: 8, certificates: 1 },
  { id: 'mem-2', name: 'Biodun Afolabi', phone: '+2348032222222', jobTitle: 'Store Attendant', assignedRoleSlug: 'cashier', assignedRoleTitle: 'Cashier', status: 'active', invitedAt: '2026-03-01T09:00:00Z', joinedAt: '2026-03-03T11:00:00Z', completedTopics: 4, totalTopics: 8, certificates: 0 },
  { id: 'mem-3', name: 'Chisom Eze', phone: '+2348033333333', jobTitle: 'Cashier', assignedRoleSlug: 'cashier', assignedRoleTitle: 'Cashier', status: 'active', invitedAt: '2026-03-05T09:00:00Z', joinedAt: '2026-03-06T08:00:00Z', completedTopics: 8, totalTopics: 8, certificates: 1 },
  { id: 'mem-4', name: 'David Nwosu', phone: '+2348034444444', jobTitle: 'Supervisor', assignedRoleSlug: null, assignedRoleTitle: null, status: 'active', invitedAt: '2026-03-10T09:00:00Z', joinedAt: '2026-03-11T09:00:00Z', completedTopics: 0, totalTopics: 0, certificates: 0 },
  { id: 'mem-5', name: 'Ebele Okwu', phone: '+2348035555555', jobTitle: 'Cashier', assignedRoleSlug: 'cashier', assignedRoleTitle: 'Cashier', status: 'invited', invitedAt: '2026-04-01T09:00:00Z', joinedAt: null, completedTopics: 0, totalTopics: 8, certificates: 0 },
  { id: 'mem-6', name: 'Festus Bello', phone: '+2348036666666', jobTitle: 'Store Attendant', assignedRoleSlug: 'cashier', assignedRoleTitle: 'Cashier', status: 'active', invitedAt: '2026-03-15T09:00:00Z', joinedAt: '2026-03-16T14:00:00Z', completedTopics: 2, totalTopics: 8, certificates: 0 },
  { id: 'mem-7', name: 'Grace Adeleke', phone: '+2348037777777', jobTitle: 'Cashier', assignedRoleSlug: 'cashier', assignedRoleTitle: 'Cashier', status: 'active', invitedAt: '2026-03-20T09:00:00Z', joinedAt: '2026-03-21T09:00:00Z', completedTopics: 7, totalTopics: 8, certificates: 0 },
]

export const MOCK_JOB_MATCHES: MockJobMatch[] = [
  {
    id: 'match-1',
    roleTitle: 'Cashier',
    roleCategory: 'Retail & Store Operations',
    employer: 'Shoprite Nigeria',
    locationCity: 'Lagos',
    payMin: 55000,
    payMax: 70000,
    startDate: '2026-05-15',
    certificationRequired: true,
    requirements: 'Min 6 months retail experience. InTrainin Cashier certificate preferred.',
    postedAt: '2026-04-05T10:00:00Z',
    status: 'pending',
    matchScore: 94,
  },
  {
    id: 'match-2',
    roleTitle: 'Store Attendant',
    roleCategory: 'Retail & Store Operations',
    employer: null,
    locationCity: 'Lagos',
    payMin: 45000,
    payMax: null,
    startDate: '2026-05-01',
    certificationRequired: false,
    requirements: 'Reliable and punctual. Willingness to work weekends.',
    postedAt: '2026-04-04T08:30:00Z',
    status: 'pending',
    matchScore: 87,
  },
  {
    id: 'match-3',
    roleTitle: 'Cashier',
    roleCategory: 'Retail & Store Operations',
    employer: 'Prince Ebeano Supermarket',
    locationCity: 'Lekki',
    payMin: 50000,
    payMax: 60000,
    startDate: null,
    certificationRequired: true,
    requirements: 'Must have active InTrainin certification. Immediate start available.',
    postedAt: '2026-04-02T09:00:00Z',
    status: 'accepted',
    matchScore: 91,
  },
]

export const MOCK_HIRE_REQUESTS: MockHireRequest[] = [
  {
    id: 'hire-1',
    roleSlug: 'cashier',
    roleTitle: 'Cashier',
    locationCity: 'Abuja',
    positionsCount: 2,
    payMin: 45000,
    payMax: 60000,
    startDate: '2026-05-01',
    certificationRequired: true,
    status: 'open',
    postedAt: '2026-04-01T09:00:00Z',
    matchCount: 14,
  },
  {
    id: 'hire-2',
    roleSlug: 'cashier',
    roleTitle: 'Cashier',
    locationCity: 'Abuja',
    positionsCount: 1,
    payMin: null,
    payMax: null,
    startDate: null,
    certificationRequired: false,
    status: 'filled',
    postedAt: '2026-02-15T09:00:00Z',
    matchCount: 8,
  },
]

export const MOCK_CANDIDATES: MockCandidate[] = [
  { id: 'cand-1', name: 'Amara Okafor', locationCity: 'Abuja', roleTitle: 'Cashier', certified: true, testScore: 88, availability: 'immediate', matchScore: 96, status: 'shortlisted' },
  { id: 'cand-2', name: 'Bola Adeyemi', locationCity: 'Abuja', roleTitle: 'Cashier', certified: true, testScore: 80, availability: 'immediate', matchScore: 91, status: 'pending' },
  { id: 'cand-3', name: 'Chiamaka Nna', locationCity: 'Abuja', roleTitle: 'Cashier', certified: false, testScore: 72, availability: 'two_weeks', matchScore: 74, status: 'pending' },
  { id: 'cand-4', name: 'Dare Salako', locationCity: 'Abuja', roleTitle: 'Cashier', certified: true, testScore: 91, availability: 'immediate', matchScore: 95, status: 'hired' },
  { id: 'cand-5', name: 'Esther Musa', locationCity: 'Garki', roleTitle: 'Cashier', certified: true, testScore: 76, availability: 'one_month', matchScore: 81, status: 'pending' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getRoleBySlug(slug: string): MockRole | undefined {
  return MOCK_ROLES.find(r => r.slug === slug)
}

export function getEnrollmentBySlug(slug: string): MockEnrollment | undefined {
  return MOCK_ENROLLMENTS.find(e => e.roleSlug === slug)
}

export function getTopicById(role: MockRole, topicId: string): MockTopic | undefined {
  for (const mod of role.modules) {
    const t = mod.topics.find(t => t.id === topicId)
    if (t) return t
  }
  return undefined
}

export function getModuleForTopic(role: MockRole, topicId: string): MockModule | undefined {
  return role.modules.find(mod => mod.topics.some(t => t.id === topicId))
}

export function getTestById(role: MockRole, testId: string): MockTest | undefined {
  for (const mod of role.modules) {
    if (mod.test.id === testId) return mod.test
  }
  if (role.finalExam.id === testId) return role.finalExam
  return undefined
}

export function computeRoleProgress(role: MockRole, enrollment: MockEnrollment) {
  const allTopicIds = role.modules.flatMap(m => m.topics.map(t => t.id))
  const completed = allTopicIds.filter(id => enrollment.completedTopicIds.includes(id))
  return { completedTopics: completed.length, totalTopics: allTopicIds.length }
}

export function isTopicAccessible(role: MockRole, topicId: string, enrollment: MockEnrollment): boolean {
  for (const mod of role.modules) {
    const idx = mod.topics.findIndex(t => t.id === topicId)
    if (idx === -1) continue
    if (idx === 0) return true
    const prevTopic = mod.topics[idx - 1]
    return enrollment.completedTopicIds.includes(prevTopic.id)
  }
  return false
}

export function getNextTopic(role: MockRole, enrollment: MockEnrollment): MockTopic | null {
  for (const mod of role.modules) {
    for (const topic of mod.topics) {
      if (!enrollment.completedTopicIds.includes(topic.id)) return topic
    }
  }
  return null
}
