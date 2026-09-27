import {
  resolveColor,
  resolveTextColorForToken,
} from "../../internals/utils/color-resolver.js";
import type {
  VuTabColor,
  VuTabStateItem,
  VuTabNormalizedItem,
  VuTabSize,
} from "../tab.types.js";

/** Min width per size; used to avoid recreating objects in render. */
export const TAB_SIZE_MIN_WIDTHS: Record<VuTabSize, number> = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 52,
  xl: 60,
};

/** Font size (px) per `size` for 1em icon width estimates when canvas measure is unavailable. */
const TAB_SIZE_FONT_PX: Record<VuTabSize, number> = {
  xs: 12,
  sm: 12,
  md: 14,
  lg: 14,
  xl: 16,
};

/** Total inline padding (px) per `size`; mirrors `--item-pad` horizontal axis. */
const TAB_SIZE_INLINE_PAD_PX: Record<VuTabSize, number> = {
  xs: 16,
  sm: 20,
  md: 28,
  lg: 34,
  xl: 40,
};

/** Gap between icon and label; mirrors `--vu-space-1-5`. */
const TAB_ICON_LABEL_GAP_PX = 6;

/** Min width estimate for prop-mode segments (`showCurrentLabelOnly` layout stability). */
export function estimateTabSegmentMinWidth(
  item: VuTabNormalizedItem,
  labelWidth: number,
  size: VuTabSize,
  iconOnly = false,
): number {
  const sizeMinW = TAB_SIZE_MIN_WIDTHS[size] ?? 44;
  if (iconOnly || !item.label) return sizeMinW;
  const iconWidth = item.icon ? TAB_SIZE_FONT_PX[size] : 0;
  const gap = item.icon ? TAB_ICON_LABEL_GAP_PX : 0;
  return Math.max(
    sizeMinW,
    labelWidth + iconWidth + TAB_SIZE_INLINE_PAD_PX[size] + gap,
  );
}

/** Coerces `states` prop entries into a stable normalized list. */
export function normalizeTabItems(
  states: VuTabStateItem[] | undefined,
): VuTabNormalizedItem[] {
  return (states ?? []).map((entry) =>
    typeof entry === "string" ? { value: entry, label: entry } : { ...entry },
  );
}

/** Index of the selected value; falls back to 0 when missing. */
export function tabSelectedIndex(
  items: VuTabNormalizedItem[],
  value: string,
): number {
  return Math.max(0, items.findIndex((item) => item.value === value));
}

/** Next enabled index walking forward or backward with wrap. */
export function findNextEnabledTabIndex(
  items: VuTabNormalizedItem[],
  start: number,
  dir: 1 | -1,
): number {
  const count = items.length;
  for (let step = 1; step <= count; step++) {
    const index = (start + dir * step + count) % count;
    if (!items[index].disabled) return index;
  }
  return start;
}

/** First enabled segment index, or -1 when every segment is disabled. */
export function findFirstEnabledTabIndex(
  items: VuTabNormalizedItem[],
): number {
  return items.findIndex((item) => !item.disabled);
}

/** Last enabled segment index, or -1 when every segment is disabled. */
export function findLastEnabledTabIndex(
  items: VuTabNormalizedItem[],
): number {
  for (let i = items.length - 1; i >= 0; i--) {
    if (!items[i].disabled) return i;
  }
  return -1;
}

/** Effective color token for the active segment (item override or host `color`). */
export function tabEffectiveColor(
  items: VuTabNormalizedItem[],
  index: number,
  fallbackColor: VuTabColor,
): string {
  const selected = items[index];
  return (selected?.color ?? fallbackColor) || "primary";
}

/** Resolves thumb background and active label color for the current selection. */
export function applyTabEffectiveColor(
  hostStyle: CSSStyleDeclaration | undefined,
  token: string,
): void {
  if (!hostStyle) return;
  hostStyle.setProperty("--tab-thumb-bg", resolveColor(token));
  hostStyle.setProperty("--tab-active-fg", resolveTextColorForToken(token));
}

/** True when running under Vitest (jsdom canvas is unreliable). */
function isVitestRun(): boolean {
  return typeof process !== "undefined" && process.env?.VITEST != null;
}

/** Creates a canvas 2d context for label measurement; undefined when unavailable. */
export function createTabMeasureContext(): CanvasRenderingContext2D | undefined {
  if (typeof document === "undefined") return undefined;
  if (isVitestRun()) return undefined;
  try {
    const canvas = document.createElement("canvas");
    return canvas.getContext("2d") ?? undefined;
  } catch {
    return undefined;
  }
}

/** Measures label widths for `showCurrentLabelOnly` layout stability. */
export function measureTabLabelWidths(
  items: VuTabNormalizedItem[],
  wrap: HTMLElement | null,
  fallbackFontSize: string,
  canvasContext?: CanvasRenderingContext2D,
): Map<number, number> {
  const widths = new Map<number, number>();
  const computedStyle = wrap ? window.getComputedStyle(wrap) : null;

  if (computedStyle && canvasContext) {
    canvasContext.font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;
  }

  const fallbackSize = Number.parseFloat(fallbackFontSize || "12");

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.label) {
      widths.set(i, 0);
      continue;
    }
    if (canvasContext && computedStyle) {
      widths.set(i, Math.ceil(canvasContext.measureText(item.label).width));
    } else {
      widths.set(i, Math.ceil(item.label.length * fallbackSize * 0.6));
    }
  }

  return widths;
}
