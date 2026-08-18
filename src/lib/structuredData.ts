import type { PageSeo } from "./content.types";
import type { ImageData } from "./sections.types";
import { ORG } from "./site";

/**
 * ImageObject entries for images that carry describing text.
 *
 * An image with no alt or description adds nothing a crawler can use, so it is
 * skipped rather than emitted as an empty node.
 */
function imageObjects(images: ImageData[]): object[] {
  return images
    .filter((image) => image.src && (image.alt || image.description))
    .map((image) => ({
      "@context": "https://schema.org",
      "@type": "ImageObject",
      contentUrl: image.src,
      ...(image.title ? { name: image.title } : {}),
      ...(image.description || image.alt
        ? { description: image.description || image.alt }
        : {}),
      ...(image.alt ? { caption: image.alt } : {}),
    }));
}

/**
 * Builds schema.org JSON-LD from the SEO settings an editor configured in the
 * admin, so nobody has to hand-write structured data.
 *
 * Returns an array of blocks; blocks whose toggle is off, or whose entries are
 * empty, are omitted entirely — emitting an empty FAQPage is worse than
 * emitting none, because Google flags it as invalid.
 */
export function buildStructuredData(
  seo: PageSeo,
  pageUrl: string,
  images: ImageData[] = [],
): object[] {
  const blocks: object[] = [];
  const schema = seo.schema;
  if (!schema) return blocks;

  if (schema.organization?.enabled) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: ORG.name,
      legalName: ORG.legalName,
      url: ORG.url,
      logo: ORG.logo,
      telephone: ORG.phoneE164,
      email: ORG.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: `${ORG.address.street}, ${ORG.address.suite}`,
        addressLocality: ORG.address.city,
        addressRegion: ORG.address.region,
        postalCode: ORG.address.postalCode,
        addressCountry: "US",
      },
      sameAs: [ORG.social.facebook, ORG.social.instagram, ORG.social.youtube],
    });
  }

  if (schema.webPage?.enabled) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": schema.webPage.type,
      name: seo.title || ORG.name,
      ...(seo.description ? { description: seo.description } : {}),
      url: pageUrl,
      ...(seo.ogImage ? { primaryImageOfPage: seo.ogImage } : {}),
      isPartOf: { "@type": "WebSite", name: ORG.name, url: ORG.url },
    });
  }

  const faqItems = (schema.faq?.items ?? []).filter((i) => i.question && i.answer);
  if (schema.faq?.enabled && faqItems.length > 0) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  }

  const crumbs = (schema.breadcrumbs?.items ?? []).filter((i) => i.name && i.url);
  if (schema.breadcrumbs?.enabled && crumbs.length > 0) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    });
  }

  blocks.push(...imageObjects(images));

  return blocks;
}
