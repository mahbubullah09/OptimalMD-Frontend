import { type NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/adminSession";

/**
 * Gates /admin at the edge (Next 16 renamed this convention from middleware).
 *
 * This only checks that a session cookie is present — it does NOT verify the
 * token, because middleware cannot reach the backend cheaply on every
 * request. Real verification happens in the admin layout via /auth/me, which
 * is what actually protects the data. This is a fast redirect for the common
 * case of a signed-out visitor.
 */
export default function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);

  // Already signed in and heading to the login screen — send them onward.
  if (pathname === "/admin/login") {
    if (hasSession) return NextResponse.redirect(new URL("/admin", req.url));
    return NextResponse.next();
  }

  if (!hasSession) {
    const login = new URL("/admin/login", req.url);
    // Preserve where they were going so login can return them there.
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
