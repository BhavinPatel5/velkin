import type { PropertyValues } from "lit";
import type { PopoverController } from "../../internals/controllers/popover-controller.js";
import {
  canUseRaf,
  canUseResizeObserver,
  isClient,
} from "../../internals/utils/env.js";
import { ensureNavbarHistoryPatch } from "./navbar.history.js";
import { clearNavbarHoverTimeouts, type NavbarHoverHost } from "./navbar.hover.js";
import type { MenuTypeaheadState } from "../../internals/utils/menu.js";
import { resetNavbarTypeahead } from "./navbar-keyboard.js";
import { measureNavbarOverflow, type NavbarOverflowMeasureHost } from "./navbar.overflow.js";
import {
  applyNavbarNestedPopover,
  applyNavbarTopPopover,
  syncNavbarDismissStack,
  teardownNavbarDismissOnly,
  type NavbarOverlayHost,
} from "./navbar.overlay.js";
import {
  setupNavbarStickyObserver,
  type NavbarStickyHandle,
  type NavbarStickyHost,
} from "./navbar-sticky.js";
import type { VuNavbarItem } from "../navbar.types.js";

/** Host surface for navbar lifecycle and reactive updates. */
export type NavbarLifecycleHost = NavbarOverlayHost &
  NavbarHoverHost &
  NavbarStickyHost &
  NavbarOverflowMeasureHost & {
    readonly breakpoint: number;
    readonly items: VuNavbarItem[];
    readonly overflowThreshold: number;
    readonly placement: string;
    readonly align: string;
    readonly offset: number;
    readonly sticky: boolean;
    readonly condense: boolean;
    readonly justifyBar: string;
    readonly justifyBarItems: string;
    isMobile: boolean;
    topMenuOpen: boolean;
    nestedMenuOpen: boolean;
    activePath: string[];
    lastTopHadSubmenuOpen: boolean;
    activeRoute: string | null;
    barEl: HTMLElement;
    _ready: boolean;
    _isMeasuring: boolean;
    _measurementRequested: boolean;
    _menuTypeahead: MenuTypeaheadState;
    _topPopover: PopoverController;
    _nestedPopover: PopoverController;
    _resizeObs?: ResizeObserver;
    _stickyHandle: NavbarStickyHandle | null;
    _overlayHost: NavbarOverlayHost;
    _winResize: () => void;
    _onLocationChange: () => void;
    focusTopMenuRow(index: number): void;
    focusNestedMenuRow(index: number): void;
    _closeDesktopMenus(resetHoverState?: boolean): void;
    setDrawerOpen(open: boolean): void;
    setStuck(stuck: boolean): void;
  };

export function navbarOnConnected(host: NavbarLifecycleHost): void {
  if (!isClient()) return;
  window.addEventListener("resize", host._winResize, { passive: true });
  window.addEventListener("popstate", host._onLocationChange);
  window.addEventListener("hashchange", host._onLocationChange);
  ensureNavbarHistoryPatch();
  window.addEventListener("location-changed", host._onLocationChange);

  navbarOnLocationChange(host);
}

export function navbarOnDisconnected(host: NavbarLifecycleHost): void {
  if (isClient()) {
    window.removeEventListener("resize", host._winResize);
    window.removeEventListener("popstate", host._onLocationChange);
    window.removeEventListener("hashchange", host._onLocationChange);
    window.removeEventListener("location-changed", host._onLocationChange);
  }
  clearNavbarHoverTimeouts(host);
  host._resizeObs?.disconnect();
  host._stickyHandle?.disconnect();
  host._stickyHandle = null;
  if (host._overlayOpen) teardownNavbarDismissOnly(host._overlayHost);
  host._ready = false;
}

export function navbarOnFirstUpdated(host: NavbarLifecycleHost): void {
  host._ready = true;

  const boot = () => {
    if (!(host as unknown as Element).isConnected) return;
    navbarSyncResponsive(host);
    host._topPopover.refreshTargets();
    host._nestedPopover.refreshTargets();
    navbarSyncStickyObserver(host);
    navbarEnsureOverflowObserver(host);
  };
  if (canUseRaf()) requestAnimationFrame(boot);
  else queueMicrotask(boot);
}

