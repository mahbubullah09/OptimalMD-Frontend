/**
 * Translation between a DOM selection and plain-text character offsets.
 *
 * Formatting changes rewrite the editor's innerHTML, which detaches every node
 * a DOM Range points at. Offsets are just numbers, so they survive that — which
 * is what allows a size to be nudged again and again, and what allows a change
 * to be applied at all while focus sits in the size input rather than in the
 * text.
 *
 * A <br> counts as one character, matching the "\n" the run model stores.
 */

export type TextRange = { start: number; end: number };

/** Character offset of a DOM position within `root`. */
export function offsetOf(root: Node, node: Node, offset: number): number {
  let count = 0;
  let found: number | null = null;

  const walk = (current: Node): void => {
    if (found !== null) return;

    if (current.nodeType === Node.TEXT_NODE) {
      if (current === node) {
        found = count + offset;
        return;
      }
      count += (current.textContent ?? "").length;
      return;
    }

    if (current.nodeName === "BR") {
      if (current === node) found = count;
      count += 1;
      return;
    }

    const children = [...current.childNodes];
    for (const [index, child] of children.entries()) {
      // An element position addresses the gap before its nth child.
      if (current === node && index === offset) {
        found = count;
        return;
      }
      walk(child);
      if (found !== null) return;
    }

    if (current === node && offset >= children.length) found = count;
  };

  walk(root);
  return found ?? count;
}

/** The current selection as offsets, or null when it is not inside `root`. */
export function selectionRange(root: HTMLElement): TextRange | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return null;

  const a = offsetOf(root, range.startContainer, range.startOffset);
  const b = offsetOf(root, range.endContainer, range.endOffset);
  return { start: Math.min(a, b), end: Math.max(a, b) };
}

/** The DOM position for a character offset. */
function positionAt(root: HTMLElement, target: number): { node: Node; offset: number } {
  let count = 0;
  let last: { node: Node; offset: number } = { node: root, offset: 0 };

  const walk = (current: Node): { node: Node; offset: number } | null => {
    if (current.nodeType === Node.TEXT_NODE) {
      const length = (current.textContent ?? "").length;
      if (target <= count + length) return { node: current, offset: target - count };
      count += length;
      last = { node: current, offset: length };
      return null;
    }

    if (current.nodeName === "BR") {
      count += 1;
      const parent = current.parentNode;
      if (parent) last = { node: parent, offset: [...parent.childNodes].indexOf(current as ChildNode) + 1 };
      return null;
    }

    for (const child of [...current.childNodes]) {
      const hit = walk(child);
      if (hit) return hit;
    }
    return null;
  };

  return walk(root) ?? last;
}

/** Restores a selection from offsets. Caller decides whether focus is theirs. */
export function restoreRange(root: HTMLElement, range: TextRange): void {
  const from = positionAt(root, range.start);
  const to = positionAt(root, range.end);

  const domRange = document.createRange();
  try {
    domRange.setStart(from.node, from.offset);
    domRange.setEnd(to.node, to.offset);
  } catch {
    // Offsets can outrun the text after an edit; leaving the caret alone is
    // better than throwing inside an event handler.
    return;
  }

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(domRange);
}
