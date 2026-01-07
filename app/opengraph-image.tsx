import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

const chips = ["Free", "No install", "Large files"];

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
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#f8fafc",
          backgroundImage: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 55%, #ecfeff 100%)"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            backgroundImage: "radial-gradient(rgba(226,232,240,0.7) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            opacity: 0.7
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "36px",
            left: "40px",
            width: "180px",
            height: "180px",
            borderRadius: "48px",
            background: "rgba(37,99,235,0.12)"
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "60px",
            width: "220px",
            height: "220px",
            borderRadius: "60px",
            background: "rgba(14,165,233,0.14)"
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "40px",
            width: "100%",
            zIndex: 1
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "22px",
              maxWidth: "560px"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 16px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(226,232,240,0.9)",
                fontSize: "12px",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "#1e293b",
                fontWeight: 700
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "999px",
                  background: "#2563eb"
                }}
              />
              PDF NOW
            </div>
            <div
              style={{
                fontSize: "54px",
                fontWeight: 700,
                lineHeight: 1.05,
                color: "#0f172a"
              }}
            >
              Edit PDFs online fast
            </div>
            <div
              style={{
                fontSize: "22px",
                lineHeight: 1.4,
                color: "#475569"
              }}
            >
              Merge, sign, and convert right in your browser.
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {chips.map((label) => (
                <div
                  key={label}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.9)",
                    border: "1px solid rgba(226,232,240,0.9)",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#334155"
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              width: "420px",
              display: "flex",
              flexDirection: "column",
              borderRadius: "28px",
              background: "rgba(255,255,255,0.96)",
              border: "1px solid rgba(226,232,240,0.9)",
              boxShadow: "0 24px 45px rgba(15,23,42,0.18)",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "18px",
                background: "linear-gradient(135deg, #e0f2fe, #dbeafe 55%, #cffafe)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  height: "170px",
                  width: "100%",
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.92)",
                  border: "2px dashed rgba(148,163,184,0.5)"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "52px",
                    height: "52px",
                    borderRadius: "999px",
                    background: "rgba(37,99,235,0.12)",
                    color: "#2563eb",
                    fontSize: "14px",
                    fontWeight: 700
                  }}
                >
                  PDF
                </div>
                <div style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>Drop a PDF</div>
                <div style={{ fontSize: "12px", color: "#64748b" }}>Click or drag to upload</div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                padding: "18px 22px 22px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "24px",
                    height: "24px",
                    borderRadius: "8px",
                    background: "#2563eb",
                    color: "#ffffff",
                    fontSize: "10px",
                    fontWeight: 700
                  }}
                >
                  PDF
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>pdfnow.app</div>
              </div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
                PDF Now - Online PDF Editor
              </div>
              <div style={{ fontSize: "14px", color: "#475569" }}>
                Edit, merge, and sign PDFs in your browser.
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: size.width,
      height: size.height
    }
  );
}
