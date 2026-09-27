/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7 N/A 8✓ 9✓ 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuRadio } from "../radio.js";

describe("vu-radio", () => {
  it("is defined", () => {
    expect(customElements.get("vu-radio")).toBe(VuRadio);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuRadio>(html`<vu-radio></vu-radio>`);
    await elementUpdated(el);
    expect(el.label).toBe("");
    expect(el.hint).toBe("");
    expect(el.value).toBe("");
    expect(el.defaultChecked).toBe(false);
    expect(el.showErrors).toBe(false);
    expect(el.checked).toBe(false);
    expect(el.size).toBe("md");
    expect(el.variant).toBe("default");
    expect(el.getAttribute("variant")).toBe("default");
    expect(el.color).toBe("primary");
    expect(el.tone).toBe("normal");
    expect(el.getAttribute("tone")).toBe("normal");
    const input = el.shadowRoot?.querySelector('input[type="radio"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });

  it("accepts label, value, checked", async () => {
    const el = await fixture<VuRadio>(
      html`<vu-radio label="Option A" value="a" checked></vu-radio>`,
    );
    await elementUpdated(el);
    expect(el.label).toBe("Option A");
    expect(el.value).toBe("a");
    expect(el.checked).toBe(true);
    expect(el.shadowRoot?.querySelector(".ring")).toBeTruthy();
  });

  it("reflects tone on the idle ring", async () => {
    const el = await fixture<VuRadio>(html`<vu-radio tone="subtle" label="A"></vu-radio>`);
    await elementUpdated(el);
    expect(el.tone).toBe("subtle");
    expect(el.getAttribute("tone")).toBe("subtle");
  });

  it("exposes input and ring parts", async () => {
    const el = await fixture<VuRadio>(html`<vu-radio label="A"></vu-radio>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="input"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector(".ring")).toBeTruthy();
  });

  it("renders slotted label", async () => {
    const el = await fixture<VuRadio>(html`
      <vu-radio value="z" name="n">
        <span slot="label">Slot <strong>label</strong></span>
      </vu-radio>
    `);
    await elementUpdated(el);
    const slot = el.shadowRoot?.querySelector('slot[name="label"]') as HTMLSlotElement | null;
    const text = slot
      ?.assignedNodes({ flatten: true })
      .map((n) => (n as Node).textContent ?? "")
      .join("");
    expect(text).toContain("Slot");
  });

  it("dispatches vu-change when selected", async () => {
    const el = await fixture<VuRadio>(html`<vu-radio value="a" name="grp"></vu-radio>`);
    await elementUpdated(el);

    let detail: { checked: boolean; value?: string } | undefined;
    el.addEventListener("vu-change", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);

    const input = el.shadowRoot?.querySelector('input[type="radio"]') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await elementUpdated(el);

    expect(detail?.checked).toBe(true);
    expect(detail?.value).toBe("a");
    expect(el.checked).toBe(true);
  });

  it("check() selects the option", async () => {
    const el = await fixture<VuRadio>(html`<vu-radio value="a" name="g"></vu-radio>`);
    await elementUpdated(el);
    el.check();
    await elementUpdated(el);
    expect(el.checked).toBe(true);
  });

  it("does not toggle when disabled", async () => {
    const el = await fixture<VuRadio>(html`<vu-radio value="a" disabled></vu-radio>`);
    await elementUpdated(el);
    el.check();
    await elementUpdated(el);
    expect(el.checked).toBe(false);
  });
});

describe("keyboard", () => {
  it("Space selects the radio", async () => {
    const el = await fixture<VuRadio>(html`<vu-radio value="a"></vu-radio>`);
    await elementUpdated(el);
    const input = el.shadowRoot?.querySelector('[part="input"]') as HTMLInputElement;
    input?.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    await elementUpdated(el);
    expect(el.checked).toBe(true);
  });
});

describe("accessibility", () => {
  it("default radio passes axe", async () => {
    const el = await fixture(html`<vu-radio label="Option A"></vu-radio>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("disabled radio passes axe", async () => {
    const el = await fixture(html`<vu-radio label="Option A" disabled></vu-radio>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("invalid radio passes axe", async () => {
    const el = await fixture(html` <vu-radio label="Plan" invalid showerrors></vu-radio> `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
