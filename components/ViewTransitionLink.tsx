"use client";

import { useRouter } from "next/navigation";
import type { ReactNode, MouseEvent, CSSProperties } from "react";

interface Props {
  href:      string;
  children:  ReactNode;
  className?: string;
  style?:    CSSProperties;
}

/**
 * Drop-in <a> wrapper that navigates via the View Transitions API when
 * the browser supports it and the user has no reduced-motion preference.
 * Falls back to a plain router.push (and the Framer Motion template
 * transition) in all other cases — no visual breakage ever.
 */
export function ViewTransitionLink({ href, children, className, style }: Props) {
  const router = useRouter();

  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const hasVT =
      typeof document !== "undefined" &&
      "startViewTransition" in document;

    if (hasVT && !reduced) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).startViewTransition(() => router.push(href));
    } else {
      router.push(href);
    }
  };

  return (
    <a href={href} onClick={go} className={className} style={style}>
      {children}
    </a>
  );
}
