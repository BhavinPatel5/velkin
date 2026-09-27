import {
  hslToCss,
  hslToRgb,
  hsvToHsl,
  hsvToRgb,
  rgbToCss,
  rgbToHsl,
  rgbToHsv,
  type ParsedColor,
} from "../../internals/utils/color-conversion.js";
import type {
  VuColorSliderChannel,
  VuColorSliderColorSpace,
  VuColorSliderOrientation,
} from "../color-slider.types.js";

export const COLOR_SLIDER_CHANNELS = new Set<VuColorSliderChannel>([
  "hue",
  "saturation",
  "brightness",
  "lightness",
  "alpha",
  "red",
  "green",
  "blue",
]);

export const COLOR_SLIDER_SPACES = new Set<VuColorSliderColorSpace>(["hsl", "hsb", "rgb"]);

export function normalizeSliderChannel(raw: string): VuColorSliderChannel {
  return COLOR_SLIDER_CHANNELS.has(raw as VuColorSliderChannel)
    ? (raw as VuColorSliderChannel)
    : "hue";
}

export function normalizeSliderColorSpace(raw: string): VuColorSliderColorSpace | "" {
  if (!raw) return "";
  return COLOR_SLIDER_SPACES.has(raw as VuColorSliderColorSpace)
    ? (raw as VuColorSliderColorSpace)
    : "";
}

function gradientDir(orientation: VuColorSliderOrientation): string {
  return orientation === "horizontal" ? "to right" : "to top";
}

function buildHueTrack(
  hsv: { h: number; s: number; v: number },
  orientation: VuColorSliderOrientation,
): string {
  const dir = gradientDir(orientation);
  const { s, v } = hsv;
  const stops = [0, 60, 120, 180, 240, 300, 360].map((h) => {
    const rgb = hsvToRgb(h, s, v);
    const pct = (h / 360) * 100;
    return `${rgbToCss(rgb)} ${pct}%`;
  });
  return `linear-gradient(${dir}, ${stops.join(", ")})`;
}

function buildSaturationTrackHsv(
  h: number,
  v: number,
  orientation: VuColorSliderOrientation,
): string {
  const dir = gradientDir(orientation);
  return `linear-gradient(${dir}, ${rgbToCss(hsvToRgb(h, 0, v))}, ${rgbToCss(
    hsvToRgb(h, 100, v),
  )})`;
}

function buildSaturationTrackHsl(
  hh: number,
  ll: number,
  orientation: VuColorSliderOrientation,
): string {
  const dir = gradientDir(orientation);
  return `linear-gradient(${dir}, ${rgbToCss(hslToRgb(hh, 0, ll))}, ${rgbToCss(
    hslToRgb(hh, 100, ll),
  )})`;
}

function buildBrightnessTrack(h: number, s: number, orientation: VuColorSliderOrientation): string {
  const dir = gradientDir(orientation);
  return `linear-gradient(${dir}, rgb(0 0 0), ${rgbToCss(hsvToRgb(h, s, 100))})`;
}

function buildLightnessTrack(
  hh: number,
  ss: number,
  orientation: VuColorSliderOrientation,
): string {
  const dir = gradientDir(orientation);
  return `linear-gradient(${dir}, ${rgbToCss(hslToRgb(hh, ss, 0))}, ${rgbToCss(
    hslToRgb(hh, ss, 100),
  )})`;
}

function buildRgbChannelTrack(
  ch: "red" | "green" | "blue",
  rgb: { r: number; g: number; b: number },
  orientation: VuColorSliderOrientation,
): string {
  const dir = gradientDir(orientation);
  const { r, g, b } = rgb;
  if (ch === "red") {
    return `linear-gradient(${dir}, ${rgbToCss({ r: 0, g, b })}, ${rgbToCss({
      r: 255,
      g,
      b,
    })})`;
  }
  if (ch === "green") {
    return `linear-gradient(${dir}, ${rgbToCss({ r, g: 0, b })}, ${rgbToCss({
      r,
      g: 255,
      b,
    })})`;
  }
  return `linear-gradient(${dir}, ${rgbToCss({ r, g, b: 0 })}, ${rgbToCss({
    r,
    g,
    b: 255,
  })})`;
}

/** CSS gradient for the active channel track. */
export function buildSliderTrackSolid(
  parsed: ParsedColor,
  space: VuColorSliderColorSpace,
  ech: VuColorSliderChannel,
  orientation: VuColorSliderOrientation,
): string {
  const hsv = rgbToHsv(parsed.rgb);
  const hsl = rgbToHsl(parsed.rgb);
  if (ech === "hue") {
    return buildHueTrack(hsv, orientation);
  }
  if (ech === "saturation") {
    return space === "hsl"
      ? buildSaturationTrackHsl(hsl.h, hsl.l, orientation)
      : buildSaturationTrackHsv(hsv.h, hsv.v, orientation);
  }
  if (ech === "brightness") {
    return buildBrightnessTrack(hsv.h, hsv.s, orientation);
  }
  if (ech === "lightness") {
    return buildLightnessTrack(hsl.h, hsl.s, orientation);
  }
  if (ech === "red" || ech === "green" || ech === "blue") {
    return buildRgbChannelTrack(ech, parsed.rgb, orientation);
  }
  return hslToCss(hsvToHsl(hsv.h, hsv.s, hsv.v));
}
