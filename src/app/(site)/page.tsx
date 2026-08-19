import type { Metadata } from "next";
import { appPromoDefaults } from "@/components/sections/AppPromo/AppPromo";
import { networkDefaults } from "@/components/sections/Network/Network";
import SectionList, { defaultSections } from "@/components/sections/SectionList";
import { whyOptimalMDDefaults } from "@/components/sections/WhyOptimalMD/WhyOptimalMD";
import { withSeoDefaults } from "@/lib/content.types";
import { pageMetadata } from "@/lib/seoMetadata";
import { getPublishedPage } from "@/lib/content";
import { buildStructuredData } from "@/lib/structuredData";
import { createSectionResolver } from "@/lib/pageContent";
import { SITE_URL } from "@/lib/site";

/**
 * SEO is read from the CMS, so edits in the admin take effect as soon as the
 * page revalidates. If the API is unreachable the static fallback in
 * (site)/layout.tsx still applies, so the page never ships without metadata.
 */
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getPublishedPage("home"));
}

export default async function HomePage() {
  const page = await getPublishedPage("home");
  const cms = createSectionResolver(page);

  // With the API unreachable there are no sections at all, so the stock page
  // stands in — the site renders in full either way.
  const sections = page?.sections?.length ? page.sections : defaultSections;

  // Structured data is assembled from the toggles an editor set in the admin,
  // plus every image that carries describing text.
  const network = cms.data("network", networkDefaults);
  const appPromo = cms.data("appPromo", appPromoDefaults);
  const why = cms.data("whyOptimalMD", whyOptimalMDDefaults);

  const jsonLd = buildStructuredData(
    withSeoDefaults(page?.seo),
    `${SITE_URL}/`,
    [network.logos, appPromo.phone, ...why.cards.map((c) => c.icon)],
  );

  // Every section falls back to the defaults it ships with, so the page still
  // renders in full if the content API is unavailable.
  return (
    <main className="site-main">
      {jsonLd.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Built from a typed builder, never from raw editor input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
      {/* Order and visibility come from the content, not from this file, so a
          section can be moved or a custom HTML block dropped anywhere without
          a code change. */}
      <SectionList sections={sections} />
    </main>
  );
}
