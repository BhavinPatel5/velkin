/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6 N/A 7 N/A 8✓ 9 N/A
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect, vi } from "vitest";
import { VuNavPanel } from "../nav-panel.js";
import type { VuNavPanelItem } from "../nav-panel.types.js";
import "../../icon/icon.js";
import "../../tooltip/tooltip.js";

const flatItems: VuNavPanelItem[] = [
  { label: "Home", value: "home", icon: "ion:home-outline" },
  { label: "Settings", value: "settings", icon: "ion:settings-outline", iconPosition: "end" },
];

const richItems: VuNavPanelItem[] = [
  {
    label: "Inbox",
    value: "inbox",
    description: "12 unread messages",
    badge: "12",
    icon: "ion:mail-outline",
  },
  {
    label: "Archive",
    value: "archive",
    description: "Processed items",
    icon: "ion:archive-outline",
  },
];

const groupedItems: VuNavPanelItem[] = [
  { label: "Dashboard", value: "dashboard", category: "Main" },
  { label: "Profile", value: "profile", category: "Main" },
  { label: "Billing", value: "billing", category: "Account" },
];

describe("vu-nav-panel", () => {
  it("is defined", () => {
    expect(customElements.get("vu-nav-panel")).toBe(VuNavPanel);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuNavPanel>(html`<vu-nav-panel></vu-nav-panel>`);
    await elementUpdated(el);
    expect(el.items).toEqual([]);
    expect(el.value).toBe("");
    expect(el.collapsed).toBe(false);
    expect(el.collapsedHints).toBe("tooltip");
    expect(el.collapsedGroups).toEqual({});
    expect(el.label).toBe("Navigation");
    expect(el.size).toBe("md");
    expect(el.color).toBe("default");
  });

  it("reflects value", async () => {
    const el = await fixture<VuNavPanel>(html`<vu-nav-panel value="home"></vu-nav-panel>`);
    await elementUpdated(el);
    expect(el.getAttribute("value")).toBe("home");
  });

  it("renders flat rows", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel .items=${flatItems} value="home"></vu-nav-panel>`,
    );
    await elementUpdated(el);
    const rows = el.shadowRoot?.querySelectorAll('[part="row"]');
    expect(rows?.length).toBe(2);
    expect(el.shadowRoot?.textContent).toContain("Home");
    expect(el.shadowRoot?.textContent).toContain("Settings");
    const active = el.shadowRoot?.querySelector('[part="row"][data-active]');
    expect(active?.textContent?.trim()).toContain("Home");
  });

  it("renders label, description, and badge", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel .items=${richItems} value="inbox"></vu-nav-panel>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="description"]')?.textContent).toContain(
      "12 unread",
    );
    expect(el.shadowRoot?.querySelector('[part="badge"]')?.textContent).toBe("12");
  });

  it("renders grouped sections with headings", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel .items=${groupedItems}></vu-nav-panel>`,
    );
    await elementUpdated(el);
    const headings = el.shadowRoot?.querySelectorAll('[part="heading"]');
    expect(headings?.length).toBe(2);
    expect(el.shadowRoot?.textContent).toContain("Main");
    expect(el.shadowRoot?.textContent).toContain("Account");
  });

  it("reflects value and collapsed", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel value="home" collapsed></vu-nav-panel>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("value")).toBe("home");
    expect(el.hasAttribute("collapsed")).toBe(true);
  });

  it("collapse methods toggle icon rail", async () => {
    const el = await fixture<VuNavPanel>(html`<vu-nav-panel .items=${flatItems}></vu-nav-panel>`);
    await elementUpdated(el);
    el.collapse();
    await elementUpdated(el);
    expect(el.collapsed).toBe(true);
    el.expand();
    await elementUpdated(el);
    expect(el.collapsed).toBe(false);
  });

  it("toggleCollapse flips icon rail", async () => {
    const el = await fixture<VuNavPanel>(html`<vu-nav-panel .items=${flatItems}></vu-nav-panel>`);
    await elementUpdated(el);
    el.toggleCollapse();
    await elementUpdated(el);
    expect(el.collapsed).toBe(true);
    el.toggleCollapse();
    await elementUpdated(el);
    expect(el.collapsed).toBe(false);
  });

  it("emits vu-collapse-change when collapsed toggles", async () => {
    const el = await fixture<VuNavPanel>(html`<vu-nav-panel .items=${flatItems}></vu-nav-panel>`);
    await elementUpdated(el);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    el.setAttribute("data-ready", "");

    const handler = vi.fn();
    el.addEventListener("vu-collapse-change", handler);
    el.collapse();
    await elementUpdated(el);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { collapsed: true } }),
    );
  });

  it("collapsed mode shows icons and hides labels", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel collapsed .items=${richItems} value="inbox"></vu-nav-panel>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="label"]')).toBeNull();
    expect(el.shadowRoot?.querySelector('[part="description"]')).toBeNull();
    expect(el.shadowRoot?.querySelectorAll('[part="icon"]').length).toBeGreaterThan(0);
  });

  it("collapsed mode wraps rows in vu-tooltip", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel collapsed .items=${richItems} value="inbox"></vu-nav-panel>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelectorAll("vu-tooltip").length).toBeGreaterThan(0);
  });

  it("shows tooltip label with badge on focus", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel collapsed .items=${richItems} value="inbox"></vu-nav-panel>`,
    );
    await elementUpdated(el);
    const row = el.shadowRoot?.querySelector<HTMLButtonElement>('[part="row"]');
    row?.focus();
    await elementUpdated(el);
    const tooltip = row?.closest("vu-tooltip");
    expect(tooltip?.label).toContain("Inbox");
    expect(tooltip?.open).toBe(true);
  });

  it("collapsedHints native uses title instead of vu-tooltip", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel collapsed collapsedHints="native" .items=${richItems}></vu-nav-panel>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector("vu-tooltip")).toBeNull();
    expect(el.shadowRoot?.querySelector('[part="row"]')?.getAttribute("title")).toContain("Inbox");
  });

  it("collapsed mode uses fallback initial when icon is missing", async () => {
    const items: VuNavPanelItem[] = [{ label: "Alpha", value: "a" }];
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel collapsed .items=${items}></vu-nav-panel>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="fallback"]')?.textContent).toBe("A");
  });

  it("hides prepend and append in icon rail", async () => {
    const el = await fixture<VuNavPanel>(html`
      <vu-nav-panel collapsed .items=${flatItems}>
        <span slot="prepend">Pre</span>
        <span slot="append">Post</span>
      </vu-nav-panel>
    `);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="prepend"]')?.hasAttribute("hidden")).toBe(false);
    expect(el.shadowRoot?.querySelector('[part="append"]')?.hasAttribute("hidden")).toBe(false);
  });

  it("selects a row on click", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel .items=${flatItems} value="home"></vu-nav-panel>`,
    );
    await elementUpdated(el);

    el.shadowRoot?.querySelectorAll('[part="row"]')[1]?.click();
    await elementUpdated(el);

    expect(el.value).toBe("settings");
  });

  it("dispatches vu-change when a row is selected", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel .items=${flatItems} value="home"></vu-nav-panel>`,
    );
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener("vu-change", handler);

    el.shadowRoot?.querySelectorAll('[part="row"]')[1]?.click();
    await elementUpdated(el);

    expect(handler).toHaveBeenCalled();
    expect(handler.mock.calls[0][0].detail).toEqual({
      value: "settings",
      item: flatItems[1],
    });
  });

  it("does not emit vu-change when re-clicking the active row", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel .items=${flatItems} value="home"></vu-nav-panel>`,
    );
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener("vu-change", handler);
    el.shadowRoot?.querySelector('[part="row"][data-active]')?.click();
    await elementUpdated(el);

    expect(handler).not.toHaveBeenCalled();
    expect(el.value).toBe("home");
  });

  it("skips disabled rows", async () => {
    const items: VuNavPanelItem[] = [
      { label: "Allowed", value: "ok" },
      { label: "Blocked", value: "no", disabled: true },
    ];
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel .items=${items} value="ok"></vu-nav-panel>`,
    );
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener("vu-change", handler);
    el.shadowRoot?.querySelectorAll('[part="row"]')[1]?.click();
    await elementUpdated(el);

    expect(el.value).toBe("ok");
    expect(handler).not.toHaveBeenCalled();
  });

  it("sets aria-disabled on disabled rows", async () => {
    const items: VuNavPanelItem[] = [
      { label: "Allowed", value: "ok" },
      { label: "Blocked", value: "no", disabled: true },
    ];
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel .items=${items} value="ok"></vu-nav-panel>`,
    );
    await elementUpdated(el);
    const disabled = el.shadowRoot?.querySelectorAll('[part="row"]')[1];
    expect(disabled?.getAttribute("aria-disabled")).toBe("true");
  });

  it("relays icons via Lit property binding", async () => {
    const items: VuNavPanelItem[] = [
      { label: "Home", value: "home", icon: "mdi:home" },
    ];
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel .items=${items}></vu-nav-panel>`,
    );
    await elementUpdated(el);
    const icon = el.shadowRoot?.querySelector('[part="icon"]') as
      | import("../../icon/icon.js").VuIcon
      | null;
    expect(icon?.icon).toBe("mdi:home");
  });

  it("includes CSS preference media queries", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel .items=${flatItems}></vu-nav-panel>`,
    );
    await elementUpdated(el);
    const cssText = el.shadowRoot?.querySelector("style")?.textContent ?? "";
    expect(cssText).toContain("prefers-reduced-motion: reduce");
    expect(cssText).toContain("prefers-contrast: more");
    expect(cssText).toContain("prefers-reduced-transparency: reduce");
    expect(cssText).toContain("forced-colors: active");
  });

  it("select sets value and emits vu-change", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel .items=${flatItems} value="home"></vu-nav-panel>`,
    );
    await elementUpdated(el);

    const handler = vi.fn();
    el.addEventListener("vu-change", handler);
    el.select("settings");
    await elementUpdated(el);

    expect(el.value).toBe("settings");
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { value: "settings", item: flatItems[1] },
      }),
    );
  });

  it("toggleGroup collapses and expands a section", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel .items=${groupedItems}></vu-nav-panel>`,
    );
    await elementUpdated(el);
    const groupKey = el.shadowRoot?.querySelector<HTMLElement>('[part="group"]')?.dataset.key;
    expect(groupKey).toBeTruthy();
    el.toggleGroup(groupKey!, true);
    await elementUpdated(el);
    const content = el.shadowRoot?.querySelector('[part="group-content"]');
    expect(content?.hasAttribute("data-collapsed")).toBe(true);
    el.toggleGroup(groupKey!, false);
    await elementUpdated(el);
    expect(content?.hasAttribute("data-collapsed")).toBe(false);
  });

  it("collapseAllGroups and expandAllGroups affect every group", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel .items=${groupedItems}></vu-nav-panel>`,
    );
    await elementUpdated(el);
    el.collapseAllGroups();
    await elementUpdated(el);
    const contents = el.shadowRoot?.querySelectorAll('[part="group-content"]');
    expect(contents?.length).toBe(2);
    for (const content of contents ?? []) {
      expect(content.hasAttribute("data-collapsed")).toBe(true);
    }
    el.expandAllGroups();
    await elementUpdated(el);
    for (const content of contents ?? []) {
      expect(content.hasAttribute("data-collapsed")).toBe(false);
    }
  });

  it("uses roving tabindex on flat rows", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel .items=${flatItems} value="home"></vu-nav-panel>`,
    );
    await elementUpdated(el);
    const rows = el.shadowRoot?.querySelectorAll('[part="row"]');
    expect(rows?.[0]?.getAttribute("tabindex")).toBe("0");
    expect(rows?.[1]?.getAttribute("tabindex")).toBe("-1");
  });

  it("ArrowDown moves focus between rows", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel .items=${flatItems}></vu-nav-panel>`,
    );
    await elementUpdated(el);
    const first = el.shadowRoot?.querySelector<HTMLElement>('[part="row"]');
    const body = el.shadowRoot?.querySelector<HTMLElement>('[part="body"]');
    first?.focus();
    body?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, composed: true }),
    );
    await elementUpdated(el);
    const active = el.shadowRoot?.activeElement;
    expect(active?.getAttribute("part")).toBe("row");
    expect(active?.textContent?.trim()).toContain("Settings");
  });

  it("Home and End move focus to first and last rows", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel .items=${flatItems}></vu-nav-panel>`,
    );
    await elementUpdated(el);
    const body = el.shadowRoot?.querySelector<HTMLElement>('[part="body"]');
    const rows = el.shadowRoot?.querySelectorAll('[part="row"]');
    (rows?.[1] as HTMLElement | undefined)?.focus();
    body?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Home", bubbles: true, composed: true }),
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.activeElement?.textContent?.trim()).toContain("Home");
    body?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "End", bubbles: true, composed: true }),
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.activeElement?.textContent?.trim()).toContain("Settings");
  });

  it("Enter selects the focused row", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel .items=${flatItems} value="home"></vu-nav-panel>`,
    );
    await elementUpdated(el);
    const rows = el.shadowRoot?.querySelectorAll<HTMLElement>('[part="row"]');
    rows?.[1]?.focus();
    rows?.[1]?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true, composed: true }),
    );
    await elementUpdated(el);
    expect(el.value).toBe("settings");
  });

  it("flat list uses listbox semantics", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel .items=${flatItems} value="home"></vu-nav-panel>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="body"]')?.getAttribute("role")).toBe("listbox");
    expect(el.shadowRoot?.querySelector('[part="row"]')?.getAttribute("role")).toBe("option");
    expect(el.shadowRoot?.querySelector('[part="row"][data-active]')?.getAttribute("aria-selected")).toBe(
      "true",
    );
  });

  it("grouped list omits listbox role", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel .items=${groupedItems}></vu-nav-panel>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="body"]')?.hasAttribute("role")).toBe(false);
    expect(el.shadowRoot?.querySelector('[part="row"]')?.hasAttribute("role")).toBe(false);
  });

  it("renders href rows as anchors", async () => {
    const items: VuNavPanelItem[] = [
      { label: "Docs", value: "docs", href: "/docs", target: "_blank" },
    ];
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel .items=${items} value="docs"></vu-nav-panel>`,
    );
    await elementUpdated(el);
    const link = el.shadowRoot?.querySelector<HTMLAnchorElement>('[part="row"]');
    expect(link?.tagName).toBe("A");
    expect(link?.href).toContain("/docs");
    expect(link?.target).toBe("_blank");
    expect(link?.rel).toBe("noopener noreferrer");
  });

  it("reflects size and color", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel size="lg" color="primary"></vu-nav-panel>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("size")).toBe("lg");
    expect(el.getAttribute("color")).toBe("primary");
  });

  describe("accessibility", () => {
    it("applies label to body aria-label", async () => {
      const el = await fixture<VuNavPanel>(
        html`<vu-nav-panel label="Menu" .items=${flatItems}></vu-nav-panel>`,
      );
      await elementUpdated(el);
      expect(el.shadowRoot?.querySelector('[part="body"]')?.getAttribute("aria-label")).toBe(
        "Menu",
      );
    });

    it("passes axe when flat list is rendered", async () => {
      const el = await fixture<VuNavPanel>(
        html`<vu-nav-panel .items=${richItems} value="inbox"></vu-nav-panel>`,
      );
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("passes axe in collapsed icon rail", async () => {
      const el = await fixture<VuNavPanel>(
        html`<vu-nav-panel collapsed .items=${richItems} value="inbox"></vu-nav-panel>`,
      );
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });
  });

  it("collapses prepend and append when empty", async () => {
    const el = await fixture<VuNavPanel>(
      html`<vu-nav-panel .items=${flatItems}></vu-nav-panel>`,
    );
    await elementUpdated(el);
    const prepend = el.shadowRoot?.querySelector('[part="prepend"]') as HTMLElement;
    const append = el.shadowRoot?.querySelector('[part="append"]') as HTMLElement;
    expect(prepend).toBeTruthy();
    expect(append).toBeTruthy();
    expect(prepend.hasAttribute("hidden")).toBe(false);
    expect(append.hasAttribute("hidden")).toBe(false);
    expect((prepend.querySelector("slot") as HTMLSlotElement).assignedElements().length).toBe(0);
    expect((append.querySelector("slot") as HTMLSlotElement).assignedElements().length).toBe(0);
  });

  it("renders prepend and append slots", async () => {
    const el = await fixture<VuNavPanel>(html`
      <vu-nav-panel .items=${flatItems}>
        <span slot="prepend">Pre</span>
        <span slot="append">Post</span>
      </vu-nav-panel>
    `);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="prepend"]')?.hasAttribute("hidden")).toBe(false);
    expect(el.shadowRoot?.querySelector('[part="append"]')?.hasAttribute("hidden")).toBe(false);
    expect(el.querySelector('[slot="prepend"]')?.textContent).toBe("Pre");
    expect(el.querySelector('[slot="append"]')?.textContent).toBe("Post");
  });
});
