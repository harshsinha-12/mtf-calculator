import { ImageResponse } from "next/og";

export const alt =
  "MTF Lab — Return & Risk Simulator for margin trading returns, break-even, and pledge collateral";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFont(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load font: ${url}`);
  }
  return res.arrayBuffer();
}

export default async function Image() {
  const [outfitBold, plexMono] = await Promise.all([
    loadFont(
      "https://cdn.jsdelivr.net/fontsource/fonts/outfit@latest/latin-700-normal.ttf",
    ),
    loadFont(
      "https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-mono@latest/latin-500-normal.ttf",
    ),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#09090b",
          color: "#fafafa",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(rgba(251,191,36,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.06) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -80,
            width: 420,
            height: 420,
            borderRadius: 420,
            background: "rgba(251,191,36,0.14)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            right: -60,
            width: 480,
            height: 480,
            borderRadius: 480,
            background: "rgba(52,211,153,0.1)",
            display: "flex",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            width: "100%",
            height: "100%",
            padding: "64px 72px",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 640,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  height: 28,
                  marginRight: 14,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 12,
                    background: "#3f3f46",
                    borderRadius: 2,
                    marginRight: 4,
                  }}
                />
                <div
                  style={{
                    width: 8,
                    height: 20,
                    background: "#a1a1aa",
                    borderRadius: 2,
                    marginRight: 4,
                  }}
                />
                <div
                  style={{
                    width: 8,
                    height: 28,
                    background: "#fbbf24",
                    borderRadius: 2,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "IBM Plex Mono",
                  fontSize: 14,
                  letterSpacing: 3,
                  color: "#fbbf24",
                  textTransform: "uppercase",
                }}
              >
                Simulator
              </div>
            </div>

            <div
              style={{
                display: "flex",
                fontFamily: "Outfit",
                fontSize: 84,
                lineHeight: 1,
                marginTop: 28,
                letterSpacing: -2,
              }}
            >
              MTF Lab
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "Outfit",
                fontSize: 32,
                color: "#a1a1aa",
                marginTop: 16,
              }}
            >
              Return & Risk Simulator
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "IBM Plex Mono",
                fontSize: 18,
                color: "#71717a",
                marginTop: 28,
              }}
            >
              Break-even · Interest · Pledge collateral
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 340,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: "rgba(24,24,27,0.92)",
                border: "1px solid #27272a",
                borderRadius: 24,
                padding: "28px 32px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontFamily: "IBM Plex Mono",
                  fontSize: 13,
                  letterSpacing: 2,
                  color: "#71717a",
                  textTransform: "uppercase",
                }}
              >
                Net profit
              </div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "Outfit",
                  fontSize: 44,
                  color: "#34d399",
                  marginTop: 8,
                }}
              >
                + Rs 12,400
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                background: "rgba(24,24,27,0.92)",
                border: "1px solid #27272a",
                borderRadius: 24,
                padding: "28px 32px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontFamily: "IBM Plex Mono",
                  fontSize: 13,
                  letterSpacing: 2,
                  color: "#71717a",
                  textTransform: "uppercase",
                }}
              >
                On capital
              </div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "Outfit",
                  fontSize: 44,
                  color: "#fbbf24",
                  marginTop: 8,
                }}
              >
                4.2x
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Outfit", data: outfitBold, style: "normal", weight: 700 },
        { name: "IBM Plex Mono", data: plexMono, style: "normal", weight: 500 },
      ],
    },
  );
}
