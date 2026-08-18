import { ASSETS, ORG } from "@/lib/site";
import { aboutLinks, faqLinks, infoLinks, whatsIncludedLinks } from "./footer.data";
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

export default function Footer() {
  const year = new Date().getFullYear();
  const { street, suite, city, region, postalCode } = ORG.address;
  const telHref = `tel:${ORG.phoneE164.replace(/[^+\d]/g, "")}`;

  return (
    <footer className={styles.footer}>
      <div className={styles.footWrap}>
        <div className={styles.footTop}>
          <div className={styles.ftLeft}>
            <a href={ORG.url} aria-label={`${ORG.name} home`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.logoImg} src={ASSETS.logo} alt={ORG.name} />
            </a>

            <p>
              <a href={ORG.url}>OptimalMD</a> empowers everyone to live their healthiest lives,
              regardless of financial or insurance status.
            </p>

            <a href="https://www.bbb.org/" aria-label="BBB Business Review">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.bbbImg}
                src={ASSETS.bbbBadge}
                loading="lazy"
                decoding="async"
                alt="OptimalMD Technologies, LLC BBB Business Review"
              />
            </a>

            <div className={styles.socials}>
              <a href={ORG.social.facebook} aria-label="OptimalMD on Facebook">
                <FacebookIcon />
              </a>
              <a href={ORG.social.instagram} aria-label="OptimalMD on Instagram">
                <InstagramIcon />
              </a>
              <a href={ORG.social.youtube} aria-label="OptimalMD on YouTube">
                <YoutubeIcon />
              </a>
            </div>
          </div>

          <div className={styles.footCol}>
            <h5>What&apos;s Included</h5>
            <div className={styles.links}>
              {whatsIncludedLinks.map((link) => (
                <a href={link.href} key={link.label}>
                  <LinkChevron />
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className={styles.footCol}>
            <h5>FAQ</h5>
            <div className={styles.links}>
              {faqLinks.map((link) => (
                <a href={link.href} key={link.label}>
                  <LinkChevron />
                  {link.label}
                </a>
              ))}
            </div>

            <h5 className={styles.stacked}>Info</h5>
            <div className={styles.links}>
              {infoLinks.map((link) => (
                <a href={link.href} key={link.label}>
                  <LinkChevron />
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className={styles.footCol}>
            <h5>About</h5>
            <div className={styles.links}>
              {aboutLinks.map((link) => (
                <a href={link.href} key={link.label}>
                  <LinkChevron />
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className={styles.footCol}>
            <h5>Contact Us</h5>

            <div className={styles.contactItem}>
              <span className={styles.ci}>
                <PhoneIcon />
              </span>
              <span>
                <b>Phone Support</b>
                <small>
                  Toll Free: <a href={telHref}>{ORG.phone}</a>
                </small>
              </span>
            </div>

            <div className={styles.contactItem}>
              <span className={styles.ci}>
                <MailIcon />
              </span>
              <span>
                <b>Email Us</b>
                <small>
                  <a href={`mailto:${ORG.email}`}>{ORG.email}</a>
                </small>
              </span>
            </div>

            <div className={styles.contactItem}>
              <span className={styles.ci}>
                <PinIcon />
              </span>
              <span>
                <b>Corporate Office</b>
                <small>
                  {street}
                  <br />
                  {suite}
                  <br />
                  {city}, {region} {postalCode}
                  <br />
                  Phone: <a href={telHref}>{ORG.phone}</a>
                </small>
              </span>
            </div>
          </div>
        </div>

        {/* The live footer has no legal bar, but the supplied CSS styles one
            (.foot-bottom / .fb-links / .not-ins), so it is rendered here. */}
        <div className={styles.footBottom}>
          <span>
            © {year} {ORG.legalName}. All rights reserved.
          </span>
          <div className={styles.fbLinks}>
            {infoLinks.map((link) => (
              <a href={link.href} key={link.label}>
                {link.label}
              </a>
            ))}
          </div>
          <span className={styles.notIns}>OptimalMD is not insurance.</span>
        </div>
      </div>
    </footer>
  );
}
