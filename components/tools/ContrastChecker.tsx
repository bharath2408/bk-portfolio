"use client";

import { useState } from "react";

/* ── WCAG Math ───────────────────────────────────────────── */
const hexToRgb = (hex: string) => ({
  r: parseInt(hex.slice(1,3),16),
  g: parseInt(hex.slice(3,5),16),
  b: parseInt(hex.slice(5,7),16),
});

function hexToHsl(hex: string): [number,number,number] {
  const r=parseInt(hex.slice(1,3),16)/255, g=parseInt(hex.slice(3,5),16)/255, b=parseInt(hex.slice(5,7),16)/255;
  const max=Math.max(r,g,b), min=Math.min(r,g,b), l=(max+min)/2;
  let h=0,s=0;
  if(max!==min){const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);if(max===r)h=((g-b)/d+(g<b?6:0))/6;else if(max===g)h=((b-r)/d+2)/6;else h=((r-g)/d+4)/6;}
  return [Math.round(h*360),Math.round(s*100),Math.round(l*100)];
}

function hslToHex(h:number,s:number,l:number):string{
  l/=100;const a=(s*Math.min(l,1-l))/100;
  const f=(n:number)=>{const k=(n+h/30)%12;return Math.round(255*(l-a*Math.max(Math.min(k-3,9-k,1),-1))).toString(16).padStart(2,"0");};
  return `#${f(0)}${f(8)}${f(4)}`;
}

function linearize(c: number) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = luminance(fg), l2 = luminance(bg);
  return Math.round(((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05))*100)/100;
}

function suggestColor(fg: string, bg: string, target: number): string | null {
  const [h, s] = hexToHsl(fg);
  const bgLum  = luminance(bg);
  // Direction: if bg is dark, lighten fg; if bg is light, darken fg
  const goLight = bgLum < 0.18;
  const range   = goLight
    ? Array.from({length:101},(_,i) => 100-i)   // 100 → 0
    : Array.from({length:101},(_,i) => i);        // 0 → 100
  for (const l of range) {
    const c = hslToHex(h, s, l);
    if (contrastRatio(c, bg) >= target) return c;
  }
  return null;
}

/* ── WCAG Levels ─────────────────────────────────────────── */
const LEVELS = [
  { label:"AA Normal",  req:4.5, desc:"Text < 18pt" },
  { label:"AA Large",   req:3.0, desc:"Text ≥ 18pt or 14pt bold" },
  { label:"AAA Normal", req:7.0, desc:"Enhanced" },
  { label:"AAA Large",  req:4.5, desc:"Enhanced large text" },
];

/* ── Color Blindness ─────────────────────────────────────── */
const CB_MODES = [
  { id:"normal",        label:"Normal" },
  { id:"protanopia",    label:"Protanopia" },
  { id:"deuteranopia",  label:"Deuteranopia" },
  { id:"tritanopia",    label:"Tritanopia" },
  { id:"achromatopsia", label:"Grayscale" },
];
const CB_MATRIX: Record<string,string> = {
  protanopia:    "0.567 0.433 0     0 0  0.558 0.442 0     0 0  0     0.242 0.758 0 0  0 0 0 1 0",
  deuteranopia:  "0.625 0.375 0     0 0  0.700 0.300 0     0 0  0     0.300 0.700 0 0  0 0 0 1 0",
  tritanopia:    "0.950 0.050 0     0 0  0     0.433 0.567 0 0  0     0.475 0.525 0 0  0 0 0 1 0",
  achromatopsia: "0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0",
};

/* ── Quick Pairs ─────────────────────────────────────────── */
const QUICK_PAIRS = [
  { label:"Dark theme",  fg:"#FFFFFF", bg:"#0D0D14" },
  { label:"Portfolio",   fg:"#FFFFFF", bg:"#7C5CFF" },
  { label:"Amber alert", fg:"#1a1a00", bg:"#FFC107" },
  { label:"Ocean",       fg:"#E0F2FE", bg:"#0C4A6E" },
  { label:"Danger",      fg:"#FFFFFF", bg:"#DC2626" },
];

/* ── Color Input ─────────────────────────────────────────── */
function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const { r, g, b } = hexToRgb(value);
  const [h, s, l]   = hexToHsl(value);
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface/60 p-5">
      <span className="font-mono text-xs uppercase tracking-widest text-faint">{label}</span>
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="h-12 w-12 cursor-pointer rounded-xl border border-white/10 shadow-md" style={{ backgroundColor: value }} />
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <input type="text" value={value} maxLength={7}
            onChange={(e) => { if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) onChange(e.target.value); }}
            className="w-28 rounded-lg border border-line bg-bg px-2.5 py-1.5 font-mono text-sm text-ink focus:border-iris/50 focus:outline-none"
          />
          <span className="font-mono text-[10px] text-faint">rgb({r},{g},{b})</span>
          <span className="font-mono text-[10px] text-faint">hsl({h}°,{s}%,{l}%)</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────── */
