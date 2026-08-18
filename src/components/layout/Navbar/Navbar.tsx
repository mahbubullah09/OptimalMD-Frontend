"use client";

import { useState } from "react";
import { ASSETS, ORG } from "@/lib/site";
import {
  hasDropdown,
  isBranch,
  type NavDropdownItem,
  navActions,
  navEntries,
} from "./nav.data";
import styles from "./Navbar.module.css";

const CaretDown = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" aria-hidden>
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
    />
  </svg>
);

const CaretRight = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" aria-hidden>
    <path
      fillRule="evenodd"
      d="M7.21 14.77a.75.75 0 01.02-1.06L11.17 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
    />
  </svg>
);

/** Desktop dropdown row — a link, or a branch that reveals a flyout on hover. */
function DropdownRow({ item }: { item: NavDropdownItem }) {
  if (!isBranch(item)) {
    return (
      <li>
        <a href={item.href} className={styles.dropdownItem}>
          {item.label}
        </a>
      </li>
    );
  }

  return (
    <li className={styles.hasFlyout}>
      <button type="button" className={styles.dropdownItem} aria-haspopup="true">
        {item.label}
        <CaretRight className={styles.caretRight} />
      </button>
      <ul className={`${styles.flyout}${item.flyoutLeft ? ` ${styles.flyoutLeft}` : ""}`}>
        {item.children.map((child) => (
          <li key={child.label}>
            <a href={child.href} className={styles.flyoutItem}>
              {child.label}
            </a>
          </li>
        ))}
      </ul>
    </li>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  /** Labels of the mobile accordions currently expanded. */
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggle = (label: string) =>
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );

  const isOpen = (label: string) => expanded.includes(label);

  return (
    <nav className={styles.nav} aria-label="Main">
      <div className={styles.navInner}>
        <a href={ORG.url} className={styles.logo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ASSETS.logo}
            alt="OptimalMD Logo"
            height={52}
            loading="eager"
            decoding="sync"
            fetchPriority="high"
          />
        </a>

        <ul className={styles.navMenu}>
          {navEntries.map((entry) => (
            <li className={styles.navItem} key={entry.label}>
              {hasDropdown(entry) ? (
                <>
                  <button type="button" className={styles.navLink} aria-haspopup="true">
                    {entry.label}
                    <CaretDown className={styles.caret} />
                  </button>
                  <ul
                    className={`${styles.dropdown}${
                      entry.alignRight ? ` ${styles.dropdownRight}` : ""
                    }`}
                  >
                    {entry.children.map((item) => (
                      <DropdownRow item={item} key={item.label} />
                    ))}
                  </ul>
                </>
              ) : (
                <a href={entry.href} className={styles.navLink}>
                  {entry.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        <div className={styles.navActions}>
          <a href={navActions.login} className={styles.btnLogin}>
            Login
          </a>
          <a href={navActions.getStarted} className={styles.btnEnroll}>
            Get Started
          </a>
        </div>

        <button
          type="button"
          className={`${styles.hamburger}${menuOpen ? ` ${styles.active}` : ""}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* MOBILE MENU */}
      <div id="mobile-menu" className={`${styles.mobileMenu}${menuOpen ? ` ${styles.open}` : ""}`}>
        {navEntries.map((entry) =>
          hasDropdown(entry) ? (
            <div key={entry.label}>
              <button
                type="button"
                className={`${styles.mobItem}${isOpen(entry.label) ? ` ${styles.open}` : ""}`}
                aria-expanded={isOpen(entry.label)}
                onClick={() => toggle(entry.label)}
              >
                {entry.label}
                <CaretDown className={styles.caret} />
              </button>

              <div
                className={`${styles.mobSubmenu}${isOpen(entry.label) ? ` ${styles.open}` : ""}`}
              >
                {entry.children.map((item) =>
                  isBranch(item) ? (
                    <div key={item.label}>
                      <button
                        type="button"
                        className={`${styles.mobSubItem}${
                          isOpen(item.label) ? ` ${styles.open}` : ""
                        }`}
                        aria-expanded={isOpen(item.label)}
                        onClick={() => toggle(item.label)}
                      >
                        {item.label}
                        <CaretDown className={styles.caret} />
                      </button>
                      <div
                        className={`${styles.mobFlyout}${
                          isOpen(item.label) ? ` ${styles.open}` : ""
                        }`}
                      >
                        {item.children.map((child) => (
                          <a href={child.href} className={styles.mobFlyItem} key={child.label}>
                            {child.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <a href={item.href} className={styles.mobSubItem} key={item.label}>
                      {item.label}
                    </a>
                  ),
                )}
              </div>
            </div>
          ) : (
            <a href={entry.href} className={styles.mobItem} key={entry.label}>
              {entry.label}
            </a>
          ),
        )}

        <div className={styles.mobActions}>
          <a href={navActions.login} className={styles.btnLogin}>
            Login
          </a>
          <a href={navActions.getStarted} className={styles.btnEnroll}>
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}
