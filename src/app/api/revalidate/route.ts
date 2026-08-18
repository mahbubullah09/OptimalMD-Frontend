import { revalidatePath, revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Called by the backend after content changes so the affected static page is
 * rebuilt on the next request.
 *
 * Authenticated with a shared secret rather than an admin session, because
 * the caller is a server, not a signed-in person.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  // Refuse rather than run unauthenticated if the secret was never configured.
  if (!secret) {
    console.error("REVALIDATE_SECRET is not set; refusing to revalidate.");
    return NextResponse.json({ error: "Revalidation is not configured" }, { status: 500 });
  }

  if (req.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  let slug = "home";
  try {
    const body = (await req.json()) as { slug?: unknown };
    if (typeof body.slug === "string" && body.slug.trim()) slug = body.slug.trim();
  } catch {
    // No body is fine — fall back to the home page.
  }

  const path = slug === "home" ? "/" : `/${slug}`;
  const tag = `page:${slug}`;

  // Both are needed. revalidatePath drops the rendered route, but the content
  // fetch lives in the Data Cache under its own tag and would otherwise keep
  // serving the previous payload until its TTL expires — so the page would
  // re-render with stale content.
  //
  // Next 16 requires a cache-life profile on revalidateTag; `expire: 0` means
  // treat the entry as stale immediately rather than after a grace period.
  revalidateTag(tag, { expire: 0 });
  revalidatePath(path);

  return NextResponse.json({ revalidated: true, path, tag });
}
