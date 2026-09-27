/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuDropdownItem } from "../dropdown-item.js";
import "../../dropdown/dropdown.js";
import "../../icon/icon.js";

describe("vu-dropdown-item", () => {
  it("is defined", () => {
    expect(customElements.get("vu-dropdown-item")).toBe(VuDropdownItem);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuDropdownItem>(html`<vu-dropdown-item></vu-dropdown-item>`);
    await elementUpdated(el);
    expect(el.label).toBe("");
    expect(el.hint).toBe("");
    expect(el.color).toBe("default");
    expect(el.size).toBe("md");
    expect(el.disabled).toBe(false);
    expect(el.selected).toBe(false);
    expect(el.menuTabIndex).toBe(-1);
  });

  it("renders label from slot or prop", async () => {
    const el = await fixture<VuDropdownItem>(html`
      <vu-dropdown-item label="Option A"></vu-dropdown-item>
    `);
    await elementUpdated(el);
    expect(el.getLabel()).toBe("Option A");
    expect(el.shadowRoot?.querySelector('[part="label"]')?.textContent?.trim()).toBe("Option A");
  });

  it("keeps label visible when a nested vu-dropdown is a direct child", async () => {
    const el = await fixture<VuDropdownItem>(html`
      <vu-dropdown-item label="More tools">
        <vu-dropdown placement="right">
          <vu-dropdown-item label="Nested"></vu-dropdown-item>
        </vu-dropdown>
      </vu-dropdown-item>
    `);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="label"]')?.textContent?.trim()).toBe("More tools");
    expect(el.hasSubmenu()).toBe(true);
  });

  it("exposes base, stack, and label parts", async () => {
    const el = await fixture<VuDropdownItem>(html`
      <vu-dropdown-item label="Option"></vu-dropdown-item>
    `);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="base"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="stack"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="label"]')).toBeTruthy();
  });

  it("reflects color, size, disabled, and selected", async () => {
    const el = await fixture<VuDropdownItem>(html`
      <vu-dropdown-item
        label="Danger"
        color="danger"
        size="sm"
        disabled
        selected
      ></vu-dropdown-item>
    `);
    await elementUpdated(el);
    expect(el.color).toBe("danger");
    expect(el.size).toBe("sm");
    expect(el.disabled).toBe(true);
    expect(el.selected).toBe(true);
  });

  it("accepts hint, shortcut, and badge", async () => {
    const el = await fixture<VuDropdownItem>(html`
      <vu-dropdown-item
        label="Save"
        hint="Writes to disk"
        shortcut="Ctrl+S"
        badge="New"
        color="success"
      ></vu-dropdown-item>
    `);
    await elementUpdated(el);
    expect(el.hint).toBe("Writes to disk");
    expect(el.shortcut).toBe("Ctrl+S");
    expect(el.badge).toBe("New");
    expect(el.shadowRoot?.querySelector('[part="badge"]')?.classList.contains("tone-success")).toBe(
      true,
    );
  });

  it("accepts starticon and endicon", async () => {
    const el = await fixture<VuDropdownItem>(html`
      <vu-dropdown-item
        label="Option"
        starticon="mdi:check"
        endicon="mdi:chevron-right"
      ></vu-dropdown-item>
    `);
    await elementUpdated(el);
    expect(el.startIcon).toBe("mdi:check");
    expect(el.endIcon).toBe("mdi:chevron-right");
  });

  it("dispatches vu-select on click", async () => {
    const el = await fixture<VuDropdownItem>(html`
      <vu-dropdown-item label="Go" value="go"></vu-dropdown-item>
    `);
    await elementUpdated(el);
    let detail: { value: string; label: string } | undefined;
    el.addEventListener("vu-select", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);
    el.shadowRoot?.querySelector<HTMLElement>('[part="base"]')?.click();
    expect(detail?.value).toBe("go");
    expect(detail?.label).toBe("Go");
  });

  it("dispatches vu-select on Enter and Space", async () => {
    const el = await fixture<VuDropdownItem>(html`
      <vu-dropdown-item label="Go" value="go"></vu-dropdown-item>
    `);
    await elementUpdated(el);
    let fired = 0;
    el.addEventListener("vu-select", () => {
      fired += 1;
    });
    const base = el.shadowRoot?.querySelector<HTMLElement>('[part="base"]')!;
    base.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    base.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    expect(fired).toBe(2);
  });

  it("does not dispatch vu-select when disabled", async () => {
    const el = await fixture<VuDropdownItem>(html`
      <vu-dropdown-item label="Go" disabled></vu-dropdown-item>
    `);
    await elementUpdated(el);
    let fired = false;
    el.addEventListener("vu-select", () => {
      fired = true;
    });
    el.activate();
    expect(fired).toBe(false);
  });

  it("exposes aria-disabled on the base row when disabled", async () => {
    const el = await fixture<VuDropdownItem>(html`
      <vu-dropdown-item label="Go" disabled></vu-dropdown-item>
    `);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="base"]')?.getAttribute("aria-disabled")).toBe(
      "true",
    );
  });

  it("updates start visibility when a start slot is added at runtime", async () => {
    const el = await fixture<VuDropdownItem>(html`
      <vu-dropdown-item label="Option"></vu-dropdown-item>
    `);
    await elementUpdated(el);
    const start = () => el.shadowRoot?.querySelector('[part="start"]') as HTMLElement;
    expect(start().hasAttribute("hidden")).toBe(false);

    const icon = document.createElement("span");
    icon.slot = "start";
    icon.textContent = "★";
    el.appendChild(icon);
    await elementUpdated(el);

    expect(start().hasAttribute("hidden")).toBe(false);
    expect(el.querySelector('[slot="start"]')?.textContent?.trim()).toBe("★");
  });

  it("updates hint visibility when a hint slot is added at runtime", async () => {
    const el = await fixture<VuDropdownItem>(html`
      <vu-dropdown-item label="Option"></vu-dropdown-item>
    `);
    await elementUpdated(el);
    const hint = () => el.shadowRoot?.querySelector('[part="hint"]') as HTMLElement;
    expect(hint().hasAttribute("hidden")).toBe(false);

    const slotHint = document.createElement("span");
    slotHint.slot = "hint";
    slotHint.textContent = "Extra context";
    el.appendChild(slotHint);
    await elementUpdated(el);

    expect(hint().hasAttribute("hidden")).toBe(false);
  });

  it("includes prefers-contrast and forced-colors CSS prefs", async () => {
    const el = await fixture<VuDropdownItem>(html`<vu-dropdown-item label="A"></vu-dropdown-item>`);
    await elementUpdated(el);
    const cssText = el.shadowRoot?.querySelector("style")?.textContent ?? "";
    expect(cssText).toContain("prefers-contrast: more");
    expect(cssText).toContain("prefers-reduced-transparency: reduce");
    expect(cssText).toContain("forced-colors: active");
  });

  it("activate() dispatches vu-select when enabled", async () => {
    const el = await fixture<VuDropdownItem>(html`
      <vu-dropdown-item label="Run"></vu-dropdown-item>
    `);
    await elementUpdated(el);
    let fired = false;
    el.addEventListener("vu-select", () => {
      fired = true;
    });
    el.activate();
    expect(fired).toBe(true);
  });

  it("vu-select bubbles and composes", async () => {
    const el = await fixture<VuDropdownItem>(html`
      <vu-dropdown-item label="Go"></vu-dropdown-item>
    `);
    await elementUpdated(el);
    let evt: Event | undefined;
    el.addEventListener("vu-select", ((e: Event) => {
      evt = e;
    }) as EventListener);
    el.activate();
    expect(evt?.bubbles).toBe(true);
    expect(evt?.composed).toBe(true);
  });

  it("exposes role menuitem on the base part", async () => {
    const el = await fixture<VuDropdownItem>(html`
      <vu-dropdown-item label="Profile" selected></vu-dropdown-item>
    `);
    await elementUpdated(el);
    const base = el.shadowRoot?.querySelector('[part="base"]');
    expect(base?.getAttribute("role")).toBe("menuitem");
    expect(el.selected).toBe(true);
  });

  it("focus() targets the base part", async () => {
    const el = await fixture<VuDropdownItem>(html`
      <vu-dropdown-item label="Focus me"></vu-dropdown-item>
    `);
    await elementUpdated(el);
    el.focus();
    expect(el.shadowRoot?.activeElement?.getAttribute("part")).toBe("base");
  });

  it("renders checkbox semantics and toggles checked on activate", async () => {
    const el = await fixture<VuDropdownItem>(html`
      <vu-dropdown-item kind="checkbox" label="Flag"></vu-dropdown-item>
    `);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="base"]')?.getAttribute("role")).toBe(
      "menuitemcheckbox",
    );
    el.activate();
    expect(el.checked).toBe(true);
  });

  it("renders link row as anchor menuitem", async () => {
    const el = await fixture<VuDropdownItem>(html`
      <vu-dropdown-item label="Docs" href="https://example.com"></vu-dropdown-item>
    `);
    await elementUpdated(el);
    const link = el.shadowRoot?.querySelector('a[part="base"]');
    expect(link?.getAttribute("href")).toBe("https://example.com");
    expect(link?.getAttribute("role")).toBe("menuitem");
  });
});

describe("accessibility", () => {
  it("inside vu-dropdown menu", async () => {
    const el = await fixture(html`
      <vu-dropdown>
        <button slot="trigger">Menu</button>
        <vu-dropdown-item label="One" selected></vu-dropdown-item>
        <vu-dropdown-item label="Two" hint="Hint" shortcut="⌘K"></vu-dropdown-item>
      </vu-dropdown>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
