import type { ProjectDetail } from "./types";

// Seed content and the fallback when no database is configured. Facts only from the brief;
// role is unknown, so it stays null and the role card is hidden.
export const PROJECTS: ProjectDetail[] = [
  {
    slug: "earthix-ai-healthcare",
    title: "Earthix AI Healthcare",
    tagline: "An AI operating system for Indian clinics, diagnostic labs and hospitals.",
    summary:
      "Multi-tenant from Platform to Organization to Branch. AI drafts documentation and admin work only, never diagnoses or prescribes, and a doctor reviews every output. ABDM-ready adapters for ABHA, HPR, HFR and the consent manager.",
    statusLabel: "In development (MVP)",
    categories: ["PRODUCT"],
    stack: [
      "Next.js",
      "TypeScript",
      "Tailwind",
      "NestJS",
      "PostgreSQL",
      "Redis",
      "OpenSearch",
      "S3-compatible storage",
      "React Native / Expo",
      "Docker",
      "Kubernetes",
      "GitHub Actions",
    ],
    visual: "CLINIC_CONSOLE",
    role: null,
    type: "Healthcare platform",
    overview: [
      "Earthix AI Healthcare is an AI operating system for Indian clinics, diagnostic labs and hospitals. It is in development as a small MVP; lab and pharmacy modules come later.",
      "The AI has one job: drafting documentation and admin work. It never diagnoses or prescribes, and a doctor reviews every output before it counts.",
      "Every record belongs to a tenant, from Platform to Organization to Branch, so a single clinic and a hospital group run on the same model. ABDM-ready adapters cover ABHA, HPR, HFR and the consent manager, with WhatsApp Business and UPI planned.",
    ].join("\n\n"),
    decisions: [
      {
        title: "AI drafts, doctors decide",
        body: "AI only drafts documentation and admin work. It never diagnoses or prescribes, and a doctor reviews every output.",
      },
      {
        title: "Tenants from day one",
        body: "A Platform → Organization → Branch hierarchy, so one clinic and a multi-branch hospital share the same data model.",
      },
      {
        title: "ABDM behind adapters",
        body: "ABHA, HPR, HFR and the consent manager are reached through ABDM-ready adapters, kept separate from the core product.",
      },
      {
        title: "A small MVP first",
        body: "The first release stays small. Lab and pharmacy follow, with WhatsApp Business and UPI planned.",
      },
    ],
    coverImageUrl: null,
  },
  {
    slug: "hamza-cloth",
    title: "Hamza Cloth",
    tagline:
      "Clothing e-commerce rebuilt as a storefront, an admin panel and a delivery-partner app on one backend.",
    summary:
      "Razorpay checkout through backend APIs, with “Hamza Cloth” shown on every payment mode and money credited only after UTR approval. Hamza Express runs in-house delivery and logistics, like Flipkart’s Ekart.",
    statusLabel: "v2 in progress",
    categories: ["PRODUCT", "WEB"],
    stack: ["Razorpay"],
    visual: "STOREFRONT",
    role: null,
    type: "E-commerce and delivery",
    overview: [
      "Hamza Cloth is a clothing store being rebuilt as v2: a storefront, an admin panel and a delivery-partner app, all running on one backend.",
      "Checkout goes through Razorpay using backend APIs. “Hamza Cloth” is shown on every payment mode, and money is credited only after the UTR is approved.",
      "Delivery is in-house. Hamza Express handles delivery and logistics, much like Flipkart’s Ekart, and the storefront takes a Flipkart-style shape with a new account area, a bottom navigation bar and a footer.",
    ].join("\n\n"),
    decisions: [
      {
        title: "One backend, three apps",
        body: "The storefront, the admin panel and the delivery-partner app all share a single backend.",
      },
      {
        title: "Payments through the backend",
        body: "Razorpay checkout runs through backend APIs, with “Hamza Cloth” shown on every payment mode.",
      },
      {
        title: "Credit after UTR approval",
        body: "A payment is credited only after its UTR is approved.",
      },
      {
        title: "Delivery in-house",
        body: "Hamza Express is the store’s own delivery and logistics arm, like Flipkart’s Ekart.",
      },
    ],
    coverImageUrl: null,
  },
  {
    slug: "the-peoples-library",
    title: "The People’s Library",
    tagline: "A portal for Ashraf & Sons’ offline 24×7 self-study centre.",
    summary:
      "Admissions, student records and a fee structure per shift, for 3 shifts and about 300 students a month. The latest redesign changed only the UI; behaviour stayed the same.",
    statusLabel: "Working build",
    categories: ["WEB"],
    stack: ["React", "Vite"],
    visual: "SEAT_MAP",
    role: null,
    type: "Study-centre portal",
    overview: [
      "The People’s Library (Ashraf & Sons) is an offline self-study centre that is open 24×7. There are no books to lend: students come to study, across 3 shifts, about 300 of them a month.",
      "The portal handles admissions, student records and a fee structure per shift. It is a React + Vite front end on a connected backend.",
      "The latest redesign changed only the UI, the components and the English text. Behaviour stayed exactly the same.",
    ].join("\n\n"),
    decisions: [
      {
        title: "Built around shifts",
        body: "Three shifts drive everything, including a separate fee structure for each shift.",
      },
      {
        title: "Admissions and records together",
        body: "Admissions flow straight into student records, so the desk works from one place.",
      },
      {
        title: "Redesign without regressions",
        body: "The latest redesign changed components and English text only. Behaviour stayed the same.",
      },
    ],
    coverImageUrl: null,
  },
];
