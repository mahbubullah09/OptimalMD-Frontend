"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  saveSection,
  saveSections,
  saveSeo,
} from "@/app/admin/(portal)/pages/[slug]/actions";
import {
  PREVIEW_CHROME,
  PREVIEW_HOVER,
  PREVIEW_MESSAGE,
  PREVIEW_SELECT,
} from "@/app/admin/preview/[slug]/PreviewCanvas";
import {
  type PageDocument,
  type PageSection,
  type PageSeo,
  SECTION_LABELS,
  withSeoDefaults,
} from "@/lib/content.types";
import { DeviceProvider } from "./DeviceContext";
import { focusField } from "./focusField";
import LayersPanel from "./LayersPanel";
import SectionFormFor from "./sections/SectionFormFor";
import SeoPanel from "./sections/SeoPanel";

/**
 * The page builder.
 *
 * Three panes, which is the arrangement every visual builder settles on
 * because the three questions are separate: layers ask *what is on the page*,
 * the canvas asks *what does it look like*, the inspector asks *what is this
 * one thing*. A single scrolling column of forms answered all three at once
 * and answered none of them well.
 *
 * The canvas is authoritative about position — hovering a layer outlines the
 * section, clicking a section selects its layer — so the two panes are two
 * views of one selection rather than two lists to keep in step by hand.
 */

type Status = { kind: "ok" | "error" | "warn"; message: string } | null;

const DEVICES = {
  desktop: { label: "Desktop", width: 1440 },
  tablet: { label: "Tablet", width: 834 },
  mobile: { label: "Mobile", width: 390 },
} as const;

type DeviceKey = keyof typeof DEVICES;

/** How many steps back the editor remembers. */
const HISTORY_LIMIT = 50;

