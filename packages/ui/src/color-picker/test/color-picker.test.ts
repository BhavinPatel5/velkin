/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3 N/A 4✓ 5✓ 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { elementUpdated, fixture, html, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import type { VuColorArea } from "../../color-area/color-area.js";
import type { VuColorSlider } from "../../color-slider/color-slider.js";
import "../../color-area/color-area.js";
import "../../color-slider/color-slider.js";
import "../../color-swatch/color-swatch.js";
import "../../dropdown/dropdown.js";
import "../../dropdown-item/dropdown-item.js";
import { VuColorPicker } from "../color-picker.js";

const tick = () => new Promise<void>((r) => queueMicrotask(() => r()));

/** Waits until lazy-loaded picker children are in the shadow tree. */
async function pickerReady(el: VuColorPicker): Promise<void> {
  for (let i = 0; i < 30; i++) {
    const needsArea = el.showArea && !el.shadowRoot?.querySelector("vu-color-area");
    const needsSlider =
      (el.showHueSlider || el.showAlpha) &&
      el.showHueSlider &&
      !el.shadowRoot?.querySelector('vu-color-slider[channel="hue"]');
    const needsSwatch = el.swatches.length > 0 && !el.shadowRoot?.querySelector("vu-color-swatch");
    const needsDropdown = el.showFormat && !el.shadowRoot?.querySelector("vu-dropdown");
    if (!needsArea && !needsSlider && !needsSwatch && !needsDropdown) return;
    await tick();
    await elementUpdated(el);
  }
}

describe("vu-color-picker", () => {
  it("is defined", () => {
    expect(customElements.get("vu-color-picker")).toBe(VuColorPicker);
  });

  it('ingests value="#3b82f6" and forwards HSV+A to the inner area + sliders', async () => {
    const el = await fixture<VuColorPicker>(
      html`<vu-color-picker value="#3b82f6"></vu-color-picker>`,
    );
    await elementUpdated(el);
    await pickerReady(el);
    const area = el.shadowRoot!.querySelector("vu-color-area") as VuColorArea;
    const hue = el.shadowRoot!.querySelector('vu-color-slider[channel="hue"]') as VuColorSlider;
    expect(area.hue).toBeCloseTo(217, 0);
    expect(area.saturation).toBeGreaterThan(70);
    expect(hue.getColor().channelValue).toBeCloseTo(217, 0);
  });

  it("renders the alpha slider only when showalpha is set", async () => {
    const off = await fixture<VuColorPicker>(html`<vu-color-picker></vu-color-picker>`);
    await elementUpdated(off);
    expect(off.shadowRoot!.querySelector('vu-color-slider[channel="alpha"]')).toBe(null);
    const on = await fixture<VuColorPicker>(html`<vu-color-picker showalpha></vu-color-picker>`);
    await elementUpdated(on);
    await pickerReady(on);
    expect(on.shadowRoot!.querySelector('vu-color-slider[channel="alpha"]')).not.toBe(null);
  });

  it("invalid input flips aria-invalid; valid input clears it", async () => {
    const el = await fixture<VuColorPicker>(
      html`<vu-color-picker value="#3b82f6"></vu-color-picker>`,
    );
    await elementUpdated(el);
    const input = el.shadowRoot!.querySelector('[part="input"]') as HTMLInputElement;
    input.value = "not-a-color";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await elementUpdated(el);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    input.value = "#ff00aa";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await elementUpdated(el);
    expect(input.getAttribute("aria-invalid")).toBe("false");
  });

  it("format toggle re-formats the textual draft to rgb / hsl", async () => {
    const el = await fixture<VuColorPicker>(
      html`<vu-color-picker value="#ff0000"></vu-color-picker>`,
    );
    await elementUpdated(el);
    await pickerReady(el);
    const dropdown = el.shadowRoot!.querySelector("vu-dropdown") as HTMLElement;
    dropdown.dispatchEvent(new CustomEvent("vu-select", { detail: { value: "rgb" } }));
    await elementUpdated(el);
    const input = el.shadowRoot!.querySelector('[part="input"]') as HTMLInputElement;
    expect(input.value).toMatch(/^rgb\(255 0 0\)$/);
    dropdown.dispatchEvent(new CustomEvent("vu-select", { detail: { value: "hsl" } }));
    await elementUpdated(el);
    expect(input.value).toMatch(/^hsl\(0 100% 50%\)$/);
  });

  it("emits vu-input on every parsed input change and vu-change on commit", async () => {
    const el = await fixture<VuColorPicker>(
      html`<vu-color-picker value="#000000"></vu-color-picker>`,
    );
    await elementUpdated(el);
    const inputs: string[] = [];
    const changes: string[] = [];
    el.addEventListener("vu-input", (e) => inputs.push((e as CustomEvent).detail.hex));
    el.addEventListener("vu-change", (e) => changes.push((e as CustomEvent).detail.hex));
    const input = el.shadowRoot!.querySelector('[part="input"]') as HTMLInputElement;
    input.value = "#ff00aa";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await tick();
    expect(inputs[0]).toBe("#ff00aa");
    expect(changes[0]).toBe("#ff00aa");
  });

  it("emits vu-change on pointer-up commit even when the last drag already synced HSV", async () => {
    const el = await fixture<VuColorPicker>(
      html`<vu-color-picker value="#000000"></vu-color-picker>`,
    );
    await elementUpdated(el);
    await pickerReady(el);
    const changes: string[] = [];
    el.addEventListener("vu-change", (e) => changes.push((e as CustomEvent).detail.hex));

    const area = el.shadowRoot!.querySelector("vu-color-area") as VuColorArea;
    const detail = { hsv: { h: 208, s: 60, v: 50 }, rgb: { r: 51, g: 92, b: 128 } };
    /* Drag frame syncs HSV via vu-input; pointer-up then re-emits the same HSV as vu-change. */
    area.dispatchEvent(new CustomEvent("vu-input", { detail, bubbles: true }));
    area.dispatchEvent(new CustomEvent("vu-change", { detail, bubbles: true }));
    await tick();

    expect(changes.length).toBe(1);
    expect(changes[0]).toBe("#335c80");
  });

  it("preset swatch click drives HSV state and marks the swatch as selected", async () => {
    const el = await fixture<VuColorPicker>(
      html`<vu-color-picker
        value="#000000"
        .swatches=${["#ff0000", "#00ff00", "#0000ff"]}
      ></vu-color-picker>`,
    );
    await elementUpdated(el);
    await pickerReady(el);
    const swatches = el.shadowRoot!.querySelectorAll("vu-color-swatch");
    expect(swatches.length).toBe(3);
    (swatches[1] as any).dispatchEvent(
      new CustomEvent("vu-select", {
        detail: { color: "#00ff00", value: "#00ff00" },
        bubbles: true,
        composed: true,
      }),
    );
    await elementUpdated(el);
    const input = el.shadowRoot!.querySelector('[part="input"]') as HTMLInputElement;
    expect(input.value).toBe("#00ff00");
  });

  it("disabled disables every interactive child", async () => {
    const el = await fixture<VuColorPicker>(
      html`<vu-color-picker disabled showalpha .swatches=${["#ff0000"]}></vu-color-picker>`,
    );
    await elementUpdated(el);
    await pickerReady(el);
    const area = el.shadowRoot!.querySelector("vu-color-area") as HTMLElement;
    const hue = el.shadowRoot!.querySelector('vu-color-slider[channel="hue"]') as HTMLElement;
    const alpha = el.shadowRoot!.querySelector('vu-color-slider[channel="alpha"]') as HTMLElement;
    const input = el.shadowRoot!.querySelector('[part="input"]') as HTMLInputElement;
    const formatButton = el.shadowRoot!.querySelector('[part="format"]') as HTMLButtonElement;
    const swatch = el.shadowRoot!.querySelector("vu-color-swatch") as HTMLElement;
    expect(area.hasAttribute("disabled")).toBe(true);
    expect(hue.hasAttribute("disabled")).toBe(true);
    expect(alpha.hasAttribute("disabled")).toBe(true);
    expect(input.disabled).toBe(true);
    expect(formatButton.disabled).toBe(true);
    expect(swatch.hasAttribute("disabled")).toBe(true);
    expect(el.getAttribute("aria-disabled")).toBe("true");
  });

  it("readonly keeps children focusable but blocks edits", async () => {
    const el = await fixture<VuColorPicker>(
      html`<vu-color-picker
        readonly
        value="#000000"
        showalpha
        .swatches=${["#ff0000"]}
      ></vu-color-picker>`,
    );
    await elementUpdated(el);
    await pickerReady(el);
    const area = el.shadowRoot!.querySelector("vu-color-area") as HTMLElement;
    const hue = el.shadowRoot!.querySelector('vu-color-slider[channel="hue"]') as HTMLElement;
    const input = el.shadowRoot!.querySelector('[part="input"]') as HTMLInputElement;
    const formatButton = el.shadowRoot!.querySelector('[part="format"]') as HTMLButtonElement;
    expect(area.hasAttribute("readonly")).toBe(true);
    expect(hue.hasAttribute("readonly")).toBe(true);
    expect(input.readOnly).toBe(true);
    expect(formatButton.disabled).toBe(true);
    input.value = "#ff00aa";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe("#000000");
  });

  it('trigger="swatch" renders a button + popover, hides the inline body', async () => {
    const el = await fixture<VuColorPicker>(
      html`<vu-color-picker trigger="swatch" value="#3b82f6"></vu-color-picker>`,
    );
    await elementUpdated(el);
    await pickerReady(el);
    const trigger = el.shadowRoot!.querySelector('[part="trigger"]');
    const popover = el.shadowRoot!.querySelector('[part="popover"]');
    expect(trigger?.tagName).toBe("BUTTON");
    expect(trigger?.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger?.getAttribute("aria-expanded")).toBe("false");
    expect(popover?.getAttribute("popover")).toBe("manual");
    /* The picker body still renders, but inside the popover. */
    expect(popover?.querySelector("vu-color-area")).not.toBe(null);
  });

  it("show() / hide() drive the popover open state", async () => {
    const el = await fixture<VuColorPicker>(
      html`<vu-color-picker trigger="swatch" value="#3b82f6"></vu-color-picker>`,
    );
    await elementUpdated(el);
    el.show();
    await elementUpdated(el);
    expect(el.open).toBe(true);
    expect(el.shadowRoot!.querySelector('[part="trigger"]')?.getAttribute("aria-expanded")).toBe(
      "true",
    );
    el.hide();
    await elementUpdated(el);
    expect(el.open).toBe(false);
  });

  it("hex with alpha round-trips when showalpha is on", async () => {
    const el = await fixture<VuColorPicker>(
      html`<vu-color-picker showalpha value="#3b82f680"></vu-color-picker>`,
    );
    await elementUpdated(el);
    const input = el.shadowRoot!.querySelector('[part="input"]') as HTMLInputElement;
    expect(input.value).toMatch(/^#3b82f680$/i);
  });

  it("forwards planecolorspace and plane channels to vu-color-area", async () => {
    const el = await fixture<VuColorPicker>(
      html`<vu-color-picker
        planecolorspace="hsl"
        planexchannel="saturation"
        planeychannel="brightness"
        value="#3b82f6"
      ></vu-color-picker>`,
    );
    await elementUpdated(el);
    await pickerReady(el);
    const area = el.shadowRoot!.querySelector("vu-color-area")!;
    expect(area.getAttribute("colorspace")).toBe("hsl");
    expect(area.getAttribute("xchannel")).toBe("saturation");
    expect(area.getAttribute("ychannel")).toBe("brightness");
  });

  it("omits vu-color-area when showArea is false", async () => {
    const el = await fixture<VuColorPicker>(
      html`<vu-color-picker .showArea=${false} value="#3b82f6"></vu-color-picker>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot!.querySelector("vu-color-area")).toBe(null);
    expect(el.hasAttribute("show-area")).toBe(false);
  });

  it("omits the hue slider when showHueSlider is false", async () => {
    const el = await fixture<VuColorPicker>(
      html`<vu-color-picker .showHueSlider=${false} value="#3b82f6"></vu-color-picker>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot!.querySelector('vu-color-slider[channel="hue"]')).toBe(null);
  });

  /* === Form-association ===
     The picker extends FormControlBase like every other form-associated
     component in the workspace. It seeds its reset target from the initial
     `value` via `captureDefaultValue()` (matching how vu-input, vu-counter,
     vu-otp, etc. all do it), so we assert behavior at the form boundary
     rather than reaching into the protected `defaultValue` field. */

  it("submits the current value via FormData under `name`", async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form>
        <vu-color-picker name="brand" value="#ef4444"></vu-color-picker>
      </form>`,
    );
    const el = form.querySelector("vu-color-picker") as VuColorPicker;
    await elementUpdated(el);
    const data = new FormData(form);
    expect(data.get("brand")).toBe("#ef4444");
    expect(el.form).toBe(form);
  });

  it("form.reset() restores value to whatever the picker mounted with", async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form>
        <vu-color-picker name="brand" value="#22c55e"></vu-color-picker>
      </form>`,
    );
    const el = form.querySelector("vu-color-picker") as VuColorPicker;
    await elementUpdated(el);
    el.value = "#3b82f6";
    await elementUpdated(el);
    expect(el.value).toBe("#3b82f6");
    form.reset();
    await elementUpdated(el);
    expect(el.value).toBe("#22c55e");
  });

  it("omits the value from FormData when disabled", async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form>
        <vu-color-picker name="brand" value="#ef4444" disabled></vu-color-picker>
      </form>`,
    );
    await tick();
    const data = new FormData(form);
    expect(data.get("brand")).toBe(null);
  });

  it("required and showErrors surfaces error after validateInput", async () => {
    const el = await fixture<VuColorPicker>(
      html`<vu-color-picker required showerrors value=""></vu-color-picker>`,
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
  it("default color picker passes axe", async () => {
    const el = await fixture(html`<vu-color-picker label="Brand"></vu-color-picker>`);
    await elementUpdated(el);
    await tick();
    await expectA11y(el).to.be.accessible();
  });
});
