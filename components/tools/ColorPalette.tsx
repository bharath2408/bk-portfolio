"use client";

import { useState, useCallback } from "react";

/* ── Color math ──────────────────────────────────────────── */
function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if      (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else                h = ((r - g) / d + 4) / 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)))
      .toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToRgb(hex: string) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

function isLight(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return 0.299 * r + 0.587 * g + 0.114 * b > 155;
}

function randomVividHex(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 65 + Math.floor(Math.random() * 35);
  const l = 42 + Math.floor(Math.random() * 22);
  return hslToHex(h, s, l);
}

function getColorName(h: number, s: number, l: number): string {
  if (l < 8)  return "Near Black";
  if (l > 93) return "Near White";
  if (s < 12) return l < 40 ? "Dark Gray" : l > 70 ? "Light Gray" : "Gray";
  if (h >= 350 || h < 8)  return "Red";
  if (h < 18)  return "Red Orange";
  if (h < 35)  return "Orange";
  if (h < 52)  return "Amber";
  if (h < 70)  return "Yellow";
  if (h < 90)  return "Yellow Green";
  if (h < 145) return "Green";
  if (h < 165) return "Emerald";
  if (h < 185) return "Teal";
  if (h < 205) return "Cyan";
  if (h < 230) return "Sky Blue";
  if (h < 250) return "Blue";
  if (h < 270) return "Indigo";
  if (h < 295) return "Violet";
  if (h < 315) return "Purple";
  if (h < 335) return "Pink";
  return "Rose";
}

/* ── Shade scale ─────────────────────────────────────────── */
const SHADE_KEYS = ["50","100","200","300","400","500","600","700","800","900","950"] as const;

function generateShades(hex: string): Record<string, string> {
  const [h, s] = hexToHsl(hex);
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  return {
    "50":  hslToHex(h, clamp(s * 0.25, 5,  100), 97),
    "100": hslToHex(h, clamp(s * 0.35, 8,  100), 93),
    "200": hslToHex(h, clamp(s * 0.50, 12, 100), 86),
    "300": hslToHex(h, clamp(s * 0.70, 18, 100), 76),
    "400": hslToHex(h, clamp(s * 0.87, 25, 100), 65),
    "500": hslToHex(h, clamp(s * 1.00, 30, 100), 54),
    "600": hslToHex(h, clamp(s * 1.05, 35, 100), 44),
    "700": hslToHex(h, clamp(s * 1.05, 38, 100), 34),
    "800": hslToHex(h, clamp(s * 1.00, 35, 100), 25),
    "900": hslToHex(h, clamp(s * 0.90, 28, 100), 16),
    "950": hslToHex(h, clamp(s * 0.80, 22, 100), 10),
  };
}

/* ── Harmony palettes ────────────────────────────────────── */
const PALETTE_TYPES = ["Analogous","Complementary","Triadic","Split-Comp","Monochromatic"] as const;
type PaletteType = (typeof PALETTE_TYPES)[number];

function generateHarmony(base: string, type: PaletteType): string[] {
  const [h, s, l] = hexToHsl(base);
  switch (type) {
    case "Analogous":
      return [hslToHex((h-30+360)%360,s,l), base, hslToHex((h+30)%360,s,l), hslToHex((h+60)%360,s,l)];
    case "Complementary":
      return [base, hslToHex((h+60)%360,s,l), hslToHex((h+180)%360,s,l), hslToHex((h+240)%360,s,l)];
    case "Triadic":
      return [base, hslToHex((h+120)%360,s,l), hslToHex((h+240)%360,s,l)];
    case "Split-Comp":
      return [base, hslToHex((h+150)%360,s,l), hslToHex((h+180)%360,s,l), hslToHex((h+210)%360,s,l)];
    case "Monochromatic":
      return [
        hslToHex(h, s, Math.max(l-25,10)),
        hslToHex(h, s, Math.max(l-12,10)),
        base,
        hslToHex(h, s, Math.min(l+12,90)),
        hslToHex(h, s, Math.min(l+25,90)),
      ];
  }
}

