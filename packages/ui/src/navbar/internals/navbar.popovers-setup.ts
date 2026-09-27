import type { ReactiveControllerHost } from "lit";
import { PopoverController } from "../../internals/controllers/popover-controller.js";
import { clearNavbarHoverTimeouts } from "./navbar.hover.js";
import type { NavbarHoverHost } from "./navbar.hover.js";
import { navbarNestedPopoverOptions, navbarTopPopoverOptions } from "./navbar.popover.js";
import type { VuNavbarAlign, VuNavbarPlacement } from "../navbar.types.js";

/** Host surface for desktop popover controller wiring. */
export type NavbarPopoverSetupHost = NavbarHoverHost & {
  readonly placement: VuNavbarPlacement;
  readonly align: VuNavbarAlign;
  readonly offset: number;
  activePath: string[];
  topMenuOpen: boolean;
  nestedMenuOpen: boolean;
  lastTopHadSubmenuOpen: boolean;
  _topAnchorEl: HTMLElement | null;
  _nestedAnchorEl: HTMLElement | null;
  _topMenuEl: HTMLElement;
  _nestedMenuEl: HTMLElement;
  _syncingTopPopover: boolean;
  _syncingNestedPopover: boolean;
};

export type NavbarPopoverControllers = {
  top: PopoverController;
  nested: PopoverController;
};

/** Creates top and nested Popover API controllers for desktop menus. */
export function createNavbarPopoverControllers(
  host: NavbarPopoverSetupHost,
): NavbarPopoverControllers {
  const top = new PopoverController(
    host as unknown as ReactiveControllerHost,
    navbarTopPopoverOptions({
      getAnchor: () => host._topAnchorEl,
      getPopover: () => host._topMenuEl,
      cssVarLeft: "--navbar-menu-left",
      cssVarTop: "--navbar-menu-top",
      getPlacement: () => host.placement,
      getAlign: () => host.align,
      getGap: () => host.offset,
      onOpenChange: (open) => {
        host._syncingTopPopover = true;
        host.topMenuOpen = open;
        host._syncingTopPopover = false;
        if (!open) {
          host._hoverTopMenu = false;
          clearNavbarHoverTimeouts(host);
          if (!host.nestedMenuOpen) {
            host.activePath = [];
            host.lastTopHadSubmenuOpen = false;
          }
        }
      },
    }),
  );

  const nested = new PopoverController(
    host as unknown as ReactiveControllerHost,
    navbarNestedPopoverOptions({
      getAnchor: () => host._nestedAnchorEl,
      getPopover: () => host._nestedMenuEl,
      cssVarLeft: "--navbar-submenu-left",
      cssVarTop: "--navbar-submenu-top",
      onOpenChange: (open) => {
        host._syncingNestedPopover = true;
        host.nestedMenuOpen = open;
        host._syncingNestedPopover = false;
        if (!open && host.activePath.length > 1) {
          host.activePath = host.activePath.slice(0, 1);
        }
      },
    }),
  );

  return { top, nested };
}
