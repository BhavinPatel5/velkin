import { clamp } from "../../internals/utils/color-conversion.js";
import type { VuColorAreaChannel } from "../color-area.types.js";
import {
  colorAreaDeltaNative,
  colorAreaIsHsl,
  colorAreaPctToNative,
  composeColorAreaRgb,
  effectiveColorAreaAxes,
  isColorAreaRgbChannel,
  readColorAreaIdle,
  usesColorAreaRgbAxes,
  type ColorAreaAxisState,
} from "./color-area-axes.js";
import { commitRgb, rgbFromProps, type ColorAreaChannelPatch } from "./color-area-model.js";

export interface ColorAreaInputHost {
  disabled: boolean;
  readonly: boolean;
  step: number;
  _base: HTMLElement | null;
  _dragPointerId: number | null;
  _isDragging: boolean;
  _axisState(): ColorAreaAxisState;
  _applyChannelPatch(patch: ColorAreaChannelPatch): void;
  _emit(type: "vu-input" | "vu-change"): void;
  focus(): void;
}

export function applyPlaneFromPointer(
  state: ColorAreaAxisState,
  xPct: number,
  yPct: number,
): ColorAreaChannelPatch {
  const { x, y } = effectiveColorAreaAxes(state);
  const xv = colorAreaPctToNative(x, xPct);
  const yv = colorAreaPctToNative(y, yPct);
  const rgb = composeColorAreaRgb(state, x, y, xv, yv);
  return commitRgb(state, rgb);
}

export function applyDeltaToAxes(
  state: ColorAreaAxisState,
  xch: VuColorAreaChannel,
  ych: VuColorAreaChannel,
  dx: number,
  dy: number,
): ColorAreaChannelPatch {
  const usesRgb = usesColorAreaRgbAxes(state);
  const isHsl = colorAreaIsHsl(state.colorSpace);
  if (!usesRgb && !isHsl) {
    const clampHs = (c: VuColorAreaChannel, v: number): number => {
      if (c === "hue") return clamp(Math.round(v), 0, 360);
      return clamp(Math.round(v), 0, 100);
    };
    const next = { ...state };
    const bump = (ch: VuColorAreaChannel, delta: number): void => {
      if (delta === 0) return;
      const idle = readColorAreaIdle(state, ch);
      const value = clampHs(ch, idle + delta);
      switch (ch) {
        case "hue":
          next.hue = value;
          break;
        case "saturation":
          next.saturation = value;
          break;
        case "brightness":
        case "lightness":
          next.brightness = value;
          break;
      }
    };
    bump(xch, dx);
    bump(ych, dy);
    const rgb = rgbFromProps(next);
    return {
      ...next,
      red: rgb.r,
      green: rgb.g,
      blue: rgb.b,
    };
  }
  const clampHs = (c: VuColorAreaChannel, v: number): number => {
    if (c === "hue") return clamp(v, 0, 360);
    return clamp(v, 0, 100);
  };
  const xv0 = readColorAreaIdle(state, xch) + dx;
  const yv0 = readColorAreaIdle(state, ych) + dy;
  const nx = isColorAreaRgbChannel(xch) ? clamp(xv0, 0, 255) : clampHs(xch, xv0);
  const ny = isColorAreaRgbChannel(ych) ? clamp(yv0, 0, 255) : clampHs(ych, yv0);
  const rgb = composeColorAreaRgb(state, xch, ych, nx, ny);
  return commitRgb(state, rgb);
}

export function snapAxisMinMax(
  state: ColorAreaAxisState,
  which: "x" | "y",
  toMax: boolean,
): ColorAreaChannelPatch {
  const { x, y } = effectiveColorAreaAxes(state);
  const snap = (ch: VuColorAreaChannel): number => {
    if (toMax) {
      return isColorAreaRgbChannel(ch) ? 255 : ch === "hue" ? 360 : 100;
    }
    return 0;
  };
  const xv = which === "x" ? snap(x) : readColorAreaIdle(state, x);
  const yv = which === "y" ? snap(y) : readColorAreaIdle(state, y);
  const rgb = composeColorAreaRgb(state, x, y, xv, yv);
  return commitRgb(state, rgb);
}

export function updateFromPointer(host: ColorAreaInputHost, event: PointerEvent): void {
  const surface = host._base;
  if (!surface) return;
  const rect = surface.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  const px = clamp(event.clientX - rect.left, 0, rect.width);
  const py = clamp(event.clientY - rect.top, 0, rect.height);
  const xPct = (px / rect.width) * 100;
  const yPct = (1 - py / rect.height) * 100;
  host._applyChannelPatch(applyPlaneFromPointer(host._axisState(), xPct, yPct));
}

export function onColorAreaPointerDown(host: ColorAreaInputHost, event: PointerEvent): void {
  if (host.disabled || host.readonly) return;
  if (event.button !== 0) return;
  host._dragPointerId = event.pointerId;
  host._isDragging = true;
  host._base?.setPointerCapture?.(event.pointerId);
  host.focus();
  updateFromPointer(host, event);
  host._emit("vu-input");
}

export function onColorAreaPointerMove(host: ColorAreaInputHost, event: PointerEvent): void {
  if (!host._isDragging || event.pointerId !== host._dragPointerId) return;
  updateFromPointer(host, event);
  host._emit("vu-input");
}

export function onColorAreaPointerUp(host: ColorAreaInputHost, event: PointerEvent): void {
  if (!host._isDragging || event.pointerId !== host._dragPointerId) return;
  host._isDragging = false;
  host._dragPointerId = null;
  host._base?.releasePointerCapture?.(event.pointerId);
  host._emit("vu-change");
}

export function onColorAreaPointerCancel(host: ColorAreaInputHost, event: PointerEvent): void {
  if (event.pointerId !== host._dragPointerId) return;
  host._isDragging = false;
  host._dragPointerId = null;
}

export function onColorAreaKeydown(host: ColorAreaInputHost, event: KeyboardEvent): void {
  if (host.disabled || host.readonly) return;
  const baseStep = Math.max(0.01, host.step);
  const fine = event.shiftKey ? baseStep * 10 : baseStep;
  const state = host._axisState();
  const { x, y } = effectiveColorAreaAxes(state);
  let dx = 0;
  let dy = 0;
  let handled = true;
  switch (event.key) {
    case "ArrowRight":
      dx = colorAreaDeltaNative(x, fine);
      break;
    case "ArrowLeft":
      dx = -colorAreaDeltaNative(x, fine);
      break;
    case "ArrowUp":
      dy = colorAreaDeltaNative(y, fine);
      break;
    case "ArrowDown":
      dy = -colorAreaDeltaNative(y, fine);
      break;
    case "PageUp":
      dy = colorAreaDeltaNative(y, baseStep * 10);
      break;
    case "PageDown":
      dy = -colorAreaDeltaNative(y, baseStep * 10);
      break;
    case "Home":
      host._applyChannelPatch(snapAxisMinMax(state, "x", false));
      return;
    case "End":
      host._applyChannelPatch(snapAxisMinMax(state, "x", true));
      return;
    default:
      handled = false;
  }
  if (!handled) return;
  event.preventDefault();
  const prev = rgbFromProps(state);
  host._applyChannelPatch(applyDeltaToAxes(state, x, y, dx, dy));
  const next = rgbFromProps(host._axisState());
  if (prev.r !== next.r || prev.g !== next.g || prev.b !== next.b) {
    host._emit("vu-input");
    host._emit("vu-change");
  }
}
