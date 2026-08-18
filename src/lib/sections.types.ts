/**
 * Shape of each section's `data` blob as stored in MongoDB.
 *
 * These mirror what `OMD-Backend/src/scripts/seedHome.ts` writes. The backend
 * stores `data` as Mixed, so this file is the contract between the two —
 * change it here and in the seed together.
 *
 * Every section component also ships a `defaults` object of this same shape,
 * used when the API is unreachable so the site never renders empty.
 */

/**
 * One shape for every image on the site.
 *
 * Alt, title and description travel with the source rather than living in
 * separate fields, because an image and the text describing it are a single
 * decision — splitting them is how images end up shipped with empty alt
 * attributes. Description feeds schema.org ImageObject.
 */
export type ImageData = {
  src: string;
  alt: string;
  title?: string;
  description?: string;
};

export type HeroFeatureData = {
  /** Key into the hero icon registry. */
  icon: string;
  title: string;
  /**
   * Single rich value line. Defaults to the column's accent colour; wrap a
   * word in white to get the old "at $0" treatment.
   */
  value: string;
};

export type HeroSideData = {
  title: string;
  titleAccent: string;
  subtitle: string;
  features: HeroFeatureData[];
};

export type HeroData = {
  /** Full-bleed backdrop behind the hero, layered under the colour washes. */
  background: ImageData;
  left: HeroSideData;
  right: HeroSideData;
  membershipCard: {
    lines: string[];
    priceLabel: string;
    price: string;
    pricePeriod: string;
    disclaimer: string;
  };
  bridge: string;
  ctas: {
    label: string;
    sublabel?: string;
    href: string;
    variant: "family" | "org";
  }[];
  link: { label: string; href: string };
  trustItems: string[];
};

export type CarePaneData = {
  /** Key into the care icon registry. */
  id: string;
  tabTitle: string;
  tabDetail: string;
  tag: string;
  heading: string;
  items: string[];
  note?: string;
};

export type CareCoverageData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  source?: string;
  panes: CarePaneData[];
};

export type AudiencesData = {
  eyebrow: string;
  title: string;
  cards: {
    tag: string;
    title: string;
    body: string;
    amount: string;
    per: string;
    href: string;
    featured?: boolean;
    badge?: string;
  }[];
};

export type NetworkData = {
  eyebrow: string;
  title: string;
  logos: ImageData;
  stats: {
    value: string;
    suffix?: string;
    /** When true, `value` is parsed as a number and animated from zero. */
    countUp?: boolean;
    label: string;
  }[];
};

export type NoListData = {
  eyebrow: string;
  pills: string[];
  headline: string;
  note: string;
};

export type AppPromoData = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  appStoreUrl: string;
  googlePlayUrl: string;
  phone: ImageData;
};

export type WhyOptimalMDData = {
  eyebrow: string;
  title: string;
  cards: {
    icon: ImageData;
    stat: string;
    title: string;
    body: string;
  }[];
};

export type GivesBackData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cards: {
    /** Key into the gives-back icon registry. */
    icon: string;
    title: string;
    summary: string;
    backTitle: string;
    bullets: string[];
    tagline: string;
  }[];
};

export type FinalCtaData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
};
