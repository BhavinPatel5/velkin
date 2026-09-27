/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5 N/A 6✓ 7 N/A 8✓ 9✓ 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuCheckbox } from "../checkbox.js";

describe("vu-checkbox", () => {
  it("is defined", () => {
    expect(customElements.get("vu-checkbox")).toBe(VuCheckbox);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuCheckbox>(html`<vu-checkbox></vu-checkbox>`);
    await elementUpdated(el);
    expect(el.label).toBe("");
    expect(el.hint).toBe("");
    expect(el.value).toBe("");
    expect(el.defaultChecked).toBe(false);
    expect(el.showErrors).toBe(false);
    expect(el.size).toBe("md");
    expect(el.variant).toBe("default");
    expect(el.getAttribute("variant")).toBe("default");
    expect(el.color).toBe("primary");
    expect(el.tone).toBe("normal");
    expect(el.getAttribute("tone")).toBe("normal");
    expect(el.radius).toBe("md");
    expect(el.getAttribute("radius")).not.toBe("full");
    const input = el.shadowRoot?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });

  it("renders label when provided", async () => {
    const el = await fixture<VuCheckbox>(html`<vu-checkbox label="Accept terms"></vu-checkbox>`);
    await elementUpdated(el);
    expect(el.label).toBe("Accept terms");
    const labelEl = el.shadowRoot?.querySelector('[part="label"]');
    expect(labelEl?.textContent?.trim()).toBe("Accept terms");
  });

  it("accepts defaultChecked property", async () => {
    const el = await fixture<VuCheckbox>(html`<vu-checkbox .defaultChecked=${true}></vu-checkbox>`);
    await elementUpdated(el);
    expect(el.defaultChecked).toBe(true);
    expect(el.shadowRoot?.querySelector('input[type="checkbox"]')).toBeTruthy();
  });

  it("exposes input part", async () => {
    const el = await fixture<VuCheckbox>(html`<vu-checkbox></vu-checkbox>`);
    await elementUpdated(el);
    const input = el.shadowRoot?.querySelector('[part="input"]');
    expect(input).toBeTruthy();
    expect((input as HTMLInputElement)?.type).toBe("checkbox");
  });

  it("exposes box part for visual checkbox", async () => {
    const el = await fixture<VuCheckbox>(html`<vu-checkbox></vu-checkbox>`);
    await elementUpdated(el);
    const box = el.shadowRoot?.querySelector('[part="box"]');
    expect(box).toBeTruthy();
  });

  it("reflects checked when set programmatically", async () => {
    const el = await fixture<VuCheckbox>(html`<vu-checkbox></vu-checkbox>`);
    await elementUpdated(el);
    expect(el.checked).toBe(false);
    el.checked = true;
    await elementUpdated(el);
    expect(el.checked).toBe(true);
    const input = el.shadowRoot?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input?.checked).toBe(true);
  });

  it("reflects indeterminate when set", async () => {
    const el = await fixture<VuCheckbox>(html`<vu-checkbox></vu-checkbox>`);
    await elementUpdated(el);
    el.indeterminate = true;
    await elementUpdated(el);
    expect(el.indeterminate).toBe(true);
  });

  it("accepts value for form submission", async () => {
    const el = await fixture<VuCheckbox>(
      html`<vu-checkbox value="yes" name="agree"></vu-checkbox>`,
    );
    await elementUpdated(el);
    expect(el.value).toBe("yes");
  });

  it("reflects full radius when set and omits attribute when unset", async () => {
    const unset = await fixture<VuCheckbox>(html`<vu-checkbox label="A"></vu-checkbox>`);
    await elementUpdated(unset);
    expect(unset.radius).toBe("md");
    expect(unset.hasAttribute("radius")).toBe(true);

    const pillEl = await fixture<VuCheckbox>(
      html`<vu-checkbox radius="full" label="B"></vu-checkbox>`,
    );
    await elementUpdated(pillEl);
    expect(pillEl.radius).toBe("full");
    expect(pillEl.getAttribute("radius")).toBe("full");
  });

  it("reflects size, variant, and tone attributes", async () => {
    const el = await fixture<VuCheckbox>(
      html`<vu-checkbox size="sm" variant="outline" tone="subtle" label="S"></vu-checkbox>`,
    );
    await elementUpdated(el);
    expect(el.size).toBe("sm");
    expect(el.variant).toBe("outline");
    expect(el.tone).toBe("subtle");
    expect(el.getAttribute("size")).toBe("sm");
    expect(el.getAttribute("variant")).toBe("outline");
    expect(el.getAttribute("tone")).toBe("subtle");
  });

  it("reflects soft variant attribute", async () => {
    const el = await fixture<VuCheckbox>(
      html`<vu-checkbox variant="soft" label="S"></vu-checkbox>`,
    );
    await elementUpdated(el);
    expect(el.variant).toBe("soft");
    expect(el.getAttribute("variant")).toBe("soft");
  });

  it("exposes text part for string label when label slot empty", async () => {
    const el = await fixture<VuCheckbox>(html`<vu-checkbox label="Only label"></vu-checkbox>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="text"]')?.textContent?.trim()).toBe("Only label");
  });

  it("renders slotted label and hides string label part", async () => {
    const el = await fixture<VuCheckbox>(html`
      <vu-checkbox label="Ignored">
        <span slot="label">Slotted <em>rich</em> label</span>
      </vu-checkbox>
    `);
    await elementUpdated(el);
    const slot = el.shadowRoot?.querySelector('slot[name="label"]') as HTMLSlotElement | undefined;
    const nodes = slot?.assignedNodes({ flatten: true }) ?? [];
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes.map((n) => (n as Node).textContent ?? "").join("")).toContain("Slotted");
  });

  it("fires vu-change when toggled", async () => {
    const el = await fixture<VuCheckbox>(
      html`<vu-checkbox label="Test" value="yes"></vu-checkbox>`,
    );
    await elementUpdated(el);
    let nc: CustomEvent | null = null;
    el.addEventListener("vu-change", (e) => {
      nc = e as CustomEvent;
    });
    const input = el.shadowRoot?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    input?.click();
    await elementUpdated(el);
    expect(nc).not.toBe(null);
    expect((nc as CustomEvent).detail).toMatchObject({ checked: true, value: "yes" });
  });

  it("vu-change detail mirrors checked when value prop empty", async () => {
    const el = await fixture<VuCheckbox>(html`<vu-checkbox label="Test"></vu-checkbox>`);
    await elementUpdated(el);
    let detail: { value?: unknown; checked?: boolean } = {};
    el.addEventListener("vu-change", ((e: CustomEvent) => {
      detail = (e as CustomEvent).detail ?? {};
    }) as EventListener);
    const input = el.shadowRoot?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    input?.click();
    await elementUpdated(el);
    expect(detail.checked).toBe(true);
    expect(detail.value).toBe(true);
  });

  it("respects disabled", async () => {
    const el = await fixture<VuCheckbox>(html`<vu-checkbox disabled></vu-checkbox>`);
    await elementUpdated(el);
    expect(el.disabled).toBe(true);
    const input = el.shadowRoot?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input?.disabled).toBe(true);
  });

  it("has field and wrapper parts", async () => {
    const el = await fixture<VuCheckbox>(html`<vu-checkbox></vu-checkbox>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="field"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="wrapper"]')).toBeTruthy();
  });

  it("exposes checkmark and indeterminate-line parts", async () => {
    const el = await fixture<VuCheckbox>(html`<vu-checkbox></vu-checkbox>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="checkmark"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="indeterminate-line"]')).toBeTruthy();
  });

  it("reflects readonly and prevents toggle", async () => {
    const el = await fixture<VuCheckbox>(
      html`<vu-checkbox readonly label="Read only"></vu-checkbox>`,
    );
    await elementUpdated(el);
    expect(el.readonly).toBe(true);
    const input = el.shadowRoot?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input?.disabled).toBe(true);
  });

  it("reflects color intent like vu-button tokens", async () => {
    const el = await fixture<VuCheckbox>(html`<vu-checkbox color="primary"></vu-checkbox>`);
    await elementUpdated(el);
    expect(el.color).toBe("primary");
    expect(el.getAttribute("color")).toBe("primary");
  });

  it("reflects all color tokens", async () => {
    for (const color of ["default", "primary", "success", "warning", "danger"] as const) {
      const el = await fixture<VuCheckbox>(
        html`<vu-checkbox color=${color} label="x"></vu-checkbox>`,
      );
      await elementUpdated(el);
      expect(el.getAttribute("color")).toBe(color);
    }
  });

  it("forwards host id to the internal input", async () => {
    const el = await fixture<VuCheckbox>(
      html`<vu-checkbox id="terms" label="Agree"></vu-checkbox>`,
    );
    await elementUpdated(el);
    const input = el.shadowRoot?.querySelector('[part="input"]') as HTMLInputElement;
    expect(input.id).toBe("terms-input");
  });

  it("exposes aria-checked=mixed when indeterminate", async () => {
    const el = await fixture<VuCheckbox>(html`<vu-checkbox .indeterminate=${true}></vu-checkbox>`);
    await elementUpdated(el);
    const input = el.shadowRoot?.querySelector('[part="input"]') as HTMLInputElement;
    expect(input.getAttribute("aria-checked")).toBe("mixed");
  });

  it("updates accessible name when a label slot is added at runtime", async () => {
    const el = await fixture<VuCheckbox>(html`<vu-checkbox arialabel="Select row"></vu-checkbox>`);
    await elementUpdated(el);
    const input = () => el.shadowRoot?.querySelector('[part="input"]') as HTMLInputElement;
    expect(input().getAttribute("aria-label")).toBe("Select row");

    const label = document.createElement("span");
    label.slot = "label";
    label.textContent = "Accept terms";
    el.appendChild(label);
    await elementUpdated(el);

    expect(input().hasAttribute("aria-label")).toBe(false);
  });

  it("required and showErrors when invalid shows error with id and aria wiring", async () => {
    const el = await fixture<VuCheckbox>(
      html`<vu-checkbox required showerrors label="Required"></vu-checkbox>`,
    );
    await elementUpdated(el);
    expect(el.required).toBe(true);
    const input = el.shadowRoot?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    input?.focus();
    input?.blur();
    await elementUpdated(el);
    expect(el.validationActive).toBe(true);
    const err = el.shadowRoot?.querySelector('[part="error-message"]') as HTMLElement | null;
    expect(err?.id).toBeTruthy();
    expect(err?.textContent?.trim().length).toBeGreaterThan(0);
    const desc = input.getAttribute("aria-describedby");
    expect(desc?.split(/\s+/)).toContain(err?.id);
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("reset restores defaultChecked and fires vu-clear", async () => {
    const el = await fixture<VuCheckbox>(
      html`<vu-checkbox .defaultChecked=${true} value="x"></vu-checkbox>`,
    );
    await elementUpdated(el);
    el.checked = true;
    await elementUpdated(el);
    let cleared: { value?: unknown; checked?: boolean } = {};
    el.addEventListener("vu-clear", ((e: CustomEvent) => {
      cleared = (e as CustomEvent).detail ?? {};
    }) as EventListener);
    el.reset();
    await elementUpdated(el);
    expect(el.checked).toBe(true);
    expect(cleared.value).toBeDefined();
  });

  it("indeterminate clears checked when set", async () => {
    const el = await fixture<VuCheckbox>(html`<vu-checkbox></vu-checkbox>`);
    await elementUpdated(el);
    el.checked = true;
    await elementUpdated(el);
    el.indeterminate = true;
    await elementUpdated(el);
    expect(el.indeterminate).toBe(true);
    expect(el.checked).toBe(false);
  });

  it("checked clears indeterminate when set", async () => {
    const el = await fixture<VuCheckbox>(html`<vu-checkbox></vu-checkbox>`);
    await elementUpdated(el);
    el.indeterminate = true;
    await elementUpdated(el);
    el.checked = true;
    await elementUpdated(el);
    expect(el.checked).toBe(true);
    expect(el.indeterminate).toBe(false);
  });

  it("accepts name attribute for form", async () => {
    const el = await fixture<VuCheckbox>(
      html`<vu-checkbox name="agree" value="yes"></vu-checkbox>`,
    );
    await elementUpdated(el);
    expect(el.name).toBe("agree");
    const input = el.shadowRoot?.querySelector('input[type="checkbox"]');
    expect(input?.getAttribute("name")).toBeFalsy();
  });

  it("renders string hint with part and aria-describedby", async () => {
    const el = await fixture<VuCheckbox>(
      html`<vu-checkbox label="Opt in" hint="We never sell your email."></vu-checkbox>`,
    );
    await elementUpdated(el);
    const hint = el.shadowRoot?.querySelector('[part="hint"]') as HTMLElement | null;
    expect(hint?.textContent?.trim()).toBe("We never sell your email.");
    const input = el.shadowRoot?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input.getAttribute("aria-describedby")?.split(/\s+/)).toContain(hint?.id);
  });

  it("renders slotted hint and wires aria-describedby", async () => {
    const el = await fixture<VuCheckbox>(html`
      <vu-checkbox label="x">
        <span slot="hint">Slotted helper</span>
      </vu-checkbox>
    `);
    await elementUpdated(el);
    const hint = el.shadowRoot?.querySelector('[part="hint"]') as HTMLElement | null;
    const hintSlot = hint?.querySelector('slot[name="hint"]') as HTMLSlotElement | undefined;
    const flat = hintSlot
      ?.assignedNodes({ flatten: true })
      .map((n) => (n as Node).textContent ?? "")
      .join("");
    expect(flat.trim()).toBe("Slotted helper");
    const input = el.shadowRoot?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input.getAttribute("aria-describedby")?.split(/\s+/)).toContain(hint?.id);
  });

  it("aria-describedby lists hint then error when both visible", async () => {
    const el = await fixture<VuCheckbox>(html`
      <vu-checkbox
        required
        showerrors
        label="Agree"
        hint="You must accept to continue."
      ></vu-checkbox>
    `);
    await elementUpdated(el);
    const input = el.shadowRoot?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const hint = el.shadowRoot?.querySelector('[part="hint"]') as HTMLElement | null;
    expect(hint).toBeTruthy();
    input?.focus();
    input?.blur();
    await elementUpdated(el);
    const err = el.shadowRoot?.querySelector('[part="error-message"]') as HTMLElement | null;
    expect(err?.id).toBeTruthy();
    expect(input.getAttribute("aria-describedby")).toBe(`${hint?.id} ${err?.id}`);
  });

  it("box has box--checked in part when checked", async () => {
    const el = await fixture<VuCheckbox>(html`<vu-checkbox></vu-checkbox>`);
    await elementUpdated(el);
    el.checked = true;
    await elementUpdated(el);
    const box = el.shadowRoot?.querySelector('[part~="box"]');
    expect(box?.getAttribute("part")).toContain("box--checked");
  });

  it("sets aria-label on input when no label or label slot", async () => {
    const el = await fixture<VuCheckbox>(html`<vu-checkbox arialabel="Select row"></vu-checkbox>`);
    await elementUpdated(el);
    const input = el.shadowRoot?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input.getAttribute("aria-label")).toBe("Select row");
  });

  it("indeterminateClick uncheck clears to unchecked on first click", async () => {
    const el = await fixture<VuCheckbox>(html`
      <vu-checkbox label="All" indeterminateclick="uncheck" .indeterminate=${true}></vu-checkbox>
    `);
    await elementUpdated(el);
    let detail: { checked?: boolean } = {};
    el.addEventListener("vu-change", ((e: CustomEvent) => {
      detail = (e as CustomEvent).detail ?? {};
    }) as EventListener);
    const input = el.shadowRoot?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    input?.click();
    await elementUpdated(el);
    expect(el.checked).toBe(false);
    expect(el.indeterminate).toBe(false);
    expect(detail.checked).toBe(false);
  });

  it("renders multiple default validation lines", async () => {
    const el = await fixture<VuCheckbox>(html`<vu-checkbox label="x"></vu-checkbox>`);
    await elementUpdated(el);
    el.showErrors = true;
    el.validationActive = true;
    el.validationErrors = ["First issue.", "Second issue."];
    await elementUpdated(el);
    const lines = el.shadowRoot?.querySelectorAll('[part="error-line"]');
    expect(lines.length).toBe(2);
  });

  it("slot error replaces default validation lines when assigned", async () => {
    const el = await fixture<VuCheckbox>(html`
      <vu-checkbox label="x" showerrors>
        <em slot="error">Custom error</em>
      </vu-checkbox>
    `);
    await elementUpdated(el);
    el.validationActive = true;
    el.validationErrors = ["Server message"];
    await elementUpdated(el);
    const slot = el.shadowRoot?.querySelector('slot[name="error"]') as HTMLSlotElement | null;
    const assigned = slot?.assignedNodes({ flatten: true }) ?? [];
    expect(assigned.length).toBeGreaterThan(0);
    expect(assigned.map((n) => (n as HTMLElement).textContent ?? "").join("")).toContain("Custom");
  });

  it("reflects compact on host", async () => {
    const el = await fixture<VuCheckbox>(html`<vu-checkbox compact label="c"></vu-checkbox>`);
    await elementUpdated(el);
    expect(el.compact).toBe(true);
    expect(el.hasAttribute("compact")).toBe(true);
  });

  it("hint and error regions expose aria-live polite", async () => {
    const el = await fixture<VuCheckbox>(
      html`<vu-checkbox label="x" hint="h" required showerrors></vu-checkbox>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="hint"]')?.getAttribute("aria-live")).toBe("polite");
    const input = el.shadowRoot?.querySelector('input[type="checkbox"]') as HTMLInputElement;
    input?.focus();
    input?.blur();
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="error-message"]')?.getAttribute("aria-live")).toBe(
      "polite",
    );
  });
});

