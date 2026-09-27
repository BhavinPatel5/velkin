/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuCheckboxGroup } from "../checkbox-group.js";
import "../../checkbox/checkbox.js";

describe("vu-checkbox-group", () => {
  it("is defined", () => {
    expect(customElements.get("vu-checkbox-group")).toBe(VuCheckboxGroup);
  });

  it("renders role=group, legend, field label, and aria-labelledby", async () => {
    const el = await fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group label="Channels" legend="Pick">
        <vu-checkbox value="a" label="A"></vu-checkbox>
        <vu-checkbox value="b" label="B"></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    expect(el.orientation).toBe("vertical");
    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
    expect(base.getAttribute("role")).toBe("group");
    expect(base.hasAttribute("aria-orientation")).toBe(false);
    const labelledBy = base.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    expect(labelledBy!.split(/\s+/).length).toBe(2);
    expect(el.shadowRoot?.querySelector('[part="label"]')?.textContent?.trim()).toContain(
      "Channels",
    );
    expect(base.querySelector('[part="legend"]')?.textContent?.trim()).toContain("Pick");
  });

  it("uses aria-label on the group when there is no visible label or legend", async () => {
    const el = await fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group arialabel="Filters">
        <vu-checkbox value="x" label="X"></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
    expect(base.getAttribute("aria-label")).toBe("Filters");
    expect(base.getAttribute("aria-labelledby")).toBeNull();
  });

  it("renders hint and wires aria-describedby", async () => {
    const el = await fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group legend="Opts" hint="Pick any combination.">
        <vu-checkbox value="a" label="A"></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
    expect(base.getAttribute("aria-describedby")).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="hint"]')?.textContent?.trim()).toContain(
      "Pick any combination",
    );
  });

  it("renders error slot and includes its id in aria-describedby", async () => {
    const el = await fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group legend="Opts" required showerrors>
        <vu-checkbox value="a" label="A"></vu-checkbox>
        <span slot="error">Custom error</span>
      </vu-checkbox-group>
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
    const el = await fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group label="Channels" required showerrors>
        <vu-checkbox value="a" label="A"></vu-checkbox>
      </vu-checkbox-group>
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
    const el = await fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group variant="outline" color="success" tone="subtle" size="lg">
        <vu-checkbox value="a" label="A"></vu-checkbox>
        <vu-checkbox value="b" label="B"></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    const boxes = el.querySelectorAll("vu-checkbox");
    for (const b of boxes) {
      expect(b.getAttribute("variant")).toBe("outline");
      expect(b.getAttribute("color")).toBe("success");
      expect(b.getAttribute("tone")).toBe("subtle");
      expect(b.getAttribute("size")).toBe("lg");
    }
  });

  it("forwards all color tokens to members", async () => {
    for (const color of ["default", "primary", "success", "warning", "danger"] as const) {
      const el = await fixture<VuCheckboxGroup>(html`
        <vu-checkbox-group color=${color}>
          <vu-checkbox value="a" label="A"></vu-checkbox>
        </vu-checkbox-group>
      `);
      await elementUpdated(el);
      expect(el.querySelector("vu-checkbox")?.getAttribute("color")).toBe(color);
    }
  });

  it("exposes aria-disabled on the group when disabled", async () => {
    const el = await fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group label="Opts" disabled>
        <vu-checkbox value="a" label="A"></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
    expect(base.getAttribute("aria-disabled")).toBe("true");
  });

  it("updates aria-labelledby when a label slot is added at runtime", async () => {
    const el = await fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group arialabel="Filters">
        <vu-checkbox value="x" label="X"></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    const base = () => el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
    expect(base().getAttribute("aria-label")).toBe("Filters");
    expect(base().getAttribute("aria-labelledby")).toBeNull();

    const label = document.createElement("span");
    label.slot = "label";
    label.textContent = "Notification channels";
    el.appendChild(label);
    await elementUpdated(el);

    expect(base().hasAttribute("aria-label")).toBe(false);
    expect(base().getAttribute("aria-labelledby")).toBeTruthy();
  });

  it("does not overwrite member attributes the consumer set explicitly", async () => {
    const el = await fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group color="primary" size="md">
        <vu-checkbox value="a" label="A"></vu-checkbox>
        <vu-checkbox value="b" label="B" color="danger" size="sm"></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    const second = el.querySelectorAll("vu-checkbox")[1]!;
    expect(second.getAttribute("color")).toBe("danger");
    expect(second.getAttribute("size")).toBe("sm");
  });

  it("forwards radius when the group sets radius", async () => {
    const el = await fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group radius="full">
        <vu-checkbox value="a" label="A"></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    expect(el.querySelector("vu-checkbox")?.getAttribute("radius") === "full").toBe(true);
  });

  it("disables members while disabled and restores when cleared", async () => {
    const el = await fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group>
        <vu-checkbox value="a" label="A"></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    const cb = el.querySelector("vu-checkbox")!;
    el.disabled = true;
    await elementUpdated(el);
    expect(cb.hasAttribute("disabled")).toBe(true);
    el.disabled = false;
    await elementUpdated(el);
    expect(cb.hasAttribute("disabled")).toBe(false);
  });

  it("aggregates getSelectedValues and fires vu-change when a member toggles", async () => {
    const el = await fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group>
        <vu-checkbox value="a" label="A"></vu-checkbox>
        <vu-checkbox value="b" label="B"></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    let detail: { values: string[]; source: HTMLElement | null } | null = null;
    el.addEventListener("vu-change", (e) => {
      if (e.target !== el) return;
      detail = (e as CustomEvent<{ values: string[]; source: HTMLElement | null }>).detail;
    });
    const first = el.querySelectorAll("vu-checkbox")[0]!;
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
    expect(detail).not.toBeNull();
    expect(detail!.values).toEqual(["a"]);
    expect(detail!.source).toBe(first);
    expect(el.getSelectedValues()).toEqual(["a"]);
  });

  it("stops the member vu-change so listeners above the group only see the group-shaped detail", async () => {
    const el = await fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group>
        <vu-checkbox value="a" label="A"></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    const seen: unknown[] = [];
    el.addEventListener("vu-change", (e) => seen.push((e as CustomEvent).detail));
    const first = el.querySelector("vu-checkbox")!;
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
    expect((seen[0] as { values: string[] }).values).toEqual(["a"]);
  });

  it("uses native token on for empty member value when checked", async () => {
    const el = await fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group>
        <vu-checkbox label="No value" .checked=${true}></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    expect(el.getSelectedValues()).toEqual(["on"]);
  });

  it("applies controlled values to member checked state", async () => {
    const el = await fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group .values=${["b"]}>
        <vu-checkbox value="a" label="A"></vu-checkbox>
        <vu-checkbox value="b" label="B"></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    const boxes = el.querySelectorAll("vu-checkbox");
    expect(boxes[0]!.checked).toBe(false);
    expect(boxes[1]!.checked).toBe(true);
    expect(el.getSelectedValues()).toEqual(["b"]);
  });

  it("treats token on as checked when member value is empty (controlled)", async () => {
    const el = await fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group .values=${["on"]}>
        <vu-checkbox label="No value"></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    expect(el.querySelector("vu-checkbox")!.checked).toBe(true);
  });

  it("updates controlled values when a member toggles", async () => {
    const el = await fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group .values=${["a"]}>
        <vu-checkbox value="a" label="A"></vu-checkbox>
        <vu-checkbox value="b" label="B"></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    const second = el.querySelectorAll("vu-checkbox")[1]!;
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
    expect(el.values).toEqual(["a", "b"]);
  });

  it("forwards name to members when the group name is set", async () => {
    const el = await fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group name="opts">
        <vu-checkbox value="a" label="A"></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    await Promise.resolve();
    expect(el.querySelector("vu-checkbox")?.name).toBe("opts");
  });

  it("forwards readonly to members", async () => {
    const el = await fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group readonly>
        <vu-checkbox value="a" label="A"></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    await Promise.resolve();
    expect(el.querySelector("vu-checkbox")?.readonly).toBe(true);
  });

  it("fails checkValidity when required and nothing is checked", async () => {
    const el = await fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group name="opts" ?required=${true}>
        <vu-checkbox value="a" label="A"></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    await Promise.resolve();
    expect(el.checkValidity()).toBe(false);
  });

  it("passes checkValidity when required and a member is checked", async () => {
    const el = await fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group name="opts" ?required=${true}>
        <vu-checkbox value="a" label="A" checked></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    await Promise.resolve();
    expect(el.checkValidity()).toBe(true);
  });

  it("restores selection after formResetCallback to the first-paint snapshot", async () => {
    const el = await fixture(html`
      <form>
        <vu-checkbox-group name="g">
          <vu-checkbox value="a" label="A" checked></vu-checkbox>
          <vu-checkbox value="b" label="B"></vu-checkbox>
        </vu-checkbox-group>
      </form>
    `);
    const form = el as HTMLFormElement;
    const g = form.querySelector("vu-checkbox-group") as VuCheckboxGroup;
    const boxes = () => [...form.querySelectorAll("vu-checkbox")];
    await elementUpdated(g);
    await Promise.resolve();
    boxes()[1]!.checked = true;
    await elementUpdated(boxes()[1]!);
    g.formResetCallback();
    await elementUpdated(g);
    await Promise.resolve();
    expect(boxes()[0]!.checked).toBe(true);
    expect(boxes()[1]!.checked).toBe(false);
  });
});

describe("accessibility", () => {
  it("labeled vertical group passes axe", async () => {
    const el = await fixture(html`
      <vu-checkbox-group label="Channels" legend="Pick one or more">
        <vu-checkbox value="a" label="Email"></vu-checkbox>
        <vu-checkbox value="b" label="SMS"></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("disabled group passes axe", async () => {
    const el = await fixture(html`
      <vu-checkbox-group label="Opts" disabled>
        <vu-checkbox value="a" label="A"></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("horizontal group with hint passes axe", async () => {
    const el = await fixture(html`
      <vu-checkbox-group orientation="horizontal" legend="Size" hint="Pick any.">
        <vu-checkbox value="s" label="S"></vu-checkbox>
        <vu-checkbox value="m" label="M" checked></vu-checkbox>
      </vu-checkbox-group>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
