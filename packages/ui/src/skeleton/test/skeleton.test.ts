/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3 N/A 4✓ 5 N/A 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { resolveSkeletonDimensions } from "../internals/skeleton-shape.js";
import { VuSkeleton } from "../skeleton.js";

describe("resolveSkeletonDimensions", () => {
  it("applies variant defaults and author overrides", () => {
    expect(resolveSkeletonDimensions("text", "", "", "")).toMatchObject({
      width: "100%",
      height: "0.875em",
    });
    expect(resolveSkeletonDimensions("circular", "3rem", "3rem", "md")).toMatchObject({
      width: "3rem",
      height: "3rem",
      borderRadius: "var(--vu-radius-full)",
    });
    expect(resolveSkeletonDimensions("rectangular", "12rem", "", "sm").borderRadius).toBe(
      "var(--vu-radius-sm)",
    );
  });
});

describe("vu-skeleton", () => {
  it("is defined", () => {
    expect(customElements.get("vu-skeleton")).toBe(VuSkeleton);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuSkeleton>(html`<vu-skeleton></vu-skeleton>`);
    await elementUpdated(el);
    expect(el.variant).toBe("rectangular");
    expect(el.animation).toBe("wave");
    expect(el.tone).toBe("normal");
    expect(el.inline).toBe(false);
    const root = el.shadowRoot?.querySelector('[part="root"]') as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.style.blockSize).toBe("var(--vu-space-10)");
  });

  it("reflects variant and custom dimensions", async () => {
    const el = await fixture<VuSkeleton>(
      html`<vu-skeleton variant="circular" width="2.5rem" height="2.5rem"></vu-skeleton>`,
    );
    await elementUpdated(el);
    const root = el.shadowRoot?.querySelector('[part="root"]') as HTMLElement;
    expect(root.style.inlineSize).toBe("2.5rem");
    expect(root.style.blockSize).toBe("2.5rem");
  });

  it("supports inline text lines", async () => {
    const el = await fixture<VuSkeleton>(
      html`<vu-skeleton variant="text" inline width="70%"></vu-skeleton>`,
    );
    await elementUpdated(el);
    expect(el.inline).toBe(true);
    expect(el.getAttribute("inline")).toBe("");
    const root = el.shadowRoot?.querySelector('[part="root"]') as HTMLElement;
    expect(root.style.inlineSize).toBe("70%");
  });

  it("reflects animation and tone", async () => {
    const el = await fixture<VuSkeleton>(
      html`<vu-skeleton animation="pulse" tone="subtle"></vu-skeleton>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("animation")).toBe("pulse");
    expect(el.getAttribute("tone")).toBe("subtle");
  });
});

describe("accessibility", () => {
  it("default wave skeleton passes axe", async () => {
    const el = await fixture(html`<vu-skeleton></vu-skeleton>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("animation none passes axe", async () => {
    const el = await fixture(html`<vu-skeleton animation="none"></vu-skeleton>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
