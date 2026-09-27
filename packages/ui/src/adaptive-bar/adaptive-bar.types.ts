import type { VuSurfaceTone } from "../internals/utils/surface-tone.js";
import type { PopoverSide } from "../internals/controllers/popover-controller.js";

export type VuAdaptiveBarOpenChangeDetail = { open: boolean };

/** Visual treatment of the bar surface (Role D). */
export type VuAdaptiveBarVariant = "flat" | "outline" | "elevated";

export type VuAdaptiveBarTone = VuSurfaceTone;

/** Padding, gap, and minimum bar height. */
export type VuAdaptiveBarSize = "sm" | "md" | "lg";

/** Main-row item alignment along the inline axis. */
export type VuAdaptiveBarJustify = "start" | "center" | "end";

/** Popover side before collision flip. */
export type VuAdaptiveBarPlacement = PopoverSide;
