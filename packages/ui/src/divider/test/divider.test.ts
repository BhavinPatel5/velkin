/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3 N/A 4✓ 5 N/A 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuDivider } from "../divider.js";

describe("vu-divider", () => {
  it("is defined", () => {
    expect(customElements.get("vu-divider")).toBe(VuDivider);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuDivider>(html`<vu-divider></vu-divider>`);
    await elementUpdated(el);
    expect(el.direction).toBe("horizontal");
    expect(el.inset).toBe(false);
    expect(el.size).toBe("md");

    const divider = el.shadowRoot?.querySelector('[part="divider"]');
    expect(divider?.tagName).toBe("HR");
    expect(divider?.getAttribute("role")).toBe("separator");
    expect(divider?.getAttribute("aria-orientation")).toBe("horizontal");
  });

  it("reflects direction, inset, and size", async () => {
    const el = await fixture<VuDivider>(
      html`<vu-divider direction="vertical" inset size="lg"></vu-divider>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("direction")).toBe("vertical");
    expect(el.hasAttribute("inset")).toBe(true);
    expect(el.getAttribute("size")).toBe("lg");
    expect(el.shadowRoot?.querySelector('[part="divider"]')?.getAttribute("aria-orientation")).toBe(
      "vertical",
    );
  });

  it("exposes layout tokens as CSS variables", async () => {
    const el = await fixture<VuDivider>(html`<vu-divider></vu-divider>`);
    await elementUpdated(el);
    const cssText = el.shadowRoot?.querySelector("style")?.textContent ?? "";
    expect(cssText).toContain("--divider-color");
    expect(cssText).toContain("--divider-thickness");
    expect(cssText).toContain("--divider-inset");
    expect(cssText).toContain("prefers-contrast: more");
    expect(cssText).toContain("forced-colors: active");
  });

  it("styles inset horizontal dividers with edge offsets", async () => {
    const el = await fixture<VuDivider>(html`<vu-divider inset></vu-divider>`);
    await elementUpdated(el);
    const cssText = el.shadowRoot?.querySelector("style")?.textContent ?? "";
    expect(cssText).toContain("padding-inline: var(--divider-inset)");
  });

  it("applies --divider-margin on the host (not the hairline) to avoid collapse", async () => {
    const el = await fixture<VuDivider>(html`<vu-divider></vu-divider>`);
    await elementUpdated(el);
    const cssText = el.shadowRoot?.querySelector("style")?.textContent ?? "";
    expect(cssText).toContain("margin: var(--divider-margin)");
    expect(cssText).toContain("display: flow-root");
    expect(cssText).toMatch(/\[part="divider"\][\s\S]*?margin:\s*0/);
  });

  describe("accessibility", () => {
    it("horizontal", async () => {
      const el = await fixture<VuDivider>(html`<vu-divider></vu-divider>`);
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("vertical", async () => {
      const el = await fixture<VuDivider>(
        html`<vu-divider direction="vertical" style="--divider-length: 4rem;"></vu-divider>`,
      );
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("inset horizontal", async () => {
      const el = await fixture<VuDivider>(html`<vu-divider inset></vu-divider>`);
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });
  });
});