/* ── Component ───────────────────────────────────────────── */
export default function ColorPalette() {
  const [base,        setBase]        = useState("#7C5CFF");
  const [hexInput,    setHexInput]    = useState("#7C5CFF");
  const [paletteType, setPaletteType] = useState<PaletteType>("Analogous");
  const [copied,      setCopied]      = useState<string | null>(null);
  const [exportMode,  setExportMode]  = useState<"css"|"tailwind"|"scss">("css");

  const [h, s, l]  = hexToHsl(base);
  const { r, g, b} = hexToRgb(base);
  const colorName   = getColorName(h, s, l);
  const palette     = generateHarmony(base, paletteType);
  const shades      = generateShades(base);

  const applyBase = (val: string) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setBase(val);
      setHexInput(val);
    }
  };

  const copy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1600);
  }, []);

  /* ── Export strings ── */
  const shadeName = colorName.toLowerCase().replace(/\s+/g, "-");

  const exportCss = SHADE_KEYS.map(
    (k) => `  --${shadeName}-${k}: ${shades[k]};`
  ).join("\n");

  const exportTailwind = SHADE_KEYS.map(
    (k) => `        '${k}': '${shades[k]}',`
  ).join("\n");

  const exportScss = SHADE_KEYS.map(
    (k) => `$${shadeName}-${k}: ${shades[k]};`
  ).join("\n");

  const exportStrings: Record<typeof exportMode, string> = {
    css:      `:root {\n${exportCss}\n}`,
    tailwind: `extend: {\n  colors: {\n    '${shadeName}': {\n${exportTailwind}\n    },\n  },\n}`,
    scss:     exportScss,
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">

      {/* ── Color input row ── */}
      <div className="mb-6 flex flex-wrap items-stretch gap-4 rounded-2xl border border-line bg-surface/60 p-5">
        {/* Picker + swatch */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className="h-16 w-16 cursor-pointer rounded-xl border-2 border-white/10 shadow-lg"
              style={{ backgroundColor: base }}
            />
            <input
              type="color"
              value={base}
              onChange={(e) => { setBase(e.target.value); setHexInput(e.target.value); }}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="font-display text-lg font-bold text-ink">{colorName}</p>
            {/* Hex editable */}
            <input
              type="text"
              value={hexInput}
              maxLength={7}
              onChange={(e) => {
                setHexInput(e.target.value);
                applyBase(e.target.value);
              }}
              className="w-28 rounded-lg border border-line bg-bg px-2.5 py-1 font-mono text-sm text-ink focus:border-iris/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Color values */}
        <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2">
          <button onClick={() => copy(`rgb(${r}, ${g}, ${b})`, "rgb")}
            className="flex flex-col text-left hover:opacity-80">
            <span className="font-mono text-[10px] uppercase tracking-widest text-faint">RGB</span>
            <span className="font-mono text-sm text-muted">
              {copied === "rgb" ? "Copied!" : `${r}, ${g}, ${b}`}
            </span>
          </button>
          <button onClick={() => copy(`hsl(${h}, ${s}%, ${l}%)`, "hsl")}
            className="flex flex-col text-left hover:opacity-80">
            <span className="font-mono text-[10px] uppercase tracking-widest text-faint">HSL</span>
            <span className="font-mono text-sm text-muted">
              {copied === "hsl" ? "Copied!" : `${h}°, ${s}%, ${l}%`}
            </span>
          </button>
          <button onClick={() => copy(base.toUpperCase(), "hex")}
            className="flex flex-col text-left hover:opacity-80">
            <span className="font-mono text-[10px] uppercase tracking-widest text-faint">HEX</span>
            <span className="font-mono text-sm text-muted">
              {copied === "hex" ? "Copied!" : base.toUpperCase()}
            </span>
          </button>
        </div>

        {/* Randomize */}
        <button
          onClick={() => {
            const c = randomVividHex();
            setBase(c);
            setHexInput(c);
          }}
          className="self-center rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-line-strong hover:text-ink"
        >
          🔀 Randomize
        </button>
      </div>

      {/* ── Harmony palette ── */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-faint">Harmony</span>
          <div className="flex flex-wrap gap-1.5">
            {PALETTE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setPaletteType(t)}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
                  paletteType === t
                    ? "border border-iris/40 bg-iris/15 text-iris"
                    : "border border-line bg-surface-2 text-faint hover:text-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${palette.length}, 1fr)` }}
        >
          {palette.map((color, i) => {
            const { r: cr, g: cg, b: cb } = hexToRgb(color);
            const [ch, cs, cl] = hexToHsl(color);
            const light = isLight(color);
            const textCol = light ? "#111" : "#fff";
            return (
              <div key={color + i} className="flex flex-col overflow-hidden rounded-2xl border border-white/8">
                {/* Swatch */}
                <button
                  onClick={() => copy(color, `sw-${i}`)}
                  className="group relative h-32 w-full transition-opacity hover:opacity-90 sm:h-44"
                  style={{ backgroundColor: color }}
                  title={`Copy ${color}`}
                >
                  <span
                    className="absolute inset-0 flex items-center justify-center text-sm font-bold opacity-0 transition-opacity group-hover:opacity-100"
                    style={{ color: textCol }}
                  >
                    {copied === `sw-${i}` ? "✓ Copied!" : "Copy"}
                  </span>
                </button>

                {/* Values */}
                <div className="flex flex-col gap-1 bg-surface/80 px-3 py-3">
                  <button
                    onClick={() => copy(color.toUpperCase(), `hex-${i}`)}
                    className="text-left font-mono text-xs font-bold text-ink hover:text-iris"
                  >
                    {copied === `hex-${i}` ? "✓" : color.toUpperCase()}
                  </button>
                  <button
                    onClick={() => copy(`rgb(${cr},${cg},${cb})`, `rgb2-${i}`)}
                    className="text-left font-mono text-[10px] text-faint hover:text-muted"
                  >
                    {copied === `rgb2-${i}` ? "✓" : `rgb(${cr},${cg},${cb})`}
                  </button>
                  <button
                    onClick={() => copy(`hsl(${ch},${cs}%,${cl}%)`, `hsl2-${i}`)}
                    className="text-left font-mono text-[10px] text-faint hover:text-muted"
                  >
                    {copied === `hsl2-${i}` ? "✓" : `hsl(${ch},${cs}%,${cl}%)`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Shade scale ── */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-faint">
            Shade Scale — {colorName}
          </span>
        </div>

        {/* Horizontal strip */}
        <div className="overflow-hidden rounded-2xl border border-white/8">
          <div className="flex">
            {SHADE_KEYS.map((k) => {
              const hex = shades[k];
              const light = isLight(hex);
              return (
                <button
                  key={k}
                  onClick={() => copy(hex, `shade-${k}`)}
                  className="group relative flex-1 py-10 transition-opacity hover:opacity-90"
                  style={{ backgroundColor: hex }}
                  title={`${k}: ${hex}`}
                >
                  <span
                    className="absolute bottom-2 left-0 right-0 text-center font-mono text-[9px] font-bold leading-none opacity-70 group-hover:opacity-100"
                    style={{ color: light ? "#000" : "#fff" }}
                  >
                    {copied === `shade-${k}` ? "✓" : k}
                  </span>
                </button>
              );
            })}
          </div>
          {/* Hex values row */}
          <div className="flex border-t border-white/8">
            {SHADE_KEYS.map((k) => {
              const hex = shades[k];
              return (
                <button
                  key={k}
                  onClick={() => copy(hex, `shade-${k}`)}
                  className="flex-1 bg-surface/80 px-0.5 py-2 text-center font-mono text-[8px] text-faint hover:text-muted"
                >
                  {hex.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Export ── */}
      <div className="rounded-2xl border border-line bg-surface/60 p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-faint">Export shade scale as</span>
          <div className="flex gap-1.5">
            {(["css","tailwind","scss"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setExportMode(m)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                  exportMode === m
                    ? "border border-iris/40 bg-iris/15 text-iris"
                    : "border border-line bg-surface-2 text-faint hover:text-muted"
                }`}
              >
                {m === "css" ? "CSS Vars" : m === "tailwind" ? "Tailwind" : "SCSS"}
              </button>
            ))}
          </div>
          <button
            onClick={() => copy(exportStrings[exportMode], "export")}
            className={`ml-auto rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
              copied === "export"
                ? "bg-mint/15 text-mint"
                : "border border-line bg-surface-2 text-muted hover:border-line-strong hover:text-ink"
            }`}
          >
            {copied === "export" ? "✓ Copied!" : "Copy"}
          </button>
        </div>

        <pre className="overflow-x-auto rounded-xl bg-bg p-4 font-mono text-[11px] leading-relaxed text-muted">
          <code>{exportStrings[exportMode]}</code>
        </pre>
      </div>
    </div>
  );
}
