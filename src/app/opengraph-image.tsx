import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "The-Warden — Sovereign Personal Accountability OS";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          backgroundImage: "radial-gradient(circle at 50% 40%, #1c1c14 0%, #000000 80%)",
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Subtle Outer Border */}
        <div
          style={{
            position: "absolute",
            inset: "20px",
            border: "1px solid #2A2A2E",
            borderRadius: "28px",
          }}
        />

        {/* Brand Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "#141416",
            border: "1px solid #FFFC00",
            borderRadius: "9999px",
            padding: "8px 24px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#FFFC00",
            }}
          />
          <span
            style={{
              color: "#FFFC00",
              fontSize: "14px",
              fontWeight: 800,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            SOVEREIGN ACCOUNTABILITY OS
          </span>
        </div>

        {/* Primary Headline */}
        <div
          style={{
            display: "flex",
            fontSize: "76px",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            textAlign: "center",
            lineHeight: 1.05,
            marginBottom: "20px",
            textTransform: "uppercase",
          }}
        >
          <span>THE-WARDEN</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: "26px",
            color: "#A1A1AA",
            textAlign: "center",
            maxWidth: "850px",
            lineHeight: 1.4,
            marginBottom: "40px",
          }}
        >
          Uncompromising daily habit consistency, unbroken streak telemetry, and sovereign capital vault.
        </div>

        {/* Footer Pill Tags */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "16px",
              color: "#ffffff",
              backgroundColor: "#18181C",
              border: "1px solid #2E2E35",
              borderRadius: "12px",
              padding: "10px 20px",
              fontFamily: "monospace",
              fontWeight: 700,
            }}
          >
            <span style={{ color: "#00D664" }}>●</span>
            <span>ZERO ADS</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "16px",
              color: "#ffffff",
              backgroundColor: "#18181C",
              border: "1px solid #2E2E35",
              borderRadius: "12px",
              padding: "10px 20px",
              fontFamily: "monospace",
              fontWeight: 700,
            }}
          >
            <span style={{ color: "#FFFC00" }}>●</span>
            <span>70% CADENCE RULE</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "16px",
              color: "#ffffff",
              backgroundColor: "#18181C",
              border: "1px solid #2E2E35",
              borderRadius: "12px",
              padding: "10px 20px",
              fontFamily: "monospace",
              fontWeight: 700,
            }}
          >
            <span style={{ color: "#00D664" }}>●</span>
            <span>thewarden.online</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
