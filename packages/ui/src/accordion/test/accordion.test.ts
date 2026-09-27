/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6 N/A 7✓ 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect, vi } from "vitest";
import { VuAccordion } from "../accordion";
import { VuAccordionItem } from "../../accordion-item/accordion-item.js";

VuAccordion;
VuAccordionItem;

describe("vu-accordion", () => {
  it("is defined", () => {
    expect(customElements.get("vu-accordion")).toBe(VuAccordion);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuAccordion>(
      html`<vu-accordion></vu-accordion>`,
    );
    await elementUpdated(el);
    expect(el.multiple).toBe(true);
    expect(el.collapsible).toBe(true);
    expect(el.variant).toBe("solid");
    expect(el.tone).toBe("normal");
    expect(el.size).toBe("md");
    expect(el.disabled).toBe(false);
    expect(el.flush).toBe(false);
    expect(el.shadowRoot?.querySelector('[part="group"]')).toBeTruthy();
  });

  it("reflects flush attribute", async () => {
    const el = await fixture<VuAccordion>(
      html`<vu-accordion flush></vu-accordion>`,
    );
    await elementUpdated(el);
    expect(el.hasAttribute("flush")).toBe(true);
    expect(el.flush).toBe(true);
  });

  it("group has role group and part group", async () => {
    const el = await fixture<VuAccordion>(html`<vu-accordion></vu-accordion>`);
    await elementUpdated(el);
    const group = el.shadowRoot?.querySelector('[part="group"]');
    expect(group?.getAttribute("role")).toBe("group");
    expect(group?.getAttribute("part")).toBe("group");
  });

  it("has default slot for direct accordion items", async () => {
    const el = await fixture<VuAccordion>(
      html`
        <vu-accordion>
          <vu-accordion-item id="x"><span slot="title">T</span><div slot="body">C</div></vu-accordion-item>
        </vu-accordion>
      `,
    );
    await elementUpdated(el);
    const slot = el.shadowRoot?.querySelector("slot");
    expect(slot).toBeTruthy();
    expect(el.querySelector("#x")).toBeInstanceOf(VuAccordionItem);
  });

  it("reflects variant attribute", async () => {
    const el = await fixture<VuAccordion>(
      html`<vu-accordion variant="outline"></vu-accordion>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("variant")).toBe("outline");
    expect(el.variant).toBe("outline");
  });

  it("accepts all four variants", async () => {
    const variants = ["light", "solid", "outline", "split", "splitted"] as const;
    for (const v of variants) {
      const el = await fixture<VuAccordion>(
        html`<vu-accordion variant="${v}"></vu-accordion>`,
      );
      await elementUpdated(el);
      expect(el.variant).toBe(v);
      expect(el.getAttribute("variant")).toBe(v);
    }
  });

  it("reflects size tokens", async () => {
    for (const size of ["sm", "md", "lg"] as const) {
      const el = await fixture<VuAccordion>(
        html`<vu-accordion size=${size}></vu-accordion>`,
      );
      await elementUpdated(el);
      expect(el.size).toBe(size);
      expect(el.getAttribute("size")).toBe(size);
    }
  });

  it("reflects disabled attribute", async () => {
    const el = await fixture<VuAccordion>(
      html`<vu-accordion disabled></vu-accordion>`,
    );
    await elementUpdated(el);
    expect(el.hasAttribute("disabled")).toBe(true);
    expect(el.disabled).toBe(true);
  });

  it("propagates disabled to items and releases only what it claimed", async () => {
    const el = await fixture<VuAccordion>(
      html`
        <vu-accordion>
          <vu-accordion-item id="a"><span slot="title">A</span><div slot="body">A</div></vu-accordion-item>
          <vu-accordion-item id="b" disabled><span slot="title">B</span><div slot="body">B</div></vu-accordion-item>
        </vu-accordion>
      `,
    );
    await elementUpdated(el);
    const itemA = el.querySelector<VuAccordionItem>("#a")!;
    const itemB = el.querySelector<VuAccordionItem>("#b")!;
    expect(itemA.disabled).toBe(false);
    expect(itemB.disabled).toBe(true);

    el.disabled = true;
    await elementUpdated(el);
    expect(itemA.disabled).toBe(true);
    expect(itemB.disabled).toBe(true);

    el.disabled = false;
    await elementUpdated(el);
    expect(itemA.disabled).toBe(false);
    expect(itemB.disabled).toBe(true);
  });

  it("item styles reset opacity under a disabled accordion host", () => {
    const cssText = [VuAccordionItem.styles]
      .flat()
      .map((s) => ("cssText" in s ? s.cssText : String(s)))
      .join("\n");
    expect(cssText).toMatch(/:host\(\[disabled\]\):host-context\(vu-accordion\[disabled\]\)/);
  });

  it("disabled host blocks item header clicks", async () => {
    const el = await fixture<VuAccordion>(
      html`
        <vu-accordion disabled>
          <vu-accordion-item id="a"><span slot="title">A</span><div slot="body">A</div></vu-accordion-item>
        </vu-accordion>
      `,
    );
    await elementUpdated(el);
    const item = el.querySelector<VuAccordionItem>("#a")!;
    item.shadowRoot?.querySelector<HTMLElement>("[part=header]")?.click();
    await elementUpdated(el);
    expect(item.open).toBe(false);
  });

  it("group exposes aria-disabled when host is disabled", async () => {
    const el = await fixture<VuAccordion>(
      html`<vu-accordion disabled></vu-accordion>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="group"]')?.getAttribute("aria-disabled")).toBe("true");
  });

  it("expandAll opens every item in multiple mode", async () => {
    const el = await fixture<VuAccordion>(
      html`
        <vu-accordion>
          <vu-accordion-item id="a"><span slot="title">A</span><div slot="body">A</div></vu-accordion-item>
          <vu-accordion-item id="b"><span slot="title">B</span><div slot="body">B</div></vu-accordion-item>
        </vu-accordion>
      `,
    );
    await elementUpdated(el);
    el.expandAll();
    await elementUpdated(el);
    expect(el.querySelector<VuAccordionItem>("#a")!.open).toBe(true);
    expect(el.querySelector<VuAccordionItem>("#b")!.open).toBe(true);
  });

  it("expandAll opens only the first item in single mode", async () => {
    const el = await fixture<VuAccordion>(
      html`
        <vu-accordion .multiple=${false}>
          <vu-accordion-item id="a"><span slot="title">A</span><div slot="body">A</div></vu-accordion-item>
          <vu-accordion-item id="b"><span slot="title">B</span><div slot="body">B</div></vu-accordion-item>
        </vu-accordion>
      `,
    );
    await elementUpdated(el);
    el.expandAll();
    await elementUpdated(el);
    expect(el.querySelector<VuAccordionItem>("#a")!.open).toBe(true);
    expect(el.querySelector<VuAccordionItem>("#b")!.open).toBe(false);
  });

  it("collapseAll closes every item", async () => {
    const el = await fixture<VuAccordion>(
      html`
        <vu-accordion>
          <vu-accordion-item id="a" open><span slot="title">A</span><div slot="body">A</div></vu-accordion-item>
          <vu-accordion-item id="b" open><span slot="title">B</span><div slot="body">B</div></vu-accordion-item>
        </vu-accordion>
      `,
    );
    await elementUpdated(el);
    el.collapseAll();
    await elementUpdated(el);
    expect(el.querySelector<VuAccordionItem>("#a")!.open).toBe(false);
    expect(el.querySelector<VuAccordionItem>("#b")!.open).toBe(false);
  });

  it("openItem, closeItem, and toggleItem succeed on enabled items", async () => {
    const el = await fixture<VuAccordion>(
      html`
        <vu-accordion>
          <vu-accordion-item id="a"><span slot="title">A</span><div slot="body">A</div></vu-accordion-item>
        </vu-accordion>
      `,
    );
    await elementUpdated(el);
    const item = el.querySelector<VuAccordionItem>("#a")!;
    expect(el.openItem(0)).toBe(true);
    await elementUpdated(el);
    expect(item.open).toBe(true);
    expect(el.closeItem(0)).toBe(true);
    await elementUpdated(el);
    expect(item.open).toBe(false);
    expect(el.toggleItem(0)).toBe(true);
    await elementUpdated(el);
    expect(item.open).toBe(true);
  });

  it("imperative APIs no-op while host is disabled", async () => {
    const el = await fixture<VuAccordion>(
      html`
        <vu-accordion disabled>
          <vu-accordion-item id="a"><span slot="title">A</span><div slot="body">A</div></vu-accordion-item>
        </vu-accordion>
      `,
    );
    await elementUpdated(el);
    expect(el.openItem(0)).toBe(false);
    el.expandAll();
    await elementUpdated(el);
    expect(el.querySelector<VuAccordionItem>("#a")!.open).toBe(false);
  });

  it("focusItem focuses the item header", async () => {
    const el = await fixture<VuAccordion>(
      html`
        <vu-accordion>
          <vu-accordion-item id="a"><span slot="title">A</span><div slot="body">A</div></vu-accordion-item>
        </vu-accordion>
      `,
    );
    await elementUpdated(el);
    const item = el.querySelector<VuAccordionItem>("#a")!;
    const header = item.shadowRoot?.querySelector<HTMLElement>('[part="header"]')!;
    const focusSpy = vi.spyOn(header, "focus");
    expect(el.focusItem(0)).toBe(true);
    expect(focusSpy).toHaveBeenCalledOnce();
  });

  it("with multiple, more than one item can stay open", async () => {
    const el = await fixture<VuAccordion>(
      html`
        <vu-accordion>
          <vu-accordion-item id="a"><span slot="title">A</span><div slot="body">A</div></vu-accordion-item>
          <vu-accordion-item id="b"><span slot="title">B</span><div slot="body">B</div></vu-accordion-item>
        </vu-accordion>
      `,
    );
    await elementUpdated(el);
    expect(el.multiple).toBe(true);
    const itemA = el.querySelector<VuAccordionItem>("#a")!;
    const itemB = el.querySelector<VuAccordionItem>("#b")!;
    itemA.shadowRoot?.querySelector<HTMLElement>("[part=header]")?.click();
    await elementUpdated(el);
    itemB.shadowRoot?.querySelector<HTMLElement>("[part=header]")?.click();
    await elementUpdated(el);
    expect(itemA.open).toBe(true);
    expect(itemB.open).toBe(true);
  });

  it("with multiple={false}, opening a sibling closes the previously open item", async () => {
    const el = await fixture<VuAccordion>(
      html`
        <vu-accordion .multiple=${false}>
          <vu-accordion-item id="a"><span slot="title">A</span><div slot="body">Content A</div></vu-accordion-item>
          <vu-accordion-item id="b"><span slot="title">B</span><div slot="body">Content B</div></vu-accordion-item>
        </vu-accordion>
      `,
    );
    await elementUpdated(el);
    const itemA = el.querySelector<VuAccordionItem>("#a")!;
    const itemB = el.querySelector<VuAccordionItem>("#b")!;
    const headerA = itemA.shadowRoot?.querySelector("[part=header]") as HTMLElement;
    const headerB = itemB.shadowRoot?.querySelector("[part=header]") as HTMLElement;
    headerA.click();
    await elementUpdated(el);
    expect(itemA.open).toBe(true);
    headerB.click();
    await elementUpdated(el);
    await elementUpdated(itemA);
    expect(itemB.open).toBe(true);
    expect(itemA.open).toBe(false);
  });

  it("vu-open-change event has detail.open and bubbles", async () => {
    const el = await fixture<VuAccordion>(
      html`
        <vu-accordion>
          <vu-accordion-item id="item"><span slot="title">Title</span><div slot="body">Content</div></vu-accordion-item>
        </vu-accordion>
      `,
    );
    await elementUpdated(el);
    const item = el.querySelector<VuAccordionItem>("#item")!;
    const header = item.shadowRoot?.querySelector("[part=header]") as HTMLElement;
    const openPromise = new Promise<CustomEvent<{ open: boolean }>>((resolve) => {
      el.addEventListener("vu-open-change", (e: Event) => resolve(e as CustomEvent<{ open: boolean }>), { once: true });
    });
    header?.click();
    const openEv = await openPromise;
    expect(openEv.detail?.open).toBe(true);
    expect(openEv.bubbles).toBe(true);
    expect(openEv.composed).toBe(true);
    const closePromise = new Promise<CustomEvent<{ open: boolean }>>((resolve) => {
      el.addEventListener("vu-open-change", (e: Event) => resolve(e as CustomEvent<{ open: boolean }>), { once: true });
    });
    header?.click();
    const closeEv = await closePromise;
    expect(closeEv.detail?.open).toBe(false);
  });

  it("moves focus with Arrow Down/Up and Home/End between item headers", async () => {
    const el = await fixture<VuAccordion>(
      html`
        <vu-accordion>
          <vu-accordion-item id="i1"><span slot="title">One</span><div slot="body">C1</div></vu-accordion-item>
          <vu-accordion-item id="i2"><span slot="title">Two</span><div slot="body">C2</div></vu-accordion-item>
          <vu-accordion-item id="i3"><span slot="title">Three</span><div slot="body">C3</div></vu-accordion-item>
        </vu-accordion>
      `,
    );
    await elementUpdated(el);
    const item1 = el.querySelector<VuAccordionItem>("#i1")!;
    const item2 = el.querySelector<VuAccordionItem>("#i2")!;
    const item3 = el.querySelector<VuAccordionItem>("#i3")!;
    const header1 = item1.shadowRoot?.querySelector<HTMLElement>("[part=header]");
    header1?.focus();
    const dispatchKey = (key: string, from: HTMLElement) => {
      from.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
    };
    dispatchKey("ArrowDown", item1);
    expect(item2.contains(document.activeElement as Node) || document.activeElement === item2).toBe(true);
    dispatchKey("ArrowDown", item2);
    expect(item3.contains(document.activeElement as Node) || document.activeElement === item3).toBe(true);
    dispatchKey("ArrowUp", item3);
    expect(item2.contains(document.activeElement as Node) || document.activeElement === item2).toBe(true);
    dispatchKey("Home", item2);
    expect(item1.contains(document.activeElement as Node) || document.activeElement === item1).toBe(true);
    dispatchKey("End", item1);
    expect(item3.contains(document.activeElement as Node) || document.activeElement === item3).toBe(true);
  });

  it("renders with no items (empty slot)", async () => {
    const el = await fixture<VuAccordion>(html`<vu-accordion></vu-accordion>`);
    await elementUpdated(el);
    const group = el.shadowRoot?.querySelector('[part="group"]');
    expect(group).toBeTruthy();
    expect(el.children.length).toBe(0);
  });
});

describe("accessibility", () => {
  it("accordion with items passes axe", async () => {
    const el = await fixture(html`
      <vu-accordion>
        <vu-accordion-item>
          <span slot="title">Section one</span>
          <div slot="body">Body one</div>
        </vu-accordion-item>
        <vu-accordion-item>
          <span slot="title">Section two</span>
          <div slot="body">Body two</div>
        </vu-accordion-item>
      </vu-accordion>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("disabled group passes axe", async () => {
    const el = await fixture(html`
      <vu-accordion disabled>
        <vu-accordion-item>
          <span slot="title">Section one</span>
          <div slot="body">Body one</div>
        </vu-accordion-item>
      </vu-accordion>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
