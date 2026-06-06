"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import Link from "next/link";
import { profile, experience, education, skillGroups, projects } from "@/lib/data";

type Line = { type: "input" | "output" | "error" | "system" | "ai"; text: string };

const BANNER = `
██████╗ ██╗  ██╗    ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗
██╔══██╗██║ ██╔╝    ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║
██████╔╝█████╔╝        ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║
██╔══██╗██╔═██╗        ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║
██████╔╝██║  ██╗       ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗
╚═════╝ ╚═╝  ╚═╝       ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝
`.trim();

const COMMANDS: Record<string, () => string[]> = {
  help: () => [
    "Available commands:",
    "",
    "  whoami       ·  About Bharatha Kumar",
    "  about        ·  Detailed bio",
    "  skills       ·  Tech stack",
    "  projects     ·  Key projects",
    "  experience   ·  Work history",
    "  education    ·  Academic background",
    "  contact      ·  Get in touch",
    "  resume       ·  View printable resume",
    "  socials      ·  Links",
    "  ls           ·  List portfolio pages",
    "  clear        ·  Clear terminal",
    "  matrix       ·  🟩 ???",
    "  secret       ·  ???",
    "",
    "  AI mode — type any question and Groq AI will answer it.",
    "  Examples: 'what is React?' · 'what stack does Bharatha use?' · 'explain Next.js'",
    "",
    "Tip: use ↑ / ↓ to navigate history",
  ],

  whoami: () => [
    `${profile.name}`,
    `${profile.role} · ${profile.location}`,
    `${profile.tagline}`,
  ],

  about: () => [profile.about],

  skills: () => [
    "Tech stack:",
    "",
    ...skillGroups.map((g) => `  ${g.title.padEnd(30)} ${g.items.join(", ")}`),
  ],

  projects: () => [
    "Key projects:",
    "",
    ...projects.flatMap((p) => [
      `  ▶ ${p.title} [${p.kind}]`,
      `    ${p.desc}`,
      `    ${p.tags.join(" · ")}`,
      "",
    ]),
  ],

  experience: () => [
    `${experience.role} @ ${experience.company}`,
    `${experience.place} · ${experience.period}`,
    "",
    experience.summary,
    "",
    ...experience.bullets.map((b) => `  • ${b}`),
  ],

  education: () => [
    `${education.degree}`,
    `${education.school} · ${education.year}`,
    `CGPA: ${education.cgpa}`,
  ],

  contact: () => [
    `Email    ${profile.email}`,
    `LinkedIn ${profile.linkedin}`,
    `Phone    ${profile.phone}`,
    "",
    "Or just use the contact form → /",
  ],

  resume: () => ["Opening resume…", "→ /resume"],

  socials: () => [
    `LinkedIn  ${profile.linkedin}`,
    `GitHub    https://github.com/bharath2408`,
    `Portfolio ${profile.siteUrl}`,
  ],

  ls: () => [
    "Portfolio pages:",
    "",
    "  /              Home",
    "  /guestbook     Sign the guestbook",
    "  /tools         Dev tools",
    "  /snippets      Code snippets",
    "  /resources     Dev resources",
    "  /games         Mini games",
    "  /resume        Printable resume",
    "  /terminal      You are here",
  ],

  matrix: () => ["[MATRIX MODE ACTIVATED]"],

  secret: () => [
    "You found it. 🎉",
    "",
    "This portfolio was built with Claude Code — Anthropic's AI coding agent.",
    "Every component, every animation, every feature, pair-coded with AI.",
    "The future of development is here.",
    "",
    "→ claude.ai/code",
  ],

  date:  () => [new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) + " IST"],
  pwd:   () => ["/home/bharatha/portfolio"],
  echo:  () => ["Usage: echo <message>"],
  vim:   () => ["Nope. We don't do that here. Use VS Code like a normal person."],
  nano:  () => ["That's even worse. Please open VS Code."],
  sudo:  () => ["Nice try. You don't have sudo access on this portfolio."],
  git:   () => ["git log --oneline: 50+ commits of pure vibe coding with Claude Code ☁️"],
  npm:   () => ["npm install happiness → installed 1337 packages in 0.42s"],
  node:  () => [`node v${Math.floor(Math.random() * 4 + 18)}.0.0`],
};

const AI_THINKING_ID = "__ai_thinking__";

