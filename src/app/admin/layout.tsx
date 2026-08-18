import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · OptimalMD Admin" },
  // Belt and braces: the portal is behind auth, but never let it be indexed.
  robots: { index: false, follow: false },
};

/**
 * Deliberately a pass-through.
 *
 * The admin's stylesheet and its `.adminRoot` wrapper live in the (portal)
 * and login layouts instead, because /admin/preview renders the *marketing*
 * page — inheriting `.adminRoot h1 { color: … }` here repainted the hero
 * headings dark navy on a dark background.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
