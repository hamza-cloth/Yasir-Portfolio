// Every price, multiplier, timeline and text the cost calculator uses. Change numbers here; the
// calculator (src/lib/estimate.ts) and its UI only read them. All amounts are in INR.

export const PRICING = {
  currency: "INR",
  locale: "en-IN",
  // Estimates are rounded to the nearest ₹1,000.
  roundTo: 1000,
  // The range shown: subtotal × rangeLow to subtotal × rangeHigh.
  rangeLow: 0.85,
  rangeHigh: 1.2,
  supportMonths: 6,
  supportPrice: 0,
  showGstNote: true,
  gstNoteText: "[CONFIRM: Prices are exclusive of GST, if applicable]",
  crossPlatformDiscount: -0.4,
  // Each selected feature adds this many weeks.
  weeksPerFeature: 0.5,
  // Each extra platform (factor above 1) stretches the timeline by this share.
  weeksPlatformStretch: 0.35,
  premiumDesignExtraWeeks: 1,
  priorityWeeksFactor: 0.75,
  // The timeline is shown as ceil(weeks) – ceil(weeks × this).
  weeksRangeFactor: 1.25,
} as const;

export type CategoryId =
  "websites" | "commerce" | "business" | "social" | "earning" | "gaming" | "ai" | "other";

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "websites", label: "Websites" },
  { id: "commerce", label: "Commerce" },
  { id: "business", label: "Business Software" },
  { id: "social", label: "Social" },
  { id: "earning", label: "Earning" },
  { id: "gaming", label: "Gaming" },
  { id: "ai", label: "AI" },
  { id: "other", label: "Other" },
];

export type FeatureId =
  | "login"
  | "socialLogin"
  | "admin"
  | "roles"
  | "payment"
  | "wallet"
  | "inventory"
  | "billing"
  | "vendorPanel"
  | "booking"
  | "chat"
  | "push"
  | "notifications"
  | "maps"
  | "media"
  | "video"
  | "reports"
  | "leaderboard"
  | "ai"
  | "multiLang"
  | "seo"
  | "contactForm"
  | "api";

// The project types offered in the Hire me inquiry form, so "Get Exact Quote" can pre-fill it.
type InquiryType =
  | "Business Website"
  | "Portfolio Website"
  | "E-commerce Store"
  | "Web App / Dashboard"
  | "Mobile App / PWA"
  | "Other";

export type ProjectType = {
  id: string;
  label: string;
  description: string;
  category: CategoryId;
  base: number;
  baseWeeks: number;
  recommended: FeatureId[];
  inquiryType: InquiryType;
  // Shown on the card: real-money gaming and betting are never offered.
  legalNote?: boolean;
  // Shown prominently on the result: the price is settled after a conversation.
  discussFirst?: boolean;
};

