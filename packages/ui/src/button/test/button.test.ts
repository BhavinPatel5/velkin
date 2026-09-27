/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6 N/A 7 N/A 8✓ 9✓ 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuButton } from "../button.js";
import "../../icon/icon.js";

describe("vu-button", () => {
  it("is defined", () => {
    expect(customElements.get("vu-button")).toBe(VuButton);
  });

  it("renders defaults — solid/default/md, native button, no aria-busy", async () => {
    const el = await fixture<VuButton>(html`<vu-button>Save</vu-button>`);
    await elementUpdated(el);

    expect(el.variant).toBe("solid");
    expect(el.color).toBe("default");
    expect(el.size).toBe("md");
    expect(el.radius).toBe("md");
    expect(el.type).toBe("button");
    expect(el.disabled).toBe(false);
    expect(el.loading).toBe(false);
    expect(el.block).toBe(false);
    expect(el.iconOnly).toBe(false);
    expect(el.hasAttribute("preset")).toBe(false);
    expect(el.hasAttribute("name")).toBe(false);
    expect(el.hasAttribute("form")).toBe(false);

    const btn = el.shadowRoot?.querySelector('[part="base"]') as HTMLButtonElement;
    expect(btn.tagName).toBe("BUTTON");
    expect(btn.type).toBe("button");
    expect(btn.hasAttribute("aria-busy")).toBe(false);
  });

  it("reflects variant / color / size / radius onto the host for CSS targeting", async () => {
    const el = await fixture<VuButton>(html`
      <vu-button variant="outline" color="primary" size="lg" radius="full">
        Continue
      </vu-button>
    `);
    await elementUpdated(el);
    expect(el.getAttribute("variant")).toBe("outline");
    expect(el.getAttribute("color")).toBe("primary");
    expect(el.getAttribute("size")).toBe("lg");
    expect(el.getAttribute("radius")).toBe("full");
  });

  it("reflects all variant and color tokens", async () => {
    for (const variant of ["solid", "soft", "outline", "ghost", "link"] as const) {
      const el = await fixture<VuButton>(html`<vu-button variant=${variant}>X</vu-button>`);
      await elementUpdated(el);
      expect(el.getAttribute("variant")).toBe(variant);
    }
    for (const color of ["default", "primary", "success", "warning", "danger"] as const) {
      const el = await fixture<VuButton>(html`<vu-button color=${color}>X</vu-button>`);
      await elementUpdated(el);
      expect(el.getAttribute("color")).toBe(color);
    }
  });

  it("forwards disabled to the inner button and blocks click activation", async () => {
    const el = await fixture<VuButton>(html`
      <vu-button disabled>Cannot</vu-button>
    `);
    await elementUpdated(el);
    const btn = el.shadowRoot?.querySelector('[part="base"]') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);

    let clicked = 0;
    el.addEventListener("click", () => {
      clicked++;
    });
    btn.click();
    expect(clicked).toBe(0);
  });

  it("loading sets aria-busy and shows the spinner; clicks are blocked", async () => {
    const el = await fixture<VuButton>(html`<vu-button loading>Saving</vu-button>`);
    await elementUpdated(el);
    const btn = el.shadowRoot?.querySelector('[part="base"]') as HTMLButtonElement;
    expect(btn.getAttribute("aria-busy")).toBe("true");
    expect(el.shadowRoot?.querySelector('[part="spinner"]')).toBeTruthy();

    let clicked = 0;
    el.addEventListener("click", () => {
      clicked++;
    });
    btn.click();
    expect(clicked).toBe(0);
  });

  it("non-loading state has no spinner element", async () => {
    const el = await fixture<VuButton>(html`<vu-button>Idle</vu-button>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="spinner"]')).toBeNull();
  });

  it("projects start and default slot content without hiding the label", async () => {
    const el = await fixture<VuButton>(html`
      <vu-button>
        <vu-icon slot="start" icon="ion:save-outline"></vu-icon>
        Save
      </vu-button>
    `);
    await elementUpdated(el);
    const label = el.shadowRoot?.querySelector('[part="label"]') as HTMLElement;
    const startSlot = el.shadowRoot?.querySelector('slot[name="start"]') as HTMLSlotElement;
    const labelSlot = el.shadowRoot?.querySelector("slot:not([name])") as HTMLSlotElement;
    expect(label.hasAttribute("hidden")).toBe(false);
    expect(labelSlot.assignedNodes().some((n) => (n.textContent ?? "").includes("Save"))).toBe(
      true,
    );
    expect(startSlot.assignedElements().length).toBe(1);
  });

  it("projects an end icon added at runtime", async () => {
    const el = await fixture<VuButton>(html`<vu-button>Save</vu-button>`);
    await elementUpdated(el);
    const icon = document.createElement("vu-icon");
    icon.setAttribute("slot", "end");
    icon.setAttribute("icon", "ion:chevron-down");
    el.appendChild(icon);
    await elementUpdated(el);
    const endSlot = el.shadowRoot?.querySelector('slot[name="end"]') as HTMLSlotElement;
    expect(endSlot.assignedElements().length).toBe(1);
  });

  it("uses the label property as aria-label when provided (icon-only buttons)", async () => {
    const el = await fixture<VuButton>(html`
      <vu-button label="Close dialog" iconOnly>
        <vu-icon icon="ion:close" aria-hidden="true"></vu-icon>
      </vu-button>
    `);
    await elementUpdated(el);
    const btn = el.shadowRoot?.querySelector('[part="base"]') as HTMLButtonElement;
    const labelPart = el.shadowRoot?.querySelector('[part="label"]') as HTMLElement;
    expect(el.iconOnly).toBe(true);
    expect(el.hasAttribute("icononly")).toBe(true);
    expect(btn.getAttribute("aria-label")).toBe("Close dialog");
    expect(labelPart.hasAttribute("hidden")).toBe(false);
  });

  it("renders label as default slot fallback when the slot is empty", async () => {
    const el = await fixture<VuButton>(html`<vu-button label="Save"></vu-button>`);
    await elementUpdated(el);
    const btn = el.shadowRoot?.querySelector('[part="base"]') as HTMLButtonElement;
    const labelPart = el.shadowRoot?.querySelector('[part="label"]') as HTMLElement;
    expect(labelPart.hasAttribute("hidden")).toBe(false);
    expect(labelPart.textContent?.trim()).toBe("Save");
    expect(btn.hasAttribute("aria-label")).toBe(false);
  });

  it("does not render label text for inferred icon-only start-slot buttons", async () => {
    const el = await fixture<VuButton>(html`
      <vu-button label="Close">
        <vu-icon slot="start" icon="ion:close"></vu-icon>
      </vu-button>
    `);
    await elementUpdated(el);
    const btn = el.shadowRoot?.querySelector('[part="base"]') as HTMLButtonElement;
    const labelPart = el.shadowRoot?.querySelector('[part="label"]') as HTMLElement;
    expect(btn.getAttribute("aria-label")).toBe("Close");
    expect(labelPart.textContent?.trim()).toBe("");
    expect(el.iconOnly).toBe(false);
    expect(el.hasAttribute("data-icononly")).toBe(true);
  });

  it("squares inferred icon-only hit targets via data-icononly", async () => {
    const el = await fixture<VuButton>(html`
      <vu-button label="Add" color="primary">
        <vu-icon icon="ion:add"></vu-icon>
      </vu-button>
    `);
    await elementUpdated(el);
    expect(el.hasAttribute("data-icononly")).toBe(true);
    expect(el.iconOnly).toBe(false);
    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLButtonElement;
    const rect = base.getBoundingClientRect();
    expect(Math.abs(rect.width - rect.height)).toBeLessThan(0.5);
  });

  it("falls back to slotted vu-icon aria-label when label prop is empty", async () => {
    const el = await fixture<VuButton>(html`
      <vu-button>
        <vu-icon slot="start" icon="ion:close" aria-label="Dismiss"></vu-icon>
      </vu-button>
    `);
    await elementUpdated(el);
    const btn = el.shadowRoot?.querySelector('[part="base"]') as HTMLButtonElement;
    expect(el.hasAttribute("data-icononly")).toBe(true);
    expect(btn.getAttribute("aria-label")).toBe("Dismiss");
  });

  it("prefers default slot content over the label fallback", async () => {
    const el = await fixture<VuButton>(html`
      <vu-button label="Ignored">Custom</vu-button>
    `);
    await elementUpdated(el);
    expect(el.textContent?.trim()).toBe("Custom");
    const labelPart = el.shadowRoot?.querySelector('[part="label"]') as HTMLElement;
    expect(labelPart.hasAttribute("hidden")).toBe(false);
  });

  it("type='submit' inside a <form> calls form.requestSubmit on click", async () => {
    const wrapper = await fixture<HTMLFormElement>(html`
      <form>
        <vu-button type="submit" name="action" value="save">Save</vu-button>
      </form>
    `);
    const button = wrapper.querySelector("vu-button") as VuButton;
    await elementUpdated(button);

    let submitted = 0;
    wrapper.addEventListener("submit", (e) => {
      e.preventDefault();
      submitted++;
    });

    const inner = button.shadowRoot?.querySelector('[part="base"]') as HTMLButtonElement;
    inner.click();
    expect(submitted).toBe(1);
  });

  it("reflects name and form only when non-empty", async () => {
    const el = await fixture<VuButton>(
      html`<vu-button name="action" form="login">Save</vu-button>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("name")).toBe("action");
    expect(el.getAttribute("form")).toBe("login");

    el.name = "";
    el.form = "";
    await elementUpdated(el);
    expect(el.hasAttribute("name")).toBe(false);
    expect(el.hasAttribute("form")).toBe(false);
  });

  it("type='reset' inside a <form> calls form.reset on click", async () => {
    const wrapper = await fixture<HTMLFormElement>(html`
      <form>
        <input name="title" value="hello" />
        <vu-button type="reset">Reset</vu-button>
      </form>
    `);
    const input = wrapper.querySelector("input") as HTMLInputElement;
    const button = wrapper.querySelector("vu-button") as VuButton;
    await elementUpdated(button);

    input.value = "changed";
    expect(input.value).toBe("changed");

    const inner = button.shadowRoot?.querySelector('[part="base"]') as HTMLButtonElement;
    inner.click();
    expect(input.value).toBe("hello");
  });

  it("focus() delegates to the inner native button", async () => {
    const el = await fixture<VuButton>(html`<vu-button>Focus me</vu-button>`);
    await elementUpdated(el);
    el.focus();
    const btn = el.shadowRoot?.querySelector('[part="base"]') as HTMLButtonElement;
    expect(el.shadowRoot?.activeElement).toBe(btn);
  });

  it("click() delegates to the inner native button", async () => {
    const el = await fixture<VuButton>(html`<vu-button>Tap</vu-button>`);
    await elementUpdated(el);
    let clicks = 0;
    el.addEventListener("click", () => {
      clicks++;
    });
    el.click();
    expect(clicks).toBe(1);
  });

  it("formDisabledCallback mirrors the form's disabled state onto the button", async () => {
    const el = await fixture<VuButton>(html`<vu-button>Inside fieldset</vu-button>`);
    await elementUpdated(el);
    expect(el.disabled).toBe(false);
    el.formDisabledCallback(true);
    await elementUpdated(el);
    expect(el.disabled).toBe(true);
  });

  it("`pressed` (toggle mode) reflects to aria-pressed on the inner button", async () => {
    const el = await fixture<VuButton>(html`<vu-button pressed>Toggle</vu-button>`);
    await elementUpdated(el);
    const inner = el.shadowRoot?.querySelector('[part="base"]') as HTMLButtonElement;
    expect(inner.getAttribute("aria-pressed")).toBe("true");
    expect(inner.hasAttribute("aria-checked")).toBe(false);
    expect(inner.getAttribute("role")).toBe(null);

    el.pressed = false;
    await elementUpdated(el);
    expect(inner.hasAttribute("aria-pressed")).toBe(false);
  });

  it("`radio` flips ARIA to role=radio + aria-checked + roving tabindex", async () => {
    const el = await fixture<VuButton>(html`<vu-button radio>Radio</vu-button>`);
    await elementUpdated(el);
    const inner = el.shadowRoot?.querySelector('[part="base"]') as HTMLButtonElement;
    expect(inner.getAttribute("role")).toBe("radio");
    expect(inner.getAttribute("aria-checked")).toBe("false");
    expect(inner.hasAttribute("aria-pressed")).toBe(false);
    expect(inner.getAttribute("tabindex")).toBe("-1");

    el.pressed = true;
    await elementUpdated(el);
    expect(inner.getAttribute("aria-checked")).toBe("true");
    expect(inner.getAttribute("tabindex")).toBe("0");
  });
});

describe("accessibility", () => {
  it("default solid button passes axe", async () => {
    const el = await fixture(html`<vu-button>Save</vu-button>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("disabled button passes axe", async () => {
    const el = await fixture(html`<vu-button disabled>Save</vu-button>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("loading button passes axe", async () => {
    const el = await fixture(html`<vu-button loading>Saving</vu-button>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("icon-only button with label passes axe", async () => {
    const el = await fixture(html`
      <vu-button iconOnly label="Close">
        <vu-icon icon="ion:close" aria-hidden="true"></vu-icon>
      </vu-button>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("outline primary full radius passes axe", async () => {
    const el = await fixture(html`
      <vu-button variant="outline" color="primary" radius="full">Continue</vu-button>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
