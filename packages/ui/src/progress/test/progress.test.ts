/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3 N/A 4✓ 5 N/A 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { progressWidths } from "../internals/progress-value.js";
import { VuProgress } from "../progress.js";

describe("progressWidths", () => {
  it("normalizes progress and buffer segments", () => {
    expect(progressWidths(30, 100, 70)).toEqual({ progress: 30, buffer: 100 });
    expect(progressWidths(50, 100, 0)).toEqual({ progress: 50, buffer: 50 });
  });
});

describe("vu-progress", () => {
  it("is defined", () => {
    expect(customElements.get("vu-progress")).toBe(VuProgress);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuProgress>(html`<vu-progress></vu-progress>`);
    await elementUpdated(el);
    expect(el.value).toBe(0);
    expect(el.max).toBe(100);
    expect(el.buffer).toBe(0);
    expect(el.indeterminate).toBe(false);
    expect(el.variant).toBe("default");
    expect(el.size).toBe("md");
    expect(el.tone).toBe("normal");
    expect(el.block).toBe(false);
    expect(el.color).toBe("primary");
    expect(el.speed).toBe("1s");
    expect(el.label).toBe("");
    expect(el.shadowRoot?.querySelector('[part="bar"]')).toBeTruthy();
  });

  it("accepts value and max", async () => {
    const el = await fixture<VuProgress>(
      html`<vu-progress .value=${50} .max=${100}></vu-progress>`,
    );
    await elementUpdated(el);
    const bar = el.shadowRoot?.querySelector('[part="bar"]') as HTMLElement;
    expect(bar.style.inlineSize).toBe("50%");
  });

  it("renders buffer behind the fill", async () => {
    const el = await fixture<VuProgress>(
      html`<vu-progress .value=${30} .buffer=${70}></vu-progress>`,
    );
    await elementUpdated(el);
    const buffer = el.shadowRoot?.querySelector('[part="buffer"]') as HTMLElement;
    expect(buffer.style.inlineSize).toBe("100%");
  });

  it("reflects indeterminate mode", async () => {
    const el = await fixture<VuProgress>(html`<vu-progress indeterminate></vu-progress>`);
    await elementUpdated(el);
    expect(el.indeterminate).toBe(true);
    expect(el.getAttribute("indeterminate")).not.toBeNull();
    expect(el.shadowRoot?.querySelector('[part="indeterminate"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="bar"]')).toBeNull();
  });

  it("reflects color as a host attribute", async () => {
    const el = await fixture<VuProgress>(html`<vu-progress color="danger"></vu-progress>`);
    await elementUpdated(el);
    expect(el.color).toBe("danger");
    expect(el.getAttribute("color")).toBe("danger");
  });

  it("uses value as indeterminate segment width when positive", async () => {
    const el = await fixture<VuProgress>(
      html`<vu-progress indeterminate .value=${55}></vu-progress>`,
    );
    await elementUpdated(el);
    expect(el.style.getPropertyValue("--progress-indeterminate-width").trim()).toBe("55%");
  });

  it("renders ring variant with conic arc layers", async () => {
    const el = await fixture<VuProgress>(
      html`<vu-progress variant="ring" .value=${60} label="Save"></vu-progress>`,
    );
    await elementUpdated(el);
    expect(el.variant).toBe("ring");
    expect(el.shadowRoot?.querySelector('[part="ring"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector("svg")).toBeNull();
    const bar = el.shadowRoot?.querySelector('[part="bar"]') as HTMLElement;
    expect(bar.style.getPropertyValue("--progress-ring-pct").trim()).toBe("60%");
    expect(el.shadowRoot?.querySelector('[part="buffer"]')).toBeNull();
  });

  it("renders ring buffer layer when buffer is set", async () => {
    const el = await fixture<VuProgress>(
      html`<vu-progress variant="ring" .value=${32} .buffer=${40} label="Save"></vu-progress>`,
    );
    await elementUpdated(el);
    const buffer = el.shadowRoot?.querySelector('[part="buffer"]') as HTMLElement;
    expect(buffer.style.getPropertyValue("--progress-ring-pct").trim()).toBe("72%");
  });

  it("reflects outline and underline variants", async () => {
    const outline = await fixture<VuProgress>(html`<vu-progress variant="outline"></vu-progress>`);
    await elementUpdated(outline);
    expect(outline.getAttribute("variant")).toBe("outline");

    const underline = await fixture<VuProgress>(
      html`<vu-progress variant="underline"></vu-progress>`,
    );
    await elementUpdated(underline);
    expect(underline.getAttribute("variant")).toBe("underline");
  });

  it("reflects size and block", async () => {
    const el = await fixture<VuProgress>(html`<vu-progress size="lg" block></vu-progress>`);
    await elementUpdated(el);
    expect(el.size).toBe("lg");
    expect(el.block).toBe(true);
    expect(el.getAttribute("size")).toBe("lg");
  });

  it("exposes progressbar semantics", async () => {
    const el = await fixture<VuProgress>(
      html`<vu-progress label="Upload" .value=${40}></vu-progress>`,
    );
    await elementUpdated(el);
    const track = el.shadowRoot?.querySelector('[part="container"]');
    expect(track?.getAttribute("role")).toBe("progressbar");
    expect(track?.getAttribute("aria-label")).toBe("Upload");
    expect(track?.getAttribute("aria-valuenow")).toBe("40");
    expect(track?.getAttribute("aria-valuetext")).toBe("40%");
  });

  it("omits aria-valuenow and aria-valuetext when indeterminate", async () => {
    const el = await fixture<VuProgress>(html`<vu-progress indeterminate></vu-progress>`);
    await elementUpdated(el);
    const track = el.shadowRoot?.querySelector('[part="container"]');
    expect(track?.hasAttribute("aria-valuenow")).toBe(false);
    expect(track?.hasAttribute("aria-valuetext")).toBe(false);
  });
});

describe("accessibility", () => {
  it("default progress passes axe", async () => {
    const el = await fixture(html`<vu-progress label="Loading" .value=${45}></vu-progress>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("indeterminate progress passes axe", async () => {
    const el = await fixture(html`<vu-progress label="Loading" indeterminate></vu-progress>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("buffer progress passes axe", async () => {
    const el = await fixture(html`
      <vu-progress label="Streaming" .value=${32} .buffer=${68}></vu-progress>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("ring variant passes axe", async () => {
    const el = await fixture(html`
      <vu-progress variant="ring" label="Loading" .value=${60}></vu-progress>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("strong tone progress passes axe", async () => {
    const el = await fixture(html`
      <vu-progress label="Loading" tone="strong" .value=${60}></vu-progress>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
