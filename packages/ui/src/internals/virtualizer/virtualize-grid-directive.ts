import { html, noChange, nothing, type TemplateResult } from "lit";
import { AsyncDirective } from "lit/async-directive.js";
import { directive, PartType, type ChildPart, type PartInfo } from "lit/directive.js";
import { ref } from "lit/directives/ref.js";
import { repeat } from "lit/directives/repeat.js";
import {
  applyContentSize,
  markVirtualizeContent,
  resolveScrollElement,
  virtualGridRangeKey,
  virtualizerRef,
  virtualSliceStyle,
  virtualStickyLeftSliceStyle,
  virtualStickyRightSliceStyle,
  virtualStickyRowSliceStyle,
  type VirtualizerHostElement,
} from "./directive-host.js";
import { resolveIsRtl, stickyRangeExtractor, pinnedColumnRangeExtractor, resolveObserveElement, readElementScrollOffset } from "./virtualizer-utils.js";
import { GridVirtualizer } from "./grid-virtualizer.js";
import type { VirtualCell, VirtualizeGridDirectiveConfig } from "./virtualizer.types.js";

/** Stable per-directive delegates so the engine's estimate/key identities never change across renders. */
type StableEngineFns = {
  estimateRowSize: (index: number) => number;
  estimateColumnSize: (index: number) => number;
  getRowKey: (row: number) => string | number;
  getColumnKey: (column: number) => string | number;
};

function engineOptions(
  config: VirtualizeGridDirectiveConfig,
  scrollEl: unknown,
  scrollRoot: HTMLElement,
  onChange: () => void,
  isRtl: boolean,
  stable: StableEngineFns,
) {
  const stickyCount = config.stickyRowCount ?? 0;
  const stickyColLeft = config.stickyColumnLeftCount ?? 0;
  const stickyColRight = config.stickyColumnRightCount ?? 0;
  return {
    rowCount: config.rowCount,
    columnCount: config.columnCount,
    getScrollElement: () => {
      const fromConfig = config.getScrollElement?.();
      if (fromConfig) return fromConfig;
      return (scrollEl as HTMLElement | null) ?? scrollRoot;
    },
    observeElement: config.observeElement,
    estimateRowSize: stable.estimateRowSize,
    estimateColumnSize: stable.estimateColumnSize,
    rowOverscan: config.rowOverscan,
    columnOverscan: config.columnOverscan,
    paddingStart: config.paddingStart,
    paddingEnd: config.paddingEnd,
    scrollMargin: config.scrollMargin,
    rowScrollMargin: config.rowScrollMargin,
    columnScrollMargin: config.columnScrollMargin,
    scrollPaddingStart: config.scrollPaddingStart,
    scrollPaddingEnd: config.scrollPaddingEnd,
    rowGap: config.rowGap,
    columnGap: config.columnGap,
    enabled: config.enabled,
    isRtl,
    initialOffset: config.initialOffset,
    initialRowMeasurementsCache: config.initialRowMeasurementsCache,
    initialColumnMeasurementsCache: config.initialColumnMeasurementsCache,
    useWindowScroll: config.useWindowScroll,
    indexAttribute: config.indexAttribute,
    debug: config.debug,
    rowRangeExtractor: stickyCount > 0 ? stickyRangeExtractor(stickyCount) : undefined,
    columnRangeExtractor:
      stickyColLeft > 0 || stickyColRight > 0
        ? pinnedColumnRangeExtractor(stickyColLeft, stickyColRight)
        : undefined,
    getRowKey: config.keyFunction ? stable.getRowKey : undefined,
    getColumnKey: config.keyFunction ? stable.getColumnKey : undefined,
    onChange,
  };
}

function groupCellsByRow(cells: readonly VirtualCell[]): { row: number; cells: VirtualCell[] }[] {
  const map = new Map<number, VirtualCell[]>();
  for (const cell of cells) {
    const rowCells = map.get(cell.row);
    if (rowCells) rowCells.push(cell);
    else map.set(cell.row, [cell]);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([row, rowCells]) => ({ row, cells: rowCells }));
}

class VirtualizeGridDirective extends AsyncDirective {
  private _engine?: GridVirtualizer;
  private _contentHost?: HTMLElement;
  private _scrollRoot?: HTMLElement;
  private _scrollEl: unknown = null;
  private _config?: VirtualizeGridDirectiveConfig;
  private _cells: VirtualCell[] = [];
  private _isRtl = false;
  private _scrollMargin = 0;
  private _indexAttribute = "data-index";
  private _rangeRaf = 0;
  private _rangeKey = "";
  private _contentW = 0;
  private _contentH = 0;
  private _columnMeasureEpoch = -1;
  private _rowMeasureEpoch = -1;
  private _colSizesKey = "";
  private _measureColumns = true;
  private _measureRows = true;
  private _scrollSyncTarget: HTMLElement | null = null;
  private _onScrollSync = (): void => {
    this._syncScrollCssVars();
  };

