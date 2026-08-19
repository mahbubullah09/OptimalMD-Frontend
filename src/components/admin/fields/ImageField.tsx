"use client";

import { useState } from "react";
import type { ImageData } from "@/lib/sections.types";

/**
 * Image field: source, live preview, and the text that belongs with it.
 *
 * Alt, title and description sit here rather than as separate fields
 * elsewhere in the form, because an image and its describing text are one
 * decision — splitting them is how images end up shipped with empty alt
 * attributes.
 *
 * Uploading is not wired up yet; the URL box is the current input and the
 * upload button is deliberately absent rather than present-but-dead.
 */
export default function ImageField({
  label,
  hint,
  value,
  onChange,
  path,
}: {
  label: string;
  hint?: string;
  value: ImageData;
  onChange: (value: ImageData) => void;
  path?: string;
}) {
  const [failed, setFailed] = useState(false);
  const set = (patch: Partial<ImageData>) => onChange({ ...value, ...patch });

  return (
    <div className="field imageField" data-field-path={path}>
      <span>
        {label}
        {hint ? <small>{hint}</small> : null}
      </span>

      <div className="imagePreview">
        {value.src && !failed ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={value.src}
            alt={value.alt || "Preview"}
            title={value.title || undefined}
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="imagePreviewEmpty">
            {value.src ? "Could not load this image" : "No image yet"}
          </span>
        )}
      </div>

      {/* Size sits directly under the preview, because it is the thing you
          judge by looking at the preview. Blank means "scale naturally",
          which is the right default for everything but a logo. */}
      <div className="imageSizeRow">
        <label className="subField">
          <span>
            Width
            <small>px</small>
          </span>
          <input
            className="input"
            type="number"
            min={1}
            max={4000}
            value={value.width ?? ""}
            placeholder="auto"
            onChange={(e) => {
              const next = Number.parseInt(e.target.value, 10);
              set({ width: Number.isFinite(next) && next > 0 ? next : undefined });
            }}
          />
        </label>

        <label className="subField">
          <span>
            Height
            <small>px</small>
          </span>
          <input
            className="input"
            type="number"
            min={1}
            max={4000}
            value={value.height ?? ""}
            placeholder="auto"
            onChange={(e) => {
              const next = Number.parseInt(e.target.value, 10);
              set({ height: Number.isFinite(next) && next > 0 ? next : undefined });
            }}
          />
        </label>
      </div>

      <label className="subField">
        <span>Image URL</span>
        <input
          className="input"
          type="url"
          value={value.src}
          placeholder="https://…"
          onChange={(e) => {
            setFailed(false);
            set({ src: e.target.value });
          }}
        />
      </label>

      <label className="subField">
        <span>
          Alt text
          <small>
            Read by screen readers and used by search engines. Leave blank only if the image is
            purely decorative.
          </small>
        </span>
        <textarea
          className="textarea"
          rows={2}
          value={value.alt}
          onChange={(e) => set({ alt: e.target.value })}
        />
      </label>

      <label className="subField">
        <span>
          Title
          <small>Shown as a tooltip on hover.</small>
        </span>
        <input
          className="input"
          value={value.title ?? ""}
          onChange={(e) => set({ title: e.target.value })}
        />
      </label>

      <label className="subField">
        <span>
          Description
          <small>Longer caption. Published as schema.org image data for search engines.</small>
        </span>
        <textarea
          className="textarea"
          rows={2}
          value={value.description ?? ""}
          onChange={(e) => set({ description: e.target.value })}
        />
      </label>

      {value.src && !value.alt ? (
        <p className="alert alertWarn" role="status">
          This image has no alt text.
        </p>
      ) : null}
    </div>
  );
}
