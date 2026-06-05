"use client";

import { useState, useCallback } from "react";

interface ShadowLayer {
  id:      number;
  x:       number;
  y:       number;
  blur:    number;
  spread:  number;
  color:   string;
  opacity: number;
  inset:   boolean;
}

let uid = 1;

function layerToCss(s: ShadowLayer): string {
  const r = parseInt(s.color.slice(1, 3), 16);
  const g = parseInt(s.color.slice(3, 5), 16);
  const b = parseInt(s.color.slice(5, 7), 16);
  const a = (s.opacity / 100).toFixed(2);
  return `${s.inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px rgba(${r},${g},${b},${a})`;
}

function defaultLayer(): ShadowLayer {
  return { id: uid++, x: 0, y: 8, blur: 24, spread: 0, color: "#000000", opacity: 40, inset: false };
}

function Slider({
  label, min, max, value, onChange,
}: {
  label: string; min: number; max: number; value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-right font-mono text-xs text-faint">{label}</span>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 flex-1 cursor-pointer accent-iris"
      />
      <span className="w-10 shrink-0 font-mono text-xs text-muted">{value}</span>
    </div>
  );
}

export default function BoxShadow() {
  const [layers,  setLayers]  = useState<ShadowLayer[]>([defaultLayer()]);
  const [active,  setActive]  = useState(0);
  const [copied,  setCopied]  = useState(false);

  const update = useCallback((id: number, patch: Partial<ShadowLayer>) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const addLayer   = () => {
    const l = defaultLayer();
    setLayers((prev) => [...prev, l]);
    setActive(layers.length);
  };
  const removeLayer = (idx: number) => {
    if (layers.length === 1) return;
    setLayers((prev) => prev.filter((_, i) => i !== idx));
    setActive(Math.max(0, active - 1));
  };

  const cssValue = layers.map(layerToCss).join(",\n      ");
  const fullCss  = `box-shadow: ${cssValue};`;

  const copy = async () => {
    await navigator.clipboard.writeText(fullCss);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const layer = layers[active];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 md:px-10">
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">

        {/* ── Controls ── */}
        <div className="flex flex-col gap-5">
          {/* Layer tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {layers.map((l, i) => (
              <div key={l.id} className="flex items-center">
                <button
                  onClick={() => setActive(i)}
                  className={`rounded-l-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    active === i
                      ? "border-iris/50 bg-iris/10 text-iris"
                      : "border-line bg-surface-2 text-muted hover:text-ink"
                  }`}
                >
                  Layer {i + 1}
                </button>
                {layers.length > 1 && (
                  <button
                    onClick={() => removeLayer(i)}
                    className={`rounded-r-lg border-y border-r px-2 py-1.5 text-xs transition-colors hover:bg-red-500/10 hover:text-red-400 ${
                      active === i ? "border-iris/50" : "border-line"
                    }`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {layers.length < 4 && (
              <button
                onClick={addLayer}
                className="rounded-lg border border-dashed border-line px-3 py-1.5 text-xs text-faint transition-colors hover:border-line-strong hover:text-muted"
              >
                + Add
              </button>
            )}
          </div>

          {/* Sliders */}
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface/60 p-5">
            <Slider label="X"      min={-80} max={80}  value={layer.x}      onChange={(v) => update(layer.id, { x: v })} />
            <Slider label="Y"      min={-80} max={80}  value={layer.y}      onChange={(v) => update(layer.id, { y: v })} />
            <Slider label="Blur"   min={0}   max={120} value={layer.blur}   onChange={(v) => update(layer.id, { blur: v })} />
            <Slider label="Spread" min={-40} max={60}  value={layer.spread} onChange={(v) => update(layer.id, { spread: v })} />
            <Slider label="Opacity" min={0}  max={100} value={layer.opacity} onChange={(v) => update(layer.id, { opacity: v })} />

            {/* Color + Inset */}
            <div className="mt-1 flex items-center gap-4">
              <label className="flex items-center gap-2">
                <span className="font-mono text-xs text-faint">Color</span>
                <input
                  type="color"
                  value={layer.color}
                  onChange={(e) => update(layer.id, { color: e.target.value })}
                  className="h-8 w-12 cursor-pointer rounded border border-line bg-transparent p-0.5"
                />
                <span className="font-mono text-xs text-muted">{layer.color}</span>
              </label>

              <label className="ml-auto flex cursor-pointer items-center gap-2">
                <span className="font-mono text-xs text-faint">Inset</span>
                <button
                  onClick={() => update(layer.id, { inset: !layer.inset })}
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    layer.inset ? "bg-iris" : "bg-surface-2 border border-line"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      layer.inset ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>
        </div>

        {/* ── Preview + Output ── */}
        <div className="flex flex-col gap-6">
          {/* Preview */}
          <div className="flex h-64 items-center justify-center rounded-2xl border border-line bg-[#0a0a0f]">
            <div
              className="h-32 w-48 rounded-2xl bg-surface transition-all duration-200"
              style={{ boxShadow: layers.map(layerToCss).join(", ") }}
            />
          </div>

          {/* CSS Output */}
          <div className="rounded-2xl border border-line bg-surface/60 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-faint">CSS Output</span>
              <button
                onClick={copy}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  copied
                    ? "bg-mint/15 text-mint"
                    : "border border-line bg-surface-2 text-muted hover:border-line-strong hover:text-ink"
                }`}
              >
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-bg p-4 font-mono text-xs leading-relaxed text-muted">
              <code>{fullCss}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
