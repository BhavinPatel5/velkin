/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5 N/A 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import "../../skeleton/skeleton.js";
import { VuSkeletonLoader } from "../skeleton-loader.js";

describe("vu-skeleton-loader", () => {
  it("is defined", () => {
    expect(customElements.get("vu-skeleton-loader")).toBe(VuSkeletonLoader);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuSkeletonLoader>(html`<vu-skeleton-loader></vu-skeleton-loader>`);
    await elementUpdated(el);
    expect(el.loading).toBe(false);
    expect(el.getAttribute("aria-busy")).toBe("false");
    expect(el.shadowRoot?.querySelector('[part="container"]')).toBeTruthy();
  });

  it("shows placeholder when loading", async () => {
    const el = await fixture<VuSkeletonLoader>(html`
      <vu-skeleton-loader loading>
        <div slot="placeholder" class="ph">Loading</div>
        <div class="content">Loaded</div>
      </vu-skeleton-loader>
    `);
    await elementUpdated(el);
    const placeholder = el.shadowRoot?.querySelector('[part="placeholder"]') as HTMLElement;
    const content = el.shadowRoot?.querySelector('[part="content"]') as HTMLElement;
    expect(placeholder.hidden).toBe(false);
    expect(content.hidden).toBe(true);
    expect(el.querySelector(".ph")).toBeTruthy();
    expect(el.querySelector(".content")).toBeTruthy();
  });

  it("shows content when not loading", async () => {
    const el = await fixture<VuSkeletonLoader>(html`
      <vu-skeleton-loader>
        <div slot="placeholder" class="ph">Loading</div>
        <div class="content">Loaded</div>
      </vu-skeleton-loader>
    `);
    await elementUpdated(el);
    const placeholder = el.shadowRoot?.querySelector('[part="placeholder"]') as HTMLElement;
    const content = el.shadowRoot?.querySelector('[part="content"]') as HTMLElement;
    expect(placeholder.hidden).toBe(true);
    expect(content.hidden).toBe(false);
  });

  it("updates aria-busy when loading toggles", async () => {
    const el = await fixture<VuSkeletonLoader>(
      html`<vu-skeleton-loader loading></vu-skeleton-loader>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("aria-busy")).toBe("true");
    el.loading = false;
    await elementUpdated(el);
    expect(el.getAttribute("aria-busy")).toBe("false");
  });
});

describe("accessibility", () => {
  it("loading loader passes axe", async () => {
    const el = await fixture(html`
      <vu-skeleton-loader loading>
        <div slot="placeholder"><vu-skeleton variant="text"></vu-skeleton></div>
        <p>Loaded copy</p>
      </vu-skeleton-loader>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("loaded loader passes axe", async () => {
    const el = await fixture(html`
      <vu-skeleton-loader>
        <div slot="placeholder"><vu-skeleton variant="text"></vu-skeleton></div>
        <p>Loaded copy</p>
      </vu-skeleton-loader>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
