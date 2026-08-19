"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

export type NavPage = { slug: string; name: string };

/**
 * Grouped, collapsible navigation.
 *
 * Pages live inside a group rather than as top-level entries: the site will
 * grow well past what a flat list can show, and a sidebar that lists every
 * page on every screen stops being navigable. Groups collapse, remember the
 * current route, and reveal a filter once the list is long enough to need one.
 */

const FILTER_THRESHOLD = 8;

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`navChevron${open ? " isOpen" : ""}`}
      viewBox="0 0 24 24"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

const DashboardIcon = () => (
  <svg className="navIcon" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
    <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
    <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
    <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
  </svg>
);

const PagesIcon = () => (
  <svg className="navIcon" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </svg>
);

const ChromeIcon = () => (
  <svg className="navIcon" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="M3 8.5h18M3 16h18M7 6.2h.01M9.6 6.2h.01" />
  </svg>
);

export default function SidebarNav({ pages }: { pages: NavPage[] }) {
  const pathname = usePathname();
  const inPages = pathname.startsWith("/admin/pages");

  const [openPages, setOpenPages] = useState(inPages);
  const [filter, setFilter] = useState("");

  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(
      (p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
    );
  }, [pages, filter]);

  return (
    <nav className="navRoot" aria-label="Admin sections">
      <Link
        href="/admin"
        className="navLink"
        title="Dashboard"
        aria-current={pathname === "/admin" ? "page" : undefined}
      >
        <DashboardIcon />
        <span className="navText">Dashboard</span>
      </Link>

      <div className="navLabel">Content</div>

      {/* Sits above Pages: the chrome wraps every page, so it reads as the
          outer thing rather than as one more page. */}
      <Link
        href="/admin/site"
        className="navLink"
        title="Navigation &amp; footer"
        aria-current={pathname === "/admin/site" ? "page" : undefined}
      >
        <ChromeIcon />
        <span className="navText">Navigation &amp; footer</span>
      </Link>

      <div className={`navGroup${openPages ? " isOpen" : ""}`}>
        <button
          type="button"
          className={`navLink navGroupHead${inPages ? " isCurrent" : ""}`}
          title="Pages"
          aria-expanded={openPages}
          onClick={() => setOpenPages((v) => !v)}
        >
          <PagesIcon />
          <span className="navText">Pages</span>
          <span className="navCount">{pages.length}</span>
          <Chevron open={openPages} />
        </button>

        {openPages ? (
          <div className="navChildren">
            {pages.length >= FILTER_THRESHOLD ? (
              <input
                className="navFilter"
                value={filter}
                placeholder="Filter pages…"
                aria-label="Filter pages"
                onChange={(e) => setFilter(e.target.value)}
              />
            ) : null}

            {visible.map((page) => {
              const href = `/admin/pages/${page.slug}`;
              return (
                <Link
                  key={page.slug}
                  href={href}
                  className="navChild"
                  aria-current={pathname === href ? "page" : undefined}
                >
                  {page.name}
                </Link>
              );
            })}

            {visible.length === 0 ? (
              <p className="navEmpty">
                {pages.length === 0 ? "No pages yet." : "No pages match that filter."}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </nav>
  );
}
