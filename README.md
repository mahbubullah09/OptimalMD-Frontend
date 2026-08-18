# OMD Frontend

OptimalMD marketing site — Next.js 16 (App Router) + TypeScript + CSS Modules.

## Run

```bash
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## Structure

```
src/
  app/
    layout.tsx        fonts, metadata, JSON-LD, Navbar + Footer shell
    globals.css       design tokens + shared section primitives
    icon.png          favicon (Next picks these up by filename)
    apple-icon.png
    page.tsx          home page — composes the nine sections
  lib/
    site.ts           org details + asset URLs (single source of truth)
  components/
    layout/           Navbar, Footer
    ui/               Reveal (scroll animation), CountUp (stat counter)
    icons/            hero feature + UI glyphs
    sections/         one folder per section
      Hero, CareCoverage, Audiences, Network, NoList,
      AppPromo, WhyOptimalMD, GivesBack, FinalCta
public/
  badges/             App Store + Google Play SVGs (vendored, not hot-linked)
```

## Conventions

- **Global vs local CSS.** Cross-section primitives (`.section`, `.wrap`,
  `.sec-title`, `.btn-primary`, `.reveal`, …) live in `globals.css`. Anything
  specific to one section lives in that section's `.module.css`.
- **Tokens over hexes.** Colours come from the CSS custom properties in
  `globals.css` (Brand Guidelines v2 §4). Gradients are navy -> bright blue
  only; green never appears in a gradient.
- **`--grad-text` flips per surface.** It defaults to the on-dark variant;
  `.light` / `.light-alt` override it. A dark card nested in a light section
  (e.g. the flip-card backs) must re-declare it.
- **Content is data.** Section copy lives in a sibling `*.data.tsx` where the
  list is long enough to warrant it, so text edits don't touch markup.
- **Assets are centralised.** Every remote image URL lives in `ASSETS` in
  `src/lib/site.ts`. Nothing references a CDN URL inline.

## Source recovery

Both HTML pastes were truncated at 50,000 characters, so several sections were
initially rebuilt from a screenshot. The live site embeds its full markup as a
JSON-escaped payload; decoding that recovered the real source, and every
section, the nav, and all asset URLs now match it.

The footer is a special case: the live one is CMS-built rather than using the
`.foot-*` CSS that came with the page source. The markup follows that CSS, but
every link, label and contact detail was read off the live footer. The one
addition is the bottom legal bar — the live footer has none, but the supplied
CSS styles one (`.foot-bottom` / `.fb-links` / `.not-ins`), so it is rendered.

One area still differs by necessity:

- **Hero.** The split blue/green hero came from the first paste, which used a
  brighter palette and a `Mossarat` font that is not on Google Fonts. That
  palette is scoped locally at the top of `Hero.module.css` — delete the block
  to snap the hero onto the canonical tokens. Three `TODO` strings in
  `Hero.tsx` (the membership card's fine print and the two CTA sub-labels)
  fell inside the first truncation and are still unverified.

## Admin portal

The admin lives at `/admin` inside this app, in its own route group with its
own stylesheet — it shares nothing with the marketing design system. Content
is stored in MongoDB and served by the API in `../OMD-Backend`.

```
src/app/
  (site)/       public marketing pages (Navbar + Footer chrome)
  admin/
    login/      sign-in screen, no portal chrome
    (portal)/   signed-in dashboard + page editors
  api/
    admin/auth/ login + logout proxies that own the session cookie
    revalidate/ webhook the backend calls after a content change
