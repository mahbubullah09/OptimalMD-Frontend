"use client";

import { givesBackIcons } from "@/components/sections/GivesBack/gives.data";
import { carePaneIcons } from "@/components/sections/CareCoverage/care.data";
import { heroFeatureIcons } from "@/components/icons/registry";
import type {
  AppPromoData,
  AudiencesData,
  CareCoverageData,
  FinalCtaData,
  GivesBackData,
  HeroData,
  HeroSideData,
  NetworkData,
  NoListData,
  WhyOptimalMDData,
} from "@/lib/sections.types";
import IconPickerField from "../fields/IconPickerField";
import ImageField from "../fields/ImageField";
import RichTextEditor from "../fields/RichTextEditor";
import {
  CheckField,
  RepeatableField,
  SelectField,
  StringListField,
  TextField,
} from "../fields/Fields";

/**
 * One form per section type.
 *
 * Every field an editor can change is a labelled input — no JSON anywhere.
 * Each form receives the section's data and reports the whole updated object,
 * which the workspace feeds straight into the live preview.
 */

const FORMATTING_HINT =
  "**bold** tints the text · *italic* · a new line breaks the line";

const ICON_KEYS = Object.keys(heroFeatureIcons);
const GIVES_ICON_KEYS = ["control", "savings", "peace", "possibilities"];

export type SectionFormProps<T> = {
  data: T;
  onChange: (next: T) => void;
};

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function HeroSideForm({
  side,
  onChange,
  label,
  variant,
}: {
  side: HeroSideData;
  onChange: (next: HeroSideData) => void;
  label: string;
  variant: "left" | "right";
}) {
  const set = (patch: Partial<HeroSideData>) => onChange({ ...side, ...patch });

  return (
    <fieldset className="group">
      <legend>{label}</legend>

      <RichTextEditor
        path={`${variant}.title`}
        label="Heading"
        value={side.title}
        onChange={(title) => set({ title })}
      />
      <RichTextEditor
        path={`${variant}.titleAccent`}
        label="Highlighted word"
        hint="Defaults to the column's accent colour — override it with a swatch"
        value={side.titleAccent}
        onChange={(titleAccent) => set({ titleAccent })}
      />
      <RichTextEditor
        multiline
        path={`${variant}.subtitle`}
        label="Intro paragraph"
        hint={FORMATTING_HINT}
        value={side.subtitle}
        onChange={(subtitle) => set({ subtitle })}
      />

      <RepeatableField
        path={`${variant}.features`}
        label="Features"
        value={side.features}
        onChange={(features) => set({ features })}
        newItem={() => ({ icon: ICON_KEYS[0] ?? "", title: "", value: "" })}
        itemTitle={(f) => f.title.replace(/\n/g, " ")}
        addLabel="Add feature"
        renderItem={(feature, update, _i, itemPath) => (
          <>
            <IconPickerField
              path={`${itemPath}.icon`}
              label="Icon"
              value={feature.icon}
              icons={heroFeatureIcons}
              onChange={(icon) => update({ icon })}
            />
            <RichTextEditor
              multiline
              path={`${itemPath}.title`}
              label="Label"
              hint="Press Enter for a line break"
              value={feature.title}
              onChange={(title) => update({ title })}
            />
            <RichTextEditor
              path={`${itemPath}.value`}
              label="Value"
              hint="Accent colour by default — colour any word to override"
              value={feature.value}
              onChange={(value) => update({ value })}
            />
          </>
        )}
      />
    </fieldset>
  );
}

