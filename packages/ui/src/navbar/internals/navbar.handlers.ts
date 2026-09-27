import type { MenuTypeaheadState } from "../../internals/utils/menu.js";
import type { VuNavPanelChangeDetail } from "../../nav-panel/nav-panel.types.js";
import type { VuDrawerCloseDetail } from "../../drawer/drawer.types.js";
import { activateNavbarItem, type NavbarActivateHost } from "./navbar.activate.js";
import {
  onNavbarNestedMenuEnter,
  onNavbarNestedMenuLeave,
  onNavbarTopLinkEnter,
  onNavbarTopLinkLeave,
  onNavbarTopMenuEnter,
  onNavbarTopMenuLeave,
  type NavbarHoverHost,
} from "./navbar.hover.js";
import {
  collectNavbarMenuRows,
  collectNavbarTopLinks,
  focusNavbarMenuRowAt,
  handleNavbarMenubarKeydown,
  handleNavbarMenuPanelKeydown,
  resetNavbarTypeahead,
  type NavbarKeyboardHost,
} from "./navbar-keyboard.js";
import { measureNavbarOverflow, type NavbarOverflowMeasureHost } from "./navbar.overflow.js";
import { collapseNavbarTo, openNavbarNested, type NavbarPathHost } from "./navbar.paths.js";
import type { PopoverController } from "../../internals/controllers/popover-controller.js";
import { VU_NAVBAR_OVERFLOW_ID, type VuNavbarItem } from "../navbar.types.js";
import { navbarItemAtPath, navbarItemId, navbarPath } from "./navbar.utils.js";

/** Host surface for navbar interaction handlers. */
export type NavbarHandlerHost = NavbarHoverHost &
  NavbarPathHost &
  NavbarKeyboardHost &
  NavbarActivateHost &
  NavbarOverflowMeasureHost & {
    readonly items: VuNavbarItem[];
    readonly visibleItems: VuNavbarItem[];
    readonly overflowItems: VuNavbarItem[];
    readonly effectiveMenuTrigger: "hover" | "click";
    readonly isMegaPanel: boolean;
    readonly isMobile: boolean;
    readonly topMenuOpen: boolean;
    nestedMenuOpen: boolean;
    lastTopHadSubmenuOpen: boolean;
    activePath: string[];
    _pendingTopId: string | null;
    _topAnchorEl: HTMLElement | null;
    _topMenuEl: HTMLElement;
    _nestedMenuEl: HTMLElement;
    _menuTypeahead: MenuTypeaheadState;
    _topPopover: PopoverController;
    _nestedPopover: PopoverController;
    _isMeasuring: boolean;
    barEl: HTMLElement;
    renderRoot: HTMLElement | DocumentFragment;
    openTopMenu(): void;
    closeDesktopMenus(): void;
    setDrawerOpen(open: boolean): void;
    focusTopMenuRow(index: number): void;
    focusNestedMenuRow(index: number): void;
    _closeDesktopMenus(resetHoverState?: boolean): void;
    _barLinkItems(): VuNavbarItem[];
    _roots(): VuNavbarItem[];
    requestUpdate(): unknown;
  };

export function navbarOnTopLinkEnter(
  host: NavbarHandlerHost,
  e: Event,
  item: VuNavbarItem,
  _index: number,
): void {
  const id = navbarItemId(item);
  if (!item.submenu?.length) {
    if (host.topMenuOpen) host._closeDesktopMenus(false);
    return;
  }
  if (host.activePath[0] === id && host.topMenuOpen) return;
  host._pendingTopId = id;
  host._topAnchorEl = e.currentTarget as HTMLElement;
  if (host.effectiveMenuTrigger === "hover") {
    if (host.topMenuOpen || host.lastTopHadSubmenuOpen) {
      host.openTopMenu();
      return;
    }
    onNavbarTopLinkEnter(host);
  }
}

export function navbarOnTopLinkLeave(host: NavbarHandlerHost): void {
  onNavbarTopLinkLeave(host);
}

export function navbarOnTopLinkClick(
  host: NavbarHandlerHost,
  e: MouseEvent,
  item: VuNavbarItem,
  _index: number,
): void {
  const el = e.currentTarget as HTMLElement;
  const id = navbarItemId(item);
  if (item.submenu?.length && !item.route && !item.action) {
    e.preventDefault();
    host._pendingTopId = id;
    host._topAnchorEl = el;
    if (host.activePath[0] === id && host.topMenuOpen) host._closeDesktopMenus();
    else host.openTopMenu();
    return;
  }
  activateNavbarItem(host, item, id, e);
}

export function navbarOnMenuRowEnter(
  host: NavbarHandlerHost,
  e: Event,
  item: VuNavbarItem,
  parentPath: string | null,
): void {
  if (host.isMegaPanel) {
    collapseNavbarTo(host, parentPath);
    return;
  }
  if (!item.submenu?.length) {
    collapseNavbarTo(host, parentPath);
    return;
  }
  const el = e.currentTarget as HTMLElement;
  const p = navbarPath(parentPath, item);
  if (host.activePath[host.activePath.length - 1] === p) return;
  openNavbarNested(host, item, el, parentPath);
}

