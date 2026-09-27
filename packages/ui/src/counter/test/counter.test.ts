import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { ICONS } from "../../../internals/icon.js";
import { VuCounter } from "../counter.js";
import type { VuCounterChangeDetail } from "../counter.types.js";
import "../../icon/icon.js";

describe("vu-counter", () => {
  it("is defined", () => {
    expect(customElements.get("vu-counter")).toBe(VuCounter);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuCounter>(html`<vu-counter></vu-counter>`);
    await elementUpdated(el);

    expect(el.value).toBe(0);
    expect(el.min).toBe(0);
    expect(el.step).toBe(1);
    expect(el.allowTyping).toBe(false);
    expect(el.variant).toBe("default");
    expect(el.tone).toBe("normal");
    expect(el.size).toBe("md");
    expect(el.radius).toBe("md");

    expect(el.shadowRoot?.querySelector('[part="field"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="container"]')).toBeTruthy();
  });

  it("reflects variant, tone, size, and pill", async () => {
    const el = await fixture<VuCounter>(
      html`<vu-counter variant="outline" tone="strong" size="sm" radius="full"></vu-counter>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("variant")).toBe("outline");
    expect(el.getAttribute("tone")).toBe("strong");
    expect(el.getAttribute("size")).toBe("sm");
    expect(el.getAttribute("radius")).toBe("full");
  });

  it("uses library icon defaults", async () => {
    const el = await fixture<VuCounter>(html`<vu-counter></vu-counter>`);
    await elementUpdated(el);
    expect(el.iconDecrease).toBe(ICONS.decrement);
    expect(el.iconIncrease).toBe(ICONS.increment);
  });

  it("increments and emits vu-change with detail", async () => {
    const el = await fixture<VuCounter>(
      html`<vu-counter .value=${2} .min=${0} .max=${10}></vu-counter>`,
    );
    await elementUpdated(el);
    let detail: VuCounterChangeDetail | undefined;
    el.addEventListener("vu-change", ((e: CustomEvent<VuCounterChangeDetail>) => {
      detail = e.detail;
    }) as EventListener);
    el.increment();
    expect(el.value).toBe(3);
    expect(detail?.value).toBe(3);
    expect(detail?.previous).toBe(2);
    expect(detail?.reason).toBe("increment");
  });

  it("decrements at min when wrap is enabled", async () => {
    const el = await fixture<VuCounter>(
      html`<vu-counter wrap .value=${0} .min=${0} .max=${3}></vu-counter>`,
    );
    await elementUpdated(el);
    el.decrement();
    expect(el.value).toBe(3);
  });

  it("increments at max when wrap is enabled", async () => {
    const el = await fixture<VuCounter>(
      html`<vu-counter wrap .value=${3} .min=${0} .max=${3}></vu-counter>`,
    );
    await elementUpdated(el);
    el.increment();
    expect(el.value).toBe(0);
  });

  it("does not disable increase at max when wrap is enabled", async () => {
    const el = await fixture<VuCounter>(
      html`<vu-counter wrap .value=${10} .min=${0} .max=${10}></vu-counter>`,
    );
    await elementUpdated(el);
    const incBtn = el.shadowRoot?.querySelector('[part~="button--increase"]') as HTMLButtonElement;
    expect(incBtn?.disabled).toBe(false);
  });

  it("arrow up increments via keyboard", async () => {
    const el = await fixture<VuCounter>(
      html`<vu-counter allowTyping .value=${1} .min=${0} .max=${10}></vu-counter>`,
    );
    await elementUpdated(el);
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    input.focus();
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe(2);
  });

  it("home sets value to min", async () => {
    const el = await fixture<VuCounter>(
      html`<vu-counter allowTyping .value=${5} .min=${0} .max=${10}></vu-counter>`,
    );
    await elementUpdated(el);
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe(0);
  });

  it("hides empty start and end affix wrappers", async () => {
    const el = await fixture<VuCounter>(html`<vu-counter></vu-counter>`);
    await elementUpdated(el);
    const start = el.shadowRoot?.querySelector('[part="start"]') as HTMLElement;
    const end = el.shadowRoot?.querySelector('[part="end"]') as HTMLElement;
    expect(start.hasAttribute("hidden")).toBe(false);
    expect(end.hasAttribute("hidden")).toBe(false);
  });

  it("shows start affix when slotted", async () => {
    const el = await fixture<VuCounter>(html`
      <vu-counter><span slot="start">kg</span></vu-counter>
    `);
    await elementUpdated(el);
    const start = el.shadowRoot?.querySelector('[part="start"]') as HTMLElement;
    const end = el.shadowRoot?.querySelector('[part="end"]') as HTMLElement;
    expect(start.hasAttribute("hidden")).toBe(false);
    expect(end.hasAttribute("hidden")).toBe(false);
    expect(getComputedStyle(start).display).not.toBe("none");
  });

  it("renders label and wires for attribute", async () => {
    const el = await fixture<VuCounter>(html`<vu-counter label="Quantity"></vu-counter>`);
    await elementUpdated(el);
    const label = el.shadowRoot?.querySelector('[part="label"]');
    const input = el.shadowRoot?.querySelector("input");
    expect(label?.textContent?.trim()).toBe("Quantity");
    expect(label?.getAttribute("for")).toBe(input?.id);
  });

  it("forwards host id to the internal input", async () => {
    const el = await fixture<VuCounter>(html`<vu-counter id="qty" label="Qty"></vu-counter>`);
    await elementUpdated(el);
    const input = el.shadowRoot?.querySelector('[part="input"]') as HTMLInputElement;
    expect(input.id).toBe("qty-input");
  });

  it("exposes aria-disabled when disabled", async () => {
    const el = await fixture<VuCounter>(html`<vu-counter disabled></vu-counter>`);
    await elementUpdated(el);
    expect(el.getAttribute("aria-disabled")).toBe("true");
  });

  it("updates label visibility when a label slot is added at runtime", async () => {
    const el = await fixture<VuCounter>(html`<vu-counter arialabel="Guests"></vu-counter>`);
    await elementUpdated(el);
    const label = () => el.shadowRoot?.querySelector('[part="label"]') as HTMLElement;
    expect(label().getAttribute("aria-hidden")).toBe("true");

    const slotLabel = document.createElement("span");
    slotLabel.slot = "label";
    slotLabel.textContent = "Party size";
    el.appendChild(slotLabel);
    await elementUpdated(el);

    expect(label().getAttribute("aria-hidden")).toBeNull();
    expect(el.querySelector('[slot="label"]')?.textContent?.trim()).toBe("Party size");
  });

  it("readonly disables step buttons and marks the input read-only", async () => {
    const el = await fixture<VuCounter>(
      html`<vu-counter readonly allowTyping .value=${3} .min=${0} .max=${10}></vu-counter>`,
    );
    await elementUpdated(el);
    const dec = el.shadowRoot?.querySelector('[part~="button--decrease"]') as HTMLButtonElement;
    const inc = el.shadowRoot?.querySelector('[part~="button--increase"]') as HTMLButtonElement;
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    expect(dec.disabled).toBe(true);
    expect(inc.disabled).toBe(true);
    expect(input.disabled).toBe(false);
    expect(input.readOnly).toBe(true);
    el.increment();
    expect(el.value).toBe(3);
  });

  it("shows validation error after blur when required and empty", async () => {
    const el = await fixture<VuCounter>(
      html`<vu-counter
        required
        showErrors
        allowTyping
        allowEmpty
        .value=${Number.NaN}
      ></vu-counter>`,
    );
    await elementUpdated(el);
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    input.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
    await elementUpdated(el);
    expect(el.validationActive).toBe(true);
    expect(el.shadowRoot?.querySelector('[part="error-message"]')).toBeTruthy();
  });

  it("commitOnly defers vu-change until blur", async () => {
    const el = await fixture<VuCounter>(
      html`<vu-counter commitOnly allowTyping .value=${1}></vu-counter>`,
    );
    await elementUpdated(el);
    let count = 0;
    el.addEventListener("vu-change", () => {
      count += 1;
    });
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    input.value = "4";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(count).toBe(0);
    input.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
    await elementUpdated(el);
    expect(count).toBe(1);
    expect(el.value).toBe(4);
  });

  it("reset fires vu-clear", async () => {
    const el = await fixture<VuCounter>(
      html`<vu-counter .value=${7} .defaultNumber=${0}></vu-counter>`,
    );
    await elementUpdated(el);
    let cleared: number | undefined;
    el.addEventListener("vu-clear", ((e: CustomEvent) => {
      cleared = e.detail?.value;
    }) as EventListener);
    el.reset();
    expect(el.value).toBe(0);
    expect(cleared).toBe(0);
  });

  it("setValue is an alias for programmatic updates", async () => {
    const el = await fixture<VuCounter>(html`<vu-counter></vu-counter>`);
    await elementUpdated(el);
    let reason = "";
    el.addEventListener("vu-change", ((e: CustomEvent<VuCounterChangeDetail>) => {
      reason = e.detail.reason;
    }) as EventListener);
    el.setValue(8);
    expect(el.value).toBe(8);
    expect(reason).toBe("programmatic");
  });

  it("applies precision on blur", async () => {
    const el = await fixture<VuCounter>(
      html`<vu-counter allowTyping .precision=${2} .value=${1} .step=${0.01}></vu-counter>`,
    );
    await elementUpdated(el);
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    input.value = "1.239";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
    await elementUpdated(el);
    expect(el.value).toBe(1.24);
  });
});

describe("accessibility", () => {
  it("default counter passes axe", async () => {
    const el = await fixture(html`<vu-counter label="Quantity"></vu-counter>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("disabled counter passes axe", async () => {
    const el = await fixture(html`<vu-counter label="Qty" disabled></vu-counter>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("outline strong full radius counter passes axe", async () => {
    const el = await fixture(html`
      <vu-counter
        variant="outline"
        tone="strong"
        radius="full"
        label="Guests"
        .value=${2}
      ></vu-counter>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
