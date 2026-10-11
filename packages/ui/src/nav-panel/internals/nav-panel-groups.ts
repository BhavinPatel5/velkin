import type { VuNavPanelItem } from "../nav-panel.types.js";

export type NavPanelGroup = {
  key: string;
  label: string;
  items: VuNavPanelItem[];
};

/** True when the item is a static section header (not selectable). */
export function isNavPanelHeader(item: VuNavPanelItem): boolean {
  return item.kind === "header";
}

/** True when the item is a non-interactive separator row. */
export function isNavPanelDivider(item: VuNavPanelItem): boolean {
  return item.kind === "divider";
}

/** True when the item is not activatable (header or divider). */
export function isNavPanelStatic(item: VuNavPanelItem): boolean {
  return isNavPanelHeader(item) || isNavPanelDivider(item);
}

/** True when the row shows a checkbox/radio control (menubar-style). */
export function isNavPanelCheckable(item: VuNavPanelItem): boolean {
  return item.kind === "checkbox" || item.kind === "radio";
}

/** True when the item can appear in icon-rail mode (icon rows + checkable; static never show). */
export function isNavPanelRailVisible(item: VuNavPanelItem): boolean {
  if (isNavPanelStatic(item)) return false;
  if (isNavPanelCheckable(item)) return true;
  return !!item.icon?.trim();
}

/** True when any item declares a `category`. */
export function navPanelHasCategories(items: VuNavPanelItem[]): boolean {
  return items.some((item) => !isNavPanelStatic(item) && !!item.category?.trim());
}

/** Builds grouped sections; uncategorized rows land in a single flat list. */
export function buildNavPanelGroups(items: VuNavPanelItem[]): NavPanelGroup[] | null {
  if (!navPanelHasCategories(items)) return null;

  const groups = new Map<string, VuNavPanelItem[]>();
  for (const item of items) {
    const label = item.category?.trim() || "Other";
    const bucket = groups.get(label) ?? [];
    bucket.push(item);
    groups.set(label, bucket);
  }

  if (groups.size === 1 && groups.has("Other")) {
    return null;
  }

  return Array.from(groups.entries()).map(([label, groupItems], index) => ({
    key: `${label}-${index}`,
    label,
    items: groupItems,
  }));
}

/** Flat item list in visual order (for keyboard lookup). */
export function flattenNavPanelItems(
  items: VuNavPanelItem[],
  groups: NavPanelGroup[] | null,
): VuNavPanelItem[] {
  if (!groups) return items;
  return groups.flatMap((group) => group.items);
}

/** Stable group keys for the current `items` list. */
export function collectNavPanelGroupKeys(items: VuNavPanelItem[]): string[] {
  const groups = buildNavPanelGroups(items);
  return groups?.map((group) => group.key) ?? [];
}

/** Merges known group keys into `collapsedGroups` (default expanded). */
export function mergeNavPanelCollapsedGroups(
  items: VuNavPanelItem[],
  current: Record<string, boolean>,
): Record<string, boolean> {
  const keys = collectNavPanelGroupKeys(items);
  if (!keys.length) return current;

  const next = { ...current };
  for (const key of keys) {
    if (!(key in next)) next[key] = false;
  }
  return next;
}

/** Hint string for collapsed rows (label, description, badge). */
export function navPanelRowHint(item: VuNavPanelItem): string {
  const parts = [item.label.trim()];
  if (item.description?.trim()) parts.push(item.description.trim());
  if (item.badge?.trim()) parts.push(item.badge.trim());
  return parts.join(" · ");
}

/** Stable row value key. */
export function navPanelRowValue(item: VuNavPanelItem, index: number): string {
  return item.value ?? `${item.label}-${index}`;
}

/** `rel` for external anchors. */
export function navPanelRowRel(item: VuNavPanelItem): string | undefined {
  if (item.rel?.trim()) return item.rel.trim();
  if (item.target === "_blank") return "noopener noreferrer";
  return undefined;
}