export const PROJECT_TYPES: ProjectType[] = [
  // Websites
  {
    id: "landing",
    label: "Landing Page",
    description: "One focused page that turns visitors into enquiries.",
    category: "websites",
    base: 8_000,
    baseWeeks: 1,
    recommended: ["seo"],
    inquiryType: "Business Website",
  },
  {
    id: "portfolio",
    label: "Portfolio / Personal Website",
    description: "Show your work, skills and story, with a contact form.",
    category: "websites",
    base: 12_000,
    baseWeeks: 1.5,
    recommended: ["seo", "contactForm"],
    inquiryType: "Portfolio Website",
  },
  {
    id: "business",
    label: "Business Website (with admin panel)",
    description: "A company site you can update yourself from an admin panel.",
    category: "websites",
    base: 30_000,
    baseWeeks: 3,
    recommended: ["admin", "seo", "contactForm"],
    inquiryType: "Business Website",
  },
  {
    id: "blog",
    label: "Blog / News Portal",
    description: "Articles, categories and authors, with sign-in for writers.",
    category: "websites",
    base: 35_000,
    baseWeeks: 3,
    recommended: ["admin", "login", "seo"],
    inquiryType: "Business Website",
  },
  // Commerce
  {
    id: "ecommerce",
    label: "E-commerce Store",
    description: "Products, cart, payments and an admin panel to run the shop.",
    category: "commerce",
    base: 60_000,
    baseWeeks: 5,
    recommended: ["login", "payment", "admin", "inventory", "notifications"],
    inquiryType: "E-commerce Store",
  },
  {
    id: "marketplace",
    label: "Multi-vendor Marketplace",
    description: "Many sellers, one storefront, with a panel for every vendor.",
    category: "commerce",
    base: 180_000,
    baseWeeks: 10,
    recommended: ["login", "payment", "admin", "vendorPanel", "notifications"],
    inquiryType: "E-commerce Store",
  },
  {
    id: "ondemand",
    label: "Food Delivery / On-demand Service",
    description: "Orders, live tracking and delivery partners, end to end.",
    category: "commerce",
    base: 250_000,
    baseWeeks: 12,
    recommended: ["login", "payment", "maps", "push", "admin"],
    inquiryType: "Mobile App / PWA",
  },
  // Business software
  {
    id: "crm",
    label: "CRM (leads, customers, follow-ups)",
    description: "Track leads and customers, and never miss a follow-up.",
    category: "business",
    base: 120_000,
    baseWeeks: 7,
    recommended: ["login", "admin", "reports", "notifications"],
    inquiryType: "Web App / Dashboard",
  },
  {
    id: "erp",
    label: "ERP / Management System (school, hospital, pharmacy, retail)",
    description: "Day-to-day operations, billing and roles in one system.",
    category: "business",
    base: 150_000,
    baseWeeks: 9,
    recommended: ["login", "admin", "reports", "billing", "roles"],
    inquiryType: "Web App / Dashboard",
  },
  {
    id: "booking",
    label: "Booking & Appointment System",
    description: "Slots, bookings, payments and reminders for your customers.",
    category: "business",
    base: 70_000,
    baseWeeks: 5,
    recommended: ["login", "booking", "payment", "notifications"],
    inquiryType: "Web App / Dashboard",
  },
  {
    id: "lms",
    label: "E-learning / LMS",
    description: "Courses, video lessons and paid enrolment for students.",
    category: "business",
    base: 150_000,
    baseWeeks: 8,
    recommended: ["login", "payment", "video", "admin"],
    inquiryType: "Web App / Dashboard",
  },
  {
    id: "saas",
    label: "SaaS / Custom Web Application",
    description: "Your own web product, with accounts, roles and billing.",
    category: "business",
    base: 150_000,
    baseWeeks: 8,
    recommended: ["login", "admin", "payment", "roles"],
    inquiryType: "Web App / Dashboard",
  },
  // Social & community
  {
    id: "social",
    label: "Social Media / Community App",
    description: "Profiles, posts, chat and notifications for a community.",
    category: "social",
    base: 250_000,
    baseWeeks: 12,
    recommended: ["login", "socialLogin", "chat", "push", "media", "admin"],
    inquiryType: "Mobile App / PWA",
  },
  {
    id: "chat",
    label: "Chat / Messaging App",
    description: "Real-time one-to-one and group messaging with media.",
    category: "social",
    base: 200_000,
    baseWeeks: 10,
    recommended: ["login", "chat", "push", "media"],
    inquiryType: "Mobile App / PWA",
  },
  // Earning & rewards
  {
    id: "earning",
    label: "Earning / Rewards / Referral App (tasks, cashback, referrals — no betting)",
    description: "Legitimate tasks, cashback and referral rewards with a wallet.",
    category: "earning",
    base: 150_000,
    baseWeeks: 8,
    recommended: ["login", "wallet", "admin", "push", "reports"],
    inquiryType: "Mobile App / PWA",
    legalNote: true,
  },
  // Gaming (no real money)
  {
    id: "casualGame",
    label: "Casual / Hyper-casual 2D Game",
    description: "A simple, replayable 2D game with leaderboards.",
    category: "gaming",
    base: 120_000,
    baseWeeks: 8,
    recommended: ["leaderboard"],
    inquiryType: "Mobile App / PWA",
    legalNote: true,
  },
  {
    id: "multiGame",
    label: "Multiplayer / Esports-style Game",
    description: "Play with others online, with chat and rankings.",
    category: "gaming",
    base: 300_000,
    baseWeeks: 14,
    recommended: ["login", "leaderboard", "chat", "push"],
    inquiryType: "Mobile App / PWA",
    legalNote: true,
  },
  // AI
  {
    id: "aiApp",
    label: "AI Chatbot / AI-powered App",
    description: "A chatbot or app that uses AI to answer, write or sort.",
    category: "ai",
    base: 120_000,
    baseWeeks: 6,
    recommended: ["login", "ai", "admin"],
    inquiryType: "Web App / Dashboard",
  },
  // Other
  {
    id: "custom",
    label: "Something Else / Custom Idea",
    description: "Tell me the idea; we will shape the scope together.",
    category: "other",
    base: 50_000,
    baseWeeks: 4,
    recommended: [],
    inquiryType: "Other",
    discussFirst: true,
  },
];

export type FeatureGroupId =
  "users" | "money" | "communication" | "content" | "business" | "advanced";

export const FEATURE_GROUPS: { id: FeatureGroupId; label: string }[] = [
  { id: "users", label: "Users & Access" },
  { id: "money", label: "Payments & Money" },
  { id: "communication", label: "Communication" },
  { id: "content", label: "Content & Media" },
  { id: "business", label: "Business Tools" },
  { id: "advanced", label: "Advanced" },
];

export type Feature = { id: FeatureId; label: string; price: number; group: FeatureGroupId };

