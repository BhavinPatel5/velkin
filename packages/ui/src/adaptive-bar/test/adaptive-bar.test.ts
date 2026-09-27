/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuAdaptiveBar } from "../adaptive-bar.js";
import { adaptiveBarMeasureLayout } from "../internals/adaptive-bar-measure.js";
import "../../icon/icon.js";
import "../../adaptive-item/adaptive-item.js";

const mockRect = (width: number) => ({
  width,
  height: 16,
  top: 0,
  left: 0,
  right: width,
  bottom: 16,
  x: 0,
  y: 0,
  toJSON: () => ({}),
});

describe("adaptiveBarMeasureLayout", () => {
  it("returns no overflow when items fit with gaps", () => {
    const result = adaptiveBarMeasureLayout({
      itemWidths: [40, 40, 40],
      itemGap: 8,
      availableWidth: 140,
      buffer: 0,
    });
    expect(result.hiddenCount).toBe(0);
    expect(result.fullyOverflowed).toBe(false);
  });

  it("overflows trailing items when budget is exceeded", () => {
    const result = adaptiveBarMeasureLayout({
      itemWidths: [50, 50, 50],
      itemGap: 8,
      availableWidth: 110,
      buffer: 0,
    });
    expect(result.hiddenCount).toBe(1);
    expect(result.fullyOverflowed).toBe(false);
  });

  it("marks fullyOverflowed when every item is hidden", () => {
    const result = adaptiveBarMeasureLayout({
      itemWidths: [80, 80],
      itemGap: 8,
      availableWidth: 40,
      buffer: 0,
    });
    expect(result.hiddenCount).toBe(2);
    expect(result.fullyOverflowed).toBe(true);
  });
});

