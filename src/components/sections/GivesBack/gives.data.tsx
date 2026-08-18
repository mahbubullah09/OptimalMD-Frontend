import type { ReactNode } from "react";
import type { GivesBackData } from "@/lib/sections.types";

/**
 * One shared navy -> bright-blue gradient. The source page repeated an
 * identical <linearGradient> per card (gi1…gi4); one definition referenced by
 * id renders the same.
 */
export const GIVES_GRADIENT_ID = "omdGivesGrad";

export const GivesGradientDefs = () => (
  <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
    <defs>
      <linearGradient id={GIVES_GRADIENT_ID} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#0B2545" />
        <stop offset="1" stopColor="#1FA9E8" />
      </linearGradient>
    </defs>
  </svg>
);

const stroke = `url(#${GIVES_GRADIENT_ID})`;

const iconProps = {
  viewBox: "0 0 24 24",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const ControlIcon = () => (
  <svg {...iconProps}>
    <g stroke={stroke}>
      <path d="M4 21v-5M4 12V3M12 21v-9M12 8V3M20 21v-3M20 14V3" />
      <circle cx="4" cy="14" r="2" />
      <circle cx="12" cy="10" r="2" />
      <circle cx="20" cy="16" r="2" />
    </g>
  </svg>
);

const SavingsIcon = () => (
  <svg {...iconProps}>
    <g stroke={stroke}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M15 8.8c-.6-1-1.7-1.3-3-1.3-1.6 0-2.8.8-2.8 2.1 0 2.8 5.8 1.5 5.8 4.3 0 1.4-1.3 2.2-3 2.2-1.4 0-2.6-.5-3.2-1.5" />
    </g>
  </svg>
);

const PeaceIcon = () => (
  <svg {...iconProps}>
    <g stroke={stroke}>
      <path d="M12 21C7.6 17.4 4 14.3 4 10.7A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 8 2.7c0 3.6-3.6 6.7-8 10.3z" />
      <path d="M9.5 12.5L11 14l3.5-3.5" />
    </g>
  </svg>
);

const PossibilitiesIcon = () => (
  <svg {...iconProps}>
    <g stroke={stroke}>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-4 10.5c.8.7 1 1.5 1 2.5h6c0-1 .2-1.8 1-2.5A6 6 0 0 0 12 3z" />
      <path d="M12 8.5v3M10.5 10h3" />
    </g>
  </svg>
);

export const givesBackIcons: Record<string, () => ReactNode> = {
  control: ControlIcon,
  savings: SavingsIcon,
  peace: PeaceIcon,
  possibilities: PossibilitiesIcon,
};

export type GiveCard = {
  icon: string;
  title: string;
  summary: string;
  backTitle: string;
  bullets: string[];
  tagline: string;
};

const cards: GiveCard[] = [
  {
    icon: "control",
    title: "Control",
    summary: "Care on your terms: book, consult, and treat with no gatekeepers.",
    backTitle: "Take charge of your health",
    bullets: [
      "Book appointments on your schedule",
      "Unlimited access to the medications you need",
      "Consult with medical specialists",
    ],
    tagline: "No exclusions, red tape, or delays. Just freedom.",
  },
  {
    icon: "savings",
    title: "Savings",
    summary: "Cut copays, deductibles, and wasted time, thousands back every year.",
    backTitle: "Cut costs and save time",
    bullets: [
      "Transfer high-priced prescriptions",
      "Eliminate copays, deductibles, and fees",
      "Skip crowded waiting rooms and wasted travel",
    ],
    tagline: "Quality care for less cost, quicker than ever.",
  },
  {
    icon: "peace",
    title: "Peace",
    summary: "Your whole family covered in one trusted place, no surprise bills.",
    backTitle: "All your care, one trusted place",
    bullets: [
      "Secure, anytime access to care",
      "Manage everything from one hub",
      "Support for you and your family",
    ],
    tagline: "Relax. We have you covered.",
  },
  {
    icon: "possibilities",
    title: "Possibilities",
    summary: "Personalized care and advanced tools, healthcare without limits.",
    backTitle: "Unlock your best health yet",
    bullets: [
      "Personalize your care and treatment",
      "Your personal private healthcare network",
      "Advanced technology platform",
    ],
    tagline:
      "We help you thrive, not just survive. OptimalMD is healthcare without limits.",
  },
];

/** Shipped defaults — see hero.data.tsx for why these exist. */
export const givesBackDefaults: GivesBackData = {
  eyebrow: "Beyond Medical Benefits",
  title: "Healthcare That Gives Back",
  subtitle: "…it's more than just medical benefits, hover over each card to see how.",
  cards,
};
