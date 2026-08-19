import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Drops the cached copy of published content.
 *
 * Shared by the admin's save actions and by the /api/revalidate webhook, so a
 * change refreshes the live site the same way whoever made it.
 *
 * The actions matter most. They run on this deployment, which means the admin
 * can clear its own cache directly — no URL to configure, no shared secret to
 * match, nothing to go wrong between two services. The webhook stays for
 * changes made outside the admin, where the backend is the only one who knows.
 */

/**
 * Both calls are needed, and for different reasons.
 *
 * `revalidatePath` drops the rendered route, but the content fetch lives in
 * the Data Cache under its own tag and would keep serving the previous payload
 * until its TTL expired — so the page would re-render with stale content.
 *
 * Next 16 requires a cache-life profile on `revalidateTag`; `expire: 0` means
 * treat the entry as stale immediately rather than after a grace period.
 */
export function revalidatePage(slug: string): { path: string; tag: string } {
  const path = slug === "home" ? "/" : `/${slug}`;
  const tag = `page:${slug}`;

  revalidateTag(tag, { expire: 0 });
  revalidatePath(path);

  return { path, tag };
}

/**
 * The navbar and footer are on every page, so a change to either makes the
 * whole site stale rather than one route.
 */
export function revalidateGlobals(): { path: string; tag: string } {
  revalidateTag("globals", { expire: 0 });
  revalidatePath("/", "layout");

  return { path: "/", tag: "globals" };
}
