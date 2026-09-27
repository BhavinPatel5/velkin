/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3 N/A 4✓ 5✓ 6✓ 7 N/A 8✓ 9 N/A 10 N/A
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect, vi } from "vitest";
import { VuPagination } from "../pagination.js";
import "../../icon/icon.js";
import "../../spinner/spinner.js";

describe("vu-pagination", () => {
  it("is defined", () => {
    expect(customElements.get("vu-pagination")).toBe(VuPagination);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuPagination>(html`<vu-pagination></vu-pagination>`);
    await elementUpdated(el);
    expect(el.totalPages).toBe(5);
    expect(el.currentPage).toBe(1);
    expect(el.disabledPages).toEqual([]);
    expect(el.loading).toBe(false);
    expect(el.progress).toBe(false);
    expect(el.layout).toBe("bar");
    expect(el.size).toBe("md");
    expect(el.maxVisiblePages).toBe(5);
    expect(el.jump).toBe(false);
    expect(el.label).toBe("");
    expect(el.prevLabel).toBe("");
    expect(el.nextLabel).toBe("");
    expect(el.jumpLabel).toBe("");
    expect(el.jumpGoLabel).toBe("");
  });

  it("reflects loading, layout, and size", async () => {
    const el = await fixture<VuPagination>(
      html`<vu-pagination loading layout="menu" size="sm"></vu-pagination>`,
    );
    await elementUpdated(el);
    expect(el.hasAttribute("loading")).toBe(true);
    expect(el.getAttribute("layout")).toBe("menu");
    expect(el.getAttribute("size")).toBe("sm");
  });

  it("renders bar layout controls by default", async () => {
    const el = await fixture<VuPagination>(
      html`<vu-pagination .totalPages=${5} .currentPage=${2}></vu-pagination>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="bar"]')).not.toBeNull();
    expect(el.shadowRoot?.querySelectorAll('[part="page"]').length).toBeGreaterThan(0);
    expect(
      el.shadowRoot?.querySelector('[part="page"][aria-current="page"]')?.textContent?.trim(),
    ).toBe("2");
  });

  it("renders menu layout with page picker", async () => {
    const el = await fixture<VuPagination>(
      html`<vu-pagination layout="menu" .totalPages=${8} .currentPage=${3}></vu-pagination>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="picker"]')).not.toBeNull();
    expect(el.shadowRoot?.querySelector('[part="trigger"]')?.textContent?.trim()).toBe("3");
  });

  it("shows overlay spinner while loading", async () => {
    const el = await fixture<VuPagination>(html`<vu-pagination loading></vu-pagination>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="overlay"]')).not.toBeNull();
    expect(el.shadowRoot?.querySelector("vu-spinner")).not.toBeNull();
  });

  it("renders optional progress track", async () => {
    const el = await fixture<VuPagination>(
      html`<vu-pagination progress .totalPages=${10} .currentPage=${5}></vu-pagination>`,
    );
    await elementUpdated(el);
    const fill = el.shadowRoot?.querySelector('[part="fill"]') as HTMLElement | null;
    expect(fill).not.toBeNull();
    expect(fill?.getAttribute("style")).toContain("50.00%");
  });

  it("emits vu-change when a page button is clicked", async () => {
    const el = await fixture<VuPagination>(
      html`<vu-pagination .totalPages=${5} .currentPage=${1}></vu-pagination>`,
    );
    await elementUpdated(el);
    const handler = vi.fn();
    el.addEventListener("vu-change", handler);
    const pageTwo = Array.from(
      el.shadowRoot?.querySelectorAll<HTMLButtonElement>('[part="page"]') ?? [],
    ).find((button) => button.textContent?.trim() === "2");
    pageTwo?.click();
    await elementUpdated(el);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { currentPage: 2 },
        bubbles: true,
        composed: true,
      }),
    );
    expect(el.currentPage).toBe(2);
  });

  it("does not activate disabled pages", async () => {
    const el = await fixture<VuPagination>(
      html`<vu-pagination .totalPages=${5} .currentPage=${1} .disabledPages=${[2]}></vu-pagination>`,
    );
    await elementUpdated(el);
    const handler = vi.fn();
    el.addEventListener("vu-change", handler);
    const disabled = el.shadowRoot?.querySelector<HTMLButtonElement>('[part="page"]:disabled');
    expect(disabled).not.toBeNull();
    disabled?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await elementUpdated(el);
    expect(handler).not.toHaveBeenCalled();
    expect(el.currentPage).toBe(1);
  });

  it("nextPage, prevPage, and setPage navigate enabled pages", async () => {
    const el = await fixture<VuPagination>(
      html`<vu-pagination .totalPages=${5} .currentPage=${2} .disabledPages=${[3]}></vu-pagination>`,
    );
    await elementUpdated(el);
    el.nextPage();
    await elementUpdated(el);
    expect(el.currentPage).toBe(4);
    el.prevPage();
    await elementUpdated(el);
    expect(el.currentPage).toBe(2);
    el.setPage(5);
    await elementUpdated(el);
    expect(el.currentPage).toBe(5);
  });

  it("arrow controls skip disabled pages", async () => {
    const el = await fixture<VuPagination>(
      html`<vu-pagination .totalPages=${5} .currentPage=${2} .disabledPages=${[3]}></vu-pagination>`,
    );
    await elementUpdated(el);
    const next = el.shadowRoot?.querySelector<HTMLButtonElement>('[part="next"]');
    next?.click();
    await elementUpdated(el);
    expect(el.currentPage).toBe(4);
  });

  it("shows jump field when jump is true and totalPages > 1", async () => {
    const el = await fixture<VuPagination>(
      html`<vu-pagination jump .totalPages=${10} .currentPage=${3}></vu-pagination>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="jump"]')).not.toBeNull();
    expect(el.shadowRoot?.querySelector('[part="jump-input"]')).not.toBeNull();
    expect(el.shadowRoot?.querySelector('[part="jump-go"]')).not.toBeNull();
    expect(el.shadowRoot?.querySelector('[part="ellipsis"]')?.getAttribute("aria-hidden")).toBe(
      "true",
    );
  });

  it("hides jump field by default, when totalPages is 1, or when jump is false", async () => {
    const el = await fixture<VuPagination>(
      html`<vu-pagination .totalPages=${10} .currentPage=${3}></vu-pagination>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="jump"]')).toBeNull();

    const single = await fixture<VuPagination>(
      html`<vu-pagination jump .totalPages=${1} .currentPage=${1}></vu-pagination>`,
    );
    await elementUpdated(single);
    expect(single.shadowRoot?.querySelector('[part="jump"]')).toBeNull();

    const hidden = await fixture<VuPagination>(
      html`<vu-pagination .totalPages=${5} .currentPage=${1}></vu-pagination>`,
    );
    hidden.jump = false;
    await elementUpdated(hidden);
    expect(hidden.shadowRoot?.querySelector('[part="jump"]')).toBeNull();
  });

  it("commits jump on Enter or Go", async () => {
    const el = await fixture<VuPagination>(
      html`<vu-pagination jump .totalPages=${10} .currentPage=${1}></vu-pagination>`,
    );
    await elementUpdated(el);
    const handler = vi.fn();
    el.addEventListener("vu-change", handler);

    const input = el.shadowRoot?.querySelector<HTMLInputElement>('[part="jump-input"]');
    input!.value = "7";
    input!.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await elementUpdated(el);
    input!.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await elementUpdated(el);
    expect(el.currentPage).toBe(7);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { currentPage: 7 } }),
    );
    expect(input!.value).toBe("");

    input!.value = "9";
    input!.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await elementUpdated(el);
    el.shadowRoot?.querySelector<HTMLButtonElement>('[part="jump-go"]')?.click();
    await elementUpdated(el);
    expect(el.currentPage).toBe(9);
  });

  it("does not jump to disabled or invalid pages", async () => {
    const el = await fixture<VuPagination>(
      html`<vu-pagination jump .totalPages=${5} .currentPage=${1} .disabledPages=${[4]}></vu-pagination>`,
    );
    await elementUpdated(el);
    const handler = vi.fn();
    el.addEventListener("vu-change", handler);
    const input = el.shadowRoot?.querySelector<HTMLInputElement>('[part="jump-input"]');

    input!.value = "4";
    input!.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await elementUpdated(el);
    el.shadowRoot?.querySelector<HTMLButtonElement>('[part="jump-go"]')?.click();
    await elementUpdated(el);
    expect(handler).not.toHaveBeenCalled();
    expect(el.currentPage).toBe(1);

    input!.value = "99";
    input!.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await elementUpdated(el);
    el.shadowRoot?.querySelector<HTMLButtonElement>('[part="jump-go"]')?.click();
    await elementUpdated(el);
    expect(handler).not.toHaveBeenCalled();
    expect(el.currentPage).toBe(1);
  });

  it("blocks interaction while loading", async () => {
    const el = await fixture<VuPagination>(
      html`<vu-pagination loading .totalPages=${5} .currentPage=${1}></vu-pagination>`,
    );
    await elementUpdated(el);
    const handler = vi.fn();
    el.addEventListener("vu-change", handler);
    el.nextPage();
    await elementUpdated(el);
    expect(handler).not.toHaveBeenCalled();
    expect(el.currentPage).toBe(1);
  });

  describe("accessibility", () => {
    it("default bar layout", async () => {
      const el = await fixture<VuPagination>(
        html`<vu-pagination .totalPages=${5} .currentPage=${2}></vu-pagination>`,
      );
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("menu layout", async () => {
      const el = await fixture<VuPagination>(
        html`<vu-pagination layout="menu" .totalPages=${8} .currentPage=${3}></vu-pagination>`,
      );
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("loading overlay", async () => {
      const el = await fixture<VuPagination>(
        html`<vu-pagination loading .totalPages=${5} .currentPage=${2}></vu-pagination>`,
      );
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("jump field with many pages", async () => {
      const el = await fixture<VuPagination>(
        html`<vu-pagination jump .totalPages=${30} .currentPage=${12}></vu-pagination>`,
      );
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("default in RTL document context", async () => {
      const wrap = await fixture(html`
        <div dir="rtl" lang="en">
          <vu-pagination .totalPages=${8} .currentPage=${3}></vu-pagination>
        </div>
      `);
      await elementUpdated(wrap);
      const el = wrap.querySelector("vu-pagination") as VuPagination;
      await expectA11y(el).to.be.accessible();
    });
  });
});
