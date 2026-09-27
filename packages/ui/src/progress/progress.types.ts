/** Public type aliases for `<vu-progress>`. Re-exported from `progress.ts`. */

import type { VuSurfaceTone } from "../internals/utils/surface-tone.js";

/** Track thickness preset. */
export type VuProgressSize = "sm" | "md" | "lg";

/** Linear rail recipe or circular ring. */
export type VuProgressVariant = "default" | "outline" | "underline" | "ring";

/** Neutral rail weight behind the fill. */
export type VuProgressTone = VuSurfaceTone;

/** Foreground fill intent token. */
export type VuProgressColor = "default" | "primary" | "success" | "warning" | "danger";

/** Normalized bar widths for determinate mode (0–100). */
export type VuProgressWidths = {
  progress: number;
  buffer: number;
};
