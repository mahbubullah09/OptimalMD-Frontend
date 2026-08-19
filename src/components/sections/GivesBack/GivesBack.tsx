import Reveal from "@/components/ui/Reveal";
import { richText } from "@/lib/richText";
import type { GivesBackData } from "@/lib/sections.types";
import { GivesGradientDefs, givesBackDefaults, givesBackIcons } from "./gives.data";
import styles from "./GivesBack.module.css";

/** Bullet marker on the card backs is a plus, not a tick. */
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" strokeLinecap="round" aria-hidden>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export default function GivesBack({ data = givesBackDefaults }: { data?: GivesBackData }) {
  return (
    <section className="section light-alt" id="gives-back">
      <GivesGradientDefs />

      <Reveal className="wrap center">
        <div className="sec-eyebrow" data-preview-field="eyebrow">{richText(data.eyebrow)}</div>
        <h2 className="sec-title" data-preview-field="title">{richText(data.title)}</h2>
        <p className="sec-sub" data-preview-field="subtitle">{richText(data.subtitle)}</p>
      </Reveal>

      <div className={`wrap ${styles.giveGrid}`} data-preview-field="cards">
        {data.cards.map((card, i) => {
          const Icon = givesBackIcons[card.icon];

          return (
            <Reveal className={styles.flip} key={card.title} data-preview-field={`cards.${i}`}>
              <div className={styles.flipInner}>
                <div className={`${styles.flipFace} ${styles.flipFront}`}>
                  <div className={styles.fi} data-preview-field={`cards.${i}.icon`}>
                    {Icon ? <Icon /> : null}
                  </div>
                  <h4 data-preview-field={`cards.${i}.title`}>{richText(card.title)}</h4>
                  <p className={styles.sum} data-preview-field={`cards.${i}.summary`}>
                    {richText(card.summary)}
                  </p>
                </div>

                <div className={`${styles.flipFace} ${styles.flipBack}`}>
                  <h5 data-preview-field={`cards.${i}.backTitle`}>
                    {richText(card.backTitle)}
                  </h5>
                  <ul data-preview-field={`cards.${i}.bullets`}>
                    {card.bullets.map((bullet, b) => (
                      <li key={bullet} data-preview-field={`cards.${i}.bullets.${b}`}>
                        <span className={styles.pl}>
                          <PlusIcon />
                        </span>
                        {richText(bullet)}
                      </li>
                    ))}
                  </ul>
                  <div className={styles.tagline} data-preview-field={`cards.${i}.tagline`}>
                    {richText(card.tagline)}
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
