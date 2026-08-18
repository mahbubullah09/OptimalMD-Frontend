/**
 * Navigation structure, transcribed from the live site's nav markup.
 *
 * Three levels: top-level entry -> dropdown item -> flyout item. A dropdown
 * item is either a plain link or a branch that opens a flyout.
 */

export type NavLink = {
  label: string;
  href: string;
};

/** A dropdown row that opens a side flyout instead of navigating. */
export type NavBranch = {
  label: string;
  children: NavLink[];
  /** Flyout opens to the left of the dropdown rather than the right. */
  flyoutLeft?: boolean;
};

export type NavDropdownItem = NavLink | NavBranch;

export type NavEntry =
  | NavLink
  | {
      label: string;
      children: NavDropdownItem[];
      /** Right-align the dropdown against the nav edge. */
      alignRight?: boolean;
    };

export const isBranch = (item: NavDropdownItem): item is NavBranch => "children" in item;

export const hasDropdown = (
  entry: NavEntry,
): entry is Extract<NavEntry, { children: NavDropdownItem[] }> => "children" in entry;

const BASE = "https://optimalmd.com";

export const navEntries: NavEntry[] = [
  { label: "Individuals", href: `${BASE}/individual` },
  { label: "Employers", href: `${BASE}/employers` },
  {
    label: "What's Included",
    children: [
      { label: "$0 Medications", href: `${BASE}/medications` },
      { label: "$0 Diagnostic Lab Tests", href: `${BASE}/labs` },
      {
        label: "$0 Telehealth Visits",
        children: [
          { label: "Urgent Care", href: `${BASE}/urgent-care` },
          { label: "Primary Care", href: `${BASE}/primary-care` },
          { label: "Dermatology", href: `${BASE}/dermatology` },
          { label: "Psychology & Psychiatry", href: `${BASE}/psychology-psychiatry` },
          { label: "Patient Care Coordination", href: `${BASE}/care-coordination` },
        ],
      },
      {
        label: "$0 to Message 13 Specialists",
        children: [
          { label: "Women's Health", href: `${BASE}/specialists` },
          { label: "General Practitioner", href: `${BASE}/primary-care` },
          { label: "Pediatrician", href: `${BASE}/specialists` },
          { label: "Allergist", href: `${BASE}/specialists` },
          { label: "Psychologist", href: `${BASE}/specialists` },
          { label: "Dietician", href: `${BASE}/specialists` },
          { label: "Sports Medicine", href: `${BASE}/specialists` },
          { label: "Alternative Medicine", href: `${BASE}/specialists` },
          { label: "Pharmacist", href: `${BASE}/specialists` },
          { label: "Ophthalmologist", href: `${BASE}/specialists` },
        ],
      },
      { label: "$0 Licensed Therapists", href: `${BASE}/talk-therapy` },
      { label: "$0 for My AI Doctor™ – Diagnosis Companion", href: `${BASE}/my-ai-doctor` },
      {
        label: "Weight Loss Program (GLP-1)",
        href: `${BASE}/weight-loss-and-specialty-programs`,
      },
    ],
  },
  { label: "Partner with us", href: `${BASE}/careers` },
  {
    label: "More",
    alignRight: true,
    children: [
      { label: "Pricing", href: `${BASE}/pricing` },
      { label: "Real Stories", href: `${BASE}/real-stories` },
      {
        label: "FAQ",
        flyoutLeft: true,
        children: [
          { label: "FAQ – Medications", href: `${BASE}/faq-medications` },
          { label: "FAQ – Provider Access", href: `${BASE}/faq-provider-access` },
          { label: "FAQ – Account Management", href: `${BASE}/faq-account-management` },
        ],
      },
      { label: "Support", href: `${BASE}/support` },
      { label: "Contact", href: `${BASE}/contact-us` },
    ],
  },
];

export const navActions = {
  login: "https://portal.optimalmd.com/login",
  getStarted: `${BASE}/pricing`,
};
