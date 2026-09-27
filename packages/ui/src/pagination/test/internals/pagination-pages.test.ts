import { describe, expect, it } from "vitest";
import { buildPaginationPages } from "../../internals/pagination-pages.js";

describe("buildPaginationPages", () => {
  it("returns every page when total fits the window", () => {
    expect(buildPaginationPages(4, 2, 5)).toEqual([1, 2, 3, 4]);
  });

  it("collapses distant pages with ellipsis tokens", () => {
    expect(buildPaginationPages(20, 10, 5)).toEqual([1, "ellipsis", 9, 10, 11, "ellipsis", 20]);
  });

  it("falls back to a compact window when the range grows too large", () => {
    expect(buildPaginationPages(50, 25, 3)).toEqual([1, "ellipsis", 25, "ellipsis", 50]);
  });
});
