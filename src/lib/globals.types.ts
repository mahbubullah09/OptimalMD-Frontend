/**
 * Site-wide content: the navbar and the footer.
 *
 * These are not page sections. They appear on every page, so they live in a
 * single globals document rather than being duplicated into each page's
 * section list — editing the menu once should change it everywhere.
 *
 * Kept free of `server-only` imports because the admin's client components
 * need these types.
 */

import type { ColorSpec } from "./markerParser";
import type { ImageData } from "./sections.types";

/**
 * Colours for an element rather than for text.
 *
 * Every field is optional and null means "leave it to the stylesheet", so a
 * document saved before this existed renders exactly as it did.
 */
export type Appearance = {
  background?: ColorSpec | null;
  /** Fill and label colour for a button. */
  buttonFill?: ColorSpec | null;
  buttonText?: ColorSpec | null;
};

/* ------------------------------------------------------------------ */
/* navbar                                                              */
/* ------------------------------------------------------------------ */

/**
 * One menu entry, at any depth.
 *
 * Deliberately uniform rather than a union of link/branch/entry types: the
 * three levels of this menu differ only in how they are *drawn*, so a single
 * recursive shape lets one editor component handle all of them, and lets an
 * author turn a link into a submenu by adding a child.
 *
 * An item with children renders as a menu and ignores `href`.
 */
export type NavItem = {
  label: string;
  href: string;
  children: NavItem[];
  /** Top level only: align the dropdown to the nav's right edge. */
  alignRight?: boolean;
  /** Second level only: open the flyout leftwards, for entries near the edge. */
  flyoutLeft?: boolean;
};

export type NavAction = { label: string; href: string; appearance?: Appearance };

export type NavData = {
  logo: ImageData;
  /** Where the logo links to. */
  homeHref: string;
  entries: NavItem[];
  login: NavAction;
  cta: NavAction;
  /** Background of the bar itself. */
  appearance?: Appearance;
};

/* ------------------------------------------------------------------ */
/* footer                                                              */
/* ------------------------------------------------------------------ */

export type FooterLink = { label: string; href: string };

/** A heading with its links. */
export type FooterGroup = { title: string; links: FooterLink[] };

/**
 * A footer column holds one or more groups.
 *
 * The live footer stacks FAQ and Info in a single column, which a flat
 * "column = one heading" model could not reproduce without inventing a sixth
 * column and changing the layout.
 */
export type FooterColumn = { groups: FooterGroup[] };

export const SOCIAL_PLATFORMS = ["facebook", "instagram", "youtube", "linkedin", "x"] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

export type SocialLink = { platform: SocialPlatform; href: string };

export const CONTACT_ICONS = ["phone", "mail", "pin"] as const;
export type ContactIcon = (typeof CONTACT_ICONS)[number];

/** `body` is rich text, so an address can carry its own line breaks. */
export type FooterContactItem = { icon: ContactIcon; title: string; body: string };

export type FooterData = {
  logo: ImageData;
  /** Rich text; the live footer links the company name inside this sentence. */
  blurb: string;
  badge: ImageData;
  social: SocialLink[];
  columns: FooterColumn[];
  contact: { title: string; items: FooterContactItem[] };
  legal: {
    /** Rich text. `{year}` is replaced with the current year at render time. */
    copyright: string;
    links: FooterLink[];
    note: string;
  };
  /** Background of the footer itself. */
  appearance?: Appearance;
};

/* ------------------------------------------------------------------ */
/* document                                                            */
/* ------------------------------------------------------------------ */

export type GlobalsPart = "nav" | "footer";

export type GlobalsDocument = {
  _id?: string;
  nav: NavData;
  footer: FooterData;
  updatedAt?: string;
};

/** Empty item used when an author adds a menu entry. */
export const emptyNavItem = (): NavItem => ({ label: "New item", href: "#", children: [] });

export const emptyFooterLink = (): FooterLink => ({ label: "New link", href: "#" });

export const emptyFooterGroup = (): FooterGroup => ({ title: "New group", links: [] });
