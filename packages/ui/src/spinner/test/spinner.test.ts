/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3 N/A 4✓ 5 N/A 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { resolveSpinnerSize, spinnerSpeedPeriod } from "../internals/spinner-size.js";
import { VuSpinner } from "../spinner.js";

describe("spinner-size helpers", () => {
  it("resolves presets and custom lengths", () => {
    expect(resolveSpinnerSize("md")).toBe("var(--vu-control-height-sm)");
    expect(resolveSpinnerSize("48")).toBe("48px");
    expect(resolveSpinnerSize("2rem")).toBe("2rem");
  });

  it("derives animation period from speed multiplier", () => {
    expect(spinnerSpeedPeriod(1)).toBe("0.8000s");
    expect(spinnerSpeedPeriod(2)).toBe("0.4000s");
  });
});

describe("vu-spinner", () => {
  it("is defined", () => {
    expect(customElements.get("vu-spinner")).toBe(VuSpinner);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuSpinner>(html`<vu-spinner></vu-spinner>`);
    await elementUpdated(el);
    expect(el.variant).toBe("solid");
    expect(el.size).toBe("md");
    expect(el.color).toBe("primary");
    expect(el.label).toBe("");
    expect(el.overlay).toBe(false);
    expect(el.fullscreen).toBe(false);
    expect(el.backdropBlur).toBe(false);
    expect(el.speed).toBe(1);
    expect(el.paused).toBe(false);
    expect(el.shadowRoot?.querySelector('[part="spinner"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="circle"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="text"]')).toBeNull();
  });

  it("renders dots variant structure", async () => {
    const el = await fixture<VuSpinner>(html`<vu-spinner variant="dots"></vu-spinner>`);
    await elementUpdated(el);
    expect(el.variant).toBe("dots");
    expect(el.shadowRoot?.querySelector('[part="dots"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelectorAll('[part="dot"]').length).toBe(3);
    expect(el.shadowRoot?.querySelector('[part="circle"]')).toBeNull();
  });

  it("renders bars variant structure", async () => {
    const el = await fixture<VuSpinner>(html`<vu-spinner variant="bars"></vu-spinner>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelectorAll('[part="bar"]').length).toBe(4);
  });

  it("reflects color and overlay attributes", async () => {
    const el = await fixture<VuSpinner>(
      html`<vu-spinner color="success" overlay paused></vu-spinner>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("color")).toBe("success");
    expect(el.getAttribute("overlay")).not.toBeNull();
    expect(el.getAttribute("paused")).not.toBeNull();
  });

  it("syncs custom size to host CSS variables", async () => {
    const el = await fixture<VuSpinner>(html`<vu-spinner size="40px"></vu-spinner>`);
    await elementUpdated(el);
    expect(el.style.getPropertyValue("--spinner-size").trim()).toBe("40px");
    expect(el.style.getPropertyValue("--spinner-thickness")).toBe("");
  });

  it("leaves ring thickness to size CSS instead of a host inline override", async () => {
    const el = await fixture<VuSpinner>(html`<vu-spinner size="xs"></vu-spinner>`);
    await elementUpdated(el);
    expect(el.getAttribute("size")).toBe("xs");
    expect(el.style.getPropertyValue("--spinner-thickness")).toBe("");

    el.size = "xl";
    await elementUpdated(el);
    expect(el.getAttribute("size")).toBe("xl");
    expect(el.style.getPropertyValue("--spinner-thickness")).toBe("");
  });

  it("exposes status semantics", async () => {
    const el = await fixture<VuSpinner>(
      html`<vu-spinner label="Loading application"></vu-spinner>`,
    );
    await elementUpdated(el);
    const root = el.shadowRoot?.querySelector('[part="spinner"]');
    expect(root?.getAttribute("role")).toBe("status");
    expect(root?.getAttribute("aria-busy")).toBe("true");
    expect(root?.getAttribute("aria-live")).toBe("polite");
    expect(root?.getAttribute("aria-label")).toBe("Loading application");
  });
});

describe("accessibility", () => {
  it("default spinner passes axe", async () => {
    const el = await fixture(html`<vu-spinner></vu-spinner>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("dots variant passes axe", async () => {
    const el = await fixture(html`<vu-spinner variant="dots"></vu-spinner>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("labeled spinner passes axe", async () => {
    const el = await fixture(html`<vu-spinner label="Saving"></vu-spinner>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
