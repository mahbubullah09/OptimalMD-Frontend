import { redirect } from "next/navigation";
import Link from "next/link";
import "../admin.css";
import { getCurrentAdmin, getSessionToken } from "@/lib/adminSession";
import { listPages } from "@/lib/content";
import { ASSETS, ORG } from "@/lib/site";
import LogoutButton from "./LogoutButton";
import SidebarNav, { type NavPage } from "./SidebarNav";

/**
 * Chrome for every signed-in admin page.
 *
 * This is the real authorization gate: the edge proxy only checks that a
 * cookie exists, whereas /auth/me here verifies the token against the backend
 * and confirms the account is still active.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();

  if (!admin) redirect("/admin/login");

  // The nav lists real pages, so it stays correct as pages are added. A failed
  // fetch must not take the whole portal down — the nav just shows none.
  const token = await getSessionToken();
  let pages: NavPage[] = [];
  try {
    pages = (await listPages(token ?? "")).map((p) => ({ slug: p.slug, name: p.name }));
  } catch {
    pages = [];
  }

  const initials = admin.name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="adminRoot">
      <div className="shell">
        <aside className="sidebar">
          <Link href="/admin" className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brandLogo" src={ASSETS.logo} alt={ORG.name} />
          </Link>

          <SidebarNav pages={pages} />

          <div className="sidebarFoot">
            <div className="who">
              <span className="whoAvatar" aria-hidden>
                {initials || "?"}
              </span>
              <span className="whoText">
                <b>{admin.name}</b>
                <span>{admin.email}</span>
              </span>
            </div>
            <LogoutButton />
          </div>
        </aside>

        <main className="main">{children}</main>
      </div>
    </div>
  );
}
