/** Visual treatment of the bar surface. */
export type VuAppbarVariant = "flat" | "outline" | "elevated";

export type { VuSurfaceTone as VuAppbarTone } from "../internals/utils/surface-tone.js";

/** Size token controlling padding, gap, and minimum bar height. */
export type VuAppbarSize = "sm" | "md" | "lg";

/** Where the bar pins to its scroll container when `sticky`. */
export type VuAppbarPlacement = "top" | "bottom";
