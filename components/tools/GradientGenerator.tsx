"use client";

import { useState, useRef, useCallback } from "react";

/* ── Types ───────────────────────────────────────────────── */
interface Stop {
  id:    number;
  pos:   number;   // 0-100
  color: string;   // hex
  alpha: number;   // 0-100
}
type GType = "linear" | "radial" | "conic";

/* ── Helpers ─────────────────────────────────────────────── */
const hexToRgb = (h: string) => ({
  r: parseInt(h.slice(1,3),16),
  g: parseInt(h.slice(3,5),16),
  b: parseInt(h.slice(5,7),16),
});

const stopColor = (s: Stop) => {
  if (s.alpha === 100) return s.color;
  const {r,g,b} = hexToRgb(s.color);
  return `rgba(${r},${g},${b},${(s.alpha/100).toFixed(2)})`;
};

const buildCSS = (type: GType, angle: number, stops: Stop[]): string => {
  const sorted = [...stops].sort((a,b) => a.pos - b.pos);
  const str = sorted.map(s => `${stopColor(s)} ${s.pos}%`).join(", ");
  if (type === "linear") return `linear-gradient(${angle}deg, ${str})`;
  if (type === "radial")  return `radial-gradient(circle at center, ${str})`;
  return `conic-gradient(from ${angle}deg at center, ${str})`;
};

/* ── Presets ─────────────────────────────────────────────── */
const PRESETS = [
  { name:"Neon",   type:"linear" as GType, angle:135, stops:[{id:1,pos:0,color:"#7C5CFF",alpha:100},{id:2,pos:100,color:"#22D3EE",alpha:100}] },
  { name:"Sunset", type:"linear" as GType, angle:135, stops:[{id:1,pos:0,color:"#FF6B6B",alpha:100},{id:2,pos:100,color:"#FFE66D",alpha:100}] },
  { name:"Ocean",  type:"linear" as GType, angle:215, stops:[{id:1,pos:0,color:"#1a6cf5",alpha:100},{id:2,pos:100,color:"#020b2b",alpha:100}] },
  { name:"Aurora", type:"linear" as GType, angle:90,  stops:[{id:1,pos:0,color:"#00C9FF",alpha:100},{id:2,pos:100,color:"#92FE9D",alpha:100}] },
  { name:"Fire",   type:"linear" as GType, angle:90,  stops:[{id:1,pos:0,color:"#f12711",alpha:100},{id:2,pos:100,color:"#f5af19",alpha:100}] },
  { name:"Candy",  type:"linear" as GType, angle:135, stops:[{id:1,pos:0,color:"#f953c6",alpha:100},{id:2,pos:50,color:"#b91d73",alpha:100},{id:3,pos:100,color:"#FC6767",alpha:100}] },
  { name:"Mint",   type:"linear" as GType, angle:135, stops:[{id:1,pos:0,color:"#0BAB64",alpha:100},{id:2,pos:100,color:"#3BB78F",alpha:100}] },
  { name:"Dusk",   type:"radial" as GType, angle:0,   stops:[{id:1,pos:0,color:"#FC5C7D",alpha:100},{id:2,pos:100,color:"#6A3093",alpha:100}] },
] as const;

/* ── Angle Dial ──────────────────────────────────────────── */
function AngleDial({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  const calc = (cx: number, cy: number) => {
    if (!ref.current) return 0;
    const rect = ref.current.getBoundingClientRect();
    const a = Math.atan2(cx - (rect.left + rect.width/2), -(cy - (rect.top + rect.height/2))) * 180 / Math.PI;
    return Math.round(((a % 360) + 360) % 360);
  };

  const onPD = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    onChange(calc(e.clientX, e.clientY));
  };
  const onPM = (e: React.PointerEvent) => { if (e.buttons) onChange(calc(e.clientX, e.clientY)); };

  const rad = ((value - 90) * Math.PI) / 180;
  const x2 = 50 + 34 * Math.cos(rad);
  const y2 = 50 + 34 * Math.sin(rad);

  return (
    <div ref={ref} onPointerDown={onPD} onPointerMove={onPM}
      className="relative h-14 w-14 cursor-grab select-none rounded-full border border-line bg-surface-2 shadow-inner active:cursor-grabbing"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <circle cx="50" cy="50" r="4" fill="var(--c-iris)" />
        <line x1="50" y1="50" x2={x2} y2={y2} stroke="var(--c-iris)" strokeWidth="3" strokeLinecap="round" />
        <circle cx={x2} cy={y2} r="7" fill="var(--c-iris)" />
      </svg>
    </div>
  );
}

