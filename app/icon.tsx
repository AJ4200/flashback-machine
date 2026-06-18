import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07070f",
        }}
      >
        <div
          style={{
            width: 424,
            height: 424,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "18px solid #b8ff16",
            background: "#111124",
            boxShadow: "0 0 0 18px #05050a, 26px 26px 0 #ff2bd6",
          }}
        >
          <div
            style={{
              width: 280,
              height: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "14px solid #21f4ff",
              background: "#05050a",
              color: "#b8ff16",
              fontSize: 104,
              fontWeight: 900,
              fontFamily: "monospace",
              textShadow: "10px 10px 0 #ff2bd6",
            }}
          >
            RN
          </div>
        </div>
      </div>
    ),
    size,
  );
}
