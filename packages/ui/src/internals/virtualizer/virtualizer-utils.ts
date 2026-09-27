import type { VirtualItem, VirtualizerRange, Rect } from "./virtualizer.types.js";
import type { Virtualizer } from "./virtualizer.js";

export { resolveIsRtl } from "../utils/dir.js";

/** Default item key extractor. */
export function defaultKeyExtractor(index: number): number {
  return index;
}

/** Default visible index range with overscan. */
export function defaultRangeExtractor(range: VirtualizerRange): number[] {
  const start = Math.max(0, range.startIndex - range.overscan);
  const end = Math.min(range.count - 1, range.endIndex + range.overscan);
  const indexes: number[] = [];
  for (let i = start; i <= end; i++) indexes.push(i);
  return indexes;
}

/** Pins leading row indices into every visible range (sticky header rows). */
export function stickyRangeExtractor(
  stickyCount: number,
  base: (range: VirtualizerRange) => number[] = defaultRangeExtractor,
): (range: VirtualizerRange) => number[] {
  return (range) => {
    const indexes = base(range);
    for (let index = 0; index < stickyCount; index++) {
      if (!indexes.includes(index)) indexes.push(index);
    }
    indexes.sort((a, b) => a - b);
    return indexes;
  };
}

/** Pins leading + trailing column indices into every visible range (pinned columns). */
export function pinnedColumnRangeExtractor(
  leftCount: number,
  rightCount: number,
  base: (range: VirtualizerRange) => number[] = defaultRangeExtractor,
): (range: VirtualizerRange) => number[] {
  return (range) => {
    const indexes = base(range);
    for (let index = 0; index < leftCount; index++) {
      if (!indexes.includes(index)) indexes.push(index);
    }
    const rightStart = Math.max(0, range.count - rightCount);
    for (let index = rightStart; index < range.count; index++) {
      if (!indexes.includes(index)) indexes.push(index);
    }
    indexes.sort((a, b) => a - b);
    return indexes;
  };
}

/** Float-safe equality check. */
export function approxEqual(a: number, b: number, tolerance = 1.01): boolean {
  return Math.abs(a - b) <= tolerance;
}

/** Debounced callback helper. */
export function debounce(delay: number, fn: () => void): { call: () => void; cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return {
    call: () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(fn, delay);
    },
    cancel: () => {
      if (timer) clearTimeout(timer);
      timer = undefined;
    },
  };
}

const supportsScrollend = typeof window !== "undefined" && "onscrollend" in window;

/** Scrollport client size — never use offset* (includes scrollable overflow and breaks range). */
function getElementRect(element: HTMLElement): Rect {
  return {
    width: element.clientWidth,
    height: element.clientHeight,
  };
}

/** Default element measurement. */
export function measureElement(
  element: HTMLElement,
  entry: ResizeObserverEntry | undefined,
  instance: Virtualizer,
): number {
  if (entry?.borderBoxSize) {
    const box = entry.borderBoxSize[0];
    if (box) {
      return Math.round(box[instance.options.horizontal ? "inlineSize" : "blockSize"]);
    }
  }

  return instance.options.horizontal ? element.offsetWidth : element.offsetHeight;
}

function scrollWithAdjustments(
  target: Element | Window,
  offset: number,
  horizontal: boolean,
  behavior: ScrollBehavior,
  adjustments = 0,
): void {
  const value = offset + adjustments;
  const props = horizontal ? { left: value, behavior } : { top: value, behavior };
  try {
    target.scrollTo(props);
  } catch {
    /* jsdom */
  }
  if (target instanceof HTMLElement) {
    if (horizontal) target.scrollLeft = value;
    else target.scrollTop = value;
  }
}

/** Scrolls a DOM element to `offset` on the active axis. */
export function elementScroll(
  offset: number,
  options: { adjustments?: number; behavior?: ScrollBehavior },
  instance: Virtualizer,
): void {
  const el = instance.scrollElement ?? instance.options.getScrollElement();
  if (!(el instanceof HTMLElement)) return;
  const behavior = options.behavior === "instant" ? "auto" : (options.behavior ?? "auto");
  scrollWithAdjustments(
    el,
    offset,
    !!instance.options.horizontal,
    behavior,
    options.adjustments ?? 0,
  );
}

