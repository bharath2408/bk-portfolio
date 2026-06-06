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
        setCount(typeof data.count === "number" ? data.count : null);
      }
    }

    register().then(poll);
    const interval = setInterval(() => { register(); poll(); }, 30_000);

    function handleUnload() {
      /* sendBeacon is POST-only — use a dedicated unregister endpoint */
      navigator.sendBeacon(
        "/api/presence/unregister",
        new Blob([JSON.stringify({ id })], { type: "application/json" }),
      );
    }

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
      fetch("/api/presence", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
        keepalive: true,
      });
    };
  }, []);

  /* null = KV not configured or still loading → hide */
  if (count === null) return null;

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-faint">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
      </span>
      {count === 1 ? "1 person viewing" : `${count} viewing now`}
    </span>
  );
}
