import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createWindowVirtualizer } from "./window-virtualizer.js";

describe("createWindowVirtualizer", () => {
  let scrollY = 0;

  beforeEach(() => {
    scrollY = 0;
    Object.defineProperty(document.documentElement, "clientHeight", {
      configurable: true,
      value: 800,
    });
    vi.spyOn(window, "scrollY", "get").mockImplementation(() => scrollY);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns visible items for document scroll offset", () => {
    scrollY = 200;

    const v = createWindowVirtualizer({
      count: 100,
      estimateSize: () => 50,
      overscan: 0,
    });
    v.mount();

    const items = v.getVirtualItems();
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]!.index).toBe(4);
  });
});
