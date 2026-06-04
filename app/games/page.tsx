import type { Metadata } from "next";
import Link from "next/link";
import MemoryMatch from "@/components/MemoryMatch";

export const metadata: Metadata = {
  title: "Mini Game",
  description: "Tech Stack Memory Match — flip cards to find matching tech pairs.",
};

export default function GamesPage() {
  return (
    <main className="relative min-h-screen">
      {/* Back link */}
      <div className="mx-auto max-w-shell px-6 pt-6 md:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
        >
          <span>←</span>
          <span>Back to portfolio</span>
        </Link>
      </div>

      <MemoryMatch />
    </main>
  );
}
