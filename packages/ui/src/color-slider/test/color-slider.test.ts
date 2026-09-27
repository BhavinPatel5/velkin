/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3 N/A 4✓ 5✓ 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { elementUpdated, fixture, html, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuColorSlider } from "../color-slider.js";

describe("vu-color-slider", () => {
  it("is defined", () => {
    expect(customElements.get("vu-color-slider")).toBe(VuColorSlider);
  });

  it("hue defaults — gray value, role=slider, aria 0..360 with 'degrees' valuetext", async () => {
    const el = await fixture<VuColorSlider>(html`<vu-color-slider></vu-color-slider>`);
    await elementUpdated(el);
    expect(el.channel).toBe("hue");
    expect(el.value).toBe("#808080");
    expect(el.orientation).toBe("horizontal");
    expect(el.getAttribute("role")).toBe("slider");
    expect(el.getAttribute("aria-valuemin")).toBe("0");
    expect(el.getAttribute("aria-valuemax")).toBe("360");
    expect(el.getAttribute("aria-valuenow")).toBe("0");
    expect(el.getAttribute("aria-valuetext")).toBe("0 degrees");
    expect(el.getAttribute("aria-orientation")).toBe("horizontal");
    expect(el.getAttribute("aria-label")).toBe("Hue");
    expect(el.getAttribute("tabindex")).toBe("0");
  });

  it("alpha channel — aria 0..1, percent valuetext, label='Alpha'", async () => {
    const el = await fixture<VuColorSlider>(
      html`<vu-color-slider channel="alpha" value="rgb(128 128 128 / 0.5)"></vu-color-slider>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("aria-valuemin")).toBe("0");
    expect(el.getAttribute("aria-valuemax")).toBe("1");
    expect(el.getAttribute("aria-valuetext")).toBe("50%");
    expect(el.getAttribute("aria-label")).toBe("Alpha");
  });

  it("ArrowRight increments hue (default step 1), ArrowLeft decrements", async () => {
    const el = await fixture<VuColorSlider>(
      html`<vu-color-slider value="hsl(180 100% 50%)"></vu-color-slider>`,
    );
    await elementUpdated(el);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    await elementUpdated(el);
    expect(el.getColor().channelValue).toBeGreaterThan(179);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
    await elementUpdated(el);
    expect(Math.round(el.getColor().channelValue)).toBe(180);
  });

  it("Shift+Arrow accelerates by 10×; Home/End jump to extremes", async () => {
    const el = await fixture<VuColorSlider>(
      html`<vu-color-slider value="hsl(180 100% 50%)"></vu-color-slider>`,
    );
    await elementUpdated(el);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", shiftKey: true }));
    await elementUpdated(el);
    expect(Math.round(el.getColor().channelValue)).toBe(190);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "Home" }));
    await elementUpdated(el);
    expect(Math.round(el.getColor().channelValue)).toBe(0);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "End" }));
    await elementUpdated(el);
    expect(Math.round(el.getColor().color.red)).toBe(255);
  });

  it("alpha step defaults to 0.01; ArrowRight nudges by 0.01", async () => {
    const el = await fixture<VuColorSlider>(
      html`<vu-color-slider channel="alpha" value="rgb(0 0 0 / 0.5)"></vu-color-slider>`,
    );
    await elementUpdated(el);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    await elementUpdated(el);
    expect(Math.round(el.getColor().channelValue * 100)).toBe(51);
  });

  it("vertical orientation: ArrowUp increments hue, ArrowDown decrements", async () => {
    const el = await fixture<VuColorSlider>(
      html`<vu-color-slider orientation="vertical" value="hsl(100 100% 50%)"></vu-color-slider>`,
    );
    await elementUpdated(el);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
    await elementUpdated(el);
    expect(Math.round(el.getColor().channelValue)).toBe(101);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    await elementUpdated(el);
    expect(Math.round(el.getColor().channelValue)).toBe(100);
  });

  it("setChannelValue clamps hue to 0..360", async () => {
    const el = await fixture<VuColorSlider>(
      html`<vu-color-slider value="hsl(0 100% 50%)"></vu-color-slider>`,
    );
    await elementUpdated(el);
    el.setChannelValue(500);
    await elementUpdated(el);
    expect(Math.round(el.getColor().color.red)).toBe(255);
    el.setChannelValue(-100);
    await elementUpdated(el);
    expect(Math.round(el.getColor().channelValue)).toBe(0);
  });

  it("emits vu-input + vu-change with full detail", async () => {
    const el = await fixture<VuColorSlider>(
      html`<vu-color-slider value="hsl(50 100% 50%)"></vu-color-slider>`,
    );
    await elementUpdated(el);
    const inputs: Array<{ channelValue: number; value: string }> = [];
    const changes: Array<{ channelValue: number; value: string }> = [];
    el.addEventListener("vu-input", (e) => {
      const d = (e as CustomEvent).detail;
      inputs.push({ channelValue: d.channelValue, value: d.value });
    });
    el.addEventListener("vu-change", (e) => {
      const d = (e as CustomEvent).detail;
      changes.push({ channelValue: d.channelValue, value: d.value });
    });
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    await elementUpdated(el);
    expect(inputs.length).toBe(1);
    expect(changes.length).toBe(1);
    expect(inputs[0].channelValue).toBe(51);
    expect(typeof inputs[0].value).toBe("string");
    expect(inputs[0].value).toBe(changes[0].value);
  });

  it("disabled drops tabindex, sets aria-disabled, ignores keys", async () => {
    const el = await fixture<VuColorSlider>(
      html`<vu-color-slider value="hsl(50 100% 50%)" disabled></vu-color-slider>`,
    );
    await elementUpdated(el);
    expect(el.hasAttribute("tabindex")).toBe(false);
    expect(el.getAttribute("aria-disabled")).toBe("true");
    const before = el.getColor().channelValue;
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    await elementUpdated(el);
    expect(el.getColor().channelValue).toBe(before);
  });

  it("readonly keeps tabindex but ignores keys", async () => {
    const el = await fixture<VuColorSlider>(
      html`<vu-color-slider value="hsl(50 100% 50%)" readonly></vu-color-slider>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("tabindex")).toBe("0");
    const before = el.getColor().channelValue;
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
    await elementUpdated(el);
    expect(el.getColor().channelValue).toBe(before);
  });

  it("submits the CSS color string under `name`", async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form>
        <vu-color-slider name="c" value="hsl(200 100% 50%)"></vu-color-slider>
      </form>`,
    );
    const el = form.querySelector("vu-color-slider") as VuColorSlider;
    await elementUpdated(el);
    const data = new FormData(form);
    expect(data.get("c")).toBeTruthy();
    expect(String(data.get("c")).includes("200")).toBe(true);
    expect(el.form).toBe(form);
  });

  it("alpha submits rgb() string with alpha", async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form>
        <vu-color-slider name="a" channel="alpha" value="rgb(10 20 30 / 0.5)"></vu-color-slider>
      </form>`,
    );
    await elementUpdated(form.querySelector("vu-color-slider") as VuColorSlider);
    const v = String(new FormData(form).get("a"));
    expect(v).toContain("10");
    expect(v).toContain("0.5");
  });

  it("form.reset() restores initial color string", async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form>
        <vu-color-slider name="c" value="hsl(180 100% 50%)"></vu-color-slider>
      </form>`,
    );
    const el = form.querySelector("vu-color-slider") as VuColorSlider;
    await elementUpdated(el);
    el.setChannelValue(330);
    await elementUpdated(el);
    expect(Math.round(el.getColor().channelValue)).not.toBe(180);
    form.reset();
    await elementUpdated(el);
    expect(Math.round(el.getColor().channelValue)).toBe(180);
  });

  it("required and showErrors surfaces error after validateInput", async () => {
    const el = await fixture<VuColorSlider>(
      html`<vu-color-slider required showerrors value=""></vu-color-slider>`,
    );
    await elementUpdated(el);
    el.validationActive = true;
    el.validateInput();
    await elementUpdated(el);
    const err = el.shadowRoot?.querySelector('[part="error-message"]') as HTMLElement | null;
    expect(err?.id).toBeTruthy();
    expect(err?.textContent?.trim().length).toBeGreaterThan(0);
  });
});

describe("accessibility", () => {
  it("hue slider passes axe", async () => {
    const el = await fixture(html`<vu-color-slider channel="hue"></vu-color-slider>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
