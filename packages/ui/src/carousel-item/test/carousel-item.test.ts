/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5 N/A 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuCarouselItem } from "../carousel-item.js";
import "../../carousel/carousel.js";

describe("vu-carousel-item", () => {
  it("is defined", () => {
    expect(customElements.get("vu-carousel-item")).toBe(VuCarouselItem);
  });

  it("renders defaults — empty label, horizontal orientation", async () => {
    const el = await fixture<VuCarouselItem>(
      html`<vu-carousel-item>Slide</vu-carousel-item>`,
    );
    await elementUpdated(el);
    expect(el.label).toBe("");
    expect(el.orientation).toBe("horizontal");
    expect(el.inView).toBe(false);
    expect(el.shadowRoot?.querySelector('[part="base"]')).not.toBeNull();
  });

  it("projects default slot content into part=base", async () => {
    const el = await fixture<VuCarouselItem>(
      html`<vu-carousel-item><span class="inner">Hello</span></vu-carousel-item>`,
    );
    await elementUpdated(el);
    expect(el.querySelector(".inner")?.textContent).toBe("Hello");
  });

  it("applies slide ARIA from relayed props and custom label", async () => {
    const el = await fixture<VuCarouselItem>(
      html`<vu-carousel-item label="Hero shot">Slide</vu-carousel-item>`,
    );
    await elementUpdated(el);
    el.slideRole = "slide";
    el.positionLabel = "1 of 3";
    el.inView = true;
    await elementUpdated(el);
    expect(el.getAttribute("role")).toBe("group");
    expect(el.getAttribute("aria-roledescription")).toBe("slide");
    expect(el.getAttribute("aria-label")).toBe("Hero shot");
    expect(el.hasAttribute("inert")).toBe(false);
    expect(el.hasAttribute("aria-hidden")).toBe(false);
  });

  it("uses positionLabel when label is empty and marks offscreen slides inert", async () => {
    const el = await fixture<VuCarouselItem>(html`<vu-carousel-item>Slide</vu-carousel-item>`);
    await elementUpdated(el);
    el.slideRole = "slide";
    el.positionLabel = "2 of 4";
    el.inView = false;
    await elementUpdated(el);
    expect(el.getAttribute("aria-label")).toBe("2 of 4");
    expect(el.hasAttribute("inert")).toBe(true);
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("accessibility", () => {
  it("item inside labeled carousel passes axe", async () => {
    const wrap = await fixture(html`
      <vu-carousel label="Featured">
        <vu-carousel-item>One</vu-carousel-item>
        <vu-carousel-item>Two</vu-carousel-item>
      </vu-carousel>
    `);
    await elementUpdated(wrap);
    const item = wrap.querySelector("vu-carousel-item") as VuCarouselItem;
    await expectA11y(item).to.be.accessible();
  });

  it("default in RTL document context", async () => {
    const wrap = await fixture(html`
      <div dir="rtl" lang="en">
        <vu-carousel label="Featured">
          <vu-carousel-item>One</vu-carousel-item>
        </vu-carousel>
      </div>
    `);
    await elementUpdated(wrap);
    const item = wrap.querySelector("vu-carousel-item") as VuCarouselItem;
    await expectA11y(item).to.be.accessible();
  });
});
