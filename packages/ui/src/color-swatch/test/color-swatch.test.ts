/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3 N/A 4✓ 5✓ 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { elementUpdated, fixture, html, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuColorSwatch } from "../color-swatch.js";

describe("vu-color-swatch", () => {
  it("is defined", () => {
    expect(customElements.get("vu-color-swatch")).toBe(VuColorSwatch);
  });

  it("non-selectable defaults — div with role=img, aria-label from color", async () => {
    const el = await fixture<VuColorSwatch>(
      html`<vu-color-swatch color="#ff0000"></vu-color-swatch>`,
    );
    await elementUpdated(el);
    const base = el.shadowRoot?.querySelector('[part="base"]');
    expect(base?.tagName).toBe("DIV");
    expect(base?.getAttribute("role")).toBe("img");
    expect(base?.getAttribute("aria-label")).toBe("Color #ff0000");
  });

  it("selectable renders a real <button> with aria-pressed and forwards activation as vu-select", async () => {
    const el = await fixture<VuColorSwatch>(
      html`<vu-color-swatch color="#00ff00" selectable></vu-color-swatch>`,
    );
    await elementUpdated(el);
    const base = el.shadowRoot?.querySelector('[part="base"]');
    expect(base?.tagName).toBe("BUTTON");
    expect(base?.getAttribute("aria-pressed")).toBe("false");

    let detail: { color: string; value: string } | null = null;
    el.addEventListener("vu-select", (e) => {
      detail = (e as CustomEvent).detail;
    });
    (base as HTMLButtonElement).click();
    expect(detail).toEqual({ color: "#00ff00", value: "#00ff00" });
  });

  it("custom value is forwarded in detail; aria-pressed reflects selected", async () => {
    const el = await fixture<VuColorSwatch>(
      html`<vu-color-swatch color="#abc" value="brand-50" selectable selected></vu-color-swatch>`,
    );
    await elementUpdated(el);
    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLButtonElement;
    expect(base.getAttribute("aria-pressed")).toBe("true");
    let detail: { color: string; value: string } | null = null;
    el.addEventListener("vu-select", (e) => {
      detail = (e as CustomEvent).detail;
    });
    base.click();
    expect(detail).toEqual({ color: "#abc", value: "brand-50" });
  });

  it("disabled selectable swatch ignores clicks", async () => {
    const el = await fixture<VuColorSwatch>(
      html`<vu-color-swatch color="#abc" selectable disabled></vu-color-swatch>`,
    );
    await elementUpdated(el);
    let fired = false;
    el.addEventListener("vu-select", () => {
      fired = true;
    });
    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLButtonElement;
    base.click();
    expect(fired).toBe(false);
    expect(el.getAttribute("aria-disabled")).toBe("true");
  });

  it("readonly selectable swatch stays focusable but ignores clicks", async () => {
    const el = await fixture<VuColorSwatch>(
      html`<vu-color-swatch color="#abc" selectable readonly></vu-color-swatch>`,
    );
    await elementUpdated(el);
    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLButtonElement;
    expect(base.disabled).toBe(false);
    let fired = false;
    el.addEventListener("vu-select", () => {
      fired = true;
    });
    base.click();
    expect(fired).toBe(false);
  });

  it("reflects all size tokens", async () => {
    for (const size of ["xs", "sm", "md", "lg", "xl"] as const) {
      const el = await fixture<VuColorSwatch>(
        html`<vu-color-swatch color="#000" size=${size}></vu-color-swatch>`,
      );
      await elementUpdated(el);
      expect(el.getAttribute("size")).toBe(size);
    }
  });

  it("color-name sets aria-label", async () => {
    const el = await fixture<VuColorSwatch>(
      html`<vu-color-swatch color="#abc" colorname="Brand accent"></vu-color-swatch>`,
    );
    await elementUpdated(el);
    const base = el.shadowRoot?.querySelector('[part="base"]');
    expect(base?.getAttribute("aria-label")).toBe("Brand accent");
  });

  it("color flows to --color-swatch-color CSS custom prop", async () => {
    const el = await fixture<VuColorSwatch>(
      html`<vu-color-swatch color="rebeccapurple"></vu-color-swatch>`,
    );
    await elementUpdated(el);
    expect(el.style.getPropertyValue("--color-swatch-color")).toBe("rebeccapurple");
  });
});

describe("accessibility", () => {
  it("display swatch passes axe", async () => {
    const el = await fixture(html`<vu-color-swatch color="#336699"></vu-color-swatch>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
