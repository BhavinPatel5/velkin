/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5 N/A 6 N/A 7 N/A 8✓ 9✓ 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuCombobox } from "../combobox.js";
import "../../icon/icon.js";
import "../../checkbox/checkbox.js";

describe("vu-combobox", () => {
  it("is defined", () => {
    expect(customElements.get("vu-combobox")).toBe(VuCombobox);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuCombobox>(html`<vu-combobox></vu-combobox>`);
    await elementUpdated(el);
    expect(el.placeholder).toBe("Select An Option");
    expect(el.options).toEqual([]);
    expect(el.variant).toBe("default");
    expect(el.tone).toBe("normal");
    expect(el.size).toBe("md");
    expect(el.radius).toBe("md");
    expect(el.block).toBe(false);
    expect(el.multiple).toBe(false);
  });

  it("has field and container parts", async () => {
    const el = await fixture<VuCombobox>(html`<vu-combobox></vu-combobox>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="field"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="container"]')).toBeTruthy();
  });

  it("accepts placeholder and label", async () => {
    const el = await fixture<VuCombobox>(
      html`<vu-combobox placeholder="Pick one" label="Choice"></vu-combobox>`,
    );
    await elementUpdated(el);
    expect(el.placeholder).toBe("Pick one");
    expect(el.label).toBe("Choice");
    expect(el.shadowRoot?.querySelector('[part="label"]')?.textContent?.trim()).toBe("Choice");
  });

  it("forwards host id to the field input trigger", async () => {
    const el = await fixture<VuCombobox>(
      html`<vu-combobox id="fruit" searchable label="Fruit"></vu-combobox>`,
    );
    await elementUpdated(el);
    const input = el.shadowRoot?.querySelector('[part="input"]') as HTMLInputElement;
    expect(input.id).toBe("fruit-trigger");
  });

  it("exposes aria-disabled when disabled", async () => {
    const el = await fixture<VuCombobox>(html`<vu-combobox disabled></vu-combobox>`);
    await elementUpdated(el);
    expect(el.getAttribute("aria-disabled")).toBe("true");
    expect(el.tabIndex).toBe(-1);
  });

  it("updates label visibility when a label slot is added at runtime", async () => {
    const el = await fixture<VuCombobox>(html`<vu-combobox aria-label="Pick color"></vu-combobox>`);
    await elementUpdated(el);
    const label = () => el.shadowRoot?.querySelector('[part="label"]') as HTMLElement;
    expect(label().getAttribute("aria-hidden")).toBe("true");

    const slotLabel = document.createElement("span");
    slotLabel.slot = "label";
    slotLabel.textContent = "Favorite color";
    el.appendChild(slotLabel);
    await elementUpdated(el);

    expect(label().getAttribute("aria-hidden")).toBeNull();
    expect(el.querySelector('[slot="label"]')?.textContent?.trim()).toBe("Favorite color");
  });

  it("readonly keeps the search field but blocks typing", async () => {
    const el = await fixture<VuCombobox>(
      html`<vu-combobox readonly searchable .options=${["Red", "Green"]}></vu-combobox>`,
    );
    await elementUpdated(el);
    const input = el.shadowRoot?.querySelector('[part="input"]') as HTMLInputElement;
    expect(input.readOnly).toBe(true);
    input.value = "Re";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await elementUpdated(el);
    expect(el.query).toBe("");
  });

  it("accepts options array", async () => {
    const options = ["Red", "Green", "Blue"];
    const el = await fixture<VuCombobox>(html`<vu-combobox .options=${options}></vu-combobox>`);
    await elementUpdated(el);
    expect(el.options).toEqual(options);
  });

  it("accepts value for single select", async () => {
    const el = await fixture<VuCombobox>(
      html`<vu-combobox .value=${"Red"} .options=${["Red", "Green"]}></vu-combobox>`,
    );
    await elementUpdated(el);
    expect(el.value).toBe("Red");
  });

  it("reflects searchable and multiple", async () => {
    const el = await fixture<VuCombobox>(html`<vu-combobox searchable multiple></vu-combobox>`);
    await elementUpdated(el);
    expect(el.searchable).toBe(true);
    expect(el.multiple).toBe(true);
  });

  it("reflects full radius and block", async () => {
    const el = await fixture<VuCombobox>(html`<vu-combobox radius="full" block></vu-combobox>`);
    await elementUpdated(el);
    expect(el.radius).toBe("full");
    expect(el.block).toBe(true);
  });

  it("accepts hint and renders hint part", async () => {
    const el = await fixture<VuCombobox>(html`<vu-combobox hint="Pick one option"></vu-combobox>`);
    await elementUpdated(el);
    expect(el.hint).toBe("Pick one option");
    expect(el.shadowRoot?.querySelector('[part="hint"]')?.textContent?.trim()).toBe(
      "Pick one option",
    );
  });

  it("clearable shows clear-button part", async () => {
    const el = await fixture<VuCombobox>(
      html`<vu-combobox clearable .value=${"A"} .options=${["A", "B"]}></vu-combobox>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="clear-button"]')).toBeTruthy();
  });

  it("multiple with value array", async () => {
    const el = await fixture<VuCombobox>(
      html`<vu-combobox
        .multiple=${true}
        .value=${["Red", "Blue"]}
        .options=${["Red", "Green", "Blue"]}
      ></vu-combobox>`,
    );
    await elementUpdated(el);
    expect(el.value).toEqual(["Red", "Blue"]);
  });

  it("shows select-all row in multiple mode", async () => {
    const el = await fixture<VuCombobox>(
      html`<vu-combobox multiple .options=${["Red", "Green"]}></vu-combobox>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="select-all"]')).toBeTruthy();
    const checkboxes = el.shadowRoot?.querySelectorAll("vu-checkbox") ?? [];
    expect(checkboxes.length).toBeGreaterThan(0);
    for (const checkbox of checkboxes) {
      expect(checkbox.getAttribute("tone")).toBe("strong");
    }
  });

  it("emits vu-change when selection clears", async () => {
    const el = await fixture<VuCombobox>(
      html`<vu-combobox clearable .value=${"A"} .options=${["A", "B"]}></vu-combobox>`,
    );
    await elementUpdated(el);
    let detail: unknown;
    el.addEventListener("vu-change", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);
    el.clearSelection();
    await elementUpdated(el);
    expect(detail).toMatchObject({ value: "", selectedItems: [] });
  });

  it("renders field search input in container when searchable", async () => {
    const el = await fixture<VuCombobox>(html`<vu-combobox searchable></vu-combobox>`);
    await elementUpdated(el);
    const input = el.shadowRoot?.querySelector(".container .field-input");
    expect(input).toBeTruthy();
    expect(el.shadowRoot?.querySelector(".dropdown .search-container")).toBeFalsy();
  });

  it("renderer customizes dropdown row content", async () => {
    const el = await fixture<VuCombobox>(
      html`<vu-combobox
        .options=${[{ label: "Alpha", value: "a", tag: "A" }]}
        .renderer=${({ label, option }: { label: string; option: unknown }) =>
          typeof option === "object" && option && "tag" in option
            ? `${label} (${String((option as { tag: string }).tag)})`
            : label}
      ></vu-combobox>`,
    );
    await elementUpdated(el);
    const content = el.shadowRoot?.querySelector('[part="option-content"]');
    expect(content?.textContent?.trim()).toBe("Alpha (A)");
  });

  it("loading shows row in dropdown panel only", async () => {
    const el = await fixture<VuCombobox>(html`<vu-combobox loading .options=${[]}></vu-combobox>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector(".container .loading-indicator")).toBeFalsy();
    expect(el.shadowRoot?.querySelector('[part="dropdown-loading-indicator"]')).toBeTruthy();
    const listbox = el.shadowRoot?.querySelector('[part="dropdown-scroller"]');
    expect(listbox?.getAttribute("aria-busy")).toBe("true");
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<VuCombobox>(
      html`<vu-combobox label="Favorite color" .options=${["Red", "Blue"]}></vu-combobox>`,
    );
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  describe("keyboard", () => {
    it("ArrowDown opens the options panel when closed", async () => {
      const el = await fixture<VuCombobox>(
        html`<vu-combobox .options=${["Red", "Green", "Blue"]}></vu-combobox>`,
      );
      await elementUpdated(el);
      const container = el.shadowRoot?.querySelector('[part="container"]') as HTMLElement;
      container?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      await elementUpdated(el);
      expect(el.open).toBe(true);
    });

    it("ArrowDown moves roving highlight when open", async () => {
      const el = await fixture<VuCombobox>(
        html`<vu-combobox .options=${["Red", "Green", "Blue"]}></vu-combobox>`,
      );
      await elementUpdated(el);
      el.openDropdown();
      await elementUpdated(el);
      const container = el.shadowRoot?.querySelector('[part="container"]') as HTMLElement;
      container?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      await elementUpdated(el);
      expect(el.activeIndex).toBe(1);
    });

    it("Enter commits the highlighted option", async () => {
      const el = await fixture<VuCombobox>(
        html`<vu-combobox .options=${["Red", "Green", "Blue"]}></vu-combobox>`,
      );
      await elementUpdated(el);
      el.openDropdown();
      await elementUpdated(el);
      const container = el.shadowRoot?.querySelector('[part="container"]') as HTMLElement;
      container?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      await elementUpdated(el);
      container?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe("Green");
      expect(el.open).toBe(false);
    });

    it("Home and End jump to first and last options", async () => {
      const el = await fixture<VuCombobox>(
        html`<vu-combobox .options=${["Red", "Green", "Blue"]}></vu-combobox>`,
      );
      await elementUpdated(el);
      el.openDropdown();
      await elementUpdated(el);
      const container = el.shadowRoot?.querySelector('[part="container"]') as HTMLElement;
      container?.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
      await elementUpdated(el);
      expect(el.activeIndex).toBe(2);
      container?.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
      await elementUpdated(el);
      expect(el.activeIndex).toBe(0);
    });

    it("Escape closes searchable dropdown from the search field", async () => {
      const el = await fixture<VuCombobox>(
        html`<vu-combobox searchable .options=${["Red", "Green"]}></vu-combobox>`,
      );
      await elementUpdated(el);
      el.openDropdown();
      await elementUpdated(el);
      const input = el.shadowRoot?.querySelector('[part="input"]') as HTMLInputElement;
      input?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await elementUpdated(el);
      expect(el.open).toBe(false);
    });

    it("virtualizes a large options list", async () => {
      const options = Array.from({ length: 500 }, (_, i) => `Option ${i + 1}`);
      const el = await fixture<VuCombobox>(html`<vu-combobox .options=${options}></vu-combobox>`);
      await elementUpdated(el);
      el.openDropdown();
      await elementUpdated(el);
      expect(el.shadowRoot?.querySelector("[data-virtualize-content]")).toBeTruthy();
      const shown = el.shadowRoot?.querySelectorAll('[part="option"]').length ?? 0;
      expect(shown).toBeGreaterThan(0);
      expect(shown).toBeLessThan(500);
    });
  });
});
