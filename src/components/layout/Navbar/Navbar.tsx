"use client";

import { useState } from "react";
import { backgroundStyle, buttonStyle } from "@/lib/appearance";
import type { NavData, NavItem } from "@/lib/globals.types";
import { plainText } from "@/lib/markerParser";
import { richText } from "@/lib/richText";
import { navDefaults } from "./nav.data";
import styles from "./Navbar.module.css";

/** An item with children is a menu; without them it is a link. */
const hasChildren = (item: NavItem) => item.children.length > 0;

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
function DropdownRow({ item, path }: { item: NavItem; path: string }) {
  if (!hasChildren(item)) {
    return (
      <li>
        <a href={item.href} className={styles.dropdownItem} data-preview-field={`${path}.label`}>
          {richText(item.label)}
        </a>
      </li>
    );
  }

  return (
    <li className={styles.hasFlyout}>
      <button
        type="button"
        className={styles.dropdownItem}
        aria-haspopup="true"
        data-preview-field={`${path}.label`}
      >
        {richText(item.label)}
        <CaretRight className={styles.caretRight} />
      </button>
      <ul className={`${styles.flyout}${item.flyoutLeft ? ` ${styles.flyoutLeft}` : ""}`}>
        {item.children.map((child, childIndex) => (
          <li key={child.label}>
            <a
              href={child.href}
              className={styles.flyoutItem}
              data-preview-field={`${path}.children.${childIndex}.label`}
            >
              {richText(child.label)}
            </a>
          </li>
        ))}
      </ul>
    </li>
  );
}

export default function Navbar({ data = navDefaults }: { data?: NavData }) {
  const { logo, homeHref, entries, login, cta, appearance } = data;
  const [menuOpen, setMenuOpen] = useState(false);
  /** Labels of the mobile accordions currently expanded. */
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggle = (label: string) =>
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );

  const isOpen = (label: string) => expanded.includes(label);

  return (
    <nav className={styles.nav} aria-label="Main" style={backgroundStyle(appearance)}>
      <div className={styles.navInner}>
        <a href={homeHref} className={styles.logo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo.src}
            alt={plainText(logo.alt)}
            title={logo.title || undefined}
            data-preview-field="nav.logo"
            style={{
              height: logo.height ?? 52,
              ...(logo.width ? { width: logo.width } : {}),
            }}
            loading="eager"
            decoding="sync"
            fetchPriority="high"
          />
        </a>

        <ul className={styles.navMenu}>
          {entries.map((entry, entryIndex) => (
            <li className={styles.navItem} key={entry.label}>
              {hasChildren(entry) ? (
                <>
                  <button
                    type="button"
                    className={styles.navLink}
                    aria-haspopup="true"
                    data-preview-field={`nav.entries.${entryIndex}.label`}
                  >
                    {richText(entry.label)}
                    <CaretDown className={styles.caret} />
                  </button>
                  <ul
                    className={`${styles.dropdown}${
                      entry.alignRight ? ` ${styles.dropdownRight}` : ""
                    }`}
                  >
                    {entry.children.map((item, itemIndex) => (
                      <DropdownRow
                        item={item}
                        path={`nav.entries.${entryIndex}.children.${itemIndex}`}
                        key={item.label}
                      />
                    ))}
                  </ul>
                </>
              ) : (
                <a
                  href={entry.href}
                  className={styles.navLink}
                  data-preview-field={`nav.entries.${entryIndex}.label`}
                >
                  {richText(entry.label)}
                </a>
              )}
            </li>
          ))}
        </ul>

        <div className={styles.navActions}>
          <a
            href={login.href}
            className={styles.btnLogin}
            data-preview-field="nav.login.label"
            style={buttonStyle(login.appearance)}
          >
            {richText(login.label)}
          </a>
          <a
            href={cta.href}
            className={styles.btnEnroll}
            data-preview-field="nav.cta.label"
            style={buttonStyle(cta.appearance)}
          >
            {richText(cta.label)}
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
        {entries.map((entry) =>
          hasChildren(entry) ? (
            <div key={entry.label}>
              <button
                type="button"
                className={`${styles.mobItem}${isOpen(entry.label) ? ` ${styles.open}` : ""}`}
                aria-expanded={isOpen(entry.label)}
                onClick={() => toggle(entry.label)}
              >
                {richText(entry.label)}
                <CaretDown className={styles.caret} />
              </button>

              <div
                className={`${styles.mobSubmenu}${isOpen(entry.label) ? ` ${styles.open}` : ""}`}
              >
                {entry.children.map((item) =>
                  hasChildren(item) ? (
                    <div key={item.label}>
                      <button
                        type="button"
                        className={`${styles.mobSubItem}${
                          isOpen(item.label) ? ` ${styles.open}` : ""
                        }`}
                        aria-expanded={isOpen(item.label)}
                        onClick={() => toggle(item.label)}
                      >
                        {richText(item.label)}
                        <CaretDown className={styles.caret} />
                      </button>
                      <div
                        className={`${styles.mobFlyout}${
                          isOpen(item.label) ? ` ${styles.open}` : ""
                        }`}
                      >
                        {item.children.map((child) => (
                          <a href={child.href} className={styles.mobFlyItem} key={child.label}>
                            {richText(child.label)}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <a href={item.href} className={styles.mobSubItem} key={item.label}>
                      {richText(item.label)}
                    </a>
                  ),
                )}
              </div>
            </div>
          ) : (
            <a href={entry.href} className={styles.mobItem} key={entry.label}>
              {richText(entry.label)}
            </a>
          ),
        )}

        <div className={styles.mobActions}>
          <a href={login.href} className={styles.btnLogin} style={buttonStyle(login.appearance)}>
            {richText(login.label)}
          </a>
          <a href={cta.href} className={styles.btnEnroll} style={buttonStyle(cta.appearance)}>
            {richText(cta.label)}
          </a>
        </div>
      </div>
    </nav>
  );
}
