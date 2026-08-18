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
    /** HTTP status, or 0 when the request never reached the API. */
    readonly status: number,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }

  /** True when the API could not be reached or is not running. */
  get unreachable(): boolean {
    return this.status === 0 || this.status === 502 || this.status === 503;
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

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      ...(next ? { next } : {}),
      ...(cache ? { cache } : next ? {} : { cache: "no-store" }),
    });
  } catch (cause) {
    // A refused connection or DNS failure is not an HTTP error, so it would
    // otherwise escape as a bare TypeError from fetch.
    throw new ApiRequestError(0, `Could not reach the API at ${BASE}`, cause);
  }

  const text = await res.text();

  // Not every failure answers with JSON. A crashed serverless function returns
  // the platform's HTML error page, and parsing that threw a SyntaxError that
  // masked the real problem — a 500 reported as malformed JSON.
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      if (res.ok) {
        throw new ApiRequestError(res.status, `API returned a non-JSON response for ${path}`, text.slice(0, 500));
      }
      throw new ApiRequestError(res.status, `API error ${res.status} for ${path}`, text.slice(0, 500));
    }
  }

  if (!res.ok) {
    const err = payload as
      | { error?: string; details?: unknown; missing?: string[] }
      | null;

    // The backend names the environment variables it is missing; passing that
    // through is what turns "something went wrong" into a fixable message.
    const message = err?.missing?.length
      ? `${err.error ?? "Server configuration incomplete"} (missing: ${err.missing.join(", ")})`
      : (err?.error ?? res.statusText);

    throw new ApiRequestError(res.status, message, err?.details ?? err?.missing);
  }

  return payload as T;
}
