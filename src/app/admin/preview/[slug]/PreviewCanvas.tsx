"use client";

import { useEffect, useState } from "react";
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
import type { PageSection } from "@/lib/content.types";

/**
 * Renders the real marketing sections from draft data.
 *
 * This lives inside an iframe so the page gets a genuine viewport — media
 * queries and the responsive layout behave exactly as they will in
 * production, which a CSS-scaled div could not reproduce.
 *
 * The editor pushes drafts in over postMessage; the iframe only trusts
 * messages from its own origin.
 */
export const PREVIEW_MESSAGE = "omd-preview-sections";
/** Sent up when a visitor clicks inside the frame. */
export const PREVIEW_SELECT = "omd-preview-select";

export default function PreviewCanvas({ initial }: { initial: PageSection[] }) {
  const [sections, setSections] = useState<PageSection[]>(initial);
  const [focus, setFocus] = useState<string | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      // Same-origin only: the editor and this frame are served by this app.
      if (event.origin !== window.location.origin) return;
      const payload = event.data as
        | { type?: string; sections?: PageSection[]; focus?: string | null }
        | null;
      if (!payload || payload.type !== PREVIEW_MESSAGE) return;

      if (Array.isArray(payload.sections)) setSections(payload.sections);
      if (payload.focus !== undefined) setFocus(payload.focus);
    }

    window.addEventListener("message", onMessage);
    // Tell the editor we are ready, so it can push the current draft even if
    // the iframe finished loading after the first change.
    window.parent.postMessage({ type: `${PREVIEW_MESSAGE}:ready` }, window.location.origin);

    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Scroll the section being edited into view.
  useEffect(() => {
    if (!focus) return;
    const el = document.querySelector(`[data-preview-key="${focus}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focus]);

  // Clicking anything in the frame selects the section that owns it, so the
  // editor can jump to the matching form. Links are suppressed — navigating
  // away inside the preview would be surprising and lose the draft view.
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const owner = target?.closest?.("[data-preview-key]");
      if (!owner) return;

      event.preventDefault();
      const key = owner.getAttribute("data-preview-key");
      const field = target?.closest?.("[data-preview-field]")?.getAttribute("data-preview-field");

      window.parent.postMessage(
        { type: PREVIEW_SELECT, key, field: field ?? null },
        window.location.origin,
      );
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const visible = [...sections].filter((s) => s.enabled).sort((a, b) => a.order - b.order);

  const render = (section: PageSection) => {
    const d = section.data as never;

    switch (section.type) {
      case "hero":
        return <Hero data={{ ...heroDefaults, ...(d as object) }} />;
      case "careCoverage":
        return <CareCoverage data={{ ...careCoverageDefaults, ...(d as object) }} />;
      case "audiences":
        return <Audiences data={{ ...audiencesDefaults, ...(d as object) }} />;
      case "network":
        return <Network data={{ ...networkDefaults, ...(d as object) }} />;
      case "noList":
        return <NoList data={{ ...noListDefaults, ...(d as object) }} />;
      case "appPromo":
        return <AppPromo data={{ ...appPromoDefaults, ...(d as object) }} />;
      case "whyOptimalMD":
        return <WhyOptimalMD data={{ ...whyOptimalMDDefaults, ...(d as object) }} />;
      case "givesBack":
        return <GivesBack data={{ ...givesBackDefaults, ...(d as object) }} />;
      case "finalCta":
        return <FinalCta data={{ ...finalCtaDefaults, ...(d as object) }} />;
      default:
        return null;
    }
  };

  return (
    <main className="site-main">
      {visible.map((section) => (
        <div
          key={section.key}
          data-preview-key={section.key}
          className={focus === section.key ? "previewSection isFocused" : "previewSection"}
        >
          {render(section)}
        </div>
      ))}
    </main>
  );
}
