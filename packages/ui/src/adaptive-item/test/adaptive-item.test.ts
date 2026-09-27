/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect, vi } from "vitest";
import { VuAdaptiveItem } from "../adaptive-item.js";
import { VuAdaptiveBar } from "../../adaptive-bar/adaptive-bar.js";
import "../../button/button.js";
import "../../icon/icon.js";
import "../../adaptive-bar/adaptive-bar.js";

const mockRect = (width: number) => ({
  width,
  height: 16,
  top: 0,
  left: 0,
  right: width,
  bottom: 16,
  x: 0,
  y: 0,
  toJSON: () => ({}),
});

describe("vu-adaptive-item", () => {
  it("is defined", () => {
    expect(customElements.get("vu-adaptive-item")).toBe(VuAdaptiveItem);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuAdaptiveItem>(html`<vu-adaptive-item></vu-adaptive-item>`);
    await elementUpdated(el);
    expect(el).toBeTruthy();
    expect(el.size).toBe("md");
    expect(el.disabled).toBe(false);
  });

  it("has item part and default slot", async () => {
    const el = await fixture<VuAdaptiveItem>(
      html`<vu-adaptive-item><vu-button>Action</vu-button></vu-adaptive-item>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part~="item"]')).toBeTruthy();
    expect(el.querySelector("vu-button")?.textContent?.trim()).toBe("Action");
    expect(el.shadowRoot?.querySelector("slot:not([name])")).toBeTruthy();
  });

  it("accepts size and disabled", async () => {
    const el = await fixture<VuAdaptiveItem>(
      html`<vu-adaptive-item size="lg" disabled></vu-adaptive-item>`,
    );
    await elementUpdated(el);
    expect(el.size).toBe("lg");
    expect(el.disabled).toBe(true);
  });

  it("isInOverflow returns boolean", async () => {
    const el = await fixture<VuAdaptiveItem>(html`<vu-adaptive-item></vu-adaptive-item>`);
    await elementUpdated(el);
    expect(typeof el.isInOverflow()).toBe("boolean");
  });

  it("fires vu-resize on connect", async () => {
    const host = document.createElement("div");
    const onSize = vi.fn();
    host.addEventListener("vu-resize", onSize);
    const el = document.createElement("vu-adaptive-item");
    host.append(el);
    document.body.append(host);
    await el.updateComplete;
    await Promise.resolve();
    expect(onSize).toHaveBeenCalled();
    host.remove();
  });

  it("sets inoverflow when moved to overflow slot", async () => {
    const el = await fixture<VuAdaptiveItem>(
      html`<vu-adaptive-item slot="overflow"></vu-adaptive-item>`,
    );
    await elementUpdated(el);
    expect(el.isInOverflow()).toBe(true);
    expect(el.hasAttribute("inoverflow")).toBe(true);
    expect(el.shadowRoot?.querySelector('[part~="in-overflow"]')).toBeTruthy();
  });

  it("getSize returns a DOMRect", async () => {
    const el = await fixture<VuAdaptiveItem>(
      html`<vu-adaptive-item><a href="#">Link</a></vu-adaptive-item>`,
    );
    await elementUpdated(el);
    const rect = el.getSize();
    expect(rect.width).toBeGreaterThanOrEqual(0);
    expect(rect.height).toBeGreaterThanOrEqual(0);
  });

  it("removes listitem role when in overflow", async () => {
    const el = await fixture<VuAdaptiveItem>(html`<vu-adaptive-item></vu-adaptive-item>`);
    await elementUpdated(el);
    expect(el.getAttribute("role")).toBe("listitem");
    el.setAttribute("slot", "overflow");
    await elementUpdated(el);
    expect(el.getAttribute("role")).toBeNull();
    expect(el.isInOverflow()).toBe(true);
  });

  describe("accessibility", () => {
    it("default", async () => {
      const el = await fixture<VuAdaptiveItem>(
        html`<div role="list">
          <vu-adaptive-item><a href="#">Link</a></vu-adaptive-item>
        </div>`,
      );
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("disabled", async () => {
      const el = await fixture<VuAdaptiveItem>(
        html`<div role="list">
          <vu-adaptive-item disabled><a href="#">Link</a></vu-adaptive-item>
        </div>`,
      );
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("in overflow menu", async () => {
      const el = await fixture(html`
        <vu-adaptive-bar style="display:block;width:100px">
          <vu-adaptive-item><a href="#">One</a></vu-adaptive-item>
          <vu-adaptive-item><a href="#">Two</a></vu-adaptive-item>
        </vu-adaptive-bar>
      `);
      await elementUpdated(el);

      const items = Array.from(el.querySelectorAll("vu-adaptive-item"));
      const mainItems = el.shadowRoot?.querySelector(".main-items") as HTMLElement;
      for (const item of items) {
        Object.defineProperty(item, "getBoundingClientRect", {
          configurable: true,
          value: () => mockRect(80),
        });
      }
      Object.defineProperty(mainItems, "clientWidth", {
        configurable: true,
        value: 60,
      });
      (el as VuAdaptiveBar).recalculateLayout();
      await elementUpdated(el);
      (el as VuAdaptiveBar).openMenu();
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });
  });
});
