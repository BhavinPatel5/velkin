/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7 N/A 8 N/A 9 N/A 10 N/A
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuTabItem } from "../tab-item.js";
import { VuTab } from "../../tab/tab.js";
import "../../icon/icon.js";
import "../../tab/tab.js";

describe("vu-tab-item", () => {
  it("is defined", () => {
    expect(customElements.get("vu-tab-item")).toBe(VuTabItem);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuTabItem>(html`<vu-tab-item></vu-tab-item>`);
    await elementUpdated(el);
    expect(el.value).toBe("");
    expect(el.label).toBe("");
    expect(el.icon).toBe("");
    expect(el.disabled).toBe(false);
    expect(el.color).toBe("");
    expect(el.selected).toBe(false);
    expect(el.segmentDisabled).toBe(false);
    expect(el.labelCollapsed).toBe(false);
  });

  it("renders label and icon fallbacks", async () => {
    const el = await fixture<VuTabItem>(
      html`<vu-tab-item value="list" label="List" icon="lucide:list"></vu-tab-item>`,
    );
    await elementUpdated(el);
    expect(el.value).toBe("list");
    expect(el.shadowRoot?.querySelector('[part="label"]')?.textContent?.trim()).toBe("List");
    expect(el.shadowRoot?.querySelector("vu-icon")).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="icon"]')?.hasAttribute("hidden")).toBe(false);
    expect(el.shadowRoot?.querySelector('[part="base"]')).toBeTruthy();
  });

  it("hides the icon wrapper when icon prop and icon slot are empty", async () => {
    const el = await fixture<VuTabItem>(
      html`<vu-tab-item value="list" label="List"></vu-tab-item>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="icon"]')?.hasAttribute("hidden")).toBe(false);
    expect(el.shadowRoot?.querySelector('[part="label"]')?.hasAttribute("hidden")).toBe(false);
  });

  it("focusSegment focuses the inner button", async () => {
    const el = await fixture<VuTabItem>(html`<vu-tab-item value="a" label="A"></vu-tab-item>`);
    await elementUpdated(el);
    el.focusSegment();
    expect(el.shadowRoot?.activeElement?.matches(".btn")).toBe(true);
  });

  it("does not bubble click when disabled", async () => {
    const tab = await fixture<VuTab>(html`
      <vu-tab label="View" .value=${"list"}>
        <vu-tab-item value="list" label="List"></vu-tab-item>
        <vu-tab-item value="grid" label="Grid" disabled></vu-tab-item>
      </vu-tab>
    `);
    await elementUpdated(tab);
    const grid = tab.querySelector('vu-tab-item[value="grid"]') as VuTabItem;
    let fired = false;
    tab.addEventListener("vu-change", () => {
      fired = true;
    });
    grid.shadowRoot?.querySelector<HTMLButtonElement>(".btn")?.click();
    await elementUpdated(tab);
    expect(fired).toBe(false);
    expect(tab.value).toBe("list");
  });

  describe("accessibility", () => {
    it("default with label fallback", async () => {
      const el = await fixture<VuTabItem>(
        html`<vu-tab-item value="a" label="Segment A"></vu-tab-item>`,
      );
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("disabled", async () => {
      const el = await fixture<VuTabItem>(
        html`<vu-tab-item value="a" label="Segment A" disabled></vu-tab-item>`,
      );
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("selected inside vu-tab", async () => {
      const tab = await fixture<VuTab>(html`
        <vu-tab label="View" .value=${"list"}>
          <vu-tab-item value="list" label="List"></vu-tab-item>
          <vu-tab-item value="grid" label="Grid"></vu-tab-item>
        </vu-tab>
      `);
      await elementUpdated(tab);
      await expectA11y(tab).to.be.accessible();
    });
  });
});
