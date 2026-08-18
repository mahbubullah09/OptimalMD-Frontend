"use client";

import { useEffect, useRef, useState } from "react";
import {
  type ColorSpec,
  htmlToMarker,
  isHex,
  markerToHtml,
  specDataAttr,
  specStyle,
} from "./markerHtml";

/**
 * Inline editor for section copy.
 *
 * Text is shown in its real colour as you type, rather than as
 * `{{#1FA9E8|…}}` markers. Applying a colour to text that already has one
 * REPLACES it — the previous version nested markers, which is what made
 * re-colouring "totally messed up" — and there is an explicit control to
 * strip colour again.
 *
 * The element is uncontrolled on purpose: re-rendering a contentEditable on
 * every keystroke destroys the caret. It is seeded once and only re-seeded
 * when the value changes from outside (e.g. switching section).
 */

const SOLIDS = [
  { label: "Brand blue", spec: { kind: "tone", tone: "blue" } as ColorSpec, swatch: "#1FA9E8" },
  { label: "Brand green", spec: { kind: "tone", tone: "green" } as ColorSpec, swatch: "#5BA84A" },
  { label: "Navy", spec: { kind: "solid", color: "#0B2545" } as ColorSpec, swatch: "#0B2545" },
  { label: "White", spec: { kind: "solid", color: "#FFFFFF" } as ColorSpec, swatch: "#FFFFFF" },
];

const GRADIENTS: { label: string; spec: ColorSpec; css: string }[] = [
  {
    label: "Navy → Blue",
    spec: { kind: "gradient", from: "#0B2545", to: "#1FA9E8", angle: 92 },
    css: "linear-gradient(92deg,#0B2545,#1FA9E8)",
  },
  {
    label: "Blue → Sky",
    spec: { kind: "gradient", from: "#1FA9E8", to: "#7FD1F5", angle: 92 },
    css: "linear-gradient(92deg,#1FA9E8,#7FD1F5)",
  },
  {
    label: "Blue → Green",
    spec: { kind: "gradient", from: "#1FA9E8", to: "#5BA84A", angle: 92 },
    css: "linear-gradient(92deg,#1FA9E8,#5BA84A)",
  },
];

const COLOURED = "[data-tone],[data-color],[data-grad]";

/** Stable identity for a colour, so the toolbar can mark the active swatch. */
const specKey = (spec: ColorSpec | null): string => {
  if (!spec) return "";
  if (spec.kind === "tone") return `tone:${spec.tone}`;
  if (spec.kind === "solid") return `solid:${spec.color.toUpperCase()}`;
  return `grad:${spec.from.toUpperCase()},${spec.to.toUpperCase()}`;
};

