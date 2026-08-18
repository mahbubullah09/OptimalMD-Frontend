/**
 * Footer link columns, transcribed from the live site's footer.
 *
 * The live footer is CMS-built rather than using the `.foot-*` CSS that came
 * with the page source, so the markup here follows that CSS while the content
 * below is the real thing.
 */

export type FooterLink = {
  label: string;
  href: string;
};

const BASE = "https://optimalmd.com";

/** Rendered in two CSS columns, so DOM order flows down then across. */
export const whatsIncludedLinks: FooterLink[] = [
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

export const faqLinks: FooterLink[] = [
  { label: "Medications FAQ", href: `${BASE}/faq-medications` },
  { label: "Provider Access FAQ", href: `${BASE}/faq-provider-access` },
  { label: "Account Management FAQ", href: `${BASE}/faq-account-management` },
];

export const infoLinks: FooterLink[] = [
  { label: "Terms of Use", href: `${BASE}/terms-of-use` },
  { label: "Privacy Policy", href: `${BASE}/privacy-policy` },
  { label: "Privacy Practices", href: `${BASE}/privacy-practices` },
];

export const aboutLinks: FooterLink[] = [
  { label: "Why OptimalMD?", href: `${BASE}/why-optimalmd` },
  { label: "The Team", href: `${BASE}/the-team` },
  { label: "My AI Doctor", href: `${BASE}/my-ai-doctor` },
  { label: "Contact", href: `${BASE}/contact-us` },
  { label: "Sign Up", href: "https://portal.optimalmd.com/register" },
  { label: "Careers", href: `${BASE}/careers` },
];
