import fs from "node:fs";
import process from "node:process";

process.chdir("d:/ODL Projects/OptimalMD/OMD-Frontend");

/**
 * Cross-checks that every clickable element in a section has a matching field
 * in that section's form. A mismatch is silent at runtime — the click just
 * does nothing — so it is worth catching statically.
 */

const SECTIONS = {
  hero: "src/components/sections/Hero/Hero.tsx",
  careCoverage: "src/components/sections/CareCoverage/CareCoverage.tsx",
  audiences: "src/components/sections/Audiences/Audiences.tsx",
  network: "src/components/sections/Network/Network.tsx",
  noList: "src/components/sections/NoList/NoList.tsx",
  appPromo: "src/components/sections/AppPromo/AppPromo.tsx",
  whyOptimalMD: "src/components/sections/WhyOptimalMD/WhyOptimalMD.tsx",
  givesBack: "src/components/sections/GivesBack/GivesBack.tsx",
  finalCta: "src/components/sections/FinalCta/FinalCta.tsx",
};

/** Collapse index/variant interpolations so both sides compare equal. */
const norm = (raw) =>
  raw
    .replace(/\$\{variant\}/g, "SIDE")
    .replace(/\$\{i\}/g, "N")
    .replace(/\$\{itemPath\}/g, "ITEM")
    .replace(/\$\{[^}]+\}/g, "N");

const collect = (file, re) => {
  const src = fs.readFileSync(file, "utf8");
  const out = new Set();
  for (const m of src.matchAll(re)) out.add(norm(m[1] ?? m[2] ?? ""));
  return out;
};

// data-preview-field="x" or data-preview-field={`x`}
const PREVIEW = /data-preview-field=(?:"([^"]+)"|\{`([^`]+)`\})/g;
// path="x" or path={`x`}
const PATH = /\bpath=(?:"([^"]+)"|\{`([^`]+)`\})/g;

const formSrc = fs.readFileSync("src/components/admin/sections/SectionForms.tsx", "utf8");

// Split the forms file into per-section chunks so paths are attributed right.
const formChunks = {};
const FORM_FNS = [
  ["hero", "export function HeroForm"],
  ["careCoverage", "export function CareCoverageForm"],
  ["audiences", "export function AudiencesForm"],
  ["network", "export function NetworkForm"],
  ["noList", "export function NoListForm"],
  ["appPromo", "export function AppPromoForm"],
  ["whyOptimalMD", "export function WhyOptimalMDForm"],
  ["givesBack", "export function GivesBackForm"],
  ["finalCta", "export function FinalCtaForm"],
];
for (let i = 0; i < FORM_FNS.length; i++) {
  const [key, marker] = FORM_FNS[i];
  const start = formSrc.indexOf(marker);
  const nextMarker = FORM_FNS[i + 1]?.[1];
  const end = nextMarker ? formSrc.indexOf(nextMarker) : formSrc.length;
  formChunks[key] = formSrc.slice(start, end);
}
// The hero's column form is a helper above HeroForm.
formChunks.hero =
  formSrc.slice(formSrc.indexOf("function HeroSideForm"), formSrc.indexOf("export function CareCoverageForm"));

let problems = 0;

for (const [key, file] of Object.entries(SECTIONS)) {
  const targets = collect(file, PREVIEW);
  const chunk = formChunks[key] ?? "";
  const paths = new Set();
  for (const m of chunk.matchAll(PATH)) paths.add(norm(m[1] ?? m[2] ?? ""));

  // An ITEM-prefixed form path corresponds to a `<group>.N.<field>` target.
  const expanded = new Set();
  for (const p of paths) {
    expanded.add(p);
    if (p.startsWith("ITEM.")) expanded.add(p.replace("ITEM.", ""));
    if (p === "ITEM") expanded.add("ITEM");
  }

  const matches = (t) => {
    if (expanded.has(t)) return true;
    // group.N.field  ->  ITEM.field
    // An item path may have several segments before the index,
    // e.g. left.features.0.icon -> ITEM.icon
    const asItem = t.replace(/^.*\.N\./, "ITEM.");
    if (expanded.has(asItem)) return true;
    // group.N        ->  ITEM  (whole repeatable entry)
    if (/^[A-Za-z]+\.N$/.test(t) && (expanded.has("ITEM") || paths.has(t.split(".")[0]))) return true;
    // SIDE.features.N -> the group itself
    if (/\.N$/.test(t) && expanded.has(t.replace(/\.N$/, ""))) return true;
    return false;
  };

  const unmatched = [...targets].filter((t) => !matches(t));

  const label = key.padEnd(14);
  if (process.env.DEBUG) console.log(`   [debug] ${key}: chunk=${chunk.length} paths=${[...paths].join("|")}`);
  if (unmatched.length === 0) {
    console.log(`OK    ${label} ${targets.size} target(s) all matched`);
  } else {
    problems += unmatched.length;
    console.log(`WARN  ${label} unmatched: ${unmatched.join(", ")}`);
  }
}

console.log(
  problems === 0
    ? "\nEvery preview target has a matching editor field."
    : `\n${problems} target(s) have no matching field.`,
);
