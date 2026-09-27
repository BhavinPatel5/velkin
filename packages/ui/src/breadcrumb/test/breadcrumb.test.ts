/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuBreadcrumb } from "../breadcrumb.js";
import "../../breadcrumb-item/breadcrumb-item.js";

describe("vu-breadcrumb", () => {
  it("is defined", () => {
    expect(customElements.get("vu-breadcrumb")).toBe(VuBreadcrumb);
  });

  it("renders defaults — nav with aria-label, role=list container, no ellipsis", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb>
        <vu-breadcrumb-item href="/">Home</vu-breadcrumb-item>
        <vu-breadcrumb-item current>Settings</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);

    expect(el.separator).toBe("/");
    expect(el.size).toBe("md");
    expect(el.max).toBe(0);
    expect(el.expanded).toBe(false);
    expect(el.disabled).toBe(false);
    expect(el.label).toBe("");
    expect(el.overflow).toBe("menu");

    const nav = el.shadowRoot?.querySelector('[part="base"]');
    expect(nav?.tagName).toBe("NAV");
    expect(nav?.getAttribute("aria-label")).toBe("Breadcrumb");

    const list = el.shadowRoot?.querySelector('[part="list"]');
    expect(list?.tagName).toBe("DIV");
    expect(list?.getAttribute("role")).toBe("list");

    expect(el.shadowRoot?.querySelector('[part="ellipsis"]')).toBeNull();
  });

  it("respects a custom label on the wrapping nav", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb label="Site sections">
        <vu-breadcrumb-item href="/">Home</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="base"]')?.getAttribute("aria-label")).toBe(
      "Site sections",
    );
  });

  it("forwards 'size' attribute onto every child item", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb size="lg">
        <vu-breadcrumb-item href="/">Home</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/x">X</vu-breadcrumb-item>
        <vu-breadcrumb-item current>Now</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    const items = el.querySelectorAll("vu-breadcrumb-item");
    items.forEach((item) => {
      expect(item.getAttribute("size")).toBe("lg");
    });
  });

  it("forwards the separator string as a CSS variable on the host", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb separator="›">
        <vu-breadcrumb-item href="/">Home</vu-breadcrumb-item>
        <vu-breadcrumb-item current>Now</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    expect(el.style.getPropertyValue("--breadcrumb-separator")).toBe('"›"');
  });

  it("marks ONLY the first item with the [first] attribute", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb>
        <vu-breadcrumb-item href="/">Home</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/x">X</vu-breadcrumb-item>
        <vu-breadcrumb-item current>Now</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    const items = el.querySelectorAll("vu-breadcrumb-item");
    expect(items[0].hasAttribute("first")).toBe(true);
    expect(items[1].hasAttribute("first")).toBe(false);
    expect(items[2].hasAttribute("first")).toBe(false);
  });

  it("does NOT forward 'disabled' onto children — per-item disabled is independent", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb disabled>
        <vu-breadcrumb-item href="/">Home</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/x" disabled>Locked</vu-breadcrumb-item>
        <vu-breadcrumb-item current>Now</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    expect(el.getAttribute("aria-disabled")).toBe("true");
    const items = el.querySelectorAll("vu-breadcrumb-item");
    expect(items[0].hasAttribute("disabled")).toBe(false);
    expect(items[1].hasAttribute("disabled")).toBe(true);
    expect(items[2].hasAttribute("disabled")).toBe(false);
  });

  it("reflects all size tokens", async () => {
    for (const size of ["sm", "md", "lg"] as const) {
      const el = await fixture<VuBreadcrumb>(html`
        <vu-breadcrumb size=${size}>
          <vu-breadcrumb-item href="/">Home</vu-breadcrumb-item>
        </vu-breadcrumb>
      `);
      await elementUpdated(el);
      expect(el.getAttribute("size")).toBe(size);
    }
  });

  it("does NOT collapse when item count <= max", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb max="5">
        <vu-breadcrumb-item href="/">A</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/b">B</vu-breadcrumb-item>
        <vu-breadcrumb-item current>C</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    const items = el.querySelectorAll("vu-breadcrumb-item");
    items.forEach((item) => expect(item.hasAttribute("hidden")).toBe(false));
    expect(el.shadowRoot?.querySelector('[part="ellipsis"]')).toBeNull();
  });

  it("collapses middle items into the ellipsis when count > max (default itemsBefore=1, itemsAfter=1)", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb max="3">
        <vu-breadcrumb-item href="/">A</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/b">B</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/c">C</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/d">D</vu-breadcrumb-item>
        <vu-breadcrumb-item current>E</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    const items = el.querySelectorAll("vu-breadcrumb-item");
    // leading=1 (A visible), trailing=1 (E visible), middle=3 (B, C, D hidden)
    expect(items[0].hasAttribute("hidden")).toBe(false);
    expect(items[1].hasAttribute("hidden")).toBe(true);
    expect(items[2].hasAttribute("hidden")).toBe(true);
    expect(items[3].hasAttribute("hidden")).toBe(true);
    expect(items[4].hasAttribute("hidden")).toBe(false);
    const ellipsis = el.shadowRoot?.querySelector('[part="ellipsis"]');
    expect(ellipsis).toBeTruthy();
  });

  it("uses inline 'order' to position visible items + ellipsis correctly when collapsed", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb max="3">
        <vu-breadcrumb-item href="/">A</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/b">B</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/c">C</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/d">D</vu-breadcrumb-item>
        <vu-breadcrumb-item current>E</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    const items = el.querySelectorAll<HTMLElement>("vu-breadcrumb-item");
    expect(items[0].style.order).toBe("1");
    expect(items[4].style.order).toBe("3");

    const ellipsis = el.shadowRoot?.querySelector('[part="ellipsis"]') as HTMLElement;
    expect(ellipsis.style.order).toBe("2");
  });

  it("clears 'order' and 'hidden' on every item once expanded becomes true", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb max="3">
        <vu-breadcrumb-item href="/">A</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/b">B</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/c">C</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/d">D</vu-breadcrumb-item>
        <vu-breadcrumb-item current>E</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    el.expanded = true;
    await elementUpdated(el);
    const items = el.querySelectorAll<HTMLElement>("vu-breadcrumb-item");
    items.forEach((item) => {
      expect(item.hasAttribute("hidden")).toBe(false);
      expect(item.style.order).toBe("");
    });
    expect(el.shadowRoot?.querySelector('[part="ellipsis"]')).toBeNull();
  });

  it("defaults overflow to menu", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb><vu-breadcrumb-item href="/">A</vu-breadcrumb-item></vu-breadcrumb>
    `);
    await elementUpdated(el);
    expect(el.overflow).toBe("menu");
  });

  it("clicking the ellipsis in menu mode does not set expanded (opens overflow menu instead)", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb max="3">
        <vu-breadcrumb-item href="/">A</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/b">B</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/c">C</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/d">D</vu-breadcrumb-item>
        <vu-breadcrumb-item current>E</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    let expandFired = false;
    el.addEventListener("vu-reveal", () => {
      expandFired = true;
    });
    const button = el.shadowRoot?.querySelector('[part="ellipsis-button"]') as HTMLButtonElement;
    button.click();
    await elementUpdated(el);
    expect(el.expanded).toBe(false);
    expect(expandFired).toBe(false);
    expect(el.shadowRoot?.querySelector('[part="overflow-menu"]')).toBeTruthy();
  });

  it("clicking the ellipsis in inline mode sets expanded and dispatches vu-reveal", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb max="3" overflow="inline">
        <vu-breadcrumb-item href="/">A</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/b">B</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/c">C</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/d">D</vu-breadcrumb-item>
        <vu-breadcrumb-item current>E</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    let revealed: number | null = null;
    el.addEventListener("vu-reveal", (e) => {
      revealed = (e as CustomEvent).detail.revealed;
    });
    const button = el.shadowRoot?.querySelector('[part="ellipsis-button"]') as HTMLButtonElement;
    button.click();
    await elementUpdated(el);
    expect(el.expanded).toBe(true);
    expect(revealed).toBe(3);
  });

  it("overflow menu lists one button per hidden segment", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb max="3">
        <vu-breadcrumb-item href="/">A</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/b">B</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/c">C</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/d">D</vu-breadcrumb-item>
        <vu-breadcrumb-item current>E</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    const menu = el.shadowRoot?.querySelector('[part="overflow-menu"]');
    const rows = menu?.querySelectorAll('[part="overflow-item"]');
    expect(rows?.length).toBe(3);
    expect(rows?.[0]?.textContent?.trim()).toBe("B");
    expect(rows?.[1]?.textContent?.trim()).toBe("C");
    expect(rows?.[2]?.textContent?.trim()).toBe("D");
  });

  it("Show full trail in the menu sets expanded and fires vu-reveal", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb max="3">
        <vu-breadcrumb-item href="/">A</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/b">B</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/c">C</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/d">D</vu-breadcrumb-item>
        <vu-breadcrumb-item current>E</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    let revealed: number | null = null;
    el.addEventListener("vu-reveal", (e) => {
      revealed = (e as CustomEvent).detail.revealed;
    });
    const expandBtn = el.shadowRoot?.querySelector('[part="overflow-expand"]') as HTMLButtonElement;
    expect(expandBtn).toBeTruthy();
    expandBtn.click();
    await elementUpdated(el);
    expect(el.expanded).toBe(true);
    expect(revealed).toBe(3);
  });

  it("re-syncs forwarding when a new item is appended at runtime", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb>
        <vu-breadcrumb-item href="/">A</vu-breadcrumb-item>
        <vu-breadcrumb-item current>B</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    expect(el.querySelectorAll("vu-breadcrumb-item").length).toBe(2);

    const fresh = document.createElement("vu-breadcrumb-item");
    fresh.setAttribute("current", "");
    fresh.textContent = "C";
    // Drop 'current' on the previous leaf so 'B' becomes a link.
    el.querySelectorAll("vu-breadcrumb-item")[1].removeAttribute("current");
    el.appendChild(fresh);
    await elementUpdated(el);

    const items = el.querySelectorAll("vu-breadcrumb-item");
    expect(items.length).toBe(3);
    expect(items[0].hasAttribute("first")).toBe(true);
    expect(items[1].hasAttribute("first")).toBe(false);
    expect(items[2].hasAttribute("first")).toBe(false);
  });

  it("ellipsis button has an accessible label that reports the hidden count", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb max="3">
        <vu-breadcrumb-item href="/">A</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/b">B</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/c">C</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/d">D</vu-breadcrumb-item>
        <vu-breadcrumb-item current>E</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    const button = el.shadowRoot?.querySelector('[part="ellipsis-button"]');
    expect(button?.getAttribute("aria-label")).toBe("Open menu — 3 hidden segments");
  });

  it("ellipsis label uses singular 'breadcrumb' when only one item is hidden", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb max="2">
        <vu-breadcrumb-item href="/">A</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/b">B</vu-breadcrumb-item>
        <vu-breadcrumb-item current>C</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    const button = el.shadowRoot?.querySelector('[part="ellipsis-button"]');
    expect(button?.getAttribute("aria-label")).toBe("Open menu — 1 hidden segment");
  });

  it("respects asymmetric itemsBefore=2 / itemsAfter=2 — keeps two on each side", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb max="3" itemsbefore="2" itemsafter="2">
        <vu-breadcrumb-item href="/">A</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/b">B</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/c">C</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/d">D</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/e">E</vu-breadcrumb-item>
        <vu-breadcrumb-item current>F</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    const items = el.querySelectorAll("vu-breadcrumb-item");
    /* leading=2 (A, B), trailing=2 (E, F), middle=2 (C, D hidden) */
    expect(items[0].hasAttribute("hidden")).toBe(false);
    expect(items[1].hasAttribute("hidden")).toBe(false);
    expect(items[2].hasAttribute("hidden")).toBe(true);
    expect(items[3].hasAttribute("hidden")).toBe(true);
    expect(items[4].hasAttribute("hidden")).toBe(false);
    expect(items[5].hasAttribute("hidden")).toBe(false);
  });

  it("does not collapse when itemsBefore + itemsAfter already covers the full trail", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb max="2" itemsbefore="2" itemsafter="2">
        <vu-breadcrumb-item href="/">A</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/b">B</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/c">C</vu-breadcrumb-item>
        <vu-breadcrumb-item current>D</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    const items = el.querySelectorAll("vu-breadcrumb-item");
    items.forEach((it) => expect(it.hasAttribute("hidden")).toBe(false));
    expect(el.shadowRoot?.querySelector('[part="ellipsis"]')).toBeNull();
  });

  it("max=1 still keeps root + leaf visible because itemsBefore=1, itemsAfter=1 by default", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb max="1">
        <vu-breadcrumb-item href="/">A</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/b">B</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/c">C</vu-breadcrumb-item>
        <vu-breadcrumb-item current>D</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    const items = el.querySelectorAll("vu-breadcrumb-item");
    expect(items[0].hasAttribute("hidden")).toBe(false);
    expect(items[1].hasAttribute("hidden")).toBe(true);
    expect(items[2].hasAttribute("hidden")).toBe(true);
    expect(items[3].hasAttribute("hidden")).toBe(false);
    const rows = el.shadowRoot?.querySelectorAll('[part="overflow-item"]');
    expect(rows?.length).toBe(2);
    expect(rows?.[0]?.textContent?.trim()).toBe("B");
    expect(rows?.[1]?.textContent?.trim()).toBe("C");
  });

  it("ArrowDown / ArrowUp on the overflow menu wraps focus through menuitems", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb max="3">
        <vu-breadcrumb-item href="/">A</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/b">B</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/c">C</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/d">D</vu-breadcrumb-item>
        <vu-breadcrumb-item current>E</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    const menu = el.shadowRoot?.querySelector('[part="overflow-menu"]') as HTMLElement;
    const rows = menu.querySelectorAll<HTMLButtonElement>(
      '[part="overflow-item"], [part="overflow-expand"]',
    );
    expect(rows.length).toBeGreaterThanOrEqual(2);

    rows[0].focus();
    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect(el.shadowRoot?.activeElement).toBe(rows[1]);

    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    expect(el.shadowRoot?.activeElement).toBe(rows[rows.length - 1]);

    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    expect(el.shadowRoot?.activeElement).toBe(rows[0]);

    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    expect(el.shadowRoot?.activeElement).toBe(rows[rows.length - 1]);

    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    expect(el.shadowRoot?.activeElement).toBe(rows[0]);
  });

  it("type-ahead jumps focus to the first menuitem starting with the typed letter", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb max="3" itemsbefore="1" itemsafter="1">
        <vu-breadcrumb-item href="/">A</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/b">Bravo</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/c">Charlie</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/d">Delta</vu-breadcrumb-item>
        <vu-breadcrumb-item current>E</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    const menu = el.shadowRoot?.querySelector('[part="overflow-menu"]') as HTMLElement;
    const rows = menu.querySelectorAll<HTMLButtonElement>('[part="overflow-item"]');
    expect(rows.length).toBe(3);

    rows[0].focus();
    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "c", bubbles: true }));
    expect(el.shadowRoot?.activeElement).toBe(rows[1]); // Charlie

    menu.dispatchEvent(new KeyboardEvent("keydown", { key: "d", bubbles: true }));
    expect(el.shadowRoot?.activeElement).toBe(rows[2]); // Delta
  });

  it("responsive=true engages collapse when cached widths exceed the container", async () => {
    const el = await fixture<VuBreadcrumb>(html`
      <vu-breadcrumb responsive itemsbefore="1" itemsafter="1" style="display:block; width: 200px">
        <vu-breadcrumb-item href="/">A</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/b">B</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/c">C</vu-breadcrumb-item>
        <vu-breadcrumb-item current>D</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    /* Inject deterministic widths so the test isn't subject to font/jsdom layout. */
    const items = Array.from(el.querySelectorAll("vu-breadcrumb-item")) as HTMLElement[];
    items.forEach((it) => {
      Object.defineProperty(it, "getBoundingClientRect", {
        configurable: true,
        value: () => ({
          width: 80,
          height: 16,
          top: 0,
          left: 0,
          right: 80,
          bottom: 16,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }),
      });
    });

    /* Force a measure + recompute pass directly (private members reached via cast). */

    const internal = el as any;
    internal._requestMeasure();
    await elementUpdated(el);
    internal._recomputeResponsive();
    await elementUpdated(el);

    /* 4 items × 80px = 320px > 200px container → must collapse. */
    expect(internal._responsiveCollapse).toBe(true);
    expect(el.shadowRoot?.querySelector('[part="ellipsis"]')).toBeTruthy();
  });
});

describe("accessibility", () => {
  it("breadcrumb trail passes axe", async () => {
    const el = await fixture(html`
      <vu-breadcrumb label="You are here">
        <vu-breadcrumb-item href="/">Home</vu-breadcrumb-item>
        <vu-breadcrumb-item href="/docs">Docs</vu-breadcrumb-item>
        <vu-breadcrumb-item>Current</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("disabled breadcrumb passes axe", async () => {
    const el = await fixture(html`
      <vu-breadcrumb disabled label="You are here">
        <vu-breadcrumb-item href="/">Home</vu-breadcrumb-item>
        <vu-breadcrumb-item current>Current</vu-breadcrumb-item>
      </vu-breadcrumb>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