export default function PageWorkspace({ page }: { page: PageDocument }) {
  const router = useRouter();

  const ordered = useMemo(
    () => [...page.sections].sort((a, b) => a.order - b.order),
    [page.sections],
  );

  const [sections, setSections] = useState<PageSection[]>(ordered);
  const [seo, setSeo] = useState<PageSeo>(() => withSeoDefaults(page.seo));
  const [activeKey, setActiveKey] = useState<string>(() => ordered[0]?.key ?? "");
  const [tab, setTab] = useState<"content" | "seo">("content");
  const [device, setDevice] = useState<DeviceKey>("desktop");
  const [status, setStatus] = useState<Status>(null);
  const [pending, setPending] = useState(false);
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [orderDirty, setOrderDirty] = useState(false);
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  /** Undo history. Only the section list is tracked; SEO has its own form. */
  const [past, setPast] = useState<PageSection[][]>([]);
  const [future, setFuture] = useState<PageSection[][]>([]);

  const frameRef = useRef<HTMLIFrameElement>(null);
  const frameReady = useRef(false);
  const paneRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [flash, setFlash] = useState(false);

  /* ---------------------------------------------------------------- */
  /* talking to the canvas                                             */
  /* ---------------------------------------------------------------- */

  const pushToPreview = useCallback(
    (next: {
      sections?: PageSection[];
      selected?: string | null;
      hover?: string | null;
      focus?: string | null;
    }) => {
      if (!frameReady.current) return;
      frameRef.current?.contentWindow?.postMessage(
        { type: PREVIEW_MESSAGE, ...next },
        window.location.origin,
      );
    },
    [],
  );

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as {
        type?: string;
        key?: string | null;
        field?: string | null;
        part?: string | null;
      } | null;
      if (!data) return;

      if (data.type === `${PREVIEW_MESSAGE}:ready`) {
        frameReady.current = true;
        pushToPreview({ sections, selected: activeKey });
        return;
      }

      // Clicking in the canvas selects that section and, when the click landed
      // on something with a field path, reveals that exact input.
      if (data.type === PREVIEW_SELECT && data.key) {
        setActiveKey(data.key);
        setTab("content");
        setFlash(true);
        window.setTimeout(() => setFlash(false), 900);
        pushToPreview({ selected: data.key });
        requestAnimationFrame(() => focusField(formRef.current, data.field));
        return;
      }

      // Pointer moving inside the canvas lights up the matching layer.
      if (data.type === PREVIEW_HOVER) {
        setHoverKey(data.key ?? null);
        return;
      }

      // The navbar and footer are shown for context but belong to no page, so
      // a click on them offers the editor that does own them rather than
      // silently doing nothing.
      if (data.type === PREVIEW_CHROME) {
        const part = data.part === "footer" ? "footer" : "navigation";
        if (
          window.confirm(
            `The ${part} is shared by every page. Open Navigation & footer to edit it?`,
          )
        ) {
          router.push("/admin/site");
        }
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [sections, activeKey, pushToPreview, router]);

  /* ---------------------------------------------------------------- */
  /* editing                                                           */
  /* ---------------------------------------------------------------- */

  /** Records the current list before replacing it, so the step can be undone. */
  const commit = useCallback(
    (next: PageSection[], options: { selected?: string } = {}) => {
      setPast((prev) => [...prev, sections].slice(-HISTORY_LIMIT));
      setFuture([]);
      setSections(next);
      pushToPreview({ sections: next, ...(options.selected ? { selected: options.selected } : {}) });
    },
    [sections, pushToPreview],
  );

  const undo = useCallback(() => {
    setPast((prev) => {
      const previous = prev[prev.length - 1];
      if (!previous) return prev;
      setFuture((ahead) => [sections, ...ahead].slice(0, HISTORY_LIMIT));
      setSections(previous);
      pushToPreview({ sections: previous });
      // The list changed, so what is unsaved is no longer knowable per key.
      setDirty(new Set(previous.map((s) => s.key)));
      setOrderDirty(true);
      return prev.slice(0, -1);
    });
  }, [sections, pushToPreview]);

  const redo = useCallback(() => {
    setFuture((ahead) => {
      const next = ahead[0];
      if (!next) return ahead;
      setPast((prev) => [...prev, sections].slice(-HISTORY_LIMIT));
      setSections(next);
      pushToPreview({ sections: next });
      setDirty(new Set(next.map((s) => s.key)));
      setOrderDirty(true);
      return ahead.slice(1);
    });
  }, [sections, pushToPreview]);

  // The shortcuts anyone who has used a builder will reach for first.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "z") return;
      const target = e.target as HTMLElement | null;
      // Never steal undo from a field someone is typing in.
      if (target?.closest("input, textarea, [contenteditable]")) return;

      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  useEffect(() => {
    if (dirty.size === 0 && !orderDirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty, orderDirty]);

  const active = useMemo(
    () => sections.find((s) => s.key === activeKey) ?? sections[0],
    [sections, activeKey],
  );

  function updateSectionData(key: string, data: Record<string, unknown>) {
    // Typing is not an undo step of its own; the history records structural
    // moves, and a keystroke-level stack would make undo useless.
    setSections((prev) => {
      const next = prev.map((s) => (s.key === key ? { ...s, data } : s));
      pushToPreview({ sections: next, selected: key });
      return next;
    });
    setDirty((prev) => new Set(prev).add(key));
    setStatus(null);
  }

  function toggleSection(key: string, enabled: boolean) {
    commit(
      sections.map((s) => (s.key === key ? { ...s, enabled } : s)),
      { selected: key },
    );
    setDirty((prev) => new Set(prev).add(key));
  }

  function moveSection(from: number, to: number) {
    if (from === to || to < 0 || to >= sections.length) return;

    const next = [...sections];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);

    commit(
      next.map((s, index) => ({ ...s, order: index })),
      { selected: moved.key },
    );
    setActiveKey(moved.key);
    setOrderDirty(true);
  }

  function selectSection(key: string) {
    setActiveKey(key);
    setTab("content");
    pushToPreview({ selected: key, focus: key });
  }

  function hoverSection(key: string | null) {
    setHoverKey(key);
    pushToPreview({ hover: key });
  }

  /* ---------------------------------------------------------------- */
  /* saving                                                            */
  /* ---------------------------------------------------------------- */

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

    // A reorder changes every neighbour's position, which the per-section
    // endpoint cannot express, so the list goes up whole. It carries the
    // content too, so nothing else needs saving afterwards.
    if (orderDirty) {
      const result = await saveSections(page.slug, sections);
      if (result.ok) {
        setOrderDirty(false);
        setDirty(new Set());
        report(result);
      } else {
        setStatus({ kind: "error", message: result.error });
      }
      setPending(false);
      return;
    }

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

    if (failure) setStatus({ kind: "error", message: failure });
    else {
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

  /* ---------------------------------------------------------------- */
  /* canvas sizing                                                     */
  /* ---------------------------------------------------------------- */

  const width = DEVICES[device].width;

  // The frame renders at its true CSS width so media queries fire correctly,
  // then is scaled down purely visually to fit whatever space the pane has.
  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;

    const fit = () => setScale(Math.min(1, (pane.clientWidth - 64) / width));
    fit();

    const observer = new ResizeObserver(fit);
    observer.observe(pane);
    return () => observer.disconnect();
  }, [width]);

  const unsaved = dirty.size + (orderDirty ? 1 : 0);

  return (
    <div className="builder">
      <header className="bTopBar">
        <div className="bTitle">
          <h1>{page.name}</h1>
          <span className="bPath">/{page.slug === "home" ? "" : page.slug}</span>
          {unsaved > 0 ? <span className="bUnsaved">Unsaved</span> : null}
        </div>

        <div className="bTools">
          <div className="bHistory" role="group" aria-label="History">
            <button
              type="button"
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
              disabled={past.length === 0}
              onClick={undo}
            >
              <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 14 4 9l5-5" />
                <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
              </svg>
            </button>
            <button
              type="button"
              title="Redo (Ctrl+Shift+Z)"
              aria-label="Redo"
              disabled={future.length === 0}
              onClick={redo}
            >
              <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m15 14 5-5-5-5" />
                <path d="M20 9H10a6 6 0 0 0 0 12h3" />
              </svg>
            </button>
          </div>

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
            disabled={pending || unsaved === 0}
          >
            {pending ? "Publishing…" : `Publish${unsaved ? ` (${unsaved})` : ""}`}
          </button>
        </div>
      </header>

      {/* The device switch drives text-size editing as well as the canvas
          width, so a size chosen while looking at Tablet lands on tablet. */}
      <DeviceProvider value={device}>
        <div className="bBody">
          <LayersPanel
            sections={sections}
            activeKey={active?.key ?? ""}
            hoverKey={hoverKey}
            dirty={dirty}
            onSelect={selectSection}
            onHover={hoverSection}
            onToggle={toggleSection}
            onMove={moveSection}
          />

          <section className="bCanvas" ref={paneRef}>
            <div className="bStageBox" style={{ width: width * scale, height: 900 * scale }}>
              <div
                className="bStage"
                style={{ transform: `scale(${scale})`, width, height: 900 }}
              >
                <iframe
                  ref={frameRef}
                  title="Page canvas"
                  src={`/admin/preview/${page.slug}`}
                  style={{ width, height: 900 }}
                  className="previewFrame"
                />
              </div>
            </div>
          </section>

          <aside className="bInspector">
            <div className="bInspectorTabs segmented" role="group" aria-label="Inspector">
              <button type="button" aria-pressed={tab === "content"} onClick={() => setTab("content")}>
                Content
              </button>
              <button type="button" aria-pressed={tab === "seo"} onClick={() => setTab("seo")}>
                SEO
              </button>
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

            {tab === "content" ? (
              active ? (
                <div className={`bPanel${flash ? " isFlash" : ""}`}>
                  <div className="bPanelHead">
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

                  <div className="bPanelBody" ref={formRef}>
                    <SectionFormFor
                      section={active}
                      onChange={(data) => updateSectionData(active.key, data)}
                    />
                  </div>

                  <div className="bPanelFoot">
                    <button
                      className="btn btnPrimary"
                      type="button"
                      onClick={saveActiveSection}
                      disabled={pending || !dirty.has(active.key)}
                    >
                      Save this section
                    </button>
                  </div>
                </div>
              ) : (
                <p className="bEmpty">This page has no sections yet.</p>
              )
            ) : (
              <div className="bPanel">
                <div className="bPanelBody">
                  <SeoPanel seo={seo} slug={page.slug} onChange={setSeo} />
                </div>
                <div className="bPanelFoot">
                  <button
                    className="btn btnPrimary"
                    type="button"
                    onClick={persistSeo}
                    disabled={pending}
                  >
                    Save SEO
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      </DeviceProvider>
    </div>
  );
}
