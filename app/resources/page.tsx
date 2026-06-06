"use client";

import { useState } from "react";
import { resources, resourceCategories } from "@/lib/resources";
import type { ResourceCategory } from "@/lib/resources";

const catColors: Record<string, string> = {
  Tools:    "text-iris  border-iris/30  bg-iris/10",
  Docs:     "text-cyan  border-cyan/30  bg-cyan/10",
  Learning: "text-mint  border-mint/30  bg-mint/10",
  Design:   "text-iris  border-iris/30  bg-iris/10",
  AI:       "text-cyan  border-cyan/30  bg-cyan/10",
  YouTube:  "text-mint  border-mint/30  bg-mint/10",
};

export default function ResourcesPage() {
  const [active, setActive] = useState<ResourceCategory>("All");
  const [query,  setQuery]  = useState("");

  const filtered = resources.filter((r) => {
    const matchCat    = active === "All" || r.category === active;
    const matchSearch = !query ||
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.description.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchSearch;
  });

  const grouped = resourceCategories.slice(1).reduce<Record<string, typeof resources>>(
    (acc, cat) => {
      const items = filtered.filter((r) => r.category === cat);
      if (items.length) acc[cat] = items;
      return acc;
    },
    {},
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-24 md:px-10">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-4 py-1.5 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan" />
          <span className="font-mono text-xs text-muted">Dev Resources</span>
        </div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
          Resource hub
        </h1>
        <p className="mt-4 text-base text-muted max-w-xl mx-auto">
          The tools, docs, channels and communities I actually use. Curated, not exhaustive.
        </p>
      </div>

      {/* Search + filter */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {resourceCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                active === cat
                  ? "border-cyan bg-cyan/10 text-cyan"
                  : "border-line bg-surface-2 text-muted hover:border-line-strong hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          type="search"
          placeholder="Search resources…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-xl border border-line bg-surface-2 px-4 py-2 text-sm text-ink placeholder:text-faint focus:border-cyan/60 focus:outline-none focus:ring-1 focus:ring-cyan/30 sm:w-56"
        />
      </div>

      {/* Grouped sections */}
      {Object.keys(grouped).length === 0 ? (
        <p className="py-20 text-center text-muted">No resources match your search.</p>
      ) : (
        <div className="flex flex-col gap-12">
          {Object.entries(grouped).map(([cat, items]) => (
            <section key={cat}>
              <div className="mb-5 flex items-center gap-3">
                <h2 className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-faint">
                  {cat}
                </h2>
                <span className="flex-1 border-t border-line" />
                <span className="font-mono text-[11px] text-faint">{items.length}</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((r) => (
                  <a
                    key={r.name}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card group flex items-start gap-4 rounded-2xl border border-line bg-surface-2 p-4 transition-colors hover:border-line-strong"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-bg text-xl">
                      {r.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-ink group-hover:text-iris transition-colors truncate">
                          {r.name}
                        </span>
                        <span className={`shrink-0 rounded-full border px-2 py-px text-[10px] font-semibold ${catColors[r.category]}`}>
                          {r.category}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted line-clamp-2">
                        {r.description}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="mt-16 text-center font-mono text-xs text-faint">
        {resources.length} resources · always growing
      </p>
    </main>
  );
}
