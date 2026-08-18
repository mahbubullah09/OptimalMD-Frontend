"use client";

import { useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { richText } from "@/lib/richText";
import type { CareCoverageData } from "@/lib/sections.types";
import { CareGradientDefs, careCoverageDefaults, carePaneIcons } from "./care.data";
import styles from "./CareCoverage.module.css";

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export default function CareCoverage({
  data = careCoverageDefaults,
}: {
  data?: CareCoverageData;
}) {
  const panes = data.panes.length > 0 ? data.panes : careCoverageDefaults.panes;
  const [activeId, setActiveId] = useState(panes[0].id);
  const activeIndex = Math.max(
    0,
    panes.findIndex((pane) => pane.id === activeId),
  );
  const active = panes[activeIndex] ?? panes[0];
  const ActiveIcon = carePaneIcons[active.id];

  return (
    <section className="section light" id="care">
      <CareGradientDefs />

      <Reveal className="wrap center">
        <div className="sec-eyebrow" data-preview-field="eyebrow">{richText(data.eyebrow)}</div>
        <h2 className="sec-title" data-preview-field="title">{richText(data.title)}</h2>
        <p className="sec-sub" data-preview-field="subtitle">{richText(data.subtitle)}</p>
        {data.source ? (
          <div className="src" data-preview-field="source">
            {richText(data.source)}
          </div>
        ) : null}
      </Reveal>

      <Reveal className="wrap">
        <div className={styles.careShell} data-preview-field="panes">
          <div className={styles.careTabs} role="tablist" aria-label="Care coverage categories">
            {panes.map((pane, i) => {
              const Icon = carePaneIcons[pane.id];
              const isActive = pane.id === activeId;

              return (
                <button
                  type="button"
                  key={pane.id}
                  role="tab"
                  id={`care-tab-${pane.id}`}
                  aria-selected={isActive}
                  aria-controls={`care-pane-${pane.id}`}
                  className={`${styles.careTab}${isActive ? ` ${styles.active}` : ""}`}
                  data-preview-field={`panes.${i}`}
                  onClick={() => setActiveId(pane.id)}
                >
                  <span className={styles.tico}>{Icon ? <Icon /> : null}</span>
                  <span>
                    <span className={styles.t}>{richText(pane.tabTitle)}</span>
                    <span className={styles.d}>{richText(pane.tabDetail)}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className={styles.carePanel}>
            <div
              className={styles.carePane}
              key={active.id}
              role="tabpanel"
              id={`care-pane-${active.id}`}
              aria-labelledby={`care-tab-${active.id}`}
            >
              <span
                className={styles.paneTag}
                data-preview-field={`panes.${activeIndex}.tag`}
              >
                {richText(active.tag)}
              </span>
              <div className={styles.paneHead}>
                <span
                  className={styles.pico}
                  data-preview-field={`panes.${activeIndex}.icon`}
                >
                  {ActiveIcon ? <ActiveIcon /> : null}
                </span>
                <h3 data-preview-field={`panes.${activeIndex}.heading`}>
                  {richText(active.heading)}
                </h3>
              </div>

              <ul className={styles.careList} data-preview-field={`panes.${activeIndex}.items`}>
                {active.items.map((item, i) => (
                  <li key={i}>
                    <span className={styles.ck}>
                      <CheckIcon />
                    </span>
                    <span>{richText(item)}</span>
                  </li>
                ))}
              </ul>

              {active.note ? (
                <div
                  className={styles.careNote}
                  data-preview-field={`panes.${activeIndex}.note`}
                >
                  {richText(active.note)}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
