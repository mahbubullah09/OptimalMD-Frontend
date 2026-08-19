import Link from "next/link";
import type { ReactElement } from "react";
import type { ContactIcon, FooterData, SocialPlatform } from "@/lib/globals.types";
import { backgroundStyle } from "@/lib/appearance";
import { plainText } from "@/lib/markerParser";
import { richText } from "@/lib/richText";
import { footerDefaults } from "./footer.data";
import styles from "./Footer.module.css";

/** Chevron that prefixes every footer link. */
const LinkChevron = () => (
  <svg
    className={styles.linkChevron}
    viewBox="0 0 24 24"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 16.9v2.6a1.7 1.7 0 0 1-1.9 1.7 17 17 0 0 1-7.4-2.6 16.7 16.7 0 0 1-5.1-5.1A17 17 0 0 1 4 6.1 1.7 1.7 0 0 1 5.7 4.2h2.6a1.7 1.7 0 0 1 1.7 1.5c.1.8.3 1.6.6 2.4a1.7 1.7 0 0 1-.4 1.8l-1.1 1.1a13.6 13.6 0 0 0 5.1 5.1l1.1-1.1a1.7 1.7 0 0 1 1.8-.4c.8.3 1.6.5 2.4.6a1.7 1.7 0 0 1 1.5 1.7Z" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 10.4c0 5.6-8 12.1-8 12.1s-8-6.5-8-12.1a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10.2" r="2.8" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H5.5v4H8v7h4v-7h2.7l.8-4H12V7.7c0-.6.4-1 1-1h2z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" />
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
    <path d="m10.5 9.3 4.6 2.7-4.6 2.7z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <path d="M7.5 10.5v6M7.5 7.6v.1M11.5 16.5v-6M11.5 13a2.5 2.5 0 0 1 5 0v3.5" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m4 4 16 16M20 4 4 20" />
  </svg>
);

/** Icon sets are lookups so the platforms and contact rows stay data-driven. */
const SOCIAL_ICONS: Record<SocialPlatform, () => ReactElement> = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  linkedin: LinkedInIcon,
  x: XIcon,
};

const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  x: "X",
};

const CONTACT_GLYPHS: Record<ContactIcon, () => ReactElement> = {
  phone: PhoneIcon,
  mail: MailIcon,
  pin: PinIcon,
};

export default function Footer({ data = footerDefaults }: { data?: FooterData }) {
  const { logo, blurb, badge, social, columns, contact, legal, appearance } = data;
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} style={backgroundStyle(appearance)}>
      <div className={styles.footWrap}>
        <div className={styles.footTop}>
          <div className={styles.ftLeft}>
            <Link href="/" aria-label="Home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.logoImg}
                src={logo.src}
                alt={plainText(logo.alt)}
                title={logo.title || undefined}
                data-preview-field="footer.logo"
                style={{
                  ...(logo.width ? { width: logo.width } : {}),
                  ...(logo.height ? { height: logo.height } : {}),
                }}
              />
            </Link>

            <p data-preview-field="footer.blurb">{richText(blurb)}</p>

            {badge.src ? (
              <a href="https://www.bbb.org/" aria-label="BBB Business Review">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={styles.bbbImg}
                  src={badge.src}
                  loading="lazy"
                  decoding="async"
                  alt={plainText(badge.alt)}
                  title={badge.title || undefined}
                  data-preview-field="footer.badge"
                  style={{
                    ...(badge.width ? { width: badge.width } : {}),
                    ...(badge.height ? { height: badge.height } : {}),
                  }}
                />
              </a>
            ) : null}

            <div className={styles.socials}>
              {social.map((item, socialIndex) => {
                const Icon = SOCIAL_ICONS[item.platform];
                if (!Icon) return null;
                return (
                  <a
                    href={item.href}
                    key={item.platform}
                    data-preview-field={`footer.social.${socialIndex}`}
                    aria-label={`OptimalMD on ${SOCIAL_LABELS[item.platform]}`}
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          {columns.map((column, columnIndex) => (
            // Columns have no natural id; their position is their identity.
            <div className={styles.footCol} key={columnIndex}>
              {column.groups.map((group, groupIndex) => (
                <div key={group.title || groupIndex}>
                  {/* The live footer stacks a second heading in one column, so
                      only the first group in a column sits flush to the top. */}
                  <h5
                    className={groupIndex > 0 ? styles.stacked : undefined}
                    data-preview-field={`footer.columns.${columnIndex}.groups.${groupIndex}.title`}
                  >
                    {richText(group.title)}
                  </h5>
                  <div className={styles.links}>
                    {group.links.map((link, linkIndex) => (
                      <a
                        href={link.href}
                        key={link.label}
                        data-preview-field={`footer.columns.${columnIndex}.groups.${groupIndex}.links.${linkIndex}.label`}
                      >
                        <LinkChevron />
                        {richText(link.label)}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div className={styles.footCol}>
            <h5 data-preview-field="footer.contact.title">{richText(contact.title)}</h5>

            {contact.items.map((item, contactIndex) => {
              const Glyph = CONTACT_GLYPHS[item.icon] ?? CONTACT_GLYPHS.pin;
              return (
                <div
                  className={styles.contactItem}
                  key={item.title}
                  data-preview-field={`footer.contact.items.${contactIndex}.title`}
                >
                  <span className={styles.ci}>
                    <Glyph />
                  </span>
                  <span>
                    <b>{richText(item.title)}</b>
                    <small>{richText(item.body)}</small>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* The live footer has no legal bar, but the supplied CSS styles one
            (.foot-bottom / .fb-links / .not-ins), so it is rendered here. */}
        <div className={styles.footBottom}>
          <span data-preview-field="footer.legal.copyright">
            {richText(legal.copyright.replace("{year}", String(year)))}
          </span>
          <div className={styles.fbLinks}>
            {legal.links.map((link, linkIndex) => (
              <a
                href={link.href}
                key={link.label}
                data-preview-field={`footer.legal.links.${linkIndex}.label`}
              >
                {richText(link.label)}
              </a>
            ))}
          </div>
          <span className={styles.notIns} data-preview-field="footer.legal.note">
            {richText(legal.note)}
          </span>
        </div>
      </div>
    </footer>
  );
}
