import fs from "node:fs";
import process from "node:process";

process.chdir("d:/ODL Projects/OptimalMD/OMD-Frontend");

/**
 * Finds admin classes that render text but never state a colour.
 *
 * Inherited colour has proved unreliable in this panel — a label that relies
 * on it renders invisible — so anything text-bearing should set its own.
 */

const css = fs.readFileSync("src/app/admin/admin.css", "utf8");

// Collect every rule as { selector, body }.
const rules = [...css.matchAll(/([^{}]+)\{([^}]*)\}/g)].map((m) => ({
  selector: m[1].trim().replace(/\s+/g, " "),
  body: m[2],
}));

// Classes that clearly render text.
const TEXT_HINTS = [
  "font-size",
  "font-weight",
  "line-height",
  "text-transform",
  "letter-spacing",
];

const declaresColour = (body) => /(^|;|\s)color\s*:/.test(body);
const looksTextual = (body) => TEXT_HINTS.some((h) => body.includes(h));

// A selector's colour may be set by another rule with the same selector.
const colouredSelectors = new Set(
  rules.filter((r) => declaresColour(r.body)).map((r) => r.selector),
);

const suspects = rules.filter((r) => {
  if (r.selector.startsWith("@")) return false;
  if (r.selector.includes("keyframes")) return false;
  if (!looksTextual(r.body)) return false;
  if (declaresColour(r.body)) return false;
  if (colouredSelectors.has(r.selector)) return false;
  // Inputs and buttons already set their own colour elsewhere.
  if (/\.(input|textarea|btn|rte)\b/.test(r.selector)) return false;
  return true;
});

if (suspects.length === 0) {
  console.log("No admin text rules rely on inherited colour.");
} else {
  console.log("Text rules with no colour of their own:\n");
  for (const s of suspects) console.log(`  ${s.selector}`);
  console.log(`\n${suspects.length} rule(s) to check.`);
}
