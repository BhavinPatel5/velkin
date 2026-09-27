/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6 N/A 7 N/A 8✓ 9 N/A
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { afterEach, beforeEach, expect, vi } from "vitest";
import { resetDismissibleStackForTests } from "../../../internals/utils/dismissible-stack.js";
import { VuSpeeddial } from "../speeddial.js";
import "../../icon/icon.js";
import "../../button/button.js";

describe("vu-speeddial", () => {
  it("is defined", () => {
    expect(customElements.get("vu-speeddial")).toBe(VuSpeeddial);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuSpeeddial>(html`<vu-speeddial></vu-speeddial>`);
    await elementUpdated(el);
    expect(el.open).toBe(false);
    expect(el.direction).toBe("top");
    expect(el.color).toBe("primary");
    expect(el.size).toBe("md");
    expect(el.icon).toBe("ion:add");
    expect(el.iconOpen).toBe("ion:close");
    expect(el.label).toBe("");
    expect(el.closeOnEsc).toBe(true);
    expect(el.closeOnOutside).toBe(true);
    expect(el.expand).toBe("top");
  });

  it("accepts open, direction, icon, and appearance props", async () => {
    const el = await fixture<VuSpeeddial>(html`
      <vu-speeddial
        open
        direction="bottom"
        icon="ion:heart"
        iconOpen="ion:close-circle"
        color="success"
        size="lg"
        label="Actions"
      >
        <button type="button">One</button>
      </vu-speeddial>
    `);
    await elementUpdated(el);
    expect(el.open).toBe(true);
    expect(el.direction).toBe("bottom");
    expect(el.icon).toBe("ion:heart");
    expect(el.iconOpen).toBe("ion:close-circle");
    expect(el.color).toBe("success");
    expect(el.size).toBe("lg");
    expect(el.label).toBe("Actions");
  });

  it("reflects open and direction", async () => {
    const el = await fixture<VuSpeeddial>(
      html`<vu-speeddial open direction="left"><button type="button">A</button></vu-speeddial>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("open")).toBe("");
    expect(el.getAttribute("direction")).toBe("left");
  });

  it("has root, fab, and actions parts", async () => {
    const el = await fixture<VuSpeeddial>(html`<vu-speeddial></vu-speeddial>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="root"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="fab"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="actions"]')).toBeTruthy();
  });

  it("renders slotted action buttons", async () => {
    const el = await fixture<VuSpeeddial>(html`
      <vu-speeddial>
        <button type="button" aria-label="Edit">E</button>
        <button type="button" aria-label="Share">S</button>
      </vu-speeddial>
    `);
    await elementUpdated(el);
    expect(el.querySelectorAll("button").length).toBe(2);
  });

  it("does not open without slotted actions", async () => {
    const el = await fixture<VuSpeeddial>(html`<vu-speeddial></vu-speeddial>`);
    await elementUpdated(el);
    el.show();
    await elementUpdated(el);
    expect(el.open).toBe(false);
    el.toggle();
    await elementUpdated(el);
    expect(el.open).toBe(false);
  });

  it("show, hide, and toggle methods", async () => {
    const el = await fixture<VuSpeeddial>(html`
      <vu-speeddial>
        <button type="button">One</button>
      </vu-speeddial>
    `);
    await elementUpdated(el);
    el.show();
    await elementUpdated(el);
    expect(el.open).toBe(true);
    el.hide();
    await elementUpdated(el);
    expect(el.open).toBe(false);
    el.toggle();
    await elementUpdated(el);
    expect(el.open).toBe(true);
  });

  it("FAB click opens and a second click closes", async () => {
    const el = await fixture<VuSpeeddial>(html`
      <vu-speeddial label="Quick actions">
        <button type="button">One</button>
      </vu-speeddial>
    `);
    await elementUpdated(el);
    const fab = el.shadowRoot?.querySelector('[part="fab"]') as HTMLButtonElement;
    fab.click();
    await elementUpdated(el);
    expect(el.open).toBe(true);
    expect(fab.getAttribute("aria-expanded")).toBe("true");
    fab.click();
    await elementUpdated(el);
    expect(el.open).toBe(false);
    expect(fab.getAttribute("aria-expanded")).toBe("false");
  });

  it("actions popover resets UA inset so left/top can stick", async () => {
    const el = await fixture<VuSpeeddial>(html`<vu-speeddial></vu-speeddial>`);
    await elementUpdated(el);
    const cssText = el.shadowRoot?.querySelector("style")?.textContent ?? "";
    expect(cssText).toContain("inset: auto");
    expect(cssText).toContain("[popover]:not(:popover-open)");
  });

  it("emits vu-open-change when opened", async () => {
    const el = await fixture<VuSpeeddial>(html`
      <vu-speeddial>
        <button type="button">One</button>
      </vu-speeddial>
    `);
    await elementUpdated(el);
    let detail: { open: boolean; direction: string } | undefined;
    el.addEventListener("vu-open-change", ((
      e: CustomEvent<{ open: boolean; direction: string }>,
    ) => {
      detail = e.detail;
    }) as EventListener);
    el.show();
    await elementUpdated(el);
    expect(detail?.open).toBe(true);
    expect(detail?.direction).toBe(el.expand);
  });

  it("emits vu-open and vu-close", async () => {
    const el = await fixture<VuSpeeddial>(html`
      <vu-speeddial>
        <button type="button">One</button>
      </vu-speeddial>
    `);
    await elementUpdated(el);
    const events: string[] = [];
    el.addEventListener("vu-open", () => events.push("vu-open"));
    el.addEventListener("vu-close", () => events.push("vu-close"));
    el.show();
    await elementUpdated(el);
    el.hide();
    await elementUpdated(el);
    expect(events).toContain("vu-open");
    expect(events).toContain("vu-close");
  });

  it("sets data-expand from direction", async () => {
    const el = await fixture<VuSpeeddial>(
      html`<vu-speeddial direction="right"><button type="button">A</button></vu-speeddial>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("data-expand")).toBe("right");
    expect(el.expand).toBe("right");
  });

  it("marks slotted buttons as menuitems when open", async () => {
    const el = await fixture<VuSpeeddial>(html`
      <vu-speeddial open>
        <button type="button">One</button>
      </vu-speeddial>
    `);
    await elementUpdated(el);
    const action = el.querySelector("button");
    expect(action?.getAttribute("role")).toBe("menuitem");
    expect(action?.getAttribute("tabindex")).toBe("0");
  });

  it("marks slotted vu-button as menuitem when open", async () => {
    const el = await fixture<VuSpeeddial>(html`
      <vu-speeddial open>
        <vu-button label="Post" radius="full"></vu-button>
      </vu-speeddial>
    `);
    await elementUpdated(el);
    const action = el.querySelector("vu-button");
    expect(action?.getAttribute("role")).toBe("menuitem");
    const inner = action?.shadowRoot?.querySelector('[part="base"]');
    expect(inner?.getAttribute("tabindex")).toBe("0");
  });

  it("sets aria-expanded on the FAB", async () => {
    const el = await fixture<VuSpeeddial>(html`
      <vu-speeddial .open=${true}>
        <button type="button">One</button>
      </vu-speeddial>
    `);
    await elementUpdated(el);
    const fab = el.shadowRoot?.querySelector('[part="fab"]');
    expect(fab?.getAttribute("aria-expanded")).toBe("true");
  });

  it("Escape closes when open", async () => {
    resetDismissibleStackForTests();
    const el = await fixture<VuSpeeddial>(html`
      <vu-speeddial .open=${true}>
        <button type="button">One</button>
      </vu-speeddial>
    `);
    await elementUpdated(el);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await elementUpdated(el);
    expect(el.open).toBe(false);
  });

  it("does not close on Escape when closeOnEsc is false", async () => {
    resetDismissibleStackForTests();
    const el = await fixture<VuSpeeddial>(html`
      <vu-speeddial .open=${true} .closeOnEsc=${false}>
        <button type="button">One</button>
      </vu-speeddial>
    `);
    await elementUpdated(el);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await elementUpdated(el);
    expect(el.open).toBe(true);
  });

  it("outside pointerdown closes when open", async () => {
    const el = await fixture<VuSpeeddial>(html`
      <vu-speeddial .open=${true}>
        <button type="button">One</button>
      </vu-speeddial>
    `);
    await elementUpdated(el);
    document.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    await elementUpdated(el);
    expect(el.open).toBe(false);
  });

  it("does not close on outside pointerdown when closeOnOutside is false", async () => {
    const el = await fixture<VuSpeeddial>(html`
      <vu-speeddial .open=${true} .closeOnOutside=${false}>
        <button type="button">One</button>
      </vu-speeddial>
    `);
    await elementUpdated(el);
    document.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    await elementUpdated(el);
    expect(el.open).toBe(true);
  });

  it("ArrowDown on FAB focuses the first action when open", async () => {
    const el = await fixture<VuSpeeddial>(html`
      <vu-speeddial .open=${true}>
        <button type="button" id="first">One</button>
        <button type="button">Two</button>
      </vu-speeddial>
    `);
    await elementUpdated(el);
    const fab = el.shadowRoot?.querySelector('[part="fab"]') as HTMLButtonElement;
    fab.focus();
    fab.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await elementUpdated(el);
    expect(document.activeElement?.id).toBe("first");
  });

  it("ArrowDown on actions moves roving focus", async () => {
    const el = await fixture<VuSpeeddial>(html`
      <vu-speeddial .open=${true}>
        <button type="button" id="first">One</button>
        <button type="button" id="second">Two</button>
      </vu-speeddial>
    `);
    await elementUpdated(el);
    const first = el.querySelector("#first") as HTMLButtonElement;
    const second = el.querySelector("#second") as HTMLButtonElement;
    first.focus();
    second.setAttribute("tabindex", "-1");
    first.setAttribute("tabindex", "0");
    const actions = el.shadowRoot?.querySelector('[part="actions"]') as HTMLElement;
    actions.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    await elementUpdated(el);
    expect(document.activeElement?.id).toBe("second");
  });

  it("closes after an action is clicked", async () => {
    const el = await fixture<VuSpeeddial>(html`
      <vu-speeddial .open=${true}>
        <button type="button">One</button>
      </vu-speeddial>
    `);
    await elementUpdated(el);
    el.querySelector("button")?.click();
    await elementUpdated(el);
    expect(el.open).toBe(false);
  });

  it("exposes layout tokens as CSS variables", async () => {
    const el = await fixture<VuSpeeddial>(html`<vu-speeddial></vu-speeddial>`);
    await elementUpdated(el);
    const cssText = el.shadowRoot?.querySelector("style")?.textContent ?? "";
    expect(cssText).toContain("--speeddial-fab-size");
    expect(cssText).toContain("--speeddial-action-size");
  });
});

describe("accessibility", () => {
  it("closed default", async () => {
    const el = await fixture<VuSpeeddial>(
      html`<vu-speeddial label="Quick actions"></vu-speeddial>`,
    );
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("open with actions", async () => {
    const el = await fixture<VuSpeeddial>(html`
      <vu-speeddial label="Quick actions" .open=${true}>
        <button type="button" aria-label="Edit">E</button>
        <button type="button" aria-label="Share">S</button>
      </vu-speeddial>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("open in RTL document context", async () => {
    const wrap = await fixture(html`
      <div dir="rtl" lang="en">
        <vu-speeddial label="Actions" .open=${true}>
          <button type="button" aria-label="Edit">E</button>
        </vu-speeddial>
      </div>
    `);
    await elementUpdated(wrap);
    const el = wrap.querySelector("vu-speeddial") as VuSpeeddial;
    await expectA11y(el).to.be.accessible();
  });

  describe("with prefers-reduced-motion", () => {
    beforeEach(() => {
      vi.stubGlobal(
        "matchMedia",
        vi.fn().mockImplementation((query: string) => ({
          matches: query.includes("prefers-reduced-motion"),
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      );
    });
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it("still passes axe when reduced motion is preferred", async () => {
      const el = await fixture<VuSpeeddial>(html`
        <vu-speeddial label="Actions" .open=${true}>
          <button type="button" aria-label="Edit">E</button>
        </vu-speeddial>
      `);
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });
  });
});
