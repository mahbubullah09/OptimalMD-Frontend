"use client";

import { useState } from "react";
import {
  type PageSchema,
  type PageSeo,
  TWITTER_CARDS,
  WEBPAGE_TYPES,
} from "@/lib/content.types";
import { ASSETS, ORG } from "@/lib/site";
import {
  CheckField,
  RepeatableField,
  SelectField,
  TagsField,
  TextAreaField,
  TextField,
} from "../fields/Fields";

/**
 * SEO panel.
 *
 * A search-result preview sits at the top, followed by collapsible groups
 * that each report their own problem count. Checks are advisory: they explain
 * what search engines prefer without blocking a save, because legitimate
 * pages routinely exceed the "ideal" lengths.
 */

const LIMITS = { title: 70, description: 155 };

type Check = { ok: boolean; label: string };

function CheckList({ checks }: { checks: Check[] }) {
  return (
    <ul className="checkList">
      {checks.map((check) => (
        <li key={check.label} className={check.ok ? "checkOk" : "checkWarn"}>
          <span aria-hidden>{check.ok ? "✓" : "⚠"}</span>
          {check.label}
        </li>
      ))}
    </ul>
  );
}

function Group({
  title,
  issues,
  defaultOpen = false,
  children,
}: {
  title: string;
  issues?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="seoGroup">
      <button
        type="button"
        className="seoGroupHead"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="seoChevron" aria-hidden>
          {open ? "⌄" : "›"}
        </span>
        <span className="seoGroupTitle">{title}</span>
        {issues !== undefined ? (
          <span className={`seoCount${issues === 0 ? " seoCountClear" : ""}`}>{issues}</span>
        ) : null}
      </button>
      {open ? <div className="seoGroupBody">{children}</div> : null}
    </div>
  );
}

