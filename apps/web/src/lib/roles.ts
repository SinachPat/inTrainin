export type Module = {
  num: number;
  title: string;
  topics: number;
};

export type Role = {
  slug: string;
  title: string;
  category: string;
  icon: string;
  modules: Module[];
  price: string;
  description: string;
  about: string;
  outcomes: string[];
};

export const ROLES: Role[] = [
  {
    slug: "cashier-retail",
    title: "Cashier (Retail)",
    category: "Retail & Store Ops",
    icon: "🛒",
    price: "₦2,500",
    description: "Master POS systems, cash handling, customer service, and end-of-day reconciliation.",
    about:
      "The Cashier (Retail) curriculum prepares you for one of the most common entry-level roles in Nigerian retail. You will learn how to operate a POS terminal, handle cash accurately, serve customers professionally, and close the till at end of shift — the exact skills supermarkets, pharmacies, and stores look for on Day 1.",
    outcomes: [
      "Operate POS terminals and process card, cash, and transfer payments",
      "Count, sort, and record cash without errors",
      "Handle customer complaints calmly and professionally",
      "Perform end-of-day cash reconciliation and report discrepancies",
      "Apply loss prevention practices at the till",
      "Work a full shift independently without supervision",
    ],
    modules: [
      { num: 1, title: "Customer Service Foundations", topics: 5 },
      { num: 2, title: "POS Systems & Payment Processing", topics: 6 },
      { num: 3, title: "Cash Handling & Reconciliation", topics: 6 },
      { num: 4, title: "Store Policy & Loss Prevention", topics: 5 },
      { num: 5, title: "Shift Operations & Handover", topics: 6 },
    ],
  },
  {
    slug: "waiter-waitress",
    title: "Waiter / Waitress",
    category: "Food & Beverage",
    icon: "🍽️",
    price: "₦2,500",
    description: "Table service, menu knowledge, food safety, upselling, and shift procedures.",
    about:
      "This curriculum covers everything a waiter or waitress needs to deliver excellent table service in restaurants, hotels, and event venues. From taking orders correctly and upselling specials, to handling complaints and closing your section cleanly — this is structured, practical training built from real Nigerian F&B environments.",
    outcomes: [
      "Take and relay orders accurately to the kitchen",
      "Describe menu items and suggest pairings confidently",
      "Apply food safety and personal hygiene standards",
      "Handle guest complaints and escalate appropriately",
      "Upsell starters, drinks, and desserts without being pushy",
      "Open and close your section following standard procedures",
    ],
    modules: [
      { num: 1, title: "Food Service Fundamentals", topics: 5 },
      { num: 2, title: "Menu Knowledge & Upselling", topics: 5 },
      { num: 3, title: "Food Safety & Personal Hygiene", topics: 5 },
      { num: 4, title: "Guest Handling & Complaints", topics: 5 },
      { num: 5, title: "Shift Open & Close Procedures", topics: 5 },
    ],
  },
  {
    slug: "store-attendant",
    title: "Store Attendant",
    category: "Retail & Store Ops",
    icon: "🧾",
    price: "₦2,500",
    description: "Stock management, customer handling, display standards, and security protocols.",
    about:
      "The Store Attendant curriculum prepares you to keep a retail store running smoothly — receiving stock, maintaining shelf displays, assisting customers, and flagging security issues. Employers need people who can work independently without constant direction, and this course gives you exactly that foundation.",
    outcomes: [
      "Receive and count incoming stock against delivery notes",
      "Set up and maintain shelf displays to brand standards",
      "Assist customers in finding products and making decisions",
      "Identify and report shoplifting indicators without confrontation",
      "Manage stock rotation and flag near-expiry items",
      "Complete basic inventory counts and tally sheets",
    ],
    modules: [
      { num: 1, title: "Store Operations Overview", topics: 5 },
      { num: 2, title: "Stock Receiving & Inventory", topics: 6 },
      { num: 3, title: "Shelf Display & Merchandising", topics: 5 },
      { num: 4, title: "Customer Assistance & Sales", topics: 6 },
    ],
  },
  {
    slug: "barista",
    title: "Barista",
    category: "Food & Beverage",
    icon: "☕",
    price: "₦2,500",
    description: "Espresso techniques, milk frothing, beverage recipes, hygiene, and equipment care.",
    about:
      "Coffee culture in Nigerian cities is growing fast. This curriculum teaches you how to operate espresso machines, steam milk to the right texture, produce a consistent menu of hot and cold beverages, and keep your workspace clean and safe. Whether you're working in a specialty café or a hotel lobby bar, this course gets you ready.",
    outcomes: [
      "Pull consistent espresso shots and diagnose extraction issues",
      "Steam and texture milk for lattes, cappuccinos, and flat whites",
      "Prepare the full menu of hot and cold coffee beverages",
      "Follow daily cleaning routines for espresso machines and grinders",
      "Manage ingredient stock and flag low supplies",
      "Serve customers efficiently during peak hours",
    ],
    modules: [
      { num: 1, title: "Coffee Fundamentals & Bean Knowledge", topics: 5 },
      { num: 2, title: "Espresso Extraction Techniques", topics: 5 },
      { num: 3, title: "Milk Steaming & Latte Art Basics", topics: 5 },
      { num: 4, title: "Beverage Recipes & Menu Execution", topics: 5 },
      { num: 5, title: "Equipment Care & Hygiene Compliance", topics: 4 },
    ],
  },
  {
    slug: "customer-service-rep",
    title: "Customer Service Rep",
    category: "Sales & Marketing",
    icon: "📣",
    price: "₦2,500",
    description: "Complaint handling, communication, product knowledge, CRM basics, and follow-up.",
    about:
      "Customer service is the front line of every business. This curriculum teaches you how to handle enquiries and complaints over phone, WhatsApp, and in person — calmly, professionally, and within company policy. You will also learn the basics of CRM tools and how to document every interaction so nothing falls through the cracks.",
    outcomes: [
      "Handle inbound enquiries across phone, chat, and in-person channels",
      "De-escalate angry customers using proven techniques",
      "Log interactions accurately in a CRM tool",
      "Resolve complaints within your authority and escalate the rest",
      "Write clear follow-up messages that close the loop",
      "Meet response-time SLAs consistently",
    ],
    modules: [
      { num: 1, title: "Communication Skills for Customer Service", topics: 5 },
      { num: 2, title: "Handling Complaints & Difficult Customers", topics: 6 },
      { num: 3, title: "Product & Service Knowledge", topics: 5 },
      { num: 4, title: "CRM Tools & Documentation", topics: 5 },
      { num: 5, title: "Follow-up & Quality Standards", topics: 5 },
    ],
  },
  {
    slug: "dispatch-rider",
    title: "Dispatch Rider",
    category: "Logistics",
    icon: "🚚",
    price: "₦2,500",
    description: "Route optimization, safety protocols, delivery SOPs, and customer interaction.",
    about:
      "Dispatch riders are the backbone of last-mile delivery in Nigerian cities. This curriculum covers safe riding practices, route planning, delivery documentation, handling fragile or valuable items, and interacting with recipients professionally — the skills that separate reliable riders from unreliable ones and get you repeat work.",
    outcomes: [
      "Plan efficient routes using maps and local knowledge",
      "Follow delivery SOPs — confirmation, handover, and proof of delivery",
      "Handle fragile, perishable, and high-value items correctly",
      "Communicate ETAs and delays to dispatchers and recipients",
      "Apply road safety rules to reduce accident risk",
      "Resolve delivery disputes on the spot without escalation",
    ],
    modules: [
      { num: 1, title: "Road Safety & Traffic Rules", topics: 5 },
      { num: 2, title: "Route Planning & Navigation", topics: 5 },
      { num: 3, title: "Delivery SOPs & Documentation", topics: 5 },
      { num: 4, title: "Customer Interaction & Dispute Handling", topics: 5 },
    ],
  },
  {
    slug: "receptionist",
    title: "Receptionist",
    category: "Admin & Office",
    icon: "📋",
    price: "₦2,500",
    description: "Front desk operations, scheduling, communication etiquette, and office software basics.",
    about:
      "The receptionist is often the first person a visitor or caller meets. This curriculum teaches you how to manage a front desk professionally — handling calls, scheduling meetings, greeting visitors, and keeping records — using tools like Google Calendar and basic spreadsheets. The skills apply across corporate offices, clinics, schools, and hotels.",
    outcomes: [
      "Greet and direct visitors following company protocol",
      "Answer, screen, and transfer calls professionally",
      "Schedule and manage appointments using a calendar tool",
      "Manage incoming mail, deliveries, and access control",
      "Maintain a tidy, professional front desk environment",
      "Produce basic memos, logs, and visitor records",
    ],
    modules: [
      { num: 1, title: "Front Desk & Visitor Management", topics: 5 },
      { num: 2, title: "Professional Communication & Phone Etiquette", topics: 5 },
      { num: 3, title: "Scheduling & Calendar Management", topics: 5 },
      { num: 4, title: "Office Software Basics", topics: 5 },
      { num: 5, title: "Record Keeping & Administrative Procedures", topics: 4 },
    ],
  },
  {
    slug: "hairdresser",
    title: "Hairdresser",
    category: "Beauty & Wellness",
    icon: "✂️",
    price: "₦2,500",
    description: "Haircut techniques, client consultation, chemical treatments, and salon hygiene.",
    about:
      "A skilled hairdresser builds a loyal clientele and commands premium prices. This curriculum covers the technical skills — cutting, braiding, relaxing, colouring — alongside the business and hygiene practices that separate a professional salon from a backyard operation. Whether you work in a salon or want to go independent, this is your foundation.",
    outcomes: [
      "Conduct client consultations and manage expectations",
      "Execute foundational haircuts, trims, and layers",
      "Apply chemical treatments safely (relaxers, colour, perms)",
      "Set up and manage a sanitary workstation",
      "Recommend products and aftercare to clients",
      "Price services and handle salon bookings",
    ],
    modules: [
      { num: 1, title: "Salon Safety & Hygiene Standards", topics: 5 },
      { num: 2, title: "Client Consultation & Hair Assessment", topics: 5 },
      { num: 3, title: "Cutting & Styling Techniques", topics: 6 },
      { num: 4, title: "Chemical Treatments & Colouring", topics: 5 },
      { num: 5, title: "Product Knowledge & Client Retention", topics: 5 },
    ],
  },
  {
    slug: "security-guard",
    title: "Security Guard",
    category: "Admin & Office",
    icon: "🛡️",
    price: "₦2,500",
    description: "Access control, emergency response, report writing, and legal boundaries of duty.",
    about:
      "Security guards are responsible for people, property, and information. This curriculum teaches you how to control access points, conduct patrols, write incident reports, and respond to emergencies — all within the legal limits of your role in Nigeria. Employers want guards who are trained, calm under pressure, and can document everything correctly.",
    outcomes: [
      "Manage access control at entry points following a site security plan",
      "Conduct regular patrol routes and log observations",
      "Write clear, accurate incident reports",
      "Respond to fire, medical, and security emergencies with the right procedure",
      "De-escalate confrontations without using unnecessary force",
      "Understand the legal limits of a security guard's authority in Nigeria",
    ],
    modules: [
      { num: 1, title: "Security Guard Roles & Legal Responsibilities", topics: 5 },
      { num: 2, title: "Access Control & Patrol Procedures", topics: 5 },
      { num: 3, title: "Incident Reporting & Documentation", topics: 4 },
      { num: 4, title: "Emergency Response Procedures", topics: 4 },
    ],
  },
  {
    slug: "cook-kitchen-hand",
    title: "Cook / Kitchen Hand",
    category: "Food & Beverage",
    icon: "🍳",
    price: "₦2,500",
    description: "Food preparation, kitchen hygiene, portion control, equipment safety, and shift coordination.",
    about:
      "Every professional kitchen needs reliable, trained hands. This curriculum teaches you the foundational skills that commercial kitchens require — food hygiene, prep techniques, portion control, equipment handling, and how to work as part of a fast-moving kitchen team. It applies to restaurants, canteens, hotels, and catering operations.",
    outcomes: [
      "Apply HACCP food safety principles during prep and service",
      "Execute standard prep tasks: dicing, blanching, marinating, portioning",
      "Operate and clean commercial kitchen equipment safely",
      "Follow recipes and maintain consistency across servings",
      "Coordinate with chefs and front-of-house during service",
      "Label, store, and rotate food items correctly",
    ],
    modules: [
      { num: 1, title: "Food Safety & Kitchen Hygiene (HACCP)", topics: 5 },
      { num: 2, title: "Basic Cooking & Prep Techniques", topics: 5 },
      { num: 3, title: "Equipment Operation & Safety", topics: 5 },
      { num: 4, title: "Portion Control & Recipe Adherence", topics: 4 },
      { num: 5, title: "Kitchen Teamwork & Shift Coordination", topics: 5 },
    ],
  },
  {
    slug: "sales-rep",
    title: "Sales Representative",
    category: "Sales & Marketing",
    icon: "🤝",
    price: "₦2,500",
    description: "Prospecting, pitching, objection handling, closing techniques, and after-sales follow-up.",
    about:
      "Great salespeople are made, not born. This curriculum teaches you the full sales cycle — finding prospects, building rapport, presenting your product, handling objections, and closing the deal — with practical scripts and frameworks that work in the Nigerian market. Whether you're selling FMCG, services, or tech products, this course builds your confidence and consistency.",
    outcomes: [
      "Build and manage a prospect pipeline",
      "Open a sales conversation and establish rapport quickly",
      "Deliver a clear, benefit-focused product pitch",
      "Handle price, competition, and timing objections",
      "Use closing techniques appropriate for each customer",
      "Follow up after the sale to drive referrals and repeat business",
    ],
    modules: [
      { num: 1, title: "Sales Mindset & Prospecting", topics: 5 },
      { num: 2, title: "Building Rapport & Understanding Needs", topics: 5 },
      { num: 3, title: "Pitching & Product Presentation", topics: 5 },
      { num: 4, title: "Objection Handling", topics: 6 },
      { num: 5, title: "Closing & After-Sales Follow-up", topics: 4 },
    ],
  },
  {
    slug: "hotel-housekeeper",
    title: "Hotel Housekeeper",
    category: "Hospitality",
    icon: "🏨",
    price: "₦2,500",
    description: "Room turnover procedures, linen management, guest interaction, and chemical safety.",
    about:
      "Housekeeping is the backbone of any hotel's reputation. This curriculum covers the full room turnover workflow, linen and amenity management, safe handling of cleaning chemicals, and how to interact with guests professionally. Trained housekeepers are in demand across hotels, serviced apartments, and lodges throughout Nigeria.",
    outcomes: [
      "Turn over a guest room to hotel standard within the allocated time",
      "Manage linen exchange, folding, and storage correctly",
      "Handle and dilute cleaning chemicals safely",
      "Respond to guest requests and in-room maintenance issues",
      "Report lost property, damage, and safety hazards",
      "Complete room-check checklists accurately",
    ],
    modules: [
      { num: 1, title: "Housekeeping Standards & Guest Expectations", topics: 5 },
      { num: 2, title: "Room Turnover Procedures", topics: 5 },
      { num: 3, title: "Linen & Amenity Management", topics: 5 },
      { num: 4, title: "Chemical Safety & Equipment Handling", topics: 5 },
    ],
  },
  {
    slug: "barber",
    title: "Barber",
    category: "Beauty & Wellness",
    icon: "💈",
    price: "₦2,500",
    description: "Haircut styles, fade techniques, client consultation, tool sterilisation, and shop operations.",
    about:
      "Barbering is one of Nigeria's most in-demand skilled trades. This curriculum covers the technical skills every professional barber needs — fades, lineups, trims, beard shaping — alongside the hygiene, client management, and pricing skills that build a strong clientele. Whether you're working in a shop or planning to go independent, this course sets your standard.",
    outcomes: [
      "Execute fade haircuts from skin to high with consistent blending",
      "Deliver clean lineups and edge-ups",
      "Shape, trim, and style beards to client preference",
      "Sterilise and maintain clippers, trimmers, and razors correctly",
      "Conduct a client consultation before every service",
      "Manage bookings and price services profitably",
    ],
    modules: [
      { num: 1, title: "Barbershop Hygiene & Tool Sterilisation", topics: 4 },
      { num: 2, title: "Client Consultation & Haircut Planning", topics: 4 },
      { num: 3, title: "Fade Techniques & Blending", topics: 6 },
      { num: 4, title: "Lineups, Trims & Beard Styling", topics: 5 },
      { num: 5, title: "Shop Operations & Client Retention", topics: 3 },
    ],
  },
  {
    slug: "front-desk-agent",
    title: "Front Desk Agent",
    category: "Hospitality",
    icon: "🛎️",
    price: "₦2,500",
    description: "Check-in/out procedures, reservation systems, guest complaints, and upselling room upgrades.",
    about:
      "The front desk agent is the face of every hotel. This curriculum teaches you how to manage check-in and check-out efficiently, handle reservations on a PMS, upsell room upgrades diplomatically, and resolve guest complaints before they become reviews. Trained front desk agents are among the most sought-after hospitality hires in Nigeria.",
    outcomes: [
      "Execute smooth, professional check-in and check-out procedures",
      "Manage reservations and room assignments on a Property Management System",
      "Upsell room categories and breakfast packages",
      "Handle guest complaints and escalate when necessary",
      "Coordinate with housekeeping and maintenance on room status",
      "Process payments, issue folios, and close daily reports",
    ],
    modules: [
      { num: 1, title: "Hotel Operations & Front Desk Role", topics: 5 },
      { num: 2, title: "Check-in, Check-out & Reservations", topics: 5 },
      { num: 3, title: "Property Management System (PMS) Basics", topics: 5 },
      { num: 4, title: "Guest Relations & Complaint Handling", topics: 5 },
      { num: 5, title: "Upselling & Revenue Contribution", topics: 4 },
    ],
  },
  {
    slug: "warehouse-picker",
    title: "Warehouse Picker",
    category: "Logistics",
    icon: "📦",
    price: "₦2,500",
    description: "Pick-and-pack workflows, inventory accuracy, safe lifting, and warehouse communication.",
    about:
      "Warehouse pickers keep fulfilment operations moving. This curriculum covers the pick-and-pack workflow, barcode scanning, safe manual handling, inventory accuracy, and how to communicate exceptions to supervisors — the skills that make you a reliable, fast picker that warehouses want to keep and promote.",
    outcomes: [
      "Follow a pick list and locate items using warehouse bin locations",
      "Pack orders to dispatch standard without damage",
      "Operate a barcode scanner and confirm picks in a WMS",
      "Apply safe manual handling techniques for heavy items",
      "Identify and flag pick errors, shortages, and damaged stock",
      "Meet daily pick-rate targets consistently",
    ],
    modules: [
      { num: 1, title: "Warehouse Safety & Manual Handling", topics: 5 },
      { num: 2, title: "Pick-and-Pack Workflows", topics: 5 },
      { num: 3, title: "Inventory Accuracy & WMS Basics", topics: 4 },
      { num: 4, title: "Dispatch Standards & Communication", topics: 4 },
    ],
  },
];

export function getRoleBySlug(slug: string): Role | undefined {
  return ROLES.find((r) => r.slug === slug);
}

export function getTotalTopics(role: Role): number {
  return role.modules.reduce((sum, m) => sum + m.topics, 0);
}
