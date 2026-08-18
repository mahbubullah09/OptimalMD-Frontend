import { notFound } from "next/navigation";
import PageWorkspace from "@/components/admin/PageWorkspace";
import { getSessionToken } from "@/lib/adminSession";
import { getPageForAdmin } from "@/lib/content";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `Editing ${slug}` };
}

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const token = await getSessionToken();
  const page = await getPageForAdmin(slug, token ?? "");

  if (!page) notFound();

  return <PageWorkspace page={page} />;
}
