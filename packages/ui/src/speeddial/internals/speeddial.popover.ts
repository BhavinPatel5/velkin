import type { PopoverControllerOptions } from "../../internals/controllers/popover-controller.js";
import { cssVarToPx } from "../../internals/utils/size-resolver.js";
import type { VuSpeeddial } from "../speeddial.js";

/** PopoverController defaults for the FAB action menu cluster. */
export function speeddialPopoverOptions(host: VuSpeeddial): PopoverControllerOptions {
  return {
    getAnchor: () => host.fabAnchorEl,
    getPopover: () => host.actionsPopoverEl,
    cssVarLeft: "--speeddial-menu-left",
    cssVarTop: "--speeddial-menu-top",
    getPlacement: () => host.expand,
    getAlign: () => "center",
    getGap: () => cssVarToPx(host, "--speeddial-offset", 10),
    getPadding: () => 8,
    getMatchAnchorWidth: () => false,
    getMaxWidthToViewport: () => false,
    getMaxWidthMode: () => "cap",
    getFlip: () => false,
    getPreset: () => "scale",
    getDuration: () => 200,
    getCloseDuration: () => 150,
    getAnimateReposition: () => false,
    getRepositionMs: () => 120,
    getCloseOnEscape: () => host.closeOnEsc,
    getCloseOnOutside: () => host.closeOnOutside,
    escapeRequiresFocus: false,
    getRestoreFocusOnClose: () => true,
    focusOnOpen: () => undefined,
    onOpenChange: (open) => {
      host.onActionsPopoverOpenChange(open);
    },
  };
}
