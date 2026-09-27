import type { VuSurfaceTone } from "../internals/utils/surface-tone.js";

/** Placeholder shape hint — dimensions still come from `width` / `height` / `radius`. */
export type VuSkeletonVariant = "text" | "circular" | "rectangular";

/** Shimmer treatment on the placeholder block. */
export type VuSkeletonAnimation = "wave" | "pulse" | "none";

/** Neutral surface weight behind the shimmer. */
export type VuSkeletonTone = Extract<VuSurfaceTone, "subtle" | "normal">;
