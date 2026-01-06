import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCountryFromHeaders, LOCALE_COOKIE, normalizeLocale, resolveLocale } from "./lib/locale";

export function middleware(request: NextRequest) {
  const cookieValue = request.cookies.get(LOCALE_COOKIE)?.value;
  const normalized = normalizeLocale(cookieValue);

  if (normalized) {
    return NextResponse.next();
  }

  const country = getCountryFromHeaders(request.headers);
  const locale = resolveLocale({ cookieLocale: cookieValue, country });
  const response = NextResponse.next();

  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax"
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