export function navbarWillUpdate(
  host: NavbarLifecycleHost,
  changed: PropertyValues,
): void {
  const el = host as unknown as HTMLElement;
  if (el.style && typeof el.style.setProperty === "function") {
    if (changed.has("justifyBarItems")) {
      el.style.setProperty("--justify-bar-items", host.justifyBarItems);
    }
    if (changed.has("justifyBar")) {
      el.style.setProperty("--justify-bar", host.justifyBar);
    }
    if (changed.has("justifyBar") || changed.has("justifyBarItems")) {
      const barItemsGrow = host.justifyBar !== "center" ? "1 1 auto" : "0 0 auto";
      el.style.setProperty("--grow-slot", "0 0 auto");
      el.style.setProperty("--grow-bar-items", barItemsGrow);
    }
  }
  if (changed.has("breakpoint") && isClient()) {
    const nextMobile = window.innerWidth <= host.breakpoint;
    if (host.isMobile !== nextMobile) host.isMobile = nextMobile;
  }
  if (changed.has("isMobile") && host.isMobile) {
    host._closeDesktopMenus();
  }
  if (
    !host.isMobile &&
    host.barEl &&
    (changed.has("items") || changed.has("overflowThreshold")) &&
    !host._isMeasuring
  ) {
    requestAnimationFrame(() => measureNavbarOverflow(host));
  }
}

export function navbarOnUpdated(
  host: NavbarLifecycleHost,
  changed: PropertyValues,
): void {
  if (host._ready && changed.has("topMenuOpen")) {
    applyNavbarTopPopover(
      host._overlayHost,
      host._topPopover,
      host._nestedPopover,
      Boolean(changed.get("topMenuOpen")),
      host.topMenuOpen,
    );
    if (host.topMenuOpen) {
      void (host as unknown as { updateComplete: Promise<unknown> }).updateComplete.then(() =>
        host.focusTopMenuRow(0),
      );
    }
  }
  if (host._ready && changed.has("nestedMenuOpen")) {
    applyNavbarNestedPopover(
      host._overlayHost,
      host._nestedPopover,
      Boolean(changed.get("nestedMenuOpen")),
      host.nestedMenuOpen,
    );
    if (host.nestedMenuOpen) {
      void (host as unknown as { updateComplete: Promise<unknown> }).updateComplete.then(() =>
        host.focusNestedMenuRow(0),
      );
    }
  }
  if (host._ready && host.topMenuOpen && changed.has("activePath")) {
    host._topPopover.refreshTargets();
  }
  if (host._ready && host.nestedMenuOpen && changed.has("activePath")) {
    host._nestedPopover.refreshTargets();
  }
  if (changed.has("topMenuOpen") || changed.has("nestedMenuOpen")) {
    syncNavbarDismissStack(host._overlayHost);
  }
  if (changed.has("placement") || changed.has("align") || changed.has("offset")) {
    host._topPopover.refreshTargets();
  }
  if (changed.has("sticky") || changed.has("condense")) {
    navbarSyncStickyObserver(host);
  }
  if (changed.has("isMobile") && !host.isMobile) {
    navbarEnsureOverflowObserver(host);
  }
}

export function navbarSyncResponsive(host: NavbarLifecycleHost): void {
  if (!isClient()) return;
  const next = window.innerWidth <= host.breakpoint;
  const was = host.isMobile;
  if (next === was) {
    if (!next) navbarEnsureOverflowObserver(host);
    return;
  }
  host.isMobile = next;
  host._closeDesktopMenus();
  if (host.isMobile) {
    host._resizeObs?.disconnect();
    host._resizeObs = undefined;
  } else {
    navbarEnsureOverflowObserver(host);
    measureNavbarOverflow(host);
    host.setDrawerOpen(false);
  }
}

function navbarEnsureOverflowObserver(host: NavbarLifecycleHost): void {
  if (host.isMobile || !host.barEl || !canUseResizeObserver()) return;
  if (!host._resizeObs) {
    host._resizeObs = new ResizeObserver(() => {
      if (!host._isMeasuring) measureNavbarOverflow(host);
      else host._measurementRequested = true;
    });
  }
  host._resizeObs.observe(host.barEl);
}

export function navbarCloseDesktopMenus(
  host: NavbarLifecycleHost,
  resetHoverState = true,
): void {
  clearNavbarHoverTimeouts(host);
  resetNavbarTypeahead(host._menuTypeahead);
  host.topMenuOpen = false;
  host.nestedMenuOpen = false;
  host.activePath = [];
  if (resetHoverState) host.lastTopHadSubmenuOpen = false;
  teardownNavbarDismissOnly(host._overlayHost);
}

export function navbarSyncStickyObserver(host: NavbarLifecycleHost): void {
  host._stickyHandle?.disconnect();
  host._stickyHandle = null;
  if (!host._ready || !host.sticky || !host.condense) return;
  host._stickyHandle = setupNavbarStickyObserver(
    host,
    host as unknown as HTMLElement,
  );
}

export function navbarOnLocationChange(host: NavbarLifecycleHost): void {
  if (!isClient()) return;
  const next = window.location.pathname || null;
  if (host.activeRoute === next) return;
  host.activeRoute = next;
}
