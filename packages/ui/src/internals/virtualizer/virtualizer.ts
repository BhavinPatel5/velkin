import {
  approxEqual,
  calculateIndexRange,
  calculateRange,
  defaultKeyExtractor,
  defaultRangeExtractor,
  elementScroll,
  findNearestBinarySearch,
  getClippingAncestors,
  isIOSWebKit,
  isVirtualizerScrollMetrics,
  measureElement as defaultMeasureElement,
  observeElementOffset,
  observeElementRect,
  observeWindowOffset,
  observeWindowRect,
  probeUniformLayout,
  readElementScrollOffset,
  readElementViewportSize,
  readWindowScrollOffset,
  readWindowViewportSize,
  resolveObserveElement,
  sizesFromMeasurementCache,
  windowScroll,
} from "./virtualizer-utils.js";
import type { UniformLayout } from "./virtualizer-utils.js";
import type {
  Rect,
  ScrollDirection,
  VirtualItem,
  VirtualizerAlign,
  VirtualizerKey,
  VirtualizerOptions,
  VirtualizerRange,
  VirtualizerScrollBehavior,
  VirtualizerScrollOptions,
} from "./virtualizer.types.js";

const DEFAULT_OVERSCAN = 1;
const DEFAULT_SCROLL_END_THRESHOLD = 1;
const DEFAULT_SCROLLING_RESET_MS = 150;

type ScrollState = {
  index: number | null;
  align: VirtualizerAlign;
  behavior: VirtualizerScrollBehavior;
};

type PendingScrollAnchor = [
  key: VirtualizerKey | null,
  offset: number,
  followOnAppend: VirtualizerScrollBehavior | null,
  anchorDelta: number,
];

/** Headless single-axis virtualizer. */
export class Virtualizer {
  /** Live merged options. */
  readonly options: Required<
    Omit<
      VirtualizerOptions,
      | "scrollToFn"
      | "measureElement"
      | "observeElementRect"
      | "observeElementOffset"
      | "onChange"
      | "shouldAdjustScrollPositionOnItemSizeChange"
      | "getItemKey"
      | "rangeExtractor"
      | "initialMeasurementsCache"
      | "initialOffset"
      | "initialRect"
    >
  > & {
    scrollToFn: NonNullable<VirtualizerOptions["scrollToFn"]>;
    measureElement: NonNullable<VirtualizerOptions["measureElement"]>;
    observeElementRect: NonNullable<VirtualizerOptions["observeElementRect"]>;
    observeElementOffset: NonNullable<VirtualizerOptions["observeElementOffset"]>;
    onChange: NonNullable<VirtualizerOptions["onChange"]>;
    getItemKey: NonNullable<VirtualizerOptions["getItemKey"]>;
    rangeExtractor: NonNullable<VirtualizerOptions["rangeExtractor"]>;
    initialMeasurementsCache: VirtualItem[];
    initialOffset: number | (() => number);
    initialRect: Rect;
  };

  /** Active scroll element (element or documentElement in window mode). */
  scrollElement: HTMLElement | null = null;

  /** Latest scrollport rect. */
  scrollRect: Rect | null = null;

  /** Current scroll offset along the virtual axis. */
  scrollOffset = 0;

  /** True while a scroll gesture is in progress. */
  isScrolling = false;

  /** Last detected scroll direction. */
  scrollDirection: ScrollDirection | null = null;

  /** Cached measured element nodes keyed by item key. */
  readonly elementsCache = new Map<VirtualizerKey, HTMLElement>();

  /** Optional scroll-adjustment predicate. */
  shouldAdjustScrollPositionOnItemSizeChange?: VirtualizerOptions["shouldAdjustScrollPositionOnItemSizeChange"];

  /** Latest computed visible range (before overscan extractor). */
  range: { startIndex: number; endIndex: number } | null = null;

  /** Cached measurements for all items. */
  measurementsCache: VirtualItem[] = [];

  private _itemSizeCache = new Map<VirtualizerKey, number>();
  private _laneCache = new Map<number, number>();
  private _totalSize = 0;
  private _viewportSize = 0;
  private _scrollAdjustments = 0;
  private _iosDeferredAdjustment = 0;
  private _iosTouching = false;
  private _iosJustTouchEnded = false;
  private _iosTouchEndTimer: ReturnType<typeof setTimeout> | undefined;
  private _intendedScrollOffset: number | null = null;
  private _scrollState: ScrollState | null = null;
  private _pendingScrollAnchor: PendingScrollAnchor | null = null;
  private _pendingMin: number | null = null;
  private _prevLanes: number | undefined;
  private _lanesChangedFlag = false;
  private _lanesSettling = false;
  private _cacheConsumed = false;
  private _initialOffsetApplied = false;
  private _prevCount = 0;
  private _unsubs: Array<() => void> = [];
  private _mounted = false;
  private _measureRo: ResizeObserver | null = null;
  private _virtualItemsCache: VirtualItem[] | null = null;
  private _virtualItemsCacheOffset = NaN;
  private _virtualItemsCacheOuterSize = -1;
  private _uniformLayout: UniformLayout | null = null;

