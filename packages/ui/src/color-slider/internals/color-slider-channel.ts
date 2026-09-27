import {
  clamp,
  hslToRgb,
  hsvToRgb,
  parseCssColor,
  rgbToCss,
  rgbToHsl,
  rgbToHsv,
  type ParsedColor,
} from "../../internals/utils/color-conversion.js";
import { isGrayRgb } from "../../internals/utils/color-gray-hue.js";
import type {
  VuColorSliderChannel,
  VuColorSliderColor,
  VuColorSliderColorSpace,
} from "../color-slider.types.js";
import { normalizeSliderChannel, normalizeSliderColorSpace } from "./color-slider-tracks.js";

export function effectiveSliderChannel(
  space: VuColorSliderColorSpace,
  ch: VuColorSliderChannel,
): VuColorSliderChannel {
  if (ch === "lightness" && space === "hsb") return "brightness";
  if (ch === "brightness" && space === "hsl") return "lightness";
  return ch;
}

export function parseSliderColorOrFallback(value: string): ParsedColor {
  const p = parseCssColor(value);
  if (p) return p;
  return { rgb: { r: 128, g: 128, b: 128 }, alpha: 1 };
}

export function resolveSliderColorSpace(
  value: string,
  declaredSpace: VuColorSliderColorSpace | "",
  channelNorm: VuColorSliderChannel,
): VuColorSliderColorSpace {
  const declared = normalizeSliderColorSpace(declaredSpace);
  if (declared) return declared;
  const raw = value.trim().toLowerCase();
  if (raw.startsWith("hsl")) return "hsl";
  const ech = effectiveSliderChannel("hsb", channelNorm);
  if (ech === "red" || ech === "green" || ech === "blue") return "rgb";
  if (ech === "lightness") return "hsl";
  if (ech === "brightness") return "hsb";
  return "hsb";
}

export function readSliderNative(
  parsed: ParsedColor,
  space: VuColorSliderColorSpace,
  ech: VuColorSliderChannel,
  hueMemory: number,
): number {
  const { rgb, alpha } = parsed;
  const hsv = rgbToHsv(rgb);
  const hsl = rgbToHsl(rgb);
  switch (ech) {
    case "hue":
      if (space === "hsl") {
        return isGrayRgb(rgb) ? hueMemory : hsl.h;
      }
      return isGrayRgb(rgb) ? hueMemory : hsv.h;
    case "saturation":
      return space === "hsl" ? hsl.s : hsv.s;
    case "brightness":
      return hsv.v;
    case "lightness":
      return hsl.l;
    case "alpha":
      return alpha;
    case "red":
      return rgb.r;
    case "green":
      return rgb.g;
    case "blue":
      return rgb.b;
    default:
      return hsv.h;
  }
}

export function writeSliderNative(
  parsed: ParsedColor,
  space: VuColorSliderColorSpace,
  ech: VuColorSliderChannel,
  native: number,
): ParsedColor {
  const { rgb, alpha } = parsed;
  const hsv = rgbToHsv(rgb);
  const hsl = rgbToHsl(rgb);
  const n = native;
  switch (ech) {
    case "hue": {
      const nh = ((clamp(n, 0, 360) % 360) + 360) % 360;
      if (space === "hsl") {
        return { rgb: hslToRgb(nh, hsl.s, hsl.l), alpha };
      }
      return { rgb: hsvToRgb(nh, hsv.s, hsv.v), alpha };
    }
    case "saturation": {
      const ns = clamp(n, 0, 100);
      if (space === "hsl") {
        return { rgb: hslToRgb(hsl.h, ns, hsl.l), alpha };
      }
      return { rgb: hsvToRgb(hsv.h, ns, hsv.v), alpha };
    }
    case "brightness":
      return { rgb: hsvToRgb(hsv.h, hsv.s, clamp(n, 0, 100)), alpha };
    case "lightness":
      return { rgb: hslToRgb(hsl.h, hsl.s, clamp(n, 0, 100)), alpha };
    case "alpha":
      return { rgb, alpha: clamp(n, 0, 1) };
    case "red":
      return {
        rgb: { r: Math.round(clamp(n, 0, 255)), g: rgb.g, b: rgb.b },
        alpha,
      };
    case "green":
      return {
        rgb: { r: rgb.r, g: Math.round(clamp(n, 0, 255)), b: rgb.b },
        alpha,
      };
    case "blue":
      return {
        rgb: { r: rgb.r, g: rgb.g, b: Math.round(clamp(n, 0, 255)) },
        alpha,
      };
    default:
      return parsed;
  }
}

export function sliderNativeRange(ech: VuColorSliderChannel): [number, number] {
  switch (ech) {
    case "hue":
      return [0, 360];
    case "saturation":
    case "brightness":
    case "lightness":
      return [0, 100];
    case "alpha":
      return [0, 1];
    case "red":
    case "green":
    case "blue":
      return [0, 255];
    default:
      return [0, 360];
  }
}

export function sliderDefaultStep(ech: VuColorSliderChannel): number {
  switch (ech) {
    case "hue":
      return 1;
    case "alpha":
      return 0.01;
    case "red":
    case "green":
    case "blue":
      return 1;
    default:
      return 1;
  }
}

export function formatSliderParsed(parsed: ParsedColor): string {
  return rgbToCss(parsed.rgb, parsed.alpha);
}

export function sliderThumbColor(parsed: ParsedColor): string {
  const pct = Math.round(parsed.alpha * 100);
  return `color-mix(in srgb, ${rgbToCss(parsed.rgb, 1)} ${pct}%, transparent)`;
}

export function sliderToPercent(
  parsed: ParsedColor,
  space: VuColorSliderColorSpace,
  channelNorm: VuColorSliderChannel,
  hueMemory: number,
): number {
  const ech = effectiveSliderChannel(space, channelNorm);
  const [lo, hi] = sliderNativeRange(ech);
  const v = readSliderNative(parsed, space, ech, hueMemory);
  return clamp(((v - lo) / (hi - lo)) * 100, 0, 100);
}

export function sliderFromPercent(
  parsed: ParsedColor,
  space: VuColorSliderColorSpace,
  channelNorm: VuColorSliderChannel,
  pct: number,
  hueMemory: number,
): number {
  const ech = effectiveSliderChannel(space, channelNorm);
  const [lo, hi] = sliderNativeRange(ech);
  void hueMemory;
  return lo + (clamp(pct, 0, 100) / 100) * (hi - lo);
}

export function buildSliderColorObject(
  parsed: ParsedColor,
  space: VuColorSliderColorSpace,
): VuColorSliderColor {
  const hsv = rgbToHsv(parsed.rgb);
  const hsl = rgbToHsl(parsed.rgb);
  return {
    colorSpace: space,
    hue: hsv.h,
    saturation: hsv.s,
    brightness: hsv.v,
    lightness: hsl.l,
    red: parsed.rgb.r,
    green: parsed.rgb.g,
    blue: parsed.rgb.b,
    hsv,
    hsl,
    alpha: parsed.alpha,
  };
}

export function quantizeSliderChannel(ech: VuColorSliderChannel, raw: number): number {
  if (ech === "hue") return Math.round(raw);
  if (ech === "alpha") return Math.round(raw * 100) / 100;
  return Math.round(raw);
}

export function nextHueMemory(parsed: ParsedColor, prior: number): number {
  if (isGrayRgb(parsed.rgb)) return prior;
  return rgbToHsv(parsed.rgb).h;
}

export { normalizeSliderChannel };
