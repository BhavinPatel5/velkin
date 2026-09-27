import type {
  CloseReason,
  PopoverAlign,
  PopoverControllerOptions,
  PopoverSide,
} from "../../internals/controllers/popover-controller.js";
import type { VuColorPickerPlacement } from "../color-picker.types.js";

const VIEWPORT_PAD = 8;

/** Host surface for swatch-trigger popover wiring. */
export type ColorPickerPopoverHost = {
  readonly placement: VuColorPickerPlacement;
  readonly open: boolean;
  readonly _triggerEl: HTMLButtonElement | null;
  readonly _popoverEl: HTMLElement | null;
  onPopoverOpenChange(open: boolean, meta: { reason: CloseReason }): void;
};

function placementToSideAlign(placement: VuColorPickerPlacement): {
  side: PopoverSide;
  align: PopoverAlign;
} {
  switch (placement) {
    case "bottom-end":
      return { side: "bottom", align: "end" };
    case "top-start":
      return { side: "top", align: "start" };
    case "top-end":
      return { side: "top", align: "end" };
    default:
      return { side: "bottom", align: "start" };
  }
}

/** PopoverController defaults for the swatch-trigger picker panel. */
export function colorPickerPopoverOptions(host: ColorPickerPopoverHost): PopoverControllerOptions {
  return {
    getAnchor: () => host._triggerEl,
    getPopover: () => host._popoverEl,
    cssVarLeft: "--color-picker-pop-left",
    cssVarTop: "--color-picker-pop-top",
    getPlacement: () => placementToSideAlign(host.placement).side,
    getAlign: () => placementToSideAlign(host.placement).align,
    getGap: () => 6,
    getPadding: () => VIEWPORT_PAD,
    getMatchAnchorWidth: () => false,
    getMaxWidthToViewport: () => true,
    getMaxWidthMode: () => "cap",
    getFlip: () => true,
    getPreset: () => "materialMenu",
    getCloseOnEscape: () => true,
    getEscapeRequiresFocus: () => false,
    getCloseOnOutside: () => true,
    getRestoreFocusOnClose: () => true,
    animateReposition: true,
    onOpenChange: (open: boolean, meta: { reason: CloseReason }) =>
      host.onPopoverOpenChange(open, meta),
  };
}
