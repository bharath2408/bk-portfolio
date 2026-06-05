"use client";

import {
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
  role:    "user" | "assistant";
  content: string;
}

/* ── Suggested starter questions ─────────────────────────── */
const SUGGESTIONS = [
  "What has Bharatha built with TensorFlow.js?",
  "Does he know AWS?",
  "Tell me about his CRM project",
  "Is he open to new opportunities?",
];

/* ── Typing dots ─────────────────────────────────────────── */
function TypingDots({ reduced }: { reduced: boolean | null }) {
  return (
    <div className="flex items-center gap-1 px-1">
      {[0, 0.18, 0.36].map((delay, i) => (
        <motion.span
          key={i}
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
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const reduced   = useReducedMotion();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  /* Scroll to bottom whenever messages change */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }, [messages, loading, reduced]);

  /* Focus input when panel opens */
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  /* Close on Esc */
  useEffect(() => {
    if (!open) return;
    const handle = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open]);

  /* ── Send a message ─────────────────────────────────────── */
  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: next }),
      });

      const contentType = res.headers.get("content-type") ?? "";

      /* ── JSON fallback (error / key-missing) ────────────── */
      if (contentType.includes("application/json")) {
        const { content } = await res.json() as { content: string };
        setMessages((prev) => [...prev, { role: "assistant", content }]);
        setLoading(false);
        return;
      }

      /* ── Streamed plain-text response ───────────────────── */
      if (!res.body) throw new Error("No response body");

      // Plant empty assistant message — we'll grow it
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setLoading(false); // stop typing indicator once stream starts

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          return [
            ...prev.slice(0, -1),
            { ...last, content: last.content + chunk },
          ];
        });
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }, [loading, messages]);

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const isTyping = loading && (
    messages.length === 0 || messages[messages.length - 1].role === "user"
  );

  /* ── Panel animation variants ───────────────────────────── */
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
            className="flex w-[90vw] max-w-[360px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface/95 shadow-2xl backdrop-blur-xl"
            style={{ boxShadow: "0 0 60px rgba(124,92,255,0.15), 0 20px 40px rgba(0,0,0,0.7)", maxHeight: "520px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-iris/20 text-sm">
                  🤖
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-ink">Ask about {profile.name.split(" ")[0]}</p>
                  <p className="text-[10px] text-faint">Powered by Groq · Llama 3.3</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 text-[10px] text-faint transition-colors hover:text-ink"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3" style={{ minHeight: 200 }}>

              {/* Suggestions (shown when empty) */}
              {messages.length === 0 && !loading && (
                <div className="flex flex-col gap-2">
                  <p className="text-[11px] text-faint">Try asking:</p>
                  {SUGGESTIONS.map((s) => (
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

              {/* Message bubbles */}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-sm bg-iris/20 text-ink"
                        : "rounded-bl-sm border border-white/8 bg-bg/60 text-muted"
                    }`}
                  >
                    {m.content || (m.role === "assistant" && <TypingDots reduced={reduced} />)}
                  </div>
                </div>
              ))}

              {/* Typing indicator (waiting for first chunk) */}
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

            {/* Input */}
            <div className="border-t border-white/8 px-3 py-3 flex gap-2">
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
                disabled={!input.trim() || loading}
                className="flex h-9 w-9 items-center justify-center rounded-xl grad-bg text-bg disabled:opacity-40 disabled:cursor-not-allowed glow-btn"
                aria-label="Send"
              >
                ↑
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating toggle button ───────────────────────────── */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
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

        {/* Pulse ring when closed */}
        {!open && !reduced && (
          <motion.span
            animate={{ scale: [1, 1.7], opacity: [0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-iris/40 pointer-events-none"
          />
        )}
      </motion.button>
    </div>
  );
}
