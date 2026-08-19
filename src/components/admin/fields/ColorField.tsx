"use client";

import { useRef, useState } from "react";
import { type ColorSpec, isHex } from "@/lib/markerParser";
import {
  BRAND_GRADIENTS,
  BRAND_SOLIDS,
  specKey,
  swatchFor,
} from "./ColorPopover";
import Popover from "./Popover";

/**
 * Picks a colour for something that is not text — a bar's background, a
 * button's fill.
 *
 * Shares the brand presets, gradients and swatch rendering with the text
 * toolbar so the two offer the same palette; what differs is that this one
 * targets a whole element rather than a run of characters, and so needs no
 * selection to act on.
 *
 * "Default" is a real choice, not an absence: it means the stylesheet decides,
 * which is what an author wants back after experimenting.
 */
export default function ColorField({
  label,
  hint,
  value,
  onChange,
  path,
  allowGradient = true,
}: {
  label: string;
  hint?: string;
  value: ColorSpec | null;
  onChange: (value: ColorSpec | null) => void;
  path?: string;
  /** Gradients make sense as a fill, rarely as a text colour on a small chip. */
  allowGradient?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("#1FA9E8");
  const wrapRef = useRef<HTMLDivElement>(null);

  const activeKey = specKey(value);

  const Swatch = ({ spec, name }: { spec: ColorSpec; name: string }) => (
    <button
      type="button"
      className={`swatch${specKey(spec) === activeKey ? " isActive" : ""}`}
      style={{ background: swatchFor(spec) }}
      title={name}
      aria-label={name}
      aria-pressed={specKey(spec) === activeKey}
      onClick={() => {
        onChange(spec);
        setOpen(false);
      }}
    />
  );

  return (
    <div className="field" data-field-path={path}>
      <span>
        {label}
        {hint ? <small>{hint}</small> : null}
      </span>

      <div className="fmtPop colorFieldPop" ref={wrapRef}>
        <button
          type="button"
          className="colorFieldTrigger"
          aria-expanded={open}
          aria-haspopup="true"
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className="colorFieldChip"
            style={{ background: value ? swatchFor(value) : undefined }}
            data-default={value ? undefined : "1"}
          />
          <span>{value ? specKey(value).replace(/^\w+:/, "") : "Default"}</span>
        </button>

        <Popover open={open} anchorRef={wrapRef} onClose={() => setOpen(false)}>
          <div className="fmtPanelLabel">Brand</div>
          <div className="fmtSwatches">
            {BRAND_SOLIDS.map((preset) => (
              <Swatch
                key={preset.label}
                spec={preset.spec}
                name={preset.label}
              />
            ))}
          </div>

          {allowGradient ? (
            <>
              <div className="fmtPanelLabel">Gradients</div>
              <div className="fmtSwatches">
                {BRAND_GRADIENTS.map((preset) => (
                  <Swatch
                    key={preset.label}
                    spec={preset.spec}
                    name={preset.label}
                  />
                ))}
              </div>
            </>
          ) : null}

          <div className="fmtPanelLabel">Custom</div>
          <div className="fmtCustomRow">
            <input
              type="color"
              value={custom}
              aria-label="Pick a colour"
              onChange={(e) => setCustom(e.target.value)}
            />
            <code className="mono">{custom.toUpperCase()}</code>
            <button
              type="button"
              className="btn btnGhost btnSm"
              onClick={() => {
                if (!isHex(custom)) return;
                onChange({ kind: "solid", color: custom.toUpperCase() });
                setOpen(false);
              }}
            >
              Apply
            </button>
          </div>

          <button
            type="button"
            className="btn btnGhost btnSm fmtClear"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
          >
            Use the default
          </button>
        </Popover>
      </div>
    </div>
  );
}