export default function TerminalPage() {
  const [lines,   setLines]   = useState<Line[]>([
    { type: "system", text: BANNER },
    { type: "system", text: `BK Terminal v2.0.0  |  ${new Date().toLocaleDateString("en-IN")}  |  Groq AI enabled` },
    { type: "system", text: 'Type "help" to see available commands. Unknown commands are answered by AI.' },
    { type: "system", text: "" },
  ]);
  const [input,    setInput]    = useState("");
  const [history,  setHistory]  = useState<string[]>([]);
  const [histIdx,  setHistIdx]  = useState(-1);
  const [matrixOn, setMatrixOn] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const aiAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  async function askAI(query: string) {
    setAiLoading(true);
    aiAbortRef.current = new AbortController();

    // Add a live "thinking" placeholder line
    const thinkingLine: Line = { type: "ai", text: "ai ▶ thinking…" };
    setLines((p) => [...p, thinkingLine]);

    try {
      const res = await fetch("/api/terminal", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ query }),
        signal:  aiAbortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error("API error");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      // Replace the thinking line with streaming content
      setLines((p) => {
        const next = [...p];
        next[next.length - 1] = { type: "ai", text: "ai ▶ " };
        return next;
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const display = accumulated;
        setLines((p) => {
          const next = [...p];
          next[next.length - 1] = { type: "ai", text: "ai ▶ " + display };
          return next;
        });
      }

      // Final empty line separator
      setLines((p) => [...p, { type: "output", text: "" }]);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setLines((p) => {
        const next = [...p];
        next[next.length - 1] = { type: "error", text: "ai: connection failed. check your network." };
        return [...next, { type: "output", text: "" }];
      });
    } finally {
      setAiLoading(false);
    }
  }

  function run(cmd: string) {
    const trimmed = cmd.trim().toLowerCase();
    const newLines: Line[] = [{ type: "input", text: `visitor@bk-portfolio:~$ ${cmd}` }];

    if (!trimmed) {
      setLines((p) => [...p, ...newLines]);
      return;
    }

    if (trimmed === "clear") {
      setLines([{ type: "system", text: 'Type "help" to see available commands. Unknown commands are answered by AI.' }]);
      return;
    }

    if (trimmed === "matrix") {
      newLines.push({ type: "output", text: "Initiating matrix rain…" });
      setLines((p) => [...p, ...newLines]);
      setMatrixOn(true);
      setTimeout(() => setMatrixOn(false), 6000);
      return;
    }

    if (trimmed === "resume") {
      newLines.push(...["Opening resume…", "→ /resume"].map((t) => ({ type: "output" as const, text: t })));
      setLines((p) => [...p, ...newLines]);
      setTimeout(() => window.open("/resume", "_blank"), 800);
      return;
    }

    const handler = COMMANDS[trimmed];
    if (handler) {
      handler().forEach((t) => newLines.push({ type: "output", text: t }));
      newLines.push({ type: "output", text: "" });
      setLines((p) => [...p, ...newLines]);
      return;
    }

    // Unknown command → ask Groq AI
    setLines((p) => [...p, ...newLines]);
    askAI(cmd.trim());
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (aiLoading) return; // block while AI is responding
      const cmd = input.trim();
      if (cmd) setHistory((h) => [cmd, ...h]);
      setHistIdx(-1);
      run(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx);
      setInput(history[idx] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? "" : history[idx]);
    } else if (e.key === "c" && e.ctrlKey && aiLoading) {
      // Ctrl+C to abort AI stream
      aiAbortRef.current?.abort();
      setAiLoading(false);
      setLines((p) => [...p, { type: "error", text: "^C" }, { type: "output", text: "" }]);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#0a0a0f] font-mono text-sm text-[#00ff41] flex flex-col"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-[#00ff41]/20 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <div className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <span className="ml-2 text-xs text-[#00ff41]/60">
            visitor@bk-portfolio: ~
          </span>
        </div>
        <div className="flex items-center gap-4">
          {aiLoading && (
            <span className="text-xs text-[#facc15] animate-pulse">
              ⟳ AI thinking… (Ctrl+C to abort)
            </span>
          )}
          <Link
            href="/"
            className="text-xs text-[#00ff41]/50 hover:text-[#00ff41] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            ← Exit terminal
          </Link>
        </div>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-0">
        {lines.map((l, i) => (
          <div
            key={i}
            className={`whitespace-pre-wrap leading-relaxed ${
              l.type === "input"  ? "text-[#c4b5fd]" :
              l.type === "error"  ? "text-red-400" :
              l.type === "system" ? "text-[#00ff41]/70" :
              l.type === "ai"     ? "text-[#38bdf8]" :
              "text-[#00ff41]"
            }`}
          >
            {l.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-[#00ff41]/20 px-4 py-3">
        <span className="shrink-0 text-[#c4b5fd]">visitor@bk-portfolio:~$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={aiLoading}
          className="flex-1 bg-transparent outline-none text-[#00ff41] caret-[#00ff41] placeholder:text-[#00ff41]/30 disabled:opacity-50"
          placeholder={aiLoading ? "waiting for AI…" : "type a command or ask anything…"}
          autoComplete="off"
          spellCheck={false}
        />
        <span className={`text-[#00ff41] ${aiLoading ? "opacity-30" : "animate-pulse"}`}>█</span>
      </div>

      {/* Matrix overlay */}
      {matrixOn && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          <canvas
            ref={(c) => {
              if (!c) return;
              const ctx = c.getContext("2d")!;
              c.width = window.innerWidth; c.height = window.innerHeight;
              const chars = "01アイウBKBKBK@#$%";
              const fontSize = 14;
              const cols = Math.floor(c.width / fontSize);
              const drops = Array(cols).fill(1);
              const iv = setInterval(() => {
                ctx.fillStyle = "rgba(10,10,15,0.05)";
                ctx.fillRect(0,0,c.width,c.height);
                ctx.fillStyle = "#00ff41"; ctx.font = `${fontSize}px monospace`;
                drops.forEach((y, i) => {
                  ctx.fillText(chars[Math.floor(Math.random()*chars.length)], i*fontSize, y*fontSize);
                  if (y*fontSize > c.height && Math.random() > 0.975) drops[i] = 0;
                  drops[i]++;
                });
              }, 33);
              setTimeout(() => clearInterval(iv), 5800);
            }}
            className="absolute inset-0"
          />
        </div>
      )}
    </div>
  );
}
