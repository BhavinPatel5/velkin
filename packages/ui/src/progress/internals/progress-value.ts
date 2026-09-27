import type { VuProgressWidths } from "../progress.types.js";

/** Clamps `value` into `[0, max]`. */
export function clampProgressValue(value: number, max: number): number {
  const ceiling = Math.max(1, max);
  return Math.min(Math.max(0, value), ceiling);
}

/** Computes foreground + buffer fill percentages for determinate mode. */
export function progressWidths(value: number, max: number, buffer: number): VuProgressWidths {
  const ceiling = Math.max(1, max);
  const percentage = (clampProgressValue(value, ceiling) / ceiling) * 100;
  const bufferPercentage = (clampProgressValue(buffer, ceiling) / ceiling) * 100;

  const totalWidth = Math.min(percentage + bufferPercentage, 100);
  const progress = Math.min(percentage, totalWidth);
  const bufferWidth = progress + Math.min(bufferPercentage, totalWidth - progress);

  return { progress, buffer: bufferWidth };
}

/** Keyframe name for indeterminate sweep respecting document/slot RTL. */
export function indeterminateAnimationName(host: HTMLElement, isServer: boolean): string {
  if (isServer) return "progress-indeterminate-ltr";
  const isRtl = host.closest('[dir="rtl"]') !== null || document.documentElement.dir === "rtl";
  return isRtl ? "progress-indeterminate-rtl" : "progress-indeterminate-ltr";
}
