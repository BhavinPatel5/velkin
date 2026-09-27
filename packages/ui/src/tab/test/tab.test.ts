/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7 N/A 8✓ 9✓ 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuTab } from "../tab.js";
import { VuTabItem } from "../../tab-item/tab-item.js";
import "../../icon/icon.js";
import "../../tab-item/tab-item.js";

const sampleStates = [
  { value: "list", label: "List" },
  { value: "grid", label: "Grid" },
  { value: "board", label: "Board", disabled: true },
];

describe("vu-tab", () => {
  it("is defined", () => {
    expect(customElements.get("vu-tab")).toBe(VuTab);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuTab>(html`<vu-tab>Tab</vu-tab>`);
    await elementUpdated(el);
    expect(el).toBeTruthy();
    expect(el.states).toEqual([]);
    expect(el.value).toBeUndefined();
    expect(el.defaultValue).toBe("");
    expect(el.selectedValue).toBe("");
    expect(el.size).toBe("sm");
    expect(el.radius).toBe("full");
    expect(el.orientation).toBe("horizontal");
    expect(el.stretch).toBe(false);
    expect(el.gap).toBe("");
    expect(el.label).toBe("");
    expect(el.disabled).toBe(false);
    expect(el.showCurrentLabelOnly).toBe(false);
    expect(el.iconOnly).toBe(false);
    expect(el.color).toBe("primary");
  });

  it("exposes part=base on prop-mode segments", async () => {
    const el = await fixture<VuTab>(
      html`<vu-tab label="Mode" .states=${[{ value: "a", label: "A" }]} .value=${"a"}></vu-tab>`,
    );
    await elementUpdated(el);
    const btn = el.shadowRoot?.querySelector(".btn");
    expect(btn?.getAttribute("part")).toContain("base");
  });

  it("accepts stretch and gap", async () => {
    const el = await fixture<VuTab>(
      html`<vu-tab
        label="Mode"
        stretch
        gap="var(--vu-space-1)"
        .states=${["a", "b"]}
        .value=${"a"}
      ></vu-tab>`,
    );
    await elementUpdated(el);
    expect(el.stretch).toBe(true);
    expect(el.gap).toBe("var(--vu-space-1)");
    expect(el.style.getPropertyValue("--tab-gap")).toBe("var(--vu-space-1)");
  });

  it("stretch segments fill equal width", async () => {
    const el = await fixture<VuTab>(
      html`<div style="width: 360px">
        <vu-tab
          label="Mode"
          stretch
          .states=${[
            { value: "a", label: "A" },
            { value: "b", label: "BB" },
            { value: "c", label: "CCC" },
          ]}
          .value=${"a"}
        ></vu-tab>
      </div>`,
    );
    await elementUpdated(el);
    const tab = el.querySelector("vu-tab") as VuTab;
    await elementUpdated(tab);
    const buttons = [
      ...(tab.shadowRoot?.querySelectorAll<HTMLButtonElement>(".btn") ?? []),
    ];
    expect(buttons).toHaveLength(3);
    for (const btn of buttons) {
      expect(getComputedStyle(btn).width).not.toBe("0px");
      expect(btn.style.width).toBe("100%");
    }
    const widths = buttons.map((btn) => btn.getBoundingClientRect().width);
    expect(Math.abs(widths[0]! - widths[1]!)).toBeLessThan(2);
    expect(Math.abs(widths[1]! - widths[2]!)).toBeLessThan(2);
  });

  it("defines wrap track chrome tokens in styles", () => {
    const cssText = String(VuTab.styles);
    expect(cssText).toContain("font-family: var(--vu-font-sans)");
    expect(cssText).toContain("--tab-bg:");
    expect(cssText).toContain("--tab-pad:");
    expect(cssText).toContain("--tab-shadow:");
    expect(cssText).toContain("background: var(--tab-bg)");
    expect(cssText).toContain("box-shadow: var(--tab-shadow)");
    expect(cssText).toContain("border-radius: var(--tab-track-radius)");
    expect(cssText).toContain("--tab-segment-radius:");
  });

  it("accepts states, controlled value, size, pill, disabled", async () => {
    const el = await fixture<VuTab>(
      html`<vu-tab
        label="Mode"
        .states=${["a", "b"]}
        .value=${"a"}
        size="md"
        radius="md"
        disabled
      ></vu-tab>`,
    );
    await elementUpdated(el);
    expect(el.states).toHaveLength(2);
    expect(el.value).toBe("a");
    expect(el.size).toBe("md");
    expect(el.radius).toBe("md");
    expect(el.disabled).toBe(true);
  });

  it("accepts showCurrentLabelOnly and color", async () => {
    const el = await fixture<VuTab>(
      html`<vu-tab .showCurrentLabelOnly=${true} color="success"></vu-tab>`,
    );
    await elementUpdated(el);
    expect(el.showCurrentLabelOnly).toBe(true);
    expect(el.color).toBe("success");
  });

  it("uses defaultValue when uncontrolled", async () => {
    const el = await fixture<VuTab>(
      html`<vu-tab label="View" defaultValue="grid" .states=${sampleStates}></vu-tab>`,
    );
    await elementUpdated(el);
    expect(el.value).toBeUndefined();
    expect(el.selectedValue).toBe("grid");
  });

  it("reset() restores defaultValue when uncontrolled", async () => {
    const el = await fixture<VuTab>(
      html`<vu-tab label="View" defaultValue="list" .states=${sampleStates}></vu-tab>`,
    );
    await elementUpdated(el);
    el.index = 1;
    await elementUpdated(el);
    expect(el.selectedValue).toBe("grid");
    el.reset();
    await elementUpdated(el);
    expect(el.selectedValue).toBe("list");
  });

  it("sets aria-label on the radiogroup from label", async () => {
    const el = await fixture<VuTab>(
      html`<vu-tab label="View mode" .states=${sampleStates} .value=${"list"}></vu-tab>`,
    );
    await elementUpdated(el);
    const wrap = el.shadowRoot?.querySelector('[part="wrap"]');
    expect(wrap?.getAttribute("aria-label")).toBe("View mode");
  });

  it("focusSegment focuses the selected segment", async () => {
    const el = await fixture<VuTab>(
      html`<vu-tab label="Mode" .states=${["a", "b"]} .value=${"a"}></vu-tab>`,
    );
    await elementUpdated(el);
    el.focusSegment();
    const selected = el.shadowRoot?.querySelector<HTMLButtonElement>('.btn[aria-checked="true"]');
    expect(el.shadowRoot?.activeElement).toBe(selected);
  });

  it("fires vu-change on user click with detail", async () => {
    const el = await fixture<VuTab>(
      html`<vu-tab label="Mode" .states=${["a", "b"]} .value=${"a"}></vu-tab>`,
    );
    await elementUpdated(el);
    let detail: { value: string; previous: string; source: HTMLElement | null } | null = null;
    el.addEventListener("vu-change", (e) => {
      detail = (e as CustomEvent).detail;
    });
    el.shadowRoot?.querySelectorAll<HTMLButtonElement>(".btn")[1]?.click();
    await elementUpdated(el);
    expect(detail).toMatchObject({ value: "b", previous: "a" });
    expect(detail?.source).toBeTruthy();
  });

  it("does not fire vu-change on programmatic value assignment", async () => {
    const el = await fixture<VuTab>(
      html`<vu-tab label="Mode" .states=${["a", "b"]} .value=${"a"}></vu-tab>`,
    );
    await elementUpdated(el);
    let fired = false;
    el.addEventListener("vu-change", () => {
      fired = true;
    });
    el.value = "b";
    await elementUpdated(el);
    expect(fired).toBe(false);
    expect(el.value).toBe("b");
  });

  describe("keyboard", () => {
    it("ArrowRight moves selection across segments", async () => {
      const el = await fixture<VuTab>(
        html`<vu-tab label="Mode" .states=${["a", "b", "c"]} .value=${"a"}></vu-tab>`,
      );
      await elementUpdated(el);
      const wrap = el.shadowRoot?.querySelector('[part="wrap"]') as HTMLElement;
      const buttons = el.shadowRoot?.querySelectorAll<HTMLButtonElement>(".btn");
      buttons?.[0]?.focus();
      wrap?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      await elementUpdated(el);
      await el.updateComplete;
      expect(el.value).toBe("b");
      expect(buttons?.[1]?.getAttribute("aria-checked")).toBe("true");
    });

    it("ArrowLeft in RTL moves selection forward", async () => {
      const wrap = await fixture(html`
        <div dir="rtl" lang="en">
          <vu-tab label="Mode" .states=${["a", "b", "c"]} .value=${"a"}></vu-tab>
        </div>
      `);
      await elementUpdated(wrap);
      const el = wrap.querySelector("vu-tab") as VuTab;
      const radiogroup = el.shadowRoot?.querySelector('[part="wrap"]') as HTMLElement;
      radiogroup?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe("b");
    });

    it("skips disabled segments when moving with arrows", async () => {
      const el = await fixture<VuTab>(
        html`<vu-tab label="Mode" .states=${sampleStates} .value=${"list"}></vu-tab>`,
      );
      await elementUpdated(el);
      const wrap = el.shadowRoot?.querySelector('[part="wrap"]') as HTMLElement;
      wrap?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe("grid");
      wrap?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe("list");
    });

    it("Home and End jump to first and last enabled segments", async () => {
      const el = await fixture<VuTab>(
        html`<vu-tab label="Mode" .states=${["a", "b", "c"]} .value=${"b"}></vu-tab>`,
      );
      await elementUpdated(el);
      const wrap = el.shadowRoot?.querySelector('[part="wrap"]') as HTMLElement;
      wrap?.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe("c");
      wrap?.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe("a");
    });

    it("ArrowDown moves selection when orientation is vertical", async () => {
      const el = await fixture<VuTab>(
        html`<vu-tab
          label="Mode"
          orientation="vertical"
          .states=${["a", "b", "c"]}
          .value=${"a"}
        ></vu-tab>`,
      );
      await elementUpdated(el);
      const wrap = el.shadowRoot?.querySelector('[part="wrap"]') as HTMLElement;
      expect(wrap?.getAttribute("aria-orientation")).toBe("vertical");
      wrap?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe("b");
    });
  });

  describe("slot composition", () => {
    it("uses slotted vu-tab-item children instead of states", async () => {
      const el = await fixture<VuTab>(html`
        <vu-tab label="View" .value=${"grid"}>
          <vu-tab-item value="list" label="List" icon="lucide:list"></vu-tab-item>
          <vu-tab-item value="grid" label="Grid" icon="lucide:layout-grid"></vu-tab-item>
        </vu-tab>
      `);
      await elementUpdated(el);
      expect(el.usesSlotItems).toBe(true);
      expect(el.items).toHaveLength(2);
      expect(el.items[0]?.value).toBe("list");
      expect(el.shadowRoot?.querySelector("slot")).toBeTruthy();
      expect(el.shadowRoot?.querySelector("slot")?.hasAttribute("hidden")).toBe(false);
      expect(el.shadowRoot?.querySelector(".btn")).toBeNull();
    });

    it("keeps a stable slot in the shadow tree for states-driven tabs", async () => {
      const el = await fixture<VuTab>(
        html`<vu-tab label="Mode" .states=${["a", "b"]} .value=${"a"}></vu-tab>`,
      );
      await elementUpdated(el);
      expect(el.usesSlotItems).toBe(false);
      expect(el.shadowRoot?.querySelectorAll(".btn").length).toBe(2);
      expect(el.shadowRoot?.querySelector("slot")).toBeTruthy();
    });

    it("uses slot mode when states is empty so SSR and client share a template", async () => {
      const el = await fixture<VuTab>(html`<vu-tab label="View"></vu-tab>`);
      await elementUpdated(el);
      expect(el.usesSlotItems).toBe(true);
      expect(el.shadowRoot?.querySelector("slot")?.hasAttribute("hidden")).toBe(false);
      expect(el.shadowRoot?.querySelector(".btn")).toBeNull();
    });

    it("fires vu-change when a slotted segment is clicked", async () => {
      const el = await fixture<VuTab>(html`
        <vu-tab label="View" .value=${"list"}>
          <vu-tab-item value="list" label="List"></vu-tab-item>
          <vu-tab-item value="grid" label="Grid"></vu-tab-item>
        </vu-tab>
      `);
      await elementUpdated(el);
      let detail: { value: string } | null = null;
      el.addEventListener("vu-change", (e) => {
        detail = (e as CustomEvent).detail;
      });
      const grid = el.querySelector("vu-tab-item[value=grid]") as VuTabItem;
      grid.shadowRoot?.querySelector<HTMLButtonElement>(".btn")?.click();
      await elementUpdated(el);
      expect(detail).toMatchObject({ value: "grid" });
      expect(el.value).toBe("grid");
    });
  });

  describe("accessibility", () => {
    it("default with segments", async () => {
      const el = await fixture<VuTab>(
        html`<vu-tab label="View mode" .states=${sampleStates} .value=${"list"}></vu-tab>`,
      );
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("disabled host", async () => {
      const el = await fixture<VuTab>(
        html`<vu-tab label="View mode" .states=${sampleStates} .value=${"list"} disabled></vu-tab>`,
      );
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("iconOnly", async () => {
      const el = await fixture<VuTab>(
        html`<vu-tab
          label="Theme"
          iconOnly
          .states=${[
            { value: "light", label: "Light", icon: "ion:sunny-outline" },
            { value: "dark", label: "Dark", icon: "ion:moon-outline" },
          ]}
          .value=${"light"}
        ></vu-tab>`,
      );
      await elementUpdated(el);
      expect(el.iconOnly).toBe(true);
      expect(el.hasAttribute("icononly")).toBe(true);
      await expectA11y(el).to.be.accessible();
    });

    it("showCurrentLabelOnly", async () => {
      const el = await fixture<VuTab>(
        html`<vu-tab
          label="Density"
          .showCurrentLabelOnly=${true}
          .states=${sampleStates}
          .value=${"grid"}
        ></vu-tab>`,
      );
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("default in RTL document context", async () => {
      const wrap = await fixture(html`
        <div dir="rtl" lang="en">
          <vu-tab label="View mode" .states=${sampleStates} .value=${"list"}></vu-tab>
        </div>
      `);
      await elementUpdated(wrap);
      const el = wrap.querySelector("vu-tab") as VuTab;
      await expectA11y(el).to.be.accessible();
    });

    it("vertical orientation", async () => {
      const el = await fixture<VuTab>(
        html`<vu-tab
          label="View mode"
          orientation="vertical"
          .states=${sampleStates}
          .value=${"list"}
        ></vu-tab>`,
      );
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("slotted vu-tab-item children", async () => {
      const el = await fixture<VuTab>(html`
        <vu-tab label="View" .value=${"list"}>
          <vu-tab-item value="list" label="List"></vu-tab-item>
          <vu-tab-item value="grid" label="Grid"></vu-tab-item>
        </vu-tab>
      `);
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });
  });
});
