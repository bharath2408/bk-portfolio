"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { profile } from "@/lib/data";

/* ── Types ───────────────────────────────────────────────── */
interface Message {
  role:      "user" | "assistant";
  content:   string;
  chips?:    string[];
  cta?:      boolean;
  timestamp?: number;
  reaction?: "up" | "down" | null;
}

/* ── Constants ───────────────────────────────────────────── */
const STORAGE_KEY = "bk_chat_v3";
const CHIPS_REGEX = /\nCHIPS:\s*(.+)$/;
const HIRE_REGEX  =
  /\b(hire|hiring|contact|reach|email|resume|cv|opportunity|work with|collaborate|available|job|position|freelance)\b/i;

const CATEGORY_CHIPS = [
  { label: "🛠 Skills",     msg: "What are Bharatha's main technical skills?" },
  { label: "🚀 Projects",   msg: "Tell me about his best projects" },
  { label: "💼 Experience", msg: "Tell me about Bharatha's work experience" },
  { label: "📧 Hire",       msg: "How can I hire or contact Bharatha?" },
];

const INITIAL_SUGGESTIONS = [
  "What has Bharatha built with TensorFlow.js?",
  "Does he know AWS?",
  "Tell me about his CRM project",
  "Is he open to new opportunities?",
];

/* ── Helpers ─────────────────────────────────────────────── */
function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Message[]) : [];
  } catch {
    return [];
  }
}
function saveMessages(msgs: Message[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs)); } catch {}
}
function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)   return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning! 🌅";
  if (h < 17) return "Good afternoon! ☀️";
  return "Good evening! 🌙";
}

/* ── Inline text (bold · code · link) ───────────────────── */
function InlineText({ text }: { text: string }) {
  const segments: React.ReactNode[] = [];
  const parts = text.split(
    /(\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]\n]+\]\([^)\n]+\))/g
  );
  parts.forEach((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      segments.push(
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    } else if (part.startsWith("`") && part.endsWith("`")) {
      segments.push(
        <code key={i} className="rounded bg-surface px-1 py-0.5 font-mono text-[10px] text-iris">
          {part.slice(1, -1)}
        </code>
      );
    } else if (/^\[[^\]]+\]\([^)]+\)$/.test(part)) {
      const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (m) {
        const ext = m[2].startsWith("http");
        segments.push(
          <a key={i} href={m[2]}
            target={ext ? "_blank" : undefined}
            rel={ext ? "noreferrer" : undefined}
            className="text-iris underline underline-offset-2 transition-colors hover:text-cyan">
            {m[1]}
          </a>
        );
      }
    } else {
      segments.push(<span key={i}>{part}</span>);
    }
  });
  return <>{segments}</>;
}

/* ── Full markdown renderer (lists · code blocks · headings) */
function MdText({ text }: { text: string }) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    /* Fenced code block */
    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      nodes.push(
        <pre key={`pre-${i}`}
          className="my-1.5 overflow-x-auto rounded-lg border border-white/6 bg-[#0d0d17] p-2.5 font-mono text-[11px] leading-relaxed text-emerald-400">
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    /* Bullet list */
    if (/^[-*•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*•]\s+/, ""));
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="my-1 space-y-0.5">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-1.5">
              <span className="mt-0.5 shrink-0 text-[10px] text-iris">▸</span>
              <span><InlineText text={item} /></span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    /* Numbered list */
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="my-1 space-y-0.5">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-1.5">
              <span className="min-w-[1.2rem] shrink-0 font-mono text-[11px] text-iris">
                {j + 1}.
              </span>
              <span><InlineText text={item} /></span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    /* Headings */
    if (line.startsWith("## ") || line.startsWith("# ")) {
      nodes.push(
        <p key={`h-${i}`} className="mt-2 font-bold text-ink">
          <InlineText text={line.replace(/^#+\s/, "")} />
        </p>
      );
      i++; continue;
    }
    if (line.startsWith("### ")) {
      nodes.push(
        <p key={`h3-${i}`} className="mt-1.5 text-[13px] font-semibold text-ink">
          <InlineText text={line.slice(4)} />
        </p>
      );
      i++; continue;
    }

    /* Empty line */
    if (!line.trim()) {
      if (nodes.length > 0) nodes.push(<span key={`gap-${i}`} className="block h-1.5" />);
      i++; continue;
    }

    /* Regular */
    nodes.push(<span key={`p-${i}`}><InlineText text={line} /></span>);
    i++;
  }

  return <>{nodes}</>;
}

