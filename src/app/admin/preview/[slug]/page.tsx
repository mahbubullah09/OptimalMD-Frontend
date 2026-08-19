import { notFound } from "next/navigation";
import { getSessionToken } from "@/lib/adminSession";
import { getPageForAdmin } from "@/lib/content";
import { getGlobalsForAdmin } from "@/lib/globals";
import PreviewCanvas from "./PreviewCanvas";
import "./preview.css";

export const metadata = { robots: { index: false, follow: false } };

/**
 * The live-preview frame. Sits under /admin so the same auth gate applies —
 * this renders unpublished drafts and must not be publicly reachable.
 */
export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const token = await getSessionToken();

  // The chrome is fetched alongside the page so the canvas shows what a
  // visitor sees, not the sections floating on their own.
  const [page, { nav, footer }] = await Promise.all([
    getPageForAdmin(slug, token ?? ""),
    getGlobalsForAdmin(),
  ]);

  if (!page) notFound();

  return <PreviewCanvas initial={page.sections} nav={nav} footer={footer} />;
}
