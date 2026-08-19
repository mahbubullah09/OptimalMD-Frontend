/**
 * Cross-checks the navbar/footer preview targets against the editor's fields.
 *
 * A mismatch is silent at runtime — the click simply does nothing — so it is
 * caught here instead, the same way `check:paths` does for page sections.
 */
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(p, "utf8");

/** Template paths use `${...}` for indices; compare them as shapes. */
const shape = (raw) =>
  raw
    .replace(/\$\{[^}]*\}/g, "#")
    .replace(/\.#\./g, ".#.")
    .trim();

const collect = (text, re) => {
  const out = new Set();
  for (const m of text.matchAll(re)) out.add(shape(m[1]));
  return out;
};

const targets = new Set([
  ...collect(read("src/components/layout/Navbar/Navbar.tsx"), /data-preview-field=\{?["`]([^"`]+)["`]\}?/g),
  ...collect(read("src/components/layout/Footer/Footer.tsx"), /data-preview-field=\{?["`]([^"`]+)["`]\}?/g),
]);

const forms = new Set([
  ...collect(read("src/components/admin/globals/NavForm.tsx"), /path=\{?["`]([^"`]+)["`]\}?/g),
  ...collect(read("src/components/admin/globals/FooterForm.tsx"), /path=\{?["`]([^"`]+)["`]\}?/g),
]);

// Form paths are built from a parent `itemPath`, so compare by suffix too.
// RepeatableField stamps `${path}.${index}` on every row it renders, so a
// form path of "footer.social" also provides "footer.social.0".
for (const f of [...forms]) forms.add(`${f}.#`);

const suffixes = [...forms].map((f) => f.replace(/^.*?#/, "#"));

const matches = (target) =>
  forms.has(target) ||
  [...forms].some((f) => f.endsWith(target) || target.endsWith(f.replace(/^[^.]*\./, ""))) ||
  suffixes.some((s) => target.endsWith(s.replace(/^#\./, "")));

const unmatched = [...targets].filter((t) => !matches(t));

console.log(`${targets.size} preview target shape(s), ${forms.size} form path shape(s)`);
for (const t of [...targets].sort()) {
  console.log(`  ${matches(t) ? "ok  " : "MISS"} ${t}`);
}

if (unmatched.length > 0) {
  console.log(`\n${unmatched.length} target(s) with no matching field.`);
  process.exitCode = 1;
} else {
  console.log("\nEvery chrome preview target has a matching editor field.");
}
