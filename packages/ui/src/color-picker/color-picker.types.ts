/** Public type aliases for `<vu-color-picker>`. Re-exported from the component file. */

import type { VuColorAreaChannel, VuColorAreaColorSpace } from "../color-area/color-area.types.js";
import type { VuColorSliderOrientation } from "../color-slider/color-slider.types.js";
import type { HSL, HSV, RGB } from "../internals/utils/color-conversion.js";

/** Same as `<vu-color-area>` `color-space` — which model drives the 2D plane (not textual `format`). */
export type VuColorPickerPlaneColorSpace = VuColorAreaColorSpace;

/** Same as `<vu-color-area>` `x-channel` / `y-channel`. */
export type VuColorPickerPlaneChannel = VuColorAreaChannel;

/** Passed to inner `<vu-color-slider>` `orientation` for hue and alpha tracks. */
export type VuColorPickerSliderOrientation = VuColorSliderOrientation;

/** Output format used by the textual input and the `value` round-trip. */
export type VuColorPickerFormat = "hex" | "rgb" | "hsl";

/** Visual mode. `inline` renders the full picker as a stationary panel (default). `swatch` renders a small swatch button that opens the picker in a popover on click — the typical "click chip → pick a color" UX from design tools. */
export type VuColorPickerTrigger = "inline" | "swatch";

/** Anchor placement of the popover relative to the swatch trigger. Only consulted when `trigger="swatch"`. */
export type VuColorPickerPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

/** Detail payload for `vu-input` (continuous) and `vu-change` (commit). */
export type VuColorPickerChangeDetail = {
  /** The picked color as a CSS string in the active `format`. */
  value: string;
  /** Hex form (`#rrggbb` or `#rrggbbaa` when `alpha < 1`). */
  hex: string;
  /** HSV form: `{ h: 0–360, s: 0–100, v: 0–100 }`. */
  hsv: HSV;
  /** HSL form: `{ h: 0–360, s: 0–100, l: 0–100 }`. */
  hsl: HSL;
  /** RGB form: `{ r: 0–255, g: 0–255, b: 0–255 }`. */
  rgb: RGB;
  /** Alpha (0–1). */
  alpha: number;
};
