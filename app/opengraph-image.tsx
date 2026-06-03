import { ImageResponse } from "next/og";
import { profile } from "@/lib/data";

export const runtime = "edge";
export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          padding: "80px",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Iris accent blob — top right */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,92,255,0.35) 0%, transparent 70%)",
          }}
        />
        {/* Cyan accent blob — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: -80,
            left: 120,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,211,238,0.2) 0%, transparent 70%)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            position: "relative",
          }}
        >
          {/* Location chip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#7C5CFF",
              }}
            />
            <span
              style={{
                fontSize: 16,
                color: "#7C5CFF",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              {profile.location}
            </span>
          </div>

          {/* Name */}
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              marginBottom: 16,
            }}
          >
            {profile.name}
          </div>

          {/* Role */}
          <div
            style={{
              fontSize: 30,
              color: "#94A3B8",
              fontWeight: 400,
              marginBottom: 20,
            }}
          >
            {profile.role}
          </div>

          {/* Blurb */}
          <div
            style={{
              fontSize: 19,
              color: "#475569",
              maxWidth: 680,
              lineHeight: 1.6,
              marginBottom: 36,
            }}
          >
            {profile.blurb}
          </div>

          {/* Tech tags */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["Next.js", "React", "TypeScript", "Three.js", "AI / ML", "DevOps"].map(
              (tech) => (
                <div
                  key={tech}
                  style={{
                    background: "rgba(124,92,255,0.12)",
                    border: "1px solid rgba(124,92,255,0.28)",
                    borderRadius: 8,
                    padding: "7px 18px",
                    color: "#A78BFA",
                    fontSize: 15,
                    fontWeight: 500,
                  }}
                >
                  {tech}
                </div>
              )
            )}
          </div>
        </div>

        {/* Bottom-right URL watermark */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 80,
            fontSize: 15,
            color: "#334155",
            letterSpacing: "0.05em",
          }}
        >
          {profile.siteUrl.replace("https://", "")}
        </div>
      </div>
    ),
    { ...size }
  );
}
