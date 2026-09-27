import {
  clamp,
  hslToCss,
  hslToHsv,
  hsvToHsl,
  parseCssColor,
  rgbToCss,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  type RGB,
} from "../../internals/utils/color-conversion.js";
import type { VuColorAreaChangeDetail } from "../color-area.types.js";
import {
  colorAreaIsHsl,
  effectiveColorAreaAxes,
  rgbFromColorAreaProps,
  type ColorAreaAxisState,
} from "./color-area-axes.js";

export type ColorAreaChannelPatch = Pick<
  ColorAreaAxisState,
  "hue" | "saturation" | "brightness" | "red" | "green" | "blue"
>;

export function rgbFromProps(state: ColorAreaAxisState): RGB {
  return rgbFromColorAreaProps(state);
}

export function commitRgb(state: ColorAreaAxisState, rgb: RGB): ColorAreaChannelPatch {
  const r = clamp(Math.round(rgb.r), 0, 255);
  const g = clamp(Math.round(rgb.g), 0, 255);
  const b = clamp(Math.round(rgb.b), 0, 255);
  const gray = r === g && g === b;
  if (colorAreaIsHsl(state.colorSpace)) {
    const hsl = rgbToHsl({ r, g, b });
    return {
      red: r,
      green: g,
      blue: b,
      hue: gray ? state.hue : Math.round(hsl.h),
      saturation: Math.round(hsl.s),
      brightness: Math.round(hsl.l),
    };
  }
  const hsv = rgbToHsv({ r, g, b });
  return {
    red: r,
    green: g,
    blue: b,
    hue: gray ? state.hue : Math.round(hsv.h),
    saturation: Math.round(hsv.s),
    brightness: Math.round(hsv.v),
  };
}

export function resolvedCss(state: ColorAreaAxisState): string {
  const rgb = rgbFromProps(state);
  if (state.colorSpace === "rgb") {
    return rgbToCss(rgb);
  }
  if (colorAreaIsHsl(state.colorSpace)) {
    return hslToCss({
      h: ((clamp(state.hue, 0, 360) % 360) + 360) % 360,
      s: clamp(state.saturation, 0, 100),
      l: clamp(state.brightness, 0, 100),
    });
  }
  return hslToCss(hsvToHsl(state.hue, state.saturation, state.brightness));
}

export function ingestValue(
  state: ColorAreaAxisState,
  input: string,
): ColorAreaChannelPatch | null {
  if (!input) return null;
  const parsed = parseCssColor(input);
  if (!parsed) return null;
  const gray = parsed.rgb.r === parsed.rgb.g && parsed.rgb.g === parsed.rgb.b;
  if (colorAreaIsHsl(state.colorSpace)) {
    const hsl = rgbToHsl(parsed.rgb);
    return {
      hue: gray ? state.hue : hsl.h,
      saturation: hsl.s,
      brightness: hsl.l,
      red: parsed.rgb.r,
      green: parsed.rgb.g,
      blue: parsed.rgb.b,
    };
  }
  const hsv = rgbToHsv(parsed.rgb);
  return {
    hue: gray ? state.hue : hsv.h,
    saturation: hsv.s,
    brightness: hsv.v,
    red: parsed.rgb.r,
    green: parsed.rgb.g,
    blue: parsed.rgb.b,
  };
}

export function buildDetail(state: ColorAreaAxisState): VuColorAreaChangeDetail {
  const rgb = rgbFromProps(state);
  const isHsl = colorAreaIsHsl(state.colorSpace);
  const hsv = isHsl
    ? hslToHsv(state.hue, state.saturation, state.brightness)
    : { h: state.hue, s: state.saturation, v: state.brightness };
  const hsl = isHsl
    ? {
        h: ((clamp(state.hue, 0, 360) % 360) + 360) % 360,
        s: clamp(state.saturation, 0, 100),
        l: clamp(state.brightness, 0, 100),
      }
    : hsvToHsl(hsv.h, hsv.s, hsv.v);
  const { x, y } = effectiveColorAreaAxes(state);
  const css = resolvedCss(state);
  return {
    colorSpace: state.colorSpace,
    xChannel: x,
    yChannel: y,
    value: css,
    hue: state.hue,
    saturation: state.saturation,
    brightness: state.brightness,
    red: state.red,
    green: state.green,
    blue: state.blue,
    hsv,
    hsl,
    rgb,
    hex: rgbToHex(rgb),
    css,
  };
}
