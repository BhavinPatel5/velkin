import {
  clamp,
  hslToCss,
  hsvToHsl,
  hsvToRgb,
  resolveCssColor,
  rgbToCss,
  rgbToHex,
  rgbToHexA,
  rgbToHsv,
} from "../../internals/utils/color-conversion.js";
import type { VuColorPickerChangeDetail, VuColorPickerFormat } from "../color-picker.types.js";

/** Internal HSV+A tuple — single source of truth for picker state. */
export type ColorPickerHsvaState = {
  h: number;
  s: number;
  v: number;
  a: number;
};

/** Host surface for HSV+A read/write and outbound formatting. */
export type ColorPickerStateHost = {
  format: VuColorPickerFormat;
  showAlpha: boolean;
  value: string;
  _h: number;
  _s: number;
  _v: number;
  _a: number;
  _inputDirty: boolean;
  _inputDraft: string;
  _inputInvalid: boolean;
  _suppressIncoming: boolean;
  dispatchEvent: (event: Event) => boolean;
};

/** Read current HSV+A from host private fields. */
export function readHsva(host: ColorPickerStateHost): ColorPickerHsvaState {
  return { h: host._h, s: host._s, v: host._v, a: host._a };
}

/** Format active HSV+A as a CSS string using `format` and `showAlpha`. */
export function formatCurrent(host: ColorPickerStateHost): string {
  const rgb = hsvToRgb(host._h, host._s, host._v);
  if (host.format === "hex") {
    return host.showAlpha ? rgbToHexA(rgb, host._a) : rgbToHex(rgb);
  }
  if (host.format === "rgb") {
    return rgbToCss(rgb, host.showAlpha ? host._a : 1);
  }
  const hsl = hsvToHsl(host._h, host._s, host._v);
  if (host.showAlpha && host._a < 1) {
    return `hsl(${Math.round(hsl.h)} ${Math.round(hsl.s)}% ${Math.round(
      hsl.l,
    )}% / ${Math.round(host._a * 100) / 100})`;
  }
  return hslToCss(hsl);
}

/** Build the `vu-input` / `vu-change` detail payload from current HSV+A. */
export function buildDetail(host: ColorPickerStateHost): VuColorPickerChangeDetail {
  const rgb = hsvToRgb(host._h, host._s, host._v);
  const hsl = hsvToHsl(host._h, host._s, host._v);
  return {
    value: formatCurrent(host),
    hex: host.showAlpha ? rgbToHexA(rgb, host._a) : rgbToHex(rgb),
    hsv: { h: host._h, s: host._s, v: host._v },
    hsl,
    rgb,
    alpha: host._a,
  };
}

/** Parse inbound `value` into HSV+A; preserves hue on grayscale colors. */
export function ingestValue(host: ColorPickerStateHost, input: string): void {
  const parsed = resolveCssColor(input);
  if (!parsed) return;
  const hsv = rgbToHsv(parsed.rgb);
  const h = parsed.rgb.r === parsed.rgb.g && parsed.rgb.g === parsed.rgb.b ? host._h : hsv.h;
  host._h = h;
  host._s = hsv.s;
  host._v = hsv.v;
  host._a = parsed.alpha;
  if (!host._inputDirty) {
    host._inputDraft = formatCurrent(host);
    host._inputInvalid = false;
  }
}

/** Single funnel for HSV+A writes — clamps, refreshes draft, and emits events. */
export function setHsva(
  host: ColorPickerStateHost,
  h: number,
  s: number,
  v: number,
  a: number,
  eventTypes: Array<"vu-input" | "vu-change">,
): void {
  const nextH = ((clamp(h, 0, 360) % 360) + 360) % 360;
  const nextS = clamp(s, 0, 100);
  const nextV = clamp(v, 0, 100);
  const nextA = clamp(a, 0, 1);
  const changed = nextH !== host._h || nextS !== host._s || nextV !== host._v || nextA !== host._a;
  if (!changed) {
    if (eventTypes.includes("vu-change")) publish(host, ["vu-change"]);
    return;
  }
  host._h = nextH;
  host._s = nextS;
  host._v = nextV;
  host._a = nextA;
  if (!host._inputDirty) {
    host._inputDraft = formatCurrent(host);
    host._inputInvalid = false;
  }
  publish(host, eventTypes);
}

/** Push formatted `value` (suppress round-trip) and dispatch picker-shaped events. */
export function publish(
  host: ColorPickerStateHost,
  eventTypes: Array<"vu-input" | "vu-change">,
): void {
  const detail = buildDetail(host);
  host._suppressIncoming = true;
  host.value = detail.value;
  queueMicrotask(() => {
    host._suppressIncoming = false;
  });
  for (const type of eventTypes) {
    host.dispatchEvent(
      new CustomEvent<VuColorPickerChangeDetail>(type, {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }
}
