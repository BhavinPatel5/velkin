import { Virtualizer } from "./virtualizer.js";
import type {
  GridTotalSize,
  GridVirtualizerOnChangeHost,
  GridVirtualizerOptions,
  VirtualCell,
} from "./virtualizer.types.js";

/** Two 1D virtualizers (rows + columns) sharing one scrollport. */
export class GridVirtualizer {
  readonly rows: Virtualizer;
  readonly columns: Virtualizer;

  private _onChange?: GridVirtualizerOptions["onChange"];

  constructor(options: GridVirtualizerOptions) {
    const notify = (sync: boolean) => {
      this._onChange?.(
        {
          rows: this.rows,
          columns: this.columns,
          getVirtualCells: () => this.getVirtualCells(),
        },
        sync,
      );
    };

    this._onChange = options.onChange;
    const getScrollElement = options.getScrollElement;
    const rowScrollMargin = options.rowScrollMargin ?? options.scrollMargin;
    const columnScrollMargin = options.columnScrollMargin ?? options.scrollMargin;
    const shared = {
      getScrollElement,
      observeElement: options.observeElement,
      paddingStart: options.paddingStart,
      paddingEnd: options.paddingEnd,
      scrollPaddingStart: options.scrollPaddingStart,
      scrollPaddingEnd: options.scrollPaddingEnd,
      enabled: options.enabled,
      isRtl: options.isRtl,
      initialOffset: options.initialOffset,
      useWindowScroll: options.useWindowScroll,
      debug: options.debug,
      laneAssignmentMode: options.laneAssignmentMode,
      shouldAdjustScrollPositionOnItemSizeChange:
        options.shouldAdjustScrollPositionOnItemSizeChange,
      onChange: (_: Virtualizer, sync: boolean) => notify(sync),
    };

    this.rows = new Virtualizer({
      ...shared,
      scrollMargin: rowScrollMargin,
      count: options.rowCount,
      estimateSize: options.estimateRowSize,
      overscan: options.rowOverscan,
      horizontal: false,
      gap: options.rowGap ?? options.gap,
      initialMeasurementsCache: options.initialRowMeasurementsCache,
      getItemKey: options.getRowKey,
      rangeExtractor: options.rowRangeExtractor,
      indexAttribute: options.rowIndexAttribute ?? "data-virtual-row",
    });

    this.columns = new Virtualizer({
      ...shared,
      scrollMargin: columnScrollMargin,
      count: options.columnCount,
      estimateSize: options.estimateColumnSize,
      overscan: options.columnOverscan,
      horizontal: true,
      gap: options.columnGap ?? options.gap,
      initialMeasurementsCache: options.initialColumnMeasurementsCache,
      getItemKey: options.getColumnKey,
      rangeExtractor: options.columnRangeExtractor,
      indexAttribute: options.columnIndexAttribute ?? "data-virtual-column",
    });
  }

  setOptions(partial: Partial<GridVirtualizerOptions>): void {
    if (partial.onChange !== undefined) this._onChange = partial.onChange;

    this.rows.setOptions({
      count: partial.rowCount,
      estimateSize: partial.estimateRowSize,
      overscan: partial.rowOverscan,
      paddingStart: partial.paddingStart,
      paddingEnd: partial.paddingEnd,
      scrollMargin: partial.rowScrollMargin ?? partial.scrollMargin,
      scrollPaddingStart: partial.scrollPaddingStart,
      scrollPaddingEnd: partial.scrollPaddingEnd,
      gap: partial.rowGap ?? partial.gap,
      enabled: partial.enabled,
      isRtl: partial.isRtl,
      initialOffset: partial.initialOffset,
      getScrollElement: partial.getScrollElement,
      observeElement: partial.observeElement,
      useWindowScroll: partial.useWindowScroll,
      initialMeasurementsCache: partial.initialRowMeasurementsCache,
      getItemKey: partial.getRowKey,
      rangeExtractor: partial.rowRangeExtractor,
      indexAttribute: partial.rowIndexAttribute,
      debug: partial.debug,
      laneAssignmentMode: partial.laneAssignmentMode,
      shouldAdjustScrollPositionOnItemSizeChange:
        partial.shouldAdjustScrollPositionOnItemSizeChange,
    });

    this.columns.setOptions({
      count: partial.columnCount,
      estimateSize: partial.estimateColumnSize,
      overscan: partial.columnOverscan,
      paddingStart: partial.paddingStart,
      paddingEnd: partial.paddingEnd,
      scrollMargin: partial.columnScrollMargin ?? partial.scrollMargin,
      scrollPaddingStart: partial.scrollPaddingStart,
      scrollPaddingEnd: partial.scrollPaddingEnd,
      gap: partial.columnGap ?? partial.gap,
      enabled: partial.enabled,
      isRtl: partial.isRtl,
      getScrollElement: partial.getScrollElement,
      observeElement: partial.observeElement,
      useWindowScroll: partial.useWindowScroll,
      initialMeasurementsCache: partial.initialColumnMeasurementsCache,
      getItemKey: partial.getColumnKey,
      rangeExtractor: partial.columnRangeExtractor,
      indexAttribute: partial.columnIndexAttribute,
      debug: partial.debug,
      laneAssignmentMode: partial.laneAssignmentMode,
      shouldAdjustScrollPositionOnItemSizeChange:
        partial.shouldAdjustScrollPositionOnItemSizeChange,
    });
  }

  getTotalSize(): GridTotalSize {
    return {
      width: this.columns.getTotalSize(),
      height: this.rows.getTotalSize(),
    };
  }

  getVirtualCells(): VirtualCell[] {
    const rowItems = this.rows.getVirtualItems();
    const colItems = this.columns.getVirtualItems();
    const cells: VirtualCell[] = [];

    for (const rowItem of rowItems) {
      for (const colItem of colItems) {
        cells.push({
          row: rowItem.index,
          column: colItem.index,
          rowItem,
          colItem,
        });
      }
    }

    return cells;
  }

  scrollToCell(
    row: number,
    column: number,
    options?: { behavior?: ScrollBehavior; align?: "start" | "center" | "end" | "auto" },
  ): void {
    this.rows.scrollToIndex(row, options);
    this.columns.scrollToIndex(column, options);
  }

  mount(): void {
    this.rows.mount();
    this.columns.mount();
  }

  unmount(): void {
    this.rows.unmount();
    this.columns.unmount();
  }

  notify(): void {
    this.rows.notify();
    this.columns.notify();
  }
}

export type { GridVirtualizerOnChangeHost };
