"use client";

import {
  CONTACT_ICONS,
  type ContactIcon,
  emptyFooterGroup,
  emptyFooterLink,
  type FooterColumn,
  type FooterContactItem,
  type FooterData,
  type FooterGroup,
  type FooterLink,
  type SocialLink,
  SOCIAL_PLATFORMS,
  type SocialPlatform,
} from "@/lib/globals.types";
import { plainText } from "@/lib/markerParser";
import { RepeatableField, SelectField, TextField } from "../fields/Fields";
import ColorField from "../fields/ColorField";
import ImageField from "../fields/ImageField";
import RichTextEditor from "../fields/RichTextEditor";

/**
 * The footer builder.
 *
 * Columns hold groups and groups hold links, which is one level deeper than it
 * first appears — but the live footer stacks FAQ and Info inside a single
 * column, and flattening that away would have meant either losing the layout
 * or inventing a column that does not exist.
 *
 * Every visible label is a rich-text field — headings, link labels and the
 * legal note included — so colour, size and links work the same everywhere.
 * Only the addresses behind them are plain inputs, because a URL is not text
 * anyone reads.
 */

/** Links appear in three places, so the row is written once. */
function LinkRows({
  label,
  links,
  onChange,
  path,
}: {
  label: string;
  links: FooterLink[];
  onChange: (links: FooterLink[]) => void;
  path: string;
}) {
  return (
    <RepeatableField<FooterLink>
      label={label}
      value={links}
      onChange={onChange}
      newItem={emptyFooterLink}
      itemTitle={(link) => plainText(link.label)}
      addLabel="Add link"
      path={path}
      renderItem={(link, update, _index, itemPath) => (
        <>
          <RichTextEditor
            label="Label"
            value={link.label}
            onChange={(value) => update({ label: value })}
            path={`${itemPath}.label`}
          />
          <TextField
            label="Links to"
            value={link.href}
            onChange={(value) => update({ href: value })}
            path={`${itemPath}.href`}
          />
        </>
      )}
    />
  );
}

export default function FooterForm({
  value,
  onChange,
}: {
  value: FooterData;
  onChange: (value: FooterData) => void;
}) {
  const set = <K extends keyof FooterData>(key: K, next: FooterData[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <div className="formStack">
      <ColorField
        label="Footer background"
        hint="Leave as Default to keep the stylesheet's colour."
        value={value.appearance?.background ?? null}
        onChange={(background) => set("appearance", { ...value.appearance, background })}
        path="footer.appearance.background"
      />

      <ImageField
        label="Logo"
        value={value.logo}
        onChange={(logo) => set("logo", logo)}
        path="footer.logo"
      />

      <RichTextEditor
        label="Intro sentence"
        hint="Select a word and use the link button to link it."
        value={value.blurb}
        onChange={(blurb) => set("blurb", blurb)}
        path="footer.blurb"
        multiline
      />

      <ImageField
        label="Accreditation badge"
        hint="Leave the address empty to hide it."
        value={value.badge}
        onChange={(badge) => set("badge", badge)}
        path="footer.badge"
      />

      <RepeatableField<SocialLink>
        label="Social links"
        value={value.social}
        onChange={(social) => set("social", social)}
        newItem={() => ({ platform: "facebook", href: "" })}
        itemTitle={(item) => item.platform}
        addLabel="Add social link"
        path="footer.social"
        renderItem={(item, update, _index, itemPath) => (
          <>
            <SelectField<SocialPlatform>
              label="Platform"
              value={item.platform}
              options={SOCIAL_PLATFORMS}
              onChange={(platform) => update({ platform })}
            />
            <TextField
              label="Links to"
              value={item.href}
              onChange={(href) => update({ href })}
              path={`${itemPath}.href`}
            />
          </>
        )}
      />

      <RepeatableField<FooterColumn>
        label="Link columns"
        hint="A column can hold more than one heading, as FAQ and Info do."
        value={value.columns}
        onChange={(columns) => set("columns", columns)}
        newItem={() => ({ groups: [emptyFooterGroup()] })}
        itemTitle={(column, index) =>
          column.groups.map((group) => plainText(group.title)).filter(Boolean).join(" · ") ||
          `Column ${index + 1}`
        }
        addLabel="Add column"
        path="footer.columns"
        renderItem={(column, update, _index, columnPath) => (
          <RepeatableField<FooterGroup>
            label="Headings in this column"
            value={column.groups}
            onChange={(groups) => update({ groups })}
            newItem={emptyFooterGroup}
            itemTitle={(group) => plainText(group.title)}
            addLabel="Add heading"
            path={`${columnPath}.groups`}
            renderItem={(group, updateGroup, _groupIndex, groupPath) => (
              <>
                <RichTextEditor
                  label="Heading"
                  value={group.title}
                  onChange={(title) => updateGroup({ title })}
                  path={`${groupPath}.title`}
                />
                <LinkRows
                  label="Links"
                  links={group.links}
                  onChange={(links) => updateGroup({ links })}
                  path={`${groupPath}.links`}
                />
              </>
            )}
          />
        )}
      />

      <div className="fieldGroup">
        <h4>Contact column</h4>

        <RichTextEditor
          label="Heading"
          value={value.contact.title}
          onChange={(title) => set("contact", { ...value.contact, title })}
          path="footer.contact.title"
        />

        <RepeatableField<FooterContactItem>
          label="Contact rows"
          value={value.contact.items}
          onChange={(items) => set("contact", { ...value.contact, items })}
          newItem={() => ({ icon: "phone", title: "New row", body: "" })}
          itemTitle={(item) => plainText(item.title)}
          addLabel="Add contact row"
          path="footer.contact.items"
          renderItem={(item, update, _index, itemPath) => (
            <>
              <SelectField<ContactIcon>
                label="Icon"
                value={item.icon}
                options={CONTACT_ICONS}
                onChange={(icon) => update({ icon })}
              />
              <RichTextEditor
                label="Heading"
                value={item.title}
                onChange={(title) => update({ title })}
                path={`${itemPath}.title`}
              />
              <RichTextEditor
                label="Detail"
                hint="Enter starts a new line. Link a phone number or address here."
                value={item.body}
                onChange={(body) => update({ body })}
                path={`${itemPath}.body`}
                multiline
              />
            </>
          )}
        />
      </div>

      <div className="fieldGroup">
        <h4>Legal bar</h4>

        <RichTextEditor
          label="Copyright"
          hint="Write {year} where the current year should appear."
          value={value.legal.copyright}
          onChange={(copyright) => set("legal", { ...value.legal, copyright })}
          path="footer.legal.copyright"
        />

        <LinkRows
          label="Legal links"
          links={value.legal.links}
          onChange={(links) => set("legal", { ...value.legal, links })}
          path="footer.legal.links"
        />

        <RichTextEditor
          label="Note"
          value={value.legal.note}
          onChange={(note) => set("legal", { ...value.legal, note })}
          path="footer.legal.note"
        />
      </div>
    </div>
  );
}