export default function RichTextEditor({
  label,
  hint,
  value,
  onChange,
  path,
  multiline = false,
  compact = false,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  /** Dotted path used to focus this field from a preview click. */
  path?: string;
  multiline?: boolean;
  /** Renders without the label/wrapper, for use inside a list row. */
  compact?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lastEmitted = useRef(value);
  const [custom, setCustom] = useState("#1FA9E8");
  const [customOpen, setCustomOpen] = useState(false);
  /** The colour of the run the caret sits in, if any. */
  const [activeSpec, setActiveSpec] = useState<ColorSpec | null>(null);

  // Seed the editor, and re-seed only when the value changed elsewhere.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (value === lastEmitted.current) return;
    el.innerHTML = markerToHtml(value);
    lastEmitted.current = value;
  }, [value]);

  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML === "") el.innerHTML = markerToHtml(value);
    // Seeding once on mount; `value` changes are handled above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Reads the colour under the caret so the toolbar can show it with a remove
   * control, rather than expecting an author to remember what they applied.
   */
  function syncActiveColour() {
    const el = ref.current;
    const selection = window.getSelection();
    if (!el || !selection || selection.rangeCount === 0) return setActiveSpec(null);

    const node = selection.getRangeAt(0).startContainer;
    if (!el.contains(node)) return setActiveSpec(null);

    const host = node.nodeType === Node.ELEMENT_NODE ? (node as HTMLElement) : node.parentElement;
    const run = host?.closest(COLOURED) as HTMLElement | null;
    if (!run) return setActiveSpec(null);

    const grad = run.getAttribute("data-grad");
    if (grad) {
      const [from = "", to = ""] = grad.split(",");
      setActiveSpec({ kind: "gradient", from, to, angle: 92 });
      return;
    }

    const tone = run.getAttribute("data-tone");
    if (tone === "blue" || tone === "green") {
      setActiveSpec({ kind: "tone", tone });
      return;
    }

    const color = run.getAttribute("data-color");
    setActiveSpec(color ? { kind: "solid", color } : null);

    // A colour outside the presets should still be visible in the picker.
    if (color && !SOLIDS.some((s) => specKey(s.spec) === specKey({ kind: "solid", color }))) {
      setCustom(color);
    }
  }

  function emit() {
    const el = ref.current;
    if (!el) return;
    const marker = htmlToMarker(el);
    lastEmitted.current = marker;
    onChange(marker);
  }

  /** The selection, but only when it is inside this editor. */
  function activeRange(): Range | null {
    const el = ref.current;
    const selection = window.getSelection();
    if (!el || !selection || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    return el.contains(range.commonAncestorContainer) ? range : null;
  }

  /** Removes colour wrappers inside a fragment, keeping their text. */
  function unwrapColours(fragment: DocumentFragment) {
    fragment.querySelectorAll(COLOURED).forEach((span) => {
      const parent = span.parentNode;
      if (!parent) return;
      while (span.firstChild) parent.insertBefore(span.firstChild, span);
      parent.removeChild(span);
    });
  }

  /**
   * If the caret sits inside a coloured run with nothing selected, treat that
   * whole run as the target — otherwise clicking a swatch would do nothing
   * useful, and clearing would be impossible without re-selecting by hand.
   */
  function rangeForOperation(): Range | null {
    const range = activeRange();
    if (!range) return null;
    if (!range.collapsed) return range;

    const node =
      range.startContainer.nodeType === Node.ELEMENT_NODE
        ? (range.startContainer as HTMLElement)
        : range.startContainer.parentElement;
    const run = node?.closest(COLOURED);
    if (!run) return null;

    const whole = document.createRange();
    whole.selectNode(run);
    return whole;
  }

  function applyColour(spec: ColorSpec) {
    const range = rangeForOperation();
    if (!range) return;

    const fragment = range.extractContents();
    // Replace rather than nest.
    unwrapColours(fragment);

    const span = document.createElement("span");
    span.setAttribute("style", specStyle(spec));
    const attr = specDataAttr(spec);
    span.setAttribute(attr.name, attr.value);
    span.appendChild(fragment);

    range.insertNode(span);

    // The new span can land inside an older coloured one; re-serialising
    // through the flat run model collapses that so the innermost colour wins
    // and no nested marker is ever stored.
    normalise();

  }

  function clearColour() {
    const range = rangeForOperation();
    if (!range) return;

    const fragment = range.extractContents();
    unwrapColours(fragment);

    // Mark the plain text so the caret can be restored after re-rendering.
    const marker = document.createElement("span");
    marker.setAttribute("data-caret", "");
    marker.appendChild(fragment);
    range.insertNode(marker);

    normalise();
  }

  /**
   * Rewrites the editor from its own serialised output.
   *
   * Round-tripping through the flat run model is what guarantees the DOM can
   * never keep a nested colour: whatever shape editing produced, this rebuilds
   * it as a flat sequence of runs.
   */
  function normalise() {
    const el = ref.current;
    if (!el) return;

    const marker = htmlToMarker(el);
    el.innerHTML = markerToHtml(marker);
    lastEmitted.current = marker;
    onChange(marker);
    requestAnimationFrame(syncActiveColour);
  }

  function wrapInline(tag: "strong" | "em") {
    const range = activeRange();
    if (!range || range.collapsed) return;

    const fragment = range.extractContents();
    // Toggle off if the selection is already entirely that tag.
    const existing = fragment.querySelector(tag);
    if (existing && fragment.childNodes.length === 1) {
      while (existing.firstChild) fragment.insertBefore(existing.firstChild, existing);
      fragment.removeChild(existing);
      range.insertNode(fragment);
    } else {
      const el = document.createElement(tag);
      el.appendChild(fragment);
      range.insertNode(el);
    }
    emit();
  }

  const activeKey = specKey(activeSpec);
  const customIsActive = activeKey === specKey({ kind: "solid", color: custom });

  return (
    <div className={compact ? "rteCompact" : "field"} data-field-path={path}>
      {compact ? null : (
        <span>
          {label}
          {hint ? <small>{hint}</small> : null}
        </span>
      )}

      <div className="colorBar">
        <button type="button" className="fmtBtn" title="Bold" onClick={() => wrapInline("strong")}>
          <b>B</b>
        </button>
        <button type="button" className="fmtBtn" title="Italic" onClick={() => wrapInline("em")}>
          <i>I</i>
        </button>

        <span className="fmtDivider" />

        {SOLIDS.map((solid) => {
          const on = specKey(solid.spec) === activeKey;
          return (
            <button
              key={solid.label}
              type="button"
              className={`swatch${on ? " isActive" : ""}`}
              style={{ background: solid.swatch }}
              title={on ? `${solid.label} (applied)` : solid.label}
              aria-label={solid.label}
              aria-pressed={on}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyColour(solid.spec)}
            />
          );
        })}

        {GRADIENTS.map((grad) => {
          const on = specKey(grad.spec) === activeKey;
          return (
            <button
              key={grad.label}
              type="button"
              className={`swatch${on ? " isActive" : ""}`}
              style={{ background: grad.css }}
              title={on ? `${grad.label} (applied)` : grad.label}
              aria-label={grad.label}
              aria-pressed={on}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyColour(grad.spec)}
            />
          );
        })}

        <span className="fmtDivider" />

        <button
          type="button"
          className={`fmtBtn${customIsActive ? " isActive" : ""}`}
          title={customIsActive ? `Custom colour ${custom} (applied)` : "Custom colour"}
          aria-pressed={customIsActive}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setCustomOpen((v) => !v)}
        >
          +
        </button>
        {activeSpec ? (
          <span className="activeColour" title="Colour applied here">
            <span
              className="activeColourDot"
              style={{
                background:
                  activeSpec.kind === "gradient"
                    ? `linear-gradient(92deg, ${activeSpec.from}, ${activeSpec.to})`
                    : activeSpec.kind === "tone"
                      ? activeSpec.tone === "blue"
                        ? "#1FA9E8"
                        : "#5BA84A"
                      : activeSpec.color,
              }}
            />
            <button
              type="button"
              aria-label="Remove this colour"
              title="Remove this colour"
              onMouseDown={(e) => e.preventDefault()}
              onClick={clearColour}
            >
              ×
            </button>
          </span>
        ) : (
          <button
            type="button"
            className="fmtBtn fmtBtnWide"
            title="Remove colour from the selection"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clearColour}
          >
            No colour
          </button>
        )}
      </div>

      {customOpen ? (
        <div className="colorCustom">
          <input
            type="color"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            aria-label="Pick a colour"
          />
          <code className="mono">{custom}</code>
          <button
            type="button"
            className="btn btnGhost btnSm"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => isHex(custom) && applyColour({ kind: "solid", color: custom })}
          >
            Apply
          </button>
        </div>
      ) : null}

      <div
        ref={ref}
        className={`rte${multiline ? " rteMulti" : ""}`}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline={multiline}
        aria-label={label}
        onInput={() => {
          emit();
          syncActiveColour();
        }}
        onBlur={emit}
        onKeyUp={syncActiveColour}
        onMouseUp={syncActiveColour}
        onFocus={syncActiveColour}
        onKeyDown={(e) => {
          // Single-line fields should not gain line breaks.
          if (e.key === "Enter" && !multiline) e.preventDefault();
        }}
        onPaste={(e) => {
          // Paste as plain text so pasted markup cannot smuggle styles in.
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          document.execCommand("insertText", false, text);
        }}
      />
    </div>
  );
}
