import { isMenuRowDisabled } from "../../internals/utils/menu.js";
import { VuButton } from "../../button/button.js";

/** Collects focusable action rows from the default slot (native buttons and `vu-button`). */
export function collectSpeeddialMenuRows(assigned: Element[]): HTMLElement[] {
  const rows: HTMLElement[] = [];
  for (const el of assigned) {
    if (!(el instanceof HTMLElement)) continue;
    if (el instanceof HTMLButtonElement) {
      rows.push(el);
      continue;
    }
    if (el instanceof VuButton) {
      rows.push(el);
      continue;
    }
    if (el.getAttribute("role") === "menuitem") {
      rows.push(el);
      continue;
    }
    const nested =
      el.querySelector<HTMLElement>('[role="menuitem"]') ??
      el.querySelector<HTMLButtonElement>("button");
    if (nested) rows.push(nested);
  }
  return rows;
}

/** Focusable control for a menu row (inner `<button>` for `vu-button`). */
export function speeddialRowFocusTarget(row: HTMLElement): HTMLElement | null {
  if (row instanceof HTMLButtonElement) return row;
  if (row instanceof VuButton) {
    return row.shadowRoot?.querySelector<HTMLButtonElement>('[part="base"]') ?? null;
  }
  if (row.matches("button, [href], [tabindex]")) return row;
  return row.querySelector<HTMLElement>(
    'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
  );
}

/** Whether a speed-dial row should be skipped for keyboard focus. */
export function isSpeeddialRowDisabled(row: HTMLElement): boolean {
  if (isMenuRowDisabled(row)) return true;
  if (row instanceof VuButton) return row.disabled || row.loading;
  return false;
}

/** Applies roving `tabindex` on one row. */
export function applySpeeddialRowTabIndex(row: HTMLElement, tabIndex: number): void {
  const target = speeddialRowFocusTarget(row) ?? row;
  target.setAttribute("tabindex", String(tabIndex));
}

/** Syncs `role="menuitem"` and roving tabindex for all action rows. */
export function syncSpeeddialMenuRows(rows: HTMLElement[], open: boolean): void {
  rows.forEach((row, index) => {
    row.setAttribute("role", "menuitem");
    const tabIndex = open && index === 0 ? 0 : -1;
    applySpeeddialRowTabIndex(row, tabIndex);
  });
}

/** Moves roving focus to `index`, skipping disabled rows. */
export function focusSpeeddialRowAt(rows: HTMLElement[], index: number): void {
  if (rows.length === 0) return;
  const len = rows.length;
  for (let offset = 0; offset < len; offset++) {
    const i = (((index + offset) % len) + len) % len;
    const row = rows[i];
    if (isSpeeddialRowDisabled(row)) continue;
    rows.forEach((r, ri) => applySpeeddialRowTabIndex(r, ri === i ? 0 : -1));
    speeddialRowFocusTarget(row)?.focus();
    return;
  }
}

/** Active menu row from `document.activeElement`, if any. */
export function activeSpeeddialMenuRow(rows: HTMLElement[]): HTMLElement | null {
  const active = document.activeElement;
  if (!active) return null;
  for (const row of rows) {
    if (row === active || row.contains(active)) return row;
    if (row instanceof VuButton && row.shadowRoot?.contains(active)) return row;
  }
  return null;
}
