import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64
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
          borderRadius: "16px",
          background: "#2563eb",
          color: "#ffffff",
          fontSize: "22px",
          fontWeight: 700,
          fontFamily: '"Pretendard", "Noto Sans KR", sans-serif'
        }}
      >
        PDF
      </div>
    ),
    {
      width: size.width,
      height: size.height
    }
  );
}
