import type { ComponentType } from "react";
import type { CareCoverageData } from "@/lib/sections.types";

/**
 * Shared navy -> bright-blue gradient for every icon in this section.
 * The source HTML repeated an identical <linearGradient> eight times; one
 * definition rendered once and referenced by id does the same job.
 */
export const CARE_GRADIENT_ID = "omdCareGrad";

export const CareGradientDefs = () => (
  <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
    <defs>
      <linearGradient id={CARE_GRADIENT_ID} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#0B2545" />
        <stop offset="1" stopColor="#1FA9E8" />
      </linearGradient>
    </defs>
  </svg>
);

const stroke = `url(#${CARE_GRADIENT_ID})`;

const iconProps = {
  viewBox: "0 0 24 24",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const RxIcon = () => (
  <svg {...iconProps}>
    <g stroke={stroke}>
      <path d="M7 8h10v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" />
      <rect x="6" y="4" width="12" height="4" rx="1" />
      <path d="M12 11.5v5M9.5 14h5" />
    </g>
  </svg>
);

const LabIcon = () => (
  <svg {...iconProps}>
    <g stroke={stroke}>
      <path d="M12 2.7S6 9.5 6 14a6 6 0 0 0 12 0c0-4.5-6-11.3-6-11.3z" />
      <path d="M9 14a3 3 0 0 0 3 3" />
    </g>
  </svg>
);

const DocIcon = () => (
  <svg {...iconProps}>
    <g stroke={stroke}>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M9.5 7v2.5a2.5 2.5 0 0 0 5 0V7" />
      <path d="M12 12v1.5a2.5 2.5 0 0 0 5 0V13" />
      <circle cx="17" cy="11.5" r="1.3" />
    </g>
  </svg>
);

const MentalHealthIcon = () => (
  <svg {...iconProps}>
    <g stroke={stroke}>
      <path d="M12 3a4 4 0 0 0-4 4c0 1-1 2-2 2.5A4 4 0 0 0 7 17a4 4 0 0 0 5 3.5A4 4 0 0 0 17 17a4 4 0 0 0 1-7.5C17 9 16 8 16 7a4 4 0 0 0-4-4z" />
      <path d="M10 11.5c.5-1 1.5-1 2-.3.5-.7 1.5-.7 2 .3.4.9-.6 2-2 3-1.4-1-2.4-2.1-2-3z" />
    </g>
  </svg>
);

/** Pane ids stored in the CMS map to these icons. */
export const carePaneIcons: Record<string, ComponentType> = {
  rx: RxIcon,
  lab: LabIcon,
  doc: DocIcon,
  mh: MentalHealthIcon,
};

/** Shipped defaults — see hero.data.tsx for why these exist. */
export const careCoverageDefaults: CareCoverageData = {
  eyebrow: "What's Covered",
  title: "Comprehensive Care Coverage",
  subtitle:
    "OptimalMD can treat up to **90%** of routine medical needs and **30%** of emergency room conditions.",
  source: "Source: American Medical Association (AMA)",
  panes: [
    {
      id: "rx",
      tabTitle: "Prescriptions",
      tabDetail: "1,100+ meds at $0",
      tag: "Pharmacy Benefit",
      heading: "Prescriptions",
      items: [
        "**1,100+ medications** included ($0)",
        "**3,900+ medications** at $15 or less",
        "Access to all FDA-approved medications",
        "Transfer existing prescriptions and save more",
      ],
    },
    {
      id: "lab",
      tabTitle: "Lab Tests",
      tabDetail: "3,900+ tests at $0",
      tag: "Diagnostics",
      heading: "Lab Tests",
      items: [
        "**3,900+ lab tests** included ($0)",
        "Advanced diagnostic lab tests",
        "Hormone panels, metabolic tests, cancer screening",
        "Micronutrient testing, and more",
      ],
    },
    {
      id: "doc",
      tabTitle: "Doctors",
      tabDetail: "Unlimited $0 visits",
      tag: "Virtual Care",
      heading: "Doctors",
      items: [
        "**Unlimited virtual doctor access** ($0)",
        "Virtual Urgent and Primary Care",
        "Consult with **13 specialists**",
        "Concierge medical services",
      ],
      note: "*In-person visits available via care coordination at reduced rates",
    },
    {
      id: "mh",
      tabTitle: "Mental Health",
      tabDetail: "$0 licensed therapists",
      tag: "Behavioral Health",
      heading: "Mental Health",
      items: [
        "**Licensed behavioral therapists** ($0)",
        "24/7 access to licensed counselors",
        "“Talk Therapy” at no additional cost",
        "Psychology and psychiatry services available*",
      ],
    },
  ],
};
