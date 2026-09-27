import type { PopoverAlign, PopoverPlacement } from "../internals/controllers/popover-controller.js";

/** Preferred tooltip side before collision flip; `auto` picks the best side. */
export type VuTooltipPlacement = PopoverPlacement;

/** Alignment along the trigger edge. */
export type VuTooltipAlign = PopoverAlign;

/** How the tooltip opens relative to the trigger. */
export type VuTooltipTrigger = "hover" | "click" | "both";

/** Neutral surface weight for the tooltip bubble (Role C′). */
export type VuTooltipTone = "subtle" | "normal" | "strong";

/** Bubble padding and type scale. */
export type VuTooltipSize = "sm" | "md" | "lg";

/** Bubble corner radius preset (Role C′ subset — `sm`|`md`|`lg` only; `none`/`full` stay on fields/actions). */
export type VuTooltipRadius = "sm" | "md" | "lg";

/** Floating surface recipe (Role C′). */
export type VuTooltipVariant = "elevated" | "outline" | "soft";

/** `vu-open-change` when `open` toggles (controlled / v-model:open). */
export type VuTooltipOpenChangeDetail = { open: boolean };
