"use client";

import type { Appearance, NavAction, NavData, NavItem } from "@/lib/globals.types";
import { emptyNavItem } from "@/lib/globals.types";
import { plainText } from "@/lib/markerParser";
import { CheckField, RepeatableField, TextField } from "../fields/Fields";
import ColorField from "../fields/ColorField";
import ImageField from "../fields/ImageField";
import RichTextEditor from "../fields/RichTextEditor";

/**
 * The menu builder.
 *
 * One recursive component draws every level, because the levels differ only in
 * how the navbar paints them — a top-level entry, a dropdown row and a flyout
 * row all hold a label, a link and possibly children. That is also what lets an
 * author promote a link to a submenu simply by adding a child to it, without
 * changing its type or losing what they typed.
 *
 * Depth is capped at three to match what the navbar can render; beyond that the
 * "Add" control is withheld rather than accepting items that would never show.
 */

const MAX_DEPTH = 3;

const DEPTH_LABEL = ["Menu items", "Dropdown items", "Flyout items"];
const DEPTH_ADD = ["Add menu item", "Add dropdown item", "Add flyout item"];

function NavItems({
  items,
  onChange,
  depth,
  path,
}: {
  items: NavItem[];
  onChange: (items: NavItem[]) => void;
  depth: number;
  path: string;
}) {
  return (
    <RepeatableField<NavItem>
      label={DEPTH_LABEL[depth - 1] ?? "Items"}
      hint={
        depth === 1
          ? "Add a child to turn a link into a dropdown."
          : depth < MAX_DEPTH
            ? "Add a child to turn this into a submenu."
            : undefined
      }
      value={items}
      onChange={onChange}
      newItem={emptyNavItem}
      itemTitle={(item) => plainText(item.label)}
      addLabel={DEPTH_ADD[depth - 1] ?? "Add item"}
      path={path}
      renderItem={(item, update, index, itemPath) => {
        const isMenu = item.children.length > 0;

        return (
          <>
            <RichTextEditor
              label="Label"
              hint="Colour and size it like any other text."
              value={item.label}
              onChange={(label) => update({ label })}
              path={`${itemPath}.label`}
            />

            {/* A menu opens on hover rather than navigating, so its own link
                would never be followed — saying so beats a dead field. */}
            {isMenu ? (
              <p className="fieldNote">
                This opens a menu, so it does not link anywhere itself. Remove its items to turn
                it back into a link.
              </p>
            ) : (
              <TextField
                label="Links to"
                hint="A full address, or a path beginning with /"
                value={item.href}
                onChange={(href) => update({ href })}
                path={`${itemPath}.href`}
              />
            )}

            {depth === 1 && isMenu ? (
              <CheckField
                label="Align this dropdown to the right edge"
                checked={item.alignRight ?? false}
                onChange={(alignRight) => update({ alignRight })}
              />
            ) : null}

            {depth === 2 && isMenu ? (
              <CheckField
                label="Open this flyout to the left"
                checked={item.flyoutLeft ?? false}
                onChange={(flyoutLeft) => update({ flyoutLeft })}
              />
            ) : null}

            {depth < MAX_DEPTH ? (
              <NavItems
                items={item.children}
                onChange={(children) => update({ children })}
                depth={depth + 1}
                path={`${itemPath}.children`}
              />
            ) : null}
          </>
        );
      }}
    />
  );
}

/** Label, address and colours for one navbar button. */
function ActionFields({
  title,
  action,
  onChange,
  path,
}: {
  title: string;
  action: NavAction;
  onChange: (action: NavAction) => void;
  path: string;
}) {
  const setAppearance = (patch: Appearance) =>
    onChange({ ...action, appearance: { ...action.appearance, ...patch } });

  return (
    <div className="fieldSubGroup">
      <h5>{title}</h5>

      <RichTextEditor
        label="Label"
        value={action.label}
        onChange={(label) => onChange({ ...action, label })}
        path={`${path}.label`}
      />

      <TextField
        label="Links to"
        value={action.href}
        onChange={(href) => onChange({ ...action, href })}
        path={`${path}.href`}
      />

      <ColorField
        label="Button colour"
        value={action.appearance?.buttonFill ?? null}
        onChange={(buttonFill) => setAppearance({ buttonFill })}
        path={`${path}.appearance.buttonFill`}
      />

      <ColorField
        label="Label colour"
        hint="The label can also be coloured per word in the field above."
        value={action.appearance?.buttonText ?? null}
        onChange={(buttonText) => setAppearance({ buttonText })}
        path={`${path}.appearance.buttonText`}
        allowGradient={false}
      />
    </div>
  );
}

export default function NavForm({
  value,
  onChange,
}: {
  value: NavData;
  onChange: (value: NavData) => void;
}) {
  const set = <K extends keyof NavData>(key: K, next: NavData[K]) =>
    onChange({ ...value, [key]: next });

  return (
    <div className="formStack">
      <ImageField
        label="Logo"
        value={value.logo}
        onChange={(logo) => set("logo", logo)}
        path="nav.logo"
      />

      <TextField
        label="Logo links to"
        value={value.homeHref}
        onChange={(homeHref) => set("homeHref", homeHref)}
        path="nav.homeHref"
      />

      <ColorField
        label="Bar background"
        hint="Leave as Default to keep the stylesheet's colour."
        value={value.appearance?.background ?? null}
        onChange={(background) =>
          set("appearance", { ...value.appearance, background })
        }
        path="nav.appearance.background"
      />

      <NavItems
        items={value.entries}
        onChange={(entries) => set("entries", entries)}
        depth={1}
        path="nav.entries"
      />

      <div className="fieldGroup">
        <h4>Buttons</h4>

        <ActionFields
          title="Login"
          action={value.login}
          onChange={(login) => set("login", login)}
          path="nav.login"
        />

        <ActionFields
          title="Call to action"
          action={value.cta}
          onChange={(cta) => set("cta", cta)}
          path="nav.cta"
        />
      </div>
    </div>
  );
}
