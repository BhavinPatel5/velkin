import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Virtualizer } from "./virtualizer.js";

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

describe("Virtualizer", () => {
  let scrollEl: HTMLDivElement;

  beforeEach(() => {
    scrollEl = createScrollport({ width: 200, height: 100 });
  });

  afterEach(() => {
    scrollEl.remove();
  });

  it("returns total size from estimates", () => {
    const v = new Virtualizer({
      count: 10,
      getScrollElement: () => scrollEl,
      estimateSize: () => 50,
    });
    expect(v.getTotalSize()).toBe(500);
  });

  it("returns only visible items for scroll offset", () => {
    scrollEl.scrollTop = 120;
    const v = new Virtualizer({
      count: 20,
      getScrollElement: () => scrollEl,
      estimateSize: () => 50,
      overscan: 0,
    });

    const items = v.getVirtualItems();
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]!.index).toBe(2);
    expect(items.every((item) => item.end > 120 && item.start < 220)).toBe(true);
  });

  it("invalidates cache when viewport size changes at same scroll offset", () => {
    Object.defineProperty(scrollEl, "clientHeight", { configurable: true, value: 0 });
    const v = new Virtualizer({
      count: 50,
      getScrollElement: () => scrollEl,
      estimateSize: () => 40,
      overscan: 1,
    });
    v.mount();

    const atZero = v.getVirtualItems().length;

    Object.defineProperty(scrollEl, "clientHeight", { configurable: true, value: 100 });
    v.notify();

    expect(v.getVirtualItems().length).toBeGreaterThan(atZero);
  });

  it("getVirtualItems on 50k avoids O(n) work per call", () => {
    const v = new Virtualizer({
      count: 50_000,
      getScrollElement: () => scrollEl,
      estimateSize: () => 40,
      overscan: 4,
    });
    v.mount();
    v.getVirtualItems();

    const t0 = performance.now();
    for (let i = 0; i < 200; i++) {
      scrollEl.scrollTop = (i % 50) * 8;
      v.getVirtualItems();
    }
    const elapsed = performance.now() - t0;

    expect(elapsed).toBeLessThan(250);
  });

  it("layouts 50k uniform items without a count-length cache", () => {
    const started = performance.now();
    const v = new Virtualizer({
      count: 50_000,
      getScrollElement: () => scrollEl,
      estimateSize: () => 40,
      overscan: 2,
    });
    v.mount();
    const elapsed = performance.now() - started;

    expect(elapsed).toBeLessThan(50);
    expect(v.getTotalSize()).toBe(50_000 * 40);
    expect(v.getItemOffset(49_999)).toBe(49_999 * 40);
    expect(v.getItemSize(12)).toBe(40);
    expect(v.getVirtualItems().length).toBeLessThan(20);
    expect(v.measurementsCache).toHaveLength(0);
  });

  it("keeps arithmetic layout after a leading size prefix", () => {
    const v = new Virtualizer({
      count: 50_000,
      getScrollElement: () => scrollEl,
      estimateSize: (index) => (index === 0 ? 48 : 96),
      horizontal: true,
      overscan: 2,
    });
    v.mount();

    expect(v.getItemOffset(0)).toBe(0);
    expect(v.getItemOffset(1)).toBe(48);
    expect(v.getItemOffset(2)).toBe(144);
    expect(v.getTotalSize()).toBe(48 + 49_999 * 96);
    expect(v.getVirtualItems().length).toBeLessThan(20);
    expect(v.measurementsCache).toHaveLength(0);
  });

  it("does not treat a content-sized scrollport as the viewport", () => {
    Object.defineProperty(scrollEl, "clientWidth", { configurable: true, value: 50_000 * 96 });
    Object.defineProperty(scrollEl, "clientHeight", { configurable: true, value: 100 });
    const v = new Virtualizer({
      count: 50_000,
      getScrollElement: () => scrollEl,
      estimateSize: () => 96,
      horizontal: true,
      overscan: 2,
    });
    v.mount();

    expect(v.getTotalSize()).toBe(50_000 * 96);
    expect(v.getVirtualItems().length).toBeLessThan(100);
  });

  it("includes overscan rows", () => {
    scrollEl.scrollTop = 100;
    const tight = new Virtualizer({
      count: 20,
      getScrollElement: () => scrollEl,
      estimateSize: () => 50,
      overscan: 0,
    });
    const loose = new Virtualizer({
      count: 20,
      getScrollElement: () => scrollEl,
      estimateSize: () => 50,
      overscan: 2,
    });

    expect(loose.getVirtualItems().length).toBeGreaterThan(tight.getVirtualItems().length);
  });

  it("supports horizontal axis", () => {
    scrollEl.scrollLeft = 150;
    const v = new Virtualizer({
      count: 20,
      getScrollElement: () => scrollEl,
      estimateSize: () => 50,
      horizontal: true,
      overscan: 0,
    });

    const items = v.getVirtualItems();
    expect(items[0]!.index).toBe(3);
  });

  it("uses measured sizes when provided", () => {
    const v = new Virtualizer({
      count: 3,
      getScrollElement: () => scrollEl,
      estimateSize: () => 50,
    });

    const el0 = document.createElement("div");
    el0.setAttribute("data-index", "0");
    Object.defineProperty(el0, "offsetHeight", { value: 80 });
    v.measureElement(el0);

    expect(v.getTotalSize()).toBe(180);
    const items = v.getVirtualItems();
    expect(items[0]!.size).toBe(80);
  });

  it("measures newly mounted items while scrolling", () => {
    const v = new Virtualizer({
      count: 8,
      getScrollElement: () => scrollEl,
      estimateSize: () => 40,
    });
    v.mount();
    v.isScrolling = true;

    const el0 = document.createElement("div");
    el0.setAttribute("data-index", "0");
    Object.defineProperty(el0, "offsetHeight", { value: 90 });
    v.measureElement(el0);

    expect(v.getMeasurements()[0]!.size).toBe(90);
    expect(v.getMeasurements()[1]!.start).toBe(90);
  });

  it("scrollToIndex aligns to start", () => {
    scrollEl.scrollTop = 0;
    const v = new Virtualizer({
      count: 20,
      getScrollElement: () => scrollEl,
      estimateSize: () => 50,
    });
    v.mount();

    v.scrollToIndex(5, { align: "start" });
    expect(scrollEl.scrollTop).toBe(250);
  });

  it("scrollToOffset and scrollBy move the scrollport", () => {
    const v = new Virtualizer({
      count: 20,
      getScrollElement: () => scrollEl,
      estimateSize: () => 50,
    });
    v.mount();

    v.scrollToOffset(100);
    expect(scrollEl.scrollTop).toBe(100);

    v.scrollBy(50);
    expect(scrollEl.scrollTop).toBe(150);
  });

  it("getVirtualIndexes mirrors visible item indexes", () => {
    scrollEl.scrollTop = 100;
    const v = new Virtualizer({
      count: 20,
      getScrollElement: () => scrollEl,
      estimateSize: () => 50,
      overscan: 0,
    });

    expect(v.getVirtualIndexes()[0]).toBe(2);
  });

  it("takeSnapshot restores measured sizes", () => {
    const v = new Virtualizer({
      count: 3,
      getScrollElement: () => scrollEl,
      estimateSize: () => 50,
    });

    const el0 = document.createElement("div");
    el0.setAttribute("data-index", "0");
    Object.defineProperty(el0, "offsetHeight", { value: 80 });
    v.measureElement(el0);

    const snapshot = v.takeSnapshot();
    const restored = new Virtualizer({
      count: 3,
      getScrollElement: () => scrollEl,
      estimateSize: () => 50,
      initialMeasurementsCache: snapshot,
    });

    expect(restored.getTotalSize()).toBe(180);
  });

  it("supports multi-lane masonry layout", () => {
    const v = new Virtualizer({
      count: 6,
      getScrollElement: () => scrollEl,
      estimateSize: () => 40,
      lanes: 2,
      overscan: 0,
    });

    const items = v.getVirtualItems();
    expect(items.some((item) => item.lane === 0)).toBe(true);
    expect(items.some((item) => item.lane === 1)).toBe(true);
  });

  it("exposes scroll helpers", () => {
    scrollEl.scrollTop = 100;
    const v = new Virtualizer({
      count: 20,
      getScrollElement: () => scrollEl,
      estimateSize: () => 50,
    });
    v.mount();

    expect(v.getScrollOffset()).toBe(100);
    expect(v.getSize()).toBe(100);
    expect(v.getVirtualItemForOffset(100)?.index).toBe(2);
    expect(v.getOffsetForIndex(5, "start")?.[0]).toBe(250);
  });

  it("adjusts scroll when above-viewport item resizes", () => {
    scrollEl.scrollTop = 200;
    const v = new Virtualizer({
      count: 10,
      getScrollElement: () => scrollEl,
      estimateSize: () => 50,
    });
    v.mount();
    v.isScrolling = false;

    v.resizeItem(0, 100);

    expect(scrollEl.scrollTop).toBeGreaterThan(200);
  });
});
