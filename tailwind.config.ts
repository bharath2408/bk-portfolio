import type { Config } from "tailwindcss";

// All colour tokens now point at CSS custom properties so the dark/light
// theme swap happens in globals.css without touching any component.
// The `rgb(var(--c-x) / <alpha-value>)` syntax lets Tailwind's opacity
// modifiers (bg-iris/10, text-muted/60, etc.) keep working correctly.

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:           "rgb(var(--c-bg)        / <alpha-value>)",
        "bg-soft":    "rgb(var(--c-bg-soft)   / <alpha-value>)",
        surface:      "rgb(var(--c-surface)   / <alpha-value>)",
        "surface-2":  "rgb(var(--c-surface-2) / <alpha-value>)",
        ink:          "rgb(var(--c-ink)        / <alpha-value>)",
        muted:        "rgb(var(--c-muted)      / <alpha-value>)",
        faint:        "rgb(var(--c-faint)      / <alpha-value>)",
        iris:         "rgb(var(--c-iris)       / <alpha-value>)",
        cyan:         "rgb(var(--c-cyan)       / <alpha-value>)",
        mint:         "rgb(var(--c-mint)       / <alpha-value>)",
        // line colours have built-in opacity — no <alpha-value> modifier
        line:         "var(--c-line)",
        "line-strong":"var(--c-line-strong)",
      },
      fontFamily: {
        display: ["var(--font-display)",      "system-ui", "sans-serif"],
        sans:    ["var(--font-geist-sans)",   "system-ui", "sans-serif"],
        mono:    ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: { shell: "1200px" },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1",   transform: "scale(1)" },
          "50%":      { opacity: "0.5", transform: "scale(0.8)" },
        },
        marquee: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        float:       "float 6s ease-in-out infinite",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        marquee:     "marquee 28s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
