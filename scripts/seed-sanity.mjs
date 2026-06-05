/**
 * Seed script — populates the Sanity dataset from the static lib/data.ts values.
 *
 * Prerequisites
 * ─────────────
 * 1. Create a write token in your Sanity project:
 *    https://sanity.io/manage → (your project) → API → Tokens → Add API token
 *    Choose "Editor" permissions.
 *
 * 2. Add it to .env.local:
 *    SANITY_API_TOKEN=sk...
 *
 * Usage
 * ─────
 * npm run seed
 *   (runs: node --env-file=.env.local scripts/seed-sanity.mjs)
 */

import { createClient } from "@sanity/client";

/* ── Env ─────────────────────────────────────────────────── */
const TOKEN      = process.env.SANITY_API_TOKEN;
const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "yoiw178k";
const DATASET    = process.env.NEXT_PUBLIC_SANITY_DATASET    || "production";
const API_VER    = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";

if (!TOKEN) {
  console.error("\n❌  SANITY_API_TOKEN is not set.");
  console.error("    1. Go to https://sanity.io/manage → your project → API → Tokens");
  console.error("    2. Create an 'Editor' token and add it to .env.local:");
  console.error("       SANITY_API_TOKEN=sk...\n");
  process.exit(1);
}

const client = createClient({
  projectId: PROJECT_ID,
  dataset:   DATASET,
  apiVersion: API_VER,
  useCdn:    false,
  token:     TOKEN,
});

