import CountUp from "@/components/ui/CountUp";
import Reveal from "@/components/ui/Reveal";
import { richText } from "@/lib/richText";
import { ASSETS } from "@/lib/site";
import type { NetworkData } from "@/lib/sections.types";
import styles from "./Network.module.css";

/**
 * Shipped defaults — see hero.data.tsx for why these exist.
 *
 * The section heading inside the card and the "Contracted with over 70,000
 * pharmacies nationwide" line are part of the logo image itself, so they are
 * deliberately not rendered as text.
 */
export const networkDefaults: NetworkData = {
  eyebrow: "What You Get With OptimalMD",
  title: "National Pharmacy & Laboratory Network",
  logos: {
    src: ASSETS.networkLogos,
    alt: "OptimalMD pharmacy and lab network: CVS Pharmacy, Kroger, Walgreens, Walmart Pharmacy, Costco, Publix, Safeway, Labcorp, Quest Diagnostics",
    title: "OptimalMD pharmacy and laboratory partners",
    description:
      "Logos of the pharmacy and laboratory chains contracted with OptimalMD, including CVS, Kroger, Walgreens, Walmart, Costco, Publix, Safeway, Labcorp and Quest Diagnostics.",
  },
  stats: [
    { value: "70000", suffix: "+", countUp: true, label: "Pharmacies contracted nationwide" },
    { value: "Mail Order", label: "Also available" },
    { value: "Labcorp + Quest", label: "Nationwide lab draw locations" },
  ],
};

export default function Network({ data = networkDefaults }: { data?: NetworkData }) {
  return (
    <section className="section light" id="network">
      <Reveal className="wrap center">
        <div className="sec-eyebrow" data-preview-field="eyebrow">{richText(data.eyebrow)}</div>
        <h2 className="sec-title" data-preview-field="title">{richText(data.title)}</h2>

        <div className={styles.netCard}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.logos}
            data-preview-field="logos"
            src={data.logos.src}
            loading="lazy"
            decoding="async"
            alt={data.logos.alt}
            title={data.logos.title || undefined}
          />

          <div className={styles.netDivider} />

          <div className={styles.netStat} data-preview-field="stats">
            {data.stats.map((stat, i) => {
              // A stat only animates when it is flagged AND parses as a
              // number, so a bad CMS value degrades to plain text.
              const numeric = Number(stat.value);
              const animate = stat.countUp === true && Number.isFinite(numeric);

              return (
                <div key={stat.label} data-preview-field={`stats.${i}`}>
                  <div className={styles.n}>
                    {animate ? (
                      <CountUp to={numeric} suffix={stat.suffix ?? ""} />
                    ) : (
                      richText(`${stat.value}${stat.suffix ?? ""}`)
                    )}
                  </div>
                  <div className={styles.l}>{richText(stat.label)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
