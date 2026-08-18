"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ColorSpec, ResponsiveSize } from "@/lib/markerParser";
import { usePreviewDevice } from "../DeviceContext";
import ColorPopover from "./ColorPopover";
import { restoreRange, selectionRange, type TextRange } from "./domOffsets";
import {
  htmlToMarker,
  mapRuns,
  markerToHtml,
  runAt,
  type Style,
  summarise,
  usedColors,
} from "./markerHtml";

/**
 * Inline editor for section copy.
 *
 * Text is shown in its real colour and size as you type, rather than as
 * `{{#1FA9E8|…}}` markers.
 *
 * Formatting goes through the flat run model, not the contentEditable: a
 * change is expressed as "apply this style to these character offsets", the
 * marker is rewritten, and the DOM is rebuilt from it. That is what makes
 * re-colouring replace rather than nest, and what lets a size be nudged
 * repeatedly while focus sits in the number input — with a DOM Range, the
 * first change detached the nodes the second one needed.
 *
 * Scope follows the selection, and falls back to the whole field:
 *
 *   text selected             -> just that text
 *   caret inside a styled run -> that phrase
 *   nothing selected          -> the entire field
 *
 * The last case is the important one. Changing a field's size should not
 * require selecting all of it first, and a control that silently does nothing
 * is worse than one that does the obvious thing.
 *
 * Typing is left to the browser and read back with `htmlToMarker`; only
 * formatting round-trips through the model, so the caret survives normal use.
 */

type Scope = "selection" | "phrase" | "field";

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
  const device = usePreviewDevice();
  const ref = useRef<HTMLDivElement>(null);
  const lastEmitted = useRef(value);
  /**
   * The selection as character offsets. Kept after blur on purpose: clicking
   * into the size input clears the DOM selection, and without this the change
   * would have nothing to apply to.
   */
  const [selection, setSelection] = useState<TextRange | null>(null);

  // Seed the editor, and re-seed only when the value changed elsewhere.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (value === lastEmitted.current) return;
    el.innerHTML = markerToHtml(value, device);
    lastEmitted.current = value;
  }, [value, device]);

  // Switching the preview device re-renders the inline sizes so the editor
  // shows what that device will show.
  const seededFor = useRef(device);
  useEffect(() => {
    const el = ref.current;
    if (!el || seededFor.current === device) return;
    seededFor.current = device;
    el.innerHTML = markerToHtml(lastEmitted.current, device);
  }, [device]);

  useEffect(() => {
    const el = ref.current;
    if (el && el.innerHTML === "") el.innerHTML = markerToHtml(value, device);
    // Seeding once on mount; `value` changes are handled above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------------------------------------------------------- */
  /* what the controls are pointed at                                  */
  /* ---------------------------------------------------------------- */

  const target = useMemo((): { range: TextRange; scope: Scope } | null => {
    if (!selection) return null;
    if (selection.start !== selection.end) return { range: selection, scope: "selection" };

    // A caret inside styled text targets that phrase, so a colour or size can
    // be changed without selecting the word again.
    const run = runAt(value, selection.start);
    if (run && (run.style.color || run.style.size)) {
      return { range: { start: run.start, end: run.end }, scope: "phrase" };
    }
    return null;
  }, [value, selection]);

  const scope: Scope = target?.scope ?? "field";
  const start = target?.range.start;
  const end = target?.range.end;

  const info = useMemo(
    () => summarise(value, start === undefined || end === undefined ? undefined : { start, end }),
    [value, start, end],
  );

  const usedSpecs = useMemo(() => usedColors(value), [value]);

  /* ---------------------------------------------------------------- */
  /* reading and writing                                               */
  /* ---------------------------------------------------------------- */

  function syncSelection() {
    const el = ref.current;
    if (!el) return;
    const range = selectionRange(el);
    if (range) setSelection(range);
  }

  function emit() {
    const el = ref.current;
    if (!el) return;
    const marker = htmlToMarker(el);
    lastEmitted.current = marker;
    onChange(marker);
  }

  /** Rewrites the field, rebuilds the DOM, and keeps the selection put. */
  function applyStyle(fn: (style: Style) => Style) {
    const el = ref.current;
    const next = mapRuns(value, fn, target?.range);
    if (next === value) return;

    lastEmitted.current = next;
    if (el) {
      const focused = el === document.activeElement || el.contains(document.activeElement);
      el.innerHTML = markerToHtml(next, device);
      // Only take the caret back if it was ours; otherwise the author is in
      // the size input and stealing focus would end their edit.
      if (focused && selection) restoreRange(el, selection);
    }
    onChange(next);
  }

  const applyColour = (spec: ColorSpec) => applyStyle((style) => ({ ...style, color: spec }));

  const applySize = (size: ResponsiveSize) =>
    applyStyle((style) => ({
      ...style,
      size: Object.keys(size).length > 0 ? size : undefined,
    }));

  const clearFormatting = () =>
    applyStyle((style) => ({ ...style, color: undefined, size: undefined }));

  const toggleEmphasis = (key: "bold" | "italic") => {
    const on = !info[key];
    applyStyle((style) => ({ ...style, [key]: on || undefined }));
  };

  return (
    <div className={compact ? "rteCompact" : "field"} data-field-path={path}>
      {compact ? null : (
        <span>
          {label}
          {hint ? <small>{hint}</small> : null}
        </span>
      )}

      <div className="colorBar">
        <button
          type="button"
          className={`fmtBtn${info.bold ? " isActive" : ""}`}
          title="Bold"
          aria-pressed={info.bold}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleEmphasis("bold")}
        >
          <b>B</b>
        </button>
        <button
          type="button"
          className={`fmtBtn${info.italic ? " isActive" : ""}`}
          title="Italic"
          aria-pressed={info.italic}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleEmphasis("italic")}
        >
          <i>I</i>
        </button>

        <span className="fmtDivider" />

        <ColorPopover
          activeSpec={info.color}
          activeSize={info.size}
          sizeMixed={info.sizeMixed}
          scope={scope}
          device={device}
          usedSpecs={usedSpecs}
          onPick={applyColour}
          onClear={clearFormatting}
          onSize={applySize}
        />
      </div>

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
          syncSelection();
        }}
        onBlur={emit}
        onKeyUp={syncSelection}
        onMouseUp={syncSelection}
        onFocus={syncSelection}
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
