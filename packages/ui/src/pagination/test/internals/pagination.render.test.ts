import { render } from "lit";
import { describe, expect, it, vi } from "vitest";
import { renderPagination, type PaginationRenderHost } from "../../internals/pagination.render.js";
import type { PaginationPageToken } from "../../pagination.types.js";
import "../../../icon/icon.js";
import "../../../spinner/spinner.js";

const noOp = vi.fn();

function createHost(
  overrides: Partial<PaginationRenderHost> & Pick<PaginationRenderHost, "totalPages">,
): PaginationRenderHost {
  const pages: PaginationPageToken[] = overrides._pages ?? [1, 2, 3];
  return {
    totalPages: overrides.totalPages,
    currentPage: 1,
    disabledPages: [],
    loading: false,
    progress: false,
    layout: "bar",
    maxVisiblePages: 5,
    jump: true,
    label: "",
    prevLabel: "",
    nextLabel: "",
    jumpLabel: "",
    jumpGoLabel: "",
    _dropdownOpen: false,
    _jumpInputValue: "",
    _progressPercent: 20,
    _pageNumbers: [1, 2, 3],
    _pages: pages,
    _prevDisabled: true,
    _nextDisabled: false,
    _showJump: overrides.totalPages > 1,
    _dropdownPop: { onToggle: noOp } as PaginationRenderHost["_dropdownPop"],
    _isPageDisabled: () => false,
    _onArrowClick: noOp,
    _onPageClick: noOp,
    _onJumpInput: noOp,
    _onJumpKeydown: noOp,
    _onJumpGo: noOp,
    _toggleDropdown: noOp,
    ...overrides,
  };
}

function mount(host: PaginationRenderHost): HTMLElement {
  const root = document.createElement("div");
  render(renderPagination(host), root);
  return root;
}

describe("renderPagination", () => {
  it("renders bar layout with prev, pages, and next", () => {
    const root = mount(createHost({ totalPages: 3, currentPage: 2, _prevDisabled: false }));
    expect(root.querySelector('[part="bar"]')).not.toBeNull();
    expect(root.querySelector('[part="prev"]')).not.toBeNull();
    expect(root.querySelector('[part="next"]')).not.toBeNull();
    expect(root.querySelector('[part="page"][aria-current="page"]')?.textContent?.trim()).toBe("2");
  });

  it("renders decorative ellipsis and always-visible jump field", () => {
    const root = mount(
      createHost({
        totalPages: 20,
        currentPage: 10,
        _pages: [1, "ellipsis", 10, "ellipsis", 20],
        _showJump: true,
      }),
    );
    const ellipsis = root.querySelector('[part="ellipsis"]');
    expect(ellipsis).not.toBeNull();
    expect(ellipsis?.getAttribute("aria-hidden")).toBe("true");
    expect(root.querySelector('[part="jump"]')).not.toBeNull();
    expect(root.querySelector('[part="jump-input"]')).not.toBeNull();
    expect(root.querySelector('[part="jump-go"]')?.textContent?.trim()).toBeTruthy();
  });

  it("omits jump field when _showJump is false", () => {
    const root = mount(createHost({ totalPages: 5, _showJump: false }));
    expect(root.querySelector('[part="jump"]')).toBeNull();
  });

  it("renders menu layout with trigger and popover menu", () => {
    const root = mount(
      createHost({ totalPages: 8, currentPage: 3, layout: "menu", _dropdownOpen: false }),
    );
    expect(root.querySelector('[part="picker"]')).not.toBeNull();
    expect(root.querySelector('[part="trigger"]')?.textContent?.trim()).toBe("3");
    expect(root.querySelector('[part="menu"]')).not.toBeNull();
    expect(root.querySelector('[part="jump"]')).not.toBeNull();
  });

  it("renders loading overlay and optional progress track", () => {
    const root = mount(
      createHost({ totalPages: 5, loading: true, progress: true, _progressPercent: 40 }),
    );
    expect(root.querySelector('[part="overlay"]')).not.toBeNull();
    expect(root.querySelector("vu-spinner")).not.toBeNull();
    expect(root.querySelector('[part="progress"]')).not.toBeNull();
    expect(root.querySelector('[part="fill"]')?.getAttribute("style")).toContain("40.00%");
  });
});
