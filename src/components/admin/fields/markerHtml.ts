/**
 * Two-way conversion between the stored marker syntax and the HTML shown in
 * the inline editor.
 *
 * Serialisation goes through a FLAT run model on purpose. Editing a
 * contentEditable inevitably produces nested elements — selecting part of an
 * already-coloured phrase and recolouring it leaves the old span wrapping the
 * new one — and naively walking that tree emitted nested markers like
 * `{{grad:…|{{#0B2545|text}}}}`, which the renderer printed literally.
 *
 * Flattening to runs means the innermost colour simply wins and the output can
 * never nest, whatever shape the DOM ends up in.
 */

import {
  type Breakpoint,
  type ColorSpec,
  isHex,
  type MarkerNode,
  parseMarkers,
  parseSizeHead,
  type ResponsiveSize,
  sizeToMarker,
  sizeToVars,
  specToMarker,
} from "@/lib/markerParser";

export { isHex };
export type { Breakpoint, ColorSpec, ResponsiveSize };

/**
 * Relative luminance of a hex colour, 0 (black) to 1 (white).
 * Used only to decide whether a run needs a dark backdrop in the editor —
 * white text on the editor's white background is otherwise invisible.
 */
function luminance(hex: string): number {
  const raw = hex.replace("#", "");
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;

  const [r, g, b] = [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r ?? 0) + 0.7152 * lin(g ?? 0) + 0.0722 * lin(b ?? 0);
}

/** True when a run would be hard to read on the editor's light background. */
export function isLightSpec(spec: ColorSpec): boolean {
  if (spec.kind === "tone") return false;
  if (spec.kind === "solid") return luminance(spec.color) > 0.6;
  return (luminance(spec.from) + luminance(spec.to)) / 2 > 0.6;
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export type Style = { color?: ColorSpec; size?: ResponsiveSize; bold?: boolean; italic?: boolean };
export type Run = { text: string; style: Style };

/** Inline styles that make a run look right inside the editor. */
export function specStyle(spec: ColorSpec): string {
  if (spec.kind === "tone") {
    return `color:${spec.tone === "blue" ? "#1FA9E8" : "#5BA84A"}`;
  }
  if (spec.kind === "solid") return `color:${spec.color}`;
  return [
    `background-image:linear-gradient(${spec.angle}deg, ${spec.from}, ${spec.to})`,
    "-webkit-background-clip:text",
    "background-clip:text",
    "color:transparent",
  ].join(";");
}

/**
 * Inline style for a sized run inside the editor.
 *
 * The custom properties are what the published page uses; the plain
 * `font-size` is added so the left-hand editor — which is not inside a
 * device-width frame and so never trips the media queries — still previews
 * the size for the device being targeted.
 */
export function sizeCss(size: ResponsiveSize, device: Breakpoint = "desktop"): string {
  const vars = sizeToVars(size);
  const shown = size[device] ?? size.desktop ?? size.tablet ?? size.mobile;
  const decls = Object.entries(vars).map(([k, v]) => `${k}:${v}`);
  if (shown) decls.push(`font-size:${shown.value}${shown.unit}`);
  return decls.join(";");
}

/** Data attribute pair that lets serialisation recover the colour. */
export function specDataAttr(spec: ColorSpec): { name: string; value: string } {
  if (spec.kind === "tone") return { name: "data-tone", value: spec.tone };
  if (spec.kind === "solid") return { name: "data-color", value: spec.color };
  return { name: "data-grad", value: `${spec.from},${spec.to}` };
}

const sameColor = (a?: ColorSpec, b?: ColorSpec) => {
  if (!a || !b) return a === b;
  return specToMarker(a) === specToMarker(b);
};

/** Two sizes match when they serialise identically, breakpoints included. */
const sameSize = (a?: ResponsiveSize, b?: ResponsiveSize) =>
  (a ? sizeToMarker(a) : "") === (b ? sizeToMarker(b) : "");

const sameStyle = (a: Style, b: Style) =>
  sameColor(a.color, b.color) &&
  sameSize(a.size, b.size) &&
  !!a.bold === !!b.bold &&
  !!a.italic === !!b.italic;

/* ------------------------------------------------------------------ */
/* marker  ->  runs                                                    */
/* ------------------------------------------------------------------ */

function flatten(nodes: MarkerNode[], inherited: Style = {}): Run[] {
  const runs: Run[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case "text":
        runs.push({ text: node.value, style: inherited });
        break;
      case "break":
        runs.push({ text: "\n", style: inherited });
        break;
      case "bold":
        runs.push(...flatten(node.children, { ...inherited, bold: true }));
        break;
      case "italic":
        runs.push(...flatten(node.children, { ...inherited, italic: true }));
        break;
      case "color":
        // Innermost colour wins, which is what collapses nested markers.
        runs.push(
          ...flatten(node.children, node.spec ? { ...inherited, color: node.spec } : inherited),
        );
        break;
      case "size":
        // Innermost size wins, exactly as colour does.
        runs.push(...flatten(node.children, { ...inherited, size: node.size }));
        break;
    }
  }

  return runs;
}

