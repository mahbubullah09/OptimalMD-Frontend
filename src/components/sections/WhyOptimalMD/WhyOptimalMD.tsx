import Reveal from "@/components/ui/Reveal";
import { richText } from "@/lib/richText";
import { ASSETS } from "@/lib/site";
import type { WhyOptimalMDData } from "@/lib/sections.types";
import styles from "./WhyOptimalMD.module.css";

/** Shipped defaults — see hero.data.tsx for why these exist. */
export const whyOptimalMDDefaults: WhyOptimalMDData = {
  eyebrow: "Why OptimalMD",
  title: "Real Healthcare. Not a Discount Card.",
  cards: [
    {
      icon: {
        src: ASSETS.whyIcons.telehealth,
        alt: "Telehealth icon",
        title: "Unlimited telehealth",
        description: "Icon representing unlimited $0 virtual doctor visits.",
      },
      stat: "$0",
      title: "Unlimited Telehealth",
      body: "Save $5,000–$30,000/year. Cover up to 7 household members. Complete healthcare privacy.",
    },
    {
      icon: {
        src: ASSETS.whyIcons.medications,
        alt: "Medications and lab tests icon",
        title: "Medications and lab tests",
        description: "Icon representing $0 medications and diagnostic lab tests.",
      },
      stat: "$0",
      title: "Medications and Lab Tests",
      body: "1,100+ generics at 70,000+ pharmacies. Plus 3,900+ Labcorp diagnostic tests. No prior auth, no formulary battles.",
    },
    {
      icon: {
        src: ASSETS.whyIcons.privacy,
        alt: "Privacy lock icon",
        title: "No MIB reporting",
        description: "Icon representing healthcare privacy outside the insurance ecosystem.",
      },
      stat: "Never",
      title: "No MIB Reporting",
      body: "OptimalMD operates outside the insurance ecosystem. Your visits and diagnoses never enter the MIB database.",
    },
  ],
};

export default function WhyOptimalMD({
  data = whyOptimalMDDefaults,
}: {
  data?: WhyOptimalMDData;
}) {
  return (
    <section className="section light" id="why">
      <Reveal className="wrap center">
        <div className="sec-eyebrow" data-preview-field="eyebrow">{richText(data.eyebrow)}</div>
        <h2 className="sec-title" data-preview-field="title">{richText(data.title)}</h2>
      </Reveal>

      <div className={`wrap ${styles.whyGrid}`} data-preview-field="cards">
        {data.cards.map((card, i) => (
          <Reveal
            className={styles.whyCard}
            key={card.title}
            data-preview-field={`cards.${i}`}
          >
            <div className={styles.whyTop} data-preview-field={`cards.${i}.icon`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.whyIcon}
                src={card.icon.src}
                loading="lazy"
                decoding="async"
                alt={card.icon.alt}
                title={card.icon.title || undefined}
              />
              <div className={styles.stat} data-preview-field={`cards.${i}.stat`}>
                {richText(card.stat)}
              </div>
            </div>
            <div className={styles.whyBody}>
              <h4 data-preview-field={`cards.${i}.title`}>{richText(card.title)}</h4>
              <p data-preview-field={`cards.${i}.body`}>{richText(card.body)}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
