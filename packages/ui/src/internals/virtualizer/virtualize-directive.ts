import { html, noChange, type TemplateResult } from "lit";
import { AsyncDirective } from "lit/async-directive.js";
import { directive, PartType, type ChildPart, type PartInfo } from "lit/directive.js";
import { ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import {
  applyContentSize,
  laneSliceStyle,
  markVirtualizeContent,
  resolveScrollElement,
  scrollContentBoxSize,
  virtualizerRef,
  virtualRangeKey,
  type VirtualizerHostElement,
} from "./directive-host.js";
import { resolveIsRtl } from "./virtualizer-utils.js";
import { Virtualizer } from "./virtualizer.js";
import type { VirtualItem, VirtualizeDirectiveConfig } from "./virtualizer.types.js";

function engineOptions<T>(
  config: VirtualizeDirectiveConfig<T>,
  scrollEl: HTMLElement | null,
  host: HTMLElement,
  onChange: () => void,
) {
  return {
    count: config.items.length,
    getScrollElement: () => scrollEl ?? host,
    estimateSize: config.estimateSize,
    overscan: config.overscan,
    horizontal: config.horizontal,
    paddingStart: config.paddingStart,
    paddingEnd: config.paddingEnd,
    scrollMargin: config.scrollMargin,
    scrollPaddingStart: config.scrollPaddingStart,
    scrollPaddingEnd: config.scrollPaddingEnd,
    gap: config.gap,
    lanes: config.lanes,
    laneAssignmentMode: config.laneAssignmentMode,
    enabled: config.enabled,
    isRtl: config.isRtl ?? resolveIsRtl(scrollEl ?? host, config.isRtl),
    initialOffset: config.initialOffset,
    initialMeasurementsCache: config.initialMeasurementsCache,
    rangeExtractor: config.rangeExtractor,
    useWindowScroll: config.useWindowScroll,
    anchorTo: config.anchorTo,
    followOnAppend: config.followOnAppend,
    indexAttribute: config.indexAttribute,
    debug: config.debug,
    shouldAdjustScrollPositionOnItemSizeChange: config.shouldAdjustScrollPositionOnItemSizeChange,
    getItemKey: config.keyFunction
      ? (index: number) => config.keyFunction!(config.items[index]!, index) as string | number
      : undefined,
    onChange: () => {
      onChange();
    },
  };
}

class VirtualizeDirective<T> extends AsyncDirective {
  private _engine?: Virtualizer;
  private _contentHost?: HTMLElement;
  private _scrollRoot?: HTMLElement;
  private _scrollEl: HTMLElement | null = null;
  private _config?: VirtualizeDirectiveConfig<T>;
  private _items: T[] = [];
  private _virtualItems: VirtualItem[] = [];
  private _lanes = 1;
  private _horizontal = false;
  private _isRtl = false;
  private _scrollMargin = 0;
  private _indexAttribute = "data-index";
  private _rangeRaf = 0;
  private _committing = false;
  private _rangeKey = "";

  /** Stable ref — inline closures re-run measureElement on every Lit commit. */
  private _sliceRef = (el: Element | undefined): void => {
    if (!(el instanceof HTMLElement) || !this._engine) return;
    if (this._indexAttribute !== "data-index") {
      const index = el.getAttribute("data-index");
      if (index) el.setAttribute(this._indexAttribute, index);
    }
    this._engine.measureElementRef(el);
  };

  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.CHILD) {
      throw new Error("virtualize() must be used as a child expression");
    }
  }

  override render(config: VirtualizeDirectiveConfig<T>): unknown {
    return html`
      <div data-virtualize-content style="position:relative" ${ref(this._contentRef)}>
        ${repeat(
          this._virtualItems,
          (vi) => config.keyFunction?.(this._items[vi.index]!, vi.index) ?? vi.key,
          (vi) => this._renderSlice(config, vi),
        )}
      </div>
    `;
  }

  override update(part: ChildPart, [config]: [VirtualizeDirectiveConfig<T>]): unknown {
    const scrollRoot = part.parentNode;
    if (!(scrollRoot instanceof HTMLElement)) {
      this._publish(config);
      return noChange;
    }

    this._config = config;
    this._scrollRoot = scrollRoot;
    this._items = config.items;
    this._horizontal = !!config.horizontal;
    this._lanes = Math.max(1, config.lanes ?? 1);
    this._indexAttribute = config.indexAttribute ?? "data-index";

    this._scrollEl = resolveScrollElement(
      scrollRoot,
      config.scroller,
      config.getScrollElement,
      config.useWindowScroll,
    );
    this._isRtl = config.isRtl ?? resolveIsRtl(this._scrollEl ?? scrollRoot, config.isRtl);
    this._scrollMargin = config.scrollMargin ?? 0;

    if (!this._engine) {
      this._engine = new Virtualizer(
        engineOptions(config, this._scrollEl, scrollRoot, () => this._onRangeChanged()),
      );
      this._engine.mount();
    } else {
      this._engine.setOptions(
        engineOptions(config, this._scrollEl, scrollRoot, () => this._onRangeChanged()),
      );
    }

    this._virtualItems = this._engine.getVirtualItems();
    this._rangeKey = virtualRangeKey(this._virtualItems);
    if (this._contentHost) this._applyLayout(this._contentHost);

    this._publish(config);
    return noChange;
  }

  /** AsyncDirective owns the ChildPart — never return a template from update(). */
  private _publish(config: VirtualizeDirectiveConfig<T>): void {
    this.setValue(this.render(config));
  }

  override disconnected(): void {
    if (this._rangeRaf) cancelAnimationFrame(this._rangeRaf);
    this._engine?.unmount();
  }

  override reconnected(): void {
    this._engine?.mount();
  }

  private _contentRef = (el: Element | undefined): void => {
    if (!(el instanceof HTMLElement) || el === this._contentHost) return;
    markVirtualizeContent(el);
    this._contentHost = el;
    (el as VirtualizerHostElement)[virtualizerRef] = this._engine!;
    this._applyLayout(el);
    this._engine?.notify();
  };

  /** Measure every mounted slice — a shared Lit `ref` on `repeat()` does not run per row. */
  private _measureVisible(): void {
    if (!this._contentHost || !this._engine) return;
    for (const node of this._contentHost.querySelectorAll("[data-index]")) {
      if (node instanceof HTMLElement) this._engine.measureElement(node);
    }
  }

  private _onRangeChanged(): void {
    if (this._committing || this._rangeRaf) return;
    this._rangeRaf = requestAnimationFrame(() => {
      this._rangeRaf = 0;
      this._commitRange();
    });
  }

  private _commitRange(): void {
    if (!this._config) return;

    this._committing = true;
    try {
      this._measureVisible();
      this._syncPublishedRange();
      /* Newly mounted slices exist after publish — measure them before the browser paints. */
      this._measureVisible();
      this._syncPublishedRange();
    } finally {
      this._committing = false;
    }

    this._config.onRangeChange?.();
    /* Child `vu-*` first render is a microtask; remeasure before paint. */
    queueMicrotask(() => this._remeasureAfterUpgrade());
  }

  private _remeasureAfterUpgrade(): void {
    if (!this._config || this._committing) return;
    this._committing = true;
    try {
      this._measureVisible();
      this._syncPublishedRange();
    } finally {
      this._committing = false;
    }
  }

  private _syncPublishedRange(): void {
    if (!this._config) return;
    const items = this._engine?.getVirtualItems() ?? [];
    if (this._contentHost) this._applyLayout(this._contentHost);
    const key = virtualRangeKey(items);
    if (key === this._rangeKey) return;
    this._rangeKey = key;
    this._virtualItems = items;
    this._publish(this._config);
  }

  private _applyLayout(host: HTMLElement): void {
    if (!this._engine) return;

    const total = this._engine.getTotalSize();
    if (this._horizontal) {
      applyContentSize(host, total, 0, { fillCross: "block" });
    } else {
      applyContentSize(host, 0, total, { fillCross: "inline" });
    }
  }

  private _renderSlice(config: VirtualizeDirectiveConfig<T>, vi: VirtualItem): TemplateResult {
    const item = this._items[vi.index]!;
    const scrollEl = this._scrollEl ?? this._scrollRoot;
    const cross =
      this._lanes > 1 ? scrollContentBoxSize(scrollEl, this._horizontal) : 0;

    const style = laneSliceStyle({
      item: vi,
      laneCount: this._lanes,
      crossSize: cross,
      horizontal: this._horizontal,
      scrollMargin: this._scrollMargin,
      isRtl: this._isRtl && !this._horizontal,
    });

    return html`
      <div
        data-index=${vi.index}
        data-virtual-key=${String(vi.key)}
        data-virtual-index=${vi.index}
        style=${style}
        ${ref(this._sliceRef)}
      >
        ${config.renderItem(item, vi.index)}
      </div>
    `;
  }
}

/** 1D virtual list directive for Lit templates. */
export const virtualize = directive(VirtualizeDirective);

export { virtualizerRef };
export type { VirtualizerHostElement };