export const parseRuns = (input: string): Run[] => flatten(parseMarkers(input));

/* ------------------------------------------------------------------ */
/* runs  ->  marker / html                                             */
/* ------------------------------------------------------------------ */

function mergeRuns(runs: Run[]): Run[] {
  const merged: Run[] = [];
  for (const run of runs) {
    if (run.text === "") continue;
    const last = merged[merged.length - 1];
    if (last && sameStyle(last.style, run.style)) {
      last.text += run.text;
    } else {
      merged.push({ text: run.text, style: run.style });
    }
  }
  return merged;
}

export function runsToMarker(runs: Run[]): string {
  return mergeRuns(runs)
    .map(({ text, style }) => {
      // Emphasis sits inside the colour marker; the renderer parses one level
      // down so both can apply to the same phrase.
      let body = text;
      if (style.bold) body = `**${body}**`;
      else if (style.italic) body = `*${body}*`;
      // Size sits inside the colour marker; the parser nests, so both apply.
      const size = style.size ? sizeToMarker(style.size) : "";
      if (size) body = `{{${size}|${body}}}`;
      return style.color ? `{{${specToMarker(style.color)}|${body}}}` : body;
    })
    .join("");
}

export function runsToHtml(runs: Run[], device: Breakpoint = "desktop"): string {
  return mergeRuns(runs)
    .map(({ text, style }) => {
      let inner = escapeHtml(text).replace(/\n/g, "<br>");
      if (style.bold) inner = `<strong>${inner}</strong>`;
      if (style.italic) inner = `<em>${inner}</em>`;
      const size = style.size ? sizeToMarker(style.size) : "";
      if (size) {
        // `data-size` carries the marker head verbatim so every breakpoint
        // survives the round trip; the inline font-size is what the author
        // sees in the editor, and follows the device they are targeting.
        inner = `<span class="rt-size" data-size="${escapeHtml(size)}" style="${sizeCss(style.size as ResponsiveSize, device)}">${inner}</span>`;
      }
      if (!style.color) return inner;

      const attr = specDataAttr(style.color);
      // Light runs get a dark chip so they stay legible while editing; this is
      // an editor-only affordance and never reaches the published page.
      const light = isLightSpec(style.color) ? ' data-light="1"' : "";
      return `<span ${attr.name}="${attr.value}"${light} style="${specStyle(style.color)}">${inner}</span>`;
    })
    .join("");
}

/** Marker text -> editor HTML, sized for the device being previewed. */
export const markerToHtml = (input: string, device: Breakpoint = "desktop"): string =>
  runsToHtml(parseRuns(input), device);

/* ------------------------------------------------------------------ */
/* html  ->  runs                                                      */
/* ------------------------------------------------------------------ */

function readColor(el: HTMLElement): ColorSpec | undefined {
  const tone = el.getAttribute("data-tone");
  if (tone === "blue" || tone === "green") return { kind: "tone", tone };

  const color = el.getAttribute("data-color");
  if (color && isHex(color)) return { kind: "solid", color };

  const grad = el.getAttribute("data-grad");
  if (grad) {
    const [from = "", to = ""] = grad.split(",");
    if (isHex(from) && isHex(to))
      return { kind: "gradient", from: from.trim(), to: to.trim(), angle: 92 };
  }
  return undefined;
}

