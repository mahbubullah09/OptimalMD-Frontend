"use client";

import { useRef, useState } from "react";
import { safeHref } from "@/lib/markerParser";
import Popover from "./Popover";

/**
 * Turns the targeted text into a link.
 *
 * Follows the same scope rule as the colour and size controls: with nothing
 * selected it links the whole field, which is what makes a one-line field like
 * a footer note linkable without selecting it first.
 *
 * The URL is validated with the same allowlist the renderer uses, so the panel
 * refuses what the page would refuse rather than storing a link that silently
 * disappears later.
 */
export default function LinkPopover({
  href,
  scopeNote,
  onApply,
  onRemove,
}: {
  /** Current link on the targeted text, if it all shares one. */
  href: string;
  scopeNote: string;
  onApply: (href: string) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(href);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = draft.trim();
  const valid = trimmed === "" || safeHref(trimmed) !== null;

  const apply = () => {
    const safe = safeHref(trimmed);
    if (!safe) return;
    onApply(safe);
    setOpen(false);
  };

  return (
    <div className="fmtPop" ref={wrapRef}>
      <button
        type="button"
        className={`fmtBtn${href ? " isActive" : ""}${open ? " isOpen" : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        title={href ? `Linked to ${href}` : "Add a link"}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          // Seeded here rather than in an effect: reopening should show what is
          // actually linked, not the last thing typed and abandoned.
          if (!open) {
            setDraft(href);
            requestAnimationFrame(() => inputRef.current?.focus());
          }
          setOpen((v) => !v);
        }}
      >
        <svg
          viewBox="0 0 24 24"
          strokeWidth="1.9"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M10.5 13.5a3.6 3.6 0 0 0 5.1 0l2.6-2.6a3.6 3.6 0 0 0-5.1-5.1l-1.3 1.3" />
          <path d="M13.5 10.5a3.6 3.6 0 0 0-5.1 0l-2.6 2.6a3.6 3.6 0 0 0 5.1 5.1l1.3-1.3" />
        </svg>
      </button>

      <Popover
        open={open}
        anchorRef={wrapRef}
        onClose={() => setOpen(false)}
        className="fmtPanelLink"
        width={280}
      >
        <p className="fmtScope isField">{scopeNote}</p>

        <div className="fmtPanelLabel">Link to</div>
        <input
          ref={inputRef}
          className="input"
          value={draft}
          placeholder="https://optimalmd.com/pricing"
          aria-label="Link URL"
          aria-invalid={!valid}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              apply();
            }
          }}
        />

        <p className="fmtSizeNote">
          {valid
            ? "A web address, or mailto: / tel: / a path beginning with /."
            : "That address cannot be linked to."}
        </p>

        <div className="fmtLinkActions">
          <button
            type="button"
            className="btn btnPrimary btnSm"
            disabled={!valid || trimmed === ""}
            onMouseDown={(e) => e.preventDefault()}
            onClick={apply}
          >
            Apply
          </button>
          {href ? (
            <button
              type="button"
              className="btn btnGhost btnSm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onRemove();
                setOpen(false);
              }}
            >
              Remove link
            </button>
          ) : null}
        </div>
      </Popover>
    </div>
  );
}
