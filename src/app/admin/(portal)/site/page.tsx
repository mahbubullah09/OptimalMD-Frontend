import GlobalsWorkspace from "@/components/admin/GlobalsWorkspace";
import { getGlobalsForAdmin } from "@/lib/globals";

export const metadata = { title: "Navigation & footer" };

/**
 * The navbar and footer are site-wide, so they get their own screen rather
 * than living inside a page's section list.
 */
export default async function SiteChromePage() {
  const { nav, footer } = await getGlobalsForAdmin();
  return <GlobalsWorkspace initialNav={nav} initialFooter={footer} />;
}
