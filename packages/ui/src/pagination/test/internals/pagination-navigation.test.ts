import { describe, expect, it } from "vitest";
import {
  paginationCanActivatePage,
  paginationNextAvailablePage,
} from "../../internals/pagination-navigation.js";

describe("pagination-navigation", () => {
  it("skips disabled pages when moving forward", () => {
    expect(paginationNextAvailablePage(2, 5, [3], 1)).toBe(4);
  });

  it("returns current page when direction is blocked", () => {
    expect(paginationNextAvailablePage(1, 5, [], -1)).toBe(1);
    expect(paginationNextAvailablePage(5, 5, [], 1)).toBe(5);
  });

  it("validates activatable pages", () => {
    expect(paginationCanActivatePage(3, 5, [3])).toBe(false);
    expect(paginationCanActivatePage(4, 5, [3])).toBe(true);
  });
});
