"use client";

import { useEffect, useState } from "react";
import { renderSection } from "@/components/sections/SectionList";
import type { PageSection } from "@/lib/content.types";
import { SECTION_LABELS } from "@/lib/content.types";

/**
 * The canvas: real marketing sections rendered from draft data.
 *
 * It lives inside an iframe so the page gets a genuine viewport — media
 * queries and the responsive layout behave exactly as they will in
 * production, which a CSS-scaled div could not reproduce.
 *
 * It also behaves like a canvas rather than a picture of one. Sections outline
 * on hover and carry a name badge, the selected one stays outlined, and a
 * click reports both the section and the exact field beneath the pointer so
 * the inspector can jump straight to it. Hovering a layer in the editor
 * highlights the matching section here, which is the same relationship read
 * from the other direction.
 *
 * Only same-origin messages are trusted; the editor and this frame are served
 * by the same app.
 */
export const PREVIEW_MESSAGE = "omd-preview-sections";
/** Sent up when someone clicks inside the frame. */
export const PREVIEW_SELECT = "omd-preview-select";
/** Sent up as the pointer moves between sections. */
export const PREVIEW_HOVER = "omd-preview-hover";

type Incoming = {
  type?: string;
  sections?: PageSection[];
  focus?: string | null;
  selected?: string | null;
  hover?: string | null;
};

export default function PreviewCanvas({ initial }: { initial: PageSection[] }) {
  const [sections, setSections] = useState<PageSection[]>(initial);
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const payload = event.data as Incoming | null;
      if (!payload || payload.type !== PREVIEW_MESSAGE) return;

      if (Array.isArray(payload.sections)) setSections(payload.sections);
      if (payload.selected !== undefined) setSelected(payload.selected);
      // `hover` is driven by the layers list; the pointer inside the frame
      // sets it locally below.
      if (payload.hover !== undefined) setHover(payload.hover);
      if (payload.focus !== undefined) setFocus(payload.focus);
    }

    window.addEventListener("message", onMessage);
    window.parent?.postMessage(
      { type: `${PREVIEW_MESSAGE}:ready` },
      window.location.origin,
    );
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Scroll the section being edited into view.
  useEffect(() => {
    if (!focus) return;
    document
      .querySelector(`[data-preview-key="${CSS.escape(focus)}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focus]);

  useEffect(() => {
    const keyOf = (target: EventTarget | null) =>
      (target as HTMLElement | null)
        ?.closest?.("[data-preview-key]")
        ?.getAttribute("data-preview-key") ?? null;

    function onClick(event: MouseEvent) {
      const key = keyOf(event.target);
      if (!key) return;

      // Links would navigate away from the draft, which loses the edit in
      // progress; selecting is what a click means on a canvas.
      event.preventDefault();
      const field =
        (event.target as HTMLElement | null)
          ?.closest?.("[data-preview-field]")
          ?.getAttribute("data-preview-field") ?? null;

      setSelected(key);
      window.parent.postMessage(
        { type: PREVIEW_SELECT, key, field },
        window.location.origin,
      );
    }

    function onMove(event: MouseEvent) {
      const key = keyOf(event.target);
      setHover((current) => {
        if (current === key) return current;
        window.parent.postMessage(
          { type: PREVIEW_HOVER, key },
          window.location.origin,
        );
        return key;
      });
    }

    function onLeave() {
      setHover(null);
      window.parent.postMessage(
        { type: PREVIEW_HOVER, key: null },
        window.location.origin,
      );
    }

    document.addEventListener("click", onClick, true);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const visible = [...sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order);

  return (
    <main className="site-main">
      {visible.map((section) => {
        const state = [
          "previewSection",
          selected === section.key ? "isSelected" : "",
          hover === section.key ? "isHovered" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div key={section.key} data-preview-key={section.key} className={state}>
            {/* Names the thing you are about to select, the way a canvas
                does — otherwise an outline appears with no explanation. */}
            <span className="previewTag">
              {SECTION_LABELS[section.type] ?? section.type}
            </span>
            {renderSection(section)}
          </div>
        );
      })}
    </main>
  );
}
