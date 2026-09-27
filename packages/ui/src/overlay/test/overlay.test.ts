/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7✓ 8✓ 9 N/A
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect, vi } from "vitest";
import { VuOverlay } from "../overlay.js";
import "../../button/button.js";
import "../../card/card.js";

describe("vu-overlay", () => {
  it("is defined", () => {
    expect(customElements.get("vu-overlay")).toBe(VuOverlay);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuOverlay>(html`<vu-overlay></vu-overlay>`);
    await elementUpdated(el);
    expect(el.open).toBe(false);
    expect(el.persistent).toBe(false);
    expect(el.closeOnEsc).toBe(true);
    expect(el.backdropblur).toBe(false);
    expect(el.lockscroll).toBe(true);
    expect(el.ariaLabel).toBe("");
  });

  it("reflects open", async () => {
    const el = await fixture<VuOverlay>(html`<vu-overlay open></vu-overlay>`);
    await elementUpdated(el);
    expect(el.getAttribute("open")).toBe("");
  });

  it("has backdrop and content parts", async () => {
    const el = await fixture<VuOverlay>(html`<vu-overlay></vu-overlay>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="backdrop"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="content"]')).toBeTruthy();
  });

  it("show, hide, and toggle methods", async () => {
    const el = await fixture<VuOverlay>(html`<vu-overlay></vu-overlay>`);
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

  it("focus() delegates to the content frame", async () => {
    const el = await fixture<VuOverlay>(html`
      <vu-overlay .open=${true} arialabel="Panel">
        <vu-card>Panel</vu-card>
      </vu-overlay>
    `);
    await elementUpdated(el);
    const content = el.shadowRoot?.querySelector('[part="content"]') as HTMLElement;
    const spy = vi.spyOn(content, "focus");
    el.focus();
    expect(spy).toHaveBeenCalled();
  });

  it("renders default slot content", async () => {
    const el = await fixture<VuOverlay>(html`
      <vu-overlay .open=${true} arialabel="Content">
        <div class="inner">Content</div>
      </vu-overlay>
    `);
    await elementUpdated(el);
    expect(el.querySelector(".inner")?.textContent).toBe("Content");
  });

  it("backdrop emits vu-close with reason", async () => {
    const el = await fixture<VuOverlay>(html`
      <vu-overlay .open=${true} arialabel="Panel">
        <vu-card>Panel</vu-card>
      </vu-overlay>
    `);
    await elementUpdated(el);
    let reason = "";
    el.addEventListener("vu-close", ((e: CustomEvent<{ reason: string }>) => {
      reason = e.detail.reason;
    }) as EventListener);
    const backdrop = el.shadowRoot?.querySelector('[part="backdrop"]') as HTMLElement;
    backdrop?.click();
    expect(reason).toBe("backdrop");
  });

  it("backdrop does not emit vu-close when persistent", async () => {
    const el = await fixture<VuOverlay>(html`
      <vu-overlay .open=${true} persistent arialabel="Panel">
        <vu-card>Panel</vu-card>
      </vu-overlay>
    `);
    await elementUpdated(el);
    let fired = false;
    el.addEventListener("vu-close", () => {
      fired = true;
    });
    const backdrop = el.shadowRoot?.querySelector('[part="backdrop"]') as HTMLElement;
    backdrop?.click();
    expect(fired).toBe(false);
    expect(el.open).toBe(true);
  });

  it("vu-close is cancelable", async () => {
    const el = await fixture<VuOverlay>(html`
      <vu-overlay .open=${true} arialabel="Panel">
        <vu-card>Panel</vu-card>
      </vu-overlay>
    `);
    await elementUpdated(el);
    el.addEventListener("vu-close", (e) => e.preventDefault());
    const backdrop = el.shadowRoot?.querySelector('[part="backdrop"]') as HTMLElement;
    backdrop?.click();
    await elementUpdated(el);
    expect(el.open).toBe(true);
  });

  it("Escape dispatches vu-close when topmost by default", async () => {
    const el = await fixture<VuOverlay>(html`
      <vu-overlay .open=${true} arialabel="Panel">
        <vu-card>Panel</vu-card>
      </vu-overlay>
    `);
    await elementUpdated(el);
    let fired = false;
    el.addEventListener("vu-close", () => {
      fired = true;
    });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(fired).toBe(true);
  });

  it("uses ariaLabel when open with slotted content", async () => {
    const el = await fixture<VuOverlay>(html`
      <vu-overlay .open=${true} arialabel="Confirm action">
        <vu-card>Panel</vu-card>
      </vu-overlay>
    `);
    await elementUpdated(el);
    const content = el.shadowRoot?.querySelector('[part="content"]');
    expect(content?.getAttribute("aria-label")).toBe("Confirm action");
    expect(content?.getAttribute("role")).toBe("dialog");
    expect(content?.getAttribute("aria-modal")).toBe("true");
  });

  it("emits vu-open and vu-afteropen when opened", async () => {
    vi.useFakeTimers();
    const el = await fixture<VuOverlay>(html`
      <vu-overlay arialabel="Panel">
        <vu-card>Panel</vu-card>
      </vu-overlay>
    `);
    await elementUpdated(el);
    const events: string[] = [];
    el.addEventListener("vu-open", () => events.push("vu-open"));
    el.addEventListener("vu-afteropen", () => events.push("vu-afteropen"));
    el.show();
    await elementUpdated(el);
    expect(events).toContain("vu-open");
    vi.advanceTimersByTime(300);
    expect(events).toContain("vu-afteropen");
    vi.useRealTimers();
  });

  it("emits vu-afterclose when closed", async () => {
    vi.useFakeTimers();
    const el = await fixture<VuOverlay>(html`
      <vu-overlay .open=${true} arialabel="Panel">
        <vu-card>Panel</vu-card>
      </vu-overlay>
    `);
    await elementUpdated(el);
    const events: string[] = [];
    el.addEventListener("vu-afterclose", () => events.push("vu-afterclose"));
    el.hide();
    await elementUpdated(el);
    vi.advanceTimersByTime(300);
    expect(events).toContain("vu-afterclose");
    vi.useRealTimers();
  });

  it("exposes layout tokens as CSS variables", async () => {
    const el = await fixture<VuOverlay>(html`<vu-overlay></vu-overlay>`);
    await elementUpdated(el);
    const cssText = el.shadowRoot?.querySelector("style")?.textContent ?? "";
    expect(cssText).toContain("--overlay-backdrop-color");
    expect(cssText).toContain("--overlay-z");
  });
});

describe("accessibility", () => {
  it("closed default", async () => {
    const el = await fixture<VuOverlay>(html`<vu-overlay></vu-overlay>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("open with ariaLabel and slotted card", async () => {
    const el = await fixture<VuOverlay>(html`
      <vu-overlay .open=${true} arialabel="Dialog">
        <vu-card>
          <p slot="body">Body copy</p>
        </vu-card>
      </vu-overlay>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