  constructor(opts: VirtualizerOptions) {
    this.options = {
      overscan: DEFAULT_OVERSCAN,
      horizontal: false,
      paddingStart: 0,
      paddingEnd: 0,
      scrollMargin: 0,
      scrollPaddingStart: 0,
      scrollPaddingEnd: 0,
      gap: 0,
      lanes: 1,
      laneAssignmentMode: "estimate",
      enabled: true,
      isScrollingResetDelay: DEFAULT_SCROLLING_RESET_MS,
      useScrollendEvent: false,
      anchorTo: "start",
      followOnAppend: false,
      scrollEndThreshold: DEFAULT_SCROLL_END_THRESHOLD,
      useAnimationFrameWithResizeObserver: false,
      useWindowScroll: false,
      isRtl: false,
      indexAttribute: "data-index",
      debug: false,
      initialOffset: 0,
      initialMeasurementsCache: [],
      initialRect: { width: 0, height: 0 },
      getItemKey: defaultKeyExtractor,
      rangeExtractor: defaultRangeExtractor,
      onChange: () => {},
      measureElement: defaultMeasureElement,
      observeElementRect,
      observeElementOffset,
      scrollToFn: (
        offset: number,
        scrollOpts: { adjustments?: number; behavior?: VirtualizerScrollBehavior },
        instance: Virtualizer,
      ) => {
        if (instance.options.useWindowScroll) windowScroll(offset, scrollOpts, instance);
        else elementScroll(offset, scrollOpts, instance);
      },
      count: opts.count,
      getScrollElement: opts.getScrollElement,
      estimateSize: opts.estimateSize,
    } as unknown as Virtualizer["options"];

    this._applyUserOptions(opts);
    this.shouldAdjustScrollPositionOnItemSizeChange =
      opts.shouldAdjustScrollPositionOnItemSizeChange;

    if (this.options.initialMeasurementsCache.length) {
      this._itemSizeCache = new Map(
        this.options.initialMeasurementsCache.map((item) => [item.key, item.size]),
      );
      for (const item of this.options.initialMeasurementsCache) {
        this._sizesFromCache(item.index, item.size);
      }
      this._cacheConsumed = true;
    }

    this._rebuildMeasurements();
    this._prevCount = this.options.count;
  }

  setOptions(partial: Partial<VirtualizerOptions>): void {
    const prev = this.options;
    // Snapshot pre-mutation values so remeasure can compare by value (prev === this.options).
    const beforeCount = prev.count;
    const beforeEstimate = prev.estimateSize;
    const beforePaddingStart = prev.paddingStart;
    const beforePaddingEnd = prev.paddingEnd;
    const beforeGap = prev.gap;
    const beforeLanes = prev.lanes;
    let anchor: [VirtualizerKey, number] | null = null;
    let followOnAppend: VirtualizerScrollBehavior | null = null;
    let edgeKeysChanged = false;

    if (
      prev.enabled &&
      (partial.enabled ?? prev.enabled) &&
      (partial.anchorTo ?? prev.anchorTo) === "end" &&
      this.scrollElement
    ) {
      const prevCount = prev.count;
      const nextCount = partial.count ?? prevCount;
      const measurements = this.getMeasurements();
      const prevFirstKey =
        prevCount > 0 ? (measurements[0]?.key ?? prev.getItemKey(0)) : null;
      const prevLastKey =
        prevCount > 0
          ? (measurements[prevCount - 1]?.key ?? prev.getItemKey(prevCount - 1))
          : null;
      const getItemKey = partial.getItemKey ?? prev.getItemKey;
      const didCountChange = nextCount !== prevCount;
      const didEdgeKeysChange =
        didCountChange ||
        (prevCount > 0 &&
          nextCount > 0 &&
          (getItemKey(0) !== prevFirstKey ||
            getItemKey(nextCount - 1) !== prevLastKey));

      if (didEdgeKeysChange) {
        edgeKeysChanged = true;
        const item =
          prevCount > 0
            ? (this.getVirtualItemForOffset(this.getScrollOffset()) ?? measurements[0])
            : null;
        if (item) anchor = [item.key, this.getScrollOffset() - item.start];

        const follow = partial.followOnAppend ?? prev.followOnAppend;
        const behavior = follow === true ? "auto" : follow || null;
        if (
          behavior &&
          nextCount > prevCount &&
          this.isAtEnd(prev.scrollEndThreshold) &&
          (prevCount === 0 || getItemKey(nextCount - 1) !== prevLastKey)
        ) {
          followOnAppend = behavior;
        }
      }
    }

    this._applyPartialOptions(partial);

    if (partial.shouldAdjustScrollPositionOnItemSizeChange !== undefined) {
      this.shouldAdjustScrollPositionOnItemSizeChange =
        partial.shouldAdjustScrollPositionOnItemSizeChange;
    }

    if (edgeKeysChanged) {
      this._pendingMin = 0;
    }

    let anchorResolved = false;
    let anchorDelta = 0;
    if (anchor) {
      const [anchorKey, anchorOffset] = anchor;
      const newMeasurements = this.getMeasurements();
      const { count, getItemKey } = this.options;
      let idx = 0;
      while (idx < count && getItemKey(idx) !== anchorKey) idx++;
      if (idx < count) {
        const anchorItem = newMeasurements[idx];
        if (anchorItem) {
          const newOffset = anchorItem.start + anchorOffset;
          if (newOffset !== this.scrollOffset) {
            anchorDelta = newOffset - this.scrollOffset;
            this.scrollOffset = newOffset;
            anchorResolved = true;
          }
        }
      }
    }

    if (anchorResolved || followOnAppend) {
      this._pendingScrollAnchor = [
        anchorResolved ? anchor![0] : null,
        anchorResolved ? anchor![1] : 0,
        followOnAppend,
        anchorDelta,
      ];
    }

    // Only rebuild the O(count) measurements when an input actually changes — a fresh
    // estimateSize / count reference alone (re-passed every render) must not force a rebuild.
    const remeasure =
      (partial.count !== undefined && partial.count !== beforeCount) ||
      (partial.estimateSize !== undefined && partial.estimateSize !== beforeEstimate) ||
      (partial.paddingStart !== undefined && partial.paddingStart !== beforePaddingStart) ||
      (partial.paddingEnd !== undefined && partial.paddingEnd !== beforePaddingEnd) ||
      (partial.gap !== undefined && partial.gap !== beforeGap) ||
      (partial.lanes !== undefined && partial.lanes !== beforeLanes);

    if (partial.count !== undefined && partial.count < prev.count) {
      for (const key of [...this._itemSizeCache.keys()]) {
        const idx = this._indexForKey(key);
        if (idx >= partial.count) this._itemSizeCache.delete(key);
      }
      for (const key of this._laneCache.keys()) {
        if (key >= partial.count) this._laneCache.delete(key);
      }
    }

    if (remeasure || edgeKeysChanged) this._rebuildMeasurements();

    if (partial.count !== undefined && partial.count > this._prevCount) {
      this._maybeFollowOnAppend();
    }
    this._prevCount = this.options.count;

    if (
      partial.getScrollElement !== undefined ||
      partial.useWindowScroll !== undefined ||
      partial.enabled !== undefined
    ) {
      if (this._mounted) this._mountObservers();
    }
  }