/** Scrolls the window/document to `offset`. */
export function windowScroll(
  offset: number,
  options: { adjustments?: number; behavior?: ScrollBehavior },
  instance: Virtualizer,
): void {
  if (typeof window === "undefined") return;
  const behavior = options.behavior === "instant" ? "auto" : (options.behavior ?? "auto");
  scrollWithAdjustments(
    window,
    offset,
    !!instance.options.horizontal,
    behavior,
    options.adjustments ?? 0,
  );
}

/** Reads scroll offset from an element or duck-typed scroll adapter. */
export function readElementScrollOffset(
  el: VirtualizerScrollMetrics,
  horizontal: boolean,
  isRtl = false,
): number {
  if (horizontal) return el.scrollLeft * (isRtl ? -1 : 1);
  return el.scrollTop;
}

/** Reads scroll offset from window/document. */
export function readWindowScrollOffset(horizontal: boolean): number {
  if (typeof window === "undefined") return 0;
  return horizontal ? window.scrollX : window.scrollY;
}

/** Reads viewport size along the scroll axis. */
export function readElementViewportSize(el: VirtualizerScrollMetrics, horizontal: boolean): number {
  return horizontal ? el.clientWidth : el.clientHeight;
}

/** Reads window viewport size along the scroll axis. */
export function readWindowViewportSize(horizontal: boolean): number {
  if (typeof document === "undefined") return 0;
  return horizontal ? document.documentElement.clientWidth : document.documentElement.clientHeight;
}

function observeOffset(
  instance: Virtualizer,
  cb: (offset: number, isScrolling: boolean) => void,
  readOffset: () => number,
  addListener: (handler: () => void) => () => void,
): () => void {
  let offset = 0;
  const resetDelay = instance.options.isScrollingResetDelay ?? 150;
  const fallback =
    instance.options.useScrollendEvent && supportsScrollend
      ? null
      : debounce(resetDelay, () => cb(offset, false));

  const handler = () => {
    offset = readOffset();
    cb(offset, true);
    fallback?.call();
  };

  handler();
  const remove = addListener(handler);

  if (instance.options.useScrollendEvent && supportsScrollend) {
    const endHandler = () => cb(offset, false);
    if (typeof window !== "undefined") {
      window.addEventListener("scrollend", endHandler, { passive: true });
      return () => {
        remove();
        fallback?.cancel();
        window.removeEventListener("scrollend", endHandler);
      };
    }
  }

  return () => {
    remove();
    fallback?.cancel();
  };
}

/** Observes element scroll offset changes. */
export function observeElementOffset(
  instance: Virtualizer,
  cb: (offset: number, isScrolling: boolean) => void,
): () => void {
  const scrollEl = instance.scrollElement ?? instance.options.getScrollElement();
  const observeEl = resolveObserveElement(scrollEl, instance.options.observeElement);
  if (!observeEl) return () => {};

  const read = () => {
    const el = instance.scrollElement ?? instance.options.getScrollElement();
    if (!el || !isVirtualizerScrollMetrics(el)) return 0;
    return readElementScrollOffset(el, !!instance.options.horizontal, !!instance.options.isRtl);
  };

  return observeOffset(instance, cb, read, (handler) => {
    observeEl.addEventListener("scroll", handler, { passive: true });
    return () => observeEl.removeEventListener("scroll", handler);
  });
}

/** Observes window scroll offset changes. */
export function observeWindowOffset(
  instance: Virtualizer,
  cb: (offset: number, isScrolling: boolean) => void,
): () => void {
  if (typeof window === "undefined") return () => {};

  const read = () => readWindowScrollOffset(!!instance.options.horizontal);

  return observeOffset(instance, cb, read, (handler) => {
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  });
}

