import type { VuSurfaceTone } from "../internals/utils/surface-tone.js";

/** Re-export for drawer consumers. */
export type VuDrawerTone = VuSurfaceTone;

/** Role C surface recipe for the slide-in panel. */
export type VuDrawerVariant = "elevated" | "outline" | "soft" | "filled" | "ghost";

/** Padding scale for header, body, and footer regions together. */
export type VuDrawerSize = "sm" | "md" | "lg";

/** Panel corner radius preset (Role C′ subset — `sm`|`md`|`lg` only; `none`/`full` stay on fields/actions). */
export type VuDrawerRadius = "sm" | "md" | "lg";

/** Edge the panel slides in from. */
export type VuDrawerSide = "left" | "right";

/** Who initiated close — parent sets `open` false when not prevented. */
export type VuDrawerCloseReason = "backdrop" | "escape" | "close-button";

/** Payload for cancelable `vu-close` — parent sets `open` false when not prevented. */
export type VuDrawerCloseDetail = {
  reason: VuDrawerCloseReason;
};
