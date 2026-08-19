/**
 * The admin's icon set.
 *
 * These were text glyphs — "↑", "✕", "⌄" — which is why they sat at different
 * heights, changed shape with the font, and never lined up with each other.
 * Drawn instead on a shared 24-unit grid with one stroke weight, so every
 * control in the builder reads as part of the same set.
 *
 * All are decorative: the buttons around them carry the accessible name.
 */

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none",
  stroke: "currentColor",
  "aria-hidden": true,
} as const;

/**
 * Points right when closed and is rotated by CSS when open, rather than being
 * swapped for a second glyph — one shape that turns reads as the same control
 * changing state.
 */
export const ChevronIcon = ({ className }: IconProps) => (
  <svg {...base} className={`icn icnChevron${className ? ` ${className}` : ""}`}>
    <path d="m9 5 7 7-7 7" />
  </svg>
);

export const ArrowUpIcon = ({ className }: IconProps) => (
  <svg {...base} className={`icn${className ? ` ${className}` : ""}`}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

export const ArrowDownIcon = ({ className }: IconProps) => (
  <svg {...base} className={`icn${className ? ` ${className}` : ""}`}>
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
);

export const CloseIcon = ({ className }: IconProps) => (
  <svg {...base} className={`icn${className ? ` ${className}` : ""}`}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