describe("accessibility", () => {
  it("default checkbox passes axe", async () => {
    const el = await fixture(html`<vu-checkbox label="Accept terms"></vu-checkbox>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("disabled checkbox passes axe", async () => {
    const el = await fixture(html`<vu-checkbox label="Accept" disabled></vu-checkbox>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("invalid checkbox passes axe", async () => {
    const el = await fixture(html` <vu-checkbox label="Email" invalid showerrors></vu-checkbox> `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("pill soft danger variant passes axe", async () => {
    const el = await fixture(html`
      <vu-checkbox label="Subscribe" variant="soft" color="danger" radius="full"></vu-checkbox>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  describe("keyboard", () => {
    it("Space toggles checked state", async () => {
      const el = await fixture<VuCheckbox>(html`<vu-checkbox></vu-checkbox>`);
      await elementUpdated(el);
      const input = el.shadowRoot?.querySelector('[part="input"]') as HTMLInputElement;
      input?.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
      await elementUpdated(el);
      expect(el.checked).toBe(true);
    });

    it("Enter toggles checked state", async () => {
      const el = await fixture<VuCheckbox>(html`<vu-checkbox></vu-checkbox>`);
      await elementUpdated(el);
      const input = el.shadowRoot?.querySelector('[part="input"]') as HTMLInputElement;
      input?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      await elementUpdated(el);
      expect(el.checked).toBe(true);
    });
  });
});
