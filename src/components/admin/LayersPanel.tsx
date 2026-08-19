"use client";

import { useState } from "react";
import { type PageSection, SECTION_LABELS } from "@/lib/content.types";

/**
 * The layers list: what is on this page, in the order it appears.
 *
 * Dragging reorders. The drop target is drawn as a line between rows rather
 * than by tinting the row underneath, because "before this one" and "onto this
 * one" look identical otherwise and only one of them is possible here.
 *
 * Hovering a row outlines the matching section on the canvas, which is the
 * cheapest way to answer "which one is that?" without clicking and losing the
 * selection you already had.
 */

const EyeIcon = ({ on }: { on: boolean }) => (
  <svg viewBox="0 0 24 24" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {on ? (
      <>
        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
        <circle cx="12" cy="12" r="2.6" />
      </>
    ) : (
      <>
        <path d="m3 3 18 18" />
        <path d="M10.6 10.7a2 2 0 0 0 2.8 2.8" />
        <path d="M9.4 5.9A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.4M6.2 7.4A16.6 16.6 0 0 0 2.5 12S6 18.5 12 18.5a9.7 9.7 0 0 0 3.2-.5" />
      </>
    )}
  </svg>
);

const GripIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <circle cx="9" cy="6" r="1.4" />
    <circle cx="15" cy="6" r="1.4" />
    <circle cx="9" cy="12" r="1.4" />
    <circle cx="15" cy="12" r="1.4" />
    <circle cx="9" cy="18" r="1.4" />
    <circle cx="15" cy="18" r="1.4" />
  </svg>
);

export default function LayersPanel({
  sections,
  activeKey,
  hoverKey,
  dirty,
  onSelect,
  onHover,
  onToggle,
  onMove,
}: {
  sections: PageSection[];
  activeKey: string;
  hoverKey: string | null;
  dirty: Set<string>;
  onSelect: (key: string) => void;
  onHover: (key: string | null) => void;
  onToggle: (key: string, enabled: boolean) => void;
  onMove: (from: number, to: number) => void;
}) {
  const [dragging, setDragging] = useState<number | null>(null);
  const [dropAt, setDropAt] = useState<number | null>(null);

  const finish = () => {
    if (dragging !== null && dropAt !== null) {
      // Removing the row first shifts everything after it up by one.
      const target = dropAt > dragging ? dropAt - 1 : dropAt;
      onMove(dragging, target);
    }
    setDragging(null);
    setDropAt(null);
  };

  return (
    <aside className="bLayers" onMouseLeave={() => onHover(null)}>
      <div className="bLayersHead">
        <span>Layers</span>
        <span className="bLayersCount">{sections.length}</span>
      </div>

      <ol className="bLayerList">
        {sections.map((section, index) => {
          const isActive = section.key === activeKey;

          return (
            <li key={section.key}>
              {dropAt === index && dragging !== null ? <span className="bDropLine" /> : null}

              <div
                className={[
                  "bLayer",
                  isActive ? "isActive" : "",
                  hoverKey === section.key ? "isHovered" : "",
                  section.enabled ? "" : "isHidden",
                  dragging === index ? "isDragging" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                draggable
                onDragStart={(e) => {
                  setDragging(index);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  // Past the midpoint means "after this row".
                  const box = e.currentTarget.getBoundingClientRect();
                  setDropAt(e.clientY < box.top + box.height / 2 ? index : index + 1);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  finish();
                }}
                onDragEnd={finish}
                onMouseEnter={() => onHover(section.key)}
              >
                <span className="bLayerGrip" aria-hidden>
                  <GripIcon />
                </span>

                <button
                  type="button"
                  className="bLayerName"
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => onSelect(section.key)}
                >
                  {SECTION_LABELS[section.type] ?? section.type}
                  {dirty.has(section.key) ? <b className="dot" aria-label="unsaved" /> : null}
                </button>

                <button
                  type="button"
                  className="bLayerEye"
                  aria-label={section.enabled ? "Hide this section" : "Show this section"}
                  aria-pressed={!section.enabled}
                  title={section.enabled ? "Hide" : "Show"}
                  onClick={() => onToggle(section.key, !section.enabled)}
                >
                  <EyeIcon on={section.enabled} />
                </button>
              </div>

              {dropAt === index + 1 && dragging !== null && index === sections.length - 1 ? (
                <span className="bDropLine" />
              ) : null}
            </li>
          );
        })}
      </ol>

      <p className="bLayersHint">Drag to reorder. Ctrl+Z undoes.</p>
    </aside>
  );
}
