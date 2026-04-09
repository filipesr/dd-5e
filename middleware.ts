import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["pt-BR", "en", "es"];
const DEFAULT_LOCALE = "pt-BR";
const COOKIE_NAME = "dd5e-locale";

function getLocaleFromHeaders(request: NextRequest): string {
  // Check cookie first
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (cookie && LOCALES.includes(cookie)) return cookie;

  // Check Accept-Language header
  const acceptLang = request.headers.get("accept-language") || "";
  if (acceptLang.includes("es")) return "es";
  if (acceptLang.includes("en")) return "en";
  if (acceptLang.includes("pt")) return "pt-BR";

  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, API routes, _next
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if path already has a valid locale prefix
  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );

  if (hasLocale) {
    // Set cookie for the locale in the URL
    const urlLocale = LOCALES.find(
      (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
    )!;
    const response = NextResponse.next();
    response.cookies.set(COOKIE_NAME, urlLocale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  // No locale prefix — redirect to /{locale}{pathname}
  const locale = getLocaleFromHeaders(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  const response = NextResponse.redirect(url);
  response.cookies.set(COOKIE_NAME, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon\\.ico|.*\\..*).*)"],
};
