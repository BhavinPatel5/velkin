/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3 N/A 4✓ 5 N/A 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated } from "@open-wc/testing";
import { expect } from "vitest";
import { VuIcon } from "../icon.js";

describe("vu-icon", () => {
  it("is defined", () => {
    expect(customElements.get("vu-icon")).toBe(VuIcon);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuIcon>(html`<vu-icon></vu-icon>`);
    await elementUpdated(el);
    expect(el.icon).toBe("");
    expect(el.color).toBe("currentColor");
    expect(el.inline).toBe(false);
    expect(el.lazy).toBe(false);
    expect(el.shadowRoot?.querySelector('[part="icon"]')).toBeTruthy();
  });

  it("renders local ion icon on first paint (no async fetch)", async () => {
    const el = await fixture<VuIcon>(html`<vu-icon icon="ion:close"></vu-icon>`);
    expect(el.shadowRoot?.querySelector(".iconify svg")).toBeTruthy();
    expect(el.shadowRoot?.querySelector(".iconify")?.hasAttribute("hidden")).toBe(false);
  });

  it("does not peek remote-only names from the fetch cache", async () => {
    const { peekLocalIconSvg, resolveIconSvg } = await import("../internals/icon-data.js");
    expect(peekLocalIconSvg("ion:close")).toBeTruthy();
    expect(peekLocalIconSvg("simple-icons:markdown")).toBeNull();
    await resolveIconSvg("ion:close");
    expect(peekLocalIconSvg("simple-icons:markdown")).toBeNull();
  });

  it("renders local ion icon when icon name is set", async () => {
    const el = await fixture<VuIcon>(html`<vu-icon icon="ion:home"></vu-icon>`);
    await elementUpdated(el);
    expect(el.icon).toBe("ion:home");
    expect(el.shadowRoot?.querySelector("svg")).toBeTruthy();
  });

  it("reflects width and height when set", async () => {
    const el = await fixture<VuIcon>(
      html`<vu-icon icon="ion:person" width="48px" height="48px"></vu-icon>`,
    );
    await elementUpdated(el);
    expect(el.width).toBe("48px");
    expect(el.height).toBe("48px");
  });

  it("reflects inline property when set", async () => {
    const el = await fixture<VuIcon>(html`<vu-icon icon="ion:checkmark" inline></vu-icon>`);
    await elementUpdated(el);
    expect(el.inline).toBe(true);
  });

  it("renders custom SVG in default slot", async () => {
    const el = await fixture<VuIcon>(html`
      <vu-icon width="24" height="24">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      </vu-icon>
    `);
    await elementUpdated(el);
    const svg = el.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 24 24");
  });

  it("registerLocalIcon serves a one-off glyph", async () => {
    VuIcon.registerLocalIcon("custom:test", {
      body: '<circle cx="12" cy="12" r="10" />',
      width: 24,
      height: 24,
    });
    const el = await fixture<VuIcon>(html`<vu-icon icon="custom:test"></vu-icon>`);
    await elementUpdated(el);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector("circle")).toBeTruthy();
  });

  it("applies flip and rotate transforms", async () => {
    const el = await fixture<VuIcon>(
      html`<vu-icon icon="ion:home" flip="horizontal" rotate="1"></vu-icon>`,
    );
    await elementUpdated(el);
    await elementUpdated(el);
    const part = el.shadowRoot?.querySelector('[part="icon"]') as HTMLElement;
    expect(part?.getAttribute("style") ?? "").toContain("rotate(90deg)");
    expect(part?.getAttribute("style") ?? "").toContain("scale(-1, 1)");
  });

  it("switches to slotted SVG when added at runtime over an icon prop", async () => {
    const el = await fixture<VuIcon>(html`<vu-icon icon="ion:home"></vu-icon>`);
    await elementUpdated(el);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector(".iconify svg")).toBeTruthy();

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M12 2L2 12h3v8h14v-8h3z");
    svg.appendChild(path);
    el.appendChild(svg);
    await elementUpdated(el);
    await elementUpdated(el);

    expect(el.querySelector("svg")).toBeTruthy();
    expect(el.shadowRoot?.querySelector(".iconify")?.hasAttribute("hidden")).toBe(true);
    expect(el.shadowRoot?.querySelector("slot")?.hasAttribute("hidden")).toBe(false);
  });

  it("includes prefers-contrast and forced-colors CSS prefs", async () => {
    const el = await fixture<VuIcon>(html`<vu-icon></vu-icon>`);
    await elementUpdated(el);
    const cssText = el.shadowRoot?.querySelector("style")?.textContent ?? "";
    expect(cssText).toContain("prefers-contrast: more");
    expect(cssText).toContain("prefers-reduced-motion: reduce");
    expect(cssText).toContain("forced-colors: active");
  });
});
