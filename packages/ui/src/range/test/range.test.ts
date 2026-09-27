/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7 N/A 8✓ 9✓ 10 N/A — a11y: default, disabled, readonly, invalid, variants, RTL
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuRange } from "../range.js";

describe("vu-range", () => {
  it("is defined", () => {
    expect(customElements.get("vu-range")).toBe(VuRange);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuRange>(html`<vu-range></vu-range>`);
    await elementUpdated(el);
    expect(el.from).toBe(20);
    expect(el.to).toBe(80);
    expect(el.min).toBe(0);
    expect(el.max).toBe(100);
    expect(el.step).toBe(10);
    expect(el.showValue).toBe(true);
    expect(el.commitOnly).toBe(false);
    expect(el.variant).toBe("default");
    expect(el.size).toBe("md");
    expect(el.shadowRoot?.querySelectorAll('[part="thumb-from"], [part="thumb-to"]').length).toBe(
      2,
    );
  });

  it("accepts from, to, min, max, step", async () => {
    const el = await fixture<VuRange>(
      html`<vu-range .from=${10} .to=${90} .min=${0} .max=${100} .step=${5}></vu-range>`,
    );
    await elementUpdated(el);
    expect(el.from).toBe(10);
    expect(el.to).toBe(90);
    expect(el.step).toBe(5);
  });

  it("accepts label, prefix, suffix, showValue", async () => {
    const el = await fixture<VuRange>(
      html`<vu-range label="Budget" prefix="$" suffix="k" .showValue=${false}></vu-range>`,
    );
    await elementUpdated(el);
    expect(el.label).toBe("Budget");
    expect(el.prefix).toBe("$");
    expect(el.suffix).toBe("k");
    expect(el.showValue).toBe(false);
    expect(el.shadowRoot?.querySelector('[part="value"]')).toBeNull();
  });

  it("renders label and formatted value summary", async () => {
    const el = await fixture<VuRange>(
      html`<vu-range label="Range" prefix="$" .from=${20} .to=${80}></vu-range>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="text"]')?.textContent?.trim()).toBe("Range");
    expect(el.shadowRoot?.querySelector('[part="value"]')?.textContent).toContain("20");
    expect(el.shadowRoot?.querySelector('[part="value"]')?.textContent).toContain("80");
  });

  it("dispatches vu-change on live thumb input", async () => {
    const el = await fixture<VuRange>(
      html`<vu-range .from=${20} .to=${80} .step=${10}></vu-range>`,
    );
    await elementUpdated(el);

    let detail: { from?: number; to?: number } = {};
    el.addEventListener("vu-change", ((e: CustomEvent) => {
      detail = e.detail ?? {};
    }) as EventListener);

    const fromThumb = el.shadowRoot?.querySelector('[part="thumb-from"]') as HTMLInputElement;
    fromThumb.value = "30";
    fromThumb.dispatchEvent(new Event("input", { bubbles: true }));
    await elementUpdated(el);

    expect(detail.from).toBe(30);
    expect(detail.to).toBe(80);
  });

  it("commitOnly emits vu-change on change only", async () => {
    const el = await fixture<VuRange>(
      html`<vu-range commitonly .from=${20} .to=${80} .step=${10}></vu-range>`,
    );
    await elementUpdated(el);

    let count = 0;
    el.addEventListener("vu-change", () => {
      count++;
    });

    const fromThumb = el.shadowRoot?.querySelector('[part="thumb-from"]') as HTMLInputElement;
    fromThumb.value = "30";
    fromThumb.dispatchEvent(new Event("input", { bubbles: true }));
    await elementUpdated(el);
    expect(count).toBe(0);

    fromThumb.dispatchEvent(new Event("change", { bubbles: true }));
    await elementUpdated(el);
    expect(count).toBe(1);
    expect(el.from).toBe(30);
  });

  it("setRange normalizes and emits vu-change", async () => {
    const el = await fixture<VuRange>(html`<vu-range></vu-range>`);
    await elementUpdated(el);

    let detail: { from?: number; to?: number } = {};
    el.addEventListener("vu-change", ((e: CustomEvent) => {
      detail = e.detail ?? {};
    }) as EventListener);

    el.setRange(25, 75);
    await elementUpdated(el);
    expect(el.from).toBe(30);
    expect(el.to).toBe(80);
    expect(detail.from).toBe(30);
    expect(detail.to).toBe(80);

    detail = {};
    el.setRange(30, 70);
    await elementUpdated(el);
    expect(el.from).toBe(30);
    expect(el.to).toBe(70);
    expect(detail.from).toBe(30);
    expect(detail.to).toBe(70);
  });

  it("reset restores defaultValue and fires vu-clear", async () => {
    const el = await fixture<VuRange>(html`<vu-range defaultvalue="20,80"></vu-range>`);
    await elementUpdated(el);
    el.setRange(40, 60);
    await elementUpdated(el);

    let cleared: { from?: number; to?: number } = {};
    el.addEventListener("vu-clear", ((e: CustomEvent) => {
      cleared = e.detail ?? {};
    }) as EventListener);

    el.reset();
    await elementUpdated(el);
    expect(el.from).toBe(20);
    expect(el.to).toBe(80);
    expect(cleared.from).toBe(20);
    expect(cleared.to).toBe(80);
  });

  it("submits serialized range under name", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <vu-range name="budget" .from=${30} .to=${70}></vu-range>
      </form>
    `);
    const el = form.querySelector("vu-range") as VuRange;
    await elementUpdated(el);
    expect(new FormData(form).get("budget")).toBe("30,70");
    expect(el.form).toBe(form);
  });

  it("omits value from FormData when disabled", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <vu-range name="budget" .from=${30} .to=${70} disabled></vu-range>
      </form>
    `);
    await elementUpdated(form.querySelector("vu-range") as VuRange);
    expect(new FormData(form).get("budget")).toBeNull();
  });

  it("form.reset() restores defaultValue", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <vu-range name="budget" defaultvalue="20,80"></vu-range>
      </form>
    `);
    const el = form.querySelector("vu-range") as VuRange;
    await elementUpdated(el);
    el.setRange(40, 60);
    await elementUpdated(el);
    form.reset();
    await elementUpdated(el);
    expect(el.from).toBe(20);
    expect(el.to).toBe(80);
  });

  it("reflects variant, size, and block", async () => {
    const el = await fixture<VuRange>(
      html`<vu-range variant="outline" size="sm" block></vu-range>`,
    );
    await elementUpdated(el);
    expect(el.variant).toBe("outline");
    expect(el.size).toBe("sm");
    expect(el.block).toBe(true);
    expect(el.getAttribute("variant")).toBe("outline");
  });

  it("renders chunky full radius track and in-track thumbs", async () => {
    const el = await fixture<VuRange>(html`<vu-range variant="default"></vu-range>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="control"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector(".range-thumb-visual--from")).toBeTruthy();
    expect(el.shadowRoot?.querySelector(".range-thumb-visual--to")).toBeTruthy();
    expect(el.shadowRoot?.querySelector(".range-thumb-input--from")).toBeTruthy();
    expect(el.shadowRoot?.querySelector(".range-thumb-input--to")).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="highlight"]')).toBeTruthy();
  });

  it("renders variant chrome on outline and underline shells", async () => {
    const outline = await fixture<VuRange>(html`<vu-range variant="outline"></vu-range>`);
    await elementUpdated(outline);
    expect(outline.getAttribute("variant")).toBe("outline");
    expect(outline.shadowRoot?.querySelector('[part="control"]')).toBeTruthy();

    const underline = await fixture<VuRange>(html`<vu-range variant="underline"></vu-range>`);
    await elementUpdated(underline);
    expect(underline.getAttribute("variant")).toBe("underline");
    expect(underline.shadowRoot?.querySelector(".range-thumb-visual--from")).toBeTruthy();
    expect(underline.shadowRoot?.querySelector('[part="highlight"]')).toBeTruthy();
  });

  it("renders slotted label", async () => {
    const el = await fixture<VuRange>(html`
      <vu-range label="Ignored">
        <span slot="label">Slotted <em>label</em></span>
      </vu-range>
    `);
    await elementUpdated(el);
    const slot = el.shadowRoot?.querySelector('slot[name="label"]') as HTMLSlotElement | undefined;
    const nodes = slot?.assignedNodes({ flatten: true }) ?? [];
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes.map((n) => (n as Node).textContent ?? "").join("")).toContain("Slotted");
  });

  it("renders string hint with part and aria wiring", async () => {
    const el = await fixture<VuRange>(
      html`<vu-range label="Budget" hint="Pick a min and max."></vu-range>`,
    );
    await elementUpdated(el);
    const hint = el.shadowRoot?.querySelector('[part="hint"]') as HTMLElement | null;
    expect(hint?.textContent?.trim()).toBe("Pick a min and max.");
    expect(
      el.shadowRoot?.querySelector('[part="control"]')?.getAttribute("aria-describedby"),
    ).toContain(hint?.id ?? "");
  });

  it("respects disabled on thumbs", async () => {
    const el = await fixture<VuRange>(html`<vu-range disabled></vu-range>`);
    await elementUpdated(el);
    const thumbs = el.shadowRoot?.querySelectorAll<HTMLInputElement>(
      '[part="thumb-from"], [part="thumb-to"]',
    );
    thumbs?.forEach((thumb) => expect(thumb.disabled).toBe(true));
  });

  it("respects readonly on thumbs", async () => {
    const el = await fixture<VuRange>(html`<vu-range readonly></vu-range>`);
    await elementUpdated(el);
    const thumb = el.shadowRoot?.querySelector('[part="thumb-from"]') as HTMLInputElement;
    expect(thumb.disabled).toBe(true);
  });

  it("validateInput reports invalid range", async () => {
    const el = await fixture<VuRange>(html`<vu-range showerrors .from=${80} .to=${20}></vu-range>`);
    await elementUpdated(el);
    el.validationActive = true;
    const ok = el.validateInput();
    await elementUpdated(el);
    expect(ok).toBe(false);
    expect(el.validationErrors[0]).toContain("Lower bound");
    expect(el.invalid).toBe(true);
  });

  it("dispatches vu-invalid when validation runs", async () => {
    const el = await fixture<VuRange>(html`<vu-range showerrors .from=${80} .to=${20}></vu-range>`);
    await elementUpdated(el);
    let errors: string[] = [];
    el.addEventListener("vu-invalid", ((e: CustomEvent) => {
      errors = (e.detail as { errors?: string[] }).errors ?? [];
    }) as EventListener);
    el.validationActive = true;
    el.validateInput();
    await elementUpdated(el);
    expect(errors.length).toBeGreaterThan(0);
  });

  it("sets aria-label on track when no label", async () => {
    const el = await fixture<VuRange>(html`<vu-range arialabel="Price range"></vu-range>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="control"]')?.getAttribute("aria-label")).toBe(
      "Price range",
    );
  });

  it("renders highlight track segment", async () => {
    const el = await fixture<VuRange>(
      html`<vu-range .from=${20} .to=${80} .min=${0} .max=${100}></vu-range>`,
    );
    await elementUpdated(el);
    expect(el.style.getPropertyValue("--range-from-pct")).toBe("20%");
    expect(el.style.getPropertyValue("--range-highlight-size")).toBe("60%");
  });
});

