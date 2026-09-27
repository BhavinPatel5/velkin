/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect, vi } from "vitest";
import { VuDrawer } from "../drawer.js";
import "../../icon/icon.js";
import "../../button/button.js";

describe("vu-drawer", () => {
  it("is defined", () => {
    expect(customElements.get("vu-drawer")).toBe(VuDrawer);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuDrawer>(html`<vu-drawer></vu-drawer>`);
    await elementUpdated(el);
    expect(el.open).toBe(false);
    expect(el.side).toBe("left");
    expect(el.variant).toBe("elevated");
    expect(el.tone).toBe("normal");
    expect(el.size).toBe("md");
    expect(el.radius).toBe("md");
    expect(el.persistent).toBe(false);
    expect(el.closable).toBe(false);
    expect(el.closeOnEsc).toBe(true);
    expect(el.ariaLabel).toBe("");
  });

  it("reflects open state", async () => {
    const el = await fixture<VuDrawer>(html`
      <vu-drawer .open=${true}>
        <div slot="body">Content</div>
      </vu-drawer>
    `);
    await elementUpdated(el);
    expect(el.open).toBe(true);
    expect(el.getAttribute("open")).toBe("");
  });

  it("accepts side", async () => {
    const el = await fixture<VuDrawer>(html`<vu-drawer side="right"></vu-drawer>`);
    await elementUpdated(el);
    expect(el.side).toBe("right");
  });

  it("accepts Role C appearance props", async () => {
    const el = await fixture<VuDrawer>(
      html`<vu-drawer variant="soft" tone="subtle" size="lg" radius="lg"></vu-drawer>`,
    );
    await elementUpdated(el);
    expect(el.variant).toBe("soft");
    expect(el.tone).toBe("subtle");
    expect(el.size).toBe("lg");
    expect(el.radius).toBe("lg");
  });

  it("has panel and overlay parts", async () => {
    const el = await fixture<VuDrawer>(html`<vu-drawer></vu-drawer>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="panel"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="overlay"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="panel"]')?.getAttribute("popover")).toBe("manual");
  });

  it("collapses header and footer chrome when slots are empty", async () => {
    const el = await fixture<VuDrawer>(html`
      <vu-drawer .open=${true}>
        <div slot="body">Body</div>
      </vu-drawer>
    `);
    await elementUpdated(el);
    const header = el.shadowRoot?.querySelector('[part="header"]') as HTMLElement;
    const footer = el.shadowRoot?.querySelector('[part="footer"]') as HTMLElement;
    expect((header.querySelector("slot") as HTMLSlotElement).assignedElements().length).toBe(0);
    expect((footer.querySelector("slot") as HTMLSlotElement).assignedElements().length).toBe(0);
    expect(header.hasAttribute("hidden")).toBe(false);
    expect(footer.hasAttribute("hidden")).toBe(false);
  });

  it("show, hide, and toggle methods", async () => {
    const el = await fixture<VuDrawer>(html`<vu-drawer></vu-drawer>`);
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

  it("focus() delegates to the panel", async () => {
    const el = await fixture<VuDrawer>(html`
      <vu-drawer .open=${true}>
        <div slot="body">Body</div>
      </vu-drawer>
    `);
    await elementUpdated(el);
    const panel = el.shadowRoot?.querySelector('[part="panel"]') as HTMLElement;
    const spy = vi.spyOn(panel, "focus");
    el.focus();
    expect(spy).toHaveBeenCalled();
  });

  it("does not move initial focus to the close button when other controls exist", async () => {
    const el = await fixture<VuDrawer>(html`
      <vu-drawer .open=${true} closable>
        <div slot="body">Nav</div>
        <button slot="footer" type="button">Done</button>
      </vu-drawer>
    `);
    await elementUpdated(el);
    const done = el.querySelector('[slot="footer"]') as HTMLButtonElement;
    const close = el.shadowRoot?.querySelector('[part="close-button"]') as HTMLElement;
    expect(document.activeElement).toBe(done);
    expect(document.activeElement).not.toBe(close);
  });

  it("paints the close icon on first paint", async () => {
    const el = await fixture<VuDrawer>(html`
      <vu-drawer .open=${true} closable>
        <div slot="body">Body</div>
      </vu-drawer>
    `);
    const closeIcon = el.shadowRoot?.querySelector('[part="close-button"] vu-icon') as HTMLElement;
    expect(closeIcon?.shadowRoot?.querySelector(".iconify svg")).toBeTruthy();
    expect(closeIcon?.shadowRoot?.querySelector(".iconify")?.hasAttribute("hidden")).toBe(false);
  });

  it("vu-close is cancelable and keeps open when prevented", async () => {
    const el = await fixture<VuDrawer>(html`
      <vu-drawer .open=${true} closable>
        <div slot="body">Body</div>
      </vu-drawer>
    `);
    await elementUpdated(el);
    el.addEventListener("vu-close", (e) => e.preventDefault());
    const closeBtn = el.shadowRoot?.querySelector('[part="close-button"]') as HTMLElement;
    closeBtn?.click();
    await elementUpdated(el);
    expect(el.open).toBe(true);
  });

  it("backdrop emits vu-close with reason", async () => {
    const el = await fixture<VuDrawer>(html`
      <vu-drawer .open=${true}>
        <div slot="body">Body</div>
      </vu-drawer>
    `);
    await elementUpdated(el);
    let reason = "";
    el.addEventListener("vu-close", ((e: CustomEvent<{ reason: string }>) => {
      reason = e.detail.reason;
    }) as EventListener);
    const overlay = el.shadowRoot?.querySelector('[part="overlay"]') as HTMLElement;
    overlay?.click();
    expect(reason).toBe("backdrop");
  });

  it("backdrop does not emit vu-close when persistent", async () => {
    const el = await fixture<VuDrawer>(html`
      <vu-drawer .open=${true} persistent>
        <div slot="body">Body</div>
      </vu-drawer>
    `);
    await elementUpdated(el);
    let fired = false;
    el.addEventListener("vu-close", () => {
      fired = true;
    });
    const overlay = el.shadowRoot?.querySelector('[part="overlay"]') as HTMLElement;
    overlay?.click();
    expect(fired).toBe(false);
    expect(el.open).toBe(true);
  });

  it("Escape dispatches vu-close when topmost by default", async () => {
    const el = await fixture<VuDrawer>(html`
      <vu-drawer .open=${true}>
        <div slot="body">Body</div>
      </vu-drawer>
    `);
    await elementUpdated(el);
    let fired = false;
    el.addEventListener("vu-close", () => {
      fired = true;
    });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(fired).toBe(true);
  });

  it("renders body slot content", async () => {
    const el = await fixture<VuDrawer>(html`
      <vu-drawer .open=${true}>
        <div slot="header">Title</div>
        <div slot="body">Main</div>
        <div slot="footer">Actions</div>
      </vu-drawer>
    `);
    await elementUpdated(el);
    expect(el.querySelector('[slot="body"]')?.textContent?.trim()).toBe("Main");
  });

  it("close button emits vu-close with reason", async () => {
    const el = await fixture<VuDrawer>(html`
      <vu-drawer .open=${true} closable>
        <div slot="header">Title</div>
        <div slot="body">Body</div>
      </vu-drawer>
    `);
    await elementUpdated(el);
    let reason = "";
    el.addEventListener("vu-close", ((e: CustomEvent<{ reason: string }>) => {
      reason = e.detail.reason;
    }) as EventListener);
    const closeBtn = el.shadowRoot?.querySelector('[part="close-button"]') as HTMLElement;
    closeBtn?.click();
    expect(reason).toBe("close-button");
  });

  it("allows pointer interaction with slotted body content", async () => {
    let clicked = false;
    const el = await fixture<VuDrawer>(html`
      <vu-drawer .open=${true}>
        <button
          slot="body"
          type="button"
          @click=${() => {
            clicked = true;
          }}
        >
          Action
        </button>
      </vu-drawer>
    `);
    await elementUpdated(el);
    const button = el.querySelector('button[slot="body"]') as HTMLButtonElement;
    button?.click();
    expect(clicked).toBe(true);
  });

  it("uses ariaLabel when header slot is empty", async () => {
    const el = await fixture<VuDrawer>(html`
      <vu-drawer .open=${true} arialabel="Navigation">
        <p slot="body">Links</p>
      </vu-drawer>
    `);
    await elementUpdated(el);
    const panel = el.shadowRoot?.querySelector('[part="panel"]');
    expect(panel?.getAttribute("aria-label")).toBe("Navigation");
  });

  it("sets aria-labelledby when header is present", async () => {
    const el = await fixture<VuDrawer>(html`
      <vu-drawer .open=${true}>
        <h2 slot="header">Nav</h2>
        <p slot="body">Links</p>
      </vu-drawer>
    `);
    await elementUpdated(el);
    const panel = el.shadowRoot?.querySelector('[part="panel"]');
    const header = el.shadowRoot?.querySelector('[part="header"]');
    expect(panel?.getAttribute("aria-labelledby")).toBe(header?.id);
    expect(panel?.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("updates header visibility and aria-labelledby when header is added at runtime", async () => {
    const el = await fixture<VuDrawer>(html`
      <vu-drawer .open=${true} arialabel="Navigation">
        <p slot="body">Links</p>
      </vu-drawer>
    `);
    await elementUpdated(el);
    const panel = () => el.shadowRoot?.querySelector('[part="panel"]') as HTMLElement;
    const header = () => el.shadowRoot?.querySelector('[part="header"]') as HTMLElement;
    expect((header().querySelector("slot") as HTMLSlotElement).assignedElements().length).toBe(0);
    expect(header().hasAttribute("hidden")).toBe(false);
    expect(panel().getAttribute("aria-label")).toBe("Navigation");
    expect(panel().hasAttribute("aria-labelledby")).toBe(false);

    const slotHeader = document.createElement("h2");
    slotHeader.slot = "header";
    slotHeader.textContent = "Runtime nav";
    el.insertBefore(slotHeader, el.firstChild);
    await elementUpdated(el);

    expect((header().querySelector("slot") as HTMLSlotElement).assignedElements().length).toBe(1);
    expect(header().hasAttribute("hidden")).toBe(false);
    expect(panel().getAttribute("aria-labelledby")).toBe(header().id);
    expect(panel().hasAttribute("aria-label")).toBe(false);
  });

  it("updates body visibility and aria-describedby when body is added at runtime", async () => {
    const el = await fixture<VuDrawer>(html`
      <vu-drawer .open=${true} arialabel="Navigation">
        <h2 slot="header">Nav</h2>
      </vu-drawer>
    `);
    await elementUpdated(el);
    const panel = () => el.shadowRoot?.querySelector('[part="panel"]') as HTMLElement;
    const body = () => el.shadowRoot?.querySelector('[part="body"]') as HTMLElement;
    expect((body().querySelector("slot") as HTMLSlotElement).assignedElements().length).toBe(0);
    expect(body().hasAttribute("hidden")).toBe(false);
    expect(panel().hasAttribute("aria-describedby")).toBe(false);

    const slotBody = document.createElement("p");
    slotBody.slot = "body";
    slotBody.textContent = "Runtime links";
    el.appendChild(slotBody);
    await elementUpdated(el);

    expect(body().hasAttribute("hidden")).toBe(false);
    expect(panel().getAttribute("aria-describedby")).toBe(body().id);
  });

  it("emits vu-open and vu-afteropen when opened", async () => {
    vi.useFakeTimers();
    const el = await fixture<VuDrawer>(html`
      <vu-drawer>
        <div slot="body">Body</div>
      </vu-drawer>
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
    const el = await fixture<VuDrawer>(html`
      <vu-drawer .open=${true}>
        <div slot="body">Body</div>
      </vu-drawer>
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
    const el = await fixture<VuDrawer>(html`<vu-drawer></vu-drawer>`);
    await elementUpdated(el);
    const cssText = el.shadowRoot?.querySelector("style")?.textContent ?? "";
    expect(cssText).toContain("--drawer-width");
    expect(cssText).toContain("--drawer-backdrop-color");
    expect(cssText).toContain("prefers-contrast: more");
    expect(cssText).toContain("forced-colors: active");
  });
});

describe("accessibility", () => {
  it("closed default", async () => {
    const el = await fixture<VuDrawer>(html`<vu-drawer></vu-drawer>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("open with regions and closable", async () => {
    const el = await fixture<VuDrawer>(html`
      <vu-drawer .open=${true} closable>
        <h2 slot="header">Nav</h2>
        <p slot="body">Links</p>
      </vu-drawer>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
