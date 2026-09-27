/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7 N/A 8 N/A 9 N/A 10 N/A
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuStepItem } from "../step-item.js";
import { VuSteps } from "../../steps/steps.js";
import "../../icon/icon.js";
import "../../steps/steps.js";

describe("vu-step-item", () => {
  it("is defined", () => {
    expect(customElements.get("vu-step-item")).toBe(VuStepItem);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuStepItem>(html`<vu-step-item></vu-step-item>`);
    await elementUpdated(el);
    expect(el.label).toBe("");
    expect(el.subtitle).toBe("");
    expect(el.disabled).toBe(false);
    expect(el.optional).toBe(false);
    expect(el.icon).toBe("");
    expect(el.checkedIcon).toBe("");
  });

  it("renders label and node parts", async () => {
    const el = await fixture<VuStepItem>(
      html`<vu-step-item label="Account" subtitle="Sign in"></vu-step-item>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="base"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="node"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector(".label")?.textContent?.trim()).toBe("Account");
  });

  it("focusStep focuses the header button", async () => {
    const el = await fixture<VuStepItem>(html`<vu-step-item label="Account"></vu-step-item>`);
    await elementUpdated(el);
    el.focusStep();
    expect(el.shadowRoot?.activeElement?.matches(".step-btn")).toBe(true);
  });

  describe("inside vu-steps", () => {
    it("renders horizontal connector when not last", async () => {
      const el = await fixture<VuSteps>(html`
        <vu-steps currentstep="1">
          <vu-step-item label="One"></vu-step-item>
          <vu-step-item label="Two"></vu-step-item>
        </vu-steps>
      `);
      await elementUpdated(el);
      const items = el.querySelectorAll("vu-step-item");
      expect(items[0]?.shadowRoot?.querySelector(".connector")).toBeTruthy();
      expect(items[1]?.shadowRoot?.querySelector(".connector")).toBeNull();
    });

    it("opens vertical panel when current", async () => {
      const el = await fixture<VuSteps>(html`
        <vu-steps layout="vertical" currentstep="1">
          <vu-step-item label="One"><p>Panel</p></vu-step-item>
        </vu-steps>
      `);
      await elementUpdated(el);
      const item = el.querySelector("vu-step-item");
      expect(item?.shadowRoot?.querySelector(".v-panel.is-open")).toBeTruthy();
    });

    it("marks optional steps in the label stack", async () => {
      const el = await fixture<VuSteps>(html`
        <vu-steps layout="vertical" currentstep="1">
          <vu-step-item label="Extras" optional>Body</vu-step-item>
        </vu-steps>
      `);
      await elementUpdated(el);
      const item = el.querySelector("vu-step-item");
      expect(item?.shadowRoot?.querySelector(".optional")?.textContent?.trim()).toBe("Optional");
    });
  });

  describe("accessibility", () => {
    it("default with label inside vu-steps", async () => {
      const el = await fixture<VuSteps>(html`
        <vu-steps layout="vertical" currentstep="1">
          <vu-step-item label="Account">Body</vu-step-item>
        </vu-steps>
      `);
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("disabled step inside vu-steps", async () => {
      const el = await fixture<VuSteps>(html`
        <vu-steps layout="vertical" currentstep="1">
          <vu-step-item label="Account" disabled>Body</vu-step-item>
        </vu-steps>
      `);
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("default in RTL document context", async () => {
      const wrap = await fixture(html`
        <div dir="rtl" lang="en">
          <vu-steps layout="vertical" currentstep="1">
            <vu-step-item label="Account">Body</vu-step-item>
          </vu-steps>
        </div>
      `);
      await elementUpdated(wrap);
      const el = wrap.querySelector("vu-steps") as VuSteps;
      await expectA11y(el).to.be.accessible();
    });
  });
});