describe("accessibility", () => {
  it("default range passes axe", async () => {
    const el = await fixture(html`<vu-range label="Budget"></vu-range>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("disabled range passes axe", async () => {
    const el = await fixture(html`<vu-range label="Budget" disabled></vu-range>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("readonly range passes axe", async () => {
    const el = await fixture(html`<vu-range label="Budget" readonly></vu-range>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("outline variant passes axe", async () => {
    const el = await fixture(html`<vu-range label="Budget" variant="outline"></vu-range>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("default in RTL document context", async () => {
    const wrap = await fixture(html`
      <div dir="rtl" lang="en">
        <vu-range label="Budget"></vu-range>
      </div>
    `);
    await elementUpdated(wrap);
    const el = wrap.querySelector("vu-range") as VuRange;
    await expectA11y(el).to.be.accessible();
  });

  describe("keyboard", () => {
    it("exposes keyboard-focusable native range thumbs", async () => {
      const el = await fixture<VuRange>(html`<vu-range .from=${20} .to=${80}></vu-range>`);
      await elementUpdated(el);
      const from = el.shadowRoot?.querySelector('[part="thumb-from"]') as HTMLInputElement;
      const to = el.shadowRoot?.querySelector('[part="thumb-to"]') as HTMLInputElement;
      expect(from?.type).toBe("range");
      expect(to?.type).toBe("range");
      from?.focus();
      expect(el.shadowRoot?.activeElement).toBe(from);
      to?.focus();
      expect(el.shadowRoot?.activeElement).toBe(to);
    });
  });
});
