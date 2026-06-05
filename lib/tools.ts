export type ToolCategory =
  | "All"
  | "AI"
  | "Design"
  | "Dev"
  | "CSS & UI"
  | "Deploy"
  | "Learn"
  | "APIs";

export interface DevTool {
  name:     string;
  emoji:    string;
  desc:     string;
  url:      string;
  category: Exclude<ToolCategory, "All">;
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  "All", "AI", "Design", "Dev", "CSS & UI", "Deploy", "Learn", "APIs",
];

export const CATEGORY_COLOR: Record<string, string> = {
  AI:         "#7C5CFF",
  Design:     "#34D399",
  Dev:        "#22D3EE",
  "CSS & UI": "#7C5CFF",
  Deploy:     "#34D399",
  Learn:      "#22D3EE",
  APIs:       "#7C5CFF",
};

export const DEV_TOOLS: DevTool[] = [
  /* ── AI ────────────────────────────────────────────────── */
  {
    name:     "Claude",
    emoji:    "🤖",
    desc:     "Anthropic's AI assistant — great for code review, documentation and complex reasoning.",
    url:      "https://claude.ai",
    category: "AI",
  },
  {
    name:     "v0 by Vercel",
    emoji:    "⚡",
    desc:     "Describe a UI in plain English, get production-ready Tailwind + shadcn code instantly.",
    url:      "https://v0.dev",
    category: "AI",
  },
  {
    name:     "Cursor",
    emoji:    "🖱️",
    desc:     "AI-native code editor built on VS Code. Pair-programs with you in real time.",
    url:      "https://cursor.sh",
    category: "AI",
  },
  {
    name:     "Perplexity",
    emoji:    "🔍",
    desc:     "AI search with cited sources. Faster than Googling for technical answers.",
    url:      "https://perplexity.ai",
    category: "AI",
  },
  {
    name:     "GitHub Copilot",
    emoji:    "🐙",
    desc:     "In-editor AI code completion trained on billions of lines of public code.",
    url:      "https://github.com/features/copilot",
    category: "AI",
  },

  /* ── Design ─────────────────────────────────────────────── */
  {
    name:     "Figma",
    emoji:    "🎨",
    desc:     "Collaborative UI design. The industry standard for web and mobile interfaces.",
    url:      "https://figma.com",
    category: "Design",
  },
  {
    name:     "Excalidraw",
    emoji:    "✏️",
    desc:     "Instant hand-drawn diagrams — perfect for wireframes and architecture sketches.",
    url:      "https://excalidraw.com",
    category: "Design",
  },
  {
    name:     "Coolors",
    emoji:    "🖌️",
    desc:     "Generate beautiful color palettes in seconds. Essential for any design system.",
    url:      "https://coolors.co",
    category: "Design",
  },
  {
    name:     "Heroicons",
    emoji:    "✦",
    desc:     "Beautiful hand-crafted SVG icons by the makers of Tailwind CSS.",
    url:      "https://heroicons.com",
    category: "Design",
  },
  {
    name:     "Haikei",
    emoji:    "🌊",
    desc:     "Generate organic SVG blobs, waves and gradients for page backgrounds.",
    url:      "https://haikei.app",
    category: "Design",
  },

  /* ── Dev ────────────────────────────────────────────────── */
  {
    name:     "Vite",
    emoji:    "⚡",
    desc:     "Next-gen build tool with instant HMR. Dramatically faster than webpack for local dev.",
    url:      "https://vitejs.dev",
    category: "Dev",
  },
  {
    name:     "Bun",
    emoji:    "🍞",
    desc:     "All-in-one JS runtime, package manager and bundler — blazing fast.",
    url:      "https://bun.sh",
    category: "Dev",
  },
  {
    name:     "TypeScript Playground",
    emoji:    "🛝",
    desc:     "Run TypeScript in the browser and share snippets. No install needed.",
    url:      "https://www.typescriptlang.org/play",
    category: "Dev",
  },
  {
    name:     "Volta",
    emoji:    "🔌",
    desc:     "Manage multiple Node.js versions per project effortlessly. Better than nvm.",
    url:      "https://volta.sh",
    category: "Dev",
  },
  {
    name:     "Prettier",
    emoji:    "💅",
    desc:     "Opinionated code formatter that just works. Stop bikeshedding on code style.",
    url:      "https://prettier.io",
    category: "Dev",
  },

  /* ── CSS & UI ───────────────────────────────────────────── */
  {
    name:     "Tailwind Play",
    emoji:    "🎮",
    desc:     "Live Tailwind CSS playground in the browser — no install, instant preview.",
    url:      "https://play.tailwindcss.com",
    category: "CSS & UI",
  },
  {
    name:     "Animista",
    emoji:    "🌀",
    desc:     "CSS animation library with a visual configurator. Copy-paste ready.",
    url:      "https://animista.net",
    category: "CSS & UI",
  },
  {
    name:     "UIverse",
    emoji:    "🔮",
    desc:     "Community-built collection of pure CSS/Tailwind components and effects.",
    url:      "https://uiverse.io",
    category: "CSS & UI",
  },
  {
    name:     "CSS Gradient",
    emoji:    "🌈",
    desc:     "Visual CSS gradient generator with a one-click copy output.",
    url:      "https://cssgradient.io",
    category: "CSS & UI",
  },
  {
    name:     "Lucide Icons",
    emoji:    "◈",
    desc:     "Clean, consistent icon library with 1000+ icons. Drop-in React component.",
    url:      "https://lucide.dev",
    category: "CSS & UI",
  },

  /* ── Deploy ─────────────────────────────────────────────── */
  {
    name:     "Vercel",
    emoji:    "▲",
    desc:     "Zero-config deployments for Next.js. Git push → live in seconds.",
    url:      "https://vercel.com",
    category: "Deploy",
  },
  {
    name:     "Railway",
    emoji:    "🚂",
    desc:     "Deploy full-stack apps with databases in minutes. Excellent DX.",
    url:      "https://railway.app",
    category: "Deploy",
  },
  {
    name:     "Fly.io",
    emoji:    "✈️",
    desc:     "Run containers at the edge, close to your users globally.",
    url:      "https://fly.io",
    category: "Deploy",
  },
  {
    name:     "Netlify",
    emoji:    "🌐",
    desc:     "Serverless platform with CI/CD, forms and edge functions built in.",
    url:      "https://netlify.com",
    category: "Deploy",
  },

  /* ── Learn ──────────────────────────────────────────────── */
  {
    name:     "roadmap.sh",
    emoji:    "🗺️",
    desc:     "Community-built learning roadmaps for every dev role and technology.",
    url:      "https://roadmap.sh",
    category: "Learn",
  },
  {
    name:     "devdocs.io",
    emoji:    "📚",
    desc:     "All your docs in one searchable, offline-capable place.",
    url:      "https://devdocs.io",
    category: "Learn",
  },
  {
    name:     "Frontend Mentor",
    emoji:    "🏆",
    desc:     "Real-world challenges to sharpen your HTML, CSS and JS skills.",
    url:      "https://frontendmentor.io",
    category: "Learn",
  },
  {
    name:     "JavaScript.info",
    emoji:    "📖",
    desc:     "The modern JavaScript tutorial — detailed, free and community-maintained.",
    url:      "https://javascript.info",
    category: "Learn",
  },

  /* ── APIs ───────────────────────────────────────────────── */
  {
    name:     "Hoppscotch",
    emoji:    "🐸",
    desc:     "Open-source API client. Lighter and faster alternative to Postman.",
    url:      "https://hoppscotch.io",
    category: "APIs",
  },
  {
    name:     "JSONPlaceholder",
    emoji:    "🗂️",
    desc:     "Free fake REST API for prototyping. No auth, instant responses.",
    url:      "https://jsonplaceholder.typicode.com",
    category: "APIs",
  },
  {
    name:     "Quicktype",
    emoji:    "⚡",
    desc:     "Paste JSON, get typed interfaces in TypeScript, Go, Rust and more.",
    url:      "https://quicktype.io",
    category: "APIs",
  },
  {
    name:     "Public APIs",
    emoji:    "🌐",
    desc:     "Curated directory of free public APIs across every category imaginable.",
    url:      "https://publicapis.dev",
    category: "APIs",
  },
];
