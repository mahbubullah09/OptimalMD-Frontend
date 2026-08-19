import { getGlobalsForAdmin } from "@/lib/globals";
import GlobalsCanvas from "./GlobalsCanvas";
import "../[slug]/preview.css";

export const metadata = { robots: { index: false, follow: false } };

/**
 * The chrome preview frame. Sits under /admin so the same auth gate applies.
 */
export default async function GlobalsPreviewPage() {
  const { nav, footer } = await getGlobalsForAdmin();
  return <GlobalsCanvas initialNav={nav} initialFooter={footer} />;
}
