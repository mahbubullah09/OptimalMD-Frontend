"use client";

import type { ReactNode } from "react";
import RichTextEditor from "./RichTextEditor";

/**
 * Form primitives for the section editors.
 *
 * These exist so an editor never sees JSON: every stored shape is expressed
 * as labelled inputs, and repeatable structures (feature grids, card decks,
 * bullet lists) get add / remove / reorder controls.
 */

type BaseProps = {
  label: string;
  hint?: string;
  /** Dotted path, used to focus this field from a preview click. */
  path?: string;
  children?: ReactNode;
};

export function Field({ label, hint, path, children }: BaseProps) {
  return (
    <label className="field" data-field-path={path}>
      <span>
        {label}
        {hint ? <small>{hint}</small> : null}
      </span>
      {children}
    </label>
  );
}

export function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
  path,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "url";
  path?: string;
}) {
  return (
    <Field label={label} hint={hint} path={path}>
      <input
        className="input"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function TextAreaField({
  label,
  hint,
  value,
  onChange,
  rows = 3,
  path,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  path?: string;
}) {
  return (
    <Field label={label} hint={hint} path={path}>
      <textarea
        className="textarea"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function SelectField<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint?: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <Field label={label} hint={hint}>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function CheckField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="checkRow">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {/* A real element rather than a bare text node: it can be given an
          explicit colour, and it is not an anonymous flex item. */}
      <span className="checkRowLabel">{label}</span>
    </label>
  );
}

/** Free-text tags, e.g. SEO keywords. Stored as an array, edited as chips. */
export function TagsField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        className="input"
        value={value.join(", ")}
        placeholder="private healthcare, $0 telehealth"
        onChange={(e) =>
          onChange(
            e.target.value
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          )
        }
      />
    </Field>
  );
}

/** A simple list of strings — bullets, pills, trust badges. */
export function StringListField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  path,
  rich = false,
}: {
  label: string;
  hint?: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  path?: string;
  /** Give each row the colour toolbar, for text that appears on the page. */
  rich?: boolean;
}) {
  const update = (index: number, next: string) =>
    onChange(value.map((item, i) => (i === index ? next : item)));

  return (
    <div className="field" data-field-path={path}>
      <span>
        {label}
        {hint ? <small>{hint}</small> : null}
      </span>

      <div className="listStack">
        {value.map((item, i) => (
          <div className="listRow" key={i} data-field-path={path ? `${path}.${i}` : undefined}>
            {rich ? (
              <RichTextEditor
                compact
                label={placeholder ?? label}
                value={item}
                onChange={(next) => update(i, next)}
              />
            ) : (
              <input
                className="input"
                value={item}
                placeholder={placeholder}
                onChange={(e) => update(i, e.target.value)}
              />
            )}
            <button
              type="button"
              className="iconBtn"
              aria-label={`Move "${item}" up`}
              disabled={i === 0}
              onClick={() => onChange(moveItem(value, i, i - 1))}
            >
              ↑
            </button>
            <button
              type="button"
              className="iconBtn"
              aria-label={`Move "${item}" down`}
              disabled={i === value.length - 1}
              onClick={() => onChange(moveItem(value, i, i + 1))}
            >
              ↓
            </button>
            <button
              type="button"
              className="iconBtn iconBtnDanger"
              aria-label={`Remove "${item}"`}
              onClick={() => onChange(value.filter((_, j) => j !== i))}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="btn btnGhost btnSm" onClick={() => onChange([...value, ""])}>
        + Add item
      </button>
    </div>
  );
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item as T);
  return next;
}

/**
 * Repeatable group of structured items (cards, features, FAQ pairs).
 * `renderItem` draws the fields for one entry; this handles the plumbing.
 */
export function RepeatableField<T>({
  label,
  hint,
  value,
  onChange,
  newItem,
  itemTitle,
  renderItem,
  addLabel = "Add",
  path,
}: {
  label: string;
  hint?: string;
  value: T[];
  onChange: (value: T[]) => void;
  newItem: () => T;
  itemTitle: (item: T, index: number) => string;
  renderItem: (
    item: T,
    update: (patch: Partial<T>) => void,
    index: number,
    itemPath: string,
  ) => ReactNode;
  addLabel?: string;
  path?: string;
}) {
  const update = (index: number, patch: Partial<T>) =>
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  return (
    <div className="field" data-field-path={path}>
      <span>
        {label}
        {hint ? <small>{hint}</small> : null}
      </span>

      <div className="repeatStack">
        {value.map((item, i) => (
          <details
            className="repeatItem"
            key={i}
            data-field-path={path ? `${path}.${i}` : undefined}
          >
            <summary>
              <span className="repeatTitle">{itemTitle(item, i) || `Item ${i + 1}`}</span>
              <span className="repeatTools">
                <button
                  type="button"
                  className="iconBtn"
                  aria-label="Move up"
                  disabled={i === 0}
                  onClick={(e) => {
                    e.preventDefault();
                    onChange(moveItem(value, i, i - 1));
                  }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="iconBtn"
                  aria-label="Move down"
                  disabled={i === value.length - 1}
                  onClick={(e) => {
                    e.preventDefault();
                    onChange(moveItem(value, i, i + 1));
                  }}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="iconBtn iconBtnDanger"
                  aria-label="Remove"
                  onClick={(e) => {
                    e.preventDefault();
                    onChange(value.filter((_, j) => j !== i));
                  }}
                >
                  ✕
                </button>
              </span>
            </summary>
            <div className="repeatBody">
              {renderItem(item, (patch) => update(i, patch), i, path ? `${path}.${i}` : "")}
            </div>
          </details>
        ))}
      </div>

      <button
        type="button"
        className="btn btnGhost btnSm"
        onClick={() => onChange([...value, newItem()])}
      >
        + {addLabel}
      </button>
    </div>
  );
}
