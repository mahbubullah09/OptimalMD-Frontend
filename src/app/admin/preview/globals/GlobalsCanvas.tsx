"use client";

import { useEffect, useState } from "react";
import Footer from "@/components/layout/Footer/Footer";
import Navbar from "@/components/layout/Navbar/Navbar";
import type { FooterData, NavData } from "@/lib/globals.types";

/**
 * Live preview of the site chrome.
 *
 * Renders the real Navbar and Footer inside an iframe, so their dropdowns,
 * hover behaviour and media queries are the genuine article rather than a
 * drawing of them.
 *
 * The strip between the two stands in for page content: without something
 * holding the two apart the footer would sit under the nav, and neither would
 * be seen in the position it actually occupies.
 */
export const GLOBALS_MESSAGE = "omd-preview-globals";
export const GLOBALS_SELECT = "omd-preview-globals-select";

export default function GlobalsCanvas({
  initialNav,
  initialFooter,
}: {
  initialNav: NavData;
  initialFooter: FooterData;
}) {
  const [nav, setNav] = useState(initialNav);
  const [footer, setFooter] = useState(initialFooter);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      // Same-origin only: the editor and this frame are served by this app.
      if (event.origin !== window.location.origin) return;
      const payload = event.data as
        | { type?: string; nav?: NavData; footer?: FooterData }
        | null;
      if (!payload || payload.type !== GLOBALS_MESSAGE) return;

      if (payload.nav) setNav(payload.nav);
      if (payload.footer) setFooter(payload.footer);
    }

    window.addEventListener("message", onMessage);
    window.parent?.postMessage({ type: `${GLOBALS_MESSAGE}-ready` }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Clicking anything in the frame focuses the matching field in the editor.
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = (event.target as HTMLElement | null)?.closest("[data-preview-field]");
      const field = target?.getAttribute("data-preview-field");
      if (!field) return;
      event.preventDefault();
      window.parent?.postMessage(
        { type: GLOBALS_SELECT, field },
        window.location.origin,
      );
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="site-main previewChrome">
      <Navbar data={nav} />
      <div className="previewSpacer">
        <p>Page content appears here</p>
      </div>
      <Footer data={footer} />
    </div>
  );
}
