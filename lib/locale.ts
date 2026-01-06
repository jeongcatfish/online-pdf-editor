export type Locale = "ko" | "en";

export const LOCALE_COOKIE = "site_locale";

export const LOCALES: Locale[] = ["ko", "en"];

export const localeLabels: Record<Locale, string> = {
  ko: "한국어",
  en: "English"
};

export function normalizeLocale(value?: string | null): Locale | null {
  if (value === "ko" || value === "en") {
    return value;
  }

  return null;
}

export function defaultLocaleForCountry(country?: string | null): Locale {
  return country === "KR" ? "ko" : "en";
}

export function getCountryFromHeaders(headers: Headers): string | null {
  return (
    headers.get("x-vercel-ip-country") ||
    headers.get("x-geo-country") ||
    headers.get("cf-ipcountry") ||
    null
  );
}

export function resolveLocale({
  cookieLocale,
  country
}: {
  cookieLocale?: string | null;
  country?: string | null;
}): Locale {
  return normalizeLocale(cookieLocale) ?? defaultLocaleForCountry(country);
}
