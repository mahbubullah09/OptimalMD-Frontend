"use server";

import { revalidatePath } from "next/cache";
import { getSessionToken } from "@/lib/adminSession";
import { ApiRequestError, apiFetch } from "@/lib/api";
import type { PageSection, PageSeo } from "@/lib/content.types";
import { revalidatePage } from "@/lib/revalidate";

export type ActionResult = { ok: true; revalidated: boolean } | { ok: false; error: string };

/**
 * Clears the live page's cache from here, rather than relying on the backend
 * to call back.
 *
 * These actions run on this deployment, so the admin can drop its own cache
 * directly. The backend's webhook still fires, but it needs a URL and a shared
 * secret configured on another service to work at all — and when either is
 * missing it fails silently, which is how an edit ends up saved and invisible.
 * Doing it here removes that whole class of failure, and covers every change
 * equally: copy, colour, text size, images, ordering, SEO.
 */
function publish(slug: string) {
  revalidatePage(slug);
  revalidatePath(`/admin/pages/${slug}`);
}

/**
 * Server actions rather than client fetches, because the admin's bearer token
 * lives in an httpOnly cookie the browser cannot read.
 */
async function withToken<T>(fn: (token: string) => Promise<T>): Promise<T> {
  const token = await getSessionToken();
  if (!token) throw new ApiRequestError(401, "Your session has expired. Sign in again.");
  return fn(token);
}

const toMessage = (err: unknown) =>
  err instanceof ApiRequestError
    ? err.message
    : "Could not reach the content API. Is the backend running?";

export async function saveSeo(slug: string, seo: PageSeo): Promise<ActionResult> {
  try {
    await withToken((token) =>
      apiFetch<{ revalidated: boolean }>(`/pages/${slug}`, {
        method: "PUT",
        body: { seo },
        token,
      }),
    );

    publish(slug);
    // True because this deployment just cleared its own cache; whether the
    // backend's webhook also fired is not what the author needs to know.
    return { ok: true, revalidated: true };
  } catch (err) {
    return { ok: false, error: toMessage(err) };
  }
}

/**
 * Replaces the page's whole section list.
 *
 * Used when sections are added, removed or reordered: the per-section PATCH
 * can only edit one that already exists, so a newly added block would 404.
 */
/**
 * Saves the order and visibility of every section at once.
 *
 * Reordering is not something the per-section endpoint can express — moving
 * a block changes the order of its neighbours too — so the list goes up as a
 * whole. It carries each section's content as well, which is why a reorder
 * does not need a second save afterwards.
 */
export async function saveSections(
  slug: string,
  sections: PageSection[],
): Promise<ActionResult> {
  try {
    await withToken((token) =>
      apiFetch<{ revalidated: boolean }>(`/pages/${slug}`, {
        method: "PUT",
        body: { sections },
        token,
      }),
    );

    publish(slug);
    // True because this deployment just cleared its own cache; whether the
    // backend's webhook also fired is not what the author needs to know.
    return { ok: true, revalidated: true };
  } catch (err) {
    return { ok: false, error: toMessage(err) };
  }
}

export async function saveSection(
  slug: string,
  key: string,
  data: Record<string, unknown>,
  enabled: boolean,
): Promise<ActionResult> {
  try {
    await withToken((token) =>
      apiFetch<{ revalidated: boolean }>(`/pages/${slug}/sections/${key}`, {
        method: "PATCH",
        body: { data, enabled },
        token,
      }),
    );

    publish(slug);
    // True because this deployment just cleared its own cache; whether the
    // backend's webhook also fired is not what the author needs to know.
    return { ok: true, revalidated: true };
  } catch (err) {
    return { ok: false, error: toMessage(err) };
  }
}
