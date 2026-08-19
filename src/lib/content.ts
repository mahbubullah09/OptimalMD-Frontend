import "server-only";
import { apiFetch } from "./api";
import type { PageDocument, PageSummary } from "./content.types";

export type * from "./content.types";

/**
 * Reads a page for the public site.
 *
 * Tagged so the /api/revalidate handler can refresh it on demand, with a
 * 1-hour ceiling as a safety net if a revalidate ping is ever missed.
 */
export async function getPublishedPage(slug: string): Promise<PageDocument | null> {
  try {
    const { page } = await apiFetch<{ page: PageDocument }>(`/pages/${slug}`, {
      next: { revalidate: 3600, tags: [`page:${slug}`] },
    });
    return page;
  } catch {
    return null;
  }
}

/** Reads a page for the admin — always fresh, never cached. */
export async function getPageForAdmin(slug: string, token: string): Promise<PageDocument | null> {
  try {
    const { page } = await apiFetch<{ page: PageDocument }>(`/pages/${slug}`, {
      token,
      cache: "no-store",
    });
    return page;
  } catch {
    return null;
  }
}

export async function listPages(token: string): Promise<PageSummary[]> {
  const { pages } = await apiFetch<{ pages: PageSummary[] }>("/pages", {
    token,
    cache: "no-store",
  });
  return pages;
}

