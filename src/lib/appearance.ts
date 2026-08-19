import type { CSSProperties } from "react";
import type { Appearance } from "./globals.types";
import { type ColorSpec, specCss } from "./markerParser";

/**
 * Turns a chosen colour into inline styles.
 *
 * A gradient cannot be a `color`, so a gradient chosen for text is painted
 * through background-clip exactly as the renderer does it; a gradient chosen
 * as a fill is simply a background image. Keeping that distinction here means
 * neither caller has to know it.
 */
const fill = (spec: ColorSpec): CSSProperties => {
  if (spec.kind === "tone") {
    return { background: spec.tone === "blue" ? "#1FA9E8" : "#5BA84A" };
  }
  if (spec.kind === "solid") return { background: spec.color };
  return { backgroundImage: `linear-gradient(${spec.angle}deg, ${spec.from}, ${spec.to})` };
};

/** Background for a bar or a button. Undefined when the stylesheet should win. */
export function backgroundStyle(appearance?: Appearance): CSSProperties | undefined {
  const spec = appearance?.background;
  return spec ? fill(spec) : undefined;
}

/** Fill and label colour for a button, as one style object. */
export function buttonStyle(appearance?: Appearance): CSSProperties | undefined {
  if (!appearance?.buttonFill && !appearance?.buttonText) return undefined;

  return {
    ...(appearance.buttonFill ? fill(appearance.buttonFill) : {}),
    ...(appearance.buttonText ? (specCss(appearance.buttonText) as CSSProperties) : {}),
    // A chosen fill has to beat the stylesheet's own border, or a bordered
    // button keeps its old outline around a new colour.
    ...(appearance.buttonFill ? { borderColor: "transparent" } : {}),
  };
}
