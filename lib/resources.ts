export type Resource = {
  name: string;
  description: string;
  url: string;
  icon: string;
  category: "Tools" | "Docs" | "Learning" | "Design" | "AI" | "YouTube";
};

export const resources: Resource[] = [
  // Tools
  { category: "Tools", icon: "🎨", name: "Tailwind Play",      url: "https://play.tailwindcss.com",       description: "Interactive Tailwind CSS playground in the browser." },
  { category: "Tools", icon: "⚡", name: "Vite",               url: "https://vitejs.dev",                 description: "Blazing fast frontend build tool and dev server." },
  { category: "Tools", icon: "🔍", name: "Bundle Phobia",      url: "https://bundlephobia.com",           description: "Find the cost of adding an npm package to your bundle." },
  { category: "Tools", icon: "🖼", name: "Squoosh",            url: "https://squoosh.app",                description: "In-browser image compression and format conversion." },
  { category: "Tools", icon: "🎭", name: "Regex101",           url: "https://regex101.com",               description: "Build, test and debug regular expressions interactively." },
  { category: "Tools", icon: "🌈", name: "Coolors",            url: "https://coolors.co",                 description: "Generate beautiful, harmonious color palettes instantly." },
  { category: "Tools", icon: "📐", name: "CSS Grid Generator", url: "https://cssgrid-generator.netlify.app", description: "Visual CSS grid layout builder with copy-ready code." },
  { category: "Tools", icon: "🔧", name: "Transform.tools",   url: "https://transform.tools",            description: "Convert between JSON, TypeScript types, CSS, SVG and more." },

  // Docs
  { category: "Docs", icon: "📘", name: "MDN Web Docs",     url: "https://developer.mozilla.org",       description: "The definitive reference for HTML, CSS, and JavaScript." },
  { category: "Docs", icon: "⚛️", name: "React Docs",        url: "https://react.dev",                   description: "Official React documentation with interactive examples." },
  { category: "Docs", icon: "▲",  name: "Next.js Docs",     url: "https://nextjs.org/docs",             description: "Full documentation for the Next.js framework." },
  { category: "Docs", icon: "🔷", name: "TypeScript Docs",  url: "https://www.typescriptlang.org/docs", description: "Official TypeScript handbook and language reference." },
  { category: "Docs", icon: "💨", name: "Tailwind CSS Docs",url: "https://tailwindcss.com/docs",        description: "Complete Tailwind CSS utility class reference." },
  { category: "Docs", icon: "🎞", name: "Framer Motion",    url: "https://www.framer.com/motion",       description: "Animation library docs with live interactive examples." },

  // Learning
  { category: "Learning", icon: "🧑‍💻", name: "Josh W Comeau",       url: "https://www.joshwcomeau.com",           description: "In-depth CSS and React articles with incredible interactive demos." },
  { category: "Learning", icon: "🏆", name: "Kent C. Dodds",         url: "https://kentcdodds.com/blog",           description: "Testing, React patterns, and software quality best practices." },
  { category: "Learning", icon: "🎓", name: "Frontend Masters",      url: "https://frontendmasters.com",           description: "Expert-led courses on JavaScript, React, CSS, and performance." },
  { category: "Learning", icon: "🧩", name: "patterns.dev",          url: "https://www.patterns.dev",              description: "Modern JavaScript and React design patterns explained clearly." },
  { category: "Learning", icon: "📖", name: "web.dev",               url: "https://web.dev",                       description: "Google's guidance on modern web development and performance." },
  { category: "Learning", icon: "🔬", name: "JavaScript.info",       url: "https://javascript.info",               description: "Modern JavaScript tutorial from basics to advanced topics." },

  // Design
  { category: "Design", icon: "🎨", name: "Refactoring UI",    url: "https://www.refactoringui.com",    description: "Practical UI design tips for developers by the Tailwind creators." },
  { category: "Design", icon: "✏️", name: "Figma",             url: "https://www.figma.com",            description: "Collaborative design tool for UI, prototyping, and handoff." },
  { category: "Design", icon: "🌟", name: "Dribbble",          url: "https://dribbble.com",             description: "Design inspiration from top UI/UX designers worldwide." },
  { category: "Design", icon: "🎯", name: "UI Verse",          url: "https://uiverse.io",               description: "Community-built CSS and Tailwind UI components, free to use." },
  { category: "Design", icon: "📦", name: "shadcn/ui",         url: "https://ui.shadcn.com",            description: "Beautiful, accessible components you copy-paste into your app." },

  // AI
  { category: "AI", icon: "🤖", name: "Claude",           url: "https://claude.ai",          description: "Anthropic's AI assistant — great for code, writing, and analysis." },
  { category: "AI", icon: "⚡", name: "v0 by Vercel",     url: "https://v0.dev",             description: "Generate React UI components from a text prompt instantly." },
  { category: "AI", icon: "🐙", name: "GitHub Copilot",   url: "https://github.com/features/copilot", description: "AI pair programmer that suggests code directly in your editor." },
  { category: "AI", icon: "🧠", name: "Cursor",           url: "https://www.cursor.com",     description: "AI-first code editor built on VS Code for faster development." },
  { category: "AI", icon: "🔍", name: "Perplexity",       url: "https://www.perplexity.ai",  description: "AI search engine that cites sources — great for tech research." },

  // YouTube
  { category: "YouTube", icon: "🔥", name: "Fireship",        url: "https://www.youtube.com/@Fireship",       description: "100-second explainers and fast-paced dev news. Essential watch." },
  { category: "YouTube", icon: "🧑‍🏫", name: "Jack Herrington", url: "https://www.youtube.com/@jherr",          description: "Advanced React patterns, micro-frontends, and TypeScript deep dives." },
  { category: "YouTube", icon: "💅", name: "Kevin Powell",     url: "https://www.youtube.com/@KevinPowell",    description: "The internet's favourite CSS teacher. Clear, practical, no fluff." },
  { category: "YouTube", icon: "📡", name: "Theo — t3.gg",    url: "https://www.youtube.com/@t3dotgg",        description: "Opinionated takes on full-stack web dev, Next.js, and the T3 stack." },
  { category: "YouTube", icon: "🎯", name: "Web Dev Simplified",url: "https://www.youtube.com/@WebDevSimplified", description: "Clear explanations of JavaScript, React, and CSS for all levels." },
];

export const resourceCategories = ["All", "Tools", "Docs", "Learning", "Design", "AI", "YouTube"] as const;
export type ResourceCategory = (typeof resourceCategories)[number];
