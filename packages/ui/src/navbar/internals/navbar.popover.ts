import type { PopoverControllerOptions } from "../../internals/controllers/popover-controller.js";
import { motionDurationMs, readMotionDurationMs } from "../../internals/utils/motion.js";

/** Viewport inset for navbar menu collision math. */
export const NAVBAR_VIEWPORT_PAD = 12;

/** Gap between trigger and menu panel. */
export const NAVBAR_MENU_GAP = 8;

function navbarRepositionMs(
  getAnchor: () => HTMLElement | null,
  tier: "fast" | "normal" = "fast",
): number {
  const anchor = getAnchor();
  const host = anchor?.closest("vu-navbar") ?? anchor;
  return motionDurationMs(readMotionDurationMs(host, tier));
}

/** PopoverController defaults for the top-level dropdown panel. */
export function navbarTopPopoverOptions(
  overrides: Pick<PopoverControllerOptions, "getAnchor" | "getPopover"> &
    Partial<PopoverControllerOptions>,
): PopoverControllerOptions {
  return {
    getPlacement: () => "bottom",
    getAlign: () => "start",
    getGap: () => NAVBAR_MENU_GAP,
    getPadding: () => NAVBAR_VIEWPORT_PAD,
    getMatchAnchorWidth: () => false,
    getMaxWidthToViewport: () => true,
    getMaxWidthMode: () => "cap",
    getFlip: () => true,
    getPreset: () => "materialMenu",
    getCloseOnEscape: () => false,
    getCloseOnOutside: () => true,
    getIgnoreOutsideSelector: () => '.bar-items [part="nav-link"], [part="nested-menu"]',
    getRestoreFocusOnClose: () => false,
    flipOrder: ["bottom", "top", "right", "left"],
    animateReposition: true,
    getRepositionMs: () => navbarRepositionMs(overrides.getAnchor, "fast"),
    sideAttr: "data-side",
    respectReducedMotion: true,
    ...overrides,
  };
}

/** PopoverController defaults for nested flyout panels. */
export function navbarNestedPopoverOptions(
  overrides: Pick<PopoverControllerOptions, "getAnchor" | "getPopover"> &
    Partial<PopoverControllerOptions>,
): PopoverControllerOptions {
  return {
    getPlacement: () => "right",
    getAlign: () => "start",
    getGap: () => NAVBAR_MENU_GAP,
    getPadding: () => NAVBAR_VIEWPORT_PAD,
    getMatchAnchorWidth: () => false,
    getMaxWidthToViewport: () => true,
    getMaxWidthMode: () => "cap",
    getFlip: () => true,
    getPreset: () => "fade",
    getCloseOnEscape: () => false,
    getCloseOnOutside: () => true,
    getIgnoreOutsideSelector: () => '[part="top-menu"], [part="nested-menu"], .menu-row',
    getRestoreFocusOnClose: () => false,
    flipOrder: ["right", "left", "bottom", "top"],
    animateReposition: true,
    getRepositionMs: () => navbarRepositionMs(overrides.getAnchor, "fast"),
    sideAttr: "data-side",
    respectReducedMotion: true,
    ...overrides,
  };
}
