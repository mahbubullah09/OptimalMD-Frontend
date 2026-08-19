"use client";

import { type ReactNode, type RefObject, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * A floating panel that is not clipped by whatever it opens inside.
 *
 * The editor panel scrolls (`overflow-y: auto`), and an absolutely positioned
 * child of a scroll container is clipped by it — no `z-index` escapes that,
 * which is why the colour panel was losing its lower half. So the panel is
 * portalled to `document.body` and positioned with `fixed` coordinates taken
 * from its trigger.
 *
 * It flips above the trigger when there is not enough room below, and is
 * clamped to the viewport horizontally, so a control near an edge still opens
 * something you can read.
 */

const MARGIN = 8;

export default function Popover({
  open,
  anchorRef,
  onClose,
  className = "",
  width = 232,
  children,
}: {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onClose: () => void;
  className?: string;
  width?: number;
  children: ReactNode;
}) {
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number; maxHeight: number } | null>(null);

  // Positioned in a layout effect so the panel never paints in the wrong place
  // first; `panel` is state rather than a ref so this re-runs once it mounts.
  useLayoutEffect(() => {
    if (!open) return;

    const place = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const height = panel?.offsetHeight ?? 0;

      const below = window.innerHeight - rect.bottom - MARGIN * 2;
      const above = rect.top - MARGIN * 2;
      // Flip up only when below genuinely cannot hold it and above is roomier.
      const flip = height > below && above > below;

      setPos({
        top: flip ? Math.max(MARGIN, rect.top - height - MARGIN) : rect.bottom + MARGIN,
        left: Math.min(
          Math.max(MARGIN, rect.left),
          Math.max(MARGIN, window.innerWidth - width - MARGIN),
        ),
        maxHeight: Math.max(160, flip ? above : below),
      });
    };

    place();

    // `true` so scrolling any ancestor — including the editor panel — moves
    // the popover with its trigger rather than leaving it stranded.
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, anchorRef, panel, width]);

  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      // The panel is no longer inside the trigger's subtree, so both have to
      // be consulted before treating a click as "outside".
      if (anchorRef.current?.contains(target) || panel?.contains(target)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, anchorRef, panel, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={setPanel}
      className={`adminPortalLayer fmtPanel ${className}`}
      style={{
        position: "fixed",
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        width,
        maxHeight: pos?.maxHeight,
        // Its own scrollbar, so a tall panel on a short screen stays usable
        // instead of running off the bottom.
        overflowY: "auto",
        visibility: panel && pos ? "visible" : "hidden",
      }}
    >
      {children}
    </div>,
    document.body,
  );
}
