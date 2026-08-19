/**
 * Reveals the editor field a preview click referred to.
 *
 * Shared by both workspaces because the behaviour has to be identical: an
 * author who learns that clicking a heading jumps to that heading's field
 * should find the same thing happens in the navbar editor.
 *
 * Opening every ancestor `<details>` is the part that matters. Fields live
 * inside collapsed repeatable rows — a nav item three levels down sits in
 * three nested rows — so scrolling to a field without unfolding what contains
 * it would scroll to something invisible.
 */
export function focusField(root: HTMLElement | null, path: string | null | undefined): void {
  if (!root) return;

  const target = path
    ? root.querySelector<HTMLElement>(`[data-field-path="${CSS.escape(path)}"]`)
    : null;

  if (!target) {
    root.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  for (let node: HTMLElement | null = target; node && root.contains(node); node = node.parentElement) {
    if (node instanceof HTMLDetailsElement) node.open = true;
  }
  if (target instanceof HTMLDetailsElement) target.open = true;

  // A frame later, so the rows opened above have laid out and the scroll
  // lands where the field ends up rather than where it was.
  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    target.classList.add("fieldHit");
    window.setTimeout(() => target.classList.remove("fieldHit"), 1200);
    target
      .querySelector<HTMLElement>("input, textarea, [contenteditable]")
      ?.focus({ preventScroll: true });
  });
}