  /** Alias for `options`. */
  getOptions(): Readonly<VirtualizerOptions> {
    return this.options;
  }

  getTotalSize(): number {
    return this._totalSize;
  }

  getMeasurements(): VirtualItem[] {
    if (this._pendingMin !== null || this._lanesChangedFlag) {
      this._rebuildMeasurements();
    }
    if (this._uniformLayout && this.measurementsCache.length !== this.options.count) {
      const count = this.options.count;
      const next = new Array<VirtualItem>(count);
      for (let index = 0; index < count; index++) next[index] = this._itemAt(index);
      this.measurementsCache = next;
    }
    return this.measurementsCache;
  }

  getVirtualItems(): VirtualItem[] {
    if (!this.isScrolling) this._syncScrollOffset();
    if (!this.options.enabled || this.options.count <= 0) return [];

    const outerSize = this.getSize();

    if (
      this._virtualItemsCache &&
      this.scrollOffset === this._virtualItemsCacheOffset &&
      outerSize === this._virtualItemsCacheOuterSize &&
      this._pendingMin === null &&
      !this._lanesChangedFlag
    ) {
      return this._virtualItemsCache;
    }

    const scrollOffset = Math.max(0, this.scrollOffset - this.options.scrollMargin);
    const lanes = Math.max(1, this.options.lanes);
    const layout = this._uniformLayout;

    this.range = layout
      ? calculateIndexRange({
          count: this.options.count,
          outerSize,
          scrollOffset,
          lanes,
          getStart: (index) => this.getItemOffset(index),
          getEnd: (index) => this.getItemOffset(index) + this.getItemSize(index),
        })
      : calculateRange({
          measurements: this.getMeasurements(),
          outerSize,
          scrollOffset,
          lanes,
        });

    if (!this.range) {
      if (this.options.count <= 0) return [];
      const fallbackEnd = Math.min(
        this.options.count - 1,
        Math.max(0, this.options.overscan),
      );
      this.range = { startIndex: 0, endIndex: fallbackEnd };
    }

    const range: VirtualizerRange = {
      ...this.range,
      overscan: this.options.overscan,
      count: this.options.count,
    };

    const indexes = this.options.rangeExtractor(range);
    const items = layout
      ? indexes.map((index) => this._itemAt(index))
      : indexes
          .map((index) => this.measurementsCache[index])
          .filter((item): item is VirtualItem => !!item);
    this._virtualItemsCache = items;
    this._virtualItemsCacheOffset = this.scrollOffset;
    this._virtualItemsCacheOuterSize = outerSize;
    return items;
  }

  getVirtualIndexes(): number[] {
    return this.getVirtualItems().map((item) => item.index);
  }

