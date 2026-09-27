/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3 N/A 4✓ 5✓ 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { elementUpdated, fixture, html, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuColorSwatchPicker } from "../color-swatch-picker.js";
import type { VuColorSwatchPickerChangeDetail } from "../color-swatch-picker.types.js";
import "../../color-swatch/color-swatch.js";

const tick = () => new Promise<void>((r) => queueMicrotask(() => r()));

describe("vu-color-swatch-picker", () => {
  it("is defined", () => {
    expect(customElements.get("vu-color-swatch-picker")).toBe(VuColorSwatchPicker);
  });

  it("auto-mode renders one swatch per color, host has role=radiogroup", async () => {
    const el = await fixture<VuColorSwatchPicker>(
      html`<vu-color-swatch-picker .colors=${["#f00", "#0f0", "#00f"]}></vu-color-swatch-picker>`,
    );
    await elementUpdated(el);
    await tick();
    await elementUpdated(el);
    expect(el.getAttribute("role")).toBe("radiogroup");
    expect(el.getAttribute("aria-label")).toBe("Color palette");
    const swatches = el.shadowRoot!.querySelectorAll("vu-color-swatch");
    expect(swatches.length).toBe(3);
    expect(swatches[0].getAttribute("role")).toBe("radio");
  });

  it("value selects the matching swatch and sets aria-checked + selected", async () => {
    const el = await fixture<VuColorSwatchPicker>(
      html`<vu-color-swatch-picker
        value="#0f0"
        .colors=${["#f00", "#0f0", "#00f"]}
      ></vu-color-swatch-picker>`,
    );
    await elementUpdated(el);
    await tick();
    await elementUpdated(el);
    const swatches = el.shadowRoot!.querySelectorAll("vu-color-swatch");
    expect(swatches[1].hasAttribute("selected")).toBe(true);
    expect(swatches[1].getAttribute("aria-checked")).toBe("true");
    expect(swatches[0].getAttribute("aria-checked")).toBe("false");
  });

  it("roving tabindex — only the active swatch is in the tab order", async () => {
    const el = await fixture<VuColorSwatchPicker>(
      html`<vu-color-swatch-picker
        value="#00f"
        .colors=${["#f00", "#0f0", "#00f"]}
      ></vu-color-swatch-picker>`,
    );
    await elementUpdated(el);
    await tick();
    await elementUpdated(el);
    const swatches = Array.from(
      el.shadowRoot!.querySelectorAll("vu-color-swatch"),
    ) as HTMLElement[];
    expect(swatches.map((s) => s.tabIndex)).toEqual([-1, -1, 0]);
  });

  it("ArrowRight selects + focuses the next swatch and emits vu-change", async () => {
    const el = await fixture<VuColorSwatchPicker>(
      html`<vu-color-swatch-picker
        value="#f00"
        .colors=${["#f00", "#0f0", "#00f"]}
      ></vu-color-swatch-picker>`,
    );
    await elementUpdated(el);
    await tick();
    await elementUpdated(el);
    let detail: VuColorSwatchPickerChangeDetail | null = null;
    el.addEventListener("vu-change", (e) => {
      detail = (e as CustomEvent<VuColorSwatchPickerChangeDetail>).detail;
    });
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe("#0f0");
    expect(detail?.value).toBe("#0f0");
    expect(detail?.color).toBe("#0f0");
    expect(detail?.index).toBe(1);
    expect(detail?.parsed?.rgb).toEqual({ r: 0, g: 255, b: 0 });
  });

  it("Home / End jump to first / last", async () => {
    const el = await fixture<VuColorSwatchPicker>(
      html`<vu-color-swatch-picker
        value="#0f0"
        .colors=${["#f00", "#0f0", "#00f"]}
      ></vu-color-swatch-picker>`,
    );
    await elementUpdated(el);
    await tick();
    await elementUpdated(el);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe("#00f");
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe("#f00");
  });

  it("clicking a child swatch emits vu-change with value + index", async () => {
    const el = await fixture<VuColorSwatchPicker>(
      html`<vu-color-swatch-picker .colors=${["#f00", "#0f0", "#00f"]}></vu-color-swatch-picker>`,
    );
    await elementUpdated(el);
    await tick();
    await elementUpdated(el);
    let detail: VuColorSwatchPickerChangeDetail | null = null;
    el.addEventListener("vu-change", (e) => {
      detail = (e as CustomEvent<VuColorSwatchPickerChangeDetail>).detail;
    });
    const swatches = el.shadowRoot!.querySelectorAll("vu-color-swatch");
    (swatches[2] as HTMLElement).dispatchEvent(
      new CustomEvent("vu-select", {
        detail: { color: "#00f", value: "#00f" },
        bubbles: true,
        composed: true,
      }),
    );
    await elementUpdated(el);
    expect(el.value).toBe("#00f");
    expect(detail?.value).toBe("#00f");
    expect(detail?.index).toBe(2);
    expect(detail?.parsed?.rgb.b).toBe(255);
  });

  it("composition mode picks up slotted swatches and ignores `colors`", async () => {
    const el = await fixture<VuColorSwatchPicker>(html`
      <vu-color-swatch-picker .colors=${["should-be-ignored"]}>
        <vu-color-swatch color="#abc" value="brand-50"></vu-color-swatch>
        <vu-color-swatch color="#def" value="brand-100"></vu-color-swatch>
      </vu-color-swatch-picker>
    `);
    await elementUpdated(el);
    await tick();
    await elementUpdated(el);
    const slotted = Array.from(el.children) as HTMLElement[];
    expect(slotted.length).toBe(2);
    expect(slotted[0].hasAttribute("selectable")).toBe(true);
    expect(slotted[0].getAttribute("role")).toBe("radio");
    /* Auto-mode chips should NOT have rendered (only the slot would show). */
    expect(el.shadowRoot!.querySelector("vu-color-swatch")).toBe(null);
  });

  it("disabled drops tabindex on swatches and ignores keyboard nav", async () => {
    const el = await fixture<VuColorSwatchPicker>(
      html`<vu-color-swatch-picker
        value="#f00"
        disabled
        .colors=${["#f00", "#0f0"]}
      ></vu-color-swatch-picker>`,
    );
    await elementUpdated(el);
    await tick();
    await elementUpdated(el);
    expect(el.getAttribute("aria-disabled")).toBe("true");
    const swatches = Array.from(
      el.shadowRoot!.querySelectorAll("vu-color-swatch"),
    ) as HTMLElement[];
    expect(swatches.every((s) => s.tabIndex === -1)).toBe(true);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe("#f00");
  });

  it("readonly keeps roving tabindex but ignores keyboard nav and clicks", async () => {
    const el = await fixture<VuColorSwatchPicker>(
      html`<vu-color-swatch-picker
        value="#f00"
        readonly
        .colors=${["#f00", "#0f0"]}
      ></vu-color-swatch-picker>`,
    );
    await elementUpdated(el);
    await tick();
    await elementUpdated(el);
    const swatches = el.getSwatches();
    expect(swatches[0]!.readonly).toBe(true);
    expect(swatches[0]!.tabIndex).toBe(0);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe("#f00");
    swatches[1]!.dispatchEvent(
      new CustomEvent("vu-select", {
        detail: { color: "#0f0", value: "#0f0" },
        bubbles: true,
        composed: true,
      }),
    );
    await elementUpdated(el);
    expect(el.value).toBe("#f00");
  });

  it("getSwatches() returns the live swatch list", async () => {
    const el = await fixture<VuColorSwatchPicker>(
      html`<vu-color-swatch-picker .colors=${["#abc", "#def"]}></vu-color-swatch-picker>`,
    );
    await elementUpdated(el);
    await tick();
    await elementUpdated(el);
    expect(el.getSwatches().length).toBe(2);
  });

  /* === Form-association ===
     Extends FormControlBase. `captureDefaultValue()` seeds the reset target
     from the initial `value` so `<form>.reset()` rolls back to it. */

  it("submits the picked value via FormData under `name`", async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form>
        <vu-color-swatch-picker
          name="palette"
          value="#0f0"
          .colors=${["#f00", "#0f0", "#00f"]}
        ></vu-color-swatch-picker>
      </form>`,
    );
    const el = form.querySelector("vu-color-swatch-picker") as VuColorSwatchPicker;
    await elementUpdated(el);
    await tick();
    await elementUpdated(el);
    const data = new FormData(form);
    expect(data.get("palette")).toBe("#0f0");
    expect(el.form).toBe(form);
  });

  it("form.reset() restores value to whatever the picker mounted with", async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form>
        <vu-color-swatch-picker
          name="palette"
          value="#00f"
          .colors=${["#f00", "#0f0", "#00f"]}
        ></vu-color-swatch-picker>
      </form>`,
    );
    const el = form.querySelector("vu-color-swatch-picker") as VuColorSwatchPicker;
    await elementUpdated(el);
    el.value = "#0f0";
    await elementUpdated(el);
    form.reset();
    await elementUpdated(el);
    expect(el.value).toBe("#00f");
  });

  it("default-value is the form.reset() target when set", async () => {
    const form = await fixture<HTMLFormElement>(
      html`<form>
        <vu-color-swatch-picker
          name="palette"
          value="#0f0"
          defaultvalue="#f00"
          .colors=${["#f00", "#0f0", "#00f"]}
        ></vu-color-swatch-picker>
      </form>`,
    );
    const el = form.querySelector("vu-color-swatch-picker") as VuColorSwatchPicker;
    await elementUpdated(el);
    await tick();
    await elementUpdated(el);
    el.value = "#00f";
    await elementUpdated(el);
    form.reset();
    await elementUpdated(el);
    expect(el.value).toBe("#f00");
  });

  it("layout stack is reflected on the host", async () => {
    const el = await fixture<VuColorSwatchPicker>(
      html`<vu-color-swatch-picker layout="stack" .colors=${["#f00"]}></vu-color-swatch-picker>`,
    );
    await elementUpdated(el);
    await tick();
    expect(el.getAttribute("layout")).toBe("stack");
  });

  it("required and showErrors surfaces error after validateInput", async () => {
    const el = await fixture<VuColorSwatchPicker>(
      html`<vu-color-swatch-picker
        required
        showerrors
        .colors=${["#f00", "#0f0"]}
      ></vu-color-swatch-picker>`,
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
  it("swatch picker passes axe", async () => {
    const el = await fixture(html`
      <vu-color-swatch-picker label="Theme" .colors=${["#f00", "#0f0"]}></vu-color-swatch-picker>
    `);
    await elementUpdated(el);
    await tick();
    await expectA11y(el).to.be.accessible();
  });
});
