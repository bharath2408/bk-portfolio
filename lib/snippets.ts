export type Snippet = {
  id: string;
  title: string;
  description: string;
  language: string;
  tag: "React" | "TypeScript" | "Next.js" | "Tailwind" | "Hooks";
  code: string;
};

export const snippets: Snippet[] = [
  {
    id: "use-local-storage",
    title: "useLocalStorage",
    tag: "Hooks",
    language: "typescript",
    description: "Syncs state with localStorage — survives page refreshes.",
    code: `import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}`,
  },
  {
    id: "use-debounce",
    title: "useDebounce",
    tag: "Hooks",
    language: "typescript",
    description: "Delays updating a value until the user stops typing.",
    code: `import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}`,
  },
  {
    id: "use-click-outside",
    title: "useClickOutside",
    tag: "Hooks",
    language: "typescript",
    description: "Calls a handler when clicking outside a referenced element.",
    code: `import { useEffect, RefObject } from "react";

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: () => void,
) {
  useEffect(() => {
    function listener(e: MouseEvent) {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    }
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}`,
  },
  {
    id: "use-media-query",
    title: "useMediaQuery",
    tag: "Hooks",
    language: "typescript",
    description: "Reactively tracks a CSS media query match.",
    code: `import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

// Usage
// const isMobile = useMediaQuery("(max-width: 768px)");`,
  },
  {
    id: "typed-fetch",
    title: "Typed fetch wrapper",
    tag: "TypeScript",
    language: "typescript",
    description: "Generic fetch with typed response and error handling.",
    code: `type Result<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export async function fetchJSON<T>(
  url: string,
  options?: RequestInit,
): Promise<Result<T>> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    const data = (await res.json()) as T;
    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

// Usage
// const { data, error } = await fetchJSON<User[]>("/api/users");`,
  },
  {
    id: "deep-partial",
    title: "DeepPartial utility type",
    tag: "TypeScript",
    language: "typescript",
    description: "Makes every nested property optional recursively.",
    code: `type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

// Usage
type Config = {
  theme: { color: string; size: number };
  debug: boolean;
};

type PartialConfig = DeepPartial<Config>;
// { theme?: { color?: string; size?: number }; debug?: boolean }`,
  },
  {
    id: "nextjs-isr",
    title: "Next.js ISR page",
    tag: "Next.js",
    language: "typescript",
    description: "Incremental Static Regeneration — revalidates every 60 seconds.",
    code: `import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "My Page",
};

async function getData() {
  const res = await fetch("https://api.example.com/data", {
    next: { revalidate: 60 },
  });
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <main>{JSON.stringify(data)}</main>;
}`,
  },
  {
    id: "nextjs-api-validation",
    title: "API route with validation",
    tag: "Next.js",
    language: "typescript",
    description: "Type-safe POST handler with field validation.",
    code: `import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email } = body;

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json(
      { error: "name and email are required" },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "invalid email" },
      { status: 422 },
    );
  }

  // ... do something
  return NextResponse.json({ ok: true });
}`,
  },
  {
    id: "tailwind-glass",
    title: "Glassmorphism card",
    tag: "Tailwind",
    language: "tsx",
    description: "Frosted glass card with backdrop blur.",
    code: `export function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="
      rounded-2xl border border-white/10
      bg-white/5 backdrop-blur-xl
      p-6 shadow-xl shadow-black/20
    ">
      {children}
    </div>
  );
}`,
  },
  {
    id: "tailwind-gradient-text",
    title: "Animated gradient text",
    tag: "Tailwind",
    language: "tsx",
    description: "Flowing gradient text with animation via custom CSS.",
    code: `// globals.css
// @keyframes gradient-x {
//   0%, 100% { background-position: 0% 50% }
//   50%       { background-position: 100% 50% }
// }

export function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400
                 bg-clip-text text-transparent bg-[length:200%_200%]"
      style={{ animation: "gradient-x 4s ease infinite" }}
    >
      {children}
    </span>
  );
}`,
  },
  {
    id: "react-optimistic",
    title: "Optimistic UI update",
    tag: "React",
    language: "typescript",
    description: "Update UI instantly, roll back if the server fails.",
    code: `import { useState } from "react";

type Item = { id: string; text: string };

export function useOptimisticList(initial: Item[]) {
  const [items, setItems] = useState(initial);

  async function addItem(text: string) {
    const temp: Item = { id: \`opt-\${Date.now()}\`, text };
    setItems((prev) => [temp, ...prev]);          // optimistic add

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" },
      });
      const real: Item = await res.json();
      setItems((prev) =>
        prev.map((i) => (i.id === temp.id ? real : i)), // replace with real
      );
    } catch {
      setItems((prev) => prev.filter((i) => i.id !== temp.id)); // rollback
    }
  }

  return { items, addItem };
}`,
  },
  {
    id: "react-compound",
    title: "Compound component pattern",
    tag: "React",
    language: "typescript",
    description: "Share implicit state across parent and child components.",
    code: `import { createContext, useContext, useState } from "react";

const Ctx = createContext<{ open: boolean; toggle: () => void } | null>(null);

function useCtx() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Must be used inside <Disclosure>");
  return ctx;
}

function Disclosure({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Ctx.Provider value={{ open, toggle: () => setOpen((v) => !v) }}>
      {children}
    </Ctx.Provider>
  );
}

function Trigger({ children }: { children: React.ReactNode }) {
  const { toggle } = useCtx();
  return <button onClick={toggle}>{children}</button>;
}

function Panel({ children }: { children: React.ReactNode }) {
  const { open } = useCtx();
  return open ? <div>{children}</div> : null;
}

Disclosure.Trigger = Trigger;
Disclosure.Panel  = Panel;
export { Disclosure };

// Usage:
// <Disclosure>
//   <Disclosure.Trigger>Toggle</Disclosure.Trigger>
//   <Disclosure.Panel>Content</Disclosure.Panel>
// </Disclosure>`,
  },
];
