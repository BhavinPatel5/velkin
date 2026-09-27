/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6 N/A 7✓ 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, waitUntil, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuAlert } from "../alert";
import "../../icon/icon.js";

describe("vu-alert", () => {
  it("is defined", () => {
    expect(customElements.get("vu-alert")).toBe(VuAlert);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuAlert>(html`<vu-alert></vu-alert>`);
    await elementUpdated(el);

    expect(el.color).toBe("default");
    expect(el.variant).toBe("soft");
    expect(el.size).toBe("md");
    expect(el.heading).toBe("");
    expect(el.message).toBe("");
    expect(el.icon).toBe(null);
    expect(el.removable).toBe(false);

    expect(el.shadowRoot?.querySelector('[part="alert"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="stack"]')).toBeTruthy();
  });

  it("reflects color, variant, size, removable as attributes", async () => {
    const el = await fixture<VuAlert>(
      html`<vu-alert color="success" variant="solid" size="lg" removable></vu-alert>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("color")).toBe("success");
    expect(el.getAttribute("variant")).toBe("solid");
    expect(el.getAttribute("size")).toBe("lg");
    expect(el.hasAttribute("removable")).toBe(true);
  });

  it("renders heading text when heading prop is set", async () => {
    const el = await fixture<VuAlert>(html`<vu-alert heading="Saved"></vu-alert>`);
    await elementUpdated(el);
    const heading = el.shadowRoot?.querySelector('[part="heading"]');
    expect(heading).toBeTruthy();
    expect(heading?.hasAttribute("hidden")).toBe(false);
    expect(heading?.textContent?.trim()).toBe("Saved");
  });

  it("keeps heading wrapper in the tree when heading is empty", async () => {
    const el = await fixture<VuAlert>(html`<vu-alert message="Body"></vu-alert>`);
    await elementUpdated(el);
    const heading = el.shadowRoot?.querySelector('[part="heading"]');
    expect(heading).toBeTruthy();
    expect(heading?.hasAttribute("hidden")).toBe(false);
    expect(heading?.textContent?.trim()).toBe("");
  });

  it("shows heading wrapper when heading slot has content (even if heading prop empty)", async () => {
    const el = await fixture<VuAlert>(
      html`
        <vu-alert>
          <span slot="heading">Custom heading</span>
        </vu-alert>
      `,
    );
    await elementUpdated(el);
    const heading = el.shadowRoot?.querySelector('[part="heading"]');
    expect(heading?.hasAttribute("hidden")).toBe(false);
  });

  it("renders message as a <p> element when message prop is set", async () => {
    const el = await fixture<VuAlert>(html`<vu-alert message="Body."></vu-alert>`);
    await elementUpdated(el);
    const message = el.shadowRoot?.querySelector('[part="message"]');
    expect(message).toBeTruthy();
    expect(message?.tagName).toBe("P");
    expect(message?.textContent?.trim()).toBe("Body.");
  });

  it("falls back to default slot when message prop is empty", async () => {
    const el = await fixture<VuAlert>(
      html`
        <vu-alert heading="Done">
          <span class="slot-body">Slot body</span>
        </vu-alert>
      `,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="message"]')).toBeFalsy();
    expect(el.querySelector(".slot-body")?.textContent?.trim()).toBe("Slot body");
  });

  it("shows auto-derived icon for primary intent when icon prop is null", async () => {
    const el = await fixture<VuAlert>(html`<vu-alert color="primary" message="Info"></vu-alert>`);
    await elementUpdated(el);
    const wrapper = el.shadowRoot?.querySelector('[part="icon"]') as HTMLElement;
    expect(wrapper.hasAttribute("hidden")).toBe(false);
    const icon = wrapper.querySelector("vu-icon");
    expect(icon?.getAttribute("icon")).toBe("ion:information-circle");
  });

  it("shows auto-derived icon for danger intent", async () => {
    const el = await fixture<VuAlert>(html`<vu-alert color="danger" message="Err"></vu-alert>`);
    await elementUpdated(el);
    const icon = el.shadowRoot?.querySelector('[part="icon"] vu-icon');
    expect(icon?.getAttribute("icon")).toBe("ion:alert-circle");
  });

  it("hides fallback vu-icon for default color when icon is null and no slot", async () => {
    const el = await fixture<VuAlert>(html`<vu-alert message="Plain"></vu-alert>`);
    await elementUpdated(el);
    const wrapper = el.shadowRoot?.querySelector('[part="icon"]') as HTMLElement;
    expect(wrapper.hasAttribute("hidden")).toBe(false);
    const icon = wrapper.querySelector("vu-icon") as HTMLElement;
    expect(icon?.hasAttribute("hidden")).toBe(true);
  });

  it("uses explicit icon prop when provided", async () => {
    const el = await fixture<VuAlert>(
      html`<vu-alert color="success" icon="ion:rocket" message="Custom"></vu-alert>`,
    );
    await elementUpdated(el);
    const icon = el.shadowRoot?.querySelector('[part="icon"] vu-icon');
    expect(icon?.getAttribute("icon")).toBe("ion:rocket");
  });

  it("disables icon when icon prop is empty string", async () => {
    const el = await fixture<VuAlert>(
      html`<vu-alert color="success" icon="" message="No icon"></vu-alert>`,
    );
    await elementUpdated(el);
    const wrapper = el.shadowRoot?.querySelector('[part="icon"]') as HTMLElement;
    expect(wrapper.hasAttribute("hidden")).toBe(false);
    const iconEl = wrapper.querySelector("vu-icon") as HTMLElement;
    expect(iconEl?.hasAttribute("hidden")).toBe(true);
  });

  it("icon slot overrides prop and intent default", async () => {
    const el = await fixture<VuAlert>(
      html`
        <vu-alert color="danger" icon="ion:rocket" message="Slot wins">
          <span slot="icon" data-marker="custom">★</span>
        </vu-alert>
      `,
    );
    await elementUpdated(el);
    const wrapper = el.shadowRoot?.querySelector('[part="icon"]') as HTMLElement;
    expect(wrapper.hasAttribute("hidden")).toBe(false);
    expect(el.querySelector('[slot="icon"]')?.getAttribute("data-marker")).toBe("custom");
  });

  it("renders close button when removable", async () => {
    const el = await fixture<VuAlert>(
      html`<vu-alert removable message="Body"></vu-alert>`,
    );
    await elementUpdated(el);
    const close = el.shadowRoot?.querySelector('[part="close"]');
    expect(close).toBeTruthy();
    expect(close?.getAttribute("type")).toBe("button");
    expect(close?.getAttribute("aria-label")).toBe("Dismiss");
  });

  it("does not render close button when not removable", async () => {
    const el = await fixture<VuAlert>(html`<vu-alert message="No close"></vu-alert>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="close"]')).toBeFalsy();
  });

  it("keeps actions region without a close button when not removable", async () => {
    const el = await fixture<VuAlert>(html`<vu-alert message="Plain"></vu-alert>`);
    await elementUpdated(el);
    const actions = el.shadowRoot?.querySelector('[part="actions"]') as HTMLElement;
    expect(actions).toBeTruthy();
    expect(actions.hasAttribute("hidden")).toBe(false);
    expect(el.shadowRoot?.querySelector('[part="close"]')).toBeFalsy();
  });

  it("shows actions wrapper when actions slot has content", async () => {
    const el = await fixture<VuAlert>(
      html`
        <vu-alert message="With action">
          <button slot="actions">Retry</button>
        </vu-alert>
      `,
    );
    await elementUpdated(el);
    const actions = el.shadowRoot?.querySelector('[part="actions"]') as HTMLElement;
    expect(actions.hasAttribute("hidden")).toBe(false);
    expect(el.querySelector('[slot="actions"]')?.textContent?.trim()).toBe("Retry");
  });

  it("dispatches cancelable vu-close with reason='user' on dismiss click", async () => {
    const el = await fixture<VuAlert>(
      html`<vu-alert heading="Done" message="OK" removable></vu-alert>`,
    );
    await elementUpdated(el);
    const close = el.shadowRoot?.querySelector('[part="close"]') as HTMLElement;
    const eventPromise = new Promise<CustomEvent<{ heading: string; message: string; reason: string }>>(
      (resolve) => {
        el.addEventListener(
          "vu-close",
          (e: Event) => resolve(e as CustomEvent<{ heading: string; message: string; reason: string }>),
          { once: true },
        );
      },
    );
    close.click();
    const ev = await eventPromise;
    expect(ev.detail?.heading).toBe("Done");
    expect(ev.detail?.message).toBe("OK");
    expect(ev.detail?.reason).toBe("user");
    expect(ev.bubbles).toBe(true);
    expect(ev.composed).toBe(true);
    expect(ev.cancelable).toBe(true);
  });

  it("close() emits reason='method'", async () => {
    const el = await fixture<VuAlert>(html`<vu-alert></vu-alert>`);
    await elementUpdated(el);
    let detail: { reason?: string } = {};
    el.addEventListener("vu-close", (e) => {
      detail = (e as CustomEvent).detail ?? {};
    });
    await el.close();
    expect(detail.reason).toBe("method");
  });

  it("removes itself from DOM after close when vu-close not prevented", async () => {
    const container = await fixture<HTMLElement>(
      html`<div><vu-alert id="a1" removable></vu-alert></div>`,
    );
    await elementUpdated(container);
    const el = container.querySelector<VuAlert>("#a1")!;
    const close = el.shadowRoot?.querySelector('[part="close"]') as HTMLElement;
    close.click();
    await waitUntil(
      () => !container.querySelector("#a1"),
      "alert should be removed after exit animation",
      { timeout: 1000 },
    );
    expect(container.querySelector("#a1")).toBeFalsy();
  });

  it("stays in DOM when vu-close is preventDefaulted", async () => {
    const container = await fixture<HTMLElement>(
      html`<div><vu-alert id="a2" removable></vu-alert></div>`,
    );
    await elementUpdated(container);
    const el = container.querySelector<VuAlert>("#a2")!;
    el.addEventListener("vu-close", (e) => e.preventDefault());
    const close = el.shadowRoot?.querySelector('[part="close"]') as HTMLElement;
    close.click();
    await elementUpdated(container);
    expect(container.querySelector("#a2")).toBeTruthy();
  });

  it("close() returns a promise that resolves once the alert is detached", async () => {
    const container = await fixture<HTMLElement>(
      html`<div><vu-alert id="a3"></vu-alert></div>`,
    );
    await elementUpdated(container);
    const el = container.querySelector<VuAlert>("#a3")!;
    let fired = false;
    el.addEventListener("vu-close", () => { fired = true; });
    await el.close();
    expect(fired).toBe(true);
    expect(container.querySelector("#a3")).toBeFalsy();
  });

  it("concurrent close() calls are no-ops", async () => {
    const container = await fixture<HTMLElement>(
      html`<div><vu-alert id="a4"></vu-alert></div>`,
    );
    await elementUpdated(container);
    const el = container.querySelector<VuAlert>("#a4")!;
    let fireCount = 0;
    el.addEventListener("vu-close", () => { fireCount += 1; });
    const first = el.close();
    void el.close();
    void el.close();
    await first;
    expect(fireCount).toBe(1);
  });

  it("uses role=alert + aria-live=assertive for danger color", async () => {
    const el = await fixture<VuAlert>(html`<vu-alert color="danger" message="Bad"></vu-alert>`);
    await elementUpdated(el);
    const surface = el.shadowRoot?.querySelector('[part="alert"]');
    expect(surface?.getAttribute("role")).toBe("alert");
    expect(surface?.getAttribute("aria-live")).toBe("assertive");
  });

  it("uses role=alert + aria-live=assertive for warning color", async () => {
    const el = await fixture<VuAlert>(html`<vu-alert color="warning" message="Warn"></vu-alert>`);
    await elementUpdated(el);
    const surface = el.shadowRoot?.querySelector('[part="alert"]');
    expect(surface?.getAttribute("role")).toBe("alert");
    expect(surface?.getAttribute("aria-live")).toBe("assertive");
  });

  it("uses role=status + aria-live=polite for success / primary / default", async () => {
    for (const color of ["success", "primary", "default"] as const) {
      const el = await fixture<VuAlert>(
        html`<vu-alert color=${color} message="Calm"></vu-alert>`,
      );
      await elementUpdated(el);
      const surface = el.shadowRoot?.querySelector('[part="alert"]');
      expect(surface?.getAttribute("role")).toBe("status");
      expect(surface?.getAttribute("aria-live")).toBe("polite");
    }
  });

  it("derives heading and message ids from host id when set (SSR-deterministic)", async () => {
    const el = await fixture<VuAlert>(
      html`<vu-alert id="banner-1" heading="H" message="M"></vu-alert>`,
    );
    await elementUpdated(el);
    const heading = el.shadowRoot?.querySelector('[part="heading"]');
    const body = el.shadowRoot?.querySelector('[part="body"]');
    expect(heading?.id).toBe("banner-1-heading");
    expect(body?.id).toBe("banner-1-message");
  });

  it("falls back to auto-generated ids when host has no id", async () => {
    const el = await fixture<VuAlert>(html`<vu-alert heading="H" message="M"></vu-alert>`);
    await elementUpdated(el);
    const heading = el.shadowRoot?.querySelector('[part="heading"]');
    const body = el.shadowRoot?.querySelector('[part="body"]');
    expect(heading?.id).toMatch(/^vu-alert-\d+-heading$/);
    expect(body?.id).toMatch(/^vu-alert-\d+-message$/);
  });

  it("sets aria-labelledby and aria-describedby on the surface when both are present", async () => {
    const el = await fixture<VuAlert>(
      html`<vu-alert id="b1" heading="H" message="M"></vu-alert>`,
    );
    await elementUpdated(el);
    const surface = el.shadowRoot?.querySelector('[part="alert"]');
    expect(surface?.getAttribute("aria-labelledby")).toBe("b1-heading");
    expect(surface?.getAttribute("aria-describedby")).toBe("b1-message");
  });

  it("omits aria-labelledby when no heading is rendered", async () => {
    const el = await fixture<VuAlert>(html`<vu-alert message="M"></vu-alert>`);
    await elementUpdated(el);
    const surface = el.shadowRoot?.querySelector('[part="alert"]');
    expect(surface?.hasAttribute("aria-labelledby")).toBe(false);
  });

  it("omits aria-describedby when there is no body content (no message and no slotted body)", async () => {
    const el = await fixture<VuAlert>(html`<vu-alert heading="H"></vu-alert>`);
    await elementUpdated(el);
    const surface = el.shadowRoot?.querySelector('[part="alert"]');
    const body = el.shadowRoot?.querySelector('[part="body"]') as HTMLElement;
    expect(surface?.hasAttribute("aria-describedby")).toBe(false);
    expect(body).toBeTruthy();
    expect(body.hasAttribute("hidden")).toBe(false);
  });

  it("sets aria-describedby to the body id when default-slot content is the body", async () => {
    const el = await fixture<VuAlert>(
      html`
        <vu-alert id="b2" heading="H">
          <p>Slotted body paragraph.</p>
        </vu-alert>
      `,
    );
    await elementUpdated(el);
    const surface = el.shadowRoot?.querySelector('[part="alert"]');
    const body = el.shadowRoot?.querySelector('[part="body"]') as HTMLElement;
    expect(body?.hasAttribute("hidden")).toBe(false);
    expect(surface?.getAttribute("aria-describedby")).toBe("b2-message");
  });

  it("keeps the default <slot> rendered (hidden) when message string wins, so slotchange stays reliable", async () => {
    const el = await fixture<VuAlert>(html`<vu-alert message="String wins"></vu-alert>`);
    await elementUpdated(el);
    const slot = el.shadowRoot?.querySelector(
      '[part="body"] slot:not([name])',
    ) as HTMLSlotElement;
    expect(slot).toBeTruthy();
    expect(slot.hasAttribute("hidden")).toBe(true);
  });

  it("accepts all variant values", async () => {
    for (const v of ["solid", "soft", "outline", "ghost"] as const) {
      const el = await fixture<VuAlert>(html`<vu-alert variant=${v} message="V"></vu-alert>`);
      await elementUpdated(el);
      expect(el.variant).toBe(v);
      expect(el.getAttribute("variant")).toBe(v);
    }
  });

  it("accepts all five color values", async () => {
    for (const c of ["default", "primary", "success", "warning", "danger"] as const) {
      const el = await fixture<VuAlert>(html`<vu-alert color=${c} message="C"></vu-alert>`);
      await elementUpdated(el);
      expect(el.color).toBe(c);
      expect(el.getAttribute("color")).toBe(c);
    }
  });

  it("accepts all three size values", async () => {
    for (const s of ["sm", "md", "lg"] as const) {
      const el = await fixture<VuAlert>(html`<vu-alert size=${s} message="S"></vu-alert>`);
      await elementUpdated(el);
      expect(el.size).toBe(s);
      expect(el.getAttribute("size")).toBe(s);
    }
  });
});

describe("accessibility", () => {
  it("default soft alert passes axe", async () => {
    const el = await fixture(html`
      <vu-alert heading="Note" message="Something happened."></vu-alert>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("success solid alert passes axe", async () => {
    const el = await fixture(html`
      <vu-alert color="success" variant="solid" heading="Saved" message="Done."></vu-alert>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("warning alert with dismiss passes axe", async () => {
    const el = await fixture(html`
      <vu-alert color="warning" removable heading="Heads up" message="Check settings."></vu-alert>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
