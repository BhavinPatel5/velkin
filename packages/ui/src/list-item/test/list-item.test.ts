/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7✓ 8✓ 9✓ 10 N/A
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuListitem } from "../list-item.js";
import "../../list/list.js";
import type { VuList } from "../../list/list.js";

describe("vu-listitem", () => {
  it("is defined", () => {
    expect(customElements.get("vu-listitem")).toBe(VuListitem);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuListitem>(html`<vu-listitem>Item</vu-listitem>`);
    await elementUpdated(el);
    expect(el.label).toBe("");
    expect(el.hint).toBe("");
    expect(el.avatar).toBe("");
    expect(el.value).toBe("");
    expect(el.subheader).toBe("");
    expect(el.href).toBe("");
    expect(el.selected).toBe(false);
    expect(el.dense).toBe(false);
    expect(el.disabled).toBe(false);
    expect(el.shadowRoot?.querySelector('[part="base"]')).toBeTruthy();
    expect(el.textContent?.trim()).toContain("Item");
  });

  it("renders label and hint props", async () => {
    const el = await fixture<VuListitem>(
      html`<vu-listitem label="Primary" hint="Secondary"></vu-listitem>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="label"]')?.textContent?.trim()).toBe("Primary");
    expect(el.shadowRoot?.querySelector('[part="hint"]')?.textContent?.trim()).toContain(
      "Secondary",
    );
  });

  it("renders subheader mode", async () => {
    const el = await fixture<VuListitem>(html`<vu-listitem subheader="Section"></vu-listitem>`);
    await elementUpdated(el);
    expect(el.hasAttribute("data-subheader")).toBe(true);
    expect(el.shadowRoot?.querySelector('[part="subheader"]')?.textContent).toBe("Section");
    expect(el.shadowRoot?.querySelector('[part="base"]')).toBeFalsy();
  });

  it("renders href as anchor base", async () => {
    const el = await fixture<VuListitem>(
      html`<vu-listitem href="https://example.com" label="Docs"></vu-listitem>`,
    );
    await elementUpdated(el);
    const anchor = el.shadowRoot?.querySelector('[part="base"]');
    expect(anchor?.tagName).toBe("A");
    expect(anchor?.getAttribute("href")).toBe("https://example.com");
  });

  it("activate dispatches vu-activate", async () => {
    const el = await fixture<VuListitem>(html`<vu-listitem value="a" label="Row"></vu-listitem>`);
    await elementUpdated(el);
    el.selected = true;
    await elementUpdated(el);
    expect(el.selected).toBe(true);

    let fired = false;
    el.addEventListener("vu-activate", () => {
      fired = true;
    });
    el.activate();
    expect(fired).toBe(true);
  });

  it("does not activate when disabled", async () => {
    const el = await fixture<VuListitem>(html`<vu-listitem disabled label="Row"></vu-listitem>`);
    await elementUpdated(el);
    let fired = false;
    el.addEventListener("vu-activate", () => {
      fired = true;
    });
    el.activate();
    expect(fired).toBe(false);
  });

  it("uses roving tabindex from list parent", async () => {
    const root = await fixture<VuList>(html`
      <vu-list selection="single">
        <vu-listitem value="a" label="A"></vu-listitem>
        <vu-listitem value="b" label="B"></vu-listitem>
      </vu-list>
    `);
    await elementUpdated(root);
    const items = root.getItems();
    expect(items[0]!.itemTabIndex).toBe(0);
    expect(items[1]!.itemTabIndex).toBe(-1);
  });

  it("exposes aria-disabled when disabled", async () => {
    const el = await fixture<VuListitem>(html`<vu-listitem disabled label="Row"></vu-listitem>`);
    await elementUpdated(el);
    expect(el.getAttribute("aria-disabled")).toBe("true");
    el.disabled = false;
    await elementUpdated(el);
    expect(el.hasAttribute("aria-disabled")).toBe(false);
  });

  it("keeps start, hint, and actions slots mounted", async () => {
    const el = await fixture<VuListitem>(html`<vu-listitem label="Row"></vu-listitem>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="start"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="hint"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="actions"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="start"]')?.hasAttribute("hidden")).toBe(false);
    expect(el.shadowRoot?.querySelector('[part="hint"]')?.hasAttribute("hidden")).toBe(false);
    expect(el.shadowRoot?.querySelector('[part="actions"]')?.hasAttribute("hidden")).toBe(false);
  });

  it("relays avatar props via Lit property binding", async () => {
    const el = await fixture<VuListitem>(
      html`<vu-listitem
        label="Ada"
        avatar="https://example.com/a.png"
        name="Ada Lovelace"
      ></vu-listitem>`,
    );
    await elementUpdated(el);
    const avatar = el.shadowRoot?.querySelector("vu-avatar") as
      import("../../avatar/avatar.js").VuAvatar | null;
    expect(avatar?.src).toBe("https://example.com/a.png");
    expect(avatar?.name).toBe("Ada Lovelace");
    expect(avatar?.size).toBe("md");
  });

  it("includes CSS preference media queries", async () => {
    const el = await fixture<VuListitem>(html`<vu-listitem label="Row"></vu-listitem>`);
    await elementUpdated(el);
    const cssText = el.shadowRoot?.querySelector("style")?.textContent ?? "";
    expect(cssText).toContain("prefers-reduced-motion: reduce");
    expect(cssText).toContain("prefers-contrast: more");
    expect(cssText).toContain("prefers-reduced-transparency: reduce");
    expect(cssText).toContain("forced-colors: active");
  });

  describe("accessibility", () => {
    it("default row passes axe", async () => {
      const el = await fixture(html`
        <vu-list ariaLabel="Settings">
          <vu-listitem label="Settings"></vu-listitem>
        </vu-list>
      `);
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("selected option row passes axe", async () => {
      const el = await fixture(html`
        <vu-list selection="single" ariaLabel="Items">
          <vu-listitem value="a" label="Alpha" selected></vu-listitem>
        </vu-list>
      `);
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });
  });
});
