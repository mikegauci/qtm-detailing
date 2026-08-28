import { ImageResponse } from "next/og";
import { siteConfig } from "@/content/site";

export const runtime = "nodejs";
export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #07070b 0%, #4a1e71 50%, #027991 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            fontStyle: "italic",
            background: "linear-gradient(90deg, #b07ce6, #ffffff, #5adcf2)",
            backgroundClip: "text",
            color: "transparent",
            letterSpacing: "-0.02em",
          }}
        >
          QTM
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#a1a1aa",
            letterSpacing: "0.3em",
            marginTop: 8,
          }}
        >
          DETAILING
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#f4f4f5",
            marginTop: 32,
            opacity: 0.9,
          }}
        >
          Premium Automotive Detailing · Malta
        </div>
      </div>
    ),
    { ...size },
  );
}
