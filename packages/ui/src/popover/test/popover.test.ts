/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect, vi } from "vitest";
import { VuPopover } from "../popover.js";

describe("vu-popover", () => {
  it("is defined", () => {
    expect(customElements.get("vu-popover")).toBe(VuPopover);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuPopover>(html`<vu-popover></vu-popover>`);
    await elementUpdated(el);
    expect(el.open).toBe(false);
    expect(el.anchor).toBeUndefined();
    expect(el.anchorScope).toBe("document");
    expect(el.anchorEl).toBeUndefined();
    expect(el.placement).toBe("auto");
    expect(el.align).toBe("start");
    expect(el.gap).toBe(6);
    expect(el.padding).toBe(8);
    expect(el.matchAnchorWidth).toBe(false);
    expect(el.maxWidthToViewport).toBe(true);
    expect(el.maxWidthMode).toBe("cap");
    expect(el.flip).toBe(true);
    expect(el.flipOrder).toEqual([]);
    expect(el.preset).toBe("scale");
    expect(el.duration).toBe(220);
    expect(el.closeDuration).toBe(180);
    expect(el.animateReposition).toBe(true);
    expect(el.repositionMs).toBe(160);
    expect(el.closeOnEscape).toBe(true);
    expect(el.closeOnOutside).toBe(true);
    expect(el.restoreFocusOnClose).toBe(true);
    expect(el.ignoreOutsideSelector).toBe("");
    expect(el.ignoreOutsideAttr).toBe("data-popover-ignore-outside");
    expect(el.groupEventName).toBeUndefined();
    expect(el.groupId).toBeUndefined();
  });

  it("accepts anchor and placement props", async () => {
    const el = await fixture<VuPopover>(
      html`<vu-popover
        .anchor=${"#btn"}
        placement="bottom"
        .gap=${10}
        .padding=${12}
      ></vu-popover>`,
    );
    await elementUpdated(el);
    expect(el.anchor).toBe("#btn");
    expect(el.placement).toBe("bottom");
    expect(el.gap).toBe(10);
    expect(el.padding).toBe(12);
  });

  it("uses the host as the manual popover surface", async () => {
    const el = await fixture<VuPopover>(html`<vu-popover></vu-popover>`);
    await elementUpdated(el);
    expect(el.getAttribute("popover")).toBe("manual");
    expect(el.getAttribute("part")).toBe("base");
    expect(el.shadowRoot?.querySelector("slot")).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="surface"]')).toBeNull();
  });

  it("show, hide, and toggle methods", async () => {
    const wrap = await fixture(html`
      <div>
        <button id="pop-anchor">Anchor</button>
        <vu-popover anchor="#pop-anchor"></vu-popover>
      </div>
    `);
    await elementUpdated(wrap);
    const popover = wrap.querySelector("vu-popover") as VuPopover;
    popover.show();
    await elementUpdated(popover);
    expect(popover.open).toBe(true);
    popover.hide();
    await elementUpdated(popover);
    expect(popover.open).toBe(false);
    popover.toggle();
    await elementUpdated(popover);
    expect(popover.open).toBe(true);
  });

  it("fires vu-open-change when open changes from the controller", async () => {
    const wrap = await fixture(html`
      <div>
        <button id="pop-anchor-2">Anchor</button>
        <vu-popover anchor="#pop-anchor-2"></vu-popover>
      </div>
    `);
    await elementUpdated(wrap);
    const popover = wrap.querySelector("vu-popover") as VuPopover;
    const onChange = vi.fn();
    popover.addEventListener("vu-open-change", onChange);
    popover.show();
    await elementUpdated(popover);
    expect(onChange).toHaveBeenCalled();
    const detail = onChange.mock.calls.at(-1)?.[0]?.detail;
    expect(detail?.open).toBe(true);
  });

  it("closes on Escape via the dismissible stack when topmost", async () => {
    const wrap = await fixture(html`
      <div>
        <button id="pop-anchor-esc">Anchor</button>
        <vu-popover anchor="#pop-anchor-esc"></vu-popover>
      </div>
    `);
    await elementUpdated(wrap);
    const popover = wrap.querySelector("vu-popover") as VuPopover;
    popover.show();
    await elementUpdated(popover);
    expect(popover.open).toBe(true);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await elementUpdated(popover);
    expect(popover.open).toBe(false);
  });

  it("reconnectTarget keeps open state with a valid anchor", async () => {
    const wrap = await fixture(html`
      <div>
        <button id="pop-anchor-3">Anchor</button>
        <vu-popover anchor="#pop-anchor-3"></vu-popover>
      </div>
    `);
    await elementUpdated(wrap);
    const popover = wrap.querySelector("vu-popover") as VuPopover;
    popover.show();
    await elementUpdated(popover);
    popover.reconnectTarget();
    await elementUpdated(popover);
    expect(popover.open).toBe(true);
  });
});

describe("accessibility", () => {
  it("closed with slotted content", async () => {
    const el = await fixture<VuPopover>(html`
      <vu-popover>
        <div>Panel content</div>
      </vu-popover>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("open with anchor and slotted content", async () => {
    const wrap = await fixture(html`
      <div>
        <button id="pop-a11y-anchor">Anchor</button>
        <vu-popover anchor="#pop-a11y-anchor" open>
          <p>Account settings</p>
        </vu-popover>
      </div>
    `);
    await elementUpdated(wrap);
    const popover = wrap.querySelector("vu-popover") as VuPopover;
    await elementUpdated(popover);
    await expectA11y(popover).to.be.accessible();
  });
});
