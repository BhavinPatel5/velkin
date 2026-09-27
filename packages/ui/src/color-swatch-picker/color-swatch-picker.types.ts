/** Public type aliases for `<vu-color-swatch-picker>`. Re-exported from the component file. */

import type { HSL, HSV, RGB } from "../internals/utils/color-conversion.js";
import type { VuColorSwatchShape, VuColorSwatchSize } from "../color-swatch/color-swatch.types.js";

export type { VuColorSwatchShape, VuColorSwatchSize };

/** Swatch outline forwarded to each `<vu-color-swatch>` (`shape`). */
export type VuColorSwatchPickerVariant = VuColorSwatchShape;

/** `grid` uses CSS grid; `stack` is a vertical flex list. */
export type VuColorSwatchPickerLayout = "grid" | "stack";

/** Parsed color snapshot when the selected swatch’s `color` parses as CSS. */
export type VuColorSwatchPickerColor = {
  /** CSS color string (same as `VuColorSwatchPickerChangeDetail.color`). */
  css: string;
  rgb: RGB;
  alpha: number;
  hsv: HSV;
  hsl: HSL;
  hex: string;
};

/** Detail for the `vu-change` event. */
export type VuColorSwatchPickerChangeDetail = {
  /** Controlled selection token (`swatch.value` or `swatch.color`). */
  value: string;
  /** CSS color painted on the selected swatch. */
  color: string;
  index: number;
  /** Structured color when `color` parses; otherwise `null`. */
  parsed: VuColorSwatchPickerColor | null;
};
