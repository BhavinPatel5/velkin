import type {
  CloseReason,
  PopoverControllerOptions,
  PopoverSide,
} from "../../internals/controllers/popover-controller.js";
import type { VuDrawerSide } from "../drawer.types.js";

/** Open/close durations aligned with drawer lifecycle events. */
export const DRAWER_OPEN_MS = 250;
export const DRAWER_CLOSE_MS = 200;

/** Host surface for drawer Popover API wiring. */
export type DrawerPopoverHost = {
  readonly side: VuDrawerSide;
  readonly panelElement?: HTMLElement | null;
  readonly edgeAnchorElement?: HTMLElement | null;
  focusPanel(): void;
  onPopoverOpenChange(open: boolean, meta: { reason: CloseReason }): void;
};

function sideToPlacement(side: VuDrawerSide): PopoverSide {
  return side === "left" ? "right" : "left";
}

/** PopoverController defaults for the sliding panel (`popover="manual"`). */
export function drawerPopoverOptions(host: DrawerPopoverHost): PopoverControllerOptions {
  return {
    getAnchor: () => host.edgeAnchorElement ?? null,
    getPopover: () => host.panelElement ?? null,
    getPlacement: () => sideToPlacement(host.side),
    getAlign: () => "start",
    getGap: () => 0,
    getPadding: () => 0,
    getMatchAnchorWidth: () => false,
    getMaxWidthToViewport: () => false,
    getFlip: () => false,
    getPreset: () => "materialSheet",
    getDuration: () => DRAWER_OPEN_MS,
    getCloseDuration: () => DRAWER_CLOSE_MS,
    closeOnEscape: false,
    closeOnOutside: false,
    restoreFocusOnClose: false,
    escapeRequiresFocus: false,
    animateReposition: false,
    cssVarLeft: "--drawer-panel-left",
    cssVarTop: "--drawer-panel-top",
    sideAttr: "data-side",
    focusOnOpen: () => host.focusPanel(),
    onOpenChange: (open: boolean, meta: { reason: CloseReason }) =>
      host.onPopoverOpenChange(open, meta),
  };
}
