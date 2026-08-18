import "server-only";
import { cookies } from "next/headers";
import { apiFetch } from "./api";

/**
 * The admin session is the backend's JWT, held in a first-party httpOnly
 * cookie set by this app. The browser never sees the token, and because the
 * cookie belongs to this origin, middleware can gate /admin without a
 * cross-origin request.
 */
export const SESSION_COOKIE = "omd_admin_session";

/** Matches the backend's JWT_EXPIRES_IN of 7d. */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type AdminUser = {
  _id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
  isActive: boolean;
  lastLoginAt?: string;
};

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

/**
 * Resolves the signed-in admin, or null. Verification happens on the backend,
 * so a revoked or deactivated account fails here even with a valid token.
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    const { user } = await apiFetch<{ user: AdminUser }>("/auth/me", { token });
    return user;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
