import type { GridVirtualizer } from "./grid-virtualizer.js";
import type { Virtualizer } from "./virtualizer.js";

/** Host element augmented with the active virtualizer engine. */
export type VirtualizerHostElement = HTMLElement & {
  [virtualizerRef]?: Virtualizer | GridVirtualizer;
};

/** Symbol key for retrieving the engine from the directive host element. */
export const virtualizerRef = Symbol("vuVirtualizerRef");

const CONTENT_FLAG = "vu-virtualize-content";

/** Marks the directive host as the positioned inner surface. */
export function markVirtualizeContent(host: HTMLElement): void {
  host.dataset.virtualizeContent = CONTENT_FLAG;
  host.style.position = "relative";
  host.style.boxSizing = "border-box";
  host.style.minWidth = "0";
}

/** Content-box size of a scrollport — clientWidth includes padding and overflows. */
export function scrollContentBoxSize(
  el: HTMLElement | null | undefined,
  horizontal: boolean,
): number {
  if (!el) return 0;
  const cs = getComputedStyle(el);
  if (horizontal) {
    return Math.max(
      0,
      el.clientHeight - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0),
    );
  }
  return Math.max(
    0,
    el.clientWidth - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0),
  );
}

/** Resolves the scrollport for a virtualize directive host. */
export function resolveScrollElement(
  host: HTMLElement,
  scroller: boolean | undefined,
  getScrollElement?: () => HTMLElement | null,
  useWindowScroll?: boolean,
): HTMLElement | null {
  if (useWindowScroll) {
    return typeof document !== "undefined" ? document.documentElement : null;
  }
  if (getScrollElement) {
    const el = getScrollElement();
    if (el) return el;
  }
  if (scroller) {
    /* Only overflow-y — the overflow shorthand would clobber CSS overflow-x: hidden. */
    const overflowY = getComputedStyle(host).overflowY;
    if (!/auto|scroll|overlay/.test(overflowY)) host.style.overflowY = "auto";
    return host;
  }
  return findScrollParent(host) ?? host;
}

function isScrollable(el: HTMLElement): boolean {
  const { overflow, overflowX, overflowY } = getComputedStyle(el);
  return (
    /auto|scroll|overlay/.test(overflow) ||
    /auto|scroll|overlay/.test(overflowX) ||
    /auto|scroll|overlay/.test(overflowY)
  );
}

function findScrollParent(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el;
  while (node) {
    if (isScrollable(node)) return node;
    node = node.parentElement;
  }
  return null;
}

/** Fingerprint of a 1D visible range — include starts/sizes so measured rows re-render. */
export function virtualRangeKey(
  items: readonly { index: number; start?: number; size?: number }[],
): string {
  if (!items.length) return "0";
  const first = items[0]!;
  const last = items[items.length - 1]!;
  let key = `${items.length}:${first.index}:${last.index}`;
  for (const item of items) {
    key += `:${item.start ?? 0}:${item.size ?? 0}`;
  }
  return key;
}

/** Compact fingerprint of a 2D visible cell set — skip Lit updates when unchanged. */
export function virtualCellRangeKey(
  cells: readonly { row: number; column: number }[],
): string {
  if (!cells.length) return "0";
  const first = cells[0]!;
  const last = cells[cells.length - 1]!;
  return `${cells.length}:${first.row},${first.column}:${last.row},${last.column}`;
}

/** Row + column range fingerprint without building the cell cross-product. */
export function virtualGridRangeKey(
  rows: readonly { index: number }[],
  cols: readonly { index: number }[],
): string {
  return `${virtualRangeKey(rows)}|${virtualRangeKey(cols)}`;
}

/** Sets the content host size. Fill the cross axis so padding/scrollbars do not overflow. */
export function applyContentSize(
  host: HTMLElement,
  totalWidth: number,
  totalHeight: number,
  options?: { fillCross?: "inline" | "block" },
): void {
  const w = options?.fillCross === "inline" ? "100%" : `${totalWidth}px`;
  const h = options?.fillCross === "block" ? "100%" : `${totalHeight}px`;
  if (host.style.width !== w) host.style.width = w;
  if (host.style.height !== h) host.style.height = h;
}

/** Inline layout + CSS custom props for left-pinned virtual slices (translate in stylesheet). */
export function virtualStickyLeftSliceStyle(options: {
  colOffset: number;
  startY: number;
  width: number;
  height: number;
  scrollMargin?: number;
  rowSticky?: boolean;
  isRtl?: boolean;
}): string {
  const { colOffset, startY, width, height, scrollMargin = 0, rowSticky = false, isRtl = false } = options;
  const pinY = rowSticky
    ? `calc(${startY}px + var(--vg-scroll-y, 0px))`
    : `${startY - scrollMargin}px`;
  return [
    "position:absolute",
    "top:0",
    /* RTL anchors at the inline-start (right) edge; stylesheet mirrors the translate via --vg-dir. */
    isRtl ? "inset-inline-start:0" : "left:0",
    `width:${width}px`,
    `height:${height}px`,
    `--vg-pin-x0:${colOffset}px`,
    `--vg-pin-y:${pinY}`,
    "box-sizing:border-box",
  ].join(";");
}

