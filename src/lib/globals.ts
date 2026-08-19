import "server-only";
import { navDefaults } from "@/components/layout/Navbar/nav.data";
import { footerDefaults } from "@/components/layout/Footer/footer.data";
import { apiFetch } from "./api";
import type { FooterData, GlobalsDocument, GlobalsPart, NavData } from "./globals.types";

export type * from "./globals.types";

/**
 * Site-wide chrome: the navbar and the footer.
 *
 * Every read falls back to the transcribed defaults, so the site renders its
 * real navigation even with the API down or before anything has been saved —
 * the same rule the page sections follow. A CMS outage should cost you edits,
 * not a working header.
 */

type GlobalsResponse = { globals: GlobalsDocument | null };

/**
 * Merged shallowly per part: a document saved before a field existed would
 * otherwise render that field as undefined.
 */
export function withGlobalsDefaults(globals: GlobalsDocument | null): {
  nav: NavData;
  footer: FooterData;
} {
  return {
    nav: { ...navDefaults, ...(globals?.nav ?? {}) },
    footer: { ...footerDefaults, ...(globals?.footer ?? {}) },
  };
}

/** Reads the chrome for the public site. Tagged so a save can refresh it. */
export async function getGlobals(): Promise<{ nav: NavData; footer: FooterData }> {
  try {
    const { globals } = await apiFetch<GlobalsResponse>("/globals", {
      next: { revalidate: 3600, tags: ["globals"] },
    });
    return withGlobalsDefaults(globals);
  } catch {
    return withGlobalsDefaults(null);
  }
}

/** Reads the chrome for the admin — always fresh, never cached. */
export async function getGlobalsForAdmin(): Promise<{ nav: NavData; footer: FooterData }> {
  try {
    const { globals } = await apiFetch<GlobalsResponse>("/globals", { cache: "no-store" });
    return withGlobalsDefaults(globals);
  } catch {
    return withGlobalsDefaults(null);
  }
}

/** Replaces one part of the chrome. */
export async function saveGlobalsPart(
  part: GlobalsPart,
  data: NavData | FooterData,
  token: string,
): Promise<{ revalidated: boolean }> {
  const { revalidated } = await apiFetch<{ revalidated: boolean }>(`/globals/${part}`, {
    method: "PUT",
    body: data,
    token,
  });
  return { revalidated };
}
