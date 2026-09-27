/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4 N/A 5 N/A 6 N/A 7 N/A 8✓ 9 N/A 10 N/A
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuInput } from "../input.js";
import "../../icon/icon.js";

describe("vu-input", () => {
  it("is defined", () => {
    expect(customElements.get("vu-input")).toBe(VuInput);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuInput>(html`<vu-input></vu-input>`);
    await elementUpdated(el);
    expect(el.label).toBe("");
    expect(el.placeholder).toBe("");
    expect(el.type).toBe("text");
    expect(el.variant).toBe("default");
    expect(el.tone).toBe("normal");
    expect(el.size).toBe("md");
    expect(el.value).toBe("");
    expect(el.hasAttribute("name")).toBe(false);
    expect(el.hasAttribute("defaultvalue")).toBe(false);
    expect(el.hasAttribute("formid")).toBe(false);
    expect(el.shadowRoot?.querySelector('[part="input"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="container"]')).toBeTruthy();
  });

  it("accepts label and placeholder", async () => {
    const el = await fixture<VuInput>(
      html`<vu-input label="Name" placeholder="Enter name"></vu-input>`,
    );
    await elementUpdated(el);
    expect(el.label).toBe("Name");
    expect(el.placeholder).toBe("Enter name");
  });

  it("accepts type", async () => {
    const el = await fixture<VuInput>(html`<vu-input type="email"></vu-input>`);
    await elementUpdated(el);
    expect(el.type).toBe("email");
    expect((el.shadowRoot?.querySelector('[part="input"]') as HTMLInputElement)?.type).toBe(
      "email",
    );
  });

  it("accepts value and emits vu-change on input", async () => {
    const el = await fixture<VuInput>(html`<vu-input .value=${"hello"}></vu-input>`);
    await elementUpdated(el);
    expect(el.value).toBe("hello");

    let detail: { value: string | number; previous: string | number } | undefined;
    el.addEventListener("vu-change", (event) => {
      detail = (event as CustomEvent).detail;
    });

    const input = el.shadowRoot?.querySelector('[part="input"]') as HTMLInputElement;
    input.value = "world";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await elementUpdated(el);

    expect(el.value).toBe("world");
    expect(detail?.value).toBe("world");
    expect(detail?.previous).toBe("hello");
  });

  it("reflects required, disabled, and field chrome", async () => {
    const el = await fixture<VuInput>(
      html`<vu-input
        required
        disabled
        variant="outline"
        tone="subtle"
        size="sm"
        radius="full"
        block
      ></vu-input>`,
    );
    await elementUpdated(el);
    expect(el.required).toBe(true);
    expect(el.disabled).toBe(true);
    expect(el.getAttribute("variant")).toBe("outline");
    expect(el.getAttribute("tone")).toBe("subtle");
    expect(el.getAttribute("size")).toBe("sm");
    expect(el.getAttribute("radius")).toBe("full");
    expect(el.hasAttribute("block")).toBe(true);
  });

  it("clear emits vu-clear", async () => {
    const el = await fixture<VuInput>(html`<vu-input clearable .value=${"x"}></vu-input>`);
    await elementUpdated(el);

    let cleared = false;
    el.addEventListener("vu-clear", () => {
      cleared = true;
    });

    el.clear();
    await elementUpdated(el);
    expect(el.value).toBe("");
    expect(cleared).toBe(true);
  });

  it("uses stable internal ids without Math.random", async () => {
    const a = await fixture<VuInput>(html`<vu-input></vu-input>`);
    const b = await fixture<VuInput>(html`<vu-input></vu-input>`);
    await elementUpdated(a);
    await elementUpdated(b);
    const idA = a.shadowRoot?.querySelector('[part="input"]')?.id ?? "";
    const idB = b.shadowRoot?.querySelector('[part="input"]')?.id ?? "";
    expect(idA).toMatch(/^vu-inp-\d+$/);
    expect(idB).toMatch(/^vu-inp-\d+$/);
    expect(idA).not.toBe(idB);
  });

  it("exposes aria-disabled when disabled", async () => {
    const el = await fixture<VuInput>(html`<vu-input disabled label="Email"></vu-input>`);
    await elementUpdated(el);
    expect(el.getAttribute("aria-disabled")).toBe("true");
    el.disabled = false;
    await elementUpdated(el);
    expect(el.hasAttribute("aria-disabled")).toBe(false);
  });

  it("keeps label slot mounted when empty", async () => {
    const el = await fixture<VuInput>(html`<vu-input></vu-input>`);
    await elementUpdated(el);
    const label = el.shadowRoot?.querySelector('[part="label"]');
    expect(label).toBeTruthy();
    expect(label?.getAttribute("aria-hidden")).toBe("true");
  });

  it("includes CSS preference media queries", async () => {
    const el = await fixture<VuInput>(html`<vu-input></vu-input>`);
    await elementUpdated(el);
    const cssText = el.shadowRoot?.querySelector("style")?.textContent ?? "";
    expect(cssText).toContain("prefers-reduced-motion: reduce");
    expect(cssText).toContain("prefers-contrast: more");
    expect(cssText).toContain("prefers-reduced-transparency: reduce");
    expect(cssText).toContain("forced-colors: active");
  });

  describe("accessibility", () => {
    it("with label", async () => {
      const el = await fixture<VuInput>(
        html`<vu-input label="Email" placeholder="you@example.com"></vu-input>`,
      );
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("disabled", async () => {
      const el = await fixture<VuInput>(html`<vu-input disabled label="Email"></vu-input>`);
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });
  });
});