  getVirtualItemForOffset(offset: number): VirtualItem | undefined {
    const count = this.options.count;
    if (count <= 0) return undefined;
    if (this._uniformLayout) {
      const idx = findNearestBinarySearch(0, count - 1, (index) => this.getItemOffset(index), offset);
      return this._itemAt(idx);
    }
    const measurements = this.getMeasurements();
    if (!measurements.length) return undefined;
    const idx = findNearestBinarySearch(
      0,
      measurements.length - 1,
      (i) => measurements[i]!.start,
      offset,
    );
    return measurements[idx];
  }

  getItemOffset(index: number): number {
    if (index < 0 || index >= this.options.count) return 0;
    const layout = this._uniformLayout;
    if (layout) {
      if (index < layout.uniformStartIndex) {
        return layout.prefixStarts[index] ?? this.options.paddingStart;
      }
      const stride = layout.uniformSize + this.options.gap;
      return layout.uniformOrigin + (index - layout.uniformStartIndex) * stride;
    }
    return this.measurementsCache[index]?.start ?? 0;
  }

  getItemSize(index: number): number {
    if (index < 0 || index >= this.options.count) return 0;
    if (this._itemSizeCache.size) {
      const cached = this._itemSizeCache.get(this.options.getItemKey(index));
      if (cached !== undefined) return cached;
    }
    const layout = this._uniformLayout;
    if (layout) {
      if (index < layout.uniformStartIndex) {
        return layout.prefixSizes[index] ?? this.options.estimateSize(index);
      }
      return layout.uniformSize;
    }
    return this.measurementsCache[index]?.size ?? this.options.estimateSize(index);
  }

  getSize(): number {
    const measured = this._readViewportSize();
    let size = 0;
    if (this._viewportSize > 0) size = this._viewportSize;
    else if (this.scrollRect) {
      const fromRect = this.options.horizontal ? this.scrollRect.width : this.scrollRect.height;
      if (fromRect > 0) size = fromRect;
    }
    if (!(size > 0)) size = measured;
    return this._clampViewportSize(size);
  }

  getScrollOffset(): number {
    if (!this._mounted) this._syncScrollOffset();
    return this.scrollOffset;
  }

  getMaxScrollOffset(): number {
    const virtualMax = Math.max(0, this.getTotalSize() - this.getSize());
    const el = this.scrollElement ?? this.options.getScrollElement();
    if (!el) return virtualMax;

    if (this.options.useWindowScroll && typeof window !== "undefined") {
      const doc = document.documentElement;
      const domMax = this.options.horizontal
        ? doc.scrollWidth - window.innerWidth
        : doc.scrollHeight - window.innerHeight;
      return domMax > 0 ? domMax : virtualMax;
    }

    const domMax = this.options.horizontal
      ? el.scrollWidth - el.clientWidth
      : el.scrollHeight - el.clientHeight;
    return domMax > 0 ? domMax : virtualMax;
  }

  getVirtualDistanceFromEnd(): number {
    return Math.max(this.getTotalSize() - this.getSize() - this.getScrollOffset(), 0);
  }

  getDistanceFromEnd(): number {
    return Math.max(this.getMaxScrollOffset() - this.getScrollOffset(), 0);
  }

  isAtEnd(threshold = this.options.scrollEndThreshold): boolean {
    return this.getDistanceFromEnd() <= threshold;
  }

  getOffsetForAlignment(
    toOffset: number,
    align: VirtualizerAlign = "start",
    itemSize = 0,
  ): number {
    const size = this.getSize();
    const scrollOffset = this.getScrollOffset();

    if (align === "auto") {
      align = toOffset >= scrollOffset + size ? "end" : "start";
    }
    if (align === "center") toOffset += (itemSize - size) / 2;
    else if (align === "end") toOffset -= size;

    const maxOffset = this.getMaxScrollOffset();
    return Math.max(Math.min(maxOffset, toOffset), 0);
  }

  getOffsetForIndex(
    index: number,
    align: VirtualizerAlign = "auto",
  ): readonly [number, VirtualizerAlign] | undefined {
    index = Math.max(0, Math.min(index, this.options.count - 1));
    const item = this._uniformLayout ? this._itemAt(index) : this.measurementsCache[index];
    if (!item) return undefined;

    const size = this.getSize();
    const scrollOffset = this.getScrollOffset();

    if (align === "auto") {
      if (item.end >= scrollOffset + size - this.options.scrollPaddingEnd) {
        align = "end";
      } else if (item.start <= scrollOffset + this.options.scrollPaddingStart) {
        align = "start";
      } else {
        return [scrollOffset, align] as const;
      }
    }

    if (align === "end" && index === this.options.count - 1) {
      return [this.getMaxScrollOffset(), align] as const;
    }

    const toOffset =
      align === "end"
        ? item.end + this.options.scrollPaddingEnd
        : item.start - this.options.scrollPaddingStart;

    return [this.getOffsetForAlignment(toOffset, align, item.size), align] as const;
  }

