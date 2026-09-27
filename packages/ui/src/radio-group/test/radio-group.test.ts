/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import "../../radio/radio.js";
import { VuRadioGroup } from "../radio-group.js";

describe("vu-radio-group", () => {
  it("is defined", () => {
    expect(customElements.get("vu-radio-group")).toBe(VuRadioGroup);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuRadioGroup>(html`<vu-radio-group></vu-radio-group>`);
    await elementUpdated(el);
    expect(el.value).toBeUndefined();
    expect(el.orientation).toBe("horizontal");
    expect(el.variant).toBe("default");
    expect(el.color).toBe("primary");
    expect(el.tone).toBe("normal");
    expect(el.size).toBe("md");
    expect(el.compact).toBe(false);
    expect(el.requiredMessage).toBe("This field is required.");
    expect(el.shadowRoot?.querySelector('[part="base"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="fields"]')).toBeTruthy();
  });

  it("keeps label and legend slots in the tree when empty", async () => {
    const el = await fixture<VuRadioGroup>(html`<vu-radio-group></vu-radio-group>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('slot[name="label"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('slot[name="legend"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="label"]')?.getAttribute("aria-hidden")).toBe("true");
    expect(el.shadowRoot?.querySelector('[part="legend"]')?.getAttribute("aria-hidden")).toBe("true");
  });

  it("renders role=radiogroup, legend, field label, and aria-labelledby", async () => {
    const el = await fixture<VuRadioGroup>(html`
      <vu-radio-group label="Plan" legend="Pick one">
        <vu-radio value="a" label="A"></vu-radio>
        <vu-radio value="b" label="B"></vu-radio>
      </vu-radio-group>
    `);
    await elementUpdated(el);
    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
    expect(base.getAttribute("role")).toBe("radiogroup");
    const labelledBy = base.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    expect(labelledBy!.split(/\s+/).length).toBe(2);
    expect(el.shadowRoot?.querySelector('[part="label"]')?.textContent?.trim()).toContain("Plan");
    expect(base.querySelector('[part="legend"]')?.textContent?.trim()).toContain("Pick one");
  });

  it("uses aria-label on the group when there is no visible label or legend", async () => {
    const el = await fixture<VuRadioGroup>(html`
      <vu-radio-group arialabel="Shipping">
        <vu-radio value="x" label="X"></vu-radio>
      </vu-radio-group>
    `);
    await elementUpdated(el);
    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
    expect(base.getAttribute("aria-label")).toBe("Shipping");
    expect(base.getAttribute("aria-labelledby")).toBeNull();
  });

  it("uses vertical orientation", async () => {
    const el = await fixture<VuRadioGroup>(html`
      <vu-radio-group name="grp" orientation="vertical" label="Choose">
        <vu-radio value="x" label="X"></vu-radio>
      </vu-radio-group>
    `);
    await elementUpdated(el);
    expect(el.name).toBe("grp");
    expect(el.orientation).toBe("vertical");
    expect(el.label).toBe("Choose");
  });

  it("renders hint and wires aria-describedby", async () => {
    const el = await fixture<VuRadioGroup>(html`
      <vu-radio-group legend="Opts" hint="Pick exactly one.">
        <vu-radio value="a" label="A"></vu-radio>
      </vu-radio-group>
    `);
    await elementUpdated(el);
    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
    expect(base.getAttribute("aria-describedby")).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="hint"]')?.textContent?.trim()).toContain(
      "Pick exactly one",
    );
  });

  it("renders error slot and includes its id in aria-describedby", async () => {
    const el = await fixture<VuRadioGroup>(html`
      <vu-radio-group legend="Opts" required showerrors>
        <vu-radio value="a" label="A"></vu-radio>
        <span slot="error">Custom error</span>
      </vu-radio-group>
    `);
    await elementUpdated(el);
    el.validationActive = true;
    el.validateInput();
    await elementUpdated(el);
    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
    expect(el.querySelector('[slot="error"]')?.textContent?.trim()).toBe("Custom error");
    const err = el.shadowRoot?.querySelector('[part="error-message"]') as HTMLElement | null;
    const dby = base.getAttribute("aria-describedby");
    expect(dby).toBeTruthy();
    expect(err?.id).toBeTruthy();
    expect(dby!.split(/\s+/)).toContain(err!.id);
  });

  it("required and showErrors surfaces error after validateInput", async () => {
    const el = await fixture<VuRadioGroup>(html`
      <vu-radio-group label="Plan" required showerrors>
        <vu-radio value="a" label="A"></vu-radio>
      </vu-radio-group>
    `);
    await elementUpdated(el);
    el.validationActive = true;
    el.validateInput();
    await elementUpdated(el);
    const err = el.shadowRoot?.querySelector('[part="error-message"]') as HTMLElement | null;
    expect(err?.id).toBeTruthy();
    expect(err?.textContent?.trim().length).toBeGreaterThan(0);
    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
    expect(base.getAttribute("aria-describedby")?.split(/\s+/)).toContain(err?.id);
    expect(base.getAttribute("aria-invalid")).toBe("true");
  });

  it("forwards variant, color, tone, and size to members that omit them", async () => {
    const el = await fixture<VuRadioGroup>(html`
      <vu-radio-group variant="outline" color="success" tone="subtle" size="lg">
        <vu-radio value="a" label="A"></vu-radio>
        <vu-radio value="b" label="B"></vu-radio>
      </vu-radio-group>
    `);
    await elementUpdated(el);
    const radios = el.querySelectorAll("vu-radio");
    for (const r of radios) {
      expect(r.getAttribute("variant")).toBe("outline");
      expect(r.getAttribute("color")).toBe("success");
      expect(r.getAttribute("tone")).toBe("subtle");
      expect(r.getAttribute("size")).toBe("lg");
    }
  });

  it("does not overwrite member attributes the consumer set explicitly", async () => {
    const el = await fixture<VuRadioGroup>(html`
      <vu-radio-group color="primary" size="md">
        <vu-radio value="a" label="A"></vu-radio>
        <vu-radio value="b" label="B" color="danger" size="sm"></vu-radio>
      </vu-radio-group>
    `);
    await elementUpdated(el);
    const second = el.querySelectorAll("vu-radio")[1]!;
    expect(second.getAttribute("color")).toBe("danger");
    expect(second.getAttribute("size")).toBe("sm");
  });

  it("disables members while disabled and restores when cleared", async () => {
    const el = await fixture<VuRadioGroup>(html`
      <vu-radio-group>
        <vu-radio value="a" label="A"></vu-radio>
      </vu-radio-group>
    `);
    await elementUpdated(el);
    const rd = el.querySelector("vu-radio")!;
    el.disabled = true;
    await elementUpdated(el);
    expect(rd.hasAttribute("disabled")).toBe(true);
    el.disabled = false;
    await elementUpdated(el);
    expect(rd.hasAttribute("disabled")).toBe(false);
  });

  it("coordinates member selection when controlled", async () => {
    const el = await fixture<VuRadioGroup>(html`
      <vu-radio-group name="plan" .value=${"b"}>
        <vu-radio value="a" label="A"></vu-radio>
        <vu-radio value="b" label="B"></vu-radio>
      </vu-radio-group>
    `);
    await elementUpdated(el);
    await el.updateComplete;

    const radios = [...el.querySelectorAll("vu-radio")];
    expect(radios[1]?.checked).toBe(true);

    const firstInput = (radios[0] as HTMLElement).shadowRoot?.querySelector(
      'input[type="radio"]',
    ) as HTMLInputElement | null;
    if (firstInput) {
      firstInput.checked = true;
      firstInput.dispatchEvent(new Event("change", { bubbles: true }));
    }
    await elementUpdated(el);

    expect(el.value).toBe("a");
    expect(el.getSelectedValue()).toBe("a");
  });

  it("aggregates getSelectedValue and fires vu-change when a member is selected", async () => {
    const el = await fixture<VuRadioGroup>(html`
      <vu-radio-group>
        <vu-radio value="a" label="A"></vu-radio>
        <vu-radio value="b" label="B"></vu-radio>
      </vu-radio-group>
    `);
    await elementUpdated(el);
    let detail: { value: string; source: HTMLElement | null } | null = null;
    el.addEventListener("vu-change", (e) => {
      if (e.target !== el) return;
      detail = (e as CustomEvent<{ value: string; source: HTMLElement | null }>).detail;
    });
    const second = el.querySelectorAll("vu-radio")[1]!;
    second.checked = true;
    await elementUpdated(second);
    second.dispatchEvent(
      new CustomEvent("vu-change", {
        bubbles: true,
        composed: true,
        detail: { checked: true, value: "b" },
      }),
    );
    await elementUpdated(el);
    expect(detail).not.toBeNull();
    expect(detail!.value).toBe("b");
    expect(detail!.source).toBe(second);
    expect(el.getSelectedValue()).toBe("b");
  });

  it("stops the member vu-change so listeners above the group only see the group-shaped detail", async () => {
    const el = await fixture<VuRadioGroup>(html`
      <vu-radio-group>
        <vu-radio value="a" label="A"></vu-radio>
      </vu-radio-group>
    `);
    await elementUpdated(el);
    const seen: unknown[] = [];
    el.addEventListener("vu-change", (e) => seen.push((e as CustomEvent).detail));
    const first = el.querySelector("vu-radio")!;
    first.checked = true;
    await elementUpdated(first);
    first.dispatchEvent(
      new CustomEvent("vu-change", {
        bubbles: true,
        composed: true,
        detail: { checked: true, value: "a" },
      }),
    );
    await elementUpdated(el);
    expect(seen).toHaveLength(1);
    expect((seen[0] as { value: string }).value).toBe("a");
  });

  it("applies controlled value to member checked state", async () => {
    const el = await fixture<VuRadioGroup>(html`
      <vu-radio-group .value=${"b"}>
        <vu-radio value="a" label="A"></vu-radio>
        <vu-radio value="b" label="B"></vu-radio>
      </vu-radio-group>
    `);
    await elementUpdated(el);
    const radios = el.querySelectorAll("vu-radio");
    expect(radios[0]!.checked).toBe(false);
    expect(radios[1]!.checked).toBe(true);
    expect(el.getSelectedValue()).toBe("b");
  });

  it("forwards name and readonly to members", async () => {
    const el = await fixture<VuRadioGroup>(html`
      <vu-radio-group name="opts" readonly>
        <vu-radio value="a" label="A"></vu-radio>
      </vu-radio-group>
    `);
    await elementUpdated(el);
    await Promise.resolve();
    const rd = el.querySelector("vu-radio")!;
    expect(rd.name).toBe("opts");
    expect(rd.readonly).toBe(true);
  });

  it("fails checkValidity when required and nothing is selected", async () => {
    const el = await fixture<VuRadioGroup>(html`
      <vu-radio-group name="opts" ?required=${true}>
        <vu-radio value="a" label="A"></vu-radio>
      </vu-radio-group>
    `);
    await elementUpdated(el);
    await Promise.resolve();
    expect(el.checkValidity()).toBe(false);
  });

  it("passes checkValidity when required and a member is selected", async () => {
    const el = await fixture<VuRadioGroup>(html`
      <vu-radio-group name="opts" ?required=${true}>
        <vu-radio value="a" label="A" checked></vu-radio>
      </vu-radio-group>
    `);
    await elementUpdated(el);
    await Promise.resolve();
    expect(el.checkValidity()).toBe(true);
  });

  it("restores selection after formResetCallback to the first-paint snapshot", async () => {
    const el = await fixture(html`
      <form>
        <vu-radio-group name="g">
          <vu-radio value="a" label="A" checked></vu-radio>
          <vu-radio value="b" label="B"></vu-radio>
        </vu-radio-group>
      </form>
    `);
    const form = el as HTMLFormElement;
    const g = form.querySelector("vu-radio-group") as VuRadioGroup;
    const radios = () => [...form.querySelectorAll("vu-radio")];
    await elementUpdated(g);
    await Promise.resolve();
    radios()[1]!.checked = true;
    await elementUpdated(radios()[1]!);
    g.formResetCallback();
    await elementUpdated(g);
    await Promise.resolve();
    expect(radios()[0]!.checked).toBe(true);
    expect(radios()[1]!.checked).toBe(false);
  });
});

describe("accessibility", () => {
  it("labeled vertical group passes axe", async () => {
    const el = await fixture(html`
      <vu-radio-group label="Plan" legend="Pick one">
        <vu-radio value="a" label="Free"></vu-radio>
        <vu-radio value="b" label="Pro" checked></vu-radio>
      </vu-radio-group>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("disabled group passes axe", async () => {
    const el = await fixture(html`
      <vu-radio-group label="Opts" disabled>
        <vu-radio value="a" label="A"></vu-radio>
      </vu-radio-group>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("horizontal group with hint passes axe", async () => {
    const el = await fixture(html`
      <vu-radio-group orientation="horizontal" legend="Size" hint="Pick one.">
        <vu-radio value="s" label="S"></vu-radio>
        <vu-radio value="m" label="M" checked></vu-radio>
      </vu-radio-group>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
