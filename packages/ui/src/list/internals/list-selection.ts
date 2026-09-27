import type { VuListitem } from "../../list-item/list-item.js";
import type { VuListSelectionMode } from "../list.types.js";

/** True when the item is a non-interactive section header. */
export function isListSubheader(item: VuListitem): boolean {
  return String(item.subheader ?? "").trim().length > 0;
}

/** Applies `selectedValues` from the host to slotted items (property relay). */
export function applyListSelectedValues(
  items: readonly VuListitem[],
  selection: VuListSelectionMode,
  selectedValues: string[] | undefined,
): void {
  if (!items.length || selection === "none") return;

  const want = new Set(selectedValues ?? []);

  if (selection === "single") {
    const first = [...want][0];
    for (const item of items) {
      if (isListSubheader(item)) continue;
      item.selected = first !== undefined && item.value === first;
    }
    return;
  }

  for (const item of items) {
    if (isListSubheader(item)) continue;
    item.selected = want.has(item.value);
  }
}

/** Returns focusable, non-subheader items in slot order. */
export function listFocusableItems(items: readonly VuListitem[]): VuListitem[] {
  return items.filter((item) => !item.disabled && !isListSubheader(item));
}

/** Toggles selection for one activation; returns the next `selectedValues`. */
export function listSelectionAfterActivate(
  items: readonly VuListitem[],
  selection: VuListSelectionMode,
  activated: VuListitem,
): string[] {
  if (selection === "none") {
    return [];
  }

  if (selection === "single") {
    for (const item of items) {
      if (isListSubheader(item)) continue;
      item.selected = item === activated;
    }
  } else {
    activated.selected = !activated.selected;
  }

  return items.filter((i) => i.selected && !isListSubheader(i)).map((i) => i.value || "");
}