  indexFromElement(node: Element): number {
    const indexStr = node.getAttribute(this.options.indexAttribute);
    if (!indexStr) {
      if (this.options.debug) {
        console.warn(
          `Missing attribute '${this.options.indexAttribute}={index}' on measured element.`,
        );
      }
      return -1;
    }
    return parseInt(indexStr, 10);
  }

  measureElement(node: Element | null): void {
    if (!node) {
      for (const [key, cached] of this.elementsCache) {
        if (!cached.isConnected) {
          this._measureRo?.unobserve(cached);
          this.elementsCache.delete(key);
        }
      }
      return;
    }

    if (!(node instanceof HTMLElement)) return;
    const index = this.indexFromElement(node);
    if (index < 0) return;

    const key = this.options.getItemKey(index);
    const prevNode = this.elementsCache.get(key);
    if (prevNode !== node) {
      if (prevNode) this._measureRo?.unobserve(prevNode);
      this._ensureMeasureObserver()?.observe(node);
      this.elementsCache.set(key, node);
    }

    if (this._shouldMeasureDuringScroll(index)) {
      this.resizeItem(index, this.options.measureElement(node, undefined, this));
    }
  }

  /** Bound ref callback — reads `indexAttribute` on the measured element. */
  readonly measureElementRef = (el: Element | undefined): void => {
    this.measureElement(el ?? null);
  };

  resizeItem(index: number, size: number): void {
    if (index < 0 || index >= this.options.count || !Number.isFinite(size) || size <= 0) {
      return;
    }

    const item = this._uniformLayout ? this._itemAt(index) : this.measurementsCache[index];
    if (!item) return;

    const key = item.key;
    const cachedSize = this._itemSizeCache.get(key) ?? item.size;
    const delta = size - cachedSize;
    if (delta === 0) return;

    const wasAtEnd =
      this.options.anchorTo === "end" &&
      this._scrollState?.behavior !== "smooth" &&
      this.getVirtualDistanceFromEnd() <= this.options.scrollEndThreshold;
    const prevTotalSize = wasAtEnd ? this.getTotalSize() : 0;

    const shouldAdjustScroll =
      this._scrollState?.behavior !== "smooth" &&
      (this.shouldAdjustScrollPositionOnItemSizeChange !== undefined
        ? this.shouldAdjustScrollPositionOnItemSizeChange(item, delta, this)
        : item.start < this.getScrollOffset() + this._scrollAdjustments &&
          this.scrollDirection !== "backward");

    if (this._pendingMin === null || index < this._pendingMin) {
      this._pendingMin = index;
    }

    this._itemSizeCache.set(key, size);
    if (this.options.laneAssignmentMode === "measured") {
      this._laneCache.delete(index);
    }

    if (wasAtEnd) {
      this._applyScrollAdjustment(this.getTotalSize() - prevTotalSize);
    } else if (shouldAdjustScroll) {
      this._applyScrollAdjustment(delta);
    }

    this._rebuildMeasurements();
    this._notify(this.isScrolling);
  }

  measure(): void {
    this._itemSizeCache.clear();
    this._laneCache.clear();
    this._pendingMin = 0;
    this._rebuildMeasurements();
    this._notify(false);
  }

  takeSnapshot(): VirtualItem[] {
    return this.measurementsCache
      .filter((m) => this._itemSizeCache.has(m.key))
      .map((m) => ({ ...m, size: this._itemSizeCache.get(m.key)! }));
  }

  scrollToOffset(
    toOffset: number,
    { align = "start", behavior = "auto" }: VirtualizerScrollOptions = {},
  ): void {
    const offset = this.getOffsetForAlignment(toOffset, align);
    this._scrollToOffset(offset, { adjustments: undefined, behavior });
  }

  scrollBy(delta: number, options: { behavior?: VirtualizerScrollBehavior } = {}): void {
    const offset = this.getScrollOffset() + delta;
    this._scrollToOffset(offset, { adjustments: undefined, behavior: options.behavior ?? "auto" });
  }

  scrollToIndex(index: number, options: VirtualizerScrollOptions = {}): void {
    const result = this.getOffsetForIndex(index, options.align ?? "auto");
    if (!result) return;
    const [offset, align] = result;
    this._scrollState = {
      index,
      align,
      behavior: options.behavior ?? "auto",
    };
    this._scrollToOffset(offset, { adjustments: undefined, behavior: options.behavior ?? "auto" });
  }

  scrollToEnd(options: { behavior?: VirtualizerScrollBehavior } = {}): void {
    this.scrollToIndex(this.options.count - 1, {
      align: "end",
      behavior: options.behavior ?? "auto",
    });
  }

  mount(): void {
    if (this._mounted) return;
    this._mounted = true;
    this._mountObservers();
    this._applyInitialOffset();
    this._mountIosTouchHandlers();
  }

  unmount(): void {
    this._mounted = false;
    for (const unsub of this._unsubs) unsub();
    this._unsubs = [];
    this._measureRo?.disconnect();
    this._measureRo = null;
    this._unmountIosTouchHandlers();
    this.scrollElement = null;
    this.scrollRect = null;
    this._scrollState = null;
  }

