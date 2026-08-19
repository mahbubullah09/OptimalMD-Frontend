"use server";

import { revalidatePath } from "next/cache";
import { getSessionToken } from "@/lib/adminSession";
import { ApiRequestError } from "@/lib/api";
import { saveGlobalsPart } from "@/lib/globals";
import { revalidateGlobals } from "@/lib/revalidate";
import type { FooterData, GlobalsPart, NavData } from "@/lib/globals.types";

export type ActionResult = { ok: true; revalidated: boolean } | { ok: false; error: string };

/**
 * A server action rather than a client fetch, because the admin's bearer token
 * lives in an httpOnly cookie the browser cannot read.
 */
export async function saveGlobals(
  part: GlobalsPart,
  data: NavData | FooterData,
): Promise<ActionResult> {
  try {
    const token = await getSessionToken();
    if (!token) throw new ApiRequestError(401, "Your session has expired. Sign in again.");

    await saveGlobalsPart(part, data, token);

    // Cleared from here rather than waiting on the backend's webhook, which
    // needs a URL and a shared secret configured on another service and fails
    // silently when either is missing. The chrome is on every page, so this
    // drops the whole site's cache.
    revalidateGlobals();
    revalidatePath("/admin/site");
    return { ok: true, revalidated: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof ApiRequestError
          ? err.message
          : "Could not reach the content API. Is the backend running?",
    };
  }
}