/** Observes element client rect changes. */
export function observeElementRect(instance: Virtualizer, cb: (rect: Rect) => void): () => void {
  const scrollEl = instance.scrollElement ?? instance.options.getScrollElement();
  const observeEl = resolveObserveElement(scrollEl, instance.options.observeElement);
  if (!observeEl) return () => {};

  const emit = () => {
    const el = instance.scrollElement ?? instance.options.getScrollElement();
    if (isVirtualizerScrollMetrics(el)) {
      cb({ width: Math.round(el.clientWidth), height: Math.round(el.clientHeight) });
      return;
    }
    if (observeEl instanceof HTMLElement) {
      const rect = getElementRect(observeEl);
      cb({ width: Math.round(rect.width), height: Math.round(rect.height) });
    }
  };

  emit();

  if (typeof ResizeObserver === "undefined") return () => {};

  const ro = new ResizeObserver(() => {
    const run = () => {
      /* Always use client box — border-box tracks inner content and breaks range. */
      emit();
    };

    if (instance.options.useAnimationFrameWithResizeObserver) {
      requestAnimationFrame(run);
    } else {
      run();
    }
  });

  ro.observe(observeEl, { box: "border-box" } as ResizeObserverOptions);
  return () => ro.disconnect();
}

/** Observes window viewport rect changes. */
export function observeWindowRect(instance: Virtualizer, cb: (rect: Rect) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const emit = () => {
    cb({ width: window.innerWidth, height: window.innerHeight });
  };
  emit();
  window.addEventListener("resize", emit, { passive: true });
  return () => window.removeEventListener("resize", emit);
}

/** Returns clipping scrollable ancestors (innermost first). */
export function getClippingAncestors(el: HTMLElement, includeSelf = false): HTMLElement[] {
  const result: HTMLElement[] = [];
  let node: HTMLElement | null = includeSelf ? el : el.parentElement;
  while (node) {
    const { overflow, overflowX, overflowY } = getComputedStyle(node);
    if (
      /auto|scroll|overlay/.test(overflow) ||
      /auto|scroll|overlay/.test(overflowX) ||
      /auto|scroll|overlay/.test(overflowY)
    ) {
      result.push(node);
    }
    node = node.parentElement;
  }
  return result;
}

/** Duck-typed scrollport (e.g. data-table pin-zone adapter). */
export type VirtualizerScrollMetrics = Pick<
  HTMLElement,
  "scrollTop" | "scrollLeft" | "clientWidth" | "clientHeight"
>;

export function isVirtualizerScrollMetrics(value: unknown): value is VirtualizerScrollMetrics {
  if (!value || typeof value !== "object") return false;
  const node = value as Partial<VirtualizerScrollMetrics>;
  return (
    typeof node.scrollTop === "number" &&
    typeof node.scrollLeft === "number" &&
    typeof node.clientWidth === "number" &&
    typeof node.clientHeight === "number"
  );
}

/** DOM node used for scroll/resize listeners when `getScrollElement` is a duck-typed adapter. */
export function resolveObserveElement(
  scrollEl: unknown,
  observeElement?: () => HTMLElement | null,
): HTMLElement | null {
  const explicit = observeElement?.();
  if (explicit instanceof HTMLElement) return explicit;
  if (scrollEl instanceof HTMLElement) return scrollEl;
  return null;
}

/** Binary search: largest index whose start <= offset. */
export function findNearestBinarySearch(
  low: number,
  high: number,
  getStart: (index: number) => number,
  offset: number,
): number {
  while (low <= high) {
    const mid = (low + high) >> 1;
    const start = getStart(mid);
    const nextStart = mid < high ? getStart(mid + 1) : Number.POSITIVE_INFINITY;
    if (start <= offset && nextStart > offset) return mid;
    if (start < offset) low = mid + 1;
    else high = mid - 1;
  }
  return Math.max(0, high);
}

/** Leading sizes that differ from a constant tail — O(1) offset after a short probe. */
export type UniformLayout = {
  prefixSizes: number[];
  prefixStarts: number[];
  uniformSize: number;
  uniformStartIndex: number;
  uniformOrigin: number;
  totalSize: number;
};

const UNIFORM_PREFIX_SCAN = 64;

