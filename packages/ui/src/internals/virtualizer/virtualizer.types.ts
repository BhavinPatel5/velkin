import type { Virtualizer } from "./virtualizer.js";

/** One visible slice along a single scroll axis. */
export type VirtualItem = {
  index: number;
  start: number;
  end: number;
  size: number;
  key: string | number;
  /** Lane index when `lanes` > 1 (masonry columns / rows). */
  lane: number;
};

export type VirtualizerKey = string | number;

export type VirtualizerAlign = "start" | "center" | "end" | "auto";

export type VirtualizerScrollBehavior = ScrollBehavior | "instant";

export type ScrollDirection = "forward" | "backward";

export type VirtualizerScrollOptions = {
  align?: VirtualizerAlign;
  behavior?: VirtualizerScrollBehavior;
};

export type VirtualizerRange = {
  startIndex: number;
  endIndex: number;
  overscan: number;
  count: number;
};

export type VirtualizerAnchor = "start" | "end";

export type LaneAssignmentMode = "estimate" | "measured";

export type Rect = {
  width: number;
  height: number;
};

export type ObserveOffsetCallback = (offset: number, isScrolling: boolean) => void;

export type ScrollToFn = (
  offset: number,
  options: { behavior?: VirtualizerScrollBehavior; adjustments?: number },
  instance: Virtualizer,
) => void;

export type ObserveElementRectFn = (
  instance: Virtualizer,
  cb: (rect: Rect) => void,
) => (() => void) | void;

export type ObserveElementOffsetFn = (
  instance: Virtualizer,
  cb: ObserveOffsetCallback,
) => (() => void) | void;

export type MeasureElementFn = (
  element: HTMLElement,
  entry: ResizeObserverEntry | undefined,
  instance: Virtualizer,
) => number;

export type ShouldAdjustScrollFn = (
  item: VirtualItem,
  delta: number,
  instance: Virtualizer,
) => boolean;

/** Options for a single-axis virtualizer. */
export type VirtualizerOptions = {
  count: number;
  getScrollElement: () => HTMLElement | null;
  estimateSize: (index: number) => number;
  overscan?: number;
  horizontal?: boolean;
  paddingStart?: number;
  paddingEnd?: number;
  scrollMargin?: number;
  /** Row-axis scroll margin (defaults to `scrollMargin`). */
  rowScrollMargin?: number;
  /** Column-axis scroll margin (defaults to `scrollMargin`). */
  columnScrollMargin?: number;
  scrollPaddingStart?: number;
  scrollPaddingEnd?: number;
  gap?: number;
  lanes?: number;
  laneAssignmentMode?: LaneAssignmentMode;
  enabled?: boolean;
  isRtl?: boolean;
  initialOffset?: number | (() => number);
  initialMeasurementsCache?: VirtualItem[];
  getItemKey?: (index: number) => VirtualizerKey;
  rangeExtractor?: (range: VirtualizerRange) => number[];
  scrollToFn?: ScrollToFn;
  measureElement?: MeasureElementFn;
  observeElementRect?: ObserveElementRectFn;
  observeElementOffset?: ObserveElementOffsetFn;
  /** DOM target for scroll/resize listeners when `getScrollElement` is not an `HTMLElement`. */
  observeElement?: () => HTMLElement | null;
  onChange?: (instance: Virtualizer, sync: boolean) => void;
  /** Window mode — observe document scroll instead of element. */
  useWindowScroll?: boolean;
  initialRect?: Rect;
  isScrollingResetDelay?: number;
  useScrollendEvent?: boolean;
  anchorTo?: VirtualizerAnchor;
  followOnAppend?: boolean | VirtualizerScrollBehavior;
  scrollEndThreshold?: number;
  useAnimationFrameWithResizeObserver?: boolean;
  indexAttribute?: string;
  debug?: boolean;
  shouldAdjustScrollPositionOnItemSizeChange?: ShouldAdjustScrollFn;
};

/** One visible cell in a 2D grid (row × column virtual item cross-product). */
export type VirtualCell = {
  row: number;
  column: number;
  rowItem: VirtualItem;
  colItem: VirtualItem;
};

/** Options for a 2D grid virtualizer (two 1D virtualizers on one scrollport). */
export type GridVirtualizerOptions = {
  rowCount: number;
  columnCount: number;
  getScrollElement: () => HTMLElement | null;
  /** DOM target for scroll/resize listeners when `getScrollElement` is not an `HTMLElement`. */
  observeElement?: () => HTMLElement | null;
  estimateRowSize: (index: number) => number;
  estimateColumnSize: (index: number) => number;
  rowOverscan?: number;
  columnOverscan?: number;
  paddingStart?: number;
  paddingEnd?: number;
  scrollMargin?: number;
  /** Row-axis scroll margin (defaults to `scrollMargin`). */
  rowScrollMargin?: number;
  /** Column-axis scroll margin (defaults to `scrollMargin`). */
  columnScrollMargin?: number;
  scrollPaddingStart?: number;
  scrollPaddingEnd?: number;
  gap?: number;
  rowGap?: number;
  columnGap?: number;
  enabled?: boolean;
  isRtl?: boolean;
  initialOffset?: number | (() => number);
  initialRowMeasurementsCache?: VirtualItem[];
  initialColumnMeasurementsCache?: VirtualItem[];
  getRowKey?: (index: number) => VirtualizerKey;
  getColumnKey?: (index: number) => VirtualizerKey;
  rowRangeExtractor?: (range: VirtualizerRange) => number[];
  columnRangeExtractor?: (range: VirtualizerRange) => number[];
  onChange?: (instance: GridVirtualizerOnChangeHost, sync: boolean) => void;
  useWindowScroll?: boolean;
  rowIndexAttribute?: string;
  columnIndexAttribute?: string;
  debug?: boolean;
  laneAssignmentMode?: LaneAssignmentMode;
  shouldAdjustScrollPositionOnItemSizeChange?: ShouldAdjustScrollFn;
};

