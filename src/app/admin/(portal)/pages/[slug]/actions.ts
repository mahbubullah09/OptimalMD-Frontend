"use server";

import { revalidatePath } from "next/cache";
import { ApiRequestError, apiFetch } from "@/lib/api";
import { getSessionToken } from "@/lib/adminSession";
import type { PageSeo } from "@/lib/content.types";

export type ActionResult = { ok: true; revalidated: boolean } | { ok: false; error: string };

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
    const { revalidated } = await withToken((token) =>
      apiFetch<{ revalidated: boolean }>(`/pages/${slug}`, {
        method: "PUT",
        body: { seo },
        token,
      }),
    );

    revalidatePath(`/admin/pages/${slug}`);
    return { ok: true, revalidated };
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
    const { revalidated } = await withToken((token) =>
      apiFetch<{ revalidated: boolean }>(`/pages/${slug}/sections/${key}`, {
        method: "PATCH",
        body: { data, enabled },
        token,
      }),
    );

    revalidatePath(`/admin/pages/${slug}`);
    return { ok: true, revalidated };
  } catch (err) {
    return { ok: false, error: toMessage(err) };
  }
}