export default function SeoPanel({
  seo,
  slug,
  onChange,
}: {
  seo: PageSeo;
  slug: string;
  onChange: (next: PageSeo) => void;
}) {
  const set = (patch: Partial<PageSeo>) => onChange({ ...seo, ...patch });
  const setSchema = (patch: Partial<PageSchema>) =>
    onChange({ ...seo, schema: { ...seo.schema, ...patch } });

  const title = seo.title ?? "";
  const description = seo.description ?? "";
  const pageUrl = `${ORG.url}${slug === "home" ? "/" : `/${slug}`}`;

  const contentChecks: Check[] = [
    { ok: title.length > 0, label: "Page has a title" },
    { ok: title.length > 0 && title.length <= LIMITS.title, label: `Title is under ${LIMITS.title} characters` },
    { ok: description.length > 0, label: "Page has meta description" },
    {
      ok: description.length > 0 && description.length <= LIMITS.description,
      label: `Description is under ${LIMITS.description} characters`,
    },
  ];

  const authorChecks: Check[] = [{ ok: Boolean(seo.author), label: "Page has author name" }];
  const imageChecks: Check[] = [{ ok: Boolean(seo.ogImage), label: "Page has a sharing image" }];

  const countIssues = (checks: Check[]) => checks.filter((c) => !c.ok).length;

  return (
    <div className="seoPanel">
      <header className="seoHead">
        <h2>SEO &amp; AI search optimization</h2>
        <p>Get found across AI &amp; search engines</p>
      </header>

      <div className="seoPreviewLabel">Preview</div>
      <div className="seoPreview">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="seoPreviewLogo" src={ASSETS.logo} alt="" />
        <div className="seoPreviewTitle">{title || "Untitled page"}</div>
        <div className="seoPreviewDesc">
          {description || "Add a meta description so search engines have something to show."}
        </div>
        <div className="seoPreviewUrl">{pageUrl}</div>
      </div>

      <Group title="Content" issues={countIssues(contentChecks)} defaultOpen>
        <TextField label="Title" value={title} onChange={(v) => set({ title: v })} />
        <CheckList checks={contentChecks.slice(0, 2)} />

        <TextAreaField
          label="Description"
          value={description}
          onChange={(v) => set({ description: v })}
        />
        <CheckList checks={contentChecks.slice(2)} />
      </Group>

      <Group title="Keywords">
        <TagsField
          label="Keywords"
          hint="Comma separated. Most search engines ignore these, but AI crawlers still read them."
          value={seo.keywords}
          onChange={(keywords) => set({ keywords })}
        />
      </Group>

      <Group title="Author" issues={countIssues(authorChecks)}>
        <TextField
          label="Author"
          value={seo.author ?? ""}
          placeholder={ORG.legalName}
          onChange={(author) => set({ author })}
        />
        <CheckList checks={authorChecks} />
      </Group>

      <Group title="Images" issues={countIssues(imageChecks)}>
        <TextField
          label="Sharing image"
          hint="Shown when the page is posted to social media. 1200×630 works best."
          type="url"
          value={seo.ogImage ?? ""}
          onChange={(ogImage) => set({ ogImage })}
        />
        <CheckList checks={imageChecks} />
        {seo.ogImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img className="seoImagePreview" src={seo.ogImage} alt="Sharing image preview" />
        ) : null}

        <TextField
          label="Share title"
          hint="Falls back to the page title"
          value={seo.ogTitle ?? ""}
          onChange={(ogTitle) => set({ ogTitle })}
        />
        <TextAreaField
          label="Share description"
          hint="Falls back to the page description"
          value={seo.ogDescription ?? ""}
          onChange={(ogDescription) => set({ ogDescription })}
        />
        <SelectField
          label="Twitter card style"
          value={seo.twitterCard}
          options={TWITTER_CARDS}
          onChange={(twitterCard) => set({ twitterCard })}
        />
      </Group>

      <Group title="Links & tags" issues={seo.customMeta.length}>
        <TextField
          label="Canonical URL"
          hint="Leave blank unless this page duplicates another"
          type="url"
          value={seo.canonical ?? ""}
          onChange={(canonical) => set({ canonical })}
        />

        <CheckField
          label="Hide from search engines (noindex)"
          checked={seo.noindex}
          onChange={(noindex) => set({ noindex })}
        />
        <CheckField
          label="Do not follow links on this page (nofollow)"
          checked={seo.nofollow}
          onChange={(nofollow) => set({ nofollow })}
        />

        <RepeatableField
          label="Custom meta tags"
          hint="For verification tags and anything not covered above"
          value={seo.customMeta}
          onChange={(customMeta) => set({ customMeta })}
          newItem={() => ({ name: "", content: "" })}
          itemTitle={(tag) => tag.name}
          addLabel="Add"
          renderItem={(tag, update) => (
            <>
              <TextField label="Name" value={tag.name} onChange={(name) => update({ name })} />
              <TextField
                label="Content"
                value={tag.content}
                onChange={(content) => update({ content })}
              />
            </>
          )}
        />
      </Group>

      <Group title="Language">
        <TextField
          label="Language code"
          hint='Two-letter code, e.g. "en" or "es"'
          value={seo.language}
          onChange={(language) => set({ language })}
        />
      </Group>

      <Group title="Schema markup">
        <p className="groupNote">
          Emitted as JSON-LD so search engines can show rich results. Built from these fields —
          you never write the markup yourself.
        </p>

        <CheckField
          label="Organisation details (name, logo, phone, address, social profiles)"
          checked={seo.schema.organization.enabled}
          onChange={(enabled) => setSchema({ organization: { enabled } })}
        />

        <CheckField
          label="Page type"
          checked={seo.schema.webPage.enabled}
          onChange={(enabled) => setSchema({ webPage: { ...seo.schema.webPage, enabled } })}
        />
        {seo.schema.webPage.enabled ? (
          <SelectField
            label="What kind of page is this?"
            value={seo.schema.webPage.type}
            options={WEBPAGE_TYPES}
            onChange={(type) => setSchema({ webPage: { ...seo.schema.webPage, type } })}
          />
        ) : null}

        <CheckField
          label="Frequently asked questions"
          checked={seo.schema.faq.enabled}
          onChange={(enabled) => setSchema({ faq: { ...seo.schema.faq, enabled } })}
        />
        {seo.schema.faq.enabled ? (
          <RepeatableField
            label="Questions"
            hint="Can appear as an expandable FAQ directly in search results"
            value={seo.schema.faq.items}
            onChange={(items) => setSchema({ faq: { ...seo.schema.faq, items } })}
            newItem={() => ({ question: "", answer: "" })}
            itemTitle={(item) => item.question}
            addLabel="Add question"
            renderItem={(item, update) => (
              <>
                <TextField
                  label="Question"
                  value={item.question}
                  onChange={(question) => update({ question })}
                />
                <TextAreaField
                  label="Answer"
                  value={item.answer}
                  onChange={(answer) => update({ answer })}
                />
              </>
            )}
          />
        ) : null}

        <CheckField
          label="Breadcrumb trail"
          checked={seo.schema.breadcrumbs.enabled}
          onChange={(enabled) =>
            setSchema({ breadcrumbs: { ...seo.schema.breadcrumbs, enabled } })
          }
        />
        {seo.schema.breadcrumbs.enabled ? (
          <RepeatableField
            label="Trail"
            hint="Ordered from the site root to this page"
            value={seo.schema.breadcrumbs.items}
            onChange={(items) => setSchema({ breadcrumbs: { ...seo.schema.breadcrumbs, items } })}
            newItem={() => ({ name: "", url: "" })}
            itemTitle={(item) => item.name}
            addLabel="Add level"
            renderItem={(item, update) => (
              <>
                <TextField label="Label" value={item.name} onChange={(name) => update({ name })} />
                <TextField
                  label="URL"
                  type="url"
                  value={item.url}
                  onChange={(url) => update({ url })}
                />
              </>
            )}
          />
        ) : null}
      </Group>
    </div>
  );
}
