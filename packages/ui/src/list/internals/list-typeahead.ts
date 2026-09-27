import type { VuListitem } from "../../list-item/list-item.js";

/** Label text for type-ahead and a11y (prop, then light DOM text). */
export function listItemLabel(item: VuListitem): string {
  const fromProp = item.label.trim();
  if (fromProp) return fromProp;
  return (item.textContent ?? "").trim().split(/\s+/).slice(0, 8).join(" ");
}

/** Finds the next focusable item whose label starts with `query` (case-insensitive). */
export function findListTypeaheadMatch(
  items: readonly VuListitem[],
  startIndex: number,
  query: string,
): number | null {
  const q = query.toLowerCase();
  if (!q) return null;
  const n = items.length;
  for (let offset = 1; offset <= n; offset++) {
    const idx = (startIndex + offset) % n;
    const label = listItemLabel(items[idx]!);
    if (label.toLowerCase().startsWith(q)) return idx;
  }
  return null;
}
