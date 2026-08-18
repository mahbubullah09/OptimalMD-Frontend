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
  | { type: "bold"; children: MarkerNode[] }
  | { type: "italic"; children: MarkerNode[] };

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
        nodes.push({ type: "color", spec: parseSpec(head), children: parseMarkers(body) });
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
