import {
  MENU_HOVER_CLOSE_MS,
  MENU_HOVER_OPEN_MS,
} from "../../internals/utils/menu.js";
import type {
  VuDropdownSubmenuHost,
  VuDropdownSubmenuHoverDetail,
  VuDropdownSize,
} from "../../dropdown/dropdown.types.js";
import type { VuDropdownItemColor } from "../dropdown-item.types.js";

/** Nested flyout host wired from `slot="submenu"`. */
export type SubmenuFlyout = VuDropdownSubmenuHost;

/** Host surface for nested flyout wiring and hover open/close timers. */
export type DropdownItemSubmenuHost = {
  disabled: boolean;
  readonly _hasSubmenu: boolean;
  readonly _submenuSlot: HTMLSlotElement | undefined;
  _submenuFlyout: SubmenuFlyout | null;
  _submenuChangeHandler: ((e: Event) => void) | null;
  _submenuHoverHandler: ((e: Event) => void) | null;
  _submenuOpenTimeout: number | null;
  _submenuCloseTimeout: number | null;
  children: HTMLCollection;
  querySelector(selectors: string): Element | null;
  closest(selectors: string): Element | null;
  requestUpdate(): void;
  openSubmenu(): void;
  closeSubmenu(): void;
};

export function promoteDropdownItemSubmenuFlyouts(host: DropdownItemSubmenuHost): void {
  for (const child of host.children) {
    if (
      child instanceof HTMLElement &&
      child.tagName.toLowerCase() === "vu-dropdown" &&
      !child.hasAttribute("slot")
    ) {
      child.setAttribute("slot", "submenu");
    }
  }
}

export function onDropdownItemSubmenuSlotChange(host: DropdownItemSubmenuHost): void {
  const assigned = host._submenuSlot?.assignedElements({ flatten: true }) ?? [];
  let flyout: SubmenuFlyout | null =
    assigned.find(
      (el): el is SubmenuFlyout =>
        el instanceof HTMLElement &&
        typeof (el as SubmenuFlyout).bindSubmenuAnchor === "function",
    ) ?? null;
  if (!flyout) {
    flyout =
      (host.querySelector(':scope > vu-dropdown[slot="submenu"]') as SubmenuFlyout | null) ??
      (host.querySelector(":scope > vu-dropdown:not([slot])") as SubmenuFlyout | null);
  }
  if (flyout && typeof flyout.bindSubmenuAnchor !== "function") {
    void customElements.whenDefined("vu-dropdown").then(() => {
      if (typeof (flyout as SubmenuFlyout).bindSubmenuAnchor === "function") {
        wireDropdownItemSubmenu(host, flyout as SubmenuFlyout);
        host.requestUpdate();
      }
    });
    return;
  }
  const hadSubmenu = host._hasSubmenu;
  wireDropdownItemSubmenu(host, flyout ?? null);

  if (host._hasSubmenu !== hadSubmenu) queueMicrotask(() => host.requestUpdate());
}

export function wireDropdownItemSubmenu(
  host: DropdownItemSubmenuHost,
  flyout: SubmenuFlyout | null,
): void {
  unwireDropdownItemSubmenu(host);
  host._submenuFlyout = flyout;
  if (!flyout) return;
  if (!flyout.hasAttribute("slot")) {
    flyout.setAttribute("slot", "submenu");
  }
  flyout.trigger = "submenu";
  flyout.bindSubmenuAnchor(host as unknown as HTMLElement);
  relayDropdownItemMenuPropsToFlyout(host, flyout);
  host._submenuChangeHandler = () => host.requestUpdate();
  flyout.addEventListener("vu-change", host._submenuChangeHandler);
  host._submenuHoverHandler = (e: Event) => {
    const phase = (e as CustomEvent<VuDropdownSubmenuHoverDetail>).detail?.phase;
    if (phase === "enter") clearDropdownItemSubmenuHoverTimers(host);
    else if (phase === "leave") scheduleDropdownItemSubmenuHoverClose(host);
  };
  flyout.addEventListener("vu-submenuhover", host._submenuHoverHandler);
}

export function unwireDropdownItemSubmenu(host: DropdownItemSubmenuHost): void {
  const flyout = host._submenuFlyout;
  if (flyout && host._submenuChangeHandler) {
    flyout.removeEventListener("vu-change", host._submenuChangeHandler);
  }
  if (flyout && host._submenuHoverHandler) {
    flyout.removeEventListener("vu-submenuhover", host._submenuHoverHandler);
  }
  host._submenuChangeHandler = null;
  host._submenuHoverHandler = null;
  host._submenuFlyout = null;
  clearDropdownItemSubmenuHoverTimers(host);
}

/** Copies root menu `size` / `itemColor` onto a flyout when it has not set its own. */
function relayDropdownItemMenuPropsToFlyout(
  host: DropdownItemSubmenuHost,
  flyout: SubmenuFlyout,
): void {
  const menu = host.closest("vu-dropdown") as
    | (HTMLElement & { size?: VuDropdownSize; itemColor?: VuDropdownItemColor })
    | null;
  if (!menu) return;
  if (!flyout.hasAttribute("size") && menu.size) flyout.size = menu.size;
  if (!flyout.hasAttribute("itemcolor") && menu.itemColor && menu.itemColor !== "default") {
    flyout.itemColor = menu.itemColor;
  }
}

export function clearDropdownItemSubmenuHoverTimers(host: DropdownItemSubmenuHost): void {
  if (host._submenuOpenTimeout != null) {
    clearTimeout(host._submenuOpenTimeout);
    host._submenuOpenTimeout = null;
  }
  if (host._submenuCloseTimeout != null) {
    clearTimeout(host._submenuCloseTimeout);
    host._submenuCloseTimeout = null;
  }
}

export const onDropdownItemRowPointerEnter = (host: DropdownItemSubmenuHost): void => {
  if (!host._hasSubmenu || host.disabled || !dropdownItemParentMenuOpen(host)) return;
  clearDropdownItemSubmenuHoverTimers(host);
  host._submenuOpenTimeout = window.setTimeout(() => {
    if (host._hasSubmenu && !host.disabled && dropdownItemParentMenuOpen(host)) {
      host.openSubmenu();
    }
  }, MENU_HOVER_OPEN_MS);
};

export const onDropdownItemRowPointerLeave = (host: DropdownItemSubmenuHost): void => {
  if (!host._hasSubmenu) return;
  if (host._submenuOpenTimeout != null) {
    clearTimeout(host._submenuOpenTimeout);
    host._submenuOpenTimeout = null;
  }
  scheduleDropdownItemSubmenuHoverClose(host);
};

export function scheduleDropdownItemSubmenuHoverClose(host: DropdownItemSubmenuHost): void {
  clearDropdownItemSubmenuHoverTimers(host);
  host._submenuCloseTimeout = window.setTimeout(() => {
    host.closeSubmenu();
  }, MENU_HOVER_CLOSE_MS);
}

function dropdownItemParentMenuOpen(host: DropdownItemSubmenuHost): boolean {
  const menu = host.closest("vu-dropdown") as { open?: boolean } | null;
  return !!menu?.open;
}
