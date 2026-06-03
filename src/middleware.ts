import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

const localeCookieName = "curvio_locale";
const locales = new Set(["en", "zh"]);

function detectLocale(request: NextRequest) {
  const cookieLocale = request.cookies.get(localeCookieName)?.value;
  if (cookieLocale && locales.has(cookieLocale)) {
    return cookieLocale;
  }

  const acceptedLanguage = request.headers.get("accept-language")?.toLowerCase() ?? "";
  return acceptedLanguage.includes("zh") ? "zh" : "en";
}

function isStaticOrApiPath(pathname: string) {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isStaticOrApiPath(pathname)) {
    const firstSegment = pathname.split("/")[1];

    if (locales.has(firstSegment)) {
      const response = await updateSession(request);
      response.cookies.set(localeCookieName, firstSegment, {
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      return response;
    }

    const locale = detectLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
    url.search = search;

    return NextResponse.redirect(url);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
