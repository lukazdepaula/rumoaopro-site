import { NextRequest, NextResponse } from "next/server";

const LOCALE_COOKIE = "rap_locale";
const ONE_YEAR = 60 * 60 * 24 * 365;

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("lang") === "en" ? "en" : "pt";
  const destination = request.nextUrl.clone();
  destination.pathname = locale === "en" ? "/en/links" : "/links";
  destination.search = "";

  const response = NextResponse.redirect(destination, 307);
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.cookies.set({
    name: LOCALE_COOKIE,
    value: locale,
    maxAge: ONE_YEAR,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:"
  });
  return response;
}