/* ── Data (mirrors lib/data.ts) ──────────────────────────── */
const documents = [

  /* ── siteSettings (singleton) ── */
  {
    _id:   "siteSettings",
    _type: "siteSettings",
    name:     "Bharatha Kumar",
    role:     "Frontend Developer",
    location: "Chennai, Tamil Nadu",
    email:    "bharatha24kumar@gmail.com",
    phone:    "+91 93427 26196",
    linkedin: "https://linkedin.com/in/bharathakumar",
    tagline:  "building AI-powered web experiences",
    blurb:
      "2.5+ years crafting responsive, production-grade CRM, e-commerce and AI platforms with Next.js, React and TypeScript — with a sharp eye for detail.",
    about:
      "Frontend Developer with 2.5+ years of hands-on experience building responsive, AI-integrated enterprise web applications. I independently deliver production-grade CRM, e-commerce and AI platforms end to end — from reusable component libraries and role-based access control to Docker, Jenkins CI/CD and AWS deployment. I also lean on AI-assisted development with Claude Code and GitHub Copilot to ship faster without cutting corners on quality.",
    stats: [
      { _key: "stat-0", value: "2.5+", label: "Years experience" },
      { _key: "stat-1", value: "4",    label: "Major platforms"  },
      { _key: "stat-2", value: "10+",  label: "Tech integrations" },
    ],
    highlights: [
      { _key: "hl-0", title: "End-to-end",    sub: "frontend ownership"   },
      { _key: "hl-1", title: "Agile / Scrum", sub: "delivery teams"       },
      { _key: "hl-2", title: "DevOps",        sub: "Docker · Jenkins · AWS" },
    ],
    marquee: [
      "Next.js", "React", "TypeScript", "Tailwind CSS", "Redux Toolkit",
      "Three.js", "OpenAI API", "TensorFlow.js", "Amazon SP-API", "Docker",
      "Jenkins", "AWS", "Framer Motion", "shadcn/ui",
    ],
  },

  /* ── Skill groups ── */
  {
    _id: "skillGroup-0", _type: "skillGroup", order: 0,
    title: "Frameworks & Languages", accent: "iris",
    items: ["React.js", "Next.js", "Vite", "TypeScript", "JavaScript ES6+", "HTML5", "CSS3"],
  },
  {
    _id: "skillGroup-1", _type: "skillGroup", order: 1,
    title: "State Management", accent: "cyan",
    items: ["Redux Toolkit", "Context API", "Zustand"],
  },
  {
    _id: "skillGroup-2", _type: "skillGroup", order: 2,
    title: "Styling & UI", accent: "mint",
    items: ["Tailwind CSS", "Material UI", "shadcn/ui", "Styled Components", "SASS/SCSS"],
  },
  {
    _id: "skillGroup-3", _type: "skillGroup", order: 3,
    title: "Forms · Tables · Animation", accent: "iris",
    items: ["React Hook Form", "TanStack Table", "Framer Motion", "FusionCharts"],
  },
  {
    _id: "skillGroup-4", _type: "skillGroup", order: 4,
    title: "API & Integrations", accent: "cyan",
    items: ["REST APIs", "Axios", "Amazon SP-API", "OpenAI API", "Quickbase"],
  },
  {
    _id: "skillGroup-5", _type: "skillGroup", order: 5,
    title: "Auth & Access", accent: "mint",
    items: ["SSO", "Azure AD B2C", "RBAC"],
  },
  {
    _id: "skillGroup-6", _type: "skillGroup", order: 6,
    title: "AI / ML", accent: "iris",
    items: ["TensorFlow.js", "MediaStream API", "OpenAI"],
  },
  {
    _id: "skillGroup-7", _type: "skillGroup", order: 7,
    title: "DevOps & Deploy", accent: "cyan",
    items: ["Docker", "Jenkins CI/CD", "AWS ECS", "AWS EKS"],
  },

  /* ── Projects ── */
  {
    _id: "project-customer-hub", _type: "project", order: 0,
    title: "Customer Hub — Turtle",
    kind:  "CRM Platform",
    accent: "iris",
    description:
      "Enterprise CRM for customer data, sales tracking and analytics. Real-time Quickbase data visualised with interactive FusionCharts, plus dual SSO + Azure AD B2C auth and full role-based access control.",
    tags: ["Next.js 15", "TypeScript", "Redux Toolkit", "Quickbase", "FusionCharts", "Docker · AWS"],
  },
  {
    _id: "project-commerce-hub", _type: "project", order: 1,
    title: "Commerce Hub — Turtle",
    kind:  "Order & Supplier Management",
    accent: "cyan",
    description:
      "Internal Amazon order & supplier platform. Integrated Amazon SP-API for automated order ingestion, with product tracking, supplier onboarding, user management and payment reconciliation modules.",
    tags: ["Next.js", "Amazon SP-API", "Redux Toolkit", "React Hook Form", "SCSS"],
  },
  {
    _id: "project-poa-revalgo", _type: "project", order: 2,
    title: "POA — Revalgo",
    kind:  "AI Purchase Order Automation",
    accent: "mint",
    description:
      "AI-powered PO automation that reads vendor emails and bill copies via the OpenAI API to auto-extract product, pricing and order data — with a vendor self-service order form delivered by an email-trigger workflow.",
    tags: ["React (Vite)", "OpenAI API", "Redux + Context", "Tailwind · MUI"],
  },
  {
    _id: "project-dream-hire", _type: "project", order: 3,
    title: "Dream Hire",
    kind:  "AI-Powered Hiring Suite",
    accent: "iris",
    description:
      "Internal hiring suite with AI test proctoring. TensorFlow.js runs real-time eye, person and voice tracking in-browser via the MediaStream API, with accessible candidate and admin interfaces.",
    tags: ["Next.js", "TensorFlow.js", "MediaStream API", "shadcn/ui", "Zustand"],
  },

  /* ── Experience ── */
  {
    _id: "experience-0", _type: "experience", order: 0,
    role:    "Frontend Developer",
    company: "D2R AI Labs Pvt Ltd",
    place:   "Chennai",
    period:  "Aug 2023 – Present",
    summary:
      "Independently delivering production-grade CRM, e-commerce and AI platforms end to end. Building reusable component libraries, RBAC, complex multi-step forms and data visualisations, while owning Docker, Jenkins CI/CD and AWS ECS/EKS deployment in Agile/Scrum teams.",
    bullets: [
      "Shipped 4 enterprise platforms across CRM, commerce and hiring",
      "Integrated SP-API, OpenAI, Quickbase, TensorFlow.js & Azure AD B2C",
      "AI-assisted development with Claude Code & GitHub Copilot",
    ],
  },

  /* ── Education ── */
  {
    _id: "education-0", _type: "education",
    degree: "M.Sc. Computer Science",
    school: "Thiruvalluvar University",
    year:   "2022",
    cgpa:   "8.8",
  },

  /* ── Certifications ── */
  {
    _id: "certification-0", _type: "certification", order: 0,
    title: "The Ultimate React Course",
    sub:   "Next.js · Redux · React",
  },
  {
    _id: "certification-1", _type: "certification", order: 1,
    title: "TypeScript: Complete Guide",
    sub:   "Stephen Grider",
  },
  {
    _id: "certification-2", _type: "certification", order: 2,
    title: "Node.js: The Complete Guide",
    sub:   "MVC · REST · GraphQL",
  },
];

/* ── Seed ────────────────────────────────────────────────── */
async function seed() {
  console.log(`\n🌱 Seeding Sanity — project: ${PROJECT_ID}, dataset: ${DATASET}`);
  console.log(`   ${documents.length} documents to write...\n`);

  const tx = client.transaction();
  for (const doc of documents) {
    tx.createOrReplace(doc);
  }

  try {
    const result = await tx.commit({ visibility: "sync" });
    const count  = result.results.length;
    console.log(`✅  Done — ${count} document${count !== 1 ? "s" : ""} created/updated.\n`);
    console.log("   Restart your dev server (npm run dev) to see live CMS data.\n");
  } catch (err) {
    if (err instanceof Error && err.message.includes("Insufficient permissions")) {
      console.error("\n❌  Write failed: token has insufficient permissions.");
      console.error("    Make sure your token has 'Editor' (not 'Viewer') permissions.\n");
    } else {
      throw err;
    }
    process.exit(1);
  }
}

seed().catch((err) => {
  console.error("\n❌  Seed failed:", err.message, "\n");
  process.exit(1);
});
