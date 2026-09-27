import { VuDropdownItem } from "../../dropdown-item/dropdown-item.js";
import type { VuDropdownSelectDetail } from "../dropdown.types.js";
import { isMenuRowDisabled } from "../../internals/utils/menu.js";

/** Stable token for value-based selection (`value` attr or visible label). */
export function dropdownItemToken(el: VuDropdownItem): string {
  return el.value.trim() || el.getLabel();
}

export function syncDropdownSelectedFromValue(value: string, items: VuDropdownItem[]): void {
  const v = value.trim();
  if (!v) return;
  for (const el of items) {
    const token = dropdownItemToken(el);
    if (el.kind === "radio") el.checked = token === v;
    else if (el.kind === "checkbox") continue;
    else el.selected = token === v;
  }
}

export function clearDropdownDefaultSelections(items: VuDropdownItem[]): void {
  for (const el of items) {
    if (el.kind === "checkbox" || el.kind === "radio") continue;
    el.selected = false;
  }
}

export function syncDropdownRadioGroup(selected: VuDropdownItem, items: VuDropdownItem[]): void {
  if (selected.kind !== "radio") return;
  for (const el of items) {
    if (el.kind === "radio") el.checked = el === selected;
  }
}

export function highlightDropdownSelection(row: VuDropdownItem, items: VuDropdownItem[]): void {
  if (row.kind === "checkbox") return;
  if (row.kind === "radio") {
    syncDropdownRadioGroup(row, items);
    return;
  }
  for (const el of items) {
    el.selected = el === row;
  }
}

export function applyNestedDropdownSelect(
  detail: VuDropdownSelectDetail,
  items: VuDropdownItem[],
  setValue: (value: string) => void,
): void {
  const row = detail.item;
  if (!(row instanceof HTMLElement) || isMenuRowDisabled(row)) return;
  const kind = detail.kind ?? "default";
  if (kind !== "checkbox") setValue(detail.value);
  if (row instanceof VuDropdownItem && items.includes(row)) {
    highlightDropdownSelection(row, items);
  } else {
    clearDropdownDefaultSelections(items);
  }
}
