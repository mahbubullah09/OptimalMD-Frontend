import type { Metadata } from "next";
import { type PageDocument, withSeoDefaults } from "./content.types";

/**
 * Turns a page's stored SEO into Next metadata.
 *
 * Shared by the home page and every other page, so a field added to the SEO
 * panel takes effect everywhere at once. Duplicating this was how the section
 * renderer ended up with three copies of the same map.
 */
export function pageMetadata(page: PageDocument | null): Metadata {
  // No page means the API is unreachable; the layout's static metadata still
  // applies, so returning nothing here is better than inventing values.
  if (!page) return {};

  const seo = withSeoDefaults(page.seo);
  const title = seo.ogTitle || seo.title;
  const description = seo.ogDescription || seo.description;

  return {
    ...(seo.title ? { title: { absolute: seo.title } } : {}),
    ...(seo.description ? { description: seo.description } : {}),
    ...(seo.canonical ? { alternates: { canonical: seo.canonical } } : {}),
    ...(seo.keywords.length > 0 ? { keywords: seo.keywords } : {}),
    robots: { index: !seo.noindex, follow: !seo.nofollow },
    ...(seo.author ? { authors: [{ name: seo.author }] } : {}),
    // Custom tags are author-controlled, so keep them in "other" where Next
    // escapes the values rather than injecting raw markup.
    ...(seo.customMeta.length > 0
      ? {
          other: Object.fromEntries(
            seo.customMeta.filter((t) => t.name).map((t) => [t.name, t.content]),
          ),
        }
      : {}),
    openGraph: {
      type: "website",
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(seo.ogImage ? { images: [seo.ogImage] } : {}),
    },
    twitter: {
      card: seo.twitterCard,
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(seo.ogImage ? { images: [seo.ogImage] } : {}),
    },
  };
}
