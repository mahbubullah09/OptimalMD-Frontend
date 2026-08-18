/**
 * Parser for the inline marker syntax used in CMS copy.
 *
 * Shared by the public renderer (`richText`) and the admin's inline editor so
 * both agree exactly on what a stored string means.
 *
 * A hand-written scanner rather than a regex because markers can nest:
 * `{{grad:…|{{#0B2545|text}}}}`. A regex cannot match balanced `{{ }}` pairs,
 * so it stopped at the first `}` and left the remainder to leak out as literal
 * braces on the page. Handling nesting here also repairs content that was
 * saved while that bug was live — the innermost colour wins and the value is
 * rewritten flat the next time it is saved.
 */

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export const isHex = (value: string) => HEX.test(value.trim());

export type ColorSpec =
  | { kind: "tone"; tone: "blue" | "green" }
  | { kind: "solid"; color: string }
  | { kind: "gradient"; from: string; to: string; angle: number };

export type MarkerNode =
  | { type: "text"; value: string }
  | { type: "break" }
  | { type: "color"; spec: ColorSpec | null; children: MarkerNode[] }
  | { type: "size"; size: ResponsiveSize; children: MarkerNode[] }
  | { type: "bold"; children: MarkerNode[] }
  | { type: "italic"; children: MarkerNode[] };

/**
 * Text size comes in two flavours.
 *
 * `em` is a multiplier of whatever the surrounding design already uses, so a
 * resized phrase keeps tracking the responsive type scale. `px` pins an exact
 * value, which is what you want when a figure has to match a spec — at the
 * cost of not shrinking on small screens.
 */
export type SizeUnit = "em" | "px";
export type SizeValue = { value: number; unit: SizeUnit };

/**
 * A size per breakpoint. Only `desktop` is required in practice; a missing
 * breakpoint inherits the next one up, which is what makes a desktop-only
 * size behave exactly as it did before per-device sizing existed.
 */
export type ResponsiveSize = {
  desktop?: SizeValue;
  tablet?: SizeValue;
  mobile?: SizeValue;
};

export const BREAKPOINTS = ["desktop", "tablet", "mobile"] as const;
export type Breakpoint = (typeof BREAKPOINTS)[number];

export const MIN_SCALE = 0.5;
export const MAX_SCALE = 4;
export const MIN_PX = 8;
export const MAX_PX = 200;

export const clampScale = (value: number): number =>
  Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));

export const clampPx = (value: number): number =>
  Math.round(Math.min(MAX_PX, Math.max(MIN_PX, value)));

export const clampSize = (value: number, unit: SizeUnit): number =>
  unit === "px" ? clampPx(value) : clampScale(value);

const KEYS: Record<string, Breakpoint> = { d: "desktop", t: "tablet", m: "mobile" };
const SHORT: Record<Breakpoint, string> = { desktop: "d", tablet: "t", mobile: "m" };

const readValue = (raw: string, fallbackUnit: SizeUnit): SizeValue | null => {
  const trimmed = raw.trim();
  const unit: SizeUnit = trimmed.endsWith("px")
    ? "px"
    : trimmed.endsWith("em")
      ? "em"
      : fallbackUnit;
  const num = Number.parseFloat(trimmed);
  return Number.isFinite(num) ? { value: clampSize(num, unit), unit } : null;
};

/**
 * Reads a size marker head. Three accepted forms:
 *
 *   size:1.3                   -> 1.3em on every breakpoint
 *   px:24                      -> 24px on every breakpoint
 *   size:d=1.3em,t=1.1em,m=16px -> per breakpoint, any subset
 */
export function parseSizeHead(head: string): ResponsiveSize | null {
  const fallbackUnit: SizeUnit = head.startsWith("px:") ? "px" : "em";
  const body = head.slice(head.indexOf(":") + 1);

  if (!body.includes("=")) {
    const single = readValue(body, fallbackUnit);
    return single ? { desktop: single } : null;
  }

  const size: ResponsiveSize = {};
  for (const part of body.split(",")) {
    const [key = "", raw = ""] = part.split("=");
    const breakpoint = KEYS[key.trim()];
    if (!breakpoint) continue;
    const parsed = readValue(raw, fallbackUnit);
    if (parsed) size[breakpoint] = parsed;
  }

  return Object.keys(size).length > 0 ? size : null;
}

