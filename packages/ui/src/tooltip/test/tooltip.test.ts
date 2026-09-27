/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7✓ 8✓ 9 N/A
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect, vi } from "vitest";
import { VuTooltip } from "../tooltip.js";
import "../../button/button.js";

describe("vu-tooltip", () => {
  it("is defined", () => {
    expect(customElements.get("vu-tooltip")).toBe(VuTooltip);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuTooltip>(html`<vu-tooltip></vu-tooltip>`);
    await elementUpdated(el);
    expect(el.open).toBe(false);
    expect(el.placement).toBe("top");
    expect(el.align).toBe("center");
    expect(el.trigger).toBe("hover");
    expect(el.label).toBe("");
    expect(el.variant).toBe("elevated");
    expect(el.tone).toBe("normal");
    expect(el.size).toBe("md");
    expect(el.radius).toBe("md");
    expect(el.arrow).toBe(false);
    expect(el.interactive).toBe(false);
    expect(el.noAutoTrigger).toBe(false);
    expect(el.delay).toBeUndefined();
    expect(el.closeDelay).toBeUndefined();
    expect(el.offset).toBe(6);
    expect(el.block).toBe(false);
  });

  it("accepts block to stretch the trigger", async () => {
    const el = await fixture<VuTooltip>(html`<vu-tooltip block></vu-tooltip>`);
    await elementUpdated(el);
    expect(el.block).toBe(true);
    expect(el.hasAttribute("block")).toBe(true);
  });

  it("accepts label and placement", async () => {
    const el = await fixture<VuTooltip>(
      html`<vu-tooltip label="Help text" placement="bottom"></vu-tooltip>`,
    );
    await elementUpdated(el);
    expect(el.label).toBe("Help text");
    expect(el.placement).toBe("bottom");
  });

  it("reflects open", async () => {
    const el = await fixture<VuTooltip>(
      html`<vu-tooltip label="Hint" open></vu-tooltip>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("open")).toBe("");
  });

  it("accepts trigger and appearance props", async () => {
    const el = await fixture<VuTooltip>(
      html`
        <vu-tooltip
          trigger="click"
          variant="soft"
          tone="strong"
          size="lg"
          radius="lg"
          arrow
        ></vu-tooltip>
      `,
    );
    await elementUpdated(el);
    expect(el.trigger).toBe("click");
    expect(el.variant).toBe("soft");
    expect(el.tone).toBe("strong");
    expect(el.size).toBe("lg");
    expect(el.radius).toBe("lg");
    expect(el.arrow).toBe(true);
  });

  it("has trigger, surface, and content parts", async () => {
    const el = await fixture<VuTooltip>(html`<vu-tooltip></vu-tooltip>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="trigger"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="surface"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="content"]')).toBeTruthy();
  });

  it("renders default slot trigger content", async () => {
    const el = await fixture<VuTooltip>(
      html`
        <vu-tooltip label="Hint">
          <vu-button label="Action"></vu-button>
        </vu-tooltip>
      `,
    );
    await elementUpdated(el);
    expect(el.querySelector("vu-button")).toBeTruthy();
  });

  it("show, hide, and toggle methods", async () => {
    const el = await fixture<VuTooltip>(
      html`<vu-tooltip label="Hint"></vu-tooltip>`,
    );
    await elementUpdated(el);
    el.show();
    await elementUpdated(el);
    expect(el.open).toBe(true);
    el.hide();
    await elementUpdated(el);
    expect(el.open).toBe(false);
    el.toggle();
    await elementUpdated(el);
    expect(el.open).toBe(true);
  });

  it("does not open without label or tooltip slot", async () => {
    const el = await fixture<VuTooltip>(html`<vu-tooltip></vu-tooltip>`);
    await elementUpdated(el);
    el.show();
    await elementUpdated(el);
    expect(el.open).toBe(false);
  });

  it("emits vu-open-change when opened", async () => {
    const el = await fixture<VuTooltip>(
      html`<vu-tooltip label="Hint"></vu-tooltip>`,
    );
    await elementUpdated(el);
    let detail: { open: boolean } | undefined;
    el.addEventListener("vu-open-change", ((e: CustomEvent<{ open: boolean }>) => {
      detail = e.detail;
    }) as EventListener);
    el.show();
    await elementUpdated(el);
    expect(detail?.open).toBe(true);
  });

  it("emits vu-open and vu-close", async () => {
    const el = await fixture<VuTooltip>(
      html`<vu-tooltip label="Hint"></vu-tooltip>`,
    );
    await elementUpdated(el);
    const events: string[] = [];
    el.addEventListener("vu-open", () => events.push("vu-open"));
    el.addEventListener("vu-close", () => events.push("vu-close"));
    el.show();
    await elementUpdated(el);
    el.hide();
    await elementUpdated(el);
    expect(events).toContain("vu-open");
    expect(events).toContain("vu-close");
  });

  it("Escape closes while open without focus on trigger", async () => {
    const el = await fixture<VuTooltip>(
      html`
        <vu-tooltip label="Hint" .open=${true}>
          <vu-button label="Action"></vu-button>
        </vu-tooltip>
      `,
    );
    await elementUpdated(el);
    expect(el.open).toBe(true);
    (document.body as HTMLElement).focus();
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    await elementUpdated(el);
    expect(el.open).toBe(false);
  });

  it("sets aria-describedby on trigger when open", async () => {
    const el = await fixture<VuTooltip>(
      html`<vu-tooltip label="Hint"></vu-tooltip>`,
    );
    await elementUpdated(el);
    el.show();
    await elementUpdated(el);
    const trigger = el.shadowRoot?.querySelector('[part="trigger"]');
    const surface = el.shadowRoot?.querySelector('[part="surface"]');
    expect(trigger?.getAttribute("aria-describedby")).toBe(surface?.id);
    expect(surface?.getAttribute("role")).toBe("tooltip");
  });

  it("sets --tooltip-arrow-offset when open with arrow", async () => {
    const el = await fixture<VuTooltip>(
      html`
        <vu-tooltip label="Hint" arrow .open=${true}>
          <vu-button label="Action"></vu-button>
        </vu-tooltip>
      `,
    );
    await elementUpdated(el);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const offset = el.style.getPropertyValue("--tooltip-arrow-offset");
    expect(offset).not.toBe("");
    expect(offset.endsWith("px")).toBe(true);
  });

  it("keeps --tooltip-arrow-offset while closing", async () => {
    const el = await fixture<VuTooltip>(
      html`
        <vu-tooltip label="Hint" arrow .open=${true}>
          <vu-button label="Action"></vu-button>
        </vu-tooltip>
      `,
    );
    await elementUpdated(el);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const offset = el.style.getPropertyValue("--tooltip-arrow-offset");
    expect(offset).not.toBe("");

    el.hide();
    await elementUpdated(el);
    expect(el.style.getPropertyValue("--tooltip-arrow-offset")).toBe(offset);
  });

  it("exposes layout tokens as CSS variables", async () => {
    const el = await fixture<VuTooltip>(html`<vu-tooltip></vu-tooltip>`);
    await elementUpdated(el);
    const cssText = el.shadowRoot?.querySelector("style")?.textContent ?? "";
    expect(cssText).toContain("--tooltip-panel-bg");
    expect(cssText).toContain("--tooltip-border-color");
    expect(cssText).toContain("--tooltip-max-width");
  });
});

describe("accessibility", () => {
  it("closed default with label", async () => {
    const el = await fixture<VuTooltip>(
      html`
        <vu-tooltip label="Save document">
          <vu-button label="Save"></vu-button>
        </vu-tooltip>
      `,
    );
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("open with tooltip slot", async () => {
    const el = await fixture<VuTooltip>(
      html`
        <vu-tooltip .open=${true}>
          <vu-button label="Info"></vu-button>
          <span slot="tooltip">More details here</span>
        </vu-tooltip>
      `,
    );
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("open in RTL document context", async () => {
    const wrap = await fixture(html`
      <div dir="rtl" lang="en">
        <vu-tooltip label="Hint" .open=${true}>
          <vu-button label="Info"></vu-button>
        </vu-tooltip>
      </div>
    `);
    await elementUpdated(wrap);
    const el = wrap.querySelector("vu-tooltip") as VuTooltip;
    await expectA11y(el).to.be.accessible();
  });
});
