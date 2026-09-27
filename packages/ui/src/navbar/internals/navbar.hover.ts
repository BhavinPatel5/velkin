import { MENU_HOVER_CLOSE_MS, MENU_HOVER_OPEN_MS } from "../../internals/utils/menu.js";

export type NavbarHoverHost = {
  effectiveMenuTrigger: "hover" | "click";
  topMenuOpen: boolean;
  _hoverTopLink: boolean;
  _hoverTopMenu: boolean;
  _hoverNestedMenu: boolean;
  _openTimeout: number | null;
  _closeTimeout: number | null;
  openTopMenu(): void;
  closeTopMenu(): void;
};

export function clearNavbarHoverTimeouts(host: NavbarHoverHost): void {
  if (host._openTimeout != null) {
    clearTimeout(host._openTimeout);
    host._openTimeout = null;
  }
  if (host._closeTimeout != null) {
    clearTimeout(host._closeTimeout);
    host._closeTimeout = null;
  }
}

export function scheduleNavbarHoverClose(host: NavbarHoverHost): void {
  clearNavbarHoverTimeouts(host);
  host._closeTimeout = window.setTimeout(() => {
    if (
      host.topMenuOpen &&
      host.effectiveMenuTrigger === "hover" &&
      !host._hoverTopLink &&
      !host._hoverTopMenu &&
      !host._hoverNestedMenu
    ) {
      host.closeTopMenu();
    }
  }, MENU_HOVER_CLOSE_MS);
}

export function onNavbarTopLinkEnter(host: NavbarHoverHost): void {
  if (host.effectiveMenuTrigger !== "hover") return;
  host._hoverTopLink = true;
  clearNavbarHoverTimeouts(host);
  host._openTimeout = window.setTimeout(() => {
    if (!host.topMenuOpen) host.openTopMenu();
  }, MENU_HOVER_OPEN_MS);
}

export function onNavbarTopLinkLeave(host: NavbarHoverHost): void {
  if (host.effectiveMenuTrigger !== "hover") return;
  host._hoverTopLink = false;
  if (!host._hoverTopMenu && !host._hoverNestedMenu) {
    scheduleNavbarHoverClose(host);
  }
}

export function onNavbarTopMenuEnter(host: NavbarHoverHost): void {
  if (host.effectiveMenuTrigger !== "hover") return;
  host._hoverTopMenu = true;
  clearNavbarHoverTimeouts(host);
}

export function onNavbarTopMenuLeave(host: NavbarHoverHost): void {
  if (host.effectiveMenuTrigger !== "hover") return;
  host._hoverTopMenu = false;
  if (!host._hoverTopLink && !host._hoverNestedMenu) {
    scheduleNavbarHoverClose(host);
  }
}

export function onNavbarNestedMenuEnter(host: NavbarHoverHost): void {
  if (host.effectiveMenuTrigger !== "hover") return;
  host._hoverNestedMenu = true;
  clearNavbarHoverTimeouts(host);
}

export function onNavbarNestedMenuLeave(host: NavbarHoverHost): void {
  if (host.effectiveMenuTrigger !== "hover") return;
  host._hoverNestedMenu = false;
  if (!host._hoverTopLink && !host._hoverTopMenu) {
    scheduleNavbarHoverClose(host);
  }
}
