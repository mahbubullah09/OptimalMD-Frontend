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
  type ColorSpec,
  isHex,
  type MarkerNode,
  parseMarkers,
  specToMarker,
} from "@/lib/markerParser";

export { isHex };
export type { ColorSpec };

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

type Style = { color?: ColorSpec; bold?: boolean; italic?: boolean };
type Run = { text: string; style: Style };

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

const sameStyle = (a: Style, b: Style) =>
  sameColor(a.color, b.color) && !!a.bold === !!b.bold && !!a.italic === !!b.italic;

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
    }
  }

  return runs;
}

const parseRuns = (input: string): Run[] => flatten(parseMarkers(input));

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
      return style.color ? `{{${specToMarker(style.color)}|${body}}}` : body;
    })
    .join("");
}

export function runsToHtml(runs: Run[]): string {
  return mergeRuns(runs)
    .map(({ text, style }) => {
      let inner = escapeHtml(text).replace(/\n/g, "<br>");
      if (style.bold) inner = `<strong>${inner}</strong>`;
      if (style.italic) inner = `<em>${inner}</em>`;
      if (!style.color) return inner;

      const attr = specDataAttr(style.color);
      // Light runs get a dark chip so they stay legible while editing; this is
      // an editor-only affordance and never reaches the published page.
      const light = isLightSpec(style.color) ? ' data-light="1"' : "";
      return `<span ${attr.name}="${attr.value}"${light} style="${specStyle(style.color)}">${inner}</span>`;
    })
    .join("");
}

/** Marker text -> editor HTML. */
export const markerToHtml = (input: string): string => runsToHtml(parseRuns(input));

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