export const FEATURES: Feature[] = [
  { id: "login", label: "User login & profiles", price: 8_000, group: "users" },
  { id: "socialLogin", label: "Google / social login", price: 5_000, group: "users" },
  { id: "admin", label: "Admin panel / dashboard", price: 20_000, group: "users" },
  { id: "roles", label: "Multiple user roles & permissions", price: 12_000, group: "users" },
  {
    id: "payment",
    label: "Payment gateway — UPI / cards / Razorpay",
    price: 12_000,
    group: "money",
  },
  { id: "wallet", label: "Wallet, rewards & referral system", price: 25_000, group: "money" },
  { id: "billing", label: "Invoices & GST billing", price: 15_000, group: "money" },
  { id: "chat", label: "Real-time chat", price: 30_000, group: "communication" },
  { id: "push", label: "Push notifications", price: 8_000, group: "communication" },
  {
    id: "notifications",
    label: "Email / SMS / WhatsApp alerts",
    price: 10_000,
    group: "communication",
  },
  { id: "contactForm", label: "Contact / inquiry forms", price: 3_000, group: "communication" },
  { id: "media", label: "Photo / video uploads", price: 20_000, group: "content" },
  { id: "video", label: "Video courses / streaming", price: 30_000, group: "content" },
  {
    id: "multiLang",
    label: "Multi-language, e.g. Hindi + English",
    price: 10_000,
    group: "content",
  },
  { id: "seo", label: "SEO setup", price: 8_000, group: "content" },
  { id: "inventory", label: "Inventory / stock management", price: 20_000, group: "business" },
  { id: "vendorPanel", label: "Seller / vendor panel", price: 40_000, group: "business" },
  { id: "booking", label: "Booking calendar & slots", price: 15_000, group: "business" },
  { id: "reports", label: "Reports & analytics", price: 15_000, group: "business" },
  { id: "maps", label: "Maps & live location tracking", price: 20_000, group: "advanced" },
  { id: "leaderboard", label: "Leaderboards & in-game rewards", price: 20_000, group: "advanced" },
  { id: "ai", label: "AI chatbot / AI features", price: 25_000, group: "advanced" },
  { id: "api", label: "Third-party API integration", price: 10_000, group: "advanced" },
];

export type PlatformId = "web" | "pwa" | "android" | "ios" | "desktop";

export const PLATFORMS: { id: PlatformId; label: string; description: string; factor: number }[] = [
  {
    id: "web",
    label: "Website",
    description: "Responsive for mobile, tablet & desktop",
    factor: 1.0,
  },
  {
    id: "pwa",
    label: "PWA",
    description: "Installable from the browser (needs Website)",
    factor: 0.2,
  },
  { id: "android", label: "Android", description: "Android app", factor: 0.8 },
  { id: "ios", label: "iOS", description: "iPhone / iOS app", factor: 0.8 },
  { id: "desktop", label: "Desktop", description: "Windows / macOS app", factor: 0.6 },
];

export type DesignId = "template" | "custom" | "premium";
export type ScaleId = "small" | "growing" | "large";
export type DeliveryId = "standard" | "priority";

export type Choice<T extends string> = {
  id: T;
  label: string;
  description: string;
  factor: number;
};

export const DESIGN_LEVELS: Choice<DesignId>[] = [
  { id: "template", label: "Template", description: "Clean, template-based", factor: 0.85 },
  { id: "custom", label: "Custom", description: "Custom design — recommended", factor: 1.0 },
  { id: "premium", label: "Premium", description: "Custom + advanced animations", factor: 1.3 },
];

export const SCALES: Choice<ScaleId>[] = [
  { id: "small", label: "Small", description: "Up to 1,000 users", factor: 1.0 },
  { id: "growing", label: "Growing", description: "1,000 – 50,000 users", factor: 1.15 },
  { id: "large", label: "Large", description: "50,000+ users", factor: 1.35 },
];

export const DELIVERY: Choice<DeliveryId>[] = [
  { id: "standard", label: "Standard", description: "Normal timeline", factor: 1.0 },
  { id: "priority", label: "Priority", description: "Fast-track, about 25% sooner", factor: 1.25 },
];

export const DEFAULTS = {
  platforms: ["web"] as PlatformId[],
  design: "custom" as DesignId,
  scale: "small" as ScaleId,
  delivery: "standard" as DeliveryId,
};

export const SUPPORT_INCLUDED = [
  "Bug fixes",
  "Small text / image changes",
  "Security & dependency updates",
  "Uptime monitoring & hosting help",
  "Help via WhatsApp / email",
];

export const SUPPORT_EXCLUDED = "New features or major redesigns (quoted separately)";

export const NOT_INCLUDED = [
  "Domain & hosting / server charges",
  "Google Play developer fee (one-time US$25)",
  "Apple Developer Program (US$99/year)",
  "SMS / WhatsApp / AI API usage charges",
  "Payment-gateway transaction fees",
  "Paid themes, plugins or stock assets",
];

export const DISCLAIMER =
  "This is an approximate estimate based on your selections. The final price and timeline depend on detailed requirements, content, design revisions and third-party services, and will be confirmed in a written quote after a free discussion.";

export const LEGAL_NOTE = "Real-money gaming & betting apps are not offered.";
