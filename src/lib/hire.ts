// Everything the "Hire me" section says, in one place. Edit the lists here; the components only
// render them. Nothing here may claim a fact that is not true: leave a value null to hide it.

// WhatsApp number with country code, digits only (e.g. 919876543210), from the environment, so it
// can change without a code edit. When it is not set, every WhatsApp button is hidden.
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

export const WHATSAPP_GREETING = "Hi Yasir, I want to discuss a website/app project.";

export function whatsappUrl(text: string = WHATSAPP_GREETING): string | null {
  return WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
    : null;
}

// The response time the site already promises elsewhere ("Replies within a day").
export const RESPONSE_TIME = "within a day";

export const VALUE_POINTS = [
  "Custom design — no templates",
  "Mobile-first & SEO-ready",
  "Secure, fast hosting setup",
  "Support after launch",
] as const;

export type ServiceIcon = "browser" | "cart" | "dashboard" | "phone" | "gauge" | "shield";

export type HireService = {
  title: string;
  description: string;
  tags: [string, string, string];
  icon: ServiceIcon;
  // "Starting at …". null hides the line; never ship a guessed price.
  startingPrice: string | null;
};

export const HIRE_SERVICES: HireService[] = [
  {
    title: "Business & Portfolio Websites",
    description: "A fast, custom site that explains what you do and gets people to contact you.",
    tags: ["Next.js", "SEO-ready", "Responsive"],
    icon: "browser",
    startingPrice: null,
  },
  {
    title: "E-commerce / Online Stores",
    description: "A storefront with products, cart and payments, and an admin panel to run it.",
    tags: ["Storefront", "Payments", "Admin panel"],
    icon: "cart",
    startingPrice: null,
  },
  {
    title: "Web Apps & Dashboards",
    description: "ERP, CRM, admin panels and booking systems with roles, data and real workflows.",
    tags: ["React", "NestJS", "Role-based access"],
    icon: "dashboard",
    startingPrice: null,
  },
  {
    title: "Mobile-friendly Web Apps",
    description: "Web apps that work like an app on any phone, installable from the browser.",
    tags: ["Mobile-first", "PWA", "Offline-ready"],
    icon: "phone",
    startingPrice: null,
  },
  {
    title: "Redesign & Speed Optimization",
    description:
      "A modern look for an existing site, and faster pages that rank and convert better.",
    tags: ["Redesign", "Core Web Vitals", "SEO"],
    icon: "gauge",
    startingPrice: null,
  },
  {
    title: "Hosting, Domain, Email & Network Setup",
    description:
      "Domain, DNS, business email and hosting set up properly, with security from day one.",
    tags: ["DNS", "TLS/SSL", "Firewall rules"],
    icon: "shield",
    startingPrice: null,
  },
];

export const HIRE_STEPS = [
  { title: "Discuss", body: "Understand your goals, features and budget." },
  { title: "Design", body: "Layout and look approved before development." },
  { title: "Develop", body: "Build, test on all devices, regular updates." },
  { title: "Launch & Support", body: "Go live, hosting setup, help after launch." },
] as const;

// Only skills already listed on the site.
export const TECH_I_USE = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "NestJS",
  "REST APIs",
  "PostgreSQL",
  "Redis",
  "JWT",
  "DNS",
  "TLS/SSL",
  "Firewall rules",
] as const;

// The nodes of the build diagram, with the one-line descriptions shown on hover or focus.
export const BUILD_NODES = [
  { label: "Design", detail: "Layouts and look approved before any code" },
  { label: "Frontend", detail: "Fast, responsive UI with React / Next.js" },
  { label: "Backend", detail: "APIs and business logic with Node.js / NestJS" },
  { label: "Database", detail: "Data modelled in PostgreSQL, sessions in Redis" },
  { label: "Cloud & Hosting", detail: "Deployed, monitored and backed up" },
  { label: "Security & Network", detail: "TLS, firewall rules, DNS and access control" },
] as const;

export const PROJECT_TYPES = [
  "Business Website",
  "Portfolio Website",
  "E-commerce Store",
  "Web App / Dashboard",
  "Mobile App / PWA",
  "Redesign",
  "Other",
] as const;

// Edit freely: the form and its validation both read this list.
export const BUDGET_RANGES = [
  "Under ₹10,000",
  "₹10,000–₹25,000",
  "₹25,000–₹50,000",
  "₹50,000+",
  "Not sure yet",
] as const;

export const TIMELINES = ["ASAP", "2–4 weeks", "1–2 months", "Flexible"] as const;

export type FaqItem = { question: string; answer: string | null };

// Answers left null are waiting for Yasir: shown as a marked placeholder in development, hidden
// in production.
export const HIRE_FAQ: FaqItem[] = [
  { question: "How much does a website cost?", answer: null },
  { question: "How long does it take?", answer: null },
  { question: "Do you provide domain & hosting?", answer: null },
  {
    question: "Will my website work on mobile?",
    answer: "Yes, every project is mobile-first and responsive.",
  },
  { question: "Do you provide support after launch?", answer: null },
];
