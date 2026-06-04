"use client";

import Link from "next/link";
import { useState } from "react";
import MemoryMatch  from "@/components/MemoryMatch";
import SnakeGame    from "@/components/SnakeGame";
import BugWhacker  from "@/components/BugWhacker";

const GAMES = [
  { id: "memory", label: "Memory Match", emoji: "🃏", desc: "Flip cards · Find pairs"   },
  { id: "snake",  label: "Code Runner",  emoji: "🐍", desc: "Eat the stack · Don't crash" },
  { id: "bugs",   label: "Bug Whacker",  emoji: "🐛", desc: "Squash bugs · 30 seconds"  },
] as const;

type GameId = (typeof GAMES)[number]["id"];

export default function GamesPage() {
  const [active, setActive] = useState<GameId>("memory");

  return (
    <main className="relative min-h-screen">
      {/* Back */}
      <div className="mx-auto max-w-shell px-6 pt-6 md:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
        >
          <span>←</span>
          <span>Back to portfolio</span>
        </Link>
      </div>

      {/* Game selector tabs */}
      <div className="mx-auto mt-6 flex max-w-xs gap-2 rounded-2xl border border-line bg-surface/60 p-1.5 backdrop-blur">
        {GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => setActive(g.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-3 py-2.5 text-center transition-all ${
              active === g.id
                ? "bg-iris/15 border border-iris/30 text-ink"
                : "text-muted hover:text-ink"
            }`}
          >
            <span className="text-lg leading-none">{g.emoji}</span>
            <span className="text-[11px] font-semibold">{g.label}</span>
            <span className="text-[9px] text-faint">{g.desc}</span>
          </button>
        ))}
      </div>

      {/* Active game */}
      {active === "memory" && <MemoryMatch />}
      {active === "snake"  && <SnakeGame />}
      {active === "bugs"   && <BugWhacker />}
    </main>
  );
}
