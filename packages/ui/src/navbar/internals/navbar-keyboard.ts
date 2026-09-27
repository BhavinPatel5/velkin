import {
  createMenuTypeaheadState,
  handleMenuKeydown,
  menuRowIndex,
  menuRowLabel,
  resetMenuTypeahead,
  type MenuTypeaheadState,
} from "../../internals/utils/menu.js";

/** Host surface for navbar keyboard handlers. */
export type NavbarKeyboardHost = {
  readonly topMenuOpen: boolean;
  readonly nestedMenuOpen: boolean;
  topMenuItems: { submenu?: unknown[] }[];
  nestedMenuItems: { submenu?: unknown[] }[];
  openTopMenu(): void;
  closeDesktopMenus(): void;
  closeNestedMenu(): void;
  focusTopMenuRow(index: number): void;
  focusNestedMenuRow(index: number): void;
  openNestedFromRow(row: HTMLElement): void;
  activateFocusedRow(row: HTMLElement): void;
  readonly renderRoot: HTMLElement | DocumentFragment;
};

export function createNavbarTypeaheadState(): MenuTypeaheadState {
  return createMenuTypeaheadState();
}

export function resetNavbarTypeahead(state: MenuTypeaheadState): void {
  resetMenuTypeahead(state);
}

/** Top-level `[part="nav-link"]` controls inside the menubar. */
export function collectNavbarTopLinks(root: HTMLElement | DocumentFragment): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('.bar-items [part="nav-link"]'));
}

/** Focusable `.menu-row` buttons inside a menu panel. */
export function collectNavbarMenuRows(panel: HTMLElement | null): HTMLElement[] {
  if (!panel) return [];
  return Array.from(panel.querySelectorAll<HTMLElement>(".menu-row"));
}

export function focusNavbarMenuRowAt(rows: HTMLElement[], index: number): void {
  if (rows.length === 0) return;
  const len = rows.length;
  const active = ((index % len) + len) % len;
  rows.forEach((row, i) => {
    row.tabIndex = i === active ? 0 : -1;
  });
  rows[active].focus();
}

export function resetNavbarMenuRowTabindex(rows: HTMLElement[]): void {
  for (const row of rows) row.tabIndex = -1;
}

/** WAI-ARIA menubar keys for top-level nav links. */
export function handleNavbarMenubarKeydown(
  event: KeyboardEvent,
  links: HTMLElement[],
  host: NavbarKeyboardHost,
  itemHasSubmenu: (index: number) => boolean,
  openTopAt: (index: number) => void,
): void {
  if (links.length === 0) return;
  const idx = Math.max(0, menuRowIndex(links, document.activeElement));

  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = (((idx + delta) % links.length) + links.length) % links.length;
    links[next].focus();
    return;
  }

  if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
    if (!itemHasSubmenu(idx)) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        host.activateFocusedRow(links[idx]);
      }
      return;
    }
    event.preventDefault();
    openTopAt(idx);
    return;
  }

  if (event.key === "Escape" && (host.topMenuOpen || host.nestedMenuOpen)) {
    event.preventDefault();
    host.closeDesktopMenus();
    links[idx]?.focus();
  }
}

/** Vertical menu keyboard inside top or nested popover panels. */
export function handleNavbarMenuPanelKeydown(
  event: KeyboardEvent,
  rows: HTMLElement[],
  typeahead: MenuTypeaheadState,
  host: NavbarKeyboardHost,
  onFocusIndex: (index: number) => void,
  nested: boolean,
): void {
  if (rows.length === 0) return;
  const active = document.activeElement;
  const activeRow = rows.find((row) => row === active || row.contains(active as Node));
  const loopRow = activeRow ?? rows[0];

  if (nested && event.key === "ArrowLeft") {
    event.preventDefault();
    host.closeNestedMenu();
    return;
  }

  if (!nested && event.key === "ArrowRight" && activeRow) {
    const hasSub =
      activeRow.getAttribute("aria-haspopup") === "true" ||
      activeRow.getAttribute("aria-haspopup") === "menu";
    if (hasSub) {
      event.preventDefault();
      host.openNestedFromRow(activeRow);
      return;
    }
  }

  if (event.key === "Enter" || event.key === " ") {
    if (activeRow) {
      event.preventDefault();
      host.activateFocusedRow(activeRow);
    }
    return;
  }

  handleMenuKeydown(
    event,
    rows,
    loopRow ?? null,
    typeahead,
    onFocusIndex,
    menuRowLabel,
    "vertical",
  );
}
