/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5 N/A 6 N/A 7✓ 8✓ 9 N/A 10 N/A
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { LitElement, html as litHtml } from "lit";
import { VuConfigProvider } from "../config-provider.js";
import { PresetController } from "../../../internals/controllers/preset-controller.js";
import "../../button/button.js";
import "../../chip/chip.js";

class TestPresetConsumer extends LitElement {
  static properties = {
    variant: { type: String, reflect: true },
    size: { type: String },
    preset: { type: String, reflect: true },
  };

  declare variant: string;
  declare size: string;
  declare preset: string;

  constructor() {
    super();
    this.variant = "solid";
    this.size = "md";
    this.preset = "";
  }

  private readonly _presets = new PresetController(this, {
    componentKey: "vu-button",
  });

  get effective() {
    return { variant: this.variant, size: this.size };
  }

  override render() {
    return litHtml`<span>${this.variant}:${this.size}</span>`;
  }
}

if (!customElements.get("test-preset-consumer")) {
  customElements.define("test-preset-consumer", TestPresetConsumer);
}

class VuTestComposite extends LitElement {
  override render() {
    return litHtml`
      <slot></slot>
      <test-preset-consumer id="internal"></test-preset-consumer>
    `;
  }
}

if (!customElements.get("vu-test-composite")) {
  customElements.define("vu-test-composite", VuTestComposite);
}

async function settle(el: LitElement) {
  await el.updateComplete;
  await Promise.resolve();
  await el.updateComplete;
}

