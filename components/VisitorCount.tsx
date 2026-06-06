"use client";

import { useEffect, useRef, useState } from "react";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function VisitorCount() {
  const [count, setCount] = useState<number | null>(null);
  const idRef = useRef<string>("");

  useEffect(() => {
    idRef.current = uid();
    const id = idRef.current;

    async function register() {
      await fetch("/api/presence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    }

    async function poll() {
      const res = await fetch("/api/presence");
      if (res.ok) {
        const data = await res.json();
        setCount(data.count ?? 0);
      }
    }

    async function unregister() {
      navigator.sendBeacon(
        "/api/presence",
        new Blob([JSON.stringify({ id })], { type: "application/json" }),
      );
    }

    register().then(poll);
    const interval = setInterval(() => { register(); poll(); }, 30_000);
    window.addEventListener("beforeunload", unregister);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", unregister);
      fetch("/api/presence", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        keepalive: true,
      });
    };
  }, []);

  /* hide if KV not configured (count stays 0) or still loading */
  if (count === null || count === 0) return null;

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-faint">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
      </span>
      {count} viewing now
    </span>
  );
}
