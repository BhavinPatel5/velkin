import type { RGB } from "../../internals/utils/color-conversion.js";
import { isClient } from "../../internals/utils/env.js";

/** Paints the 2D pad canvas from a callback that maps normalized x/y percent to RGB. */
export function paintColorAreaPlane(
  canvas: HTMLCanvasElement,
  base: HTMLElement,
  rgbAtPoint: (xPct: number, yPct: number) => RGB,
): void {
  const dpr = isClient() ? Math.min(2, window.devicePixelRatio || 1) : 1;
  const cw = Math.max(1, Math.floor(base.clientWidth * dpr));
  const ch = Math.max(1, Math.floor(base.clientHeight * dpr));
  if (canvas.width !== cw || canvas.height !== ch) {
    canvas.width = cw;
    canvas.height = ch;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const img = ctx.createImageData(cw, ch);
  const data = img.data;
  let i = 0;
  for (let py = 0; py < ch; py++) {
    const yPct = ch === 1 ? 50 : (1 - py / (ch - 1)) * 100;
    for (let px = 0; px < cw; px++) {
      const xPct = cw === 1 ? 50 : (px / (cw - 1)) * 100;
      const { r, g, b } = rgbAtPoint(xPct, yPct);
      data[i++] = r;
      data[i++] = g;
      data[i++] = b;
      data[i++] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}
