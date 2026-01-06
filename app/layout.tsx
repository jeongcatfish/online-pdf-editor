import type { Metadata } from "next";
import { cookies, headers } from "next/headers";

import { LocaleProvider } from "./locale-provider";
import { PdfFilesProvider } from "./providers";
import { siteMeta } from "@/lib/copy";
import { getCountryFromHeaders, LOCALE_COOKIE, resolveLocale, type Locale } from "@/lib/locale";
import "./globals.css";

function getRequestLocale(): Locale {
  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value;
  const country = getCountryFromHeaders(headers());
  return resolveLocale({ cookieLocale, country });
}

export function generateMetadata(): Metadata {
  const locale = getRequestLocale();
  return siteMeta[locale];
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const locale = getRequestLocale();
  return (
    <html lang={locale}>
      <body className="bg-slate-50 antialiased">
        <LocaleProvider initialLocale={locale}>
          <PdfFilesProvider>{children}</PdfFilesProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
