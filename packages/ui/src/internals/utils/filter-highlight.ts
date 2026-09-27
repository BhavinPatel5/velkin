import { html, type TemplateResult } from "lit";

type HighlightSegment = { text: string; match: boolean };

/** Split label into segments for safe filter highlighting (no unsafeHTML). */
export function splitFilterHighlight(label: string, filterText: string): HighlightSegment[] {
  const term = filterText.trim();
  if (!term) return [{ text: label, match: false }];

  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = label.split(regex);

  if (parts.length === 1) {
    return [{ text: label, match: false }];
  }

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      match: part.toLowerCase() === term.toLowerCase(),
    }));
}

/** Render label with optional filter match spans (Lit text nodes — XSS-safe). */
export function renderHighlightedLabel(
  label: string,
  filterText: string,
  options?: { part?: string; className?: string },
): TemplateResult {
  const segments = splitFilterHighlight(label, filterText);
  const part = options?.part ?? "item-label";
  const className = options?.className ?? "tree-label";
  return html`<span class=${className} part=${part}>
    ${segments.map((segment) =>
      segment.match ? html`<span class="highlight">${segment.text}</span>` : segment.text,
    )}
  </span>`;
}
