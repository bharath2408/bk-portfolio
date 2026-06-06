"use client";

import { useState } from "react";
import { snippets } from "@/lib/snippets";
import type { Snippet } from "@/lib/snippets";

const TAGS = ["All", "Hooks", "React", "TypeScript", "Next.js", "Tailwind"] as const;

const tagColors: Record<string, string> = {
  Hooks:      "bg-iris/10 text-iris border-iris/30",
  React:      "bg-cyan/10 text-cyan border-cyan/30",
  TypeScript: "bg-mint/10 text-mint border-mint/30",
  "Next.js":  "bg-iris/10 text-iris border-iris/30",
  Tailwind:   "bg-cyan/10 text-cyan border-cyan/30",
};

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={copy}
      className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 font-mono text-[11px] text-faint transition-colors hover:border-iris/50 hover:text-iris"
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function SnippetCard({ s }: { s: Snippet }) {
  const [expanded, setExpanded] = useState(false);
  const lines = s.code.split("\n");
  const preview = lines.slice(0, 8).join("\n");
  const hasMore = lines.length > 8;

  return (
    <div className="card flex flex-col rounded-2xl border border-line bg-surface-2 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tagColors[s.tag]}`}>
              {s.tag}
            </span>
            <span className="font-mono text-[11px] text-faint">.{s.language}</span>
          </div>
          <h3 className="mt-2 font-display text-base font-bold text-ink">{s.title}</h3>
          <p className="mt-0.5 text-sm text-muted">{s.description}</p>
        </div>
      </div>

      {/* Code block */}
      <div className="relative mx-5 mb-5 rounded-xl bg-[#0d0d14] border border-line overflow-hidden">
        <CopyButton code={s.code} />
        <pre className="overflow-x-auto p-4 pr-16 text-[13px] leading-relaxed">
          <code className="font-mono text-[#c0c0d8]">
            {expanded || !hasMore ? s.code : preview}
          </code>
        </pre>

        {hasMore && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full border-t border-line bg-surface/60 py-2 text-center font-mono text-[11px] text-faint transition-colors hover:text-iris"
          >
            {expanded ? "▲ Show less" : `▼ Show ${lines.length - 8} more lines`}
          </button>
        )}
      </div>
    </div>
  );
}

export default function SnippetsPage() {
  const [active, setActive] = useState<string>("All");
  const [query, setQuery]   = useState("");

  const filtered = snippets.filter((s) => {
    const matchTag  = active === "All" || s.tag === active;
    const matchSearch = !query || s.title.toLowerCase().includes(query.toLowerCase()) || s.description.toLowerCase().includes(query.toLowerCase());
    return matchTag && matchSearch;
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-24 md:px-10">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-4 py-1.5 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-iris" />
          <span className="font-mono text-xs text-muted">Code Snippets</span>
        </div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          Snippet library
        </h1>
        <p className="mt-4 text-base text-muted max-w-xl mx-auto">
          Reusable React, TypeScript, Next.js and Tailwind patterns. Copy, paste, ship.
        </p>
      </div>

      {/* Search + filter */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {TAGS.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                active === t
                  ? "border-iris bg-iris/10 text-iris"
                  : "border-line bg-surface-2 text-muted hover:border-line-strong hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <input
          type="search"
          placeholder="Search snippets…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-xl border border-line bg-surface-2 px-4 py-2 text-sm text-ink placeholder:text-faint focus:border-iris/60 focus:outline-none focus:ring-1 focus:ring-iris/30 sm:w-56"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted py-20">No snippets match your search.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((s) => <SnippetCard key={s.id} s={s} />)}
        </div>
      )}

      <p className="mt-16 text-center font-mono text-xs text-faint">
        {snippets.length} snippets · more added regularly
      </p>
    </main>
  );
}