/** Detects padding + prefix + `count * size` layout without allocating `count` measurements. */
export function probeUniformLayout(
  count: number,
  estimateSize: (index: number) => number,
  paddingStart: number,
  paddingEnd: number,
  gap: number,
): UniformLayout | null {
  if (count <= 0) return null;
  const lastSize = estimateSize(count - 1);
  if (!(lastSize > 0)) return null;
  if (count > 1 && estimateSize(count >> 1) !== lastSize) return null;

  const prefixSizes: number[] = [];
  const prefixStarts: number[] = [];
  let acc = paddingStart;
  const scan = Math.min(count, UNIFORM_PREFIX_SCAN);
  let index = 0;
  for (; index < scan; index++) {
    const size = estimateSize(index);
    if (!(size > 0)) return null;
    if (size === lastSize) break;
    prefixSizes.push(size);
    prefixStarts.push(acc);
    acc += size + gap;
  }
  if (index === scan && scan < count) return null;
  for (let cursor = index; cursor < scan; cursor++) {
    if (estimateSize(cursor) !== lastSize) return null;
  }

  const uniformCount = count - index;
  const stride = lastSize + gap;
  const lastStart =
    uniformCount > 0 ? acc + Math.max(0, uniformCount - 1) * stride : prefixStarts[count - 1]!;
  const lastSizeActual = uniformCount > 0 ? lastSize : prefixSizes[count - 1]!;
  return {
    prefixSizes,
    prefixStarts,
    uniformSize: lastSize,
    uniformStartIndex: index,
    uniformOrigin: acc,
    totalSize: lastStart + lastSizeActual + paddingEnd,
  };
}

/** Visible index range from start/end getters — does not require a `count`-length array. */
export function calculateIndexRange(options: {
  count: number;
  outerSize: number;
  scrollOffset: number;
  lanes: number;
  getStart: (index: number) => number;
  getEnd: (index: number) => number;
  getLane?: (index: number) => number;
}): { startIndex: number; endIndex: number } | null {
  const { count, outerSize, scrollOffset, lanes, getStart, getEnd, getLane } = options;
  if (count <= 0 || outerSize <= 0) return null;

  const lastIndex = count - 1;
  if (count <= lanes) return { startIndex: 0, endIndex: lastIndex };

  let startIndex = findNearestBinarySearch(0, lastIndex, getStart, scrollOffset);
  let endIndex = startIndex;

  if (lanes === 1) {
    const limit = scrollOffset + outerSize;
    while (endIndex < lastIndex && getEnd(endIndex) < limit) endIndex++;
  } else {
    const endPerLane = new Array<number>(lanes).fill(0);
    while (endIndex < lastIndex && endPerLane.some((pos) => pos < scrollOffset + outerSize)) {
      endPerLane[getLane?.(endIndex) ?? 0] = getEnd(endIndex);
      endIndex++;
    }

    const startPerLane = new Array<number>(lanes).fill(scrollOffset + outerSize);
    while (startIndex >= 0 && startPerLane.some((pos) => pos >= scrollOffset)) {
      startPerLane[getLane?.(startIndex) ?? 0] = getStart(startIndex);
      startIndex--;
    }

    startIndex = Math.max(0, startIndex - (startIndex % lanes));
    endIndex = Math.min(lastIndex, endIndex + (lanes - 1 - (endIndex % lanes)));
  }

  return { startIndex, endIndex };
}

/** Calculates visible index range. */
export function calculateRange(options: {
  measurements: VirtualItem[];
  outerSize: number;
  scrollOffset: number;
  lanes: number;
}): { startIndex: number; endIndex: number } | null {
  const { measurements, outerSize, scrollOffset, lanes } = options;
  if (measurements.length === 0) return null;
  return calculateIndexRange({
    count: measurements.length,
    outerSize,
    scrollOffset,
    lanes,
    getStart: (index) => measurements[index]!.start,
    getEnd: (index) => measurements[index]!.end,
    getLane: (index) => measurements[index]!.lane,
  });
}

/** Maps cached VirtualItem snapshots to a size map. */
export function sizesFromMeasurementCache(cache: VirtualItem[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const item of cache) map.set(item.index, item.size);
  return map;
}

/** iOS WebKit detection — defers scroll writes during momentum scroll. */
let _isIOSResult: boolean | undefined;

export function isIOSWebKit(): boolean {
  if (_isIOSResult !== undefined) return _isIOSResult;
  if (typeof navigator === "undefined") return (_isIOSResult = false);
  if (/iP(hone|od|ad)/.test(navigator.userAgent)) return (_isIOSResult = true);
  const mtp = (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints;
  return (_isIOSResult = navigator.platform === "MacIntel" && mtp !== undefined && mtp > 0);
}

/** Test hook — resets iOS detection cache. */
export function resetIOSDetectionForTests(): void {
  _isIOSResult = undefined;
}
