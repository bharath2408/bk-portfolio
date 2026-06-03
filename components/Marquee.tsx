import { marqueeStack } from "@/lib/data";

export function Marquee({ items = marqueeStack }: { items?: string[] }) {
  const all = [...items, ...items];
  return (
    <div className="relative border-y border-line bg-bg-soft/60 py-5">
      <div
        className="flex overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
        }}
      >
        <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10">
          {all.map((t, i) => (
            <span
              key={i}
              className="whitespace-nowrap font-mono text-sm uppercase tracking-wider text-faint"
            >
              {t}
              <span className="ml-10 text-line-strong">/</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
