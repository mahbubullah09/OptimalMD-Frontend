import type { SVGProps } from "react";

export type UiIconProps = SVGProps<SVGSVGElement>;

/** Tick used inside the trust-bar bullets. */
export const CheckIcon = (props: UiIconProps) => (
  <svg
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    focusable="false"
    {...props}
  >
    <path
      d="M2 6.2 4.6 8.8 10 3.4"
      stroke="var(--green)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** Household / family glyph for the primary CTA coin. */
export const FamilyIcon = (props: UiIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    focusable="false"
    {...props}
  >
    <path
      d="M3 11.2 12 4l9 7.2"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.4 12.8V19a1 1 0 0 0 1 1h11.2a1 1 0 0 0 1-1v-6.2"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 16.6c-.9-1.1-2.6-1.7-2.6-3a1.5 1.5 0 0 1 2.6-.9 1.5 1.5 0 0 1 2.6.9c0 1.3-1.7 1.9-2.6 3Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

/** Building / organization glyph for the secondary CTA coin. */
export const OrganizationIcon = (props: UiIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    focusable="false"
    {...props}
  >
    <path
      d="M4 20V6.4a1 1 0 0 1 .7-1l7-2.3a1 1 0 0 1 1.3 1V20"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 9.6h6.3a1 1 0 0 1 1 1V20M2.6 20h18.8"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 8.6h2M7 12.2h2M7 15.8h2M16 13.2h1.6M16 16.6h1.6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);