describe("vu-config-provider", () => {
  it("is defined", () => {
    expect(customElements.get("vu-config-provider")).toBe(VuConfigProvider);
  });

  it("renders a slot", async () => {
    const el = await fixture<VuConfigProvider>(html`
      <vu-config-provider><span class="child">Hi</span></vu-config-provider>
    `);
    await elementUpdated(el);
    expect(el.querySelector(".child")?.textContent).toBe("Hi");
    expect(el.presets).toEqual({});
  });

  it("provides defaults to descendants", async () => {
    const el = await fixture<VuConfigProvider>(html`
      <vu-config-provider>
        <test-preset-consumer></test-preset-consumer>
      </vu-config-provider>
    `);
    el.presets = {
      defaults: { "vu-button": { variant: "ghost", size: "sm" } },
    };
    await settle(el);
    const child = el.querySelector("test-preset-consumer") as TestPresetConsumer;
    await settle(child);
    expect(child.effective).toEqual({ variant: "ghost", size: "sm" });
  });

  it("applies named preset over defaults", async () => {
    const el = await fixture<VuConfigProvider>(html`
      <vu-config-provider>
        <test-preset-consumer preset="cancel"></test-preset-consumer>
      </vu-config-provider>
    `);
    el.presets = {
      defaults: { "vu-button": { variant: "ghost", size: "sm" } },
      presets: {
        "vu-button": { cancel: { variant: "solid", size: "md" } },
      },
    };
    await settle(el);
    const child = el.querySelector("test-preset-consumer") as TestPresetConsumer;
    await settle(child);
    expect(child.effective).toEqual({ variant: "solid", size: "md" });
  });

  it("nested provider merges over parent", async () => {
    const el = await fixture<VuConfigProvider>(html`
      <vu-config-provider>
        <vu-config-provider id="inner">
          <test-preset-consumer></test-preset-consumer>
        </vu-config-provider>
      </vu-config-provider>
    `);
    el.presets = {
      defaults: { "vu-button": { variant: "ghost", size: "sm" } },
    };
    const inner = el.querySelector("#inner") as VuConfigProvider;
    inner.presets = {
      defaults: { "vu-button": { size: "lg" } },
    };
    await settle(el);
    await settle(inner);
    const child = el.querySelector("test-preset-consumer") as TestPresetConsumer;
    await settle(child);
    expect(child.effective).toEqual({ variant: "ghost", size: "lg" });
  });

  it("attributes override presets", async () => {
    const el = await fixture<VuConfigProvider>(html`
      <vu-config-provider>
        <test-preset-consumer variant="solid" preset="cancel"></test-preset-consumer>
      </vu-config-provider>
    `);
    el.presets = {
      defaults: { "vu-button": { variant: "ghost", size: "sm" } },
      presets: {
        "vu-button": { cancel: { variant: "outline", size: "md" } },
      },
    };
    await settle(el);
    const child = el.querySelector("test-preset-consumer") as TestPresetConsumer;
    await settle(child);
    expect(child.effective.variant).toBe("solid");
    expect(child.effective.size).toBe("md");
  });

  it("does not apply defaults to vu-* internals in another vu-* shadow tree", async () => {
    const el = await fixture<VuConfigProvider>(html`
      <vu-config-provider>
        <vu-test-composite></vu-test-composite>
      </vu-config-provider>
    `);
    el.presets = {
      defaults: { "vu-button": { variant: "ghost", size: "sm" } },
    };
    await settle(el);
    const comp = el.querySelector("vu-test-composite") as VuTestComposite;
    await settle(comp);
    const internal = comp.shadowRoot!.querySelector("test-preset-consumer") as TestPresetConsumer;
    await settle(internal);
    expect(internal.effective).toEqual({ variant: "solid", size: "md" });
  });

  it("still applies defaults to slotted light-DOM children of a vu-* host", async () => {
    const el = await fixture<VuConfigProvider>(html`
      <vu-config-provider>
        <vu-test-composite>
          <test-preset-consumer id="slotted"></test-preset-consumer>
        </vu-test-composite>
      </vu-config-provider>
    `);
    el.presets = {
      defaults: { "vu-button": { variant: "ghost", size: "sm" } },
    };
    await settle(el);
    const slotted = el.querySelector("#slotted") as TestPresetConsumer;
    await settle(slotted);
    expect(slotted.effective).toEqual({ variant: "ghost", size: "sm" });
  });

  it("applies defaults to vu-button", async () => {
    const el = await fixture<VuConfigProvider>(html`
      <vu-config-provider>
        <vu-button label="Save"></vu-button>
      </vu-config-provider>
    `);
    el.presets = {
      defaults: { "vu-button": { variant: "ghost", size: "sm" } },
    };
    await settle(el);
    const btn = el.querySelector("vu-button") as LitElement & {
      variant: string;
      size: string;
    };
    await settle(btn);
    expect(btn.variant).toBe("ghost");
    expect(btn.size).toBe("sm");
    expect(btn.hasAttribute("preset")).toBe(false);
  });

  it("reflects only a named preset selector", async () => {
    const el = await fixture<VuConfigProvider>(html`
      <vu-config-provider>
        <vu-button preset="cancel" label="Cancel"></vu-button>
      </vu-config-provider>
    `);
    el.presets = {
      presets: { "vu-button": { cancel: { variant: "solid", color: "danger" } } },
    };
    await settle(el);
    const btn = el.querySelector("vu-button") as LitElement & {
      variant: string;
      color: string;
    };
    await settle(btn);
    expect(btn.getAttribute("preset")).toBe("cancel");
    expect(btn.variant).toBe("solid");
    expect(btn.color).toBe("danger");
  });

  it("applies defaults to vu-chip via context subscribe", async () => {
    const el = await fixture<VuConfigProvider>(html`
      <vu-config-provider>
        <vu-chip>Tag</vu-chip>
      </vu-config-provider>
    `);
    el.presets = {
      defaults: { "vu-chip": { size: "sm", variant: "solid" } },
    };
    await settle(el);
    const chip = el.querySelector("vu-chip") as LitElement & {
      size: string;
      variant: string;
    };
    await settle(chip);
    expect(chip.size).toBe("sm");
    expect(chip.variant).toBe("solid");
    expect(chip.hasAttribute("preset")).toBe(false);
  });

  it("is accessible", async () => {
    const el = await fixture<VuConfigProvider>(html`
      <vu-config-provider>
        <p>Content</p>
      </vu-config-provider>
    `);
    await expectA11y(el).to.be.accessible();
  });
});
