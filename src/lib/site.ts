/**
 * Single source of truth for organisation details and remote asset URLs.
 *
 * The values under ORG come from the page's Organization JSON-LD and are
 * authoritative. The URLs marked TODO were not present in the supplied source
 * — drop the real CDN URL in and every usage updates at once.
 */

/**
 * Canonical origin used for metadata, structured data and canonical links.
 * Overridable so a demo or preview deployment does not claim to be the
 * production site.
 */
export const SITE_URL =
  process.env.SITE_URL?.replace(/\/+$/, "") || "https://optimalmd.com";

export const ORG = {
  name: "OptimalMD",
  legalName: "OptimalMD Technologies, LLC",
  url: "https://optimalmd.com",
  logo: "https://assets.cdn.filesafe.space/fXZotDuybTTvQxQ4Yxkp/media/6a4b8f1ca97402b00b802a86.png",
  phone: "(855) 378-7700",
  phoneE164: "+1-855-378-7700",
  email: "support@optimalmd.com",
  address: {
    street: "15002 Lakefair Drive",
    suite: "Suite 103",
    city: "Richmond",
    region: "TX",
    postalCode: "77406",
  },
  social: {
    facebook: "https://www.facebook.com/optimalmdrx",
    instagram: "https://www.instagram.com/optimal.md",
    youtube: "https://www.youtube.com/@OptimalMDTech",
  },
} as const;

export const ASSETS = {
  logo: ORG.logo,
  heroBackground:
    "https://assets.cdn.filesafe.space/fXZotDuybTTvQxQ4Yxkp/media/6a4f7734708c41d4df2480e5.png",
  /** Pharmacy + lab partner logo strip. The section heading and the
      "Contracted with over 70,000 pharmacies" line are baked into this
      image — do not repeat them as text. */
  networkLogos:
    "https://assets.cdn.filesafe.space/fXZotDuybTTvQxQ4Yxkp/media/693e5106b4f420a9fe13b5c6.png",
  /** App screenshot mockup used in the Concierge section. */
  appPhone:
    "https://assets.cdn.filesafe.space/fXZotDuybTTvQxQ4Yxkp/media/6a1d5c96d7322952d176f036.webp",
  /** BBB Accredited Business badge. */
  bbbBadge:
    "https://assets.cdn.filesafe.space/fXZotDuybTTvQxQ4Yxkp/media/6a1bc300d53fc25488cfaf4b.png",
  /** Why-OptimalMD card icons. */
  whyIcons: {
    telehealth:
      "https://assets.cdn.filesafe.space/fXZotDuybTTvQxQ4Yxkp/media/6a151ccee05851175c8813b5.svg",
    medications:
      "https://assets.cdn.filesafe.space/fXZotDuybTTvQxQ4Yxkp/media/6a151d7f60ad4b0619388399.svg",
    privacy:
      "https://assets.cdn.filesafe.space/fXZotDuybTTvQxQ4Yxkp/media/6a1ec7e3e2e735bbc360f066.svg",
  },
  /**
   * Store badges are vendored into /public rather than hot-linked: Wikimedia
   * asks not to be used as a CDN, and Apple's marketing toolbox URL is a
   * download endpoint. Both SVGs fill their viewBox edge to edge, so the
   * shared 52px height in AppPromo.module.css renders them consistently.
   */
  appStoreBadge: "/badges/app-store.svg",
  googlePlayBadge: "/badges/google-play.svg",
} as const;
