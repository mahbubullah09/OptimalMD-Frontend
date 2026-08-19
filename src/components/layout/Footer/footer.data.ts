import type { FooterData } from "@/lib/globals.types";
import { ASSETS, ORG } from "@/lib/site";

/**
 * Footer link columns, transcribed from the live site's footer.
 *
 * The live footer is CMS-built rather than using the `.foot-*` CSS that came
 * with the page source, so the markup here follows that CSS while the content
 * below is the real thing.
 */

type FooterLink = {
  label: string;
  href: string;
};

const BASE = "https://optimalmd.com";

/** Rendered in two CSS columns, so DOM order flows down then across. */
const whatsIncludedLinks: FooterLink[] = [
  { label: "Plans", href: `${BASE}/pricing` },
  { label: "Urgent Care", href: `${BASE}/urgent-care` },
  { label: "Primary Care", href: `${BASE}/primary-care` },
  { label: "Medications", href: `${BASE}/medications` },
  { label: "Dermatology", href: `${BASE}/dermatology` },
  { label: "Specialists", href: `${BASE}/specialists` },
  { label: "Talk Therapy", href: `${BASE}/talk-therapy` },
  { label: "Psychology & Psychiatry", href: `${BASE}/psychology-psychiatry` },
  { label: "Care Coordination", href: `${BASE}/care-coordination/` },
  { label: "Lab", href: `${BASE}/labs` },
];

const faqLinks: FooterLink[] = [
  { label: "Medications FAQ", href: `${BASE}/faq-medications` },
  { label: "Provider Access FAQ", href: `${BASE}/faq-provider-access` },
  { label: "Account Management FAQ", href: `${BASE}/faq-account-management` },
];

const infoLinks: FooterLink[] = [
  { label: "Terms of Use", href: `${BASE}/terms-of-use` },
  { label: "Privacy Policy", href: `${BASE}/privacy-policy` },
  { label: "Privacy Practices", href: `${BASE}/privacy-practices` },
];

const aboutLinks: FooterLink[] = [
  { label: "Why OptimalMD?", href: `${BASE}/why-optimalmd` },
  { label: "The Team", href: `${BASE}/the-team` },
  { label: "My AI Doctor", href: `${BASE}/my-ai-doctor` },
  { label: "Contact", href: `${BASE}/contact-us` },
  { label: "Sign Up", href: "https://portal.optimalmd.com/register" },
  { label: "Careers", href: `${BASE}/careers` },
];

/* ------------------------------------------------------------------ */
/* defaults for the CMS                                                */
/* ------------------------------------------------------------------ */

/**
 * The transcribed link lists above, assembled into the shape the CMS stores.
 *
 * An adapter rather than a second transcription, so the two cannot drift.
 * Column three carries two groups because the live footer stacks FAQ and Info
 * in one column.
 */
const telHref = `tel:${ORG.phoneE164.replace(/[^+\d]/g, "")}`;
const { street, suite, city, region, postalCode } = ORG.address;

export const footerDefaults: FooterData = {
  logo: { src: ASSETS.logo, alt: ORG.name, title: "", description: "" },
  blurb: `{{link:${ORG.url}|${ORG.name}}} empowers everyone to live their healthiest lives, regardless of financial or insurance status.`,
  badge: {
    src: ASSETS.bbbBadge,
    alt: `${ORG.legalName} BBB Business Review`,
    title: "",
    description: "",
  },
  social: [
    { platform: "facebook", href: ORG.social.facebook },
    { platform: "instagram", href: ORG.social.instagram },
    { platform: "youtube", href: ORG.social.youtube },
  ],
  columns: [
    { groups: [{ title: "What's Included", links: whatsIncludedLinks }] },
    {
      groups: [
        { title: "FAQ", links: faqLinks },
        { title: "Info", links: infoLinks },
      ],
    },
    { groups: [{ title: "About", links: aboutLinks }] },
  ],
  contact: {
    title: "Contact Us",
    items: [
      { icon: "phone", title: "Phone Support", body: `Toll Free: {{link:${telHref}|${ORG.phone}}}` },
      { icon: "mail", title: "Email Us", body: `{{link:mailto:${ORG.email}|${ORG.email}}}` },
      {
        icon: "pin",
        title: "Corporate Office",
        body: `${street}\n${suite}\n${city}, ${region} ${postalCode}\nPhone: {{link:${telHref}|${ORG.phone}}}`,
      },
    ],
  },
  legal: {
    copyright: `© {year} ${ORG.legalName}. All rights reserved.`,
    links: infoLinks,
    note: `${ORG.name} is not insurance.`,
  },
};
