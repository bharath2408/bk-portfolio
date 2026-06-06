import type {
  SkillGroup,
  Project,
  ExperienceItem,
  Education,
  Certification,
} from "./types";

export const profile = {
  name: "Bharatha Kumar",
  role: "Frontend Developer",
  location: "Chennai, Tamil Nadu",
  email: "bharatha24kumar@gmail.com",
  phone: "+91 93427 26196",
  linkedin: "https://linkedin.com/in/bharathakumar",
  resume: "https://drive.google.com/file/d/1cWIjBkBaecODXMIY6WDY2FUU7uCH994o/view",
  siteUrl: "https://bk-portfolio-bharath2408.vercel.app",
  tagline: "building AI-powered web experiences",
  blurb:
    "2.5+ years crafting responsive, production-grade CRM, e-commerce and AI platforms with Next.js, React and TypeScript — with a sharp eye for detail.",
  about:
    "Frontend Developer with 2.5+ years of hands-on experience building responsive, AI-integrated enterprise web applications. I independently deliver production-grade CRM, e-commerce and AI platforms end to end — from reusable component libraries and role-based access control to Docker, Jenkins CI/CD and AWS deployment. I also lean on AI-assisted development with Claude Code and GitHub Copilot to ship faster without cutting corners on quality.",
  stats: [
    { value: "2.5+", label: "Years experience" },
    { value: "4", label: "Major platforms" },
    { value: "10+", label: "Tech integrations" },
  ],
  highlights: [
    { title: "End-to-end", sub: "frontend ownership" },
    { title: "Agile / Scrum", sub: "delivery teams" },
    { title: "DevOps", sub: "Docker · Jenkins · AWS" },
  ],
};

export const marqueeStack = [
  "Next.js", "React", "TypeScript", "Tailwind CSS", "Redux Toolkit",
  "Three.js", "OpenAI API", "TensorFlow.js", "Amazon SP-API", "Docker",
  "Jenkins", "AWS", "Framer Motion", "shadcn/ui",
];

export const skillGroups: SkillGroup[] = [
  {
    title: "Frameworks & Languages",
    accent: "iris",
    items: ["React.js", "Next.js", "Vite", "TypeScript", "JavaScript ES6+", "HTML5", "CSS3"],
  },
  {
    title: "State Management",
    accent: "cyan",
    items: ["Redux Toolkit", "Context API", "Zustand"],
  },
  {
    title: "Styling & UI",
    accent: "mint",
    items: ["Tailwind CSS", "Material UI", "shadcn/ui", "Styled Components", "SASS/SCSS"],
  },
  {
    title: "Forms · Tables · Animation",
    accent: "iris",
    items: ["React Hook Form", "TanStack Table", "Framer Motion", "FusionCharts"],
  },
  {
    title: "API & Integrations",
    accent: "cyan",
    items: ["REST APIs", "Axios", "Amazon SP-API", "OpenAI API", "Quickbase"],
  },
  {
    title: "Auth & Access",
    accent: "mint",
    items: ["SSO", "Azure AD B2C", "RBAC"],
  },
  {
    title: "AI / ML",
    accent: "iris",
    items: ["TensorFlow.js", "MediaStream API", "OpenAI"],
  },
  {
    title: "DevOps & Deploy",
    accent: "cyan",
    items: ["Docker", "Jenkins CI/CD", "AWS ECS", "AWS EKS"],
  },
];

export const projects: Project[] = [
  {
    title: "Customer Hub — Turtle",
    slug:  "customer-hub",
    kind: "CRM Platform",
    accent: "iris",
    desc: "Enterprise CRM for customer data, sales tracking and analytics. Real-time Quickbase data visualised with interactive FusionCharts, plus dual SSO + Azure AD B2C auth and full role-based access control.",
    tags: ["Next.js 15", "TypeScript", "Redux Toolkit", "Quickbase", "FusionCharts", "Docker · AWS"],
  },
  {
    title: "Commerce Hub — Turtle",
    slug:  "commerce-hub",
    kind: "Order & Supplier Management",
    accent: "cyan",
    desc: "Internal Amazon order & supplier platform. Integrated Amazon SP-API for automated order ingestion, with product tracking, supplier onboarding, user management and payment reconciliation modules.",
    tags: ["Next.js", "Amazon SP-API", "Redux Toolkit", "React Hook Form", "SCSS"],
  },
  {
    title: "POA — Revalgo",
    slug:  "poa-revalgo",
    kind: "AI Purchase Order Automation",
    accent: "mint",
    desc: "AI-powered PO automation that reads vendor emails and bill copies via the OpenAI API to auto-extract product, pricing and order data — with a vendor self-service order form delivered by an email-trigger workflow.",
    tags: ["React (Vite)", "OpenAI API", "Redux + Context", "Tailwind · MUI"],
  },
  {
    title: "Dream Hire",
    slug:  "dream-hire",
    kind: "AI-Powered Hiring Suite",
    accent: "iris",
    desc: "Internal hiring suite with AI test proctoring. TensorFlow.js runs real-time eye, person and voice tracking in-browser via the MediaStream API, with accessible candidate and admin interfaces.",
    tags: ["Next.js", "TensorFlow.js", "MediaStream API", "shadcn/ui", "Zustand"],
  },
];

export const experience: ExperienceItem = {
  role: "Frontend Developer",
  company: "D2R AI Labs Pvt Ltd",
  place: "Chennai",
  period: "Aug 2023 – Present",
  summary:
    "Independently delivering production-grade CRM, e-commerce and AI platforms end to end. Building reusable component libraries, RBAC, complex multi-step forms and data visualisations, while owning Docker, Jenkins CI/CD and AWS ECS/EKS deployment in Agile/Scrum teams.",
  bullets: [
    "Shipped 4 enterprise platforms across CRM, commerce and hiring",
    "Integrated SP-API, OpenAI, Quickbase, TensorFlow.js & Azure AD B2C",
    "AI-assisted development with Claude Code & GitHub Copilot",
  ],
};

export const education: Education = {
  degree: "M.Sc. Computer Science",
  school: "Thiruvalluvar University",
  year: "2022",
  cgpa: "8.8",
};

export const certifications: Certification[] = [
  { title: "The Ultimate React Course", sub: "Next.js · Redux · React" },
  { title: "TypeScript: Complete Guide", sub: "Stephen Grider" },
  { title: "Node.js: The Complete Guide", sub: "MVC · REST · GraphQL" },
];

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Skills", href: "#skills" },
  { label: "Work", href: "#work" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];