/* ── Typing dots ─────────────────────────────────────────── */
function TypingDots({ reduced }: { reduced: boolean | null }) {
  return (
    <div className="flex items-center gap-1 px-1">
      {[0, 0.18, 0.36].map((delay, i) => (
        <motion.span key={i}
          animate={reduced ? {} : { y: [0, -4, 0] }}
          transition={{ duration: 0.55, repeat: Infinity, delay }}
          className="block h-1.5 w-1.5 rounded-full bg-iris/70"
        />
      ))}
    </div>
  );
}

/* ── Main widget ─────────────────────────────────────────── */
export default function ChatWidget() {
  const [open,          setOpen]          = useState(false);
  const [messages,      setMessages]      = useState<Message[]>([]);
  const [input,         setInput]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [rateLimited,   setRateLimited]   = useState(false);
  const [unread,        setUnread]        = useState(0);
  const [showPromo,     setShowPromo]     = useState(false);
  const [copiedIdx,     setCopiedIdx]     = useState<number | null>(null);
  const [autoScroll,    setAutoScroll]    = useState(true);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [, setTick] = useState(0);

  const reduced    = useReducedMotion();
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const scrollRef  = useRef<HTMLDivElement>(null);
  const hasLoaded  = useRef(false);
  const openRef    = useRef(false);

  useEffect(() => { openRef.current = open; }, [open]);

  /* Load from localStorage */
  useEffect(() => {
    const saved = loadMessages();
    if (saved.length > 0) setMessages(saved);
    hasLoaded.current = true;
  }, []);

  /* Persist */
  useEffect(() => {
    if (hasLoaded.current) saveMessages(messages);
  }, [messages]);

  /* Tick every minute */
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  /* Auto-scroll (only when user hasn't scrolled up) */
  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    }
  }, [messages, loading, autoScroll, reduced]);

  /* Focus input on open */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  /* Esc to close */
  useEffect(() => {
    if (!open) return;
    const handle = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open]);

  /* Proactive greeting — once per session, 30 s after load */
  useEffect(() => {
    if (sessionStorage.getItem("bk_promo_shown")) return;
    const show = setTimeout(() => {
      if (openRef.current) return;
      setShowPromo(true);
      sessionStorage.setItem("bk_promo_shown", "1");
      const hide = setTimeout(() => setShowPromo(false), 8_000);
      return () => clearTimeout(hide);
    }, 30_000);
    return () => clearTimeout(show);
  }, []);

  useEffect(() => { if (open) setShowPromo(false); }, [open]);

  /* ── Scroll detection ─────────────────────────────────── */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setAutoScroll(atBottom);
    setShowScrollBtn(!atBottom && messages.length > 2);
  }, [messages.length]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setAutoScroll(true);
    setShowScrollBtn(false);
  }, []);

  /* ── Handlers ─────────────────────────────────────────── */
  const handleToggle = useCallback(() => {
    setOpen((o) => {
      if (!o) setUnread(0);
      return !o;
    });
    setShowPromo(false);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  const copy = useCallback(async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {}
  }, []);

  const setReaction = useCallback((idx: number, r: "up" | "down") => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === idx ? { ...m, reaction: m.reaction === r ? null : r } : m
      )
    );
  }, []);

  /* ── Send ─────────────────────────────────────────────── */
  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading || rateLimited) return;

      const hasCta  = HIRE_REGEX.test(trimmed);
      const userMsg: Message = { role: "user", content: trimmed, timestamp: Date.now() };
      const next    = [...messages, userMsg];
      setMessages(next);
      setInput("");
      setLoading(true);
      setError(null);
      setAutoScroll(true);
      setShowScrollBtn(false);

      setRateLimited(true);
      setTimeout(() => setRateLimited(false), 1500);

      const apiMessages = next.map(({ role, content }) => ({ role, content }));

      try {
        const res = await fetch("/api/chat", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ messages: apiMessages }),
        });

        const ct = res.headers.get("content-type") ?? "";

        /* JSON fallback */
        if (ct.includes("application/json")) {
          const { content } = (await res.json()) as { content: string };
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content, cta: hasCta, timestamp: Date.now() },
          ]);
          setLoading(false);
          if (!openRef.current) setUnread((u) => u + 1);
          return;
        }

        if (!res.body) throw new Error("No response body");

        /* Streaming */
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "", timestamp: Date.now() },
        ]);
        setLoading(false);

        const reader      = res.body.getReader();
        const decoder     = new TextDecoder();
        let   accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          const display = accumulated.replace(CHIPS_REGEX, "").trim();
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            return [...prev.slice(0, -1), { ...last, content: display }];
          });
        }

        const chipsMatch = accumulated.match(CHIPS_REGEX);
        const display    = accumulated.replace(CHIPS_REGEX, "").trim();
        const chips      = chipsMatch
          ? chipsMatch[1].split("|").map((s) => s.trim()).filter(Boolean).slice(0, 3)
          : [];

        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, content: display, chips, cta: hasCta }];
        });

        if (!openRef.current) setUnread((u) => u + 1);
      } catch {
        setError("Something went wrong. Please try again.");
        setLoading(false);
      }
    },
    [loading, messages, rateLimited]
  );

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const isTyping    = loading && (messages.length === 0 || messages[messages.length - 1].role === "user");
  const hasMessages = messages.length > 0;

  const panelVariants = {
    hidden:  { opacity: 0, y: reduced ? 0 : 16, scale: reduced ? 1 : 0.97 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit:    { opacity: 0, y: reduced ? 0 : 10, scale: reduced ? 1 : 0.97 },
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">

      {/* ── Chat panel ──────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-[90vw] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface/95 shadow-2xl backdrop-blur-xl"
            style={{
              boxShadow: "0 0 60px rgba(124,92,255,0.15), 0 20px 40px rgba(0,0,0,0.7)",
              maxHeight: "600px",
            }}
          >
            {/* ── Header ── */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-iris/20 text-sm">
                  🤖
                  {/* Online status dot */}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-surface bg-emerald-400" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-ink">
                    Ask about {profile.name.split(" ")[0]}
                  </p>
                  <p className="text-[10px] text-faint">Powered by Groq · Llama 3.3</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Clear */}
                {hasMessages && (
                  <button
                    onClick={clearChat}
                    aria-label="Clear conversation"
                    title="Clear conversation"
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 text-[10px] text-faint transition-colors hover:border-red-400/30 hover:text-red-400"
                  >
                    🗑
                  </button>
                )}
                {/* Close */}
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 text-[10px] text-faint transition-colors hover:text-ink"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* ── Category chips ── */}
            <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-white/6 px-4 py-2">
              {CATEGORY_CHIPS.map((c) => (
                <button
                  key={c.label}
                  onClick={() => send(c.msg)}
                  disabled={loading}
                  className="shrink-0 rounded-full border border-white/10 bg-surface-2 px-2.5 py-1 text-[11px] text-faint transition-colors hover:border-iris/30 hover:text-iris disabled:opacity-40"
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* ── Messages ── */}
            <div className="relative flex flex-1 flex-col overflow-hidden">
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3"
                style={{ minHeight: 200 }}
              >
                {/* Initial suggestions */}
                {!hasMessages && !loading && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[11px] text-faint">Try asking:</p>
                    {INITIAL_SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-xl border border-iris/20 bg-iris/5 px-3 py-2 text-left text-[12px] text-muted transition-colors hover:border-iris/40 hover:text-ink"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {messages.map((m, i) => (
                  <div key={i} className="flex flex-col gap-1">

                    {/* Bubble + copy */}
                    <div className={`group flex items-start gap-1.5 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                          m.role === "user"
                            ? "rounded-br-sm bg-iris/20 text-ink"
                            : "rounded-bl-sm border border-white/8 bg-bg/60 text-muted"
                        }`}
                      >
                        {m.content ? (
                          <MdText text={m.content} />
                        ) : (
                          m.role === "assistant" && <TypingDots reduced={reduced} />
                        )}
                      </div>

                      {/* Copy — assistant only, on hover */}
                      {m.role === "assistant" && m.content && (
                        <button
                          onClick={() => copy(m.content, i)}
                          aria-label={copiedIdx === i ? "Copied!" : "Copy"}
                          title={copiedIdx === i ? "Copied!" : "Copy"}
                          className="mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/8 bg-surface/60 text-[11px] text-faint opacity-0 transition-all group-hover:opacity-100 hover:border-iris/30 hover:text-iris"
                        >
                          {copiedIdx === i ? "✓" : "⎘"}
                        </button>
                      )}
                    </div>

                    {/* Timestamp */}
                    {m.timestamp && (
                      <p
                        className={`text-[10px] text-faint ${m.role === "user" ? "pr-1 text-right" : "pl-1"}`}
                        suppressHydrationWarning
                      >
                        {timeAgo(m.timestamp)}
                      </p>
                    )}

                    {/* Reactions — assistant only */}
                    {m.role === "assistant" && m.content && (
                      <div className="flex gap-1 pl-1">
                        <button
                          onClick={() => setReaction(i, "up")}
                          title="Helpful"
                          className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] transition-all ${
                            m.reaction === "up"
                              ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-400"
                              : "border-white/10 text-faint hover:border-emerald-400/30 hover:text-emerald-400"
                          }`}
                        >
                          👍
                        </button>
                        <button
                          onClick={() => setReaction(i, "down")}
                          title="Not helpful"
                          className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] transition-all ${
                            m.reaction === "down"
                              ? "border-red-400/50 bg-red-400/15 text-red-400"
                              : "border-white/10 text-faint hover:border-red-400/30 hover:text-red-400"
                          }`}
                        >
                          👎
                        </button>
                      </div>
                    )}

                    {/* Smart CTAs */}
                    {m.role === "assistant" && m.cta && m.content && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="mt-1 flex gap-2 pl-1"
                      >
                        <a
                          href="/#contact"
                          onClick={() => setOpen(false)}
                          className="rounded-lg border border-iris/30 bg-iris/10 px-3 py-1.5 text-[11px] font-semibold text-iris transition-colors hover:bg-iris/20"
                        >
                          Open Contact ↗
                        </a>
                        <a
                          href={`mailto:${profile.email}`}
                          className="rounded-lg border border-white/10 bg-surface px-3 py-1.5 text-[11px] font-semibold text-muted transition-colors hover:text-ink"
                        >
                          Email directly
                        </a>
                      </motion.div>
                    )}

                    {/* Follow-up chips */}
                    {m.role === "assistant" && m.chips && m.chips.length > 0 && m.content && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className="mt-1 flex flex-wrap gap-1.5 pl-1"
                      >
                        {m.chips.map((chip) => (
                          <button
                            key={chip}
                            onClick={() => send(chip)}
                            className="rounded-full border border-white/10 bg-surface-2 px-2.5 py-1 text-[11px] text-faint transition-colors hover:border-iris/30 hover:text-iris"
                          >
                            {chip}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm border border-white/8 bg-bg/60 px-3.5 py-2.5">
                      <TypingDots reduced={reduced} />
                    </div>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <p className="text-center text-[11px] text-red-400">{error}</p>
                )}

                <div ref={bottomRef} />
              </div>

              {/* ── Scroll-to-bottom pill ── */}
              <AnimatePresence>
                {showScrollBtn && (
                  <motion.button
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    onClick={scrollToBottom}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-iris/30 bg-surface/95 px-3 py-1 text-[11px] font-medium text-iris shadow-lg backdrop-blur transition-colors hover:bg-iris/10"
                  >
                    ↓ New messages
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* ── Input ── */}
            <div className="flex shrink-0 gap-2 border-t border-white/8 px-3 py-3">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask something…"
                disabled={loading}
                className="flex-1 rounded-xl border border-white/8 bg-bg/60 px-3 py-2 text-[13px] text-ink placeholder:text-faint focus:border-iris/40 focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || loading || rateLimited}
                aria-label="Send"
                className="glow-btn flex h-9 w-9 items-center justify-center rounded-xl grad-bg text-bg disabled:cursor-not-allowed disabled:opacity-40"
              >
                ↑
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Proactive greeting ───────────────────────────────── */}
      <AnimatePresence>
        {showPromo && (
          <motion.div
            key="promo"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-surface/95 px-4 py-3 shadow-xl backdrop-blur-xl"
            style={{ boxShadow: "0 0 40px rgba(124,92,255,0.12), 0 8px 24px rgba(0,0,0,0.6)" }}
          >
            <button onClick={handleToggle} className="flex items-center gap-3 text-left">
              <span className="text-lg">👋</span>
              <div>
                <p className="text-[12px] font-semibold leading-tight text-ink">
                  {getGreeting()}
                </p>
                <p className="text-[11px] text-faint">Ask me about Bharatha</p>
              </div>
            </button>
            <button
              onClick={() => setShowPromo(false)}
              aria-label="Dismiss"
              className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 text-[9px] text-faint transition-colors hover:text-ink"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating toggle ──────────────────────────────────── */}
      <motion.button
        onClick={handleToggle}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        whileHover={reduced ? {} : { scale: 1.08 }}
        whileTap={reduced  ? {} : { scale: 0.94 }}
        className="glow-btn relative flex h-12 w-12 items-center justify-center rounded-full grad-bg text-bg shadow-lg"
        style={{ boxShadow: open ? "0 0 0 2px rgba(124,92,255,0.5)" : undefined }}
      >
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: reduced ? 0 : 0.22 }}
          className="text-lg leading-none"
        >
          {open ? "✕" : "💬"}
        </motion.span>

        {/* Pulse ring */}
        {!open && !reduced && (
          <motion.span
            animate={{ scale: [1, 1.7], opacity: [0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="pointer-events-none absolute inset-0 rounded-full bg-iris/40"
          />
        )}

        {/* Unread badge */}
        <AnimatePresence>
          {!open && unread > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white"
            >
              {unread > 9 ? "9+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
