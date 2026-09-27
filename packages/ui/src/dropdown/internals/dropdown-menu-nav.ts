import { VuDivider } from "../../divider/divider.js";
import { VuDropdownItem } from "../../dropdown-item/dropdown-item.js";

/** Collects focusable menu rows in slot order (includes disabled; skips dividers). */
export function collectDropdownMenuRows(assigned: Element[]): HTMLElement[] {
  const rows: HTMLElement[] = [];
  for (const el of assigned) {
    if (el instanceof VuDivider) continue;
    if (el instanceof VuDropdownItem) {
      rows.push(el);
      continue;
    }
    if (!(el instanceof HTMLElement)) continue;
    if (el.getAttribute("role") === "separator") continue;
    const row = el.matches('[role="menuitem"]')
      ? el
      : el.querySelector<HTMLElement>('[role="menuitem"]');
    if (row) rows.push(row);
  }
  return rows;
}

export function focusDropdownMenuRowAt(rows: HTMLElement[], index: number): void {
  if (rows.length === 0) return;
  const len = rows.length;
  const active = ((index % len) + len) % len;
  rows.forEach((row, i) => {
    const tabIndex = i === active ? 0 : -1;
    if (row instanceof VuDropdownItem) row.menuTabIndex = tabIndex;
    else row.setAttribute("tabindex", String(tabIndex));
  });
  rows[active].focus();
}

export function resetDropdownRovingTabindex(rows: HTMLElement[]): void {
  for (const row of rows) {
    if (row instanceof VuDropdownItem) row.menuTabIndex = -1;
    else row.setAttribute("tabindex", "-1");
  }
}

export function findActiveDropdownMenuRow(rows: HTMLElement[]): Element | null {
  const active = document.activeElement;
  if (!active) return null;
  for (const row of rows) {
    if (row === active || row.contains(active)) return row;
    if (row instanceof VuDropdownItem && row.shadowRoot?.contains(active)) return row;
  }
  return null;
}
