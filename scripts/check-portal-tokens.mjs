/**
 * Checks that everything rendered inside a portalled popover can resolve the
 * design tokens it uses.
 *
 * Popovers render into <body> to escape the editor panel's scroll clipping,
 * which puts them outside `.adminRoot` — where every `--a-*` token is declared.
 * A token that does not resolve is not an error anywhere: the declaration is
 * simply dropped, so `background: var(--a-surface)` silently becomes a
 * transparent panel. That is exactly the bug this exists to prevent.
 *
 *   npm run check:tokens
 */

import { readFileSync } from "node:fs";

const css = readFileSync("src/app/admin/admin.css", "utf8");

/* ---- which classes appear inside a popover ---------------------------- */

const POPOVER_SOURCES = [
  "src/components/admin/fields/ColorPopover.tsx",
  "src/components/admin/fields/LinkPopover.tsx",
  "src/components/admin/fields/ColorField.tsx",
  "src/components/admin/fields/Popover.tsx",
];

const panelClasses = new Set(["adminPortalLayer"]);
for (const file of POPOVER_SOURCES) {
  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/className=[{]?[`"']([^`"']+)[`"']/g)) {
    for (const name of match[1].split(/[\s${}?:]+/)) {
      if (/^[a-zA-Z][\w-]*$/.test(name)) panelClasses.add(name);
    }
  }
}

/* ---- tokens available to the portal layer ----------------------------- */

/** Strips comments so a commented-out example is never read as a rule. */
const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");

const rules = [...clean.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({
  selector: m[1].trim(),
  body: m[2],
}));

const available = new Set();
for (const rule of rules) {
  if (!rule.selector.split(",").some((s) => s.trim().startsWith(".adminPortalLayer"))) continue;
  for (const decl of rule.body.matchAll(/(--[\w-]+)\s*:/g)) available.add(decl[1]);
}

/* ---- what the popover's own rules ask for ----------------------------- */

const problems = [];

for (const rule of rules) {
  const selectors = rule.selector.split(",").map((s) => s.trim());

  // Only rules that can match something inside a popover.
  const touchesPanel = selectors.some((selector) =>
    [...panelClasses].some((name) => selector.includes(`.${name}`)),
  );
  if (!touchesPanel) continue;

  // A rule scoped under .adminRoot never applies to the portal, so it is not
  // this check's business.
  if (selectors.every((s) => s.includes(".adminRoot"))) continue;

  for (const use of rule.body.matchAll(/var\((\s*--[\w-]+)\s*(,)?/g)) {
    const token = use[1].trim();
    const hasFallback = Boolean(use[2]);
    if (!available.has(token) && !hasFallback) {
      problems.push({ selector: rule.selector, token });
    }
  }
}

console.log(
  `${panelClasses.size} popover class(es), ${available.size} token(s) declared for the portal layer`,
);

if (problems.length === 0) {
  console.log("\nEvery token used inside a portalled popover resolves there.");
} else {
  for (const { selector, token } of problems) {
    console.log(`  MISS ${selector} uses ${token}`);
  }
  console.log(
    `\n${problems.length} unresolvable token use(s). Declare them alongside` +
      " .adminPortalLayer, or give the var() a fallback.",
  );
  process.exitCode = 1;
}
