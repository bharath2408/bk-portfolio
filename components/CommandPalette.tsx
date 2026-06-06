"use client";

import { useEffect, useState, useCallback } from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { navLinks, profile } from "@/lib/data";

/* ── Types ───────────────────────────────────────────────── */
type Group = "Navigation" | "Pages" | "Actions";
interface Cmd {
  id:       string;
  label:    string;
  hint:     string;
  icon:     string;
  group:    Group;
  onSelect: () => void | Promise<void>;
}

const GROUPS: Group[] = ["Navigation", "Pages", "Actions"];

/* ── CommandPalette ──────────────────────────────────────── */
export default function CommandPalette() {
  const [open,   setOpen]   = useState(false);
  const [copied, setCopied] = useState(false);
  const reduced             = useReducedMotion();
  const router              = useRouter();

  const close = useCallback(() => setOpen(false), []);

  /* ⌘K / Ctrl+K toggle */
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  /* Programmatic open from Navbar pill */
  useEffect(() => {
    const handle = () => setOpen(true);
    window.addEventListener("bk:palette" as keyof WindowEventMap, handle);
    return () => window.removeEventListener("bk:palette" as keyof WindowEventMap, handle);
  }, []);

  /* Esc to close */
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); close(); }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open, close]);

  /* Copy email action */
  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
    close();
  }, [close]);

  /* Navigate to anchor — works from any page */
  const goToSection = useCallback(
    (href: string) => {
      close();
      const el = document.getElementById(href.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push(`/${href}`);
      }
    },
    [close, router],
  );

  /* Command registry */
  const commands: Cmd[] = [
    ...navLinks.map((l) => ({
      id:       `nav-${l.href}`,
      label:    l.label,
      hint:     l.href,
      icon:     "#",
      group:    "Navigation" as const,
      onSelect: () => goToSection(l.href),
    })),
    {
      id:       "page-games",
      label:    "Mini Games",
      hint:     "/games",
      icon:     "🎮",
      group:    "Pages",
      onSelect: () => { close(); router.push("/games"); },
    },
    {
      id:       "page-tools",
      label:    "Dev Tools",
      hint:     "/tools",
      icon:     "🛠",
      group:    "Pages",
      onSelect: () => { close(); router.push("/tools"); },
    },
    {
      id:       "page-guestbook",
      label:    "Guestbook",
      hint:     "/guestbook",
      icon:     "✍️",
      group:    "Pages",
      onSelect: () => { close(); router.push("/guestbook"); },
    },
    {
      id:       "page-resume",
      label:    "View Resume",
      hint:     "/resume",
      icon:     "📄",
      group:    "Pages",
      onSelect: () => { close(); router.push("/resume"); },
    },
    {
      id:       "page-snippets",
      label:    "Code Snippets",
      hint:     "/snippets",
      icon:     "🧩",
      group:    "Pages",
      onSelect: () => { close(); router.push("/snippets"); },
    },
    {
      id:       "page-resources",
      label:    "Dev Resources",
      hint:     "/resources",
      icon:     "📚",
      group:    "Pages",
      onSelect: () => { close(); router.push("/resources"); },
    },
    {
      id:       "action-email",
      label:    copied ? "Copied!" : "Copy email",
      hint:     profile.email,
      icon:     copied ? "✓" : "⎘",
      group:    "Actions",
      onSelect: copyEmail,
    },
    {
      id:       "nav-timeline",
      label:    "Career Timeline",
      hint:     "#timeline",
      icon:     "⏱",
      group:    "Navigation" as const,
      onSelect: () => goToSection("#timeline"),
    },
    {
      id:       "action-linkedin",
      label:    "Open LinkedIn",
      hint:     "new tab ↗",
      icon:     "in",
      group:    "Actions",
      onSelect: () => { close(); window.open(profile.linkedin, "_blank", "noreferrer"); },
    },
  ];

  const dur = reduced ? 0 : 0.18;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="cp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: dur }}
            className="fixed inset-0 z-[9990] bg-bg/60 backdrop-blur-sm"
            aria-hidden
            onClick={close}
          />

          {/* ── Panel ── */}
          <motion.div
            key="cp-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, scale: reduced ? 1 : 0.96, y: reduced ? 0 : -10 }}
            animate={{ opacity: 1, scale: 1,                  y: 0               }}
            exit={{    opacity: 0, scale: reduced ? 1 : 0.96, y: reduced ? 0 : -10 }}
            transition={{ duration: dur, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-[18vh] z-[9991] w-[90vw] max-w-[520px] -translate-x-1/2"
          >
            <Command
              label="Command palette"
              className="overflow-hidden rounded-2xl border border-line bg-surface"
              style={{
                boxShadow:
                  "0 0 0 1px var(--c-line), 0 8px 64px rgba(0,0,0,0.85), 0 0 80px rgba(124,92,255,0.08)",
              }}
            >
              {/* Search input row */}
              <div className="flex items-center gap-3 border-b border-line px-4">
                <span
                  className="shrink-0 text-base text-faint"
                  aria-hidden
                  style={{ transform: "scaleX(-1)" }}
                >
                  ⌕
                </span>
                <Command.Input
                  placeholder="Search commands…"
                  autoFocus
                  className="flex-1 bg-transparent py-4 text-sm text-ink placeholder:text-faint focus:outline-none"
                />
                <kbd className="hidden shrink-0 rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-faint sm:block">
                  esc
                </kbd>
              </div>

              {/* List */}
              <Command.List className="max-h-[320px] overflow-y-auto px-2 py-2">
                <Command.Empty className="py-10 text-center text-sm text-faint">
                  No commands found.
                </Command.Empty>

                {GROUPS.map((group) => {
                  const items = commands.filter((c) => c.group === group);
                  return (
                    <Command.Group
                      key={group}
                      heading={group}
                      className="[&_[cmdk-group-heading]]:mb-1.5 [&_[cmdk-group-heading]]:mt-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-faint first:[&_[cmdk-group-heading]]:mt-0"
                    >
                      {items.map((cmd) => (
                        <Command.Item
                          key={cmd.id}
                          value={cmd.label}
                          onSelect={cmd.onSelect}
                          className="group flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition-colors aria-selected:bg-iris/10 aria-selected:text-ink"
                        >
                          {/* Icon badge */}
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-2 font-mono text-[11px] text-faint transition-colors group-aria-selected:border-iris/30 group-aria-selected:bg-iris/10 group-aria-selected:text-iris">
                            {cmd.icon}
                          </span>

                          {/* Label */}
                          <span className="flex-1 font-medium">{cmd.label}</span>

                          {/* Hint */}
                          <span className="ml-auto font-mono text-[10px] text-faint opacity-0 transition-opacity group-aria-selected:opacity-100">
                            {cmd.hint}
                          </span>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  );
                })}
              </Command.List>

              {/* Footer */}
              <div className="flex items-center gap-4 border-t border-line px-4 py-2.5">
                <span className="flex items-center gap-1 text-[10px] text-faint">
                  <kbd className="rounded border border-line bg-surface-2 px-1 font-mono text-[9px]">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1 text-[10px] text-faint">
                  <kbd className="rounded border border-line bg-surface-2 px-1 font-mono text-[9px]">↵</kbd>
                  select
                </span>
                <span className="ml-auto flex items-center gap-1 text-[10px] text-faint">
                  <kbd className="rounded border border-line bg-surface-2 px-1 font-mono text-[9px]">esc</kbd>
                  close
                </span>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
