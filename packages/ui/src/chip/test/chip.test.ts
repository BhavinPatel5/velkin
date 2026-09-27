/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, waitUntil, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuChip } from "../chip.js";
import "../../icon/icon.js";

describe("vu-chip", () => {
  it("is defined", () => {
    expect(customElements.get("vu-chip")).toBe(VuChip);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuChip>(html`<vu-chip label="Tag"></vu-chip>`);
    await elementUpdated(el);

    expect(el.label).toBe("Tag");
    expect(el.value).toBe("");
    expect(el.removable).toBe(false);
    expect(el.color).toBe("default");
    expect(el.variant).toBe("soft");
    expect(el.loading).toBe(false);
    expect(el.disabled).toBe(false);
    expect(el.selected).toBe(false);
    expect(el.interactive).toBe(false);
    expect(el.iconOnly).toBe(false);

    const chip = el.shadowRoot?.querySelector('[part="chip"]');
    expect(chip).toBeTruthy();
    expect(chip?.textContent?.trim()).toContain("Tag");
  });

  it("renders close when removable is true", async () => {
    const el = await fixture<VuChip>(html`<vu-chip label="Removable" removable></vu-chip>`);
    await elementUpdated(el);

    const closeBtn = el.shadowRoot?.querySelector('[part="close"]');
    expect(closeBtn).toBeTruthy();
    expect(closeBtn?.getAttribute("aria-label")).toBe("Remove chip");
  });

  it("does not render close when removable is false", async () => {
    const el = await fixture<VuChip>(html`<vu-chip label="Tag"></vu-chip>`);
    await elementUpdated(el);

    expect(el.shadowRoot?.querySelector('[part="close"]')).toBeFalsy();
  });

  it("shows loading spinner and aria-busy when loading is true", async () => {
    const el = await fixture<VuChip>(html`<vu-chip label="Loading..." loading></vu-chip>`);
    await elementUpdated(el);

    expect(el.shadowRoot?.querySelector('[part="loading-spinner"]')).toBeTruthy();
    expect(el.hasAttribute("aria-busy")).toBe(true);
    expect(el.shadowRoot?.querySelector(".chip")?.classList.contains("loading")).toBe(true);
  });

  it("marks chip surface loading and keeps spinner visible", async () => {
    const el = await fixture<VuChip>(html`<vu-chip label="Busy" loading></vu-chip>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector(".chip.loading")).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="loading-spinner"]')).toBeTruthy();
  });

  it("dispatches vu-close with detail when close is clicked", async () => {
    const container = await fixture<HTMLElement>(
      html`<div><vu-chip label="Remove me" value="rm-1" removable></vu-chip></div>`,
    );
    await elementUpdated(container);
    const el = container.querySelector<VuChip>("vu-chip")!;

    const closeBtn = el.shadowRoot?.querySelector('[part="close"]') as HTMLElement;
    const eventPromise = new Promise<CustomEvent>((resolve) => {
      el.addEventListener("vu-close", (e: Event) => resolve(e as CustomEvent), { once: true });
    });

    closeBtn.click();
    const ev = await eventPromise;

    expect(ev.detail).toEqual({
      label: "Remove me",
      value: "rm-1",
      reason: "user",
    });
    await waitUntil(
      () => !container.querySelector("vu-chip"),
      "chip should be removed after exit animation",
      { timeout: 1000 },
    );
  });

  it("does not remove host when vu-close is preventDefaulted", async () => {
    const el = await fixture<VuChip>(html`<vu-chip label="Stay" removable></vu-chip>`);
    await elementUpdated(el);
    el.addEventListener("vu-close", (e) => e.preventDefault());

    const closeBtn = el.shadowRoot?.querySelector('[part="close"]') as HTMLElement;
    closeBtn.click();
    await elementUpdated(el);

    expect(el.isConnected).toBe(true);
  });

  it("close() emits reason method", async () => {
    const container = await fixture<HTMLElement>(
      html`<div><vu-chip label="X" value="v" removable></vu-chip></div>`,
    );
    await elementUpdated(container);
    const el = container.querySelector<VuChip>("vu-chip")!;
    let reason = "";
    el.addEventListener("vu-close", (e) => {
      reason = (e as CustomEvent).detail.reason;
    });
    await el.close();
    expect(reason).toBe("method");
    await waitUntil(() => !container.querySelector("vu-chip"));
  });

  it("applies variant class for outline", async () => {
    const el = await fixture<VuChip>(html`<vu-chip label="Outline" variant="outline"></vu-chip>`);
    await elementUpdated(el);

    const chip = el.shadowRoot?.querySelector('[part="chip"]');
    expect(chip?.classList.contains("outline")).toBe(true);
  });

  it("reflects disabled attribute", async () => {
    const el = await fixture<VuChip>(html`<vu-chip label="Disabled" disabled removable></vu-chip>`);
    await elementUpdated(el);

    expect(el.disabled).toBe(true);
    expect(el.getAttribute("disabled")).toBe("");
    const close = el.shadowRoot?.querySelector('[part="close"]') as HTMLButtonElement;
    expect(close.disabled).toBe(true);
  });

  it("defaults radius to full and size to md", async () => {
    const el = await fixture<VuChip>(html`<vu-chip label="X"></vu-chip>`);
    await elementUpdated(el);
    expect(el.radius).toBe("full");
    expect(el.size).toBe("md");
  });

  it("reflects radius and size attributes", async () => {
    const el = await fixture<VuChip>(html`<vu-chip label="X" size="sm"></vu-chip>`);
    await elementUpdated(el);
    expect(el.radius).toBe("full");
    expect(el.size).toBe("sm");

    el.radius = "md";
    await elementUpdated(el);
    expect(el.getAttribute("radius")).not.toBe("full");
  });

  it("reflects color attribute for intent tokens", async () => {
    const el = await fixture<VuChip>(html`<vu-chip label="X" color="danger"></vu-chip>`);
    await elementUpdated(el);
    expect(el.color).toBe("danger");
    expect(el.getAttribute("color")).toBe("danger");
  });

  it("reflects all color tokens", async () => {
    for (const color of ["default", "primary", "success", "warning", "danger"] as const) {
      const el = await fixture<VuChip>(html`<vu-chip label="X" color=${color}></vu-chip>`);
      await elementUpdated(el);
      expect(el.getAttribute("color")).toBe(color);
    }
  });

  it("exposes aria-disabled when disabled", async () => {
    const el = await fixture<VuChip>(html`<vu-chip label="Off" disabled></vu-chip>`);
    await elementUpdated(el);
    expect(el.getAttribute("aria-disabled")).toBe("true");
  });

  it("projects start slot content added at runtime", async () => {
    const el = await fixture<VuChip>(html`<vu-chip label="Tag"></vu-chip>`);
    await elementUpdated(el);
    const prefix = document.createElement("span");
    prefix.slot = "start";
    prefix.textContent = "[";
    el.appendChild(prefix);
    await elementUpdated(el);
    const startSlot = el.shadowRoot?.querySelector('slot[name="start"]') as HTMLSlotElement;
    expect(startSlot.assignedElements().length).toBe(1);
  });

  it("renders start and end icons when iconstart and iconend are set", async () => {
    const el = await fixture<VuChip>(html`
      <vu-chip label="Tag" iconstart="ion:checkmark" iconend="ion:close"></vu-chip>
    `);
    await elementUpdated(el);
    const icons = el.shadowRoot?.querySelectorAll('[part="icon"]');
    expect(icons?.length).toBe(2);
    expect(icons?.[0]?.getAttribute("icon")).toBe("ion:checkmark");
    expect(icons?.[1]?.getAttribute("icon")).toBe("ion:close");
  });

  it("variant outline and ghost add correct class", async () => {
    const elOutline = await fixture<VuChip>(html`<vu-chip label="O" variant="outline"></vu-chip>`);
    await elementUpdated(elOutline);
    expect(elOutline.shadowRoot?.querySelector(".chip.outline")).toBeTruthy();

    const elGhost = await fixture<VuChip>(html`<vu-chip label="G" variant="ghost"></vu-chip>`);
    await elementUpdated(elGhost);
    expect(elGhost.shadowRoot?.querySelector(".chip.ghost")).toBeTruthy();
  });

  it("variant dot adds dot class", async () => {
    const elDot = await fixture<VuChip>(html`<vu-chip label="D" variant="dot"></vu-chip>`);
    await elementUpdated(elDot);
    expect(elDot.shadowRoot?.querySelector(".chip.dot")).toBeTruthy();
  });

  it("accepts slotted content", async () => {
    const el = await fixture<VuChip>(
      html`<vu-chip label="Fallback"><span class="custom">Slotted</span></vu-chip>`,
    );
    await elementUpdated(el);
    const slotContent = el.querySelector(".custom");
    expect(slotContent?.textContent?.trim()).toBe("Slotted");
  });

  it("close uses custom closeLabel", async () => {
    const el = await fixture<VuChip>(
      html`<vu-chip label="X" removable closelabel="Dismiss tag"></vu-chip>`,
    );
    await elementUpdated(el);
    const btn = el.shadowRoot?.querySelector('[part="close"]');
    expect(btn?.getAttribute("aria-label")).toBe("Dismiss tag");
  });

  it("vu-close event has bubbles and composed", async () => {
    const el = await fixture<VuChip>(html`<vu-chip label="Ev" removable></vu-chip>`);
    await elementUpdated(el);
    let bubbles = false;
    let composed = false;
    el.addEventListener("vu-close", ((e: Event) => {
      bubbles = e.bubbles;
      composed = e.composed;
    }) as EventListener);
    const closeBtn = el.shadowRoot?.querySelector('[part="close"]') as HTMLElement;
    closeBtn?.click();
    expect(bubbles).toBe(true);
    expect(composed).toBe(true);
  });

  it("renders start and end slots", async () => {
    const el = await fixture<VuChip>(html`
      <vu-chip label="ignored">
        <span slot="start">[</span>
        <span>Mid</span>
        <span slot="end">]</span>
      </vu-chip>
    `);
    await elementUpdated(el);
    await elementUpdated(el);
    expect(el.textContent?.replace(/\s+/g, " ").trim()).toContain("[");
    expect(el.textContent?.replace(/\s+/g, " ").trim()).toContain("]");
    expect(el.textContent?.replace(/\s+/g, " ").trim()).toContain("Mid");
  });

  it("renders anchor when href is set", async () => {
    const el = await fixture<VuChip>(
      html`<vu-chip label="Docs" href="https://example.com"></vu-chip>`,
    );
    await elementUpdated(el);
    const anchor = el.shadowRoot?.querySelector('a[part="control"]');
    expect(anchor?.getAttribute("href")).toBe("https://example.com");
  });

  it("interactive chip toggles selected and fires vu-change", async () => {
    const el = await fixture<VuChip>(
      html`<vu-chip label="Filter" value="f1" interactive></vu-chip>`,
    );
    await elementUpdated(el);

    const btn = el.shadowRoot?.querySelector('button[part="control"]') as HTMLButtonElement;
    expect(btn.getAttribute("aria-pressed")).toBe("false");

    let detail: { selected: boolean; value: string; label: string } | undefined;
    el.addEventListener("vu-change", (e) => {
      detail = (e as CustomEvent).detail;
    });
    btn.click();
    await elementUpdated(el);

    expect(el.selected).toBe(true);
    expect(detail).toEqual({ selected: true, value: "f1", label: "Filter" });
    expect(btn.getAttribute("aria-pressed")).toBe("true");
  });

  it("reflects selected when interactive", async () => {
    const el = await fixture<VuChip>(html`<vu-chip label="On" interactive selected></vu-chip>`);
    await elementUpdated(el);
    expect(el.getAttribute("selected")).toBe("");
    expect(el.shadowRoot?.querySelector(".chip")?.classList.contains("selected")).toBe(true);
  });

  it("iconOnly hides the label and reflects for square CSS", async () => {
    const el = await fixture<VuChip>(
      html`<vu-chip label="Star" iconOnly iconstart="ion:star"></vu-chip>`,
    );
    await elementUpdated(el);
    expect(el.iconOnly).toBe(true);
    expect(el.hasAttribute("icononly")).toBe(true);
    const control = el.shadowRoot?.querySelector('[part="control"]') as HTMLElement;
    expect(control.getAttribute("role")).toBe("img");
    expect(control.getAttribute("aria-label")).toBe("Star");
    expect(control.querySelector("slot:not([name])")?.hasAttribute("hidden")).toBe(true);
  });

  it("renders in RTL without breaking structure", async () => {
    const wrap = await fixture(html`
      <div dir="rtl" lang="en">
        <vu-chip label="Tag" removable variant="dot"></vu-chip>
      </div>
    `);
    await elementUpdated(wrap);
    const el = wrap.querySelector("vu-chip") as VuChip;
    expect(el.shadowRoot?.querySelector('[part="chip"]')).toBeTruthy();
  });
});

describe("accessibility", () => {
  it("default soft chip passes axe", async () => {
    const el = await fixture(html`<vu-chip label="Tag"></vu-chip>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("disabled chip passes axe", async () => {
    const el = await fixture(html`<vu-chip label="Off" disabled></vu-chip>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("removable primary chip passes axe", async () => {
    const el = await fixture(html` <vu-chip label="Filter" removable color="primary"></vu-chip> `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("icon-only chip passes axe", async () => {
    const el = await fixture(html`<vu-chip label="Star" iconOnly iconstart="ion:star"></vu-chip>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("interactive selected chip passes axe", async () => {
    const el = await fixture(html`
      <vu-chip label="On" interactive selected color="success"></vu-chip>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
