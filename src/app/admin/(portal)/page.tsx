import Link from "next/link";
import { getCurrentAdmin, getSessionToken } from "@/lib/adminSession";
import { ApiRequestError } from "@/lib/api";
import { listPages } from "@/lib/content";
import { withSeoDefaults } from "@/lib/content.types";

export const metadata = { title: "Dashboard" };

const SEO_LIMITS = { title: 60, description: 160 };

export default async function DashboardPage() {
  const token = await getSessionToken();
  const admin = await getCurrentAdmin();

  let pages: Awaited<ReturnType<typeof listPages>> = [];
  let error: string | null = null;

  try {
    pages = await listPages(token ?? "");
  } catch (err) {
    // Report what the API actually said. The old message named a local port,
    // which is misleading once this points at a deployed backend — and the
    // backend now names the environment variables it is missing.
    error =
      err instanceof ApiRequestError
        ? `Could not load pages: ${err.message}`
        : "Could not load pages. The content API did not respond.";
  }

  /**
   * Every figure below is derived from the pages actually returned by the API.
   * Nothing here is a placeholder — a dashboard that shows invented numbers is
   * worse than one that shows none.
   */
  const withSeo = pages.map((page) => ({ ...page, seo: withSeoDefaults(page.seo) }));

  const indexed = withSeo.filter((p) => !p.seo.noindex).length;

  const needsAttention = withSeo.filter((p) => {
    const { title = "", description = "" } = p.seo;
    return (
      !title ||
      !description ||
      title.length > SEO_LIMITS.title ||
      description.length > SEO_LIMITS.description
    );
  });

  const lastUpdated = withSeo
    .map((p) => p.updatedAt)
    .filter(Boolean)
    .sort()
    .at(-1);

  const firstName = admin?.name.split(" ")[0] ?? "there";

  const stats = [
    { label: "Pages", value: String(pages.length), hint: "Editable in the CMS" },
    { label: "Indexed", value: `${indexed}/${pages.length}`, hint: "Visible to search engines" },
    {
      label: "Need attention",
      value: String(needsAttention.length),
      hint: "Missing or over-long SEO text",
      tone: needsAttention.length > 0 ? ("warn" as const) : ("ok" as const),
    },
    {
      label: "Last saved",
      value: lastUpdated ? new Date(lastUpdated).toLocaleDateString() : "—",
      hint: lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "No changes yet",
    },
  ];

  return (
    <>
      <div className="pageHead">
        <div>
          <h1>Good to see you, {firstName}</h1>
          <p>Edit page content and SEO. Changes go live within a few seconds of saving.</p>
        </div>
        <a className="btn btnGhost" href="/" target="_blank" rel="noreferrer">
          View site ↗
        </a>
      </div>

      {error ? (
        <div className="alert alertError" role="alert">
          {error}
        </div>
      ) : null}

      <div className="statGrid">
        {stats.map((stat) => (
          <div className={`statCard${stat.tone ? ` is-${stat.tone}` : ""}`} key={stat.label}>
            <span className="statValue">{stat.value}</span>
            <span className="statLabel">{stat.label}</span>
            <span className="statHint">{stat.hint}</span>
          </div>
        ))}
      </div>

      <h2 className="blockTitle">Pages</h2>

      <div className="pageGrid">
        {withSeo.map((page) => {
          const path = page.slug === "home" ? "/" : `/${page.slug}`;
          const issues = needsAttention.some((p) => p.slug === page.slug);

          return (
            <Link key={page.slug} href={`/admin/pages/${page.slug}`} className="pageCard">
              <div className="pageCardTop">
                <span className="pageCardName">{page.name}</span>
                <span className={`badge${page.seo.noindex ? " badgeOff" : ""}`}>
                  {page.seo.noindex ? "noindex" : "indexed"}
                </span>
              </div>

              <span className="pageCardPath">{path}</span>

              <p className="pageCardDesc">
                {page.seo.description || "No meta description yet."}
              </p>

              <div className="pageCardFoot">
                <span>
                  {page.updatedAt
                    ? `Updated ${new Date(page.updatedAt).toLocaleDateString()}`
                    : "Never saved"}
                </span>
                {issues ? <span className="pageCardFlag">Needs SEO attention</span> : null}
              </div>
            </Link>
          );
        })}

        {!error && pages.length === 0 ? (
          <div className="emptyCard">
            <b>No pages yet.</b>
            <p>
              Run <code className="mono">npm run seed:home</code> in OMD-Backend to create the
              home page.
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}
