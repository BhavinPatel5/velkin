import type { VuSurfaceTone } from "../internals/utils/surface-tone.js";

/** Re-export for dialog consumers. */
export type VuDialogTone = VuSurfaceTone;

/** Role C surface recipe — layout/paint, not semantic intent color. */
export type VuDialogVariant = "elevated" | "outline" | "soft" | "filled" | "ghost";

/** Padding scale for header, body, and footer. */
export type VuDialogSize = "sm" | "md" | "lg";

/** Panel corner radius preset (Role C′ subset — `sm`|`md`|`lg` only; `none`/`full` stay on fields/actions). */
export type VuDialogRadius = "sm" | "md" | "lg";

/** Who initiated close — parent sets `open` false when not prevented. */
export type VuDialogCloseReason = "backdrop" | "escape" | "close-button";

/** Payload for cancelable `vu-close` — parent sets `open` false when not prevented. */
export type VuDialogCloseDetail = {
  reason: VuDialogCloseReason;
};