  notify(): void {
    this._invalidateVirtualItemsCache();
    this._syncScrollOffset();
    this._notify(false);
  }

  private _sizesFromCache(index: number, size: number): void {
    const key = this.options.getItemKey(index);
    this._itemSizeCache.set(key, size);
  }

  private _indexForKey(key: VirtualizerKey): number {
    for (let i = 0; i < this.options.count; i++) {
      if (this.options.getItemKey(i) === key) return i;
    }
    return -1;
  }

  private _applyUserOptions(opts: VirtualizerOptions): void {
    for (const key of Object.keys(opts) as Array<keyof VirtualizerOptions>) {
      const value = opts[key];
      if (value !== undefined) (this.options as Record<string, unknown>)[key] = value;
    }
    if (!this.options.rangeExtractor) this.options.rangeExtractor = defaultRangeExtractor;
    if (!this.options.getItemKey) this.options.getItemKey = defaultKeyExtractor;
    if (!this.options.measureElement) this.options.measureElement = defaultMeasureElement;
    if (!this.options.observeElementRect) this.options.observeElementRect = observeElementRect;
    if (!this.options.observeElementOffset) {
      this.options.observeElementOffset = observeElementOffset;
    }
  }

  private _applyPartialOptions(partial: Partial<VirtualizerOptions>): void {
    for (const key of Object.keys(partial) as Array<keyof VirtualizerOptions>) {
      const value = partial[key];
      if (value !== undefined) (this.options as Record<string, unknown>)[key] = value;
    }
    if (!this.options.rangeExtractor) this.options.rangeExtractor = defaultRangeExtractor;
  }