/* ── Component ───────────────────────────────────────────── */
let sid = 200;

export default function GradientGenerator() {
  const [type,   setType]   = useState<GType>("linear");
  const [angle,  setAngle]  = useState(135);
  const [stops,  setStops]  = useState<Stop[]>([
    { id: sid++, pos: 0,   color: "#7C5CFF", alpha: 100 },
    { id: sid++, pos: 100, color: "#22D3EE", alpha: 100 },
  ]);
  const [selId,  setSelId]  = useState<number>(stops[0].id);
  const [copied, setCopied] = useState(false);

  const barRef   = useRef<HTMLDivElement>(null);
  const dragging = useRef<{ id: number; moved: boolean } | null>(null);

  const selected = stops.find(s => s.id === selId) ?? stops[0];
  const css      = buildCSS(type, angle, stops);
  const barCss   = buildCSS("linear", 90, stops);

  /* drag */
  const startDrag = useCallback((e: React.PointerEvent, stopId: number) => {
    e.stopPropagation();
    e.preventDefault();
    dragging.current = { id: stopId, moved: false };
    setSelId(stopId);
    const onMove = (ev: PointerEvent) => {
      if (!barRef.current || !dragging.current) return;
      const rect = barRef.current.getBoundingClientRect();
      const p = Math.round(Math.min(100, Math.max(0, ((ev.clientX - rect.left) / rect.width) * 100)));
      dragging.current.moved = true;
      setStops(prev => prev.map(s => s.id === stopId ? { ...s, pos: p } : s));
    };
    const onUp = () => {
      setTimeout(() => { dragging.current = null; }, 50);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  /* click bar → add stop */
  const onBarClick = useCallback((e: React.MouseEvent) => {
    if (dragging.current?.moved) return;
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const pos = Math.round(Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)));
    const id = sid++;
    setStops(prev => [...prev, { id, pos, color: "#ffffff", alpha: 100 }]);
    setSelId(id);
  }, []);

  const removeStop = () => {
    if (stops.length <= 2) return;
    const next = stops.find(s => s.id !== selId)!;
    setStops(prev => prev.filter(s => s.id !== selId));
    setSelId(next.id);
  };

  const updateStop = (patch: Partial<Stop>) =>
    setStops(prev => prev.map(s => s.id === selId ? { ...s, ...patch } : s));

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    const ns = p.stops.map(s => ({ ...s, id: sid++ }));
    setType(p.type); setAngle(p.angle); setStops(ns); setSelId(ns[0].id);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(`background: ${css};`);
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">

      {/* Type tabs + Presets */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-line bg-surface-2 p-0.5">
          {(["linear","radial","conic"] as GType[]).map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
                type === t ? "bg-iris/20 text-iris" : "text-faint hover:text-muted"
              }`}
            >{t}</button>
          ))}
        </div>
        <span className="h-4 w-px bg-line" />
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map(p => (
            <button key={p.name} onClick={() => applyPreset(p)} title={p.name}
              className="relative h-7 w-16 overflow-hidden rounded-lg text-[10px] font-bold shadow transition-transform hover:scale-105"
              style={{ background: buildCSS(p.type, p.angle, p.stops as unknown as Stop[]) }}
            >
              <span className="absolute inset-0 flex items-center justify-center bg-black/25 text-white drop-shadow">
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="mb-5 h-52 w-full rounded-2xl shadow-2xl transition-all duration-300" style={{ background: css }} />

      {/* Gradient bar */}
      <div className="mb-1">
        <div ref={barRef} onClick={onBarClick}
          className="relative h-10 cursor-crosshair rounded-xl shadow-inner"
          style={{ background: barCss }}
          title="Click to add stop"
        >
          {stops.map(stop => (
            <div key={stop.id}
              onPointerDown={(e) => startDrag(e, stop.id)}
              onClick={(e) => { e.stopPropagation(); setSelId(stop.id); }}
              className={`absolute top-1/2 z-10 h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 shadow-lg transition-transform active:cursor-grabbing ${
                selId === stop.id
                  ? "border-white scale-125 ring-2 ring-white/40"
                  : "border-white/80 hover:scale-110"
              }`}
              style={{ left: `${stop.pos}%`, backgroundColor: stop.color }}
            />
          ))}
        </div>
      </div>
      <p className="mb-5 text-center font-mono text-[10px] text-faint">
        Click bar to add stop · Drag to move · Select + Remove to delete
      </p>

      {/* Controls */}
      <div className="mb-5 grid gap-5 sm:grid-cols-2">

        {/* Stop editor */}
        <div className="rounded-2xl border border-line bg-surface/60 p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-widest text-faint">
              Stop at {selected.pos}%
            </span>
            {stops.length > 2 && (
              <button onClick={removeStop}
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold text-red-400 hover:bg-red-500/20"
              >Remove</button>
            )}
          </div>
          <div className="flex flex-col gap-3.5">
            {/* Color */}
            <div className="flex items-center gap-3">
              <span className="w-16 font-mono text-xs text-faint">Color</span>
              <div className="relative">
                <div className="h-8 w-10 cursor-pointer rounded border border-white/10" style={{ backgroundColor: selected.color }} />
                <input type="color" value={selected.color}
                  onChange={(e) => updateStop({ color: e.target.value })}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </div>
              <input type="text" value={selected.color} maxLength={7}
                onChange={(e) => { if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) updateStop({ color: e.target.value }); }}
                className="w-24 rounded-lg border border-line bg-bg px-2.5 py-1.5 font-mono text-xs text-ink focus:border-iris/50 focus:outline-none"
              />
            </div>
            {/* Opacity */}
            <div className="flex items-center gap-3">
              <span className="w-16 font-mono text-xs text-faint">Opacity</span>
              <input type="range" min={0} max={100} value={selected.alpha}
                onChange={(e) => updateStop({ alpha: +e.target.value })}
                className="flex-1 cursor-pointer accent-iris"
              />
              <span className="w-8 text-right font-mono text-xs text-muted">{selected.alpha}%</span>
            </div>
            {/* Position */}
            <div className="flex items-center gap-3">
              <span className="w-16 font-mono text-xs text-faint">Position</span>
              <input type="range" min={0} max={100} value={selected.pos}
                onChange={(e) => updateStop({ pos: +e.target.value })}
                className="flex-1 cursor-pointer accent-iris"
              />
              <span className="w-8 text-right font-mono text-xs text-muted">{selected.pos}%</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Angle */}
          {type !== "radial" && (
            <div className="rounded-2xl border border-line bg-surface/60 p-4">
              <span className="mb-3 block font-mono text-xs uppercase tracking-widest text-faint">Angle</span>
              <div className="flex flex-wrap items-center gap-3">
                <AngleDial value={angle} onChange={setAngle} />
                <input type="number" min={0} max={359} value={angle}
                  onChange={(e) => setAngle(((+e.target.value % 360) + 360) % 360)}
                  className="w-16 rounded-lg border border-line bg-bg px-2 py-1.5 text-center font-mono text-sm text-ink focus:border-iris/50 focus:outline-none"
                />
                <div className="flex flex-wrap gap-1">
                  {[0,45,90,135,180,225,270,315].map(a => (
                    <button key={a} onClick={() => setAngle(a)}
                      className={`rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors ${angle === a ? "bg-iris/20 text-iris" : "text-faint hover:text-muted"}`}
                    >{a}°</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stops list */}
          <div className="flex-1 rounded-2xl border border-line bg-surface/60 p-4">
            <span className="mb-2 block font-mono text-xs uppercase tracking-widest text-faint">
              All Stops ({stops.length})
            </span>
            <div className="flex flex-col gap-1">
              {[...stops].sort((a,b) => a.pos - b.pos).map(s => (
                <button key={s.id} onClick={() => setSelId(s.id)}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors ${selId === s.id ? "bg-iris/10" : "hover:bg-surface"}`}
                >
                  <span className="h-4 w-4 flex-shrink-0 rounded-sm border border-white/10" style={{ backgroundColor: s.color }} />
                  <span className="font-mono text-xs text-muted">{s.color.toUpperCase()}</span>
                  {s.alpha < 100 && <span className="font-mono text-[10px] text-faint">{s.alpha}%</span>}
                  <span className="ml-auto font-mono text-xs text-faint">{s.pos}%</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Output */}
      <div className="rounded-2xl border border-line bg-surface/60 p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-faint">CSS Output</span>
          <button onClick={copy}
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
              copied ? "bg-mint/15 text-mint" : "border border-line bg-surface-2 text-muted hover:border-line-strong hover:text-ink"
            }`}
          >{copied ? "✓ Copied!" : "Copy CSS"}</button>
        </div>
        <pre className="overflow-x-auto rounded-xl bg-bg p-4 font-mono text-xs leading-relaxed text-muted">
          <code>{`background: ${css};`}</code>
        </pre>
      </div>
    </div>
  );
}
