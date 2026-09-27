/** WAI-ARIA APG menu keyboard helpers (arrow nav, Home/End, type-ahead). */

export const MENU_TYPEAHEAD_RESET_MS = 500;

/** Hover-open delay shared by root `trigger="hover"` menus and submenu rows. */
export const MENU_HOVER_OPEN_MS = 120;

/** Hover-close delay shared by root `trigger="hover"` menus and submenu rows. */
export const MENU_HOVER_CLOSE_MS = 160;

/** Primary arrow axis for menu keyboard navigation. */
export type MenuOrientation = "vertical" | "horizontal";

/** Returns true when the row must not receive activation. */
export function isMenuRowDisabled(el: HTMLElement): boolean {
  return el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true";
}

/** Label string used for type-ahead matching. */
export function menuRowLabel(el: HTMLElement): string {
  const row = el as HTMLElement & { getLabel?: () => string };
  if (typeof row.getLabel === "function") return row.getLabel();
  return (el.textContent ?? "").trim();
}

/** Focuses the row at `index`, wrapping at both ends. */
export function focusMenuRowAt<T extends { focus(): void }>(items: T[], index: number): void {
  if (items.length === 0) return;
  const len = items.length;
  items[((index % len) + len) % len].focus();
}

/** Focuses the next row whose label starts with `prefix` (case-insensitive); returns index or -1. */
export function focusMenuRowByPrefix<T extends { focus(): void }>(
  items: T[],
  prefix: string,
  from: number,
  labelOf: (item: T) => string,
): number {
  const lower = prefix.toLowerCase();
  if (items.length === 0 || lower.length === 0) return -1;
  const start = from < 0 ? 0 : from;
  for (let offset = 1; offset <= items.length; offset++) {
    const i = (start + offset) % items.length;
    if (labelOf(items[i]).toLowerCase().startsWith(lower)) {
      items[i].focus();
      return i;
    }
  }
  return -1;
}

/** State for letter type-ahead inside an open menu. */
export type MenuTypeaheadState = {
  buffer: string;
  timer: ReturnType<typeof setTimeout> | undefined;
};

export function createMenuTypeaheadState(): MenuTypeaheadState {
  return { buffer: "", timer: undefined };
}

export function resetMenuTypeahead(state: MenuTypeaheadState): void {
  state.buffer = "";
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = undefined;
  }
}

/** Index of `active` in `items`, or -1 when not found. */
export function menuRowIndex(items: HTMLElement[], active: Element | null): number {
  if (!active) return -1;
  for (let i = 0; i < items.length; i++) {
    const row = items[i];
    if (row === active || row.contains(active as Node)) return i;
    const host = row as HTMLElement & { shadowRoot?: ShadowRoot | null };
    if (host.shadowRoot?.contains(active as Node)) return i;
  }
  return -1;
}

/** Maps popover placement to menu keyboard orientation. */
export function menuOrientationFromPlacement(
  placement: "top" | "bottom" | "left" | "right" | "auto",
  resolvedSide?: "top" | "bottom" | "left" | "right" | null,
): MenuOrientation {
  const side = placement === "auto" ? (resolvedSide ?? "bottom") : placement;
  return side === "left" || side === "right" ? "horizontal" : "vertical";
}

/** Resolved popover side from a positioned menu panel, when available. */
export function menuSideFromElement(
  panel: HTMLElement | null | undefined,
): "top" | "bottom" | "left" | "right" | null {
  const side = panel?.getAttribute("data-side");
  if (side === "top" || side === "bottom" || side === "left" || side === "right") {
    return side;
  }
  return null;
}

/**
 * Handles Arrow/Home/End and printable type-ahead for a focusable menu row list.
 * `onFocusIndex` should move roving tabindex and call `.focus()` on the target row.
 */
export function handleMenuKeydown(
  event: KeyboardEvent,
  items: HTMLElement[],
  active: Element | null,
  typeahead: MenuTypeaheadState,
  onFocusIndex: (index: number) => void,
  labelOf: (el: HTMLElement) => string = menuRowLabel,
  orientation: MenuOrientation = "vertical",
): void {
  if (items.length === 0) return;
  const idx = menuRowIndex(items, active);
  const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
  const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";

  switch (event.key) {
    case nextKey:
      event.preventDefault();
      onFocusIndex(idx + 1);
      return;
    case prevKey:
      event.preventDefault();
      onFocusIndex(idx <= 0 ? items.length - 1 : idx - 1);
      return;
    case "Home":
      event.preventDefault();
      onFocusIndex(0);
      return;
    case "End":
      event.preventDefault();
      onFocusIndex(items.length - 1);
      return;
  }

  if (
    event.key.length === 1 &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    /\S/.test(event.key)
  ) {
    event.preventDefault();
    typeahead.buffer += event.key;
    if (typeahead.timer) clearTimeout(typeahead.timer);
    typeahead.timer = setTimeout(() => resetMenuTypeahead(typeahead), MENU_TYPEAHEAD_RESET_MS);
    const startFrom = typeahead.buffer.length > 1 ? idx - 1 : idx;
    let matched = focusMenuRowByPrefix(items, typeahead.buffer, startFrom, labelOf);
    if (matched < 0 && typeahead.buffer.length > 1) {
      typeahead.buffer = event.key;
      matched = focusMenuRowByPrefix(items, typeahead.buffer, idx, labelOf);
    }
    if (matched >= 0) onFocusIndex(matched);
  }
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** First focusable element inside `root`, or `root` when it is focusable. */
export function findFocusableDescendant(root: HTMLElement): HTMLElement | null {
  if (root.matches(FOCUSABLE_SELECTOR)) return root;
  return root.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
}

/** First focusable node assigned to a trigger slot (falls back to the slot parent). */
export function findTriggerControl(
  slot: HTMLSlotElement | null,
  fallback: HTMLElement,
): HTMLElement {
  const assigned = slot?.assignedElements({ flatten: true }) ?? [];
  for (const el of assigned) {
    if (!(el instanceof HTMLElement)) continue;
    const focusable = findFocusableDescendant(el);
    if (focusable) return focusable;
  }
  return fallback;
}
