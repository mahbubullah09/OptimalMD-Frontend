import { type NextRequest, NextResponse } from "next/server";
import { ApiRequestError, apiFetch } from "@/lib/api";
import { type AdminUser, SESSION_COOKIE, sessionCookieOptions } from "@/lib/adminSession";

/**
 * Exchanges credentials for a session.
 *
 * The browser posts here rather than to the backend directly, so the JWT goes
 * straight into an httpOnly cookie and is never exposed to client JavaScript.
 */
export async function POST(req: NextRequest) {
  let body: { email?: unknown; password?: unknown };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  try {
    const { token, user } = await apiFetch<{ token: string; user: AdminUser }>("/auth/login", {
      method: "POST",
      body: { email, password },
    });

    const res = NextResponse.json({ user });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  } catch (err) {
    if (err instanceof ApiRequestError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    // Backend unreachable — say so plainly rather than implying bad credentials.
    console.error("Login proxy failed:", err);
    return NextResponse.json(
      { error: "Cannot reach the content API. Is the backend running?" },
      { status: 502 },
    );
  }
}
