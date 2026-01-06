import type { Metadata } from "next";

import { PdfFilesProvider } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "PDF Pro - 온라인 PDF 편집기",
  description: "브라우저에서 바로 PDF 변환, 편집, 서명을 무료로 처리하세요."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 antialiased">
        <PdfFilesProvider>{children}</PdfFilesProvider>
      </body>
    </html>
  );
}
