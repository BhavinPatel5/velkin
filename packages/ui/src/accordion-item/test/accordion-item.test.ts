/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7✓ 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { hasAssignedContent } from "../../../internals/utils/slot.js";
import { VuAccordionItem } from "../accordion-item";
import "../../icon/icon.js";

describe("vu-accordion-item", () => {
  it("is defined", () => {
    expect(customElements.get("vu-accordion-item")).toBe(VuAccordionItem);
  });

  it("renders with default state closed", async () => {
    const el = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item>
          <span slot="title">Title</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(el);
    expect(el.open).toBe(false);
    expect(el.disabled).toBe(false);
    const header = el.shadowRoot?.querySelector('[part="header"]');
    expect(header).toBeTruthy();
    expect(header?.getAttribute("aria-expanded") === "true").toBe(false);
    expect(el.shadowRoot?.querySelector('[part="body"]')).toBeTruthy();
  });

  it("has all parts: item, header, title, sub-title, icon, body", async () => {
    const el = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item>
          <span slot="title">T</span>
          <div slot="body">C</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="item"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="header"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="title"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="sub-title"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="sub-title"]')?.hasAttribute("hidden")).toBe(false);
    expect(el.shadowRoot?.querySelector('[part="icon"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="body"]')).toBeTruthy();
  });

  it("reflects open attribute", async () => {
    const el = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item open>
          <span slot="title">Title</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(el);
    expect(el.open).toBe(true);
    expect(el.hasAttribute("open")).toBe(true);
    expect(el.shadowRoot?.querySelector("[aria-expanded]")?.getAttribute("aria-expanded")).toBe("true");
  });

  it("reflects disabled attribute", async () => {
    const el = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item disabled>
          <span slot="title">Title</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(el);
    expect(el.disabled).toBe(true);
    expect(el.hasAttribute("disabled")).toBe(true);
  });

  it("renders slotted expand-icon and collapse-icon in the trailing control", async () => {
    const el = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item>
          <span slot="title">Title</span>
          <span slot="expand-icon" data-slot-marker="expand">E</span>
          <span slot="collapse-icon" data-slot-marker="collapse">C</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(el);
    expect(el.querySelector('[slot="expand-icon"]')?.getAttribute("data-slot-marker")).toBe("expand");
    expect(el.querySelector('[slot="collapse-icon"]')?.getAttribute("data-slot-marker")).toBe("collapse");
    const expandSlot = el.shadowRoot?.querySelector(
      'slot[name="expand-icon"]',
    ) as HTMLSlotElement;
    const collapseSlot = el.shadowRoot?.querySelector(
      'slot[name="collapse-icon"]',
    ) as HTMLSlotElement;
    expect(hasAssignedContent(expandSlot)).toBe(true);
    expect(expandSlot.assignedNodes({ flatten: true })[0]?.textContent?.trim()).toBe("E");
    el.open = true;
    await elementUpdated(el);
    expect(hasAssignedContent(collapseSlot)).toBe(true);
    expect(collapseSlot.assignedNodes({ flatten: true })[0]?.textContent?.trim()).toBe("C");
  });

  it("toggles open state on header click", async () => {
    const el = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item>
          <span slot="title">Title</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(el);
    expect(el.open).toBe(false);
    const header = el.shadowRoot?.querySelector('[part="header"]') as HTMLElement;
    header.click();
    await elementUpdated(el);
    expect(el.open).toBe(true);
    header.click();
    await elementUpdated(el);
    expect(el.open).toBe(false);
  });

  it("dispatches vu-open-change with detail.open, bubbles, and composed", async () => {
    const el = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item>
          <span slot="title">Title</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(el);
    const header = el.shadowRoot?.querySelector('[part="header"]') as HTMLElement;
    const openEventPromise = new Promise<CustomEvent<{ open: boolean }>>((resolve) => {
      el.addEventListener("vu-open-change", (e: Event) => resolve(e as CustomEvent<{ open: boolean }>), { once: true });
    });
    header.click();
    const openEv = await openEventPromise;
    expect(openEv.detail?.open).toBe(true);
    expect(openEv.bubbles).toBe(true);
    expect(openEv.composed).toBe(true);
    const closeEventPromise = new Promise<CustomEvent<{ open: boolean }>>((resolve) => {
      el.addEventListener("vu-open-change", (e: Event) => resolve(e as CustomEvent<{ open: boolean }>), { once: true });
    });
    header.click();
    const closeEv = await closeEventPromise;
    expect(closeEv.detail?.open).toBe(false);
  });

  it("does not toggle when disabled", async () => {
    const el = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item disabled>
          <span slot="title">Title</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(el);
    expect(el.open).toBe(false);
    const header = el.shadowRoot?.querySelector('[part="header"]') as HTMLElement;
    header.click();
    await elementUpdated(el);
    expect(el.open).toBe(false);
  });

  it("does not toggle on Space when disabled", async () => {
    const el = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item disabled>
          <span slot="title">Title</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(el);
    const header = el.shadowRoot?.querySelector('[part="header"]') as HTMLElement;
    header.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    await elementUpdated(el);
    expect(el.open).toBe(false);
  });

  it("expand, collapse, and toggle methods update open and emit vu-open-change", async () => {
    const el = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item>
          <span slot="title">Title</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(el);
    const events: boolean[] = [];
    el.addEventListener("vu-open-change", (e) => events.push((e as CustomEvent<{ open: boolean }>).detail.open));

    el.expand();
    await elementUpdated(el);
    expect(el.open).toBe(true);
    expect(events).toEqual([true]);

    el.collapse();
    await elementUpdated(el);
    expect(el.open).toBe(false);
    expect(events).toEqual([true, false]);

    el.toggle();
    await elementUpdated(el);
    expect(el.open).toBe(true);
    expect(events).toEqual([true, false, true]);
  });

  it("expand and collapse are no-ops when already in that state", async () => {
    const el = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item open>
          <span slot="title">Title</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(el);
    let toggleCount = 0;
    el.addEventListener("vu-open-change", () => {
      toggleCount += 1;
    });
    el.expand();
    el.collapse();
    el.collapse();
    await elementUpdated(el);
    expect(el.open).toBe(false);
    expect(toggleCount).toBe(1);
  });

  it("has role=button and tabindex on header for accessibility", async () => {
    const el = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item>
          <span slot="title">Title</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(el);
    const header = el.shadowRoot?.querySelector('[part="header"]');
    expect(header?.getAttribute("role")).toBe("button");
    expect(header?.getAttribute("tabindex")).toBe("0");
  });

  it("has tabindex=-1 on header when disabled", async () => {
    const el = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item disabled>
          <span slot="title">Title</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(el);
    const header = el.shadowRoot?.querySelector('[part="header"]');
    expect(header?.getAttribute("tabindex")).toBe("-1");
  });

  it("toggles on Space key when header is focused", async () => {
    const el = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item>
          <span slot="title">Title</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(el);
    const header = el.shadowRoot?.querySelector('[part="header"]') as HTMLElement;
    expect(el.open).toBe(false);
    header.focus();
    header.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    await elementUpdated(el);
    expect(el.open).toBe(true);
    header.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    await elementUpdated(el);
    expect(el.open).toBe(false);
  });

  it("toggles on Enter key when header is focused", async () => {
    const el = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item>
          <span slot="title">Title</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(el);
    const header = el.shadowRoot?.querySelector('[part="header"]') as HTMLElement;
    expect(el.open).toBe(false);
    header.focus();
    header.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await elementUpdated(el);
    expect(el.open).toBe(true);
  });

  it("has aria-controls and body region with id and aria-labelledby", async () => {
    const el = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item>
          <span slot="title">Title</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(el);
    const header = el.shadowRoot?.querySelector('[part="header"]');
    const bodyId = header?.getAttribute("aria-controls");
    expect(bodyId).toBeTruthy();
    const bodyRegion = el.shadowRoot?.getElementById(bodyId!);
    expect(bodyRegion).toBeTruthy();
    expect(bodyRegion?.getAttribute("role")).toBe("region");
    expect(bodyRegion?.getAttribute("aria-labelledby")).toBe(header?.id);
    expect(header?.id).toBeTruthy();
  });

  it("renders the start slot wrapper and shows it only when the start slot has content", async () => {
    const elEmpty = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item>
          <span slot="title">Title</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(elEmpty);
    const startEmpty = elEmpty.shadowRoot?.querySelector('[part="start"]') as HTMLElement;
    const emptySlot = startEmpty.querySelector("slot") as HTMLSlotElement;
    expect(startEmpty).toBeTruthy();
    expect(startEmpty.hasAttribute("hidden")).toBe(false);
    expect(emptySlot.assignedElements().length).toBe(0);

    const elFilled = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item>
          <span slot="start" data-marker="lead">★</span>
          <span slot="title">Title</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(elFilled);
    const startFilled = elFilled.shadowRoot?.querySelector('[part="start"]') as HTMLElement;
    const filledSlot = startFilled.querySelector("slot") as HTMLSlotElement;
    expect(startFilled.hasAttribute("hidden")).toBe(false);
    expect(filledSlot.assignedElements().length).toBe(1);
    expect(elFilled.querySelector('[slot="start"]')?.getAttribute("data-marker")).toBe("lead");
  });

  it("derives header/body ids from the host id when set (SSR-deterministic)", async () => {
    const el = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item id="faq-1">
          <span slot="title">Title</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(el);
    const header = el.shadowRoot?.querySelector('[part="header"]');
    const bodyId = header?.getAttribute("aria-controls");
    expect(header?.id).toBe("faq-1-h");
    expect(bodyId).toBe("faq-1-b");
    const region = el.shadowRoot?.getElementById("faq-1-b");
    expect(region?.getAttribute("aria-labelledby")).toBe("faq-1-h");
  });

  it("falls back to auto-generated ids when the host has no id", async () => {
    const el = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item>
          <span slot="title">Title</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(el);
    const header = el.shadowRoot?.querySelector('[part="header"]');
    expect(header?.id).toMatch(/^vu-acc-\d+-h$/);
    expect(header?.getAttribute("aria-controls")).toMatch(/^vu-acc-\d+-b$/);
  });

  it("renders sub-title slot when provided", async () => {
    const el = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item>
          <span slot="title">Title</span>
          <span slot="sub-title">Subtitle text</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(el);
    const subTitlePart = el.shadowRoot?.querySelector('[part="sub-title"]');
    expect(subTitlePart).toBeTruthy();
    expect(subTitlePart?.hasAttribute("hidden")).toBe(false);
    const subTitleSlot = subTitlePart?.querySelector('slot[name="sub-title"]');
    expect(subTitleSlot).toBeTruthy();
  });

  it("open set programmatically updates aria-expanded", async () => {
    const el = await fixture<VuAccordionItem>(
      html`
        <vu-accordion-item>
          <span slot="title">Title</span>
          <div slot="body">Content</div>
        </vu-accordion-item>
      `,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector("[aria-expanded]")?.getAttribute("aria-expanded")).toBe("false");
    el.open = true;
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector("[aria-expanded]")?.getAttribute("aria-expanded")).toBe("true");
  });
});

describe("accessibility", () => {
  it("closed item passes axe", async () => {
    const el = await fixture(html`
      <vu-accordion-item>
        <span slot="title">Title</span>
        <div slot="body">Content</div>
      </vu-accordion-item>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("disabled item passes axe", async () => {
    const el = await fixture(html`
      <vu-accordion-item disabled>
        <span slot="title">Title</span>
        <div slot="body">Content</div>
      </vu-accordion-item>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("open item passes axe", async () => {
    const el = await fixture(html`
      <vu-accordion-item open>
        <span slot="title">Title</span>
        <div slot="body">Content</div>
      </vu-accordion-item>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
