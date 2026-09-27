import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { GridVirtualizer } from "./grid-virtualizer.js";

function createScrollport(size: { width: number; height: number }) {
  const el = document.createElement("div");
  el.style.width = `${size.width}px`;
  el.style.height = `${size.height}px`;
  el.style.overflow = "auto";
  document.body.appendChild(el);
  Object.defineProperty(el, "clientWidth", { configurable: true, value: size.width });
  Object.defineProperty(el, "clientHeight", { configurable: true, value: size.height });
  return el;
}

describe("GridVirtualizer", () => {
  let scrollEl: HTMLDivElement;

  beforeEach(() => {
    scrollEl = createScrollport({ width: 200, height: 100 });
  });

  afterEach(() => {
    scrollEl.remove();
  });

  it("returns total width and height", () => {
    const grid = new GridVirtualizer({
      rowCount: 10,
      columnCount: 5,
      getScrollElement: () => scrollEl,
      estimateRowSize: () => 40,
      estimateColumnSize: () => 80,
    });

    expect(grid.getTotalSize()).toEqual({ width: 400, height: 400 });
  });

  it("virtualizes 50k rows to a small visible slice", () => {
    const grid = new GridVirtualizer({
      rowCount: 50_000,
      columnCount: 6,
      getScrollElement: () => scrollEl,
      estimateRowSize: () => 40,
      estimateColumnSize: () => 120,
      rowOverscan: 4,
      columnOverscan: 2,
    });
    grid.mount();

    const rowCount = grid.rows.getVirtualItems().length;
    const colCount = grid.columns.getVirtualItems().length;
    const cells = grid.getVirtualCells();

    expect(rowCount).toBeLessThan(100);
    expect(colCount).toBeLessThanOrEqual(6);
    expect(cells.length).toBe(rowCount * colCount);
    expect(cells.length).toBeLessThan(600);
  });

  it("virtualizes 50k x 50k to a small visible slice", () => {
    const grid = new GridVirtualizer({
      rowCount: 50_000,
      columnCount: 50_000,
      getScrollElement: () => scrollEl,
      estimateRowSize: () => 40,
      estimateColumnSize: () => 96,
      rowOverscan: 4,
      columnOverscan: 2,
    });
    grid.mount();

    const rowCount = grid.rows.getVirtualItems().length;
    const colCount = grid.columns.getVirtualItems().length;
    const cells = grid.getVirtualCells();

    expect(rowCount).toBeLessThan(100);
    expect(colCount).toBeLessThan(100);
    expect(cells.length).toBe(rowCount * colCount);
    expect(cells.length).toBeLessThan(600);
    expect(grid.getTotalSize()).toEqual({ width: 50_000 * 96, height: 50_000 * 40 });
    expect(grid.rows.measurementsCache).toHaveLength(0);
    expect(grid.columns.measurementsCache).toHaveLength(0);
  });

  it("covers initial viewport rows and columns before scroll", () => {
    const grid = new GridVirtualizer({
      rowCount: 100,
      columnCount: 100,
      getScrollElement: () => scrollEl,
      estimateRowSize: () => 40,
      estimateColumnSize: () => 80,
      rowOverscan: 2,
      columnOverscan: 1,
    });
    grid.mount();

    Object.defineProperty(scrollEl, "clientHeight", { configurable: true, value: 0 });
    Object.defineProperty(scrollEl, "clientWidth", { configurable: true, value: 0 });
    grid.rows.getVirtualItems();
    grid.columns.getVirtualItems();

    Object.defineProperty(scrollEl, "clientHeight", { configurable: true, value: 100 });
    Object.defineProperty(scrollEl, "clientWidth", { configurable: true, value: 200 });
    grid.notify();

    const rows = grid.rows.getVirtualItems();
    const cols = grid.columns.getVirtualItems();
    const lastRow = rows[rows.length - 1]!;
    const lastCol = cols[cols.length - 1]!;

    expect(lastRow.end).toBeGreaterThan(80);
    expect(lastCol.end).toBeGreaterThan(160);
  });

  it("notifies once per vertical scroll when column axis is unchanged", () => {
    let notifies = 0;
    const grid = new GridVirtualizer({
      rowCount: 100,
      columnCount: 100,
      getScrollElement: () => scrollEl,
      estimateRowSize: () => 40,
      estimateColumnSize: () => 80,
      onChange: () => {
        notifies++;
      },
    });
    grid.mount();
    notifies = 0;

    scrollEl.scrollTop = 40;
    scrollEl.dispatchEvent(new Event("scroll"));

    expect(notifies).toBe(1);
  });

  it("clears cached column sizes on measure() and uses new estimates", () => {
    const grid = new GridVirtualizer({
      rowCount: 1,
      columnCount: 2,
      getScrollElement: () => scrollEl,
      estimateRowSize: () => 40,
      estimateColumnSize: (index) => (index === 0 ? 100 : 120),
    });
    grid.mount();

    grid.columns.resizeItem(0, 80);

    grid.columns.setOptions({
      estimateSize: (index) => (index === 0 ? 200 : 120),
    });
    grid.columns.measure();

    expect(grid.columns.getMeasurements()[0]!.size).toBe(200);
  });

  it("returns cross-product of visible rows and columns", () => {
    scrollEl.scrollTop = 80;
    scrollEl.scrollLeft = 160;

    const grid = new GridVirtualizer({
      rowCount: 50,
      columnCount: 50,
      getScrollElement: () => scrollEl,
      estimateRowSize: () => 40,
      estimateColumnSize: () => 80,
      rowOverscan: 0,
      columnOverscan: 0,
    });
    grid.mount();

    const cells = grid.getVirtualCells();
    expect(cells.length).toBeGreaterThan(0);
    expect(cells.length).toBe(
      grid.rows.getVirtualItems().length * grid.columns.getVirtualItems().length,
    );

    for (const cell of cells) {
      expect(cell.rowItem.size).toBe(40);
      expect(cell.colItem.size).toBe(80);
    }
  });
});
