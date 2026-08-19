import { type NextRequest, NextResponse } from "next/server";
import { revalidateGlobals, revalidatePage } from "@/lib/revalidate";

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

  // The backend sends "*" when the navbar or footer changed.
  const { path, tag } = slug === "*" ? revalidateGlobals() : revalidatePage(slug);

  return NextResponse.json({ revalidated: true, path, tag });
}
