"use client";

import { useEffect, useRef, useState } from "react";
import {
  type Breakpoint,
  clampSize,
  type ColorSpec,
  isHex,
  MAX_PX,
  MAX_SCALE,
  MIN_PX,
  MIN_SCALE,
  type ResponsiveSize,
  type SizeUnit,
  type SizeValue,
} from "@/lib/markerParser";

/**
 * The editor's single formatting control.
 *
 * A row of eight-plus swatches took more room than the field it decorated, so
 * everything lives behind one button: brand presets, gradients, colours
 * already used in this field, a custom picker, size, and remove.
 *
 * Size is per device. The panel edits whichever device the preview is set to,
 * so there is no second switch to keep in sync, and it says plainly which
 * devices already carry their own size.
 */

export const BRAND_SOLIDS: { label: string; spec: ColorSpec; swatch: string }[] = [
  { label: "Brand blue", spec: { kind: "tone", tone: "blue" }, swatch: "#1FA9E8" },
  { label: "Brand green", spec: { kind: "tone", tone: "green" }, swatch: "#5BA84A" },
  { label: "Navy", spec: { kind: "solid", color: "#0B2545" }, swatch: "#0B2545" },
  { label: "White", spec: { kind: "solid", color: "#FFFFFF" }, swatch: "#FFFFFF" },
];

export const BRAND_GRADIENTS: { label: string; spec: ColorSpec; swatch: string }[] = [
  {
    label: "Navy → Blue",
    spec: { kind: "gradient", from: "#0B2545", to: "#1FA9E8", angle: 92 },
    swatch: "linear-gradient(92deg,#0B2545,#1FA9E8)",
  },
  {
    label: "Blue → Sky",
    spec: { kind: "gradient", from: "#1FA9E8", to: "#7FD1F5", angle: 92 },
    swatch: "linear-gradient(92deg,#1FA9E8,#7FD1F5)",
  },
  {
    label: "Blue → Green",
    spec: { kind: "gradient", from: "#1FA9E8", to: "#5BA84A", angle: 92 },
    swatch: "linear-gradient(92deg,#1FA9E8,#5BA84A)",
  },
];

export const swatchFor = (spec: ColorSpec): string => {
  if (spec.kind === "tone") return spec.tone === "blue" ? "#1FA9E8" : "#5BA84A";
  if (spec.kind === "solid") return spec.color;
  return `linear-gradient(92deg, ${spec.from}, ${spec.to})`;
};

export const specKey = (spec: ColorSpec | null): string => {
  if (!spec) return "";
  if (spec.kind === "tone") return `tone:${spec.tone}`;
  if (spec.kind === "solid") return `solid:${spec.color.toUpperCase()}`;
  return `grad:${spec.from.toUpperCase()},${spec.to.toUpperCase()}`;
};

const EM_STEPS = [
  { label: "S", value: 0.85 },
  { label: "M", value: 1 },
  { label: "L", value: 1.3 },
  { label: "XL", value: 1.7 },
];

const PX_STEPS = [
  { label: "S", value: 14 },
  { label: "M", value: 16 },
  { label: "L", value: 22 },
  { label: "XL", value: 30 },
];

/**
 * What a change will touch. "field" is the fallback when nothing is selected,
 * and is stated plainly because it is the case an author is least likely to
 * expect — and the one they asked for most.
 */
export type Scope = "selection" | "phrase" | "field";

const SCOPE_NOTE: Record<Scope, string> = {
  selection: "Applies to the selected text.",
  phrase: "Applies to this phrase. Select text to change less of it.",
  field: "Nothing selected, so this applies to the whole field.",
};

const DEVICE_LABEL: Record<Breakpoint, string> = {
  desktop: "Desktop",
  tablet: "Tablet",
  mobile: "Mobile",
};

/** What a breakpoint with no size of its own actually renders at. */
const inherited = (size: ResponsiveSize, device: Breakpoint): SizeValue | null => {
  if (device === "mobile") return size.mobile ?? size.tablet ?? size.desktop ?? null;
  if (device === "tablet") return size.tablet ?? size.desktop ?? null;
  return size.desktop ?? null;
};

