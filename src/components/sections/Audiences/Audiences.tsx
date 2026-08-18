import Reveal from "@/components/ui/Reveal";
import { richText } from "@/lib/richText";
import type { AudiencesData } from "@/lib/sections.types";
import styles from "./Audiences.module.css";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/** Shipped defaults — see hero.data.tsx for why these exist. */
export const audiencesDefaults: AudiencesData = {
  eyebrow: "Plans For Everyone",
  title: "One Membership. Three Ways In.",
  cards: [
    {
      tag: "For You",
      title: "Individuals & Families",
      body: "Save $5,000–$30,000/year. Cover up to 7 household members. Complete healthcare privacy.",
      amount: "$149",
      per: "/month · up to 7 people",
      href: "https://optimalmd.com/pricing",
      featured: true,
      badge: "Most Popular",
    },
    {
      tag: "For Workers",
      title: "Employees",
      body: "A benefit you actually use, every month. $0 per visit, including unlimited mental health. Completely private.",
      amount: "$0",
      per: "/visit, always",
      href: "https://optimalmd.com/employees",
    },
    {
      tag: "For Business",
      title: "Employers",
      body: "Better benefits than competitors at 70–90% less cost. Attract and retain top talent with healthcare they'll talk about.",
      amount: "$99–149",
      per: "/employee per month",
      href: "https://optimalmd.com/employers",
    },
  ],
};

export default function Audiences({ data = audiencesDefaults }: { data?: AudiencesData }) {
  return (
    <section className="section light-alt" id="audiences">
      <Reveal className="wrap center">
        <div className="sec-eyebrow" data-preview-field="eyebrow">{richText(data.eyebrow)}</div>
        <h2 className="sec-title" data-preview-field="title">{richText(data.title)}</h2>
      </Reveal>

      <div className={`wrap ${styles.audGrid}`} data-preview-field="cards">
        {data.cards.map((aud, i) => (
          <Reveal
            key={aud.title}
            data-preview-field={`cards.${i}`}
            className={`${styles.audCard}${aud.featured ? ` ${styles.featured}` : ""}`}
          >
            {aud.featured && aud.badge ? (
              <div className={styles.featuredBadge} data-preview-field={`cards.${i}.badge`}>
                {richText(aud.badge)}
              </div>
            ) : null}
            <div className={styles.audTag} data-preview-field={`cards.${i}.tag`}>
              {richText(aud.tag)}
            </div>
            <h3 data-preview-field={`cards.${i}.title`}>{richText(aud.title)}</h3>
            <p data-preview-field={`cards.${i}.body`}>{richText(aud.body)}</p>
            <div className={styles.audPrice}>
              <span className={styles.amount} data-preview-field={`cards.${i}.amount`}>
                {richText(aud.amount)}
              </span>
              <span className={styles.per} data-preview-field={`cards.${i}.per`}>
                {richText(aud.per)}
              </span>
            </div>
            <a className={styles.audLink} href={aud.href}>
              Get Started <ArrowIcon />
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
