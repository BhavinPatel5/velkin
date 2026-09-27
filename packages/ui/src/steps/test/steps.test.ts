/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7 N/A 8✓ 9✓ 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuSteps } from "../steps.js";
import { VuStepItem } from "../../step-item/step-item.js";
import "../../icon/icon.js";
import "../../step-item/step-item.js";

const sampleSteps = [
  { label: "Account" },
  { label: "Shipping" },
  { label: "Payment", disabled: true },
];

describe("vu-steps", () => {
  it("is defined", () => {
    expect(customElements.get("vu-steps")).toBe(VuSteps);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuSteps>(html`<vu-steps></vu-steps>`);
    await elementUpdated(el);
    expect(el.steps).toEqual([]);
    expect(el.currentStep).toBe(1);
    expect(el.defaultCurrentStep).toBe(1);
    expect(el.lastCompletedStep).toBe(0);
    expect(el.layout).toBe("horizontal");
    expect(el.labelPlacement).toBe("inline");
    expect(el.size).toBe("md");
    expect(el.variant).toBe("default");
    expect(el.allowStepJump).toBe(true);
    expect(el.hideNumbers).toBe(false);
    expect(el.showLabels).toBe(true);
    expect(el.compact).toBe(false);
    expect(el.readonly).toBe(false);
    expect(el.completedSteps).toBeNull();
    expect(el.stepIcon).toBe("");
    expect(el.checkedIcon).toBe("");
    expect(el.errorIcon).toBe("");
  });

  it("accepts steps and currentStep", async () => {
    const el = await fixture<VuSteps>(
      html`<vu-steps
        .steps=${[{ label: "One" }, { label: "Two" }]}
        currentstep="2"
      ></vu-steps>`,
    );
    await elementUpdated(el);
    expect(el.steps).toHaveLength(2);
    expect(el.currentStep).toBe(2);
  });

  it("accepts layout, allowStepJump, hideNumbers, showLabels, compact", async () => {
    const el = await fixture<VuSteps>(
      html`<vu-steps
        layout="vertical"
        allowstepjump
        hidenumbers
        showlabels
        compact
      ></vu-steps>`,
    );
    await elementUpdated(el);
    expect(el.layout).toBe("vertical");
    expect(el.allowStepJump).toBe(true);
    expect(el.hideNumbers).toBe(true);
    expect(el.showLabels).toBe(true);
    expect(el.compact).toBe(true);
  });

  it("accepts stepIcon and checkedIcon", async () => {
    const el = await fixture<VuSteps>(
      html`<vu-steps stepicon="lucide:circle" checkedicon="lucide:check"></vu-steps>`,
    );
    await elementUpdated(el);
    expect(el.stepIcon).toBe("lucide:circle");
    expect(el.checkedIcon).toBe("lucide:check");
  });

  it("fires vu-change on user step click", async () => {
    const el = await fixture<VuSteps>(
      html`<vu-steps .steps=${sampleSteps} currentstep="1"></vu-steps>`,
    );
    await elementUpdated(el);
    let detail: { step: number; previous: number; cancel: () => void } | null = null;
    el.addEventListener("vu-change", (e) => {
      detail = (e as CustomEvent).detail;
    });
    el.shadowRoot?.querySelectorAll<HTMLButtonElement>(".step-btn")[1]?.click();
    await elementUpdated(el);
    expect(detail?.step).toBe(2);
    expect(detail?.previous).toBe(1);
    expect(typeof detail?.cancel).toBe("function");
    expect(el.currentStep).toBe(2);
  });

  it("vu-change cancel() blocks navigation", async () => {
    const el = await fixture<VuSteps>(
      html`<vu-steps .steps=${sampleSteps.slice(0, 2)} currentstep="1"></vu-steps>`,
    );
    await elementUpdated(el);
    el.addEventListener("vu-change", (e) => {
      (e as CustomEvent).detail.cancel();
    });
    el.shadowRoot?.querySelectorAll<HTMLButtonElement>(".step-btn")[1]?.click();
    await elementUpdated(el);
    expect(el.currentStep).toBe(1);
  });

  it("next() and previous() move the current step", async () => {
    const el = await fixture<VuSteps>(
      html`<vu-steps .steps=${sampleSteps.slice(0, 2)} currentstep="1"></vu-steps>`,
    );
    await elementUpdated(el);
    el.next();
    await elementUpdated(el);
    expect(el.currentStep).toBe(2);
    el.previous();
    await elementUpdated(el);
    expect(el.currentStep).toBe(1);
  });

  it("goToStep returns false when jump is not allowed", async () => {
    const el = await fixture<VuSteps>(
      html`<vu-steps
        .steps=${[{ label: "A" }, { label: "B" }, { label: "C" }]}
        currentstep="1"
        .allowStepJump=${false}
      ></vu-steps>`,
    );
    await elementUpdated(el);
    expect(el.goToStep(3)).toBe(false);
    expect(el.goToStep(2)).toBe(true);
    expect(el.currentStep).toBe(2);
    expect(el.goToStep(1)).toBe(true);
    expect(el.currentStep).toBe(1);
  });

  it("lastCompletedStep gates forward navigation when linear", async () => {
    const el = await fixture<VuSteps>(
      html`<vu-steps
        .steps=${[{ label: "A" }, { label: "B" }, { label: "C" }]}
        currentstep="1"
        lastcompletedstep="1"
        .allowStepJump=${false}
      ></vu-steps>`,
    );
    await elementUpdated(el);
    expect(el.goToStep(3)).toBe(false);
    expect(el.goToStep(2)).toBe(true);
    expect(el.currentStep).toBe(2);
  });

  it("reset() restores defaultCurrentStep", async () => {
    const el = await fixture<VuSteps>(
      html`<vu-steps
        .steps=${[{ label: "A" }, { label: "B" }]}
        currentstep="2"
        defaultcurrentstep="1"
      ></vu-steps>`,
    );
    await elementUpdated(el);
    el.reset();
    await elementUpdated(el);
    expect(el.currentStep).toBe(1);
  });

  it("readonly blocks step clicks", async () => {
    const el = await fixture<VuSteps>(
      html`<vu-steps
        readonly
        .steps=${[{ label: "A" }, { label: "B" }]}
        currentstep="1"
      ></vu-steps>`,
    );
    await elementUpdated(el);
    el.shadowRoot?.querySelectorAll<HTMLButtonElement>(".step-btn")[1]?.click();
    await elementUpdated(el);
    expect(el.currentStep).toBe(1);
  });

  it("renders error status on a step", async () => {
    const el = await fixture<VuSteps>(
      html`<vu-steps
        .steps=${[{ label: "A", status: "error" as const }, { label: "B" }]}
        currentstep="1"
      ></vu-steps>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector(".node.error")).toBeTruthy();
  });

  it("renders dots variant", async () => {
    const el = await fixture<VuSteps>(
      html`<vu-steps variant="dots" .steps=${sampleSteps.slice(0, 2)}></vu-steps>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector(".dot-btn")).toBeTruthy();
    expect(el.shadowRoot?.querySelector(".step-btn")).toBeNull();
  });

  it("renders progress variant", async () => {
    const el = await fixture<VuSteps>(
      html`<vu-steps variant="progress" .steps=${sampleSteps.slice(0, 2)}></vu-steps>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector(".progress-fill")).toBeTruthy();
  });

  it("labelPlacement below adds step-btn-below class", async () => {
    const el = await fixture<VuSteps>(
      html`<vu-steps
        labelplacement="below"
        .steps=${[{ label: "A" }]}
      ></vu-steps>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector(".step-btn-below")).toBeTruthy();
  });

  describe("keyboard", () => {
    const steps = [
      { label: "Account" },
      { label: "Shipping" },
      { label: "Payment" },
    ];

    it("ArrowRight advances the current step horizontally", async () => {
      const el = await fixture<VuSteps>(
        html`<vu-steps .steps=${steps} currentstep="1"></vu-steps>`,
      );
      await elementUpdated(el);
      const wrap = el.shadowRoot?.querySelector(".h-wrap") as HTMLElement;
      wrap?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );
      await elementUpdated(el);
      expect(el.currentStep).toBe(2);
    });

    it("ArrowLeft moves to the previous step horizontally", async () => {
      const el = await fixture<VuSteps>(
        html`<vu-steps .steps=${steps} currentstep="2"></vu-steps>`,
      );
      await elementUpdated(el);
      const wrap = el.shadowRoot?.querySelector(".h-wrap") as HTMLElement;
      wrap?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
      );
      await elementUpdated(el);
      expect(el.currentStep).toBe(1);
    });

    it("Home and End jump to first and last steps", async () => {
      const el = await fixture<VuSteps>(
        html`<vu-steps .steps=${steps} currentstep="2" allowstepjump></vu-steps>`,
      );
      await elementUpdated(el);
      const wrap = el.shadowRoot?.querySelector(".h-wrap") as HTMLElement;
      wrap?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "End", bubbles: true }),
      );
      await elementUpdated(el);
      expect(el.currentStep).toBe(3);
      wrap?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
      );
      await elementUpdated(el);
      expect(el.currentStep).toBe(1);
    });

    it("ArrowDown advances the current step vertically", async () => {
      const el = await fixture<VuSteps>(
        html`<vu-steps layout="vertical" .steps=${steps} currentstep="1"></vu-steps>`,
      );
      await elementUpdated(el);
      const list = el.shadowRoot?.querySelector(".v-list") as HTMLElement;
      list?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
      await elementUpdated(el);
      expect(el.currentStep).toBe(2);
    });
  });

  describe("slot composition", () => {
    it("uses slotted vu-step-item children instead of steps prop", async () => {
      const el = await fixture<VuSteps>(html`
        <vu-steps currentstep="1">
          <vu-step-item label="List"></vu-step-item>
          <vu-step-item label="Grid"></vu-step-item>
        </vu-steps>
      `);
      await elementUpdated(el);
      expect(el.usesSlotItems).toBe(true);
      expect(el.items).toHaveLength(2);
      expect(el.shadowRoot?.querySelector(".step-btn")).toBeNull();
    });

    it("moves horizontal slotted panel content into the panel stack", async () => {
      const el = await fixture<VuSteps>(html`
        <vu-steps currentstep="1">
          <vu-step-item label="One"><p id="panel-a">A</p></vu-step-item>
          <vu-step-item label="Two"><p id="panel-b">B</p></vu-step-item>
        </vu-steps>
      `);
      await elementUpdated(el);
      expect(el.shadowRoot?.querySelector("#steps-panel-1 #panel-a")).toBeTruthy();
      expect(el.shadowRoot?.querySelector("#steps-panel-2 #panel-b")).toBeTruthy();
      expect(el.querySelector("#panel-a")).toBeNull();
      expect(el.querySelector("#panel-b")).toBeNull();
    });

    it("renders horizontal connectors on slotted step items", async () => {
      const el = await fixture<VuSteps>(html`
        <vu-steps currentstep="2">
          <vu-step-item label="One"></vu-step-item>
          <vu-step-item label="Two"></vu-step-item>
          <vu-step-item label="Three"></vu-step-item>
        </vu-steps>
      `);
      await elementUpdated(el);
      const items = el.querySelectorAll("vu-step-item");
      expect(
        items[0]?.shadowRoot?.querySelector(".connector.active"),
      ).toBeTruthy();
      expect(
        items[1]?.shadowRoot?.querySelector(".connector:not(.active)"),
      ).toBeTruthy();
      expect(items[2]?.shadowRoot?.querySelector(".connector")).toBeNull();
    });
  });

  describe("accessibility", () => {
    it("default with steps", async () => {
      const el = await fixture<VuSteps>(
        html`<vu-steps .steps=${sampleSteps} currentstep="1" label="Checkout"></vu-steps>`,
      );
      await elementUpdated(el);
      expect(el.shadowRoot?.querySelector("nav[aria-label='Checkout']")).toBeTruthy();
      await expectA11y(el).to.be.accessible();
    });

    it("vertical layout with step items", async () => {
      const el = await fixture<VuSteps>(
        html`<vu-steps layout="vertical" currentstep="1">
          <vu-step-item label="Account">Body</vu-step-item>
        </vu-steps>`,
      );
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("expandAll keeps every vertical panel open", async () => {
      const el = await fixture<VuSteps>(
        html`<vu-steps layout="vertical" expandall currentstep="1">
          <vu-step-item label="One">A</vu-step-item>
          <vu-step-item label="Two">B</vu-step-item>
        </vu-steps>`,
      );
      await elementUpdated(el);
      const items = el.querySelectorAll("vu-step-item");
      expect(items).to.have.length(2);
      for (const item of items) {
        const panel = item.shadowRoot?.querySelector(".v-panel");
        expect(panel?.classList.contains("is-open")).to.equal(true);
      }
    });

    it("vertical layout with steps prop", async () => {
      const el = await fixture<VuSteps>(
        html`<vu-steps layout="vertical" .steps=${sampleSteps} currentstep="1"></vu-steps>`,
      );
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });
  });
});
