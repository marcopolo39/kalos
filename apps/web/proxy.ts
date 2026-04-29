import { type NextRequest, NextResponse } from "next/server";

import { updateSession } from "./lib/supabase/middleware";

/**
 * `NextResponse.redirect` must not drop Set-Cookie from `updateSession` (e.g.
 * rotated Supabase refresh tokens). Copy all cookies from the session response
 * before returning the redirect.
 */
function redirectWithSessionCookies(
  targetUrl: URL,
  sessionResponse: NextResponse,
): NextResponse {
  const redirectResponse = NextResponse.redirect(targetUrl);
  sessionResponse.cookies
    .getAll()
    .forEach((cookie) => redirectResponse.cookies.set(cookie));
  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const { response, user } = await updateSession(request);

  const isDashboard =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isUpload = pathname === "/upload" || pathname.startsWith("/upload/");
  const isGoals = pathname === "/goals" || pathname.startsWith("/goals/");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if ((isDashboard || isUpload || isGoals) && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return redirectWithSessionCookies(redirectUrl, response);
  }

  if (isAuthPage && user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return redirectWithSessionCookies(redirectUrl, response);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
