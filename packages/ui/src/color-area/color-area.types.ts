/** Public type aliases for `<vu-color-area>`. Re-exported from the component file. */

import type { HSL, HSV, RGB } from "../internals/utils/color-conversion.js";

/** Which color model drives output strings and how `hue` / `saturation` / `brightness` decode. */
export type VuColorAreaColorSpace = "hsb" | "hsl" | "rgb";

/** Plane axis channel (X and Y both use this set). `lightness` is HSL L (0–100); `brightness` is HSV V (0–100). `red` / `green` / `blue` are 0–255 (cube faces; use with `colorspace="rgb"`). */
export type VuColorAreaChannel =
  "hue" | "saturation" | "brightness" | "lightness" | "red" | "green" | "blue";

/** Detail payload for `vu-input` / `vu-change`. */
export type VuColorAreaChangeDetail = {
  colorSpace: VuColorAreaColorSpace;
  xChannel: VuColorAreaChannel;
  yChannel: VuColorAreaChannel;
  value: string;
  hue: number;
  saturation: number;
  brightness: number;
  red: number;
  green: number;
  blue: number;
  hsv: HSV;
  hsl: HSL;
  rgb: RGB;
  hex: string;
  css: string;
};
