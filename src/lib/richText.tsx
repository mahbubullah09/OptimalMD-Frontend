import type { CSSProperties, ReactNode } from "react";
import { type MarkerNode, parseMarkers, specCss } from "./markerParser";

/**
 * Renders CMS copy written in the inline marker syntax.
 *
 *   **text**                      -> <strong>, tinted by the section's CSS
 *   *text*                        -> <em>
 *   {{blue|text}} / {{green|text}} -> brand tones
 *   {{#1FA9E8|text}}              -> any solid colour
 *   {{grad:#0B2545,#1FA9E8|text}} -> gradient-filled text
 *   a new line                    -> <br />
 *
 * Returns React elements, never `dangerouslySetInnerHTML`, so CMS content can
 * never inject markup. Colour values are validated as hex during parsing, so a
 * malformed one renders its text unstyled instead of reaching a style
 * attribute.
 */
function render(nodes: MarkerNode[], keyPrefix = "r"): ReactNode[] {
  return nodes.map((node, i) => {
    const key = `${keyPrefix}-${i}`;

    switch (node.type) {
      case "text":
        return node.value;
      case "break":
        return <br key={key} />;
      case "bold":
        return <strong key={key}>{render(node.children, key)}</strong>;
      case "italic":
        return <em key={key}>{render(node.children, key)}</em>;
      case "color": {
        // An unrecognised colour still shows its text — losing copy is worse
        // than losing a tint.
        if (!node.spec) return <span key={key}>{render(node.children, key)}</span>;

        if (node.spec.kind === "tone") {
          return (
            <span
              key={key}
              className={node.spec.tone === "blue" ? "tone-blue" : "tone-green"}
            >
              {render(node.children, key)}
            </span>
          );
        }

        return (
          <span key={key} style={specCss(node.spec) as CSSProperties}>
            {render(node.children, key)}
          </span>
        );
      }
      default:
        return null;
    }
  });
}

export function richText(input: string | undefined | null): ReactNode {
  if (!input) return null;
  return render(parseMarkers(input));
}
