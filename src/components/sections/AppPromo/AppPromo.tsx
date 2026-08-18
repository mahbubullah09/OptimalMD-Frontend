import Reveal from "@/components/ui/Reveal";
import { richText } from "@/lib/richText";
import { ASSETS } from "@/lib/site";
import type { AppPromoData } from "@/lib/sections.types";
import styles from "./AppPromo.module.css";

/** Shipped defaults — see hero.data.tsx for why these exist. */
export const appPromoDefaults: AppPromoData = {
  eyebrow: "Always With You",
  title: "Concierge healthcare,",
  titleAccent: "at your convenience.",
  subtitle:
    "Make doctor appointments, manage your medications, consult with specialists. From home or away, 24/7. Anytime. Anywhere. Always there.",
  appStoreUrl: "https://apps.apple.com/us/app/optimalmd/id6752685266",
  googlePlayUrl: "https://play.google.com/store/apps/details?id=com.optimalmdapp.app",
  phone: {
    src: ASSETS.appPhone,
    alt: "OptimalMD mobile app home screen showing physician access, pharmacy, and My AI Doctor",
    title: "The OptimalMD app",
    description:
      "The OptimalMD mobile app home screen, showing shortcuts to physician access, the pharmacy benefit and My AI Doctor.",
  },
};

export default function AppPromo({ data = appPromoDefaults }: { data?: AppPromoData }) {
  return (
    <section className="section" id="app">
      <div className={`wrap ${styles.appGrid}`}>
        <Reveal className={styles.appCopy}>
          <div className="sec-eyebrow" data-preview-field="eyebrow">{richText(data.eyebrow)}</div>
          <h2 className="sec-title">
            <span data-preview-field="title">{richText(data.title)}</span>
            <br />
            <span className="gt" data-preview-field="titleAccent">
              {richText(data.titleAccent)}
            </span>
          </h2>
          <p className="sec-sub" data-preview-field="subtitle">{richText(data.subtitle)}</p>

          <div className={styles.storeRow} data-preview-field="appStoreUrl">
            <a href={data.appStoreUrl}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ASSETS.appStoreBadge}
                loading="lazy"
                decoding="async"
                alt="Download OptimalMD on the App Store"
              />
            </a>
            <a href={data.googlePlayUrl}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ASSETS.googlePlayBadge}
                loading="lazy"
                decoding="async"
                alt="Get OptimalMD on Google Play"
              />
            </a>
          </div>
        </Reveal>

        <Reveal className={styles.phoneWrap}>
          <div className={styles.phoneGlow} aria-hidden />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.phoneImg}
            data-preview-field="phone"
            src={data.phone.src}
            loading="lazy"
            decoding="async"
            alt={data.phone.alt}
            title={data.phone.title || undefined}
          />
        </Reveal>
      </div>
    </section>
  );
}
