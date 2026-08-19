"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveGlobals } from "@/app/admin/(portal)/site/actions";
import { GLOBALS_MESSAGE, GLOBALS_SELECT } from "@/app/admin/preview/globals/GlobalsCanvas";
import type { FooterData, GlobalsPart, NavData } from "@/lib/globals.types";
import { DeviceProvider } from "./DeviceContext";
import { focusField } from "./focusField";
import FooterForm from "./globals/FooterForm";
import NavForm from "./globals/NavForm";

/**
 * Editor for the site's navbar and footer.
 *
 * Deliberately the same shape as the page workspace — form on the left, live
 * frame on the right, device switch driving both — because it is the same job
 * with different content, and an editor that reinvents its layout per screen
 * makes the second screen a thing to relearn.
 *
 * Nav and footer are saved separately: they are independent documents on the
 * API, and publishing a menu change should not require the footer to be valid.
 */

type Status = { kind: "ok" | "error" | "warn"; message: string } | null;

const DEVICES = {
  desktop: { label: "Desktop", width: 1440 },
  tablet: { label: "Tablet", width: 834 },
  mobile: { label: "Mobile", width: 390 },
} as const;

type DeviceKey = keyof typeof DEVICES;

const TABS: { key: GlobalsPart; label: string }[] = [
  { key: "nav", label: "Navigation bar" },
  { key: "footer", label: "Footer" },
];

export default function GlobalsWorkspace({
  initialNav,
  initialFooter,
}: {
  initialNav: NavData;
  initialFooter: FooterData;
}) {
  const [nav, setNav] = useState(initialNav);
  const [footer, setFooter] = useState(initialFooter);
  const [tab, setTab] = useState<GlobalsPart>("nav");
  const [device, setDevice] = useState<DeviceKey>("desktop");
  const [status, setStatus] = useState<Status>(null);
  const [pending, setPending] = useState(false);
  const [dirty, setDirty] = useState<Set<GlobalsPart>>(new Set());

  const frameRef = useRef<HTMLIFrameElement>(null);
  const frameReady = useRef(false);
  const paneRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const pushToPreview = useCallback((next: { nav?: NavData; footer?: FooterData }) => {
    if (!frameReady.current) return;
    frameRef.current?.contentWindow?.postMessage(
      { type: GLOBALS_MESSAGE, ...next },
      window.location.origin,
    );
  }, []);

  // The frame announces itself once mounted; only then is postMessage useful.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const payload = event.data as { type?: string; field?: string } | null;

      if (payload?.type === `${GLOBALS_MESSAGE}-ready`) {
        frameReady.current = true;
        pushToPreview({ nav, footer });
        return;
      }

      // Clicking anything in the frame opens the right tab and reveals that
      // exact field, unfolding the rows it is nested inside.
      if (payload?.type === GLOBALS_SELECT && payload.field) {
        const field = payload.field;
        setTab(field.startsWith("footer") ? "footer" : "nav");
        requestAnimationFrame(() => focusField(formRef.current, field));
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [nav, footer, pushToPreview]);

  const width = DEVICES[device].width;

  // The frame renders at its true CSS width so media queries fire correctly,
  // then is scaled down purely visually to fit whatever space the pane has.
  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;

    const fit = () => setScale(Math.min(1, (pane.clientWidth - 40) / width));
    fit();

    const observer = new ResizeObserver(fit);
    observer.observe(pane);
    return () => observer.disconnect();
  }, [width]);

  const editNav = (next: NavData) => {
    setNav(next);
    setDirty((prev) => new Set(prev).add("nav"));
    pushToPreview({ nav: next });
  };

  const editFooter = (next: FooterData) => {
    setFooter(next);
    setDirty((prev) => new Set(prev).add("footer"));
    pushToPreview({ footer: next });
  };

  async function publish() {
    setPending(true);
    setStatus(null);

    const parts: GlobalsPart[] = [...dirty];
    const failures: string[] = [];
    let stale = false;

    for (const part of parts) {
      const result = await saveGlobals(part, part === "nav" ? nav : footer);
      if (!result.ok) failures.push(`${part}: ${result.error}`);
      else if (!result.revalidated) stale = true;
    }

    if (failures.length > 0) {
      setStatus({ kind: "error", message: failures.join(" · ") });
    } else {
      setDirty(new Set());
      setStatus(
        stale
          ? {
              kind: "warn",
              message: "Saved, but the live site was not refreshed. It may lag behind.",
            }
          : { kind: "ok", message: "Published. The live site has been refreshed." },
      );
    }

    setPending(false);
  }

  return (
    <div className="workspace">
      <header className="wsBar">
        <div>
          <h1>Site chrome</h1>
          <p>
            Navigation bar and footer, shown on every page
            {dirty.size > 0
              ? ` · ${dirty.size} unsaved change${dirty.size === 1 ? "" : "s"}`
              : ""}
          </p>
        </div>

        <div className="wsBarTools">
          <div className="segmented" role="group" aria-label="Preview size">
            {(Object.keys(DEVICES) as DeviceKey[]).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={device === key}
                onClick={() => setDevice(key)}
              >
                {DEVICES[key].label}
              </button>
            ))}
          </div>

          <a className="btn btnGhost" href="/" target="_blank" rel="noreferrer">
            View live ↗
          </a>
          <button
            className="btn btnPrimary"
            type="button"
            onClick={publish}
            disabled={pending || dirty.size === 0}
          >
            {pending ? "Saving…" : `Publish${dirty.size ? ` (${dirty.size})` : ""}`}
          </button>
        </div>
      </header>

      {/* The device switch drives text-size editing as well as the frame
          width, so a size chosen while looking at Tablet lands on tablet. */}
      <DeviceProvider value={device}>
        <div className="wsBody">
          <aside className="wsPanel">
            <div className="segmented segmentedWide" role="group" aria-label="Editor mode">
              {TABS.map((entry) => (
                <button
                  key={entry.key}
                  type="button"
                  aria-pressed={tab === entry.key}
                  onClick={() => setTab(entry.key)}
                >
                  {entry.label}
                  {dirty.has(entry.key) ? <span className="dot" aria-hidden /> : null}
                </button>
              ))}
            </div>

            {status ? (
              <div
                className={`alert alert${
                  status.kind === "error" ? "Error" : status.kind === "ok" ? "Ok" : "Warn"
                }`}
                role="status"
              >
                {status.message}
              </div>
            ) : null}

            <div ref={formRef}>
              {tab === "nav" ? (
                <NavForm value={nav} onChange={editNav} />
              ) : (
                <FooterForm value={footer} onChange={editFooter} />
              )}
            </div>
          </aside>

          <section className="wsPreview" ref={paneRef}>
            {/* Outer box reserves the scaled-down footprint so the pane scrolls
                correctly; the inner stage does the visual scaling. */}
            <div style={{ width: width * scale, height: 900 * scale }}>
              <div
                className="wsPreviewStage"
                style={{ transform: `scale(${scale})`, width, height: 900 }}
              >
                <iframe
                  ref={frameRef}
                  title="Live preview"
                  src="/admin/preview/globals"
                  style={{ width, height: 900 }}
                  className="previewFrame"
                />
              </div>
            </div>
          </section>
        </div>
      </DeviceProvider>
    </div>
  );
}