src/proxy.ts    edge gate for /admin
```

### Auth

The backend issues a JWT; `/api/admin/auth/login` stores it in a first-party
httpOnly cookie so client JavaScript never sees it. `src/proxy.ts` does a fast
cookie-presence check at the edge, and `(portal)/layout.tsx` does the real
verification against `/auth/me` — that second check is what actually protects
the data.

Saves go through server actions rather than client fetches, because the token
is httpOnly and unreadable from the browser.

### Editing

`/admin/pages/[slug]` is a split workspace: forms on the left, a live preview
of the real page on the right. Typing in a field updates the preview
immediately — nothing is saved until you press Publish.

Every section has a purpose-built form (`src/components/admin/sections/`)
built from the primitives in `src/components/admin/fields/`. Repeatable
structures — hero features, plan cards, FAQ pairs — get add / remove / reorder
controls. There is no JSON anywhere in the UI.

The preview is an **iframe**, not a scaled `<div>`, so the page gets a real
viewport and its media queries behave exactly as in production. Drafts are
pushed in over `postMessage` (same-origin only). It lives under `/admin` so
the auth gate covers it — it renders unpublished drafts.

### SEO

The SEO tab covers title/description with character guidance, canonical,
keywords, robots directives, social sharing, and schema.org structured data.
Structured data is built from typed toggles (Organisation, page type, FAQ,
breadcrumbs) rather than a JSON-LD box, so the emitted markup is always valid.
Blocks with nothing in them are omitted — an empty `FAQPage` is worse than
none, because Google flags it as invalid.

### Conventions for new sections and pages

These apply to every section and every page added from here on — the point is
that an author meets the same controls everywhere, not a different field style
per section.

- **All display text uses `RichTextEditor`.** Any string an author can see on
  the page gets the colour toolbar. Only URLs, image sources and select keys
  stay plain `TextField`s — colour markup has no meaning there and would
  corrupt the attribute. SEO title/description also stay plain, because search
  engines need clean text.
- **Render that text through `richText()`.** A field edited with the toolbar
  but rendered as a bare string will print raw markers on the page.
- **All images use `ImageField` and the `ImageData` shape**
  (`{ src, alt, title, description }`). Alt/title/description travel with the
  source rather than as separate fields, so images cannot be shipped with an
  empty alt. Descriptions feed schema.org `ImageObject` output.
- **All icons use `IconPickerField`**, never a plain select — a key like
  `advancedLab` tells an author nothing about what will appear.
- **Admin text states its own colour.** Inherited colour has proved unreliable
  in the admin panel — labels that relied on it rendered invisible twice. Any
  text-bearing class sets `color` explicitly; `npm run check:colours` lists
  rules that do not.
- **Run `npm run check:paths` after adding a section.** It cross-checks that
  every clickable element has a matching editor field; a mismatch is silent at
  runtime, the click simply does nothing.
- **Tag click targets in both directions.** The rendered element gets
  `data-preview-field="path.to.value"`; the matching editor field gets
  `path="path.to.value"`. Repeatable items get an index
  (`left.features.2.title`) so a click lands on that value, not the group.

### Content flow

Editing a page calls the API, which pings `/api/revalidate`, which calls
`revalidatePath`. The home page is statically generated with a 1-hour ceiling
as a safety net if a ping is ever missed.

Both page SEO and section copy come from MongoDB. Each section component
takes a `data` prop and ships a `*Defaults` object of the same shape, used
when the API is unreachable so the public site never renders empty. Disabling
a section in the admin removes it from the page entirely.

CMS copy is plain text, so emphasis uses the marker syntax in
`src/lib/richText.tsx`: `**bold**` (tinted by the surrounding section),
`*italic*`, `{{blue|…}}`, `{{green|…}}` and `
` for a line break. It renders
to React elements, never `dangerouslySetInnerHTML`, so CMS content cannot
inject markup.

Icons cannot be stored in a database, so sections that use them store a key
(`"stethoscope"`, `"control"`) resolved through a registry. An unknown key
drops the icon rather than breaking the section.

### Environment

`.env.local` (gitignored) needs `API_BASE_URL` and `REVALIDATE_SECRET`. The
latter must match the backend. Neither is `NEXT_PUBLIC_`, so both stay
server-side.