export function navbarOnMenuRowClick(
  host: NavbarHandlerHost,
  e: Event,
  item: VuNavbarItem,
  parentPath: string | null,
): void {
  e.stopPropagation();
  if (item.submenu?.length && !item.action) {
    openNavbarNested(host, item, e.currentTarget as HTMLElement, parentPath);
    return;
  }
  activateNavbarItem(host, item, navbarPath(parentPath, item), e);
}

export function navbarOnMobileDrawerClose(
  host: NavbarHandlerHost,
  e: CustomEvent<VuDrawerCloseDetail>,
): void {
  if (!e.defaultPrevented) host.setDrawerOpen(false);
}

export function navbarOnBarSlotChange(host: NavbarHandlerHost): void {
  host.requestUpdate();
  if (!host.isMobile && host.barEl && !host._isMeasuring) {
    measureNavbarOverflow(host);
  }
}

export function navbarOnNavPanelChange(
  host: NavbarHandlerHost,
  e: CustomEvent<VuNavPanelChangeDetail>,
): void {
  e.stopPropagation();
  const { value } = e.detail;
  if (!value) return;
  const item = navbarItemAtPath(host.items, value.split("/"));
  if (!item) return;
  activateNavbarItem(host, item, value, e);
}

export function navbarOnMenubarKeydown(host: NavbarHandlerHost, e: KeyboardEvent): void {
  const links = collectNavbarTopLinks(host.renderRoot);
  handleNavbarMenubarKeydown(
    e,
    links,
    host,
    (index) => !!host._barLinkItems()[index]?.submenu?.length,
    (index) => {
      const item = host._barLinkItems()[index];
      if (!item) return;
      host._pendingTopId = navbarItemId(item);
      host._topAnchorEl = links[index] ?? null;
      host.openTopMenu();
    },
  );
}

export function navbarOnTopMenuKeydown(host: NavbarHandlerHost, e: KeyboardEvent): void {
  const rows = collectNavbarMenuRows(host._topMenuEl);
  handleNavbarMenuPanelKeydown(
    e,
    rows,
    host._menuTypeahead,
    host,
    (index) => host.focusTopMenuRow(index),
    false,
  );
}

export function navbarOnNestedMenuKeydown(host: NavbarHandlerHost, e: KeyboardEvent): void {
  const rows = collectNavbarMenuRows(host._nestedMenuEl);
  handleNavbarMenuPanelKeydown(
    e,
    rows,
    host._menuTypeahead,
    host,
    (index) => host.focusNestedMenuRow(index),
    true,
  );
}

export function navbarCloseNestedMenu(host: NavbarHandlerHost): void {
  const nestedPath = host.activePath[host.activePath.length - 1] ?? "";
  host.nestedMenuOpen = false;
  if (host.activePath.length > 1) {
    host.activePath = host.activePath.slice(0, 1);
  }
  void (host as unknown as { updateComplete: Promise<unknown> }).updateComplete.then(() => {
    const rows = collectNavbarMenuRows(host._topMenuEl);
    const idx = rows.findIndex((row) => row.dataset.path === nestedPath);
    host.focusTopMenuRow(idx >= 0 ? idx : 0);
  });
}

export function navbarFocusTopMenuRow(host: NavbarHandlerHost, index: number): void {
  const rows = collectNavbarMenuRows(host._topMenuEl);
  resetNavbarTypeahead(host._menuTypeahead);
  focusNavbarMenuRowAt(rows, index);
}

export function navbarFocusNestedMenuRow(host: NavbarHandlerHost, index: number): void {
  const rows = collectNavbarMenuRows(host._nestedMenuEl);
  resetNavbarTypeahead(host._menuTypeahead);
  focusNavbarMenuRowAt(rows, index);
}

export function navbarOpenNestedFromRow(host: NavbarHandlerHost, row: HTMLElement): void {
  const path = row.dataset.path;
  if (!path) return;
  const segments = path.split("/");
  const item = navbarItemAtPath(host._roots(), segments);
  if (!item?.submenu?.length) return;
  const parentPath =
    segments.length <= 1 ? (host.activePath[0] ?? null) : segments.slice(0, -1).join("/");
  openNavbarNested(host, item, row, parentPath);
}

export function navbarActivateFocusedRow(host: NavbarHandlerHost, row: HTMLElement): void {
  const path = row.dataset.path;
  if (!path) {
    row.click();
    return;
  }
  const item = navbarItemAtPath(host._roots(), path.split("/"));
  if (item) activateNavbarItem(host, item, path);
}

export function navbarBarLinkItems(host: NavbarHandlerHost): VuNavbarItem[] {
  const items = [...host.visibleItems];
  if (host.overflowItems.length) {
    items.push({
      id: VU_NAVBAR_OVERFLOW_ID,
      submenu: host.overflowItems,
    });
  }
  return items;
}

export const navbarHoverHandlers = {
  onTopMenuEnter: (host: NavbarHoverHost) => onNavbarTopMenuEnter(host),
  onTopMenuLeave: (host: NavbarHoverHost) => onNavbarTopMenuLeave(host),
  onNestedMenuEnter: (host: NavbarHoverHost) => onNavbarNestedMenuEnter(host),
  onNestedMenuLeave: (host: NavbarHoverHost) => onNavbarNestedMenuLeave(host),
};
