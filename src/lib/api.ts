import "server-only";

/**
 * Server-side client for the OMD backend API.
 *
 * `API_BASE_URL` is intentionally not NEXT_PUBLIC_ — every call goes through
 * a server component or route handler, so the API origin and the admin's
 * bearer token never reach the browser.
 */
const BASE = process.env.API_BASE_URL ?? "http://localhost:4000/api";

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  /** Bearer token for authenticated calls. */
  token?: string;
  /** Next.js caching. Defaults to no-store for admin reads. */
  next?: { revalidate?: number; tags?: string[] };
  cache?: RequestCache;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, next, cache } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (token) headers.authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    ...(next ? { next } : {}),
    ...(cache ? { cache } : next ? {} : { cache: "no-store" }),
  });

  const text = await res.text();
  const payload: unknown = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err = payload as { error?: string; details?: unknown } | null;
    throw new ApiRequestError(res.status, err?.error ?? res.statusText, err?.details);
  }

  return payload as T;
}
