import Reveal from "@/components/ui/Reveal";
import { richText } from "@/lib/richText";
import type { FinalCtaData } from "@/lib/sections.types";
import styles from "./FinalCta.module.css";

/** Shipped defaults — see hero.data.tsx for why these exist. */
export const finalCtaDefaults: FinalCtaData = {
  eyebrow: "Ready When You Are",
  title: "Let's Get Started!",
  subtitle:
    "All of this and *more* is included in your monthly bundle plan.\nClick the button below for the healthcare you deserve.",
  ctaLabel: "See Monthly Plans",
  ctaHref: "https://optimalmd.com/pricing",
};

export default function FinalCta({ data = finalCtaDefaults }: { data?: FinalCtaData }) {
  return (
    <section className={`section light ${styles.finalCta}`} id="get-started">
      <Reveal className="wrap">
        <div className="sec-eyebrow" data-preview-field="eyebrow">{richText(data.eyebrow)}</div>
        <h2 className="sec-title" data-preview-field="title">{richText(data.title)}</h2>
        <p className="sec-sub" data-preview-field="subtitle">{richText(data.subtitle)}</p>
        <a className={`btn-primary ${styles.cta}`} href={data.ctaHref} data-preview-field="ctaLabel">
          {richText(data.ctaLabel)}
          <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </Reveal>
    </section>
  );
}
