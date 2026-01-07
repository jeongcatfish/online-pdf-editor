import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "56px 64px",
          boxSizing: "border-box",
          fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
          backgroundColor: "#f8fafc",
          backgroundImage: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)"
        }}
      >
        <div
          style={{
            width: "920px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            borderRadius: "28px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            padding: "28px 32px",
            boxShadow: "0 24px 45px rgba(15,23,42,0.18)"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "#2563eb",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 700
              }}
            >
              PDF
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#64748b" }}>pdfnow.xyz</div>
          </div>
          <div style={{ fontSize: "32px", fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
            PDF Now - Online PDF Editor
          </div>
          <div style={{ fontSize: "18px", color: "#475569", lineHeight: 1.4 }}>
            Edit, merge, and sign PDFs in your browser.
          </div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>pdfnow.xyz</div>
        </div>
      </div>
    ),
    {
      width: size.width,
      height: size.height
    }
  );
}
