/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuButtonGroup } from "../button-group.js";
import "../../button/button.js";
import "../../dropdown/dropdown.js";
import "../../dropdown-item/dropdown-item.js";

describe("vu-button-group", () => {
  it("is defined", () => {
    expect(customElements.get("vu-button-group")).toBe(VuButtonGroup);
  });

  it("renders defaults — solid/default/md, role=group, horizontal axis", async () => {
    const el = await fixture<VuButtonGroup>(html`
      <vu-button-group label="Format">
        <vu-button>Bold</vu-button>
        <vu-button>Italic</vu-button>
        <vu-button>Underline</vu-button>
      </vu-button-group>
    `);
    await elementUpdated(el);

    expect(el.variant).toBe("solid");
    expect(el.color).toBe("default");
    expect(el.size).toBe("md");
    expect(el.radius).toBe("md");
    expect(el.orientation).toBe("horizontal");
    expect(el.disabled).toBe(false);

    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
    expect(base.getAttribute("role")).toBe("group");
    expect(base.getAttribute("aria-label")).toBe("Format");
    expect(base.hasAttribute("aria-orientation")).toBe(false);
  });

  it("exposes aria-disabled on the base container when disabled", async () => {
    const el = await fixture<VuButtonGroup>(html`
      <vu-button-group disabled label="Format">
        <vu-button>One</vu-button>
        <vu-button>Two</vu-button>
      </vu-button-group>
    `);
    await elementUpdated(el);
    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
    expect(base.getAttribute("aria-disabled")).toBe("true");
  });

  it("marks each child with attached + axis based on its position in the cluster", async () => {
    const el = await fixture<VuButtonGroup>(html`
      <vu-button-group>
        <vu-button>One</vu-button>
        <vu-button>Two</vu-button>
        <vu-button>Three</vu-button>
      </vu-button-group>
    `);
    await elementUpdated(el);

    const buttons = el.querySelectorAll("vu-button");
    expect(buttons[0].getAttribute("attached")).toBe("first");
    expect(buttons[1].getAttribute("attached")).toBe("middle");
    expect(buttons[2].getAttribute("attached")).toBe("last");

    for (const b of buttons) {
      expect(b.getAttribute("axis")).toBe("horizontal");
    }
  });

  it("uses attached='only' when there's a single child", async () => {
    const el = await fixture<VuButtonGroup>(html`
      <vu-button-group>
        <vu-button>Solo</vu-button>
      </vu-button-group>
    `);
    await elementUpdated(el);
    const btn = el.querySelector("vu-button")!;
    expect(btn.getAttribute("attached")).toBe("only");
  });

  it("forwards variant / color / size / full radius to children that haven't set their own", async () => {
    const el = await fixture<VuButtonGroup>(html`
      <vu-button-group variant="outline" color="primary" size="lg" radius="full">
        <vu-button>One</vu-button>
        <vu-button>Two</vu-button>
      </vu-button-group>
    `);
    await elementUpdated(el);

    const buttons = el.querySelectorAll("vu-button");
    for (const b of buttons) {
      expect(b.getAttribute("variant")).toBe("outline");
      expect(b.getAttribute("color")).toBe("primary");
      expect(b.getAttribute("size")).toBe("lg");
      expect(b.getAttribute("radius") === "full").toBe(true);
    }
  });

  it("respects per-child explicit attributes (does NOT overwrite consumer-set values)", async () => {
    const el = await fixture<VuButtonGroup>(html`
      <vu-button-group variant="solid" color="primary" size="md">
        <vu-button>One</vu-button>
        <vu-button color="danger" size="lg">Special</vu-button>
        <vu-button>Three</vu-button>
      </vu-button-group>
    `);
    await elementUpdated(el);

    const middle = el.querySelectorAll("vu-button")[1];
    expect(middle.getAttribute("color")).toBe("danger");
    expect(middle.getAttribute("size")).toBe("lg");
    /* variant wasn't set on the child → group fills it in */
    expect(middle.getAttribute("variant")).toBe("solid");
  });

  it("re-syncs when group props change", async () => {
    const el = await fixture<VuButtonGroup>(html`
      <vu-button-group color="primary">
        <vu-button>One</vu-button>
        <vu-button>Two</vu-button>
      </vu-button-group>
    `);
    await elementUpdated(el);
    const buttons = el.querySelectorAll("vu-button");
    expect(buttons[0].getAttribute("color")).toBe("primary");

    el.color = "danger";
    await elementUpdated(el);
    expect(buttons[0].getAttribute("color")).toBe("danger");
    expect(buttons[1].getAttribute("color")).toBe("danger");
  });

  it("re-syncs when children are added or removed (slotchange)", async () => {
    const el = await fixture<VuButtonGroup>(html`
      <vu-button-group>
        <vu-button>One</vu-button>
        <vu-button>Two</vu-button>
      </vu-button-group>
    `);
    await elementUpdated(el);
    expect(el.querySelectorAll("vu-button")[1].getAttribute("attached")).toBe("last");

    const third = document.createElement("vu-button");
    third.textContent = "Three";
    el.appendChild(third);
    await elementUpdated(el);
    /* slotchange + a microtask later — wait one more frame */
    await new Promise((r) => setTimeout(r, 0));

    const after = el.querySelectorAll("vu-button");
    expect(after[1].getAttribute("attached")).toBe("middle");
    expect(after[2].getAttribute("attached")).toBe("last");
  });

  it("propagates disabled to all children, then releases only what it claimed", async () => {
    const el = await fixture<VuButtonGroup>(html`
      <vu-button-group>
        <vu-button>Enabled</vu-button>
        <vu-button disabled>Always off</vu-button>
      </vu-button-group>
    `);
    await elementUpdated(el);

    const [first, second] = el.querySelectorAll("vu-button");
    expect(first.hasAttribute("disabled")).toBe(false);
    expect(second.hasAttribute("disabled")).toBe(true);

    el.disabled = true;
    await elementUpdated(el);
    expect(first.hasAttribute("disabled")).toBe(true);
    expect(second.hasAttribute("disabled")).toBe(true);

    el.disabled = false;
    await elementUpdated(el);
    /* group disabled the first one; that propagation is released */
    expect(first.hasAttribute("disabled")).toBe(false);
    /* consumer disabled the second one; the group never owned it, so it stays */
    expect(second.hasAttribute("disabled")).toBe(true);
  });

  it("vertical orientation flips axis on children without aria-orientation on role=group", async () => {
    const el = await fixture<VuButtonGroup>(html`
      <vu-button-group orientation="vertical">
        <vu-button>Top</vu-button>
        <vu-button>Bottom</vu-button>
      </vu-button-group>
    `);
    await elementUpdated(el);

    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
    expect(base.hasAttribute("aria-orientation")).toBe(false);

    const buttons = el.querySelectorAll("vu-button");
    expect(buttons[0].getAttribute("axis")).toBe("vertical");
    expect(buttons[1].getAttribute("axis")).toBe("vertical");
  });

  it("ignores non-supported children (e.g. raw <span>) — no attribute writes", async () => {
    const el = await fixture<VuButtonGroup>(html`
      <vu-button-group>
        <span>Not a button</span>
        <vu-button>One</vu-button>
        <span>Also not</span>
      </vu-button-group>
    `);
    await elementUpdated(el);
    const span = el.querySelector("span")!;
    expect(span.hasAttribute("attached")).toBe(false);
    /* Single recognized vu-button counts as 'only' */
    const btn = el.querySelector("vu-button")!;
    expect(btn.getAttribute("attached")).toBe("only");
  });

  it("treats <vu-dropdown> as a cluster member and forwards paint to its inner trigger button", async () => {
    const el = await fixture<VuButtonGroup>(html`
      <vu-button-group color="primary" variant="outline">
        <vu-button>Save</vu-button>
        <vu-dropdown>
          <vu-button slot="trigger" label="Save options">▾</vu-button>
        </vu-dropdown>
      </vu-button-group>
    `);
    await elementUpdated(el);

    const dropdown = el.querySelector("vu-dropdown")!;
    const trigger = dropdown.querySelector('vu-button[slot="trigger"]')!;

    /* Outer member carries attached/axis for the seam-collapse CSS. */
    expect(dropdown.getAttribute("attached")).toBe("last");
    expect(dropdown.getAttribute("axis")).toBe("horizontal");

    /* Inner trigger button carries attached/axis for corner flattening, plus the forwarded paint props. */
    expect(trigger.getAttribute("attached")).toBe("last");
    expect(trigger.getAttribute("axis")).toBe("horizontal");
    expect(trigger.getAttribute("variant")).toBe("outline");
    expect(trigger.getAttribute("color")).toBe("primary");

    /* The first member is the standalone Save button. */
    const firstBtn = el.querySelector("vu-button")!;
    expect(firstBtn.getAttribute("attached")).toBe("first");
  });

  it("propagates disabled to dropdown's inner trigger button", async () => {
    const el = await fixture<VuButtonGroup>(html`
      <vu-button-group disabled>
        <vu-button>Save</vu-button>
        <vu-dropdown>
          <vu-button slot="trigger" label="Save options">▾</vu-button>
        </vu-dropdown>
      </vu-button-group>
    `);
    await elementUpdated(el);

    const trigger = el.querySelector('vu-dropdown vu-button[slot="trigger"]')!;
    expect(trigger.hasAttribute("disabled")).toBe(true);
  });

  describe("selectionMode='single' (segmented control / radiogroup)", () => {
    it("renders role=radiogroup, marks every vu-button as a radio, and presses only the matching value", async () => {
      const el = await fixture<VuButtonGroup>(html`
        <vu-button-group selectionmode="single" value="list">
          <vu-button value="grid">Grid</vu-button>
          <vu-button value="list">List</vu-button>
          <vu-button value="map">Map</vu-button>
        </vu-button-group>
      `);
      await elementUpdated(el);

      const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
      expect(base.getAttribute("role")).toBe("radiogroup");

      const [grid, list, map] = el.querySelectorAll("vu-button");
      expect(grid.hasAttribute("radio")).toBe(true);
      expect(list.hasAttribute("radio")).toBe(true);
      expect(map.hasAttribute("radio")).toBe(true);

      expect(grid.hasAttribute("pressed")).toBe(false);
      expect(list.hasAttribute("pressed")).toBe(true);
      expect(map.hasAttribute("pressed")).toBe(false);
    });

    it("inner button gets role=radio + aria-checked + roving tabindex", async () => {
      const el = await fixture<VuButtonGroup>(html`
        <vu-button-group selectionmode="single" value="b">
          <vu-button value="a">A</vu-button>
          <vu-button value="b">B</vu-button>
        </vu-button-group>
      `);
      await elementUpdated(el);
      const [a, b] = el.querySelectorAll("vu-button");
      await elementUpdated(a);
      await elementUpdated(b);
      const aInner = a.shadowRoot?.querySelector('[part="base"]') as HTMLButtonElement;
      const bInner = b.shadowRoot?.querySelector('[part="base"]') as HTMLButtonElement;

      expect(aInner.getAttribute("role")).toBe("radio");
      expect(bInner.getAttribute("role")).toBe("radio");
      expect(aInner.getAttribute("aria-checked")).toBe("false");
      expect(bInner.getAttribute("aria-checked")).toBe("true");
      expect(aInner.getAttribute("tabindex")).toBe("-1");
      expect(bInner.getAttribute("tabindex")).toBe("0");
    });

    it("clicking an unselected radio updates value and fires vu-change", async () => {
      const el = await fixture<VuButtonGroup>(html`
        <vu-button-group selectionmode="single" value="a">
          <vu-button value="a">A</vu-button>
          <vu-button value="b">B</vu-button>
          <vu-button value="c">C</vu-button>
        </vu-button-group>
      `);
      await elementUpdated(el);

      let detail: { value: string; values: string[]; source: HTMLElement | null } | null = null;
      el.addEventListener("vu-change", (e) => {
        detail = (e as CustomEvent).detail;
      });

      const c = el.querySelectorAll("vu-button")[2];
      c.click();
      await elementUpdated(el);

      expect(el.value).toBe("c");
      expect(detail).not.toBeNull();
      expect(detail!.value).toBe("c");
      expect(detail!.values).toEqual(["c"]);
      expect(detail!.source).toBe(c);

      const [a, _b, cAfter] = el.querySelectorAll("vu-button");
      expect(a.hasAttribute("pressed")).toBe(false);
      expect(cAfter.hasAttribute("pressed")).toBe(true);
    });

    it("clicking the already-selected radio is a no-op (no event, no value churn)", async () => {
      const el = await fixture<VuButtonGroup>(html`
        <vu-button-group selectionmode="single" value="a">
          <vu-button value="a">A</vu-button>
          <vu-button value="b">B</vu-button>
        </vu-button-group>
      `);
      await elementUpdated(el);

      let fired = 0;
      el.addEventListener("vu-change", () => fired++);

      el.querySelector("vu-button")!.click();
      await elementUpdated(el);

      expect(el.value).toBe("a");
      expect(fired).toBe(0);
    });

    it("ArrowRight moves selection to the next radio along the cluster axis", async () => {
      const el = await fixture<VuButtonGroup>(html`
        <vu-button-group selectionmode="single" value="a">
          <vu-button value="a">A</vu-button>
          <vu-button value="b">B</vu-button>
          <vu-button value="c">C</vu-button>
        </vu-button-group>
      `);
      await elementUpdated(el);

      const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
      base.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe("b");

      base.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe("c");

      /* Wraps to first */
      base.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe("a");
    });

    it("ArrowDown / ArrowUp navigate when orientation='vertical'", async () => {
      const el = await fixture<VuButtonGroup>(html`
        <vu-button-group selectionmode="single" orientation="vertical" value="a">
          <vu-button value="a">A</vu-button>
          <vu-button value="b">B</vu-button>
        </vu-button-group>
      `);
      await elementUpdated(el);

      const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
      base.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe("b");

      base.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe("a");
    });

    it("Home / End jump to first / last selectable radio", async () => {
      const el = await fixture<VuButtonGroup>(html`
        <vu-button-group selectionmode="single" value="b">
          <vu-button value="a">A</vu-button>
          <vu-button value="b">B</vu-button>
          <vu-button value="c">C</vu-button>
        </vu-button-group>
      `);
      await elementUpdated(el);
      const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
      base.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe("c");
      base.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe("a");
    });

    it("disabled children are skipped from selection (click + arrow)", async () => {
      const el = await fixture<VuButtonGroup>(html`
        <vu-button-group selectionmode="single" value="a">
          <vu-button value="a">A</vu-button>
          <vu-button value="b" disabled>B</vu-button>
          <vu-button value="c">C</vu-button>
        </vu-button-group>
      `);
      await elementUpdated(el);

      const [, b] = el.querySelectorAll("vu-button");
      b.click();
      await elementUpdated(el);
      expect(el.value).toBe("a");

      const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
      base.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      await elementUpdated(el);
      expect(el.value).toBe("c");
    });

    it("a disabled radio whose value matches still renders as pressed (so users can see what's selected)", async () => {
      const el = await fixture<VuButtonGroup>(html`
        <vu-button-group selectionmode="single" value="b">
          <vu-button value="a">A</vu-button>
          <vu-button value="b" disabled>B</vu-button>
          <vu-button value="c">C</vu-button>
        </vu-button-group>
      `);
      await elementUpdated(el);
      const b = el.querySelectorAll("vu-button")[1];
      expect(b.hasAttribute("pressed")).toBe(true);
      expect(b.hasAttribute("disabled")).toBe(true);
    });

    it("dropdown members are NOT marked as radios and are ignored by selection", async () => {
      const el = await fixture<VuButtonGroup>(html`
        <vu-button-group selectionmode="single" value="a">
          <vu-button value="a">A</vu-button>
          <vu-dropdown>
            <vu-button slot="trigger" label="More" value="ignored">▾</vu-button>
          </vu-dropdown>
        </vu-button-group>
      `);
      await elementUpdated(el);

      const trigger = el.querySelector('vu-dropdown vu-button[slot="trigger"]')!;
      expect(trigger.hasAttribute("radio")).toBe(false);
      expect(trigger.hasAttribute("pressed")).toBe(false);
    });

    it("flipping selectionMode back to 'none' releases radio + pressed it claimed", async () => {
      const el = await fixture<VuButtonGroup>(html`
        <vu-button-group selectionmode="single" value="a">
          <vu-button value="a">A</vu-button>
          <vu-button value="b">B</vu-button>
        </vu-button-group>
      `);
      await elementUpdated(el);
      el.selectionMode = "none";
      await elementUpdated(el);
      const [a, b] = el.querySelectorAll("vu-button");
      expect(a.hasAttribute("radio")).toBe(false);
      expect(a.hasAttribute("pressed")).toBe(false);
      expect(b.hasAttribute("radio")).toBe(false);
    });
  });

  describe("selectionMode='multiple' (toggle group)", () => {
    it("renders role=group and presses every child whose value is in `values`", async () => {
      const el = await fixture<VuButtonGroup>(html`
        <vu-button-group selectionmode="multiple" .values=${["bold", "italic"]}>
          <vu-button value="bold">B</vu-button>
          <vu-button value="italic">I</vu-button>
          <vu-button value="underline">U</vu-button>
        </vu-button-group>
      `);
      await elementUpdated(el);

      const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
      expect(base.getAttribute("role")).toBe("group");

      const [bold, italic, underline] = el.querySelectorAll("vu-button");
      expect(bold.hasAttribute("pressed")).toBe(true);
      expect(italic.hasAttribute("pressed")).toBe(true);
      expect(underline.hasAttribute("pressed")).toBe(false);
      /* Toggles, not radios */
      expect(bold.hasAttribute("radio")).toBe(false);
    });

    it("inner button exposes aria-pressed (not aria-checked)", async () => {
      const el = await fixture<VuButtonGroup>(html`
        <vu-button-group selectionmode="multiple" .values=${["bold"]}>
          <vu-button value="bold">B</vu-button>
          <vu-button value="italic">I</vu-button>
        </vu-button-group>
      `);
      await elementUpdated(el);
      const [bold, italic] = el.querySelectorAll("vu-button");
      await elementUpdated(bold);
      await elementUpdated(italic);
      const boldInner = bold.shadowRoot?.querySelector('[part="base"]') as HTMLButtonElement;
      const italicInner = italic.shadowRoot?.querySelector('[part="base"]') as HTMLButtonElement;
      expect(boldInner.getAttribute("aria-pressed")).toBe("true");
      expect(italicInner.hasAttribute("aria-pressed")).toBe(false);
      expect(boldInner.hasAttribute("aria-checked")).toBe(false);
      expect(boldInner.getAttribute("role")).toBe(null);
    });

    it("clicking toggles the value in `values` and fires vu-change", async () => {
      const el = await fixture<VuButtonGroup>(html`
        <vu-button-group selectionmode="multiple" .values=${["bold"]}>
          <vu-button value="bold">B</vu-button>
          <vu-button value="italic">I</vu-button>
        </vu-button-group>
      `);
      await elementUpdated(el);

      const events: { values: string[] }[] = [];
      el.addEventListener("vu-change", (e) =>
        events.push({ values: [...(e as CustomEvent).detail.values] }),
      );

      const [bold, italic] = el.querySelectorAll("vu-button");

      italic.click();
      await elementUpdated(el);
      expect(new Set(el.values)).toEqual(new Set(["bold", "italic"]));

      bold.click();
      await elementUpdated(el);
      expect(el.values).toEqual(["italic"]);

      expect(events.length).toBe(2);
      expect(new Set(events[0].values)).toEqual(new Set(["bold", "italic"]));
      expect(events[1].values).toEqual(["italic"]);
    });

    it("ArrowKeys do nothing in multiple mode (each toggle is independently focusable)", async () => {
      const el = await fixture<VuButtonGroup>(html`
        <vu-button-group selectionmode="multiple" .values=${["a"]}>
          <vu-button value="a">A</vu-button>
          <vu-button value="b">B</vu-button>
        </vu-button-group>
      `);
      await elementUpdated(el);
      const before = [...el.values];
      const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
      base.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      await elementUpdated(el);
      expect(el.values).toEqual(before);
    });
  });

  describe("selectionMode='none' (default)", () => {
    it("does not write radio/pressed and does not fire vu-change on click", async () => {
      const el = await fixture<VuButtonGroup>(html`
        <vu-button-group>
          <vu-button value="a">A</vu-button>
          <vu-button value="b">B</vu-button>
        </vu-button-group>
      `);
      await elementUpdated(el);

      let fired = 0;
      el.addEventListener("vu-change", () => fired++);
      el.querySelectorAll("vu-button")[1].click();
      await elementUpdated(el);

      const [a, b] = el.querySelectorAll("vu-button");
      expect(a.hasAttribute("radio")).toBe(false);
      expect(a.hasAttribute("pressed")).toBe(false);
      expect(b.hasAttribute("pressed")).toBe(false);
      expect(fired).toBe(0);
    });

    it("a stand-alone `pressed` button retains its state after the group syncs", async () => {
      const el = await fixture<VuButtonGroup>(html`
        <vu-button-group>
          <vu-button pressed value="a">A</vu-button>
          <vu-button value="b">B</vu-button>
        </vu-button-group>
      `);
      await elementUpdated(el);
      /* Group is in 'none' mode → it must not steal `pressed` from a consumer-controlled toggle. */
      const a = el.querySelectorAll("vu-button")[0];
      expect(a.hasAttribute("pressed")).toBe(true);
    });
  });
});

describe("accessibility", () => {
  it("horizontal button group passes axe", async () => {
    const el = await fixture(html`
      <vu-button-group label="Actions">
        <vu-button>One</vu-button>
        <vu-button>Two</vu-button>
      </vu-button-group>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("disabled button group passes axe", async () => {
    const el = await fixture(html`
      <vu-button-group disabled label="Actions">
        <vu-button>One</vu-button>
        <vu-button>Two</vu-button>
      </vu-button-group>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("single-selection radiogroup passes axe", async () => {
    const el = await fixture(html`
      <vu-button-group label="View" selectionmode="single" value="list">
        <vu-button value="grid">Grid</vu-button>
        <vu-button value="list">List</vu-button>
      </vu-button-group>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
