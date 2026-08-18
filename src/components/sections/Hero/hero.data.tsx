import { ASSETS } from "@/lib/site";
import type { HeroData } from "@/lib/sections.types";

/**
 * Shipped defaults for the hero.
 *
 * Used when the content API is unreachable, and as the base that stored CMS
 * data is merged over. Keep this in sync with the seed in
 * `OMD-Backend/src/scripts/seedHome.ts`.
 *
 * Copy uses the marker syntax documented in `src/lib/richText.tsx`:
 * `**bold**` takes the surrounding column's accent colour, and `\n` is a line
 * break that the stylesheet hides on narrow screens.
 */
export const heroDefaults: HeroData = {
  background: {
    src: ASSETS.heroBackground,
    alt: "",
    title: "",
    description: "Abstract DNA and network artwork behind the hero.",
  },
  left: {
    title: "Healthcare Made",
    titleAccent: "Affordable",
    subtitle:
      "Skip the insurance headaches. Get everyday healthcare with **clear, upfront pricing** and **zero hidden fees**.",
    features: [
      {
        icon: "stethoscope",
        title: "Unlimited Virtual \nDoctor Visits",
        value: "{{#FFFFFF|at}} $0",
      },
      { icon: "imaging", title: "Imaging", value: "Diagnostics" },
      { icon: "medications", title: "1,100+ Medications", value: "{{#FFFFFF|at}} $0" },
      { icon: "mentalHealth", title: "Mental Health", value: "Wellness" },
      { icon: "labTests", title: "3,900+ Lab Tests", value: "{{#FFFFFF|at}} $0" },
      { icon: "aiDoctor", title: "AI Doctor™", value: "Guidance" },
    ],
  },
  right: {
    title: "Health Made",
    titleAccent: "Optimal",
    subtitle:
      "We go beyond basic care to help you **optimize your health** with **advanced tools**, treatments, and concierge support.",
    features: [
      {
        icon: "advancedLab",
        title: "Advanced Lab \nTesting",
        value: "{{#FFFFFF|Included}} at $0",
      },
      { icon: "hormone", title: "Hormone & \nMetabolic Health", value: "Included" },
      { icon: "peptides", title: "GLP-1s & Peptides", value: "Available" },
      { icon: "behavioral", title: "Behavioral Health \nSupport", value: "Included" },
      { icon: "lifestyle", title: "Lifestyle & Wellness", value: "Included" },
      { icon: "concierge", title: "Concierge Care", value: "Included" },
    ],
  },
  membershipCard: {
    lines: ["ONE", "PRIVATE", "HEALTHCARE", "MEMBERSHIP"],
    priceLabel: "All for",
    price: "$149",
    pricePeriod: "/mo",
    disclaimer: "*$149/mo covers up to 7 members",
  },
  bridge:
    "**One private healthcare membership** that lowers the {{blue|cost of everyday care}} while giving your family access to services designed to {{green|improve long-term health}}.",
  ctas: [
    {
      label: "See Plans & Pricing",
      sublabel: "For individuals & families",
      href: "/plans",
      variant: "family",
    },
    {
      label: "Enroll Your Organization",
      sublabel: "For employers & groups",
      href: "/employers",
      variant: "org",
    },
  ],
  link: { label: "See how it works →", href: "#how-it-works" },
  trustItems: [
    "No contracts",
    "Cancel anytime",
    "Instant access",
    "Up to 7 family members",
    "24/7 care access",
    "HIPAA secure & private",
  ],
};
