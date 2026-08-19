import type { PageDocument, PageSection } from "./content.types";

/**
 * Resolves CMS sections against each component's built-in defaults.
 *
 * The public site must render even when the content API is unreachable, so a
 * missing page, a missing section, or a section whose stored shape does not
 * match falls back to the defaults that ship with the component rather than
 * rendering an empty page.
 */
export function createSectionResolver(page: PageDocument | null) {
  const byKey = new Map<string, PageSection>(
    (page?.sections ?? []).map((section) => [section.key, section]),
  );

  return {
    /**
     * A section is hidden only when the CMS explicitly disables it. Unknown
     * keys stay visible so a component is never silently dropped because the
     * API was down or the seed is behind the code.
     */
    isVisible(key: string): boolean {
      return byKey.get(key)?.enabled !== false;
    },

    /**
     * Merges stored data over the defaults one level deep, so a section that
     * predates a newly added field still renders that field.
     */
    data<T extends object>(key: string, defaults: T): T {
      const stored = byKey.get(key)?.data;
      if (!stored || typeof stored !== "object") return defaults;
      return { ...defaults, ...(stored as Partial<T>) } as T;
    },
  };
}

