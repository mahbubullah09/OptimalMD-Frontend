"use client";

import { appPromoDefaults } from "@/components/sections/AppPromo/AppPromo";
import { audiencesDefaults } from "@/components/sections/Audiences/Audiences";
import { CareGradientDefs, careCoverageDefaults } from "@/components/sections/CareCoverage/care.data";
import { finalCtaDefaults } from "@/components/sections/FinalCta/FinalCta";
import { GivesGradientDefs, givesBackDefaults } from "@/components/sections/GivesBack/gives.data";
import { heroDefaults } from "@/components/sections/Hero/hero.data";
import { networkDefaults } from "@/components/sections/Network/Network";
import { noListDefaults } from "@/components/sections/NoList/NoList";
import { whyOptimalMDDefaults } from "@/components/sections/WhyOptimalMD/WhyOptimalMD";
import type { PageSection } from "@/lib/content.types";
import {
  AppPromoForm,
  AudiencesForm,
  CareCoverageForm,
  FinalCtaForm,
  GivesBackForm,
  HeroForm,
  NetworkForm,
  NoListForm,
  WhyOptimalMDForm,
} from "./SectionForms";

/**
 * Picks the right form for a section and guarantees it receives a complete
 * object.
 *
 * Stored data is merged over the section's shipped defaults, so a section
 * saved before a field existed still opens with every input populated rather
 * than throwing on a missing nested key.
 */
export default function SectionFormFor({
  section,
  onChange,
}: {
  section: PageSection;
  onChange: (data: Record<string, unknown>) => void;
}) {
  const merge = <T extends object>(defaults: T): T => ({
    ...defaults,
    ...(section.data as Partial<T>),
  });

  const emit = (next: object) => onChange(next as Record<string, unknown>);

  // Care and gives-back icons stroke with url(#…) gradients that are normally
  // defined inside their own section. The icon picker renders those icons far
  // from that markup, so without these the strokes resolve to nothing and the
  // picker shows empty tiles.
  const gradientDefs = (
    <>
      <CareGradientDefs />
      <GivesGradientDefs />
    </>
  );

  switch (section.type) {
    case "hero":
      return <HeroForm data={merge(heroDefaults)} onChange={emit} />;
    case "careCoverage":
      return (
        <>
          {gradientDefs}
          <CareCoverageForm data={merge(careCoverageDefaults)} onChange={emit} />
        </>
      );
    case "audiences":
      return <AudiencesForm data={merge(audiencesDefaults)} onChange={emit} />;
    case "network":
      return <NetworkForm data={merge(networkDefaults)} onChange={emit} />;
    case "noList":
      return <NoListForm data={merge(noListDefaults)} onChange={emit} />;
    case "appPromo":
      return <AppPromoForm data={merge(appPromoDefaults)} onChange={emit} />;
    case "whyOptimalMD":
      return <WhyOptimalMDForm data={merge(whyOptimalMDDefaults)} onChange={emit} />;
    case "givesBack":
      return (
        <>
          {gradientDefs}
          <GivesBackForm data={merge(givesBackDefaults)} onChange={emit} />
        </>
      );
    case "finalCta":
      return <FinalCtaForm data={merge(finalCtaDefaults)} onChange={emit} />;
    default:
      return (
        <p className="alert alertWarn">
          No editor exists for section type &ldquo;{section.type}&rdquo; yet.
        </p>
      );
  }
}
