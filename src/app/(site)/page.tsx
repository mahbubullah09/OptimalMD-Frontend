import type { Metadata } from "next";
import AppPromo, { appPromoDefaults } from "@/components/sections/AppPromo/AppPromo";
import Audiences, { audiencesDefaults } from "@/components/sections/Audiences/Audiences";
import CareCoverage from "@/components/sections/CareCoverage/CareCoverage";
import { careCoverageDefaults } from "@/components/sections/CareCoverage/care.data";
import FinalCta, { finalCtaDefaults } from "@/components/sections/FinalCta/FinalCta";
import GivesBack from "@/components/sections/GivesBack/GivesBack";
import { givesBackDefaults } from "@/components/sections/GivesBack/gives.data";
import Hero from "@/components/sections/Hero/Hero";
import { heroDefaults } from "@/components/sections/Hero/hero.data";
import Network, { networkDefaults } from "@/components/sections/Network/Network";
import NoList, { noListDefaults } from "@/components/sections/NoList/NoList";
import WhyOptimalMD, {
  whyOptimalMDDefaults,
} from "@/components/sections/WhyOptimalMD/WhyOptimalMD";
import { withSeoDefaults } from "@/lib/content.types";
import { getPublishedPage } from "@/lib/content";
import { buildStructuredData } from "@/lib/structuredData";
import { createSectionResolver } from "@/lib/pageContent";

/**
 * SEO is read from the CMS, so edits in the admin take effect as soon as the
 * page revalidates. If the API is unreachable the static fallback in
 * (site)/layout.tsx still applies, so the page never ships without metadata.
 */
export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedPage("home");
  if (!page) return {};

  const seo = withSeoDefaults(page.seo);

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
      ...(seo.ogTitle || seo.title ? { title: seo.ogTitle || seo.title } : {}),
      ...(seo.ogDescription || seo.description
        ? { description: seo.ogDescription || seo.description }
        : {}),
      ...(seo.ogImage ? { images: [seo.ogImage] } : {}),
    },
    twitter: {
      card: seo.twitterCard,
      ...(seo.ogTitle || seo.title ? { title: seo.ogTitle || seo.title } : {}),
      ...(seo.ogDescription || seo.description
        ? { description: seo.ogDescription || seo.description }
        : {}),
      ...(seo.ogImage ? { images: [seo.ogImage] } : {}),
    },
  };
}

export default async function HomePage() {
  const page = await getPublishedPage("home");
  const cms = createSectionResolver(page);

  // Structured data is assembled from the toggles an editor set in the admin,
  // plus every image that carries describing text.
  const network = cms.data("network", networkDefaults);
  const appPromo = cms.data("appPromo", appPromoDefaults);
  const why = cms.data("whyOptimalMD", whyOptimalMDDefaults);

  const jsonLd = buildStructuredData(
    withSeoDefaults(page?.seo),
    "https://optimalmd.com/",
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
      {cms.isVisible("hero") ? <Hero data={cms.data("hero", heroDefaults)} /> : null}
      {cms.isVisible("careCoverage") ? (
        <CareCoverage data={cms.data("careCoverage", careCoverageDefaults)} />
      ) : null}
      {cms.isVisible("audiences") ? (
        <Audiences data={cms.data("audiences", audiencesDefaults)} />
      ) : null}
      {cms.isVisible("network") ? <Network data={cms.data("network", networkDefaults)} /> : null}
      {cms.isVisible("noList") ? <NoList data={cms.data("noList", noListDefaults)} /> : null}
      {cms.isVisible("appPromo") ? (
        <AppPromo data={cms.data("appPromo", appPromoDefaults)} />
      ) : null}
      {cms.isVisible("whyOptimalMD") ? (
        <WhyOptimalMD data={cms.data("whyOptimalMD", whyOptimalMDDefaults)} />
      ) : null}
      {cms.isVisible("givesBack") ? (
        <GivesBack data={cms.data("givesBack", givesBackDefaults)} />
      ) : null}
      {cms.isVisible("finalCta") ? (
        <FinalCta data={cms.data("finalCta", finalCtaDefaults)} />
      ) : null}
    </main>
  );
}
