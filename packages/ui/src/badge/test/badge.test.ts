/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuBadge } from "../badge.js";

describe("vu-badge", () => {
  it("is defined", () => {
    expect(customElements.get("vu-badge")).toBe(VuBadge);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuBadge>(
      html`<vu-badge><span>Anchor</span></vu-badge>`,
    );
    await elementUpdated(el);

    expect(el.value).toBe("");
    expect(el.max).toBe(99);
    expect(el.dot).toBe(false);
    expect(el.color).toBe("danger");
    expect(el.placement).toBe("top-right");
    expect(el.bordered).toBe(true);
    expect(el.show).toBe(true);
    expect(el.hideOnZero).toBe(false);
    expect(el.processing).toBe(false);
    expect(el.disabled).toBe(false);

    expect(el.shadowRoot?.querySelector('[part="base"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="badge"]')).toBeTruthy();
  });

  it("reflects color, placement, dot, bordered, processing, disabled as attributes", async () => {
    const el = await fixture<VuBadge>(html`
      <vu-badge
        color="success"
        placement="bottom-left"
        dot
        bordered
        processing
        disabled
      ><span>X</span></vu-badge>
    `);
    await elementUpdated(el);
    expect(el.getAttribute("color")).toBe("success");
    expect(el.getAttribute("placement")).toBe("bottom-left");
    expect(el.hasAttribute("dot")).toBe(true);
    expect(el.hasAttribute("bordered")).toBe(true);
    expect(el.hasAttribute("processing")).toBe(true);
    expect(el.hasAttribute("disabled")).toBe(true);
    expect(el.getAttribute("aria-disabled")).toBe("true");
  });

  it("reflects all color tokens", async () => {
    for (const color of ["default", "primary", "success", "warning", "danger"] as const) {
      const el = await fixture<VuBadge>(
        html`<vu-badge color=${color}><span>X</span></vu-badge>`,
      );
      await elementUpdated(el);
      expect(el.getAttribute("color")).toBe(color);
    }
  });

  it("reflects all size tokens", async () => {
    for (const size of ["sm", "md", "lg"] as const) {
      const el = await fixture<VuBadge>(
        html`<vu-badge size=${size}><span>X</span></vu-badge>`,
      );
      await elementUpdated(el);
      expect(el.getAttribute("size")).toBe(size);
    }
  });

  it("renders the value text in value (pill) mode", async () => {
    const el = await fixture<VuBadge>(
      html`<vu-badge value="5"><span>X</span></vu-badge>`,
    );
    await elementUpdated(el);
    const badge = el.shadowRoot?.querySelector('[part="badge"]');
    expect(badge?.textContent?.trim()).toBe("5");
  });

  it("uses fixed block-size and matching min-inline-size for circular singles", () => {
    const cssText = (VuBadge.styles as { cssText: string }).cssText;
    expect(cssText).toMatch(/block-size:\s*var\(--badge-min-size\)/);
    expect(cssText).toMatch(/min-inline-size:\s*var\(--badge-min-size\)/);
    expect(cssText).toMatch(/padding-block:\s*0/);
  });

  it("formats numeric overflow as N+ when value exceeds max", async () => {
    const el = await fixture<VuBadge>(
      html`<vu-badge value="150" max="99"><span>X</span></vu-badge>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="badge"]')?.textContent?.trim()).toBe("99+");
  });

  it("does not cap when max is 0", async () => {
    const el = await fixture<VuBadge>(
      html`<vu-badge value="150" max="0"><span>X</span></vu-badge>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="badge"]')?.textContent?.trim()).toBe("150");
  });

  it("does not cap a non-numeric value", async () => {
    const el = await fixture<VuBadge>(
      html`<vu-badge value="NEW" max="99"><span>X</span></vu-badge>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="badge"]')?.textContent?.trim()).toBe("NEW");
  });

  it("renders empty content in dot mode (badge present, no text)", async () => {
    const el = await fixture<VuBadge>(
      html`<vu-badge dot><span>X</span></vu-badge>`,
    );
    await elementUpdated(el);
    const badge = el.shadowRoot?.querySelector('[part="badge"]');
    expect(badge).toBeTruthy();
    expect(badge?.textContent?.trim()).toBe("");
  });

  it("forces dot mode when value is set but dot=true", async () => {
    const el = await fixture<VuBadge>(
      html`<vu-badge dot value="5"><span>X</span></vu-badge>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="badge"]')?.textContent?.trim()).toBe("");
  });

  it("toggles the badge 'is-hidden' class based on the 'show' prop", async () => {
    const el = await fixture<VuBadge>(
      html`<vu-badge value="5"><span>X</span></vu-badge>`,
    );
    await elementUpdated(el);
    const getBadge = () => el.shadowRoot?.querySelector('[part="badge"]');
    expect(getBadge()?.classList.contains("is-hidden")).toBe(false);

    el.show = false;
    await elementUpdated(el);
    expect(getBadge()?.classList.contains("is-hidden")).toBe(true);

    el.show = true;
    await elementUpdated(el);
    expect(getBadge()?.classList.contains("is-hidden")).toBe(false);
  });

  it("hides the badge when hideOnZero is true and value is 0", async () => {
    const el = await fixture<VuBadge>(
      html`<vu-badge value="0" hideOnZero><span>X</span></vu-badge>`,
    );
    await elementUpdated(el);
    expect(
      el.shadowRoot?.querySelector('[part="badge"]')?.classList.contains("is-hidden"),
    ).toBe(true);
  });

  it("keeps the badge visible when hideOnZero is true but value is non-zero", async () => {
    const el = await fixture<VuBadge>(
      html`<vu-badge value="3" hideOnZero><span>X</span></vu-badge>`,
    );
    await elementUpdated(el);
    expect(
      el.shadowRoot?.querySelector('[part="badge"]')?.classList.contains("is-hidden"),
    ).toBe(false);
  });

  it("re-toggles visibility when value flips between 0 and non-zero with hideOnZero", async () => {
    const el = await fixture<VuBadge>(
      html`<vu-badge value="3" hideOnZero><span>X</span></vu-badge>`,
    );
    await elementUpdated(el);
    const getBadge = () => el.shadowRoot?.querySelector('[part="badge"]');
    expect(getBadge()?.classList.contains("is-hidden")).toBe(false);

    el.value = "0";
    await elementUpdated(el);
    expect(getBadge()?.classList.contains("is-hidden")).toBe(true);

    el.value = "1";
    await elementUpdated(el);
    expect(getBadge()?.classList.contains("is-hidden")).toBe(false);
  });

  it("uses the displayed value as the default aria-label", async () => {
    const el = await fixture<VuBadge>(
      html`<vu-badge value="5"><span>X</span></vu-badge>`,
    );
    await elementUpdated(el);
    const badge = el.shadowRoot?.querySelector('[part="badge"]');
    expect(badge?.getAttribute("aria-label")).toBe("5");
  });

  it("uses the displayed (capped) value as aria-label when max kicks in", async () => {
    const el = await fixture<VuBadge>(
      html`<vu-badge value="150" max="99"><span>X</span></vu-badge>`,
    );
    await elementUpdated(el);
    const badge = el.shadowRoot?.querySelector('[part="badge"]');
    expect(badge?.getAttribute("aria-label")).toBe("99+");
  });

  it("custom 'label' overrides the auto-derived aria-label", async () => {
    const el = await fixture<VuBadge>(
      html`<vu-badge value="5" label="5 unread messages"><span>X</span></vu-badge>`,
    );
    await elementUpdated(el);
    const badge = el.shadowRoot?.querySelector('[part="badge"]');
    expect(badge?.getAttribute("aria-label")).toBe("5 unread messages");
  });

  it("omits aria-label entirely when in dot mode without a custom label", async () => {
    const el = await fixture<VuBadge>(
      html`<vu-badge dot><span>X</span></vu-badge>`,
    );
    await elementUpdated(el);
    const badge = el.shadowRoot?.querySelector('[part="badge"]');
    expect(badge?.hasAttribute("aria-label")).toBe(false);
  });

  it("aria-hidden mirrors the visibility state", async () => {
    const el = await fixture<VuBadge>(
      html`<vu-badge value="5"><span>X</span></vu-badge>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="badge"]')?.getAttribute("aria-hidden")).toBe("false");

    el.show = false;
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="badge"]')?.getAttribute("aria-hidden")).toBe("true");
  });

  it("applies an outward offset on the badge based on placement", async () => {
    const el = await fixture<VuBadge>(html`
      <vu-badge value="1" placement="top-right" offset="4px"><span>X</span></vu-badge>
    `);
    await elementUpdated(el);
    const badge = el.shadowRoot?.querySelector('[part="badge"]') as HTMLElement;
    expect(badge.style.marginBlockStart).toContain("calc");
    expect(badge.style.marginInlineStart).toBe("4px");
  });

  it("flips offset signs for bottom-left placement", async () => {
    const el = await fixture<VuBadge>(html`
      <vu-badge value="1" placement="bottom-left" offset="6px"><span>X</span></vu-badge>
    `);
    await elementUpdated(el);
    const badge = el.shadowRoot?.querySelector('[part="badge"]') as HTMLElement;
    expect(badge.style.marginBlockStart).toBe("6px");
    expect(badge.style.marginInlineStart).toContain("calc");
  });

  it("clears offset styles when offset is removed", async () => {
    const el = await fixture<VuBadge>(html`
      <vu-badge value="1" placement="top-right" offset="4px"><span>X</span></vu-badge>
    `);
    await elementUpdated(el);
    const badge = () => el.shadowRoot?.querySelector('[part="badge"]') as HTMLElement;
    expect(badge().style.marginBlockStart).not.toBe("");

    el.offset = "";
    await elementUpdated(el);
    expect(badge().style.marginBlockStart).toBe("");
    expect(badge().style.marginInlineStart).toBe("");
  });

  it("renders the slotted anchor child", async () => {
    const el = await fixture<VuBadge>(html`
      <vu-badge value="3"><button class="anchor">Inbox</button></vu-badge>
    `);
    await elementUpdated(el);
    expect(el.querySelector(".anchor")?.textContent).toBe("Inbox");
  });

  it("renders an empty dot when no value, no content slot, and dot=false", async () => {
    const el = await fixture<VuBadge>(
      html`<vu-badge><span>X</span></vu-badge>`,
    );
    await elementUpdated(el);
    const badge = el.shadowRoot?.querySelector('[part="badge"]');
    expect(badge?.classList.contains("is-dot")).toBe(true);
    expect(badge?.textContent?.trim()).toBe("");
  });

  it("renders slotted content into the badge when 'content' slot is filled", async () => {
    const el = await fixture<VuBadge>(html`
      <vu-badge value="ignored">
        <span slot="mark" class="custom-mark">★</span>
        <span>Anchor</span>
      </vu-badge>
    `);
    await elementUpdated(el);
    const badge = el.shadowRoot?.querySelector('[part="badge"]');
    expect(badge?.classList.contains("is-dot")).toBe(false);
    expect(el.querySelector(".custom-mark")?.textContent).toBe("★");
  });

  it("slotted content suppresses the default value text (slot wins over value)", async () => {
    const el = await fixture<VuBadge>(html`
      <vu-badge value="9">
        <span slot="mark">!</span>
        <span>Anchor</span>
      </vu-badge>
    `);
    await elementUpdated(el);
    const slot = el.shadowRoot?.querySelector(
      'slot[name="mark"]',
    ) as HTMLSlotElement | null;
    const assigned = slot?.assignedElements() ?? [];
    expect(assigned.length).toBe(1);
    expect(assigned[0].textContent).toBe("!");
  });

  it("dot=true wins over slotted content (mark slot stays hidden in dot mode)", async () => {
    const el = await fixture<VuBadge>(html`
      <vu-badge dot>
        <span slot="mark">!</span>
        <span>Anchor</span>
      </vu-badge>
    `);
    await elementUpdated(el);
    const badge = el.shadowRoot?.querySelector('[part="badge"]');
    expect(badge?.classList.contains("is-dot")).toBe(true);
    const markSlot = el.shadowRoot?.querySelector('slot[name="mark"]');
    expect(markSlot?.hasAttribute("hidden")).toBe(true);
  });

  it("flips out of dot mode once a 'mark' slot is added at runtime", async () => {
    const el = await fixture<VuBadge>(
      html`<vu-badge><span>Anchor</span></vu-badge>`,
    );
    await elementUpdated(el);
    expect(
      el.shadowRoot?.querySelector('[part="badge"]')?.classList.contains("is-dot"),
    ).toBe(true);

    const icon = document.createElement("span");
    icon.setAttribute("slot", "mark");
    icon.textContent = "★";
    el.appendChild(icon);
    await elementUpdated(el);

    expect(
      el.shadowRoot?.querySelector('[part="badge"]')?.classList.contains("is-dot"),
    ).toBe(false);
  });

  it("omits aria-label when slotted content is provided without an explicit label", async () => {
    const el = await fixture<VuBadge>(html`
      <vu-badge>
        <span slot="mark">★</span>
        <span>Anchor</span>
      </vu-badge>
    `);
    await elementUpdated(el);
    const badge = el.shadowRoot?.querySelector('[part="badge"]');
    expect(badge?.hasAttribute("aria-label")).toBe(false);
  });

  it("uses the explicit 'label' as aria-label when slotted content is present", async () => {
    const el = await fixture<VuBadge>(html`
      <vu-badge label="Verified">
        <span slot="mark">★</span>
        <span>Anchor</span>
      </vu-badge>
    `);
    await elementUpdated(el);
    const badge = el.shadowRoot?.querySelector('[part="badge"]');
    expect(badge?.getAttribute("aria-label")).toBe("Verified");
  });
});

describe("accessibility", () => {
  it("numeric badge passes axe", async () => {
    const el = await fixture(html`<vu-badge value="3">Inbox</vu-badge>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("disabled badge passes axe", async () => {
    const el = await fixture(html`<vu-badge value="3" disabled>Inbox</vu-badge>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
