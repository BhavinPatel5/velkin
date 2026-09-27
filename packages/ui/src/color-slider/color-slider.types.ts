/** Public type aliases for `<vu-color-slider>`. Re-exported from the component file. */

import type { HSL, HSV } from "../internals/utils/color-conversion.js";

/** Color model for interpreting `saturation` / `brightness` / `lightness` and keyboard steps. */
export type VuColorSliderColorSpace = "hsl" | "hsb" | "rgb";

/** Which channel the slider edits. `brightness` is HSV V (0–100); `lightness` is HSL L (0–100). */
export type VuColorSliderChannel =
  "hue" | "saturation" | "brightness" | "lightness" | "alpha" | "red" | "green" | "blue";

/** Layout axis. `horizontal` (default) is left-to-right; `vertical` for tall pickers. */
export type VuColorSliderOrientation = "horizontal" | "vertical";

/** Resolved color snapshot (HSV + HSL + RGB + alpha) after parsing `value`. */
export type VuColorSliderColor = {
  colorSpace: VuColorSliderColorSpace;
  hue: number;
  saturation: number;
  brightness: number;
  lightness: number;
  red: number;
  green: number;
  blue: number;
  hsv: HSV;
  hsl: HSL;
  alpha: number;
};

/** Detail payload for `vu-input` (continuous) and `vu-change` (commit). */
export type VuColorSliderChangeDetail = {
  /** CSS color string after the edit (same as host `value`). */
  value: string;
  color: VuColorSliderColor;
  /** Host `channel` (not normalized). */
  channel: VuColorSliderChannel;
  /** Manipulated channel in native units (deg, 0–100, 0–1, or 0–255). */
  channelValue: number;
};