export default function ColorPopover({
  activeSpec,
  activeSize,
  sizeMixed,
  scope,
  device,
  usedSpecs,
  onPick,
  onClear,
  onSize,
}: {
  activeSpec: ColorSpec | null;
  /** Size shared by the targeted text, across every breakpoint. */
  activeSize: ResponsiveSize;
  /** The targeted text does not all share one size. */
  sizeMixed: boolean;
  /** What a change will touch, given the current selection. */
  scope: Scope;
  /** The device the preview is showing; sizes are written to this one. */
  device: Breakpoint;
  /** Colours already applied somewhere in this field. */
  usedSpecs: ColorSpec[];
  onPick: (spec: ColorSpec) => void;
  onClear: () => void;
  onSize: (size: ResponsiveSize) => void;
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("#1FA9E8");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // The size this device actually renders at, and whether that is its own
  // setting or one inherited from a wider breakpoint.
  const own = activeSize[device] ?? null;
  const effective = inherited(activeSize, device);
  const unit: SizeUnit = own?.unit ?? effective?.unit ?? "em";
  const steps = unit === "px" ? PX_STEPS : EM_STEPS;
  const shown = own?.value ?? effective?.value ?? (unit === "px" ? 16 : 1);

  /** Writes a size to the current device only, leaving the others alone. */
  const setSize = (value: number, nextUnit: SizeUnit) =>
    onSize({ ...activeSize, [device]: { value: clampSize(value, nextUnit), unit: nextUnit } });

  /** Drops this device's override so it inherits again. */
  const resetDevice = () => {
    const next: ResponsiveSize = { ...activeSize };
    delete next[device];
    onSize(next);
  };

  const activeKey = specKey(activeSpec);
  const presetKeys = new Set([...BRAND_SOLIDS, ...BRAND_GRADIENTS].map((p) => specKey(p.spec)));

  // Colours used here that are not already offered as presets.
  const extras = usedSpecs.filter((s) => !presetKeys.has(specKey(s)));

  const Swatch = ({ label, spec }: { label: string; spec: ColorSpec }) => {
    const on = specKey(spec) === activeKey;
    return (
      <button
        type="button"
        className={`swatch${on ? " isActive" : ""}`}
        style={{ background: swatchFor(spec) }}
        title={on ? `${label} (applied)` : label}
        aria-label={label}
        aria-pressed={on}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          onPick(spec);
          setOpen(false);
        }}
      />
    );
  };

  return (
    <div className="fmtPop" ref={wrapRef}>
      <button
        type="button"
        className={`fmtBtn fmtTrigger${open ? " isOpen" : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        title={`Colour and size — ${SCOPE_NOTE[scope].toLowerCase()}`}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="fmtTriggerGlyph">A</span>
        <span
          className="fmtTriggerBar"
          style={{ background: activeSpec ? swatchFor(activeSpec) : "transparent" }}
        />
      </button>

      {open ? (
        <div className="fmtPanel">
          {/* Stated once, at the top, because it governs every control below. */}
          <p className={`fmtScope${scope === "field" ? " isField" : ""}`}>{SCOPE_NOTE[scope]}</p>

          {extras.length > 0 ? (
            <>
              <div className="fmtPanelLabel">Used here</div>
              <div className="fmtSwatches">
                {extras.map((spec) => (
                  <Swatch key={specKey(spec)} label={specKey(spec)} spec={spec} />
                ))}
              </div>
            </>
          ) : null}

          <div className="fmtPanelLabel">Brand</div>
          <div className="fmtSwatches">
            {BRAND_SOLIDS.map((p) => (
              <Swatch key={p.label} label={p.label} spec={p.spec} />
            ))}
          </div>

          <div className="fmtPanelLabel">Gradients</div>
          <div className="fmtSwatches">
            {BRAND_GRADIENTS.map((p) => (
              <Swatch key={p.label} label={p.label} spec={p.spec} />
            ))}
          </div>

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
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (!isHex(custom)) return;
                onPick({ kind: "solid", color: custom.toUpperCase() });
                setOpen(false);
              }}
            >
              Apply
            </button>
          </div>

          <div className="fmtPanelLabel fmtSizeHead">
            <span>Size on {DEVICE_LABEL[device].toLowerCase()}</span>
            <span className="fmtUnits" role="group" aria-label="Size unit">
              <button
                type="button"
                className={unit === "em" ? "isActive" : ""}
                title="Sized relative to the surrounding text"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setSize(shown, "em")}
              >
                Relative
              </button>
              <button
                type="button"
                className={unit === "px" ? "isActive" : ""}
                title="An exact pixel size"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setSize(unit === "px" ? shown : 16, "px")}
              >
                Pixels
              </button>
            </span>
          </div>

          <div className="fmtSizes">
            {steps.map((step) => (
              <button
                key={step.label}
                type="button"
                className={`fmtSize${own && Math.abs(own.value - step.value) < 0.01 ? " isActive" : ""}`}
                title={
                  unit === "px"
                    ? `${step.value}px`
                    : `${Math.round(step.value * 100)}% of the normal size`
                }
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setSize(step.value, unit)}
              >
                {step.label}
              </button>
            ))}
            <input
              className="fmtSizeInput"
              type="number"
              step={unit === "px" ? 1 : 0.05}
              min={unit === "px" ? MIN_PX : MIN_SCALE}
              max={unit === "px" ? MAX_PX : MAX_SCALE}
              value={shown}
              aria-label={unit === "px" ? "Size in pixels" : "Size multiplier"}
              onMouseDown={(e) => e.stopPropagation()}
              onChange={(e) => {
                const next = Number.parseFloat(e.target.value);
                if (Number.isFinite(next)) setSize(next, unit);
              }}
            />
            <span className="fmtUnitTag">{unit === "px" ? "px" : "×"}</span>
          </div>

          {/* Says what the other devices are doing, so a size set on one is
              never a silent change to the rest. */}
          <p className="fmtSizeNote">
            {sizeMixed ? (
              "This text uses more than one size. Choosing one makes it all match."
            ) : own ? (
              <>
                Set for {DEVICE_LABEL[device].toLowerCase()} only.{" "}
                <button
                  type="button"
                  className="linkBtn"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={resetDevice}
                >
                  Match {device === "desktop" ? "the normal size" : "wider screens"}
                </button>
              </>
            ) : device === "desktop" ? (
              "Applies to every device unless one has its own size."
            ) : (
              `Following ${device === "mobile" && activeSize.tablet ? "tablet" : "desktop"}. Choose a size to change ${DEVICE_LABEL[device].toLowerCase()} alone.`
            )}
          </p>

          <button
            type="button"
            className="btn btnGhost btnSm fmtClear"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              onClear();
              setOpen(false);
            }}
          >
            Remove colour &amp; size
          </button>
        </div>
      ) : null}
    </div>
  );
}
