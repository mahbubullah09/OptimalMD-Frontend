"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";

/**
 * The portal shell, with a sidebar that can shrink to an icon rail.
 *
 * On the builder screens the rail is the default. Those screens already spend
 * their width on three panes, and on a laptop a 264px navigation column is the
 * difference between a canvas you can judge and a thumbnail — the navigation
 * is not what you are looking at while editing a page.
 *
 * A manual choice wins over that default and then sticks, so anyone who wants
 * the labels back keeps them.
 */

const isBuilderRoute = (pathname: string) =>
  pathname.startsWith("/admin/pages/") || pathname === "/admin/site";

const ChevronsIcon = ({ collapsed }: { collapsed: boolean }) => (
  <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {collapsed ? <path d="m9 6 6 6-6 6" /> : <path d="m15 6-6 6 6 6" />}
  </svg>
);

export default function AdminShell({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();

  // Null means "follow the route"; a boolean is a choice that has been made.
  const [manual, setManual] = useState<boolean | null>(null);
  const collapsed = manual ?? isBuilderRoute(pathname);

  return (
    <div className={`shell${collapsed ? " isRail" : ""}`}>
      <aside className="sidebar">
        {sidebar}

        <button
          type="button"
          className="sidebarToggle"
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          aria-expanded={!collapsed}
          title={collapsed ? "Expand navigation" : "Collapse navigation"}
          onClick={() => setManual(!collapsed)}
        >
          <ChevronsIcon collapsed={collapsed} />
        </button>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}
