import Link from "next/link";
import { heroFeatureIcons } from "@/components/icons/registry";
import { CheckIcon, FamilyIcon, OrganizationIcon } from "@/components/icons/UiIcons";
import { richText } from "@/lib/richText";
import type { HeroFeatureData, HeroSideData } from "@/lib/sections.types";
import type { HeroData } from "@/lib/sections.types";
import { heroDefaults } from "./hero.data";
import styles from "./Hero.module.css";

function FeatureList({
  features,
  variant,
}: {
  features: HeroFeatureData[];
  variant: "left" | "right";
}) {
  return (
    <div className={styles.features} data-preview-field={`${variant}.features`}>
      {features.map((feature, i) => {
        const Icon = heroFeatureIcons[feature.icon];

        return (
          <div
            className={styles.feat}
            key={`${feature.icon}-${i}`}
            data-preview-field={`${variant}.features.${i}`}
          >
            <div
              className={styles.featIcon}
              data-preview-field={`${variant}.features.${i}.icon`}
            >
              {Icon ? <Icon /> : null}
            </div>
            <div className={styles.featText}>
              <div className={styles.t1} data-preview-field={`${variant}.features.${i}.title`}>
                {richText(feature.title)}
              </div>
              <div className={styles.t2} data-preview-field={`${variant}.features.${i}.value`}>
                {richText(feature.value)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HeroSide({
  side,
  variant,
  children,
}: {
  side: HeroSideData;
  variant: "left" | "right";
  children?: React.ReactNode;
}) {
  const accentClass = variant === "left" ? styles.blue : styles.green;

  return (
    <div className={`${styles.side} ${variant === "left" ? styles.left : styles.right}`}>
      {children}
      <h1 className={styles.heroTitle} data-preview-field={`${variant}.title`}>
        {richText(side.title)}
        <br /> <span className={accentClass} data-preview-field={`${variant}.titleAccent`}>
          {richText(side.titleAccent)}
        </span>
      </h1>
      <p className={styles.heroSub} data-preview-field={`${variant}.subtitle`}>
        {richText(side.subtitle)}
      </p>
      <FeatureList features={side.features} variant={variant} />
    </div>
  );
}

export default function Hero({ data = heroDefaults }: { data?: HeroData }) {
  const { background, left, right, membershipCard, bridge, ctas, link, trustItems } = data;

  // Quotes are escaped so a stray one in a URL cannot break out of the value.
  const backdrop = background?.src
    ? { "--hero-bg": `url("${background.src.replace(/"/g, "%22")}")` }
    : undefined;

  return (
    <div
      className={styles.wrap}
      style={backdrop as React.CSSProperties}
      data-preview-field="background"
    >
      <div className={styles.content}>
        <section className={styles.hero}>
          <HeroSide side={left} variant="left" />

          {/* ---------- CENTRE DIVIDER ---------- */}
          <div className={styles.divider}>
            <div className={styles.dividerPill} data-preview-field="membershipCard">
              {membershipCard.lines.map((line, i) => (
                <span key={line}>
                  {richText(line)}
                  {i < membershipCard.lines.length - 1 ? <br /> : null}
                </span>
              ))}
              <div className={styles.pillPrice}>
                {richText(membershipCard.priceLabel)}{" "}
                <span className={styles.price}>{richText(membershipCard.price)}</span>
                {richText(membershipCard.pricePeriod)}
              </div>
              <div className={styles.pillDisclaimer}>{richText(membershipCard.disclaimer)}</div>
            </div>
          </div>

          <HeroSide side={right} variant="right" />

          <p className={styles.heroBridge} data-preview-field="bridge">
            {richText(bridge)}
          </p>

          <div className={styles.ctaRow} data-preview-field="ctas">
            {ctas.map((cta, i) => (
              <Link
                key={cta.href}
                href={cta.href}
                data-preview-field={`ctas.${i}`}
                className={`${styles.ctaBtn} ${
                  cta.variant === "org" ? styles.ctaOrg : styles.ctaFam
                }`}
              >
                <span className={styles.ico}>
                  {cta.variant === "org" ? <OrganizationIcon /> : <FamilyIcon />}
                </span>
                <span className={styles.ctaBtnText}>
                  {richText(cta.label)}
                  {cta.sublabel ? <span className={styles.ctaSub}>{richText(cta.sublabel)}</span> : null}
                </span>
              </Link>
            ))}
          </div>

          <Link href={link.href} className={styles.ctaLink}>
            {richText(link.label)}
          </Link>
        </section>

        <ul className={styles.trust} data-preview-field="trustItems">
          {trustItems.map((item, i) => (
            <li className={styles.trustItem} key={item} data-preview-field={`trustItems.${i}`}>
              <span className={styles.check}>
                <CheckIcon />
              </span>
              {richText(item)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
