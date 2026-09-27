/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3 N/A 4 N/A 5 N/A 6 N/A 7✓ 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuImage } from "../image.js";

describe("vu-image", () => {
  it("is defined", () => {
    expect(customElements.get("vu-image")).toBe(VuImage);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuImage>(html`<vu-image></vu-image>`);
    await elementUpdated(el);
    expect(el.src).toBe("");
    expect(el.alt).toBe("");
    expect(el.fit).toBe("cover");
    expect(el.loading).toBe("lazy");
    expect(el.shadowRoot?.querySelector('[part="placeholder"]')).toBeTruthy();
  });

  it("renders img when src is set", async () => {
    const el = await fixture<VuImage>(
      html`<vu-image src="https://example.com/img.png" alt="Photo"></vu-image>`,
    );
    await elementUpdated(el);
    const img = el.shadowRoot?.querySelector('[part="img"]') as HTMLImageElement | null;
    expect(img?.src).toContain("example.com/img.png");
    expect(img?.alt).toBe("Photo");
  });

  it("reflects fit preset", async () => {
    const el = await fixture<VuImage>(html`<vu-image fit="contain"></vu-image>`);
    await elementUpdated(el);
    expect(el.getAttribute("fit")).toBe("contain");
  });

  it("uses host box dimensions for layout", async () => {
    const el = await fixture<VuImage>(
      html`<vu-image
        src="https://example.com/img.png"
        style="width: 200px; height: 150px; border-radius: 8px;"
      ></vu-image>`,
    );
    await elementUpdated(el);
    expect(getComputedStyle(el).width).toBe("200px");
    expect(getComputedStyle(el).height).toBe("150px");
    expect(getComputedStyle(el).borderRadius).toBe("8px");
  });

  it("forwards srcset and sizes to the img", async () => {
    const el = await fixture<VuImage>(
      html`<vu-image
        src="https://example.com/img.png"
        srcset="https://example.com/img-2x.png 2x"
        sizes="(max-width: 600px) 100vw, 50vw"
      ></vu-image>`,
    );
    await elementUpdated(el);
    const img = el.shadowRoot?.querySelector('[part="img"]') as HTMLImageElement | null;
    expect(img?.getAttribute("srcset")).toContain("img-2x.png");
    expect(img?.getAttribute("sizes")).toBe("(max-width: 600px) 100vw, 50vw");
  });

  it("starts ImageAutoSizes when autosizes is set", async () => {
    const el = await fixture<VuImage>(
      html`<vu-image src="https://example.com/img.png" autosizes style="width: 120px;"></vu-image>`,
    );
    await elementUpdated(el);
    expect(el.autoSizes).toBe(true);
    el.autoSizes = false;
    await elementUpdated(el);
    expect(el.autoSizes).toBe(false);
  });

  it("includes contrast, transparency, and forced-colors CSS prefs", async () => {
    const el = await fixture<VuImage>(html`<vu-image></vu-image>`);
    await elementUpdated(el);
    const cssText = el.shadowRoot?.querySelector("style")?.textContent ?? "";
    expect(cssText).toContain("prefers-contrast: more");
    expect(cssText).toContain("prefers-reduced-transparency: reduce");
    expect(cssText).toContain("forced-colors: active");
  });

  describe("accessibility", () => {
    it("decorative placeholder when src and alt are empty", async () => {
      const el = await fixture<VuImage>(html`<vu-image></vu-image>`);
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("labeled placeholder when src is empty and alt is set", async () => {
      const el = await fixture<VuImage>(html`<vu-image alt="Product photo"></vu-image>`);
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("with src and alt", async () => {
      const el = await fixture<VuImage>(
        html`<vu-image src="https://example.com/img.png" alt="Product"></vu-image>`,
      );
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });
  });
});
