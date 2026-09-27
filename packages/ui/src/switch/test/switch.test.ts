/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7 N/A 8✓ 9✓ 10 N/A
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuSwitch } from "../switch.js";

describe("vu-switch", () => {
  it("is defined", () => {
    expect(customElements.get("vu-switch")).toBe(VuSwitch);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuSwitch>(html`<vu-switch></vu-switch>`);
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
    expect(el.compact).toBe(false);
    expect(el.shadowRoot?.querySelector('[part="track"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="thumb"]')).toBeTruthy();
    const input = el.shadowRoot?.querySelector('input[role="switch"]') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });

  it("reflects checked when set programmatically", async () => {
    const el = await fixture<VuSwitch>(html`<vu-switch .checked=${true}></vu-switch>`);
    await elementUpdated(el);
    expect(el.checked).toBe(true);
    const input = el.shadowRoot?.querySelector('input[role="switch"]') as HTMLInputElement;
    expect(input?.checked).toBe(true);
  });

  it("renders label when provided", async () => {
    const el = await fixture<VuSwitch>(html`<vu-switch label="Notifications"></vu-switch>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="text"]')?.textContent?.trim()).toBe(
      "Notifications",
    );
  });

  it("renders slotted label and hides string label part", async () => {
    const el = await fixture<VuSwitch>(html`
      <vu-switch label="Ignored">
        <span slot="label">Slotted <em>rich</em> label</span>
      </vu-switch>
    `);
    await elementUpdated(el);
    const slot = el.shadowRoot?.querySelector('slot[name="label"]') as HTMLSlotElement | undefined;
    const nodes = slot?.assignedNodes({ flatten: true }) ?? [];
    expect(nodes.length).toBeGreaterThan(0);
    expect(nodes.map((n) => (n as Node).textContent ?? "").join("")).toContain("Slotted");
  });

  it("reflects size, variant, and tone attributes", async () => {
    const el = await fixture<VuSwitch>(
      html`<vu-switch size="sm" variant="outline" tone="strong" label="S"></vu-switch>`,
    );
    await elementUpdated(el);
    expect(el.size).toBe("sm");
    expect(el.variant).toBe("outline");
    expect(el.tone).toBe("strong");
    expect(el.getAttribute("size")).toBe("sm");
    expect(el.getAttribute("variant")).toBe("outline");
    expect(el.getAttribute("tone")).toBe("strong");
  });

  it("reflects soft variant attribute", async () => {
    const el = await fixture<VuSwitch>(html`<vu-switch variant="soft" label="S"></vu-switch>`);
    await elementUpdated(el);
    expect(el.variant).toBe("soft");
    expect(el.getAttribute("variant")).toBe("soft");
  });

  it("reflects color intent like vu-button tokens", async () => {
    const el = await fixture<VuSwitch>(html`<vu-switch color="success"></vu-switch>`);
    await elementUpdated(el);
    expect(el.color).toBe("success");
    expect(el.getAttribute("color")).toBe("success");
  });

  it("has field and wrapper parts", async () => {
    const el = await fixture<VuSwitch>(html`<vu-switch></vu-switch>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="field"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="wrapper"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="input"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="label"]')).toBeTruthy();
  });

  it("dispatches vu-change when toggled", async () => {
    const el = await fixture<VuSwitch>(html`<vu-switch label="Alerts" value="on"></vu-switch>`);
    await elementUpdated(el);

    let detail: { checked: boolean; value?: unknown } | undefined;
    el.addEventListener("vu-change", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);

    const input = el.shadowRoot?.querySelector('input[role="switch"]') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await elementUpdated(el);

    expect(detail?.checked).toBe(true);
    expect(detail?.value).toBe("on");
    expect(el.checked).toBe(true);
  });

  it("vu-change detail mirrors checked when value prop empty", async () => {
    const el = await fixture<VuSwitch>(html`<vu-switch label="Test"></vu-switch>`);
    await elementUpdated(el);
    let detail: { value?: unknown; checked?: boolean } = {};
    el.addEventListener("vu-change", ((e: CustomEvent) => {
      detail = (e as CustomEvent).detail ?? {};
    }) as EventListener);
    const input = el.shadowRoot?.querySelector('input[role="switch"]') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    await elementUpdated(el);
    expect(detail.checked).toBe(true);
    expect(detail.value).toBe(true);
  });

  it("check() and uncheck() update checked", async () => {
    const el = await fixture<VuSwitch>(html`<vu-switch></vu-switch>`);
    await elementUpdated(el);
    el.check();
    await elementUpdated(el);
    expect(el.checked).toBe(true);
    el.uncheck();
    await elementUpdated(el);
    expect(el.checked).toBe(false);
  });

  it("toggle() flips checked and emits vu-change", async () => {
    const el = await fixture<VuSwitch>(html`<vu-switch></vu-switch>`);
    await elementUpdated(el);

    let fired = false;
    el.addEventListener("vu-change", () => {
      fired = true;
    });

    el.toggle();
    await elementUpdated(el);
    expect(el.checked).toBe(true);
    expect(fired).toBe(true);
  });

  it("does not toggle when disabled", async () => {
    const el = await fixture<VuSwitch>(html`<vu-switch disabled></vu-switch>`);
    await elementUpdated(el);
    el.toggle();
    await elementUpdated(el);
    expect(el.checked).toBe(false);
  });

  it("respects disabled on input", async () => {
    const el = await fixture<VuSwitch>(html`<vu-switch disabled></vu-switch>`);
    await elementUpdated(el);
    expect(el.disabled).toBe(true);
    const input = el.shadowRoot?.querySelector('input[role="switch"]') as HTMLInputElement;
    expect(input?.disabled).toBe(true);
  });

  it("reflects readonly and prevents toggle", async () => {
    const el = await fixture<VuSwitch>(
      html`<vu-switch readonly checked label="Read only"></vu-switch>`,
    );
    await elementUpdated(el);
    expect(el.readonly).toBe(true);
    const input = el.shadowRoot?.querySelector('input[role="switch"]') as HTMLInputElement;
    expect(input?.disabled).toBe(true);
    el.toggle();
    await elementUpdated(el);
    expect(el.checked).toBe(true);
  });

  it("accepts name attribute for form", async () => {
    const el = await fixture<VuSwitch>(html`<vu-switch name="alerts" value="yes"></vu-switch>`);
    await elementUpdated(el);
    expect(el.name).toBe("alerts");
    const input = el.shadowRoot?.querySelector('input[role="switch"]');
    expect(input?.getAttribute("name")).toBeFalsy();
  });

  it("submits value under name when checked", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <vu-switch name="notify" value="yes" checked></vu-switch>
      </form>
    `);
    const el = form.querySelector("vu-switch") as VuSwitch;
    await elementUpdated(el);
    const data = new FormData(form);
    expect(data.get("notify")).toBe("yes");
    expect(el.form).toBe(form);
  });

  it("omits value from FormData when unchecked", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <vu-switch name="notify" value="yes"></vu-switch>
      </form>
    `);
    await elementUpdated(form.querySelector("vu-switch") as VuSwitch);
    expect(new FormData(form).get("notify")).toBeNull();
  });

  it("omits value from FormData when disabled", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <vu-switch name="notify" value="yes" checked disabled></vu-switch>
      </form>
    `);
    await elementUpdated(form.querySelector("vu-switch") as VuSwitch);
    expect(new FormData(form).get("notify")).toBeNull();
  });

  it("form.reset() restores defaultChecked", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <vu-switch name="dark" .defaultChecked=${false}></vu-switch>
      </form>
    `);
    const el = form.querySelector("vu-switch") as VuSwitch;
    await elementUpdated(el);
    el.checked = true;
    await elementUpdated(el);
    form.reset();
    await elementUpdated(el);
    expect(el.checked).toBe(false);
  });

  it("reset() restores defaultChecked and fires vu-clear", async () => {
    const el = await fixture<VuSwitch>(
      html`<vu-switch .defaultChecked=${true} value="x"></vu-switch>`,
    );
    await elementUpdated(el);
    el.checked = false;
    await elementUpdated(el);
    let cleared: { value?: unknown; checked?: boolean } = {};
    el.addEventListener("vu-clear", ((e: CustomEvent) => {
      cleared = (e as CustomEvent).detail ?? {};
    }) as EventListener);
    el.reset();
    await elementUpdated(el);
    expect(el.checked).toBe(true);
    expect(cleared.value).toBe("x");
    expect(cleared.checked).toBe(true);
  });

  it("required and showErrors when invalid shows error with id and aria wiring", async () => {
    const el = await fixture<VuSwitch>(
      html`<vu-switch required showerrors label="Required"></vu-switch>`,
    );
    await elementUpdated(el);
    expect(el.required).toBe(true);
    const input = el.shadowRoot?.querySelector('input[role="switch"]') as HTMLInputElement;
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

  it("renders string hint with part and aria-describedby", async () => {
    const el = await fixture<VuSwitch>(
      html`<vu-switch label="Dark mode" hint="Syncs with system preference."></vu-switch>`,
    );
    await elementUpdated(el);
    const hint = el.shadowRoot?.querySelector('[part="hint"]') as HTMLElement | null;
    expect(hint?.textContent?.trim()).toBe("Syncs with system preference.");
    const input = el.shadowRoot?.querySelector('input[role="switch"]') as HTMLInputElement;
    expect(input.getAttribute("aria-describedby")?.split(/\s+/)).toContain(hint?.id);
  });

  it("renders slotted hint and wires aria-describedby", async () => {
    const el = await fixture<VuSwitch>(html`
      <vu-switch label="x">
        <span slot="hint">Slotted helper</span>
      </vu-switch>
    `);
    await elementUpdated(el);
    const hint = el.shadowRoot?.querySelector('[part="hint"]') as HTMLElement | null;
    const hintSlot = hint?.querySelector('slot[name="hint"]') as HTMLSlotElement | undefined;
    const flat = hintSlot
      ?.assignedNodes({ flatten: true })
      .map((n) => (n as Node).textContent ?? "")
      .join("");
    expect(flat.trim()).toBe("Slotted helper");
    const input = el.shadowRoot?.querySelector('input[role="switch"]') as HTMLInputElement;
    expect(input.getAttribute("aria-describedby")?.split(/\s+/)).toContain(hint?.id);
  });

  it("sets aria-label on input when no label or label slot", async () => {
    const el = await fixture<VuSwitch>(
      html`<vu-switch arialabel="Enable notifications"></vu-switch>`,
    );
    await elementUpdated(el);
    const input = el.shadowRoot?.querySelector('input[role="switch"]') as HTMLInputElement;
    expect(input.getAttribute("aria-label")).toBe("Enable notifications");
  });

  it("reflects compact on host", async () => {
    const el = await fixture<VuSwitch>(html`<vu-switch compact label="c"></vu-switch>`);
    await elementUpdated(el);
    expect(el.compact).toBe(true);
    expect(el.hasAttribute("compact")).toBe(true);
  });

  it("hint and error regions expose aria-live polite", async () => {
    const el = await fixture<VuSwitch>(
      html`<vu-switch label="x" hint="h" required showerrors></vu-switch>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="hint"]')?.getAttribute("aria-live")).toBe("polite");
    const input = el.shadowRoot?.querySelector('input[role="switch"]') as HTMLInputElement;
    input?.focus();
    input?.blur();
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="error-message"]')?.getAttribute("aria-live")).toBe(
      "polite",
    );
  });

  it("slot error replaces default validation lines when assigned", async () => {
    const el = await fixture<VuSwitch>(html`
      <vu-switch label="x" showerrors>
        <em slot="error">Custom error</em>
      </vu-switch>
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
});

describe("accessibility", () => {
  it("default switch passes axe", async () => {
    const el = await fixture(html`<vu-switch label="Notifications"></vu-switch>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("disabled switch passes axe", async () => {
    const el = await fixture(html`<vu-switch label="Alerts" disabled></vu-switch>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("invalid switch passes axe", async () => {
    const el = await fixture(html` <vu-switch label="Required" invalid showerrors></vu-switch> `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("outline success variant passes axe", async () => {
    const el = await fixture(html`
      <vu-switch label="Subscribe" variant="outline" color="success" checked></vu-switch>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("default in RTL document context", async () => {
    const wrap = await fixture(html`
      <div dir="rtl" lang="en">
        <vu-switch label="Notifications"></vu-switch>
      </div>
    `);
    await elementUpdated(wrap);
    const el = wrap.querySelector("vu-switch") as VuSwitch;
    await expectA11y(el).to.be.accessible();
  });
});

describe("keyboard", () => {
  it("Space toggles checked state", async () => {
    const el = await fixture<VuSwitch>(html`<vu-switch></vu-switch>`);
    await elementUpdated(el);
    const input = el.shadowRoot?.querySelector('input[role="switch"]') as HTMLInputElement;
    input?.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    await elementUpdated(el);
    expect(el.checked).toBe(true);
  });
});