  private _ensureMeasureObserver(): ResizeObserver | null {
    if (this._measureRo) return this._measureRo;
    if (typeof ResizeObserver === "undefined") return null;

    this._measureRo = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const run = () => {
          const node = entry.target as HTMLElement;
          if (!node.isConnected) {
            this._measureRo?.unobserve(node);
            for (const [cacheKey, cachedNode] of this.elementsCache) {
              if (cachedNode === node) {
                this.elementsCache.delete(cacheKey);
                break;
              }
            }
            return;
          }

          const index = this.indexFromElement(node);
          if (index < 0 || !this._shouldMeasureDuringScroll(index)) return;

          this.resizeItem(index, this.options.measureElement(node, entry, this));
        };

        if (this.options.useAnimationFrameWithResizeObserver) {
          requestAnimationFrame(run);
        } else {
          run();
        }
      }
    });

    return this._measureRo;
  }

  private _shouldMeasureDuringScroll(index: number): boolean {
    if (!this._scrollState || this._scrollState.behavior !== "smooth") return true;
    const scrollIndex =
      this._scrollState.index ??
      this.getVirtualItemForOffset(this._scrollState.align === "end" ? this.getScrollOffset() : 0)
        ?.index;
    if (scrollIndex !== undefined && this.range) {
      const bufferSize = Math.max(
        this.options.overscan,
        Math.ceil((this.range.endIndex - this.range.startIndex) / 2),
      );
      const minIndex = Math.max(0, scrollIndex - bufferSize);
      const maxIndex = Math.min(this.options.count - 1, scrollIndex + bufferSize);
      return index >= minIndex && index <= maxIndex;
    }
    return true;
  }

  private _mountObservers(): void {
    for (const unsub of this._unsubs) unsub();
    this._unsubs = [];

    if (!this.options.enabled) {
      this.scrollElement = null;
      return;
    }

    const scrollEl = this.options.useWindowScroll
      ? typeof document !== "undefined"
        ? document.documentElement
        : null
      : this.options.getScrollElement();

    this.scrollElement = scrollEl;

    const observeEl = resolveObserveElement(scrollEl, this.options.observeElement);
    if (!observeEl) return;

    if (this.options.useWindowScroll) {
      this._unsubs.push(
        this.options.observeElementOffset(this, (offset, scrolling) =>
          this._onScrollOffset(offset, scrolling),
        ) ?? (() => {}),
      );
      this._unsubs.push(
        observeWindowRect(this, (rect) => {
          this.scrollRect = rect;
          const next = this.options.horizontal ? rect.width : rect.height;
          if (next !== this._viewportSize) {
            this._viewportSize = next;
            this._invalidateVirtualItemsCache();
          } else {
            this._viewportSize = next;
          }
          this._notify(false);
        }),
      );
      return;
    }

    this._unsubs.push(
      this.options.observeElementOffset(this, (offset, scrolling) =>
        this._onScrollOffset(offset, scrolling),
      ) ?? (() => {}),
    );

    this._unsubs.push(
      this.options.      observeElementRect(this, (rect) => {
        this.scrollRect = rect;
        const next = this.options.horizontal ? rect.width : rect.height;
        if (next !== this._viewportSize) {
          this._viewportSize = next;
          this._invalidateVirtualItemsCache();
        } else {
          this._viewportSize = next;
        }
        this._notify(false);
      }) ?? (() => {}),
    );

    for (const ancestor of getClippingAncestors(observeEl, true)) {
      this._unsubs.push(
        observeElementOffset(
          {
            ...this,
            scrollElement: ancestor,
            options: { ...this.options, isRtl: false },
          } as Virtualizer,
          (offset, scrolling) => this._onScrollOffset(offset, scrolling),
        ),
      );
    }
  }

  private _mountIosTouchHandlers(): void {
    if (!isIOSWebKit() || typeof window === "undefined") return;

    const onTouchStart = () => {
      this._iosTouching = true;
      this._iosJustTouchEnded = false;
      if (this._iosTouchEndTimer) clearTimeout(this._iosTouchEndTimer);
    };
    const onTouchEnd = () => {
      this._iosTouching = false;
      this._iosJustTouchEnded = true;
      this._iosTouchEndTimer = setTimeout(() => {
        this._iosJustTouchEnded = false;
        if (this._iosDeferredAdjustment !== 0) {
          this._scrollToOffset(this.getScrollOffset(), {
            adjustments: (this._scrollAdjustments += this._iosDeferredAdjustment),
            behavior: "auto",
          });
          this._iosDeferredAdjustment = 0;
        }
      }, 250);
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    this._unsubs.push(() => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      if (this._iosTouchEndTimer) clearTimeout(this._iosTouchEndTimer);
    });
  }

  private _unmountIosTouchHandlers(): void {
    this._iosTouching = false;
    this._iosJustTouchEnded = false;
    this._iosDeferredAdjustment = 0;
  }

  private _applyInitialOffset(): void {
    if (this._initialOffsetApplied) return;
    this._initialOffsetApplied = true;

    if (!this._cacheConsumed && this.options.initialMeasurementsCache.length) {
      for (const item of this.options.initialMeasurementsCache) {
        this._sizesFromCache(item.index, item.size);
      }
      this._cacheConsumed = true;
      this._rebuildMeasurements();
    }

    const initial = this.options.initialOffset;
    const offset = typeof initial === "function" ? initial() : initial;
    if (offset) this._scrollToOffset(offset, { adjustments: undefined, behavior: "auto" });
  }

  private _onScrollOffset(offset: number, isScrolling: boolean): void {
    const prev = this.scrollOffset;

    if (
      this._intendedScrollOffset !== null &&
      approxEqual(offset, this._intendedScrollOffset, 1.5)
    ) {
      offset = this._intendedScrollOffset;
    }

    if (approxEqual(offset, prev, 0.5)) {
      if (isScrolling !== this.isScrolling) {
        this.isScrolling = isScrolling;
        if (!isScrolling) this._notify(false);
      }
      return;
    }

    if (offset > prev) this.scrollDirection = "forward";
    else if (offset < prev) this.scrollDirection = "backward";

    this.scrollOffset = offset;
    this.isScrolling = isScrolling;
    this._notify(isScrolling);
  }

  private _syncScrollOffset(): void {
    this.scrollOffset = this._readScrollOffset();
  }

  private _applyScrollAdjustment(delta: number, behavior?: VirtualizerScrollBehavior): void {
    if (delta === 0) return;
    if (this.options.debug) console.info("correction", delta);

    if (isIOSWebKit() && (this.isScrolling || this._iosTouching || this._iosJustTouchEnded)) {
      this._iosDeferredAdjustment += delta;
      return;
    }

    this._scrollToOffset(this.getScrollOffset(), {
      adjustments: (this._scrollAdjustments += delta),
      behavior,
    });
  }

  private _scrollToOffset(
    offset: number,
    options: { adjustments?: number; behavior?: VirtualizerScrollBehavior },
  ): void {
    const behavior = options.behavior ?? "auto";
    this._intendedScrollOffset = offset;
    this.options.scrollToFn(offset, options, this);
    this.scrollOffset = offset + (options.adjustments ?? 0);
    this._notify(behavior === "smooth");

    if (behavior !== "smooth") {
      this._scrollState = null;
      this._flushPendingScrollAnchor();
    }
  }

  private _flushPendingScrollAnchor(): void {
    const anchor = this._pendingScrollAnchor;
    if (!anchor) return;
    this._pendingScrollAnchor = null;

    const [, , followOnAppend] = anchor;
    if (followOnAppend) {
      this.scrollToEnd({ behavior: followOnAppend });
    }
  }

  private _invalidateVirtualItemsCache(): void {
    this._virtualItemsCache = null;
    this._virtualItemsCacheOffset = NaN;
    this._virtualItemsCacheOuterSize = -1;
  }

  private _readScrollOffset(): number {
    if (this.options.useWindowScroll) {
      return readWindowScrollOffset(!!this.options.horizontal);
    }
    const el = this.scrollElement ?? this.options.getScrollElement();
    if (!el || !isVirtualizerScrollMetrics(el)) return 0;
    return readElementScrollOffset(el, !!this.options.horizontal, !!this.options.isRtl);
  }

  private _readViewportSize(): number {
    if (this.options.useWindowScroll) {
      return readWindowViewportSize(!!this.options.horizontal);
    }
    const el = this.scrollElement ?? this.options.getScrollElement();
    if (!el || !isVirtualizerScrollMetrics(el)) return 0;
    return readElementViewportSize(el, !!this.options.horizontal);
  }

  private _notify(sync: boolean): void {
    this.options.onChange(this, sync);
  }

  private _maybeFollowOnAppend(): void {
    const follow = this.options.followOnAppend;
    if (!follow || this.options.anchorTo !== "end") return;
    if (!this.isAtEnd()) return;
    const behavior = follow === true ? "auto" : follow;
    this.scrollToEnd({ behavior });
  }

  /** Content hosts are often sized to totalSize — that must not become the viewport. */
  private _clampViewportSize(size: number): number {
    if (typeof window === "undefined" || !(size > 0) || !(this._totalSize > 0)) return size;
    const cap = this.options.horizontal ? window.innerWidth : window.innerHeight;
    if (!(cap > 0)) return size;
    if (size > cap && size >= this._totalSize - 1) return cap;
    return size;
  }

  private _itemAt(index: number): VirtualItem {
    const size = this.getItemSize(index);
    const start = this.getItemOffset(index);
    return {
      index,
      start,
      end: start + size,
      size,
      key: this.options.getItemKey(index),
      lane: 0,
    };
  }

  private _rebuildMeasurements(): void {
    this._invalidateVirtualItemsCache();
    const count = this.options.count;
    const lanes = Math.max(1, this.options.lanes);
    const gap = this.options.gap;
    const paddingStart = this.options.paddingStart;
    const paddingEnd = this.options.paddingEnd;
    this._uniformLayout = null;

    const lanesChanged = this._prevLanes !== undefined && this._prevLanes !== lanes;
    if (lanesChanged) {
      this._lanesChangedFlag = true;
      this._laneCache.clear();
    }
    this._prevLanes = lanes;

    if (count <= 0) {
      this.measurementsCache = [];
      this._totalSize = paddingStart + paddingEnd;
      this._pendingMin = null;
      return;
    }

    if (this._lanesChangedFlag) {
      this._lanesChangedFlag = false;
      this._lanesSettling = true;
      this._pendingMin = 0;
    }

    if (lanes === 1 && this._itemSizeCache.size === 0 && !this._lanesSettling) {
      const layout = probeUniformLayout(
        count,
        this.options.estimateSize,
        paddingStart,
        paddingEnd,
        gap,
      );
      if (layout) {
        this._uniformLayout = layout;
        this.measurementsCache = [];
        this._totalSize = layout.totalSize;
        this._pendingMin = null;
        return;
      }
    }

    const startIndex = this._lanesSettling ? 0 : (this._pendingMin ?? 0);
    this._pendingMin = null;

    if (this.measurementsCache.length === 0 || startIndex === 0) {
      this.measurementsCache = new Array(count);
    } else if (this.measurementsCache.length !== count) {
      const next = new Array<VirtualItem>(count);
      for (let i = 0; i < Math.min(count, this.measurementsCache.length); i++) {
        next[i] = this.measurementsCache[i]!;
      }
      this.measurementsCache = next;
    }

    if (lanes === 1) {
      let acc = startIndex > 0 ? this.measurementsCache[startIndex - 1]!.end + gap : paddingStart;
      if (startIndex === 0) acc = paddingStart;

      for (let index = startIndex; index < count; index++) {
        const key = this.options.getItemKey(index);
        const size = this._itemSizeCache.get(key) ?? this.options.estimateSize(index);
        const start = index === 0 && startIndex === 0 ? paddingStart : acc;
        const end = start + size;
        this.measurementsCache[index] = { index, start, end, size, key, lane: 0 };
        acc = end + gap;
      }

      const last = this.measurementsCache[count - 1]!;
      this._totalSize = last.end + paddingEnd;
      if (this._lanesSettling) this._lanesSettling = false;
      return;
    }

    const laneEnds = new Array<number>(lanes).fill(paddingStart);
    if (startIndex > 0) {
      for (let i = 0; i < startIndex; i++) {
        const item = this.measurementsCache[i]!;
        laneEnds[item.lane] = item.end + gap;
      }
    }

    for (let index = startIndex; index < count; index++) {
      const key = this.options.getItemKey(index);
      const size = this._itemSizeCache.get(key) ?? this.options.estimateSize(index);
      let lane = this._laneCache.get(index);

      if (lane === undefined) {
        lane = laneEnds.indexOf(Math.min(...laneEnds));
        if (this.options.laneAssignmentMode === "estimate" || this._itemSizeCache.has(key)) {
          this._laneCache.set(index, lane);
        }
      }

      const start = laneEnds[lane]!;
      const end = start + size;
      this.measurementsCache[index] = { index, start, end, size, key, lane };
      laneEnds[lane] = end + gap;
    }

    this._totalSize = Math.max(...laneEnds) - (count > 0 ? gap : 0) + paddingEnd;
    if (this._lanesSettling && this.measurementsCache.length === count) {
      this._lanesSettling = false;
    }
  }
}

export type { VirtualizerAlign, VirtualizerScrollOptions };