/** Inline layout + CSS custom props for right-pinned virtual slices (translate in stylesheet). */
export function virtualStickyRightSliceStyle(options: {
  trailingWidth: number;
  startY: number;
  width: number;
  height: number;
  scrollMargin?: number;
  rowSticky?: boolean;
  isRtl?: boolean;
}): string {
  const { trailingWidth, startY, width, height, scrollMargin = 0, rowSticky = false, isRtl = false } = options;
  const pinY = rowSticky
    ? `calc(${startY}px + var(--vg-scroll-y, 0px))`
    : `${startY - scrollMargin}px`;
  return [
    "position:absolute",
    "top:0",
    /* RTL anchors at the inline-start (right) edge; stylesheet mirrors the translate via --vg-dir. */
    isRtl ? "inset-inline-start:0" : "left:0",
    `width:${width}px`,
    `height:${height}px`,
    `--vg-trailing-w:${trailingWidth}px`,
    `--vg-pin-y:${pinY}`,
    "box-sizing:border-box",
  ].join(";");
}

/** Inline layout + CSS custom props for row-pinned virtual slices (translate in stylesheet). */
export function virtualStickyRowSliceStyle(options: {
  colStart: number;
  rowOffset: number;
  width: number;
  height: number;
  isRtl?: boolean;
}): string {
  const { colStart, rowOffset, width, height, isRtl = false } = options;
  const pinX = isRtl ? `${-colStart}px` : `${colStart}px`;
  return [
    "position:absolute",
    "top:0",
    /* RTL anchors at the inline-start (right) edge so the negative translate lands cells correctly. */
    isRtl ? "inset-inline-start:0" : "left:0",
    `width:${width}px`,
    `height:${height}px`,
    `--vg-pin-x:${pinX}`,
    `--vg-pin-y0:${rowOffset}px`,
    "box-sizing:border-box",
  ].join(";");
}

/** Inline style for one absolutely positioned virtual slice. */
export function virtualSliceStyle(options: {
  startX: number;
  startY: number;
  width: number;
  height: number;
  scrollMargin?: number;
  isRtl?: boolean;
  /** When false, omit width so content can be measured (1D horizontal lists). */
  lockWidth?: boolean;
  /** When false, omit height so content can be measured (1D vertical lists). */
  lockHeight?: boolean;
  /** Stretch to the content host instead of a pixel `clientWidth` (avoids padding overflow). */
  fillWidth?: boolean;
  /** Stretch to the content host instead of a pixel `clientHeight`. */
  fillHeight?: boolean;
}): string {
  const {
    startX,
    startY,
    width,
    height,
    scrollMargin = 0,
    isRtl = false,
    lockWidth = true,
    lockHeight = true,
    fillWidth = false,
    fillHeight = false,
  } = options;
  const x = isRtl ? -startX : startX;
  const y = startY - scrollMargin;
  const parts = [
    "position:absolute",
    "top:0",
    /* RTL anchors at the inline-start (right) edge so the negative translate lands cells correctly. */
    isRtl ? "inset-inline-start:0" : "left:0",
    `transform:translate(${x}px, ${y}px)`,
    "box-sizing:border-box",
  ];
  if (fillWidth) parts.push("width:100%", "max-width:100%");
  else if (lockWidth) parts.push(`width:${width}px`);
  if (fillHeight) parts.push("height:100%", "max-height:100%");
  else if (lockHeight) parts.push(`height:${height}px`);
  return parts.join(";");
}

/** Cross-axis lane layout for masonry-style virtual lists. */
export function laneSliceStyle(options: {
  item: { start: number; size: number; lane: number };
  laneCount: number;
  crossSize: number;
  horizontal: boolean;
  scrollMargin?: number;
  isRtl?: boolean;
}): string {
  const { item, laneCount, crossSize, horizontal, scrollMargin = 0, isRtl = false } =
    options;
  const laneSize = crossSize / Math.max(1, laneCount);
  const crossStart = isRtl
    ? crossSize - (item.lane + 1) * laneSize
    : item.lane * laneSize;

  const fillCross = laneCount === 1;
  if (horizontal) {
    return virtualSliceStyle({
      startX: item.start,
      startY: crossStart,
      width: item.size,
      height: laneSize,
      scrollMargin,
      lockWidth: false,
      lockHeight: true,
      fillHeight: fillCross,
    });
  }
  return virtualSliceStyle({
    startX: crossStart,
    startY: item.start,
    width: laneSize,
    height: item.size,
    scrollMargin,
    isRtl,
    lockWidth: true,
    lockHeight: false,
    fillWidth: fillCross,
  });
}
