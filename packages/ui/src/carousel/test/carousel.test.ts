/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3 N/A 4✓ 5✓ 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuCarousel } from "../carousel.js";
import "../../carousel-item/carousel-item.js";
import type { VuCarouselItem } from "../../carousel-item/carousel-item.js";

const slides = (n: number) =>
  html`${Array.from({ length: n }, (_, i) => html`<vu-carousel-item>Slide ${i + 1}</vu-carousel-item>`)}`;

describe("vu-carousel", () => {
  it("is defined", () => {
    expect(customElements.get("vu-carousel")).toBe(VuCarousel);
  });

  it("renders defaults — index 0, slidesPerView 1, dots controls, no autoplay", async () => {
    const el = await fixture<VuCarousel>(
      html`<vu-carousel label="Demo">${slides(3)}</vu-carousel>`,
    );
    await elementUpdated(el);

    expect(el.index).toBe(0);
    expect(el.slidesPerView).toBe(1);
    expect(el.slidesToScroll).toBe(1);
    expect(el.loop).toBe(false);
    expect(el.autoplay).toBe(false);
    expect(el.controls).toBe("dots");
    expect(el.gap).toBe("none");
    expect(el.orientation).toBe("horizontal");
  });

  it("applies APG carousel ARIA on host (region + roledescription + label)", async () => {
    const el = await fixture<VuCarousel>(
      html`<vu-carousel label="Featured products">${slides(3)}</vu-carousel>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("role")).toBe("region");
    expect(el.getAttribute("aria-roledescription")).toBe("carousel");
    expect(el.getAttribute("aria-label")).toBe("Featured products");
  });

  it("ARIA-decorates each carousel-item and inerts offscreen ones", async () => {
    const el = await fixture<VuCarousel>(
      html`<vu-carousel label="Demo">${slides(3)}</vu-carousel>`,
    );
    await elementUpdated(el);
    const items = Array.from(el.querySelectorAll("vu-carousel-item")) as VuCarouselItem[];
    expect(items[0].getAttribute("role")).toBe("group");
    expect(items[0].getAttribute("aria-roledescription")).toBe("slide");
    expect(items[0].getAttribute("aria-label")).toBe("1 of 3");
    expect(items[0].hasAttribute("inert")).toBe(false);
    expect(items[1].hasAttribute("inert")).toBe(true);
    expect(items[1].getAttribute("aria-hidden")).toBe("true");
    expect(items[2].hasAttribute("inert")).toBe(true);
  });

  it("honors per-item label over the position fallback", async () => {
    const el = await fixture<VuCarousel>(html`
      <vu-carousel label="Demo">
        <vu-carousel-item label="Cover">A</vu-carousel-item>
        <vu-carousel-item>B</vu-carousel-item>
      </vu-carousel>
    `);
    await elementUpdated(el);
    const items = Array.from(el.querySelectorAll("vu-carousel-item")) as VuCarouselItem[];
    expect(items[0].getAttribute("aria-label")).toBe("Cover");
    expect(items[1].getAttribute("aria-label")).toBe("2 of 2");
  });

  it("next() / prev() navigate and dispatch vu-change with previous index", async () => {
    const el = await fixture<VuCarousel>(
      html`<vu-carousel label="Demo">${slides(4)}</vu-carousel>`,
    );
    await elementUpdated(el);
    const events: Array<{ index: number; previous: number }> = [];
    el.addEventListener("vu-change", (e) => events.push((e as CustomEvent).detail));
    el.next();
    await elementUpdated(el);
    expect(el.index).toBe(1);
    el.next();
    await elementUpdated(el);
    expect(el.index).toBe(2);
    el.prev();
    await elementUpdated(el);
    expect(el.index).toBe(1);
    expect(events).toEqual([
      { index: 1, previous: 0 },
      { index: 2, previous: 1 },
      { index: 1, previous: 2 },
    ]);
  });

  it("loop wraps from last to first and first to last", async () => {
    const el = await fixture<VuCarousel>(
      html`<vu-carousel loop label="Demo">${slides(3)}</vu-carousel>`,
    );
    await elementUpdated(el);
    el.goTo(2);
    await elementUpdated(el);
    el.next();
    await elementUpdated(el);
    expect(el.index).toBe(0);
    el.prev();
    await elementUpdated(el);
    expect(el.index).toBe(2);
  });

  it("arrow buttons navigate when controls include arrows", async () => {
    const el = await fixture<VuCarousel>(
      html`<vu-carousel controls="both" label="Demo">${slides(3)}</vu-carousel>`,
    );
    await elementUpdated(el);
    const next = el.shadowRoot!.querySelector('[part="next"]') as HTMLButtonElement;
    next.click();
    await elementUpdated(el);
    expect(el.index).toBe(1);
  });

  it("dot click jumps to that page index", async () => {
    const el = await fixture<VuCarousel>(
      html`<vu-carousel label="Demo">${slides(3)}</vu-carousel>`,
    );
    await elementUpdated(el);
    const dots = el.shadowRoot!.querySelectorAll('[part~="dot"]');
    (dots[2] as HTMLButtonElement).click();
    await elementUpdated(el);
    expect(el.index).toBe(2);
  });

  it("controls=none hides arrows and dots", async () => {
    const el = await fixture<VuCarousel>(
      html`<vu-carousel controls="none" label="Demo">${slides(3)}</vu-carousel>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot!.querySelector('[part="prev"]')).toBeNull();
    expect(el.shadowRoot!.querySelector('[part="dots"]')).toBeNull();
  });

  it("slidesPerView reduces maxIndex and pages by slidesToScroll", async () => {
    const el = await fixture<VuCarousel>(
      html`<vu-carousel slidesperview="3" controls="both" label="Demo">
        ${slides(6)}
      </vu-carousel>`,
    );
    await elementUpdated(el);
    expect(el.maxIndex).toBe(3);
    el.slidesToScroll = 3;
    el.next();
    await elementUpdated(el);
    expect(el.index).toBe(3);
  });

  it("keyboard ArrowLeft/Right navigate horizontally", async () => {
    const el = await fixture<VuCarousel>(
      html`<vu-carousel controls="dots" label="Demo">${slides(4)}</vu-carousel>`,
    );
    await elementUpdated(el);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await elementUpdated(el);
    expect(el.index).toBe(1);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    await elementUpdated(el);
    expect(el.index).toBe(0);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    await elementUpdated(el);
    expect(el.index).toBe(3);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    await elementUpdated(el);
    expect(el.index).toBe(0);
  });

  it("keyboard ArrowUp/Down navigate when orientation=vertical", async () => {
    const el = await fixture<VuCarousel>(
      html`<vu-carousel orientation="vertical" style="block-size: 200px;" label="Demo">
        ${slides(3)}
      </vu-carousel>`,
    );
    await elementUpdated(el);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await elementUpdated(el);
    expect(el.index).toBe(1);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    await elementUpdated(el);
    expect(el.index).toBe(0);
    /* Horizontal arrows should NOT navigate when vertical. */
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await elementUpdated(el);
    expect(el.index).toBe(0);
  });

  it("does not steal Home/End from focused inputs inside slides", async () => {
    const el = await fixture<VuCarousel>(
      html`<vu-carousel label="Demo">
        <vu-carousel-item><input value="hello" /></vu-carousel-item>
        <vu-carousel-item>two</vu-carousel-item>
      </vu-carousel>`,
    );
    await elementUpdated(el);
    const input = el.querySelector("input")!;
    input.focus();
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "End", bubbles: true, composed: true }),
    );
    await elementUpdated(el);
    expect(el.index).toBe(0);
  });

  it("setting index attribute beyond range clamps to max via the getter (defensive)", async () => {
    const el = await fixture<VuCarousel>(
      html`<vu-carousel label="Demo">${slides(3)}</vu-carousel>`,
    );
    el.index = 99;
    await elementUpdated(el);
    /* Clamped index is what's used to render — read CSS var to confirm. */
    expect(el.style.getPropertyValue("--carousel-index").trim()).toBe("2");
  });

  it("loading=true sets aria-busy and renders the loading overlay", async () => {
    const el = await fixture<VuCarousel>(
      html`<vu-carousel loading label="Demo">${slides(3)}</vu-carousel>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("aria-busy")).toBe("true");
    expect(el.shadowRoot!.querySelector('[part="loading"]')).not.toBeNull();
  });

  it("live region reflects current slide for AT polite-read", async () => {
    const el = await fixture<VuCarousel>(
      html`<vu-carousel label="Demo">${slides(3)}</vu-carousel>`,
    );
    await elementUpdated(el);
    const live = el.shadowRoot!.querySelector('[part="live"]')!;
    expect(live.textContent).toContain("Slide 1 of 3");
    el.next();
    await elementUpdated(el);
    expect(live.textContent).toContain("Slide 2 of 3");
  });

  it("slot mutations re-sync items and update count", async () => {
    const el = await fixture<VuCarousel>(
      html`<vu-carousel label="Demo">${slides(2)}</vu-carousel>`,
    );
    await elementUpdated(el);
    const first = el.querySelector("vu-carousel-item") as VuCarouselItem;
    expect(first.getAttribute("aria-label")).toBe("1 of 2");
    const extra = document.createElement("vu-carousel-item") as VuCarouselItem;
    extra.textContent = "Slide 3";
    el.appendChild(extra);
    await elementUpdated(el);
    await elementUpdated(extra);
    expect(extra.getAttribute("aria-label")).toBe("3 of 3");
  });

  it("relays orientation onto items for vertical fill", async () => {
    const el = await fixture<VuCarousel>(
      html`<vu-carousel orientation="vertical" style="block-size: 200px;" label="Demo">
        ${slides(2)}
      </vu-carousel>`,
    );
    await elementUpdated(el);
    const item = el.querySelector("vu-carousel-item") as VuCarouselItem;
    expect(item.orientation).toBe("vertical");
  });

  it("clears aria-label when label is removed", async () => {
    const el = await fixture<VuCarousel>(
      html`<vu-carousel label="Featured">${slides(2)}</vu-carousel>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("aria-label")).toBe("Featured");
    el.label = "";
    await elementUpdated(el);
    expect(el.hasAttribute("aria-label")).toBe(false);
  });
});

describe("accessibility", () => {
  it("labeled carousel passes axe", async () => {
    const el = await fixture<VuCarousel>(
      html`<vu-carousel label="Featured">${slides(2)}</vu-carousel>`,
    );
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("carousel with arrows and loading passes axe", async () => {
    const el = await fixture<VuCarousel>(
      html`<vu-carousel label="Gallery" controls="both" loading>
        ${slides(3)}
      </vu-carousel>`,
    );
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
