/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect, vi } from "vitest";
import { VuDropdown } from "../dropdown.js";
import "../../icon/icon.js";
import "../../button/button.js";
import "../../divider/divider.js";

describe("vu-dropdown", () => {
  it("is defined", () => {
    expect(customElements.get("vu-dropdown")).toBe(VuDropdown);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuDropdown>(html`<vu-dropdown></vu-dropdown>`);
    await elementUpdated(el);
    expect(el.open).toBe(false);
    expect(el.trigger).toBe("click");
    expect(el.placement).toBe("bottom");
    expect(el.align).toBe("center");
    expect(el.width).toBe("auto");
    expect(el.variant).toBe("elevated");
    expect(el.tone).toBe("normal");
    expect(el.size).toBe("md");
    expect(el.radius).toBe("md");
    expect(el.closeOnSelect).toBe(true);
    expect(el.offset).toBe(8);
    expect(el.value).toBe("");
  });

  it("renders trigger and default slot", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown>
        <button slot="trigger">Open</button>
        <vu-dropdown-item label="One"></vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    expect(el.querySelector('button[slot="trigger"]')).toBeTruthy();
    expect(el.querySelector("vu-dropdown-item")).toBeTruthy();
  });

  it("reflects placement, align, variant, and tone", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown placement="top" align="end" variant="soft" tone="strong"></vu-dropdown>
    `);
    await elementUpdated(el);
    expect(el.placement).toBe("top");
    expect(el.align).toBe("end");
    expect(el.variant).toBe("soft");
    expect(el.tone).toBe("strong");
  });

  it("exposes body and body-scroll parts", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown>
        <button slot="trigger">Open</button>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="trigger"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="body"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="body-scroll"]')).toBeTruthy();
  });

  it("accepts maxheight and custom width length", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown maxheight="400px" width="280px"></vu-dropdown>
    `);
    await elementUpdated(el);
    expect(el.maxHeight).toBe("400px");
    expect(el.width).toBe("280px");
    expect(el.style.getPropertyValue("--dropdown-max-height")).toBe("400px");
    expect(el.style.getPropertyValue("--dropdown-width")).toBe("280px");
  });

  it("does not set --dropdown-width to auto when width preset is auto", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown width="auto">
        <button slot="trigger">Menu</button>
        <vu-dropdown-item label="Short"></vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    expect(el.getAttribute("width")).toBe("auto");
    expect(el.style.getPropertyValue("--dropdown-width")).toBe("");
  });

  it("accepts closeonselect and width trigger", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown closeonselect width="trigger"></vu-dropdown>
    `);
    await elementUpdated(el);
    expect(el.closeOnSelect).toBe(true);
    expect(el.width).toBe("trigger");
  });

  it("show and hide set open without requiring a live popover", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown>
        <button slot="trigger">Open</button>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    el.show();
    expect(el.open).toBe(true);
    el.hide();
    expect(el.open).toBe(false);
  });

  it("toggle flips open", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown>
        <button slot="trigger">Open</button>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    el.toggle();
    expect(el.open).toBe(true);
    el.toggle();
    expect(el.open).toBe(false);
  });

  it("dispatches vu-select when a dropdown-item activates", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown>
        <button slot="trigger">Open</button>
        <vu-dropdown-item label="Save" value="save"></vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    let picked: { value: string; label: string } | undefined;
    el.addEventListener("vu-select", ((e: CustomEvent) => {
      picked = e.detail;
    }) as EventListener);
    el.querySelector("vu-dropdown-item")!.activate();
    expect(picked?.value).toBe("save");
    expect(el.value).toBe("save");
  });

  it("closes after select when closeOnSelect is true", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown closeonselect>
        <button slot="trigger">Open</button>
        <vu-dropdown-item label="Pick" value="pick"></vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    el.open = true;
    el.querySelector("vu-dropdown-item")!.activate();
    expect(el.open).toBe(false);
  });

  it("stays open after select when closeOnSelect is false", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown .closeOnSelect=${false}>
        <button slot="trigger">Open</button>
        <vu-dropdown-item label="Pick" value="pick"></vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    el.open = true;
    el.querySelector("vu-dropdown-item")!.activate();
    expect(el.open).toBe(true);
  });

  it("highlights the activated dropdown-item as selected", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown>
        <button slot="trigger">Open</button>
        <vu-dropdown-item label="A" value="a"></vu-dropdown-item>
        <vu-dropdown-item label="B" value="b"></vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    const items = [...el.querySelectorAll("vu-dropdown-item")];
    items[1]!.activate();
    expect(items[0]!.selected).toBe(false);
    expect(items[1]!.selected).toBe(true);
  });

  it("forwards size to dropdown-item children without their own size", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown size="lg">
        <button slot="trigger">Open</button>
        <vu-dropdown-item label="One"></vu-dropdown-item>
        <vu-dropdown-item label="Two"></vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    for (const item of el.querySelectorAll("vu-dropdown-item")) {
      expect(item.getAttribute("size")).toBe("lg");
    }
  });

  it("does not overwrite dropdown-item size the consumer set explicitly", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown size="lg">
        <button slot="trigger">Open</button>
        <vu-dropdown-item label="Default"></vu-dropdown-item>
        <vu-dropdown-item label="Compact" size="sm"></vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    const items = el.querySelectorAll("vu-dropdown-item");
    expect(items[0]?.getAttribute("size")).toBe("lg");
    expect(items[1]?.getAttribute("size")).toBe("sm");
  });

  it("wires aria-expanded on the slotted trigger control", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown>
        <button slot="trigger">Menu</button>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    const btn = el.querySelector('button[slot="trigger"]');
    expect(btn?.getAttribute("aria-haspopup")).toBe("menu");
    expect(btn?.getAttribute("aria-controls")).toBeTruthy();
    expect(btn?.getAttribute("aria-expanded")).toBe("false");
  });

  it("ArrowDown on the menu moves roving focus between items", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown>
        <button slot="trigger">Open</button>
        <vu-dropdown-item label="One"></vu-dropdown-item>
        <vu-dropdown-item label="Two"></vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    const menu = el.shadowRoot?.querySelector('[part="body"]') as HTMLElement;
    const items = [...el.querySelectorAll("vu-dropdown-item")];
    items[0]!.menuTabIndex = 0;
    items[0]!.focus();
    menu.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, composed: true }),
    );
    await elementUpdated(el);
    expect(items[1]!.menuTabIndex).toBe(0);
    expect(items[0]!.menuTabIndex).toBe(-1);
  });

  it("activates a plain role=menuitem row on click", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown>
        <button slot="trigger">Open</button>
        <button type="button" role="menuitem" value="raw">Raw</button>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    let picked: { value: string } | undefined;
    el.addEventListener("vu-select", ((e: CustomEvent) => {
      picked = e.detail;
    }) as EventListener);
    el.querySelector('[role="menuitem"]')!.click();
    expect(picked?.value).toBe("raw");
  });

  it("syncs item selected state from host value", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown value="b">
        <button slot="trigger">Menu</button>
        <vu-dropdown-item label="A" value="a"></vu-dropdown-item>
        <vu-dropdown-item label="B" value="b"></vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    const items = [...el.querySelectorAll("vu-dropdown-item")];
    expect(items[0]!.selected).toBe(false);
    expect(items[1]!.selected).toBe(true);
  });

  it("keeps menu open after checkbox item when closeOnSelect is true", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown closeonselect>
        <button slot="trigger">Menu</button>
        <vu-dropdown-item kind="checkbox" label="Flag" value="flag"></vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    el.open = true;
    el.querySelector("vu-dropdown-item")!.activate();
    expect(el.open).toBe(true);
  });

  it("accepts placement auto", async () => {
    const el = await fixture<VuDropdown>(html`<vu-dropdown placement="auto"></vu-dropdown>`);
    await elementUpdated(el);
    expect(el.placement).toBe("auto");
    expect(el.getAttribute("placement")).toBe("auto");
  });

  it("forwards itemColor to items without their own color", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown itemcolor="primary">
        <button slot="trigger">Menu</button>
        <vu-dropdown-item label="Inherited"></vu-dropdown-item>
        <vu-dropdown-item label="Own" color="danger"></vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    const items = [...el.querySelectorAll("vu-dropdown-item")];
    expect(items[0]!.getAttribute("color")).toBe("primary");
    expect(items[1]!.getAttribute("color")).toBe("danger");
  });

  it("wires submenu flyout on dropdown-item", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown>
        <button slot="trigger">Menu</button>
        <vu-dropdown-item label="More">
          <vu-dropdown slot="submenu" placement="right">
            <vu-dropdown-item label="Nested" value="nested"></vu-dropdown-item>
          </vu-dropdown>
        </vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    const parentItem = el.querySelector("vu-dropdown-item")!;
    const flyout = parentItem.querySelector('vu-dropdown[slot="submenu"]') as VuDropdown;
    expect(parentItem.hasSubmenu()).toBe(true);
    expect(flyout.trigger).toBe("submenu");
    parentItem.openSubmenu();
    await elementUpdated(flyout);
    expect(flyout.open).toBe(true);
  });

  it("activates nested submenu items and keeps the parent menu open", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown>
        <button slot="trigger">Menu</button>
        <vu-dropdown-item label="More">
          <vu-dropdown slot="submenu" placement="right">
            <vu-dropdown-item label="Nested" value="nested"></vu-dropdown-item>
          </vu-dropdown>
        </vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    const parentItem = el.querySelector("vu-dropdown-item")!;
    const flyout = parentItem.querySelector("vu-dropdown") as VuDropdown;
    el.open = true;
    parentItem.openSubmenu();
    await elementUpdated(flyout);
    let picked: string | undefined;
    el.addEventListener("vu-select", ((e: CustomEvent) => {
      picked = e.detail.value;
    }) as EventListener);
    flyout.querySelector("vu-dropdown-item")!.activate();
    expect(picked).toBe("nested");
    expect(el.value).toBe("nested");
    expect(el.open).toBe(true);
    expect(flyout.open).toBe(false);
    expect(flyout.hasAttribute("data-popover-ignore-outside")).toBe(true);
  });

  it("opens submenu on ArrowRight and closes on ArrowLeft", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown>
        <button slot="trigger">Menu</button>
        <vu-dropdown-item label="More">
          <vu-dropdown slot="submenu" placement="right">
            <vu-dropdown-item label="Nested" value="nested"></vu-dropdown-item>
          </vu-dropdown>
        </vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    el.open = true;
    await elementUpdated(el);
    const parentItem = el.querySelector("vu-dropdown-item")!;
    const flyout = parentItem.querySelector("vu-dropdown") as VuDropdown;
    parentItem.focus();
    await elementUpdated(el);
    el.shadowRoot!.querySelector('[part="body"]')!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    await elementUpdated(flyout);
    expect(flyout.open).toBe(true);
    flyout
      .shadowRoot!.querySelector('[part="body"]')!
      .dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    await elementUpdated(flyout);
    expect(flyout.open).toBe(false);
  });

  it("blocks open when disabled", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown>
        <button slot="trigger">Menu</button>
        <vu-dropdown-item label="One"></vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    el.disabled = true;
    await elementUpdated(el);
    el.show();
    await elementUpdated(el);
    expect(el.open).toBe(false);
    el.toggle();
    await elementUpdated(el);
    expect(el.open).toBe(false);
  });

  it("exposes aria-disabled on host and trigger when disabled", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown disabled>
        <button slot="trigger">Menu</button>
        <vu-dropdown-item label="One"></vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    expect(el.getAttribute("aria-disabled")).toBe("true");
    expect(el.querySelector('button[slot="trigger"]')?.getAttribute("aria-disabled")).toBe("true");
  });

  it("uses a stable body id for aria-controls (not Math.random)", async () => {
    const a = await fixture<VuDropdown>(html`
      <vu-dropdown>
        <button slot="trigger">A</button>
      </vu-dropdown>
    `);
    const b = await fixture<VuDropdown>(html`
      <vu-dropdown>
        <button slot="trigger">B</button>
      </vu-dropdown>
    `);
    await elementUpdated(a);
    await elementUpdated(b);
    const idA = a.shadowRoot?.querySelector('[part="body"]')?.id ?? "";
    const idB = b.shadowRoot?.querySelector('[part="body"]')?.id ?? "";
    expect(idA).toMatch(/^vu-dd-\d+$/);
    expect(idB).toMatch(/^vu-dd-\d+$/);
    expect(idA).not.toBe(idB);
    expect(a.querySelector('button[slot="trigger"]')?.getAttribute("aria-controls")).toBe(idA);
  });

  it("includes prefers-contrast and forced-colors CSS prefs", async () => {
    const el = await fixture<VuDropdown>(html`<vu-dropdown></vu-dropdown>`);
    await elementUpdated(el);
    const cssText = el.shadowRoot?.querySelector("style")?.textContent ?? "";
    expect(cssText).toContain("prefers-contrast: more");
    expect(cssText).toContain("prefers-reduced-transparency: reduce");
    expect(cssText).toContain("forced-colors: active");
  });

  it("closes an open menu when disabled", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown .open=${true}>
        <button slot="trigger">Menu</button>
        <vu-dropdown-item label="One"></vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    el.disabled = true;
    await elementUpdated(el);
    expect(el.open).toBe(false);
  });

  it("opens submenu on row hover after delay", async () => {
    vi.useFakeTimers();
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown>
        <button slot="trigger">Menu</button>
        <vu-dropdown-item label="More">
          <vu-dropdown slot="submenu" placement="right">
            <vu-dropdown-item label="Nested"></vu-dropdown-item>
          </vu-dropdown>
        </vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    el.open = true;
    await elementUpdated(el);
    const parentItem = el.querySelector("vu-dropdown-item")!;
    const flyout = parentItem.querySelector("vu-dropdown") as VuDropdown;
    parentItem
      .shadowRoot!.querySelector('[part="base"]')!
      .dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
    vi.advanceTimersByTime(120);
    await elementUpdated(flyout);
    expect(flyout.open).toBe(true);
    vi.useRealTimers();
  });

  it("closes submenu on Escape before root menu", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown>
        <button slot="trigger">Menu</button>
        <vu-dropdown-item label="More">
          <vu-dropdown slot="submenu" placement="right">
            <vu-dropdown-item label="Nested"></vu-dropdown-item>
          </vu-dropdown>
        </vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    el.open = true;
    await elementUpdated(el);
    const parentItem = el.querySelector("vu-dropdown-item")!;
    const flyout = parentItem.querySelector("vu-dropdown") as VuDropdown;
    parentItem.openSubmenu();
    await elementUpdated(flyout);
    expect(flyout.open).toBe(true);
    parentItem.focus();
    await elementUpdated(flyout);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await elementUpdated(flyout);
    expect(flyout.open).toBe(false);
    expect(el.open).toBe(true);
    el.querySelector('button[slot="trigger"]')!.focus();
    await elementUpdated(el);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await elementUpdated(el);
    expect(el.open).toBe(false);
  });

  it("relays size and itemColor to nested submenu flyouts", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown size="lg" itemcolor="primary">
        <button slot="trigger">Menu</button>
        <vu-dropdown-item label="More">
          <vu-dropdown slot="submenu" placement="right">
            <vu-dropdown-item label="Nested"></vu-dropdown-item>
          </vu-dropdown>
        </vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    const flyout = el.querySelector('vu-dropdown[trigger="submenu"]') as VuDropdown;
    expect(flyout.size).toBe("lg");
    expect(flyout.itemColor).toBe("primary");
  });

  it("syncs radio group from host value", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown value="comfortable">
        <button slot="trigger">Menu</button>
        <vu-dropdown-item kind="radio" label="Compact" value="compact"></vu-dropdown-item>
        <vu-dropdown-item kind="radio" label="Comfortable" value="comfortable"></vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    const items = [...el.querySelectorAll("vu-dropdown-item")];
    expect(items[0]!.checked).toBe(false);
    expect(items[1]!.checked).toBe(true);
  });
});

describe("accessibility", () => {
  it("closed with trigger and items", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown>
        <button slot="trigger">Menu</button>
        <vu-dropdown-item label="One"></vu-dropdown-item>
        <vu-dropdown-item label="Two"></vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("open with trigger and items", async () => {
    const el = await fixture<VuDropdown>(html`
      <vu-dropdown .open=${true}>
        <button slot="trigger">Menu</button>
        <vu-dropdown-item label="One"></vu-dropdown-item>
        <vu-dropdown-item label="Two"></vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