  /** Stable delegates read the latest _config, so the engine sees one identity across renders. */
  private _stableFns: StableEngineFns = {
    estimateRowSize: (index: number) => this._config?.estimateRowSize?.(index) ?? 0,
    estimateColumnSize: (index: number) => this._config?.estimateColumnSize(index) ?? 0,
    getRowKey: (row: number) => (this._config?.keyFunction?.(row, 0) as string | number) ?? row,
    getColumnKey: (column: number) =>
      (this._config?.keyFunction?.(0, column) as string | number) ?? column,
  };

  /** Stable ref — inline closures re-run measureElement on every Lit commit. */
  private _cellRef = (el: Element | undefined): void => {
    if (!(el instanceof HTMLElement) || !this._engine) return;
    if (this._indexAttribute !== "data-index") {
      const row = el.getAttribute("data-virtual-row");
      if (row) el.setAttribute(this._indexAttribute, row);
    }
    if (this._measureRows) {
      this._engine.rows.measureElement(el);
    }
    if (this._measureColumns) {
      this._engine.columns.measureElement(el);
    }
  };

  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.CHILD) {
      throw new Error("virtualizeGrid() must be used as a child expression");
    }
  }

  override render(config: VirtualizeGridDirectiveConfig): unknown {
    const cellRepeat = (cells: readonly VirtualCell[]) =>
      repeat(
        cells,
        (cell) =>
          config.keyFunction?.(cell.row, cell.column) ?? `${cell.row}:${cell.column}`,
        (cell) => this._renderCell(config, cell),
      );

    const body = config.gridRows
      ? repeat(
          groupCellsByRow(this._cells),
          (group) => group.row,
          (group) => html`
              <div role="row" style="display: contents" data-virtual-row=${group.row}>
                ${cellRepeat(group.cells)}
              </div>
            `,
        )
      : cellRepeat(this._cells);

    return html`
      <div data-virtualize-content style="position:relative" ${ref(this._contentRef)}>
        ${body}
      </div>
    `;
  }

  override update(
    part: ChildPart,
    [config]: [VirtualizeGridDirectiveConfig],
  ): unknown {
    const scrollRoot = part.parentNode;
    if (!(scrollRoot instanceof HTMLElement)) {
      this._publish(config);
      return noChange;
    }

    this._config = config;
    this._measureColumns = config.measureColumns !== false;
    this._measureRows = config.measureRows !== false;
    this._scrollRoot = scrollRoot;
    this._indexAttribute = config.indexAttribute ?? "data-index";

    this._scrollEl = resolveScrollElement(
      scrollRoot,
      config.scroller,
      config.getScrollElement,
      config.useWindowScroll,
    );
    const observeEl = resolveObserveElement(this._scrollEl, config.observeElement) ?? scrollRoot;
    this._isRtl = config.isRtl ?? resolveIsRtl(observeEl, config.isRtl);
    this._scrollMargin = config.scrollMargin ?? 0;

    const dimsChanged =
      this._engine &&
      (this._engine.rows.options.count !== config.rowCount ||
        this._engine.columns.options.count !== config.columnCount);

    if (!this._engine || dimsChanged) {
      this._engine?.unmount();
      this._engine = new GridVirtualizer(
        engineOptions(config, this._scrollEl, scrollRoot, () => this._onGridChange(), this._isRtl, this._stableFns),
      );
      this._columnMeasureEpoch = config.columnMeasureEpoch ?? -1;
      this._rowMeasureEpoch = config.rowMeasureEpoch ?? -1;
      this._engine.mount();
    } else {
      const columnEpoch = config.columnMeasureEpoch ?? -1;
      const rowEpoch = config.rowMeasureEpoch ?? -1;
      const columnEpochChanged = columnEpoch !== this._columnMeasureEpoch;
      const rowEpochChanged = rowEpoch !== this._rowMeasureEpoch;
      if (columnEpochChanged) this._columnMeasureEpoch = columnEpoch;
      if (rowEpochChanged) this._rowMeasureEpoch = rowEpoch;
      this._engine.setOptions(
        engineOptions(config, this._scrollEl, scrollRoot, () => this._onGridChange(), this._isRtl, this._stableFns),
      );
      if (columnEpochChanged) this._engine.columns.measure();
      if (rowEpochChanged) this._engine.rows.measure();
    }

    const colItems = this._engine.columns.getVirtualItems();
    this._cells = this._engine.getVirtualCells();
    this._rangeKey = virtualGridRangeKey(this._engine.rows.getVirtualItems(), colItems);
    this._colSizesKey = colItems.map((item) => `${item.index}:${item.size}`).join(",");
    if (this._contentHost) this._applyLayout(this._contentHost, true);

    this._bindScrollSync();
    this._publish(config);
    return noChange;
  }

  private _bindScrollSync(): void {
    if (!this._hasStickyCells()) {
      this._scrollSyncTarget?.removeEventListener("scroll", this._onScrollSync, true);
      this._scrollSyncTarget = null;
      return;
    }
    const target =
      resolveObserveElement(this._scrollEl, this._config?.observeElement) ??
      this._config?.getScrollElement?.() ??
      (this._scrollEl instanceof HTMLElement ? this._scrollEl : null);
    if (target === this._scrollSyncTarget) return;
    this._scrollSyncTarget?.removeEventListener("scroll", this._onScrollSync, true);
    this._scrollSyncTarget = target;
    target?.addEventListener("scroll", this._onScrollSync, { passive: true, capture: true });
  }

  private _syncScrollCssVars(): void {
    if (!this._contentHost || !this._engine) return;
    this._contentHost.style.setProperty("--vg-dir", this._isRtl ? "-1" : "1");
    const colMargin = this._config?.columnScrollMargin ?? this._scrollMargin;
    const rowMargin = this._config?.rowScrollMargin ?? this._scrollMargin;
    const scrollX = this._liveColumnScrollOffset() - colMargin;
    const scrollY = this._engine.rows.getScrollOffset() - rowMargin;
    this._contentHost.style.setProperty("--vg-scroll-x", `${scrollX}px`);
    this._contentHost.style.setProperty("--vg-scroll-y", `${scrollY}px`);
    const scrollEl =
      this._scrollSyncTarget ??
      resolveObserveElement(this._scrollEl, this._config?.observeElement) ??
      this._config?.getScrollElement?.() ??
      (this._scrollEl instanceof HTMLElement ? this._scrollEl : null);
    if (scrollEl instanceof HTMLElement) {
      const span = Math.max(0, scrollEl.scrollWidth - scrollEl.clientWidth);
      this._contentHost.style.setProperty("--vg-scroll-span", `${span}px`);
      this._contentHost.style.setProperty("--vg-viewport-w", `${scrollEl.clientWidth}px`);
    } else {
      this._contentHost.style.setProperty("--vg-viewport-w", `${this._engine.columns.getSize()}px`);
    }
  }

  /** AsyncDirective owns the ChildPart — never return a template from update(). */
  private _publish(config: VirtualizeGridDirectiveConfig): void {
    this._syncScrollCssVars();
    this.setValue(this.render(config));
  }

  override disconnected(): void {
    if (this._rangeRaf) cancelAnimationFrame(this._rangeRaf);
    this._scrollSyncTarget?.removeEventListener("scroll", this._onScrollSync, true);
    this._scrollSyncTarget = null;
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
    if (this._hasStickyCells()) {
      this._syncScrollCssVars();
    }
  };

  private _onGridChange(): void {
    if (this._hasStickyCells()) {
      this._syncScrollCssVars();
    }
    this._onRangeChanged();
  }

  private _hasStickyCells(): boolean {
    const config = this._config;
    if (!config) return false;
    return (
      (config.stickyRowCount ?? 0) > 0 ||
      (config.stickyColumnLeftCount ?? 0) > 0 ||
      (config.stickyColumnRightCount ?? 0) > 0
    );
  }

  private _stickyColSide(column: number): "left" | "right" | null {
    const config = this._config;
    if (!config || !this._engine) return null;
    const leftCount = config.stickyColumnLeftCount ?? 0;
    const rightCount = config.stickyColumnRightCount ?? 0;
    if (leftCount > 0 && column < leftCount) return "left";
    const rightStart = config.columnCount - rightCount;
    if (rightCount > 0 && column >= rightStart) return "right";
    return null;
  }

  private _stickyColIsEdge(column: number, side: "left" | "right"): boolean {
    const config = this._config;
    if (!config) return false;
    if (side === "left") {
      const leftCount = config.stickyColumnLeftCount ?? 0;
      return leftCount > 0 && column === leftCount - 1;
    }
    const rightCount = config.stickyColumnRightCount ?? 0;
    if (rightCount <= 0) return false;
    return column === config.columnCount - rightCount;
  }

  private _columnSize(column: number): number {
    if (!this._engine || !this._config) return 0;
    return this._engine.columns.getItemSize(column);
  }

  private _liveColumnScrollOffset(): number {
    const target =
      this._scrollSyncTarget ??
      resolveObserveElement(this._scrollEl, this._config?.observeElement) ??
      this._config?.getScrollElement?.() ??
      (this._scrollEl instanceof HTMLElement ? this._scrollEl : null);
    if (target instanceof HTMLElement) {
      return readElementScrollOffset(target, true, this._isRtl);
    }
    return this._engine?.columns.getScrollOffset() ?? 0;
  }

  private _rightStickyTrailingWidth(column: number): number {
    if (!this._engine || !this._config) return 0;
    const rightCount = this._config.stickyColumnRightCount ?? 0;
    const rightStart = this._config.columnCount - rightCount;
    let trailing = 0;
    for (let index = column + 1; index < this._config.columnCount; index++) {
      if (index >= rightStart) trailing += this._columnSize(index);
    }
    return trailing + this._columnSize(column);
  }

  private _onRangeChanged(): void {
    if (this._rangeRaf) return;
    this._rangeRaf = requestAnimationFrame(() => {
      this._rangeRaf = 0;
      this._commitRange();
    });
  }

  private _commitRange(): void {
    if (!this._config || !this._engine) return;

    const rowItems = this._engine.rows.getVirtualItems();
    const colItems = this._engine.columns.getVirtualItems();
    const { width, height } = this._engine.getTotalSize();
    const layoutChanged = width !== this._contentW || height !== this._contentH;
    const key = virtualGridRangeKey(rowItems, colItems);
    const colSizesKey = colItems.map((item) => `${item.index}:${item.size}`).join(",");

    if (
      key !== this._rangeKey ||
      layoutChanged ||
      colSizesKey !== this._colSizesKey
    ) {
      this._rangeKey = key;
      this._colSizesKey = colSizesKey;
      this._cells = this._engine.getVirtualCells();
      this._publish(this._config);
    }

    if (this._contentHost) this._applyLayout(this._contentHost);

    if (this._config.stickyRowCount || this._hasStickyCells()) {
      this._syncScrollCssVars();
    }

    this._config.onRangeChange?.();
  }

  private _applyLayout(host: HTMLElement, force = false): void {
    if (!this._engine) return;
    const { width, height } = this._engine.getTotalSize();
    if (!force && width === this._contentW && height === this._contentH) return;
    this._contentW = width;
    this._contentH = height;
    applyContentSize(host, width, height);
  }

  private _renderCell(
    config: VirtualizeGridDirectiveConfig,
    cell: VirtualCell,
  ): TemplateResult {
    const stickyRowCount = config.stickyRowCount ?? 0;
    const stickyRow = stickyRowCount > 0 && cell.row < stickyRowCount;
    const stickyCol = this._stickyColSide(cell.column);
    const stickyColEdge = stickyCol != null && this._stickyColIsEdge(cell.column, stickyCol);
    const colOffset = this._engine!.columns.getItemOffset(cell.column);
    const rowOffset = this._engine!.rows.getItemOffset(cell.row);
    const needsStickyTransform = stickyRow || stickyCol != null;
    let style: string;
    if (stickyCol === "left") {
      style = virtualStickyLeftSliceStyle({
        colOffset,
        startY: stickyRow ? rowOffset : cell.rowItem.start,
        width: cell.colItem.size,
        height: cell.rowItem.size,
        scrollMargin: this._scrollMargin,
        rowSticky: stickyRow,
        isRtl: this._isRtl,
      });
    } else if (stickyCol === "right") {
      style = virtualStickyRightSliceStyle({
        trailingWidth: this._rightStickyTrailingWidth(cell.column),
        startY: stickyRow ? rowOffset : cell.rowItem.start,
        width: cell.colItem.size,
        height: cell.rowItem.size,
        scrollMargin: this._scrollMargin,
        rowSticky: stickyRow,
        isRtl: this._isRtl,
      });
    } else if (stickyRow) {
      style = virtualStickyRowSliceStyle({
        colStart: cell.colItem.start,
        rowOffset,
        width: cell.colItem.size,
        height: cell.rowItem.size,
        isRtl: this._isRtl,
      });
    } else {
      style = virtualSliceStyle({
        startX: cell.colItem.start,
        startY: cell.rowItem.start,
        width: cell.colItem.size,
        height: cell.rowItem.size,
        scrollMargin: this._scrollMargin,
        isRtl: this._isRtl,
      });
    }

    return html`
      <div
        data-index=${cell.row}
        data-virtual-sticky=${needsStickyTransform ? "" : nothing}
        data-virtual-sticky-row=${stickyRow ? "" : nothing}
        data-virtual-sticky-col=${stickyCol ?? nothing}
        data-virtual-sticky-col-edge=${stickyColEdge ? "" : nothing}
        data-virtual-key=${String(
          config.keyFunction?.(cell.row, cell.column) ?? `${cell.row}:${cell.column}`,
        )}
        data-virtual-row=${cell.row}
        data-virtual-column=${cell.column}
        style=${style}
        ${ref(this._cellRef)}
      >
        ${config.renderCell(cell.row, cell.column)}
      </div>
    `;
  }
}

/** 2D grid virtualizer directive (row × column cross-product). */
export const virtualizeGrid = directive(VirtualizeGridDirective);
