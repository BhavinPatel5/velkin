/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6 N/A 7✓ 8✓ 9✓ 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuList } from "../list.js";
import "../../list-item/list-item.js";

describe("vu-list", () => {
  it("is defined", () => {
    expect(customElements.get("vu-list")).toBe(VuList);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuList>(html`<vu-list></vu-list>`);
    await elementUpdated(el);
    expect(el.selection).toBe("none");
    expect(el.selectedValues).toBeUndefined();
    expect(el.defaultSelectedValues).toEqual([]);
    expect(el.size).toBe("md");
    expect(el.dense).toBe(false);
    expect(el.autofocus).toBe(false);
    expect(el.shadowRoot?.querySelector('[part="base"]')?.getAttribute("role")).toBe("list");
  });

  it("accepts selection single and multiple with listbox semantics", async () => {
    const elSingle = await fixture<VuList>(
      html`<vu-list selection="single" ariaLabel="Pick one"></vu-list>`,
    );
    await elementUpdated(elSingle);
    const base = elSingle.shadowRoot?.querySelector('[part="base"]');
    expect(base?.getAttribute("role")).toBe("listbox");
    expect(base?.getAttribute("aria-label")).toBe("Pick one");

    const elMulti = await fixture<VuList>(html`<vu-list selection="multiple"></vu-list>`);
    await elementUpdated(elMulti);
    expect(
      elMulti.shadowRoot?.querySelector('[part="base"]')?.getAttribute("aria-multiselectable"),
    ).toBe("true");
  });

  it("renders slotted list items", async () => {
    const el = await fixture<VuList>(
      html`<vu-list
        ><vu-listitem label="One"></vu-listitem><vu-listitem label="Two"></vu-listitem
      ></vu-list>`,
    );
    await elementUpdated(el);
    expect(el.getItems().length).toBe(2);
  });

  it("single selection updates selectedValues and fires vu-change", async () => {
    const el = await fixture<VuList>(
      html`<vu-list selection="single">
        <vu-listitem value="a" label="A"></vu-listitem>
        <vu-listitem value="b" label="B"></vu-listitem>
      </vu-list>`,
    );
    await elementUpdated(el);

    const items = el.getItems();
    let detail: { selectedValues: string[] } | undefined;
    el.addEventListener("vu-change", (e) => {
      detail = (e as CustomEvent).detail;
    });

    items[1]!.activate();
    await elementUpdated(el);

    expect(el.selectedValues).toBeUndefined();
    expect(detail?.selectedValues).toEqual(["b"]);
    expect(items[0]!.selected).toBe(false);
    expect(items[1]!.selected).toBe(true);
  });

  it("multiple selection toggles values", async () => {
    const el = await fixture<VuList>(
      html`<vu-list selection="multiple">
        <vu-listitem value="a" label="A"></vu-listitem>
        <vu-listitem value="b" label="B"></vu-listitem>
      </vu-list>`,
    );
    await elementUpdated(el);
    const items = el.getItems();

    items[0]!.activate();
    await elementUpdated(el);
    items[1]!.activate();
    await elementUpdated(el);
    expect(
      el
        .getItems()
        .filter((i) => i.selected)
        .map((i) => i.value),
    ).toEqual(["a", "b"]);

    items[0]!.activate();
    await elementUpdated(el);
    expect(
      el
        .getItems()
        .filter((i) => i.selected)
        .map((i) => i.value),
    ).toEqual(["b"]);
  });

  it("applies controlled selectedValues from the host", async () => {
    const el = await fixture<VuList>(
      html`<vu-list selection="multiple" .selectedValues=${["b"]}>
        <vu-listitem value="a" label="A"></vu-listitem>
        <vu-listitem value="b" label="B"></vu-listitem>
      </vu-list>`,
    );
    await elementUpdated(el);
    const items = el.getItems();
    expect(items[0]!.selected).toBe(false);
    expect(items[1]!.selected).toBe(true);
  });

  it("uses defaultSelectedValues when uncontrolled", async () => {
    const el = await fixture<VuList>(
      html`<vu-list selection="single" .defaultSelectedValues=${["b"]}>
        <vu-listitem value="a" label="A"></vu-listitem>
        <vu-listitem value="b" label="B"></vu-listitem>
      </vu-list>`,
    );
    await elementUpdated(el);
    expect(el.selectedValues).toBeUndefined();
    expect(el.getItems()[1]!.selected).toBe(true);
  });

  it("arrow keys move roving tabindex", async () => {
    const el = await fixture<VuList>(
      html`<vu-list selection="single">
        <vu-listitem value="a" label="Alpha"></vu-listitem>
        <vu-listitem value="b" label="Bravo"></vu-listitem>
      </vu-list>`,
    );
    await elementUpdated(el);
    const items = el.getItems();
    items[0]!.focus();

    const base = items[0]!.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
    base.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, composed: true }),
    );
    await elementUpdated(el);

    expect(items[0]!.itemTabIndex).toBe(-1);
    expect(items[1]!.itemTabIndex).toBe(0);
  });

  it("type-ahead focuses matching row", async () => {
    const el = await fixture<VuList>(
      html`<vu-list selection="single">
        <vu-listitem value="a" label="Alpha"></vu-listitem>
        <vu-listitem value="b" label="Bravo"></vu-listitem>
      </vu-list>`,
    );
    await elementUpdated(el);
    const items = el.getItems();
    items[0]!.focus();
    const base = items[0]!.shadowRoot?.querySelector('[part="base"]') as HTMLElement;

    base.dispatchEvent(new KeyboardEvent("keydown", { key: "b", bubbles: true, composed: true }));
    await elementUpdated(el);

    expect(items[1]!.itemTabIndex).toBe(0);
  });

  it("relays selection mode onto slotted items", async () => {
    const el = await fixture<VuList>(
      html`<vu-list selection="multiple">
        <vu-listitem value="a" label="A"></vu-listitem>
      </vu-list>`,
    );
    await elementUpdated(el);
    expect(el.getItems()[0]!.listSelectionMode).toBe("multiple");
    el.selection = "single";
    await elementUpdated(el);
    expect(el.getItems()[0]!.listSelectionMode).toBe("single");
  });

  it("includes CSS preference media queries", async () => {
    const el = await fixture<VuList>(html`<vu-list></vu-list>`);
    await elementUpdated(el);
    const cssText = el.shadowRoot?.querySelector("style")?.textContent ?? "";
    expect(cssText).toContain("prefers-contrast: more");
    expect(cssText).toContain("prefers-reduced-transparency: reduce");
    expect(cssText).toContain("forced-colors: active");
  });

  describe("accessibility", () => {
    it("single-select list passes axe", async () => {
      const el = await fixture(html`
        <vu-list selection="single" ariaLabel="Folders">
          <vu-listitem value="inbox" label="Inbox"></vu-listitem>
          <vu-listitem value="sent" label="Sent"></vu-listitem>
        </vu-list>
      `);
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });
  });
});
