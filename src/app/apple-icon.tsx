import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            height: 96,
          }}
        >
          <div
            style={{
              width: 26,
              height: 42,
              background: "#3f3f46",
              borderRadius: 6,
              marginRight: 12,
            }}
          />
          <div
            style={{
              width: 26,
              height: 66,
              background: "#a1a1aa",
              borderRadius: 6,
              marginRight: 12,
            }}
          />
          <div
            style={{
              width: 26,
              height: 96,
              background: "#fbbf24",
              borderRadius: 6,
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
