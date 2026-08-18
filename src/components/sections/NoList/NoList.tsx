import Reveal from "@/components/ui/Reveal";
import { richText } from "@/lib/richText";
import type { NoListData } from "@/lib/sections.types";
import styles from "./NoList.module.css";

/** Small ✕ used inside each exclusion pill. */
const CrossIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

/** The big circular mark is a medical PLUS, not a cross. */
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

/** Shipped defaults — see hero.data.tsx for why these exist. */
export const noListDefaults: NoListData = {
  eyebrow: "The Fine Print: There Isn't Any",
  pills: [
    "no deductibles",
    "no copays",
    "no denials",
    "no limits",
    "no surprise bills",
    "no exclusions",
    "no referrals",
    "no risk",
    "no contracts",
    "no ID needed",
  ],
  headline: "no insurance required",
  note: "We are **not** insurance.",
};

export default function NoList({ data = noListDefaults }: { data?: NoListData }) {
  return (
    <section className="section light-alt center" id="fine-print">
      <Reveal className="wrap">
        <div className="sec-eyebrow" data-preview-field="eyebrow">{richText(data.eyebrow)}</div>

        <div className={styles.noGrid} data-preview-field="pills">
          {data.pills.map((item, i) => (
            <span className={styles.noPill} key={item} data-preview-field={`pills.${i}`}>
              <CrossIcon />
              {richText(item)}
            </span>
          ))}
        </div>

        <div className={styles.noHero} data-preview-field="headline">
          <div className={styles.cross}>
            <PlusIcon />
          </div>
          <span>{richText(data.headline)}</span>
        </div>

        <p className={styles.notInsurance} data-preview-field="note">{richText(data.note)}</p>
      </Reveal>
    </section>
  );
}