export type GridVirtualizerOnChangeHost = {
  rows: Virtualizer;
  columns: Virtualizer;
  getVirtualCells: () => VirtualCell[];
};

export type GridTotalSize = {
  width: number;
  height: number;
};

/** Config for the `virtualize` Lit directive (1D). */
export type VirtualizeDirectiveConfig<T> = {
  items: T[];
  renderItem: (item: T, index: number) => import("lit").TemplateResult;
  keyFunction?: (item: T, index: number) => unknown;
  estimateSize: (index: number) => number;
  overscan?: number;
  horizontal?: boolean;
  scroller?: boolean;
  getScrollElement?: () => HTMLElement | null;
  paddingStart?: number;
  paddingEnd?: number;
  scrollMargin?: number;
  /** Row-axis scroll margin (defaults to `scrollMargin`). */
  rowScrollMargin?: number;
  /** Column-axis scroll margin (defaults to `scrollMargin`). */
  columnScrollMargin?: number;
  scrollPaddingStart?: number;
  scrollPaddingEnd?: number;
  gap?: number;
  lanes?: number;
  laneAssignmentMode?: LaneAssignmentMode;
  enabled?: boolean;
  isRtl?: boolean;
  initialOffset?: number | (() => number);
  initialMeasurementsCache?: VirtualItem[];
  rangeExtractor?: (range: VirtualizerRange) => number[];
  useWindowScroll?: boolean;
  anchorTo?: VirtualizerAnchor;
  followOnAppend?: boolean | VirtualizerScrollBehavior;
  indexAttribute?: string;
  debug?: boolean;
  shouldAdjustScrollPositionOnItemSizeChange?: ShouldAdjustScrollFn;
  /** Fires when the visible slice changes; does not re-render the host. */
  onRangeChange?: () => void;
};

/** Config for the `virtualizeGrid` Lit directive (2D). */
export type VirtualizeGridDirectiveConfig = {
  rowCount: number;
  columnCount: number;
  renderCell: (row: number, column: number) => import("lit").TemplateResult;
  keyFunction?: (row: number, column: number) => unknown;
  estimateRowSize: (index: number) => number;
  estimateColumnSize: (index: number) => number;
  rowOverscan?: number;
  columnOverscan?: number;
  scroller?: boolean;
  getScrollElement?: () => HTMLElement | null;
  /** DOM target for scroll/resize listeners when `getScrollElement` is not an `HTMLElement`. */
  observeElement?: () => HTMLElement | null;
  paddingStart?: number;
  paddingEnd?: number;
  scrollMargin?: number;
  /** Row-axis scroll margin (defaults to `scrollMargin`). */
  rowScrollMargin?: number;
  /** Column-axis scroll margin (defaults to `scrollMargin`). */
  columnScrollMargin?: number;
  scrollPaddingStart?: number;
  scrollPaddingEnd?: number;
  rowGap?: number;
  columnGap?: number;
  enabled?: boolean;
  isRtl?: boolean;
  initialOffset?: number | (() => number);
  initialRowMeasurementsCache?: VirtualItem[];
  initialColumnMeasurementsCache?: VirtualItem[];
  useWindowScroll?: boolean;
  indexAttribute?: string;
  debug?: boolean;
  /** Fires when the visible cell grid changes; does not re-render the host. */
  onRangeChange?: () => void;
  /** Bumps when extrinsic column widths change — clears column measure cache before layout. */
  columnMeasureEpoch?: number;
  /** Bumps when row size estimates / keys change without a count change (e.g. expanded detail swap). */
  rowMeasureEpoch?: number;
  /** When false, column sizes stay on `estimateColumnSize` (no DOM measure / cache). */
  measureColumns?: boolean;
  /** When false, row sizes stay on `estimateRowSize` (no DOM measure / cache). */
  measureRows?: boolean;
  /** Leading rows pinned to the top of the scrollport (e.g. table header). */
  stickyRowCount?: number;
  /** Leading grid columns pinned on horizontal scroll (e.g. table left pins). */
  stickyColumnLeftCount?: number;
  /** Trailing grid columns pinned on horizontal scroll (e.g. table right pins). */
  stickyColumnRightCount?: number;
  /** Wrap visible cells in `role="row"` containers (`display:contents`) for ARIA grids. */
  gridRows?: boolean;
};
