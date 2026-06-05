"use client";

import { useState, useCallback } from "react";

const QUICK_REF_PX = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96];

export default function UnitConverter() {
  const [base,    setBase]    = useState(16);
  const [pxVal,   setPxVal]   = useState("16");
  const [remVal,  setRemVal]  = useState("1");
  const [copied,  setCopied]  = useState<string | null>(null);

  const handlePxChange = (raw: string) => {
    setPxVal(raw);
    const n = parseFloat(raw);
    if (!isNaN(n) && base > 0) setRemVal((n / base).toFixed(4).replace(/\.?0+$/, ""));
  };

  const handleRemChange = (raw: string) => {
    setRemVal(raw);
    const n = parseFloat(raw);
    if (!isNaN(n) && base > 0) setPxVal((n * base).toFixed(4).replace(/\.?0+$/, ""));
  };

  const handleBaseChange = (raw: string) => {
    const n = parseInt(raw);
    if (!isNaN(n) && n > 0) {
      setBase(n);
      const px = parseFloat(pxVal);
      if (!isNaN(px)) setRemVal((px / n).toFixed(4).replace(/\.?0+$/, ""));
    }
    if (raw === "") setBase(16);
  };

  const copy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 md:px-10">

      {/* Base font size */}
      <div className="mb-8 flex items-center gap-3 rounded-2xl border border-line bg-surface/60 p-5">
        <span className="text-sm text-muted">Root font size</span>
        <input
          type="number"
          min={1}
          max={32}
          value={base}
          onChange={(e) => handleBaseChange(e.target.value)}
          className="w-20 rounded-lg border border-line bg-bg px-3 py-2 text-center font-mono text-sm text-ink focus:border-iris/50 focus:outline-none"
        />
        <span className="font-mono text-sm text-faint">px</span>
        <span className="ml-auto text-xs text-faint">Default is 16 (browser default)</span>
      </div>

      {/* Converter inputs */}
      <div className="mb-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* px */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-xs uppercase tracking-widest text-faint">Pixels</label>
          <div className="relative">
            <input
              type="number"
              value={pxVal}
              onChange={(e) => handlePxChange(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface/60 px-4 py-3.5 font-mono text-lg text-ink focus:border-iris/50 focus:outline-none"
              placeholder="16"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm text-faint">px</span>
          </div>
          <button
            onClick={() => copy(`${pxVal}px`, "px")}
            className="rounded-lg border border-line bg-surface-2 py-1.5 text-xs font-medium text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            {copied === "px" ? "✓ Copied!" : "Copy"}
          </button>
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center gap-1 pt-6">
          <span className="text-xl text-faint">⇄</span>
        </div>

        {/* rem */}
        <div className="flex flex-col gap-2">
          <label className="font-mono text-xs uppercase tracking-widest text-faint">REM</label>
          <div className="relative">
            <input
              type="number"
              value={remVal}
              onChange={(e) => handleRemChange(e.target.value)}
              className="w-full rounded-xl border border-line bg-surface/60 px-4 py-3.5 font-mono text-lg text-ink focus:border-iris/50 focus:outline-none"
              placeholder="1"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-sm text-faint">rem</span>
          </div>
          <button
            onClick={() => copy(`${remVal}rem`, "rem")}
            className="rounded-lg border border-line bg-surface-2 py-1.5 text-xs font-medium text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            {copied === "rem" ? "✓ Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Quick reference table */}
      <div className="rounded-2xl border border-line bg-surface/60 overflow-hidden">
        <div className="border-b border-line px-5 py-3">
          <span className="font-mono text-xs uppercase tracking-widest text-faint">
            Quick Reference (base {base}px)
          </span>
        </div>
        <div className="grid grid-cols-2 divide-x divide-line">
          <div className="px-5 py-3 font-mono text-xs font-semibold uppercase tracking-widest text-faint">px</div>
          <div className="px-5 py-3 font-mono text-xs font-semibold uppercase tracking-widest text-faint">rem</div>
        </div>
        <div className="max-h-64 overflow-y-auto divide-y divide-line/50">
          {QUICK_REF_PX.map((px) => {
            const rem = (px / base).toFixed(4).replace(/\.?0+$/, "");
            const isActive = parseFloat(pxVal) === px;
            return (
              <button
                key={px}
                onClick={() => { handlePxChange(String(px)); }}
                className={`grid w-full grid-cols-2 divide-x divide-line/50 text-left transition-colors hover:bg-iris/5 ${
                  isActive ? "bg-iris/10" : ""
                }`}
              >
                <span className={`px-5 py-2 font-mono text-sm ${isActive ? "text-iris" : "text-muted"}`}>
                  {px}px
                </span>
                <span className={`px-5 py-2 font-mono text-sm ${isActive ? "text-iris" : "text-muted"}`}>
                  {rem}rem
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