export default function ContrastChecker() {
  const [fg,     setFg]     = useState("#FFFFFF");
  const [bg,     setBg]     = useState("#7C5CFF");
  const [cbMode, setCbMode] = useState("normal");
  const [copied, setCopied] = useState(false);

  const ratio   = contrastRatio(fg, bg);
  const passAA        = ratio >= 4.5;
  const passAALarge   = ratio >= 3.0;
  const passAAA       = ratio >= 7.0;
  const passAAALarge  = ratio >= 4.5;

  const fixAA  = !passAA  ? suggestColor(fg, bg, 4.5) : null;
  const fixAAA = !passAAA ? suggestColor(fg, bg, 7.0) : null;

  const swap = () => { setFg(bg); setBg(fg); };

  const copyPair = async () => {
    await navigator.clipboard.writeText(`fg: ${fg}\nbg: ${bg}\ncontrast: ${ratio}:1`);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  const filterAttr = cbMode !== "normal" ? `url(#cb-${cbMode})` : "none";

  /* gauge bar: clamp ratio display to 0-21 scale */
  const gaugeW = Math.min((ratio / 21) * 100, 100);
  const gaugeColor = passAAA ? "#34D399" : passAA ? "#22D3EE" : ratio >= 3 ? "#F59E0B" : "#F87171";

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">

      {/* Hidden SVG color-blindness filters */}
      <svg style={{ display:"none" }} aria-hidden>
        <defs>
          {Object.entries(CB_MATRIX).map(([id, matrix]) => (
            <filter key={id} id={`cb-${id}`}>
              <feColorMatrix type="matrix" values={matrix} />
            </filter>
          ))}
        </defs>
      </svg>

      {/* Quick pairs */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs text-faint">Quick pairs:</span>
        {QUICK_PAIRS.map(p => (
          <button key={p.label} onClick={() => { setFg(p.fg); setBg(p.bg); }}
            className="flex items-center gap-1.5 overflow-hidden rounded-full border border-line bg-surface-2 pr-3 text-xs font-medium text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            <span className="flex h-6 w-10">
              <span className="flex-1" style={{ backgroundColor: p.bg }} />
              <span className="flex-1" style={{ backgroundColor: p.fg }} />
            </span>
            {p.label}
          </button>
        ))}
      </div>

      {/* Color pickers */}
      <div className="mb-5 grid items-stretch gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <ColorInput label="Foreground (text)" value={fg} onChange={setFg} />
        <div className="flex items-center justify-center">
          <button onClick={swap}
            className="rounded-full border border-line bg-surface-2 px-3 py-2 text-sm transition-colors hover:border-line-strong"
            title="Swap fg/bg"
          >⇄</button>
        </div>
        <ColorInput label="Background" value={bg} onChange={setBg} />
      </div>

      {/* Ratio + WCAG badges */}
      <div className="mb-5 rounded-2xl border border-line bg-surface/60 p-6">
        <div className="mb-5 flex flex-wrap items-end gap-4">
          {/* Big number */}
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-faint">Contrast Ratio</p>
            <p className="font-display text-5xl font-extrabold" style={{ color: gaugeColor }}>
              {ratio.toFixed(2)}
              <span className="ml-1 font-sans text-2xl font-normal text-muted">:1</span>
            </p>
          </div>

          {/* Gauge */}
          <div className="flex-1 min-w-[180px]">
            <div className="relative h-3 overflow-hidden rounded-full bg-surface-2">
              {/* threshold markers */}
              <div className="absolute bottom-0 top-0 w-0.5 bg-amber-400/60" style={{ left:`${(3/21)*100}%` }} />
              <div className="absolute bottom-0 top-0 w-0.5 bg-cyan/60"       style={{ left:`${(4.5/21)*100}%` }} />
              <div className="absolute bottom-0 top-0 w-0.5 bg-mint/60"       style={{ left:`${(7/21)*100}%` }} />
              <div className="h-full rounded-full transition-all duration-500" style={{ width:`${gaugeW}%`, backgroundColor: gaugeColor }} />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[9px] text-faint px-0.5">
              <span>1</span>
              <span className="text-amber-400">3</span>
              <span className="text-cyan">4.5</span>
              <span className="text-mint">7</span>
              <span>21</span>
            </div>
          </div>

          <button onClick={copyPair}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${copied ? "bg-mint/15 text-mint" : "border border-line bg-surface-2 text-muted hover:text-ink"}`}
          >{copied ? "✓" : "Copy pair"}</button>
        </div>

        {/* WCAG badges */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label:"AA Normal",  pass: passAA,       req:"≥ 4.5:1", desc:"Body text" },
            { label:"AA Large",   pass: passAALarge,   req:"≥ 3.0:1", desc:"Large / bold text" },
            { label:"AAA Normal", pass: passAAA,       req:"≥ 7.0:1", desc:"Enhanced" },
            { label:"AAA Large",  pass: passAAALarge,  req:"≥ 4.5:1", desc:"Enhanced large" },
          ].map(lv => (
            <div key={lv.label}
              className={`rounded-xl border p-3 ${lv.pass ? "border-mint/30 bg-mint/8" : "border-red-500/20 bg-red-500/8"}`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`text-base leading-none ${lv.pass ? "text-mint" : "text-red-400"}`}>{lv.pass ? "✓" : "✗"}</span>
                <span className={`font-mono text-xs font-bold ${lv.pass ? "text-mint" : "text-red-400"}`}>{lv.label}</span>
              </div>
              <p className="mt-1 font-mono text-[10px] text-faint">{lv.desc}</p>
              <p className="font-mono text-[10px] text-faint">{lv.req}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Color blindness tabs + preview */}
      <div className="mb-5 overflow-hidden rounded-2xl border border-line bg-surface/60">
        <div className="flex flex-wrap border-b border-line">
          {CB_MODES.map(m => (
            <button key={m.id} onClick={() => setCbMode(m.id)}
              className={`px-4 py-2.5 text-xs font-semibold transition-colors ${cbMode === m.id ? "bg-iris/10 text-iris" : "text-faint hover:text-muted"}`}
            >{m.label}</button>
          ))}
        </div>

        {/* Live preview */}
        <div className="p-6" style={{ filter: filterAttr }}>
          <div className="rounded-xl p-6" style={{ backgroundColor: bg }}>
            {/* Header row */}
            <div className="mb-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full" style={{ backgroundColor: fg, opacity: 0.9 }} />
              <div>
                <p className="text-sm font-bold" style={{ color: fg }}>Bharatha Kumar</p>
                <p className="text-xs opacity-70" style={{ color: fg }}>Frontend Developer · Chennai</p>
              </div>
              <button className="ml-auto rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{ backgroundColor: fg, color: bg }}>Hire me</button>
            </div>

            {/* Type scale */}
            <p style={{ color: fg, fontSize:"36px", fontWeight:800, lineHeight:1.05, fontFamily:"var(--font-display)" }}>
              The quick brown fox
            </p>
            <p style={{ color: fg, fontSize:"22px", fontWeight:600, marginTop:"6px" }}>
              jumps over the lazy dog
            </p>
            <p style={{ color: fg, fontSize:"16px", marginTop:"8px", lineHeight:1.6, opacity:0.9 }}>
              Regular body text at 16px. Building responsive, production-grade web apps with Next.js and TypeScript.
            </p>
            <p style={{ color: fg, fontSize:"13px", marginTop:"6px", opacity:0.7 }}>
              Small text at 13px — captions, metadata, footnotes.
            </p>

            {/* UI elements */}
            <div className="mt-5 flex flex-wrap gap-3">
              <button className="rounded-lg px-4 py-2 text-sm font-semibold"
                style={{ backgroundColor: fg, color: bg }}>Primary</button>
              <button className="rounded-lg border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: fg, color: fg }}>Outline</button>
              <span className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: `${fg}22`, color: fg }}>Badge</span>
              <span className="text-sm" style={{ color: fg, textDecoration:"underline" }}>Link text</span>
            </div>

            {/* Input */}
            <div className="mt-4">
              <div className="rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: `${fg}50`, color: fg }}>
                Input placeholder text…
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-fix */}
      {(fixAA || fixAAA) && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-amber-400">✨ Auto-fix Suggestions</p>
          <p className="mb-3 font-mono text-[10px] text-faint">
            Adjusts foreground lightness while preserving its hue — click to apply.
          </p>
          <div className="flex flex-wrap gap-3">
            {fixAA && (
              <button onClick={() => setFg(fixAA)}
                className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm transition-all hover:border-line-strong hover:scale-[1.02]"
              >
                <span className="h-5 w-5 rounded-full border border-white/10" style={{ backgroundColor: fixAA }} />
                <span className="font-mono text-xs text-muted">{fixAA.toUpperCase()}</span>
                <span className="font-mono text-xs text-cyan">WCAG AA ({contrastRatio(fixAA,bg).toFixed(1)}:1)</span>
              </button>
            )}
            {fixAAA && (
              <button onClick={() => setFg(fixAAA)}
                className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm transition-all hover:border-line-strong hover:scale-[1.02]"
              >
                <span className="h-5 w-5 rounded-full border border-white/10" style={{ backgroundColor: fixAAA }} />
                <span className="font-mono text-xs text-muted">{fixAAA.toUpperCase()}</span>
                <span className="font-mono text-xs text-mint">WCAG AAA ({contrastRatio(fixAAA,bg).toFixed(1)}:1)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
