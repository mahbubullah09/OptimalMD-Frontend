"use client";

import { type ComponentType, useEffect, useRef, useState } from "react";

/**
 * Icon chooser.
 *
 * Collapsed it shows only the current icon, so a form with several icon fields
 * stays readable; opening it reveals the full grid drawn with the real icons,
 * because a key like `advancedLab` tells an author nothing about what will
 * appear on the page.
 */
export default function IconPickerField({
  label,
  hint,
  value,
  icons,
  onChange,
  path,
}: {
  label: string;
  hint?: string;
  value: string;
  /**
   * Key -> icon component. Icons take different prop shapes across sections
   * and none are passed here, so the value type stays intentionally loose.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- icon prop shapes differ per section and none are passed here
  icons: Record<string, ComponentType<any>>;
  onChange: (value: string) => void;
  path?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Clicking elsewhere or pressing Escape closes the grid.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const keys = Object.keys(icons);
  const Selected = icons[value];

  return (
    <div className="field" data-field-path={path} ref={wrapRef}>
      <span>
        {label}
        {hint ? <small>{hint}</small> : null}
      </span>

      <div className="iconPicker">
        <button
          type="button"
          className="iconTrigger"
          aria-haspopup="true"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="iconOptionArt">{Selected ? <Selected /> : null}</span>
          <span className="iconTriggerName">{value || "Choose an icon"}</span>
          <span className="iconTriggerCaret" aria-hidden>
            {open ? "⌃" : "⌄"}
          </span>
        </button>

        {open ? (
          <div className="iconGrid" role="radiogroup" aria-label={label}>
            {keys.map((key) => {
              const Icon = icons[key];
              const selected = key === value;

              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  title={key}
                  className={`iconOption${selected ? " isSelected" : ""}`}
                  onClick={() => {
                    onChange(key);
                    setOpen(false);
                  }}
                >
                  <span className="iconOptionArt">{Icon ? <Icon /> : null}</span>
                  <span className="iconOptionName">{key}</span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
