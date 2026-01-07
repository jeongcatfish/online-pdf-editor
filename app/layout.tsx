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

function getMetadataBase(): URL {
  const headerList = headers();
  const host = headerList.get("host");
  if (host) {
    const forwardedProto = headerList.get("x-forwarded-proto");
    const protocol = forwardedProto ?? (host.startsWith("localhost") ? "http" : "https");
    return new URL(`${protocol}://${host}`);
  }

  return new URL("https://pdfnow.app");
}

export function generateMetadata(): Metadata {
  const locale = getRequestLocale();
  const meta = siteMeta[locale];
  const metadataBase = getMetadataBase();
  const ogLocale = locale === "ko" ? "ko_KR" : "en_US";

  return {
    metadataBase,
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "website",
      locale: ogLocale,
      url: metadataBase,
      siteName: "PDF Now",
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: meta.title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: ["/opengraph-image"]
    }
  };
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
