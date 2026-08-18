"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { saveSection, saveSeo } from "@/app/admin/(portal)/pages/[slug]/actions";
import { PREVIEW_MESSAGE, PREVIEW_SELECT } from "@/app/admin/preview/[slug]/PreviewCanvas";
import {
  type PageDocument,
  type PageSection,
  type PageSeo,
  SECTION_LABELS,
  withSeoDefaults,
} from "@/lib/content.types";
import SectionFormFor from "./sections/SectionFormFor";
import SeoPanel from "./sections/SeoPanel";

type Status = { kind: "ok" | "error" | "warn"; message: string } | null;

const DEVICES = {
  desktop: { label: "Desktop", width: 1440 },
  tablet: { label: "Tablet", width: 834 },
  mobile: { label: "Mobile", width: 390 },
} as const;

type DeviceKey = keyof typeof DEVICES;

export default function PageWorkspace({ page }: { page: PageDocument }) {
  const [sections, setSections] = useState<PageSection[]>(() =>
    [...page.sections].sort((a, b) => a.order - b.order),
  );
  const [seo, setSeo] = useState<PageSeo>(() => withSeoDefaults(page.seo));
  const [activeKey, setActiveKey] = useState<string>(() => page.sections[0]?.key ?? "");
  const [tab, setTab] = useState<"content" | "seo">("content");
  const [device, setDevice] = useState<DeviceKey>("desktop");
  const [status, setStatus] = useState<Status>(null);
  const [pending, setPending] = useState(false);
  const [dirty, setDirty] = useState<Set<string>>(new Set());

  const frameRef = useRef<HTMLIFrameElement>(null);
  const frameReady = useRef(false);
  const paneRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [flash, setFlash] = useState(false);

  /** Push the current draft into the preview frame. */
  const pushToPreview = useCallback(
    (next: PageSection[], focus?: string | null) => {
      if (!frameReady.current) return;
      frameRef.current?.contentWindow?.postMessage(
        { type: PREVIEW_MESSAGE, sections: next, focus },
        window.location.origin,
      );
    },
    [],
  );

  // The frame announces itself once mounted; only then is postMessage useful.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; key?: string; field?: string | null } | null;
      if (!data) return;

      if (data.type === `${PREVIEW_MESSAGE}:ready`) {
        frameReady.current = true;
        pushToPreview(sections, activeKey);
        return;
      }

      // Clicking in the preview opens the matching form, and — when the
      // clicked element carries a field path — scrolls to and focuses that
      // exact input rather than just selecting the section.
      if (data.type === PREVIEW_SELECT && data.key) {
        setActiveKey(data.key);
        setTab("content");
        setFlash(true);
        window.setTimeout(() => setFlash(false), 900);

        // Wait a frame so the newly selected form has rendered.
        requestAnimationFrame(() => {
          const target = data.field
            ? formRef.current?.querySelector<HTMLElement>(
                `[data-field-path="${CSS.escape(data.field)}"]`,
              )
            : null;

          if (target) {
            for (
              let node: HTMLElement | null = target;
              node && formRef.current?.contains(node);
              node = node.parentElement
            ) {
              if (node instanceof HTMLDetailsElement) node.open = true;
            }
            if (target instanceof HTMLDetailsElement) target.open = true;

            requestAnimationFrame(() => {
              target.scrollIntoView({ behavior: "smooth", block: "center" });
              target.classList.add("fieldHit");
              window.setTimeout(() => target.classList.remove("fieldHit"), 1200);
              target
                .querySelector<HTMLElement>("input, textarea, [contenteditable]")
                ?.focus({ preventScroll: true });
            });
          } else {
            formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sections, activeKey, pushToPreview]);

  // Warn before losing unsaved work.
  useEffect(() => {
    if (dirty.size === 0) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const active = useMemo(
    () => sections.find((s) => s.key === activeKey) ?? sections[0],
    [sections, activeKey],
  );

  function updateSectionData(key: string, data: Record<string, unknown>) {
    setSections((prev) => {
      const next = prev.map((s) => (s.key === key ? { ...s, data } : s));
      pushToPreview(next, key);
      return next;
    });
    setDirty((prev) => new Set(prev).add(key));
    setStatus(null);
  }

  function toggleSection(key: string, enabled: boolean) {
    setSections((prev) => {
      const next = prev.map((s) => (s.key === key ? { ...s, enabled } : s));
      pushToPreview(next, key);
      return next;
    });
    setDirty((prev) => new Set(prev).add(key));
  }

  function selectSection(key: string) {
    setActiveKey(key);
    setTab("content");
    pushToPreview(sections, key);
  }

  function report(result: { ok: boolean; revalidated?: boolean; error?: string }) {
    if (!result.ok) {
      setStatus({ kind: "error", message: result.error ?? "Could not save" });
      return false;
    }
    setStatus(
      result.revalidated
        ? { kind: "ok", message: "Saved. The live page is updating." }
        : {
            kind: "warn",
            message: "Saved, but the live page could not be refreshed automatically.",
          },
    );
    return true;
  }

  async function saveActiveSection() {
    if (!active) return;
    setPending(true);
    const result = await saveSection(page.slug, active.key, active.data, active.enabled);
    if (report(result)) {
      setDirty((prev) => {
        const next = new Set(prev);
        next.delete(active.key);
        return next;
      });
    }
    setPending(false);
  }

  async function saveAll() {
    setPending(true);
    let failure: string | null = null;
    let revalidated = false;

    for (const key of dirty) {
      const section = sections.find((s) => s.key === key);
      if (!section) continue;
      const result = await saveSection(page.slug, key, section.data, section.enabled);
      if (!result.ok) {
        failure = result.error;
        break;
      }
      revalidated = result.revalidated;
    }

    if (failure) {
      setStatus({ kind: "error", message: failure });
    } else {
      setDirty(new Set());
      report({ ok: true, revalidated });
    }
    setPending(false);
  }

  async function persistSeo() {
    setPending(true);
    report(await saveSeo(page.slug, seo));
    setPending(false);
  }

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

  return (
    <div className="workspace">
      <header className="wsBar">
        <div>
          <h1>{page.name}</h1>
          <p>
            /{page.slug === "home" ? "" : page.slug}
            {dirty.size > 0 ? ` · ${dirty.size} unsaved change${dirty.size === 1 ? "" : "s"}` : ""}
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
            onClick={saveAll}
            disabled={pending || dirty.size === 0}
          >
            {pending ? "Saving…" : `Publish${dirty.size ? ` (${dirty.size})` : ""}`}
          </button>
        </div>
      </header>

      <div className="wsBody">
        <aside className="wsPanel">
          <div className="segmented segmentedWide" role="group" aria-label="Editor mode">
            <button type="button" aria-pressed={tab === "content"} onClick={() => setTab("content")}>
              Content
            </button>
            <button type="button" aria-pressed={tab === "seo"} onClick={() => setTab("seo")}>
              SEO
            </button>
          </div>

          {status ? (
            <div
              className={`alert alert${status.kind === "error" ? "Error" : status.kind === "ok" ? "Ok" : "Warn"}`}
              role="status"
            >
              {status.message}
            </div>
          ) : null}

          {tab === "content" ? (
            <>
              <nav className="sectionNav">
                {sections.map((section) => (
                  <button
                    key={section.key}
                    type="button"
                    className={`sectionNavItem${section.key === activeKey ? " active" : ""}`}
                    onClick={() => selectSection(section.key)}
                  >
                    <span>
                      {SECTION_LABELS[section.type] ?? section.type}
                      {dirty.has(section.key) ? <b className="dot" aria-label="unsaved" /> : null}
                    </span>
                    {!section.enabled ? <em>hidden</em> : null}
                  </button>
                ))}
              </nav>

              {active ? (
                <div className={`wsForm${flash ? " isFlash" : ""}`} ref={formRef}>
                  <div className="wsFormHead">
                    <h2>{SECTION_LABELS[active.type] ?? active.type}</h2>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={active.enabled}
                        onChange={(e) => toggleSection(active.key, e.target.checked)}
                      />
                      Visible
                    </label>
                  </div>

                  <SectionFormFor
                    section={active}
                    onChange={(data) => updateSectionData(active.key, data)}
                  />

                  <div className="wsFormFoot">
                    <button
                      className="btn btnPrimary"
                      type="button"
                      onClick={saveActiveSection}
                      disabled={pending || !dirty.has(active.key)}
                    >
                      {pending ? "Saving…" : "Save this section"}
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="wsForm">
              <SeoPanel seo={seo} slug={page.slug} onChange={setSeo} />
              <div className="wsFormFoot">
                <button
                  className="btn btnPrimary"
                  type="button"
                  onClick={persistSeo}
                  disabled={pending}
                >
                  {pending ? "Saving…" : "Save SEO"}
                </button>
              </div>
            </div>
          )}
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
                src={`/admin/preview/${page.slug}`}
                style={{ width, height: 900 }}
                className="previewFrame"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