/** Serialises back to the shortest form that round-trips. */
export function sizeToMarker(size: ResponsiveSize): string {
  const set = BREAKPOINTS.filter((b) => size[b]);
  if (set.length === 0) return "";

  const desktopOnly = set.length === 1 && set[0] === "desktop";
  if (desktopOnly && size.desktop) {
    const { value, unit } = size.desktop;
    return unit === "px" ? `px:${value}` : `size:${value}`;
  }

  const parts = set.map((b) => {
    const v = size[b];
    return `${SHORT[b]}=${v?.value}${v?.unit}`;
  });
  return `size:${parts.join(",")}`;
}

/** Custom properties consumed by the .rt-size rules in globals.css. */
export function sizeToVars(size: ResponsiveSize): Record<string, string> {
  const vars: Record<string, string> = {};
  if (size.desktop) vars["--fs-d"] = `${size.desktop.value}${size.desktop.unit}`;
  if (size.tablet) vars["--fs-t"] = `${size.tablet.value}${size.tablet.unit}`;
  if (size.mobile) vars["--fs-m"] = `${size.mobile.value}${size.mobile.unit}`;
  return vars;
}

/** Reads a colour spec from the part before the `|` of a marker. */
function parseSpec(head: string): ColorSpec | null {
  if (head === "blue" || head === "green") return { kind: "tone", tone: head };

  if (head.startsWith("grad:")) {
    const [from = "", to = "", angle] = head.slice(5).split(",");
    if (!isHex(from) || !isHex(to)) return null;
    const parsed = Number(angle ?? 92);
    return {
      kind: "gradient",
      from: from.trim(),
      to: to.trim(),
      angle: Number.isFinite(parsed) ? parsed : 92,
    };
  }

  return isHex(head) ? { kind: "solid", color: head.trim() } : null;
}

/** Index of the `}}` that closes the `{{` at `start`, or -1. */
function findClose(input: string, start: number): number {
  let depth = 0;
  for (let i = start; i < input.length - 1; i++) {
    if (input[i] === "{" && input[i + 1] === "{") {
      depth++;
      i++;
    } else if (input[i] === "}" && input[i + 1] === "}") {
      depth--;
      if (depth === 0) return i;
      i++;
    }
  }
  return -1;
}

export function parseMarkers(input: string): MarkerNode[] {
  const nodes: MarkerNode[] = [];
  if (!input) return nodes;

  let text = "";
  const flush = () => {
    if (text) {
      nodes.push({ type: "text", value: text });
      text = "";
    }
  };

  let i = 0;
  while (i < input.length) {
    const two = input.slice(i, i + 2);

    if (two === "{{") {
      const close = findClose(input, i);
      const pipe = input.indexOf("|", i + 2);

      if (close !== -1 && pipe !== -1 && pipe < close) {
        flush();
        const head = input.slice(i + 2, pipe);
        const body = input.slice(pipe + 1, close);

        if (head.startsWith("size:") || head.startsWith("px:")) {
          const size = parseSizeHead(head);
          // An unreadable size keeps the text at its normal size rather than
          // dropping the words.
          nodes.push(
            size === null
              ? { type: "color", spec: null, children: parseMarkers(body) }
              : { type: "size", size, children: parseMarkers(body) },
          );
        } else {
          nodes.push({ type: "color", spec: parseSpec(head), children: parseMarkers(body) });
        }

        i = close + 2;
        continue;
      }
    }

    if (two === "**") {
      const end = input.indexOf("**", i + 2);
      if (end !== -1 && end > i + 2) {
        flush();
        nodes.push({ type: "bold", children: parseMarkers(input.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }

    if (input[i] === "*") {
      const end = input.indexOf("*", i + 1);
      // Italic runs do not span lines, which keeps a stray asterisk literal.
      if (end !== -1 && end > i + 1 && !input.slice(i + 1, end).includes("\n")) {
        flush();
        nodes.push({ type: "italic", children: parseMarkers(input.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }

    if (input[i] === "\n") {
      flush();
      nodes.push({ type: "break" });
      i++;
      continue;
    }

    text += input[i];
    i++;
  }

  flush();
  return nodes;
}

/** CSS for a colour spec, shared by the renderer and the editor. */
export function specCss(spec: ColorSpec): Record<string, string> {
  if (spec.kind === "tone") {
    return { color: spec.tone === "blue" ? "var(--blue)" : "var(--green)" };
  }
  if (spec.kind === "solid") return { color: spec.color };
  return {
    backgroundImage: `linear-gradient(${spec.angle}deg, ${spec.from}, ${spec.to})`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  };
}

/** Serialises a spec back to its marker head. */
export function specToMarker(spec: ColorSpec): string {
  if (spec.kind === "tone") return spec.tone;
  if (spec.kind === "solid") return spec.color;
  return `grad:${spec.from},${spec.to}`;
}
