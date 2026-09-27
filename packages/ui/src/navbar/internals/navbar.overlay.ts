import type { PopoverController } from "../../internals/controllers/popover-controller.js";
import {
  registerDismissible,
  unregisterDismissible,
  isTopDismissible,
} from "../../internals/utils/dismissible-stack.js";

/** Host surface for desktop dismiss-stack wiring. */
export type NavbarOverlayHost = {
  readonly topMenuOpen: boolean;
  readonly nestedMenuOpen: boolean;
  readonly _ready: boolean;
  readonly _syncingTopPopover: boolean;
  readonly _syncingNestedPopover: boolean;
  _overlayOpen: boolean;
  _topAnchorEl: HTMLElement | null;
  _nestedAnchorEl: HTMLElement | null;
  closeDesktopMenus(): void;
};

export function applyNavbarTopPopover(
  host: NavbarOverlayHost,
  popover: PopoverController,
  nested: PopoverController,
  previousOpen: boolean,
  topMenuOpen: boolean,
): void {
  if (!host._ready || host._syncingTopPopover) return;
  if (topMenuOpen && !popover.open) {
    if (!host._topAnchorEl) return;
    popover.openPopover();
    return;
  }
  if (!topMenuOpen && (previousOpen || popover.open)) {
    void popover.closePopover("api");
    void nested.closePopover("api");
  }
}

export function applyNavbarNestedPopover(
  host: NavbarOverlayHost,
  popover: PopoverController,
  previousOpen: boolean,
  nestedMenuOpen: boolean,
): void {
  if (!host._ready || host._syncingNestedPopover) return;
  if (nestedMenuOpen && !popover.open) {
    if (!host._nestedAnchorEl) return;
    popover.openPopover();
    return;
  }
  if (!nestedMenuOpen && (previousOpen || popover.open)) {
    void popover.closePopover("api");
  }
}

export function syncNavbarDismissStack(host: NavbarOverlayHost): void {
  const open = host.topMenuOpen || host.nestedMenuOpen;
  if (open && !host._overlayOpen) {
    registerDismissible({
      host: host as unknown as HTMLElement,
      onDismiss: () => {
        if (!isTopDismissible(host as unknown as HTMLElement)) return;
        host.closeDesktopMenus();
      },
    });
    host._overlayOpen = true;
    return;
  }
  if (!open && host._overlayOpen) teardownNavbarDismissOnly(host);
}

export function teardownNavbarDismissOnly(host: NavbarOverlayHost): void {
  unregisterDismissible(host as unknown as HTMLElement);
  host._overlayOpen = false;
}
