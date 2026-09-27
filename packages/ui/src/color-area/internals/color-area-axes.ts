import { clamp, hslToRgb, hsvToRgb, type RGB } from "../../internals/utils/color-conversion.js";
import type { VuColorAreaChannel, VuColorAreaColorSpace } from "../color-area.types.js";

export const COLOR_AREA_HUE_PCT = 360 / 100;

export const COLOR_AREA_CHANNEL_ORDER: VuColorAreaChannel[] = [
  "hue",
  "saturation",
  "brightness",
  "lightness",
  "red",
  "green",
  "blue",
];

export type ColorAreaAxisState = {
  colorSpace: VuColorAreaColorSpace;
  xChannel: VuColorAreaChannel;
  yChannel: VuColorAreaChannel;
  hue: number;
  saturation: number;
  brightness: number;
  red: number;
  green: number;
  blue: number;
};

export function capChannelLabel(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function isColorAreaRgbChannel(ch: VuColorAreaChannel): boolean {
  return ch === "red" || ch === "green" || ch === "blue";
}

export function colorAreaIsHsl(colorSpace: VuColorAreaColorSpace): boolean {
  return colorSpace === "hsl";
}

export function normalizeColorAreaChannel(raw: string): VuColorAreaChannel {
  const s = raw as VuColorAreaChannel;
  return COLOR_AREA_CHANNEL_ORDER.includes(s) ? s : "saturation";
}

function pickDistinctY(x: VuColorAreaChannel): VuColorAreaChannel {
  for (const c of COLOR_AREA_CHANNEL_ORDER) {
    if (c !== x) return c;
  }
  return "brightness";
}

function sameSemanticL(a: VuColorAreaChannel, b: VuColorAreaChannel): boolean {
  return (a === "brightness" && b === "lightness") || (a === "lightness" && b === "brightness");
}

function planeValid(
  colorSpace: VuColorAreaColorSpace,
  x: VuColorAreaChannel,
  y: VuColorAreaChannel,
): boolean {
  if (x === y) return false;
  if (sameSemanticL(x, y)) return false;
  const xr = isColorAreaRgbChannel(x);
  const yr = isColorAreaRgbChannel(y);
  if (xr !== yr) return false;
  if (xr) return colorSpace === "rgb";
  if (colorSpace === "hsb" || colorSpace === "rgb") {
    if (x === "lightness" || y === "lightness") return false;
  }
  return true;
}

export function effectiveColorAreaAxes(state: ColorAreaAxisState): {
  x: VuColorAreaChannel;
  y: VuColorAreaChannel;
} {
  let x = normalizeColorAreaChannel(state.xChannel);
  let y = normalizeColorAreaChannel(state.yChannel);
  if (x === y) {
    if (x === "hue") return { x: "saturation", y: "brightness" };
    y = pickDistinctY(x);
  }
  if (sameSemanticL(x, y)) y = x === "brightness" ? "hue" : "brightness";
  if (!planeValid(state.colorSpace, x, y)) {
    x = "saturation";
    y = "brightness";
  }
  return { x, y };
}

export function usesColorAreaRgbAxes(state: ColorAreaAxisState): boolean {
  const { x, y } = effectiveColorAreaAxes(state);
  return isColorAreaRgbChannel(x) || isColorAreaRgbChannel(y);
}

export function useCssHsvColorAreaPlane(state: ColorAreaAxisState): boolean {
  const { x, y } = effectiveColorAreaAxes(state);
  return (
    state.colorSpace === "hsb" &&
    x === "saturation" &&
    y === "brightness" &&
    !usesColorAreaRgbAxes(state)
  );
}

export function readColorAreaIdle(state: ColorAreaAxisState, ch: VuColorAreaChannel): number {
  switch (ch) {
    case "hue":
      return state.hue;
    case "saturation":
      return state.saturation;
    case "brightness":
    case "lightness":
      return state.brightness;
    case "red":
      return state.red;
    case "green":
      return state.green;
    case "blue":
      return state.blue;
    default:
      return 0;
  }
}

function axisEq(
  colorSpace: VuColorAreaColorSpace,
  a: VuColorAreaChannel,
  b: VuColorAreaChannel,
): boolean {
  if (a === b) return true;
  if (colorAreaIsHsl(colorSpace) && sameSemanticL(a, b)) return true;
  return false;
}

function getColorAreaChannelValue(
  state: ColorAreaAxisState,
  ch: VuColorAreaChannel,
  xch: VuColorAreaChannel,
  ych: VuColorAreaChannel,
  xv: number,
  yv: number,
): number {
  if (axisEq(state.colorSpace, ch, xch)) return xv;
  if (axisEq(state.colorSpace, ch, ych)) return yv;
  return readColorAreaIdle(state, ch);
}

export function rgbFromColorAreaProps(state: ColorAreaAxisState): RGB {
  return colorAreaIsHsl(state.colorSpace)
    ? hslToRgb(state.hue, state.saturation, state.brightness)
    : hsvToRgb(state.hue, state.saturation, state.brightness);
}

export function composeColorAreaRgb(
  state: ColorAreaAxisState,
  xch: VuColorAreaChannel,
  ych: VuColorAreaChannel,
  xv: number,
  yv: number,
): RGB {
  const get = (c: VuColorAreaChannel) => getColorAreaChannelValue(state, c, xch, ych, xv, yv);
  if (!planeValid(state.colorSpace, xch, ych)) return rgbFromColorAreaProps(state);

  if (isColorAreaRgbChannel(xch) && isColorAreaRgbChannel(ych)) {
    return {
      r: clamp(Math.round(get("red")), 0, 255),
      g: clamp(Math.round(get("green")), 0, 255),
      b: clamp(Math.round(get("blue")), 0, 255),
    };
  }

  if (colorAreaIsHsl(state.colorSpace)) {
    const H = ((clamp(get("hue"), 0, 360) % 360) + 360) % 360;
    const S = clamp(get("saturation"), 0, 100);
    const L = clamp(
      xch === "lightness" || xch === "brightness"
        ? xv
        : ych === "lightness" || ych === "brightness"
          ? yv
          : get("brightness"),
      0,
      100,
    );
    return hslToRgb(H, S, L);
  }

  const h = ((clamp(get("hue"), 0, 360) % 360) + 360) % 360;
  const s = clamp(get("saturation"), 0, 100);
  const v = clamp(get("brightness"), 0, 100);
  return hsvToRgb(h, s, v);
}

export function colorAreaPctToNative(ch: VuColorAreaChannel, pct: number): number {
  if (ch === "hue") return clamp(pct * COLOR_AREA_HUE_PCT, 0, 360);
  if (isColorAreaRgbChannel(ch)) return clamp(Math.round((pct / 100) * 255), 0, 255);
  return clamp(pct, 0, 100);
}

export function colorAreaNativeToPct(ch: VuColorAreaChannel, v: number): number {
  if (ch === "hue") return clamp(v, 0, 360) / COLOR_AREA_HUE_PCT;
  if (isColorAreaRgbChannel(ch)) return clamp(v, 0, 255) / 2.55;
  return clamp(v, 0, 100);
}

export function colorAreaRgbAtPlanePoint(
  state: ColorAreaAxisState,
  xPct: number,
  yPct: number,
): RGB {
  const { x, y } = effectiveColorAreaAxes(state);
  const xv = colorAreaPctToNative(x, xPct);
  const yv = colorAreaPctToNative(y, yPct);
  return composeColorAreaRgb(state, x, y, xv, yv);
}

export function colorAreaDeltaNative(ch: VuColorAreaChannel, fine: number): number {
  if (ch === "hue") return fine * COLOR_AREA_HUE_PCT;
  if (isColorAreaRgbChannel(ch)) return Math.max(1, Math.round(fine * 2.55));
  return fine;
}

export function colorAreaAxisLabel(
  colorSpace: VuColorAreaColorSpace,
  ch: VuColorAreaChannel,
): string {
  if (ch === "lightness" || (ch === "brightness" && colorAreaIsHsl(colorSpace))) {
    return "lightness";
  }
  return ch;
}

export function colorAreaAxisDisplayValue(
  colorSpace: VuColorAreaColorSpace,
  ch: VuColorAreaChannel,
  value: number,
): string {
  if (ch === "hue") return `${Math.round(value)}°`;
  if (isColorAreaRgbChannel(ch)) return String(Math.round(value));
  return `${Math.round(value)}%`;
}
