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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PZF3RMHV');`
          }}
        />
      </head>
      <body className="bg-slate-50 antialiased">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PZF3RMHV"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <LocaleProvider initialLocale={locale}>
          <PdfFilesProvider>{children}</PdfFilesProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