export function htmlToRuns(root: Node): Run[] {
  const runs: Run[] = [];

  const walk = (node: Node, style: Style) => {
    if (node.nodeType === Node.TEXT_NODE) {
      // Browsers insert non-breaking spaces while editing; store plain ones.
      const text = (node.textContent ?? "").replace(/ /g, " ");
      if (text) runs.push({ text, style });
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();

    if (tag === "br") {
      runs.push({ text: "\n", style });
      return;
    }

    // A nested colour overrides the one it sits inside — innermost wins, and
    // because runs are flat the result can never be a nested marker.
    const next: Style = { ...style };
    const color = readColor(el);
    if (color) next.color = color;

    const sizeAttr = el.getAttribute("data-size");
    if (sizeAttr) {
      // Older content stored a bare multiplier; `parseSizeHead` needs a head,
      // so give a bare number the "size:" prefix it used to imply.
      const head = sizeAttr.includes(":") ? sizeAttr : `size:${sizeAttr}`;
      const parsed = parseSizeHead(head);
      if (parsed) next.size = parsed;
    }
    if (tag === "strong" || tag === "b") next.bold = true;
    if (tag === "em" || tag === "i") next.italic = true;

    const isBlock = tag === "div" || tag === "p";
    if (isBlock && runs.length > 0 && !runs[runs.length - 1]?.text.endsWith("\n")) {
      runs.push({ text: "\n", style });
    }

    el.childNodes.forEach((child) => walk(child, next));
  };

  root.childNodes.forEach((child) => walk(child, {}));
  return runs;
}

/** Editor HTML -> marker text. */
export const htmlToMarker = (root: Node): string => runsToMarker(htmlToRuns(root));

/* ------------------------------------------------------------------ */
/* field-level operations                                              */
/* ------------------------------------------------------------------ */

/**
 * Formatting is applied through the run model rather than by editing the
 * contentEditable, and a target is a pair of plain-text offsets rather than a
 * DOM Range.
 *
 * Offsets survive the innerHTML rewrite that every formatting change causes,
 * which is what lets a size be nudged repeatedly — with a Range, the first
 * change detached the nodes the second one needed. It also means a change can
 * be applied while focus sits in the size input, where there is no selection
 * to read at all.
 */
export type TextRange = { start: number; end: number };

/**
 * Rewrites the styles of a field.
 *
 * With no range, every run is rewritten — that is what "no selection" means
 * here, and it is why setting a size with nothing selected resizes the whole
 * field instead of silently doing nothing.
 */
export function mapRuns(
  marker: string,
  fn: (style: Style) => Style,
  range?: TextRange,
): string {
  const runs = parseRuns(marker);
  if (!range) return runsToMarker(runs.map((run) => ({ text: run.text, style: fn(run.style) })));

  const out: Run[] = [];
  let pos = 0;

  for (const run of runs) {
    const start = pos;
    const end = pos + run.text.length;
    pos = end;

    // Entirely outside the target.
    if (end <= range.start || start >= range.end) {
      out.push(run);
      continue;
    }

    // Split the run so only the covered characters change.
    const from = Math.max(range.start - start, 0);
    const to = Math.min(range.end - start, run.text.length);
    if (from > 0) out.push({ text: run.text.slice(0, from), style: run.style });
    out.push({ text: run.text.slice(from, to), style: fn(run.style) });
    if (to < run.text.length) out.push({ text: run.text.slice(to), style: run.style });
  }

  return runsToMarker(out);
}

/** The run containing an offset, with the extent it covers. */
export function runAt(marker: string, offset: number): (TextRange & { style: Style }) | null {
  let pos = 0;
  for (const run of mergeRuns(parseRuns(marker))) {
    const start = pos;
    const end = pos + run.text.length;
    pos = end;
    // A caret sitting exactly on the boundary belongs to the run it follows.
    if (offset >= start && offset <= end) return { start, end, style: run.style };
  }
  return null;
}

/**
 * What the formatting controls should show for a target.
 *
 * A value is reported only when every covered run agrees; anything else is
 * "mixed", so the panel never claims a size the text does not all have.
 */
export function summarise(
  marker: string,
  range?: TextRange,
): {
  color: ColorSpec | null;
  colorMixed: boolean;
  size: ResponsiveSize;
  sizeMixed: boolean;
  bold: boolean;
  italic: boolean;
} {
  const all = mergeRuns(parseRuns(marker));
  const covered: Run[] = [];

  if (range) {
    let pos = 0;
    for (const run of all) {
      const start = pos;
      const end = pos + run.text.length;
      pos = end;
      // A collapsed range still describes the run it sits in.
      const overlaps =
        range.start === range.end
          ? range.start >= start && range.start <= end
          : start < range.end && end > range.start;
      if (overlaps) covered.push(run);
    }
  } else {
    covered.push(...all);
  }

  if (covered.length === 0) {
    return { color: null, colorMixed: false, size: {}, sizeMixed: false, bold: false, italic: false };
  }

  const colorKeys = new Set(covered.map((r) => (r.style.color ? specToMarker(r.style.color) : "")));
  const sizeKeys = new Set(covered.map((r) => (r.style.size ? sizeToMarker(r.style.size) : "")));

  return {
    color: colorKeys.size === 1 ? (covered[0]?.style.color ?? null) : null,
    colorMixed: colorKeys.size > 1,
    size: sizeKeys.size === 1 ? (covered[0]?.style.size ?? {}) : {},
    sizeMixed: sizeKeys.size > 1,
    bold: covered.every((r) => r.style.bold),
    italic: covered.every((r) => r.style.italic),
  };
}

/** Every distinct colour used in a field, for the "used here" row. */
export function usedColors(marker: string): ColorSpec[] {
  const seen = new Map<string, ColorSpec>();
  for (const run of parseRuns(marker)) {
    if (run.style.color) seen.set(specToMarker(run.style.color), run.style.color);
  }
  return [...seen.values()];
}
