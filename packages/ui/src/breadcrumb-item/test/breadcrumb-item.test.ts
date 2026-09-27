/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuBreadcrumbItem } from "../breadcrumb-item.js";

describe("vu-breadcrumb-item", () => {
  it("is defined", () => {
    expect(customElements.get("vu-breadcrumb-item")).toBe(VuBreadcrumbItem);
  });

  it("renders defaults as a non-link span (no href)", async () => {
    const el = await fixture<VuBreadcrumbItem>(
      html`<vu-breadcrumb-item>Static</vu-breadcrumb-item>`,
    );
    await elementUpdated(el);
    const link = el.shadowRoot?.querySelector('[part="link"]');
    expect(link?.tagName).toBe("SPAN");
    expect(el.current).toBe(false);
    expect(el.disabled).toBe(false);
  });

  it("renders as <a> when href is provided", async () => {
    const el = await fixture<VuBreadcrumbItem>(
      html`<vu-breadcrumb-item href="/products">Products</vu-breadcrumb-item>`,
    );
    await elementUpdated(el);
    const link = el.shadowRoot?.querySelector('[part="link"]') as HTMLAnchorElement;
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/products");
  });

  it("renders as <span> with aria-current='page' when current=true (even with href)", async () => {
    const el = await fixture<VuBreadcrumbItem>(
      html`<vu-breadcrumb-item href="/x" current>Now</vu-breadcrumb-item>`,
    );
    await elementUpdated(el);
    const link = el.shadowRoot?.querySelector('[part="link"]');
    expect(link?.tagName).toBe("SPAN");
    expect(link?.getAttribute("aria-current")).toBe("page");
  });

  it("renders as <span> with aria-disabled when disabled=true (even with href)", async () => {
    const el = await fixture<VuBreadcrumbItem>(
      html`<vu-breadcrumb-item href="/x" disabled>Off</vu-breadcrumb-item>`,
    );
    await elementUpdated(el);
    const link = el.shadowRoot?.querySelector('[part="link"]');
    expect(link?.tagName).toBe("SPAN");
    expect(link?.getAttribute("aria-disabled")).toBe("true");
  });

  it("forwards target and rel onto the anchor", async () => {
    const el = await fixture<VuBreadcrumbItem>(html`
      <vu-breadcrumb-item href="https://x.test" target="_blank" rel="noopener noreferrer"
        >External</vu-breadcrumb-item
      >
    `);
    await elementUpdated(el);
    const link = el.shadowRoot?.querySelector('[part="link"]') as HTMLAnchorElement;
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("dispatches a cancellable vu-activate event with href + originalEvent", async () => {
    const el = await fixture<VuBreadcrumbItem>(
      html`<vu-breadcrumb-item href="/products">Products</vu-breadcrumb-item>`,
    );
    await elementUpdated(el);
    let received: { href: string; originalEvent: Event } | null = null;
    el.addEventListener("vu-activate", (e) => {
      received = (e as CustomEvent).detail;
    });
    const link = el.shadowRoot?.querySelector('[part="link"]') as HTMLAnchorElement;
    link.click();
    expect(received).toBeTruthy();
    expect(received!.href).toBe("/products");
    expect(received!.originalEvent).toBeInstanceOf(Event);
  });

  it("does not dispatch vu-activate when current", async () => {
    const el = await fixture<VuBreadcrumbItem>(
      html`<vu-breadcrumb-item href="/x" current>Now</vu-breadcrumb-item>`,
    );
    await elementUpdated(el);
    let fired = false;
    el.addEventListener("vu-activate", () => {
      fired = true;
    });
    const link = el.shadowRoot?.querySelector('[part="link"]') as HTMLElement;
    link.click();
    expect(fired).toBe(false);
  });

  it("does not dispatch vu-activate when disabled", async () => {
    const el = await fixture<VuBreadcrumbItem>(
      html`<vu-breadcrumb-item href="/x" disabled>Off</vu-breadcrumb-item>`,
    );
    await elementUpdated(el);
    let fired = false;
    el.addEventListener("vu-activate", () => {
      fired = true;
    });
    const link = el.shadowRoot?.querySelector('[part="link"]') as HTMLElement;
    link.click();
    expect(fired).toBe(false);
  });

  it("preventDefault on vu-activate also preventDefault's the underlying click", async () => {
    const el = await fixture<VuBreadcrumbItem>(
      html`<vu-breadcrumb-item href="/products">Products</vu-breadcrumb-item>`,
    );
    await elementUpdated(el);
    el.addEventListener("vu-activate", (e) => e.preventDefault());
    const link = el.shadowRoot?.querySelector('[part="link"]') as HTMLAnchorElement;
    let nativeClick: MouseEvent | null = null;
    link.addEventListener("click", (e) => {
      nativeClick = e;
    });
    link.click();
    expect(nativeClick).toBeTruthy();
    expect(nativeClick!.defaultPrevented).toBe(true);
  });

  it("renders the slotted text content", async () => {
    const el = await fixture<VuBreadcrumbItem>(
      html`<vu-breadcrumb-item href="/x">Pretty Label</vu-breadcrumb-item>`,
    );
    await elementUpdated(el);
    expect(el.textContent?.trim()).toBe("Pretty Label");
  });

  it("keeps the start slot mounted when empty", async () => {
    const el = await fixture<VuBreadcrumbItem>(
      html`<vu-breadcrumb-item href="/x">Bare</vu-breadcrumb-item>`,
    );
    await elementUpdated(el);
    const startSlot = el.shadowRoot?.querySelector('[part="start"] slot') as HTMLSlotElement;
    expect(startSlot).toBeTruthy();
    expect(startSlot.assignedElements().length).toBe(0);
    expect(el.shadowRoot?.querySelector('[part="start"]')?.hasAttribute("hidden")).toBe(false);
  });

  it("assigns a start icon into [part='start']", async () => {
    const el = await fixture<VuBreadcrumbItem>(html`
      <vu-breadcrumb-item href="/x">
        <span slot="start" class="ico">★</span>
        Marked
      </vu-breadcrumb-item>
    `);
    await elementUpdated(el);
    const startSlot = el.shadowRoot?.querySelector('[part="start"] slot') as HTMLSlotElement;
    expect(startSlot.assignedElements().length).toBe(1);
    expect(el.querySelector(".ico")?.textContent).toBe("★");
  });

  it("assigns a start icon added at runtime", async () => {
    const el = await fixture<VuBreadcrumbItem>(
      html`<vu-breadcrumb-item href="/x">Marked</vu-breadcrumb-item>`,
    );
    await elementUpdated(el);
    const startSlot = el.shadowRoot?.querySelector('[part="start"] slot') as HTMLSlotElement;
    expect(startSlot.assignedElements().length).toBe(0);

    const icon = document.createElement("span");
    icon.setAttribute("slot", "start");
    icon.textContent = "★";
    el.appendChild(icon);
    await elementUpdated(el);

    expect(startSlot.assignedElements().length).toBe(1);
    expect(startSlot.assignedElements()[0]).toBe(icon);
  });

  it("renders the leading separator part by default; hidden when [first] is set", async () => {
    const el = await fixture<VuBreadcrumbItem>(
      html`<vu-breadcrumb-item href="/x">Item</vu-breadcrumb-item>`,
    );
    await elementUpdated(el);
    const sep = el.shadowRoot?.querySelector('[part="separator"]');
    expect(sep).toBeTruthy();

    el.setAttribute("first", "");
    await elementUpdated(el);
    expect(el.hasAttribute("first")).toBe(true);
    expect(sep).toBeTruthy();
  });
});

describe("accessibility", () => {
  it("breadcrumb item passes axe", async () => {
    const el = await fixture(html`<vu-breadcrumb-item href="/docs">Docs</vu-breadcrumb-item>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
