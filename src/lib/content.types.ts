/**
 * Content shapes and constants shared by server and client code.
 *
 * Kept separate from content.ts because that module is `server-only` — the
 * admin's client components need these types and labels, and importing them
 * from a server-only module would pull the API client into the browser bundle.
 */

export type SectionType =
  | "hero"
  | "careCoverage"
  | "audiences"
  | "network"
  | "noList"
  | "appPromo"
  | "whyOptimalMD"
  | "givesBack"
  | "finalCta";

export type PageSection = {
  key: string;
  type: SectionType;
  order: number;
  enabled: boolean;
  data: Record<string, unknown>;
};

export const WEBPAGE_TYPES = ["WebPage", "AboutPage", "ContactPage", "CollectionPage"] as const;
export type WebPageType = (typeof WEBPAGE_TYPES)[number];

export const TWITTER_CARDS = ["summary", "summary_large_image"] as const;
export type TwitterCard = (typeof TWITTER_CARDS)[number];

/**
 * Structured data is modelled as typed toggles rather than a free-text JSON-LD
 * box, so an editor builds it from a form and the emitted markup is always
 * valid.
 */
export type PageSchema = {
  organization: { enabled: boolean };
  webPage: { enabled: boolean; type: WebPageType };
  faq: { enabled: boolean; items: { question: string; answer: string }[] };
  breadcrumbs: { enabled: boolean; items: { name: string; url: string }[] };
};

export type MetaTag = { name: string; content: string };

export type PageSeo = {
  title?: string;
  author?: string;
  language: string;
  customMeta: MetaTag[];
  description?: string;
  canonical?: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard: TwitterCard;
  noindex: boolean;
  nofollow: boolean;
  structuredData: PageSchema;
};

/** Fills gaps in a page loaded before these fields existed. */
export const withSeoDefaults = (seo: Partial<PageSeo> | undefined): PageSeo => ({
  keywords: [],
  customMeta: [],
  language: "en",
  twitterCard: "summary_large_image",
  noindex: false,
  nofollow: false,
  ...seo,
  structuredData: {
    organization: { enabled: true },
    webPage: { enabled: true, type: "WebPage" },
    faq: { enabled: false, items: [] },
    breadcrumbs: { enabled: false, items: [] },
    ...seo?.structuredData,
  },
});

export type PageDocument = {
  _id: string;
  slug: string;
  name: string;
  seo: PageSeo;
  sections: PageSection[];
  publishedAt?: string;
  updatedAt?: string;
};

export type PageSummary = Pick<PageDocument, "_id" | "slug" | "name" | "seo" | "updatedAt">;

/** Human labels for the section keys stored in Mongo. */
export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Hero",
  careCoverage: "Comprehensive Care Coverage",
  audiences: "One Membership, Three Ways In",
  network: "Pharmacy & Laboratory Network",
  noList: "The Fine Print",
  appPromo: "Concierge App",
  whyOptimalMD: "Why OptimalMD",
  givesBack: "Healthcare That Gives Back",
  finalCta: "Final Call To Action",
};