export function HeroForm({ data, onChange }: SectionFormProps<HeroData>) {
  const set = (patch: Partial<HeroData>) => onChange({ ...data, ...patch });
  const card = data.membershipCard;

  return (
    <>
      <ImageField
        path="background"
        label="Background image"
        hint="Sits behind the colour washes. Decorative, so alt text can stay empty."
        value={data.background}
        onChange={(background) => set({ background })}
      />

      <HeroSideForm
        variant="left"
        label="Left column — Affordable"
        side={data.left}
        onChange={(left) => set({ left })}
      />
      <HeroSideForm
        variant="right"
        label="Right column — Optimal"
        side={data.right}
        onChange={(right) => set({ right })}
      />

      <fieldset className="group">
        <legend>Membership card</legend>
        <StringListField
          rich
          path="membershipCard"
          label="Card lines"
          hint="One word or phrase per line, stacked in the card"
          value={card.lines}
          onChange={(lines) => set({ membershipCard: { ...card, lines } })}
        />
        <RichTextEditor
          label="Price lead-in"
          value={card.priceLabel}
          onChange={(priceLabel) => set({ membershipCard: { ...card, priceLabel } })}
        />
        <RichTextEditor
          label="Price"
          value={card.price}
          onChange={(price) => set({ membershipCard: { ...card, price } })}
        />
        <RichTextEditor
          label="Price period"
          value={card.pricePeriod}
          onChange={(pricePeriod) => set({ membershipCard: { ...card, pricePeriod } })}
        />
        <RichTextEditor
          label="Small print"
          value={card.disclaimer}
          onChange={(disclaimer) => set({ membershipCard: { ...card, disclaimer } })}
        />
      </fieldset>

      <fieldset className="group">
        <legend>Closing statement &amp; buttons</legend>
        <RichTextEditor
          multiline
          path="bridge"
          label="Bridging sentence"
          hint="Select a phrase, then pick a swatch to colour it"
          value={data.bridge}
          onChange={(bridge) => set({ bridge })}
        />

        <RepeatableField
          path="ctas"
          label="Buttons"
          value={data.ctas}
          onChange={(ctas) => set({ ctas })}
          newItem={() => ({ label: "", sublabel: "", href: "/", variant: "family" as const })}
          itemTitle={(c) => c.label}
          addLabel="Add button"
          renderItem={(cta, update) => (
            <>
              <RichTextEditor label="Label" value={cta.label} onChange={(label) => update({ label })} />
              <RichTextEditor
                label="Sub-label"
                value={cta.sublabel ?? ""}
                onChange={(sublabel) => update({ sublabel })}
              />
              <TextField
                label="Link"
                type="url"
                value={cta.href}
                onChange={(href) => update({ href })}
              />
              <SelectField
                label="Style"
                hint="family = solid blue · org = navy with green accent"
                value={cta.variant}
                options={["family", "org"] as const}
                onChange={(variant) => update({ variant })}
              />
            </>
          )}
        />

        <RichTextEditor
          label="Text link label"
          value={data.link.label}
          onChange={(label) => set({ link: { ...data.link, label } })}
        />
        <TextField
          label="Text link target"
          value={data.link.href}
          onChange={(href) => set({ link: { ...data.link, href } })}
        />

        <StringListField
          rich
          path="trustItems"
          label="Trust bar"
          value={data.trustItems}
          onChange={(trustItems) => set({ trustItems })}
          placeholder="No contracts"
        />
      </fieldset>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Care coverage                                                       */
/* ------------------------------------------------------------------ */

export function CareCoverageForm({ data, onChange }: SectionFormProps<CareCoverageData>) {
  const set = (patch: Partial<CareCoverageData>) => onChange({ ...data, ...patch });

  return (
    <>
      <RichTextEditor
        path="eyebrow"
        label="Eyebrow"
        value={data.eyebrow}
        onChange={(eyebrow) => set({ eyebrow })}
      />
      <RichTextEditor
        path="title"
        label="Heading"
        value={data.title}
        onChange={(title) => set({ title })}
      />
      <RichTextEditor
        multiline
        path="subtitle"
        label="Intro"
        value={data.subtitle}
        onChange={(subtitle) => set({ subtitle })}
      />
      <RichTextEditor
        path="source"
        label="Source note"
        value={data.source ?? ""}
        onChange={(source) => set({ source })}
      />

      <RepeatableField
        path="panes"
        label="Tabs"
        value={data.panes}
        onChange={(panes) => set({ panes })}
        newItem={() => ({
          id: "rx",
          tabTitle: "",
          tabDetail: "",
          tag: "",
          heading: "",
          items: [],
          note: "",
        })}
        itemTitle={(p) => p.tabTitle}
        addLabel="Add tab"
        renderItem={(pane, update, _i, itemPath) => (
          <>
            <IconPickerField
              path={`${itemPath}.icon`}
              label="Icon"
              hint="Also identifies the tab"
              value={pane.id}
              icons={carePaneIcons}
              onChange={(id) => update({ id })}
            />
            <RichTextEditor
              path={`${itemPath}.tabTitle`}
              label="Tab label"
              value={pane.tabTitle}
              onChange={(tabTitle) => update({ tabTitle })}
            />
            <RichTextEditor
              path={`${itemPath}.tabDetail`}
              label="Tab sub-label"
              value={pane.tabDetail}
              onChange={(tabDetail) => update({ tabDetail })}
            />
            <RichTextEditor
              path={`${itemPath}.tag`}
              label="Eyebrow"
              value={pane.tag}
              onChange={(tag) => update({ tag })}
            />
            <RichTextEditor
              path={`${itemPath}.heading`}
              label="Panel heading"
              value={pane.heading}
              onChange={(heading) => update({ heading })}
            />
            <StringListField
              rich
              path={`${itemPath}.items`}
              label="Bullet points"
              value={pane.items}
              onChange={(items) => update({ items })}
            />
            <RichTextEditor
              path={`${itemPath}.note`}
              label="Footnote"
              value={pane.note ?? ""}
              onChange={(note) => update({ note })}
            />
          </>
        )}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Audiences                                                           */
/* ------------------------------------------------------------------ */

export function AudiencesForm({ data, onChange }: SectionFormProps<AudiencesData>) {
  const set = (patch: Partial<AudiencesData>) => onChange({ ...data, ...patch });

  return (
    <>
      <RichTextEditor
        path="eyebrow"
        label="Eyebrow"
        value={data.eyebrow}
        onChange={(eyebrow) => set({ eyebrow })}
      />
      <RichTextEditor
        path="title"
        label="Heading"
        value={data.title}
        onChange={(title) => set({ title })}
      />

      <RepeatableField
        path="cards"
        label="Plan cards"
        value={data.cards}
        onChange={(cards) => set({ cards })}
        newItem={() => ({
          tag: "",
          title: "",
          body: "",
          amount: "",
          per: "",
          href: "",
          featured: false,
          badge: "",
        })}
        itemTitle={(c) => c.title}
        addLabel="Add card"
        renderItem={(card, update, _i, itemPath) => (
          <>
            <RichTextEditor
              path={`${itemPath}.tag`}
              label="Eyebrow"
              value={card.tag}
              onChange={(tag) => update({ tag })}
            />
            <RichTextEditor
              path={`${itemPath}.title`}
              label="Title"
              value={card.title}
              onChange={(title) => update({ title })}
            />
            <RichTextEditor
              multiline
              path={`${itemPath}.body`}
              label="Body"
              value={card.body}
              onChange={(body) => update({ body })}
            />
            <RichTextEditor
              path={`${itemPath}.amount`}
              label="Price"
              value={card.amount}
              onChange={(amount) => update({ amount })}
            />
            <RichTextEditor
              path={`${itemPath}.per`}
              label="Price unit"
              value={card.per}
              onChange={(per) => update({ per })}
            />
            <TextField
              label="Link"
              type="url"
              value={card.href}
              onChange={(href) => update({ href })}
            />
            <CheckField
              label="Highlight this card"
              checked={card.featured ?? false}
              onChange={(featured) => update({ featured })}
            />
            {card.featured ? (
              <RichTextEditor
                path={`${itemPath}.badge`}
                label="Ribbon text"
                value={card.badge ?? ""}
                onChange={(badge) => update({ badge })}
              />
            ) : null}
          </>
        )}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Network                                                             */
/* ------------------------------------------------------------------ */

export function NetworkForm({ data, onChange }: SectionFormProps<NetworkData>) {
  const set = (patch: Partial<NetworkData>) => onChange({ ...data, ...patch });

  return (
    <>
      <RichTextEditor
        path="eyebrow"
        label="Eyebrow"
        value={data.eyebrow}
        onChange={(eyebrow) => set({ eyebrow })}
      />
      <RichTextEditor
        path="title"
        label="Heading"
        value={data.title}
        onChange={(title) => set({ title })}
      />
      <ImageField
        path="logos"
        label="Partner logo image"
        hint="The heading and footnote inside the card are part of this image"
        value={data.logos}
        onChange={(logos) => set({ logos })}
      />

      <RepeatableField
        path="stats"
        label="Statistics"
        value={data.stats}
        onChange={(stats) => set({ stats })}
        newItem={() => ({ value: "", suffix: "", countUp: false, label: "" })}
        itemTitle={(s) => s.label}
        addLabel="Add statistic"
        renderItem={(stat, update, _i, itemPath) => (
          <>
            <RichTextEditor
              path={`${itemPath}`}
              label="Value"
              value={stat.value}
              onChange={(value) => update({ value })}
            />
            <TextField
              label="Suffix"
              hint='Appended to the value, e.g. "+"'
              value={stat.suffix ?? ""}
              onChange={(suffix) => update({ suffix })}
            />
            <CheckField
              label="Count up when scrolled into view"
              checked={stat.countUp ?? false}
              onChange={(countUp) => update({ countUp })}
            />
            <RichTextEditor
              label="Caption"
              value={stat.label}
              onChange={(label) => update({ label })}
            />
          </>
        )}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Fine print                                                          */
/* ------------------------------------------------------------------ */

export function NoListForm({ data, onChange }: SectionFormProps<NoListData>) {
  const set = (patch: Partial<NoListData>) => onChange({ ...data, ...patch });

  return (
    <>
      <RichTextEditor
        path="eyebrow"
        label="Eyebrow"
        value={data.eyebrow}
        onChange={(eyebrow) => set({ eyebrow })}
      />
      <StringListField
        rich
        path="pills"
        label="Exclusion pills"
        value={data.pills}
        onChange={(pills) => set({ pills })}
        placeholder="no deductibles"
      />
      <RichTextEditor
        path="headline"
        label="Headline"
        value={data.headline}
        onChange={(headline) => set({ headline })}
      />
      <RichTextEditor
        path="note"
        label="Closing note"
        value={data.note}
        onChange={(note) => set({ note })}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* App promo                                                           */
/* ------------------------------------------------------------------ */

export function AppPromoForm({ data, onChange }: SectionFormProps<AppPromoData>) {
  const set = (patch: Partial<AppPromoData>) => onChange({ ...data, ...patch });

  return (
    <>
      <RichTextEditor
        path="eyebrow"
        label="Eyebrow"
        value={data.eyebrow}
        onChange={(eyebrow) => set({ eyebrow })}
      />
      <RichTextEditor
        path="title"
        label="Heading line 1"
        value={data.title}
        onChange={(title) => set({ title })}
      />
      <RichTextEditor
        path="titleAccent"
        label="Heading line 2"
        hint="Shown in the brand gradient"
        value={data.titleAccent}
        onChange={(titleAccent) => set({ titleAccent })}
      />
      <RichTextEditor
        multiline
        path="subtitle"
        label="Body"
        value={data.subtitle}
        onChange={(subtitle) => set({ subtitle })}
      />
      <TextField
        path="appStoreUrl"
        label="App Store link"
        type="url"
        value={data.appStoreUrl}
        onChange={(appStoreUrl) => set({ appStoreUrl })}
      />
      <TextField
        label="Google Play link"
        type="url"
        value={data.googlePlayUrl}
        onChange={(googlePlayUrl) => set({ googlePlayUrl })}
      />
      <ImageField
        path="phone"
        label="Phone screenshot"
        value={data.phone}
        onChange={(phone) => set({ phone })}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Why OptimalMD                                                       */
/* ------------------------------------------------------------------ */

export function WhyOptimalMDForm({ data, onChange }: SectionFormProps<WhyOptimalMDData>) {
  const set = (patch: Partial<WhyOptimalMDData>) => onChange({ ...data, ...patch });

  return (
    <>
      <RichTextEditor
        path="eyebrow"
        label="Eyebrow"
        value={data.eyebrow}
        onChange={(eyebrow) => set({ eyebrow })}
      />
      <RichTextEditor
        path="title"
        label="Heading"
        value={data.title}
        onChange={(title) => set({ title })}
      />

      <RepeatableField
        path="cards"
        label="Cards"
        value={data.cards}
        onChange={(cards) => set({ cards })}
        newItem={() => ({
          icon: { src: "", alt: "", title: "", description: "" },
          stat: "",
          title: "",
          body: "",
        })}
        itemTitle={(c) => c.title}
        addLabel="Add card"
        renderItem={(card, update, _i, itemPath) => (
          <>
            <ImageField
              path={`${itemPath}.icon`}
              label="Icon image"
              value={card.icon}
              onChange={(icon) => update({ icon })}
            />
            <RichTextEditor
              path={`${itemPath}.stat`}
              label="Big figure"
              value={card.stat}
              onChange={(stat) => update({ stat })}
            />
            <RichTextEditor
              path={`${itemPath}.title`}
              label="Title"
              value={card.title}
              onChange={(title) => update({ title })}
            />
            <RichTextEditor
              multiline
              path={`${itemPath}.body`}
              label="Body"
              value={card.body}
              onChange={(body) => update({ body })}
            />
          </>
        )}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Gives back                                                          */
/* ------------------------------------------------------------------ */

export function GivesBackForm({ data, onChange }: SectionFormProps<GivesBackData>) {
  const set = (patch: Partial<GivesBackData>) => onChange({ ...data, ...patch });

  return (
    <>
      <RichTextEditor
        path="eyebrow"
        label="Eyebrow"
        value={data.eyebrow}
        onChange={(eyebrow) => set({ eyebrow })}
      />
      <RichTextEditor
        path="title"
        label="Heading"
        value={data.title}
        onChange={(title) => set({ title })}
      />
      <RichTextEditor
        multiline
        path="subtitle"
        label="Intro"
        value={data.subtitle}
        onChange={(subtitle) => set({ subtitle })}
      />

      <RepeatableField
        path="cards"
        label="Flip cards"
        hint="The back of each card is what visitors see on hover"
        value={data.cards}
        onChange={(cards) => set({ cards })}
        newItem={() => ({
          icon: GIVES_ICON_KEYS[0] ?? "",
          title: "",
          summary: "",
          backTitle: "",
          bullets: [],
          tagline: "",
        })}
        itemTitle={(c) => c.title}
        addLabel="Add card"
        renderItem={(card, update, _i, itemPath) => (
          <>
            <IconPickerField
              path={`${itemPath}.icon`}
              label="Icon"
              value={card.icon}
              icons={givesBackIcons}
              onChange={(icon) => update({ icon })}
            />
            <RichTextEditor
              path={`${itemPath}.title`}
              label="Front title"
              value={card.title}
              onChange={(title) => update({ title })}
            />
            <RichTextEditor
              multiline
              path={`${itemPath}.summary`}
              label="Front summary"
              value={card.summary}
              onChange={(summary) => update({ summary })}
            />
            <RichTextEditor
              path={`${itemPath}.backTitle`}
              label="Back title"
              value={card.backTitle}
              onChange={(backTitle) => update({ backTitle })}
            />
            <StringListField
              rich
              path={`${itemPath}.bullets`}
              label="Back bullets"
              value={card.bullets}
              onChange={(bullets) => update({ bullets })}
            />
            <RichTextEditor
              multiline
              path={`${itemPath}.tagline`}
              label="Closing line"
              value={card.tagline}
              onChange={(tagline) => update({ tagline })}
            />
          </>
        )}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA                                                           */
/* ------------------------------------------------------------------ */

export function FinalCtaForm({ data, onChange }: SectionFormProps<FinalCtaData>) {
  const set = (patch: Partial<FinalCtaData>) => onChange({ ...data, ...patch });

  return (
    <>
      <RichTextEditor
        path="eyebrow"
        label="Eyebrow"
        value={data.eyebrow}
        onChange={(eyebrow) => set({ eyebrow })}
      />
      <RichTextEditor
        path="title"
        label="Heading"
        value={data.title}
        onChange={(title) => set({ title })}
      />
      <RichTextEditor
        multiline
        path="subtitle"
        label="Body"
        value={data.subtitle}
        onChange={(subtitle) => set({ subtitle })}
      />
      <RichTextEditor
        path="ctaLabel"
        label="Button label"
        value={data.ctaLabel}
        onChange={(ctaLabel) => set({ ctaLabel })}
      />
      <TextField
        label="Button link"
        type="url"
        value={data.ctaHref}
        onChange={(ctaHref) => set({ ctaHref })}
      />
    </>
  );
}
