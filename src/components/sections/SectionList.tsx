"use client";

import { Fragment } from "react";
import type { PageSection, SectionType } from "@/lib/content.types";
import AppPromo, { appPromoDefaults } from "./AppPromo/AppPromo";
import Audiences, { audiencesDefaults } from "./Audiences/Audiences";
import CareCoverage from "./CareCoverage/CareCoverage";
import { careCoverageDefaults } from "./CareCoverage/care.data";
import FinalCta, { finalCtaDefaults } from "./FinalCta/FinalCta";
import GivesBack from "./GivesBack/GivesBack";
import { givesBackDefaults } from "./GivesBack/gives.data";
import Hero from "./Hero/Hero";
import { heroDefaults } from "./Hero/hero.data";
import Network, { networkDefaults } from "./Network/Network";
import NoList, { noListDefaults } from "./NoList/NoList";
import WhyOptimalMD, { whyOptimalMDDefaults } from "./WhyOptimalMD/WhyOptimalMD";

/**
 * Renders a page's sections in their stored order.
 *
 * Previously the public page and the admin preview each carried their own
 * copy of this type-to-component mapping, and the public one additionally
 * hard-coded the order. That made a section's position a property of the code
 * rather than of the content — so a custom HTML block could only ever appear
 * where a developer had written it, and only once.
 *
 * One list, used by both, means adding a section type is a single edit and a
 * section's position is whatever an editor chose.
 */

/** Defaults per type, so a section saved before a field existed still renders. */
export const sectionDefaults: Record<SectionType, object> = {
  hero: heroDefaults,
  careCoverage: careCoverageDefaults,
  audiences: audiencesDefaults,
  network: networkDefaults,
  noList: noListDefaults,
  appPromo: appPromoDefaults,
  whyOptimalMD: whyOptimalMDDefaults,
  givesBack: givesBackDefaults,
  finalCta: finalCtaDefaults,
};

/* eslint-disable @typescript-eslint/no-explicit-any -- each component takes its
   own data shape; the map is the one place where they are held together, and
   the merge above is what guarantees the shape is complete. */
const COMPONENTS: Record<SectionType, (props: { data: any }) => React.ReactNode> = {
  hero: Hero,
  careCoverage: CareCoverage,
  audiences: Audiences,
  network: Network,
  noList: NoList,
  appPromo: AppPromo,
  whyOptimalMD: WhyOptimalMD,
  givesBack: GivesBack,
  finalCta: FinalCta,
};
/* eslint-enable @typescript-eslint/no-explicit-any */

/** The stock page, used when the content API has nothing to say. */
export const defaultSections: PageSection[] = (
  [
    "hero",
    "careCoverage",
    "audiences",
    "network",
    "noList",
    "appPromo",
    "whyOptimalMD",
    "givesBack",
    "finalCta",
  ] as SectionType[]
).map((type, order) => ({
  key: type,
  type,
  order,
  enabled: true,
  data: sectionDefaults[type] as Record<string, unknown>,
}));

export function renderSection(section: PageSection): React.ReactNode {
  const Component = COMPONENTS[section.type];
  if (!Component) return null;

  // Stored data over shipped defaults: a section written before a field
  // existed still receives every key its component reads.
  const data = { ...sectionDefaults[section.type], ...(section.data as object) };
  return <Component data={data} />;
}

export default function SectionList({ sections }: { sections: PageSection[] }) {
  return (
    <>
      {[...sections]
        .sort((a, b) => a.order - b.order)
        .filter((section) => section.enabled)
        // A fragment, not a wrapper element: these are full-bleed <section>
        // elements and an extra block in between would change their layout.
        .map((section) => <Fragment key={section.key}>{renderSection(section)}</Fragment>)}
    </>
  );
}
