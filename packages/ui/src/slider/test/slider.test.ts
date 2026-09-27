/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7 N/A 8✓ 9✓ 10 N/A — a11y: default, disabled, readonly, variants
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuSlider } from "../slider.js";

describe("vu-slider", () => {
  it("is defined", () => {
    expect(customElements.get("vu-slider")).toBe(VuSlider);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuSlider>(html`<vu-slider></vu-slider>`);
    await elementUpdated(el);
    expect(el.min).toBe(0);
    expect(el.max).toBe(100);
    expect(el.value).toBe(50);
    expect(el.step).toBe(1);
    expect(el.showValue).toBe(true);
    expect(el.commitOnly).toBe(false);
    expect(el.variant).toBe("default");
    expect(el.size).toBe("md");
    expect(el.shadowRoot?.querySelector('[part="thumb"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="thumb-visual"]')).toBeTruthy();
  });

  it("accepts min, max, value, step", async () => {
    const el = await fixture<VuSlider>(
      html`<vu-slider .min=${0} .max=${200} .value=${100} .step=${10}></vu-slider>`,
    );
    await elementUpdated(el);
    expect(el.min).toBe(0);
    expect(el.max).toBe(200);
    expect(el.value).toBe(100);
    expect(el.step).toBe(10);
  });

  it("accepts label, prefix, suffix, showValue", async () => {
    const el = await fixture<VuSlider>(
      html`<vu-slider label="Volume" prefix="$" suffix="%" .showValue=${false}></vu-slider>`,
    );
    await elementUpdated(el);
    expect(el.label).toBe("Volume");
    expect(el.prefix).toBe("$");
    expect(el.suffix).toBe("%");
    expect(el.showValue).toBe(false);
    expect(el.shadowRoot?.querySelector('[part="value"]')).toBeNull();
  });

  it("renders label and formatted value summary", async () => {
    const el = await fixture<VuSlider>(
      html`<vu-slider label="Volume" prefix="$" .value=${40}></vu-slider>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="text"]')?.textContent?.trim()).toBe("Volume");
    expect(el.shadowRoot?.querySelector('[part="value"]')?.textContent).toContain("40");
  });

  it("dispatches vu-change on live thumb input", async () => {
    const el = await fixture<VuSlider>(html`<vu-slider .value=${50} .step=${1}></vu-slider>`);
    await elementUpdated(el);

    let detail: { value?: number } = {};
    el.addEventListener("vu-change", ((e: CustomEvent) => {
      detail = e.detail ?? {};
    }) as EventListener);

    const thumb = el.shadowRoot?.querySelector('[part="thumb"]') as HTMLInputElement;
    thumb.value = "60";
    thumb.dispatchEvent(new Event("input", { bubbles: true }));
    await elementUpdated(el);

    expect(detail.value).toBe(60);
    expect(el.value).toBe(60);
  });

  it("commitOnly emits vu-change on change only", async () => {
    const el = await fixture<VuSlider>(
      html`<vu-slider commitonly .value=${50} .step=${1}></vu-slider>`,
    );
    await elementUpdated(el);

    let count = 0;
    el.addEventListener("vu-change", () => {
      count++;
    });

    const thumb = el.shadowRoot?.querySelector('[part="thumb"]') as HTMLInputElement;
    thumb.value = "60";
    thumb.dispatchEvent(new Event("input", { bubbles: true }));
    await elementUpdated(el);
    expect(count).toBe(0);
    expect(el.value).toBe(50);
    expect(el.displayValue).toBe(60);

    thumb.dispatchEvent(new Event("change", { bubbles: true }));
    await elementUpdated(el);
    expect(count).toBe(1);
    expect(el.value).toBe(60);
  });

  it("setValue clamps, snaps, and emits vu-change", async () => {
    const el = await fixture<VuSlider>(
      html`<vu-slider .min=${0} .max=${100} .step=${10} .value=${50}></vu-slider>`,
    );
    await elementUpdated(el);

    let detail: { value?: number } = {};
    el.addEventListener("vu-change", ((e: CustomEvent) => {
      detail = e.detail ?? {};
    }) as EventListener);

    el.setValue(47);
    await elementUpdated(el);
    expect(el.value).toBe(50);
    expect(detail.value).toBeUndefined();

    detail = {};
    el.setValue(65);
    await elementUpdated(el);
    expect(el.value).toBe(70);
    expect(detail.value).toBe(70);
  });

  it("submits value via FormData under name", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <vu-slider name="volume" .value=${42}></vu-slider>
      </form>
    `);
    const el = form.querySelector("vu-slider") as VuSlider;
    await elementUpdated(el);
    expect(new FormData(form).get("volume")).toBe("42");
  });

  it("disabled omits form value", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <vu-slider name="volume" .value=${42} disabled></vu-slider>
      </form>
    `);
    await elementUpdated(form.querySelector("vu-slider") as VuSlider);
    expect(new FormData(form).get("volume")).toBeNull();
  });

  it("reflects variant, size, and block", async () => {
    const el = await fixture<VuSlider>(
      html`<vu-slider variant="outline" size="sm" block></vu-slider>`,
    );
    await elementUpdated(el);
    expect(el.variant).toBe("outline");
    expect(el.size).toBe("sm");
    expect(el.block).toBe(true);
    expect(el.getAttribute("variant")).toBe("outline");
  });

  it("renders variant chrome on outline and underline shells", async () => {
    const outline = await fixture<VuSlider>(html`<vu-slider variant="outline"></vu-slider>`);
    await elementUpdated(outline);
    expect(outline.shadowRoot?.querySelector('[part="control"]')).toBeTruthy();

    const underline = await fixture<VuSlider>(html`<vu-slider variant="underline"></vu-slider>`);
    await elementUpdated(underline);
    expect(underline.getAttribute("variant")).toBe("underline");
  });

  it("disabled and readonly disable the thumb", async () => {
    const disabled = await fixture<VuSlider>(html`<vu-slider disabled></vu-slider>`);
    await elementUpdated(disabled);
    expect(
      (disabled.shadowRoot?.querySelector('[part="thumb"]') as HTMLInputElement).disabled,
    ).toBe(true);

    const readonly = await fixture<VuSlider>(html`<vu-slider readonly></vu-slider>`);
    await elementUpdated(readonly);
    expect(
      (readonly.shadowRoot?.querySelector('[part="thumb"]') as HTMLInputElement).disabled,
    ).toBe(true);
  });
});

describe("accessibility", () => {
  it("default slider passes axe", async () => {
    const el = await fixture(html`<vu-slider label="Volume"></vu-slider>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("disabled slider passes axe", async () => {
    const el = await fixture(html`<vu-slider label="Volume" disabled></vu-slider>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("outline variant passes axe", async () => {
    const el = await fixture(html`<vu-slider label="Volume" variant="outline"></vu-slider>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  describe("keyboard", () => {
    it("exposes a keyboard-focusable native range thumb", async () => {
      const el = await fixture<VuSlider>(html`<vu-slider .value=${50}></vu-slider>`);
      await elementUpdated(el);
      const thumb = el.shadowRoot?.querySelector('[part="thumb"]') as HTMLInputElement;
      expect(thumb?.type).toBe("range");
      thumb?.focus();
      expect(el.shadowRoot?.activeElement).toBe(thumb);
      expect(thumb.min).toBe("0");
      expect(thumb.max).toBe("100");
      expect(thumb.step).toBe("1");
    });
  });
});
