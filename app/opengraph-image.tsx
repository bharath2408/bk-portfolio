import { ImageResponse } from "next/og";

export const runtime     = "edge";
export const alt         = "Bharatha Kumar — Frontend Developer";
export const size        = { width: 1200, height: 630 };
export const contentType = "image/png";

// Inline values — avoids any edge-runtime import chain issues
const NAME     = "Bharatha Kumar";
const ROLE     = "Frontend Developer";
const LOCATION = "Chennai, Tamil Nadu";
const BLURB    = "2.5+ years crafting responsive, production-grade CRM, e-commerce and AI platforms with Next.js, React and TypeScript.";
const SITE     = "bk-portfolio-bharath2408.vercel.app";
const TAGS     = ["Next.js", "React", "TypeScript", "Three.js", "AI / ML", "DevOps"];

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#07070B",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Iris blob — top right */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,92,255,0.32) 0%, transparent 70%)",
          }}
        />

        {/* Cyan blob — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: 100,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 70%)",
          }}
        />

        {/* Content column */}
        <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>

          {/* Location */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#7C5CFF",
              }}
            />
            <span style={{ fontSize: 15, color: "#7C5CFF", fontWeight: 600, letterSpacing: 2 }}>
              {LOCATION.toUpperCase()}
            </span>
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: 78,
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.05,
              marginBottom: 14,
            }}
          >
            {NAME}
          </div>

          {/* Role */}
          <div
            style={{
              fontSize: 28,
              color: "#94A3B8",
              fontWeight: 400,
              marginBottom: 22,
            }}
          >
            {ROLE}
          </div>

          {/* Blurb */}
          <div
            style={{
              fontSize: 18,
              color: "#475569",
              lineHeight: 1.65,
              marginBottom: 40,
              maxWidth: 680,
            }}
          >
            {BLURB}
          </div>

          {/* Tech tags — Satori doesn't support flexWrap so limit to one row */}
          <div style={{ display: "flex", gap: 10 }}>
            {TAGS.map((tag) => (
              <div
                key={tag}
                style={{
                  background: "rgba(124,92,255,0.14)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: "rgba(124,92,255,0.30)",
                  borderRadius: 8,
                  padding: "7px 18px",
                  color: "#A78BFA",
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* URL watermark */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 80,
            fontSize: 14,
            color: "#334155",
            letterSpacing: 1,
          }}
        >
          {SITE}
        </div>

        {/* Left accent bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "25%",
            width: 4,
            height: "50%",
            background: "linear-gradient(180deg, #7C5CFF 0%, #22D3EE 100%)",
            borderRadius: "0 4px 4px 0",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