describe("vu-adaptive-bar", () => {
  it("is defined", () => {
    expect(customElements.get("vu-adaptive-bar")).toBe(VuAdaptiveBar);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuAdaptiveBar>(html`<vu-adaptive-bar></vu-adaptive-bar>`);
    await elementUpdated(el);
    expect(el).toBeTruthy();
    expect(el.menuOpen).toBe(false);
    expect(el.gapThreshold).toBe(0);
    expect(el.fullyOverflowed).toBe(false);
  });

  it("accepts gapthreshold buffer", async () => {
    const el = await fixture<VuAdaptiveBar>(
      html`<vu-adaptive-bar gapthreshold="12"></vu-adaptive-bar>`,
    );
    await elementUpdated(el);
    expect(el.gapThreshold).toBe(12);
  });

  it("has bar and container parts", async () => {
    const el = await fixture<VuAdaptiveBar>(html`<vu-adaptive-bar></vu-adaptive-bar>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="bar"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="container"]')).toBeTruthy();
  });

  it("has overflow-button and menu parts", async () => {
    const el = await fixture<VuAdaptiveBar>(html`<vu-adaptive-bar></vu-adaptive-bar>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="overflow-button"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="menu"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="menu-inner"]')).toBeTruthy();
  });

  it("accepts menuopen", async () => {
    const el = await fixture<VuAdaptiveBar>(html`<vu-adaptive-bar menuopen></vu-adaptive-bar>`);
    await elementUpdated(el);
    expect(el.menuOpen).toBe(true);
  });

  it("recalculateLayout is callable", async () => {
    const el = await fixture<VuAdaptiveBar>(html`<vu-adaptive-bar></vu-adaptive-bar>`);
    await elementUpdated(el);
    expect(() => el.recalculateLayout()).not.toThrow();
  });

  it("openMenu, closeMenu, and toggleMenu control menuOpen", async () => {
    const el = await fixture<VuAdaptiveBar>(html`<vu-adaptive-bar></vu-adaptive-bar>`);
    await elementUpdated(el);
    el.openMenu();
    await elementUpdated(el);
    expect(el.menuOpen).toBe(true);
    el.closeMenu();
    await elementUpdated(el);
    expect(el.menuOpen).toBe(false);
    el.toggleMenu();
    await elementUpdated(el);
    expect(el.menuOpen).toBe(true);
  });

  it("uses a stable menu id from the host id", async () => {
    const el = await fixture<VuAdaptiveBar>(html`<vu-adaptive-bar id="nav-bar"></vu-adaptive-bar>`);
    await elementUpdated(el);
    const btn = el.shadowRoot?.querySelector('[part="overflow-button"]');
    const menu = el.shadowRoot?.querySelector('[part="menu"]');
    expect(btn?.getAttribute("aria-controls")).toBe("nav-bar-menu");
    expect(menu?.id).toBe("nav-bar-menu");
  });

  it("forwards itemSize to vu-adaptive-item children without their own size", async () => {
    const el = await fixture<VuAdaptiveBar>(html`
      <vu-adaptive-bar itemsize="lg">
        <vu-adaptive-item id="a"><a href="#">A</a></vu-adaptive-item>
        <vu-adaptive-item id="b" size="sm"><a href="#">B</a></vu-adaptive-item>
      </vu-adaptive-bar>
    `);
    await elementUpdated(el);
    expect(el.querySelector("#a")?.getAttribute("size")).toBe("lg");
    expect(el.querySelector("#b")?.getAttribute("size")).toBe("sm");
  });

  it("forwards bar size to items when itemsize attribute is omitted", async () => {
    const el = await fixture<VuAdaptiveBar>(html`
      <vu-adaptive-bar size="lg">
        <vu-adaptive-item id="a"><a href="#">A</a></vu-adaptive-item>
        <vu-adaptive-item id="b" size="sm"><a href="#">B</a></vu-adaptive-item>
      </vu-adaptive-bar>
    `);
    await elementUpdated(el);
    expect(el.querySelector("#a")?.getAttribute("size")).toBe("lg");
    expect(el.querySelector("#b")?.getAttribute("size")).toBe("sm");
  });

  it("accepts variant, tone, size, and justify", async () => {
    const el = await fixture<VuAdaptiveBar>(
      html`<vu-adaptive-bar
        variant="elevated"
        tone="strong"
        size="lg"
        justify="center"
      ></vu-adaptive-bar>`,
    );
    await elementUpdated(el);
    expect(el.variant).toBe("elevated");
    expect(el.tone).toBe("strong");
    expect(el.size).toBe("lg");
    expect(el.justify).toBe("center");
  });

  it("accepts placement", async () => {
    const el = await fixture<VuAdaptiveBar>(
      html`<vu-adaptive-bar placement="top"></vu-adaptive-bar>`,
    );
    await elementUpdated(el);
    expect(el.placement).toBe("top");
  });

  it("has native overflow trigger button", async () => {
    const el = await fixture<VuAdaptiveBar>(html`<vu-adaptive-bar></vu-adaptive-bar>`);
    await elementUpdated(el);
    const btn = el.shadowRoot?.querySelector('[part="overflow-button"]');
    expect(btn?.tagName).toBe("BUTTON");
    expect(btn?.getAttribute("aria-label")).toBe("More");
  });

  it("has default and overflow slots in shadow", async () => {
    const el = await fixture<VuAdaptiveBar>(
      html`<vu-adaptive-bar
        ><vu-adaptive-item>A</vu-adaptive-item><span slot="overflow">B</span></vu-adaptive-bar
      >`,
    );
    await elementUpdated(el);
    expect(el.querySelector("vu-adaptive-item")).toBeTruthy();
    const overflowSlot = el.shadowRoot?.querySelector('slot[name="overflow"]');
    expect(overflowSlot).toBeTruthy();
    expect(el.children.length).toBeGreaterThanOrEqual(1);
  });

  it("remasures when vu-resize fires", async () => {
    const el = await fixture<VuAdaptiveBar>(html`
      <vu-adaptive-bar style="display:block;width:320px">
        <vu-adaptive-item><a href="#">A</a></vu-adaptive-item>
        <vu-adaptive-item><a href="#">B</a></vu-adaptive-item>
        <vu-adaptive-item><a href="#">C</a></vu-adaptive-item>
      </vu-adaptive-bar>
    `);
    await elementUpdated(el);

    const items = Array.from(el.querySelectorAll("vu-adaptive-item"));
    const mainItems = el.shadowRoot?.querySelector(".main-items") as HTMLElement;
    for (const item of items) {
      Object.defineProperty(item, "getBoundingClientRect", {
        configurable: true,
        value: () => mockRect(80),
      });
    }
    Object.defineProperty(mainItems, "clientWidth", {
      configurable: true,
      value: 120,
    });

    el.recalculateLayout();
    await elementUpdated(el);
    expect(items.some((item) => item.getAttribute("slot") === "overflow")).toBe(true);

    for (const item of items) {
      Object.defineProperty(item, "getBoundingClientRect", {
        configurable: true,
        value: () => mockRect(30),
      });
    }
    items[0]?.dispatchEvent(new CustomEvent("vu-resize", { bubbles: true, composed: true }));
    await new Promise((r) => requestAnimationFrame(r));
    await elementUpdated(el);
    expect(items.every((item) => item.getAttribute("slot") !== "overflow")).toBe(true);
  });

  it("arrow keys move focus between overflow menu links", async () => {
    const el = await fixture<VuAdaptiveBar>(html`
      <vu-adaptive-bar style="display:block;width:120px">
        <vu-adaptive-item><a href="#">One</a></vu-adaptive-item>
        <vu-adaptive-item><a href="#">Two</a></vu-adaptive-item>
        <vu-adaptive-item><a href="#">Three</a></vu-adaptive-item>
      </vu-adaptive-bar>
    `);
    await elementUpdated(el);

    const items = Array.from(el.querySelectorAll("vu-adaptive-item"));
    const mainItems = el.shadowRoot?.querySelector(".main-items") as HTMLElement;
    for (const item of items) {
      Object.defineProperty(item, "getBoundingClientRect", {
        configurable: true,
        value: () => mockRect(80),
      });
    }
    Object.defineProperty(mainItems, "clientWidth", {
      configurable: true,
      value: 100,
    });

    el.recalculateLayout();
    await elementUpdated(el);

    const btn = el.shadowRoot?.querySelector('[part="overflow-button"]') as HTMLButtonElement;
    btn?.click();
    await elementUpdated(el);

    const menu = el.shadowRoot?.querySelector('[part="menu"]') as HTMLElement;
    const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('a[role="menuitem"]'));
    expect(links.length).toBeGreaterThanOrEqual(2);

    links[0].focus();
    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect(document.activeElement).toBe(links[1]);

    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    expect(document.activeElement).toBe(links[links.length - 1]);
  });

  describe("accessibility", () => {
    it("default", async () => {
      const el = await fixture<VuAdaptiveBar>(html`
        <vu-adaptive-bar>
          <vu-adaptive-item><a href="#">Home</a></vu-adaptive-item>
          <vu-adaptive-item><a href="#">Settings</a></vu-adaptive-item>
        </vu-adaptive-bar>
      `);
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("with overflow menu open", async () => {
      const el = await fixture<VuAdaptiveBar>(html`
        <vu-adaptive-bar style="display:block;width:120px">
          <vu-adaptive-item><a href="#">One</a></vu-adaptive-item>
          <vu-adaptive-item><a href="#">Two</a></vu-adaptive-item>
          <vu-adaptive-item><a href="#">Three</a></vu-adaptive-item>
        </vu-adaptive-bar>
      `);
      await elementUpdated(el);

      const items = Array.from(el.querySelectorAll("vu-adaptive-item"));
      const mainItems = el.shadowRoot?.querySelector(".main-items") as HTMLElement;
      for (const item of items) {
        Object.defineProperty(item, "getBoundingClientRect", {
          configurable: true,
          value: () => mockRect(80),
        });
      }
      Object.defineProperty(mainItems, "clientWidth", {
        configurable: true,
        value: 100,
      });
      el.recalculateLayout();
      await elementUpdated(el);

      el.openMenu();
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });
  });
});
