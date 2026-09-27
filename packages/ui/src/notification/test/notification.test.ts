/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3 N/A 4✓ 5✓ 6✓ 7✓ 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect, vi } from "vitest";
import { resetDismissibleStackForTests } from "../../../internals/utils/dismissible-stack.js";
import { notify } from "../internals/notification-api.js";
import { VuNotification } from "../notification.js";
import { VuNotificationProvider } from "../notification-provider.js";
import "../../icon/icon.js";
import "../../button/button.js";
import "../../spinner/spinner.js";

describe("vu-notification", () => {
  it("is defined", () => {
    expect(customElements.get("vu-notification")).toBe(VuNotification);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuNotification>(html`<vu-notification></vu-notification>`);
    await elementUpdated(el);
    expect(el.position).toBe("bottom-end");
    expect(el.variant).toBe("flat");
    expect(el.defaultDuration).toBe(4000);
    expect(el.maxVisible).toBe(5);
    expect(el.visibleToasts).toBe(3);
    expect(el.removable).toBe(true);
    expect(el.withProgress).toBe(false);
    expect(el.withPauseOnHover).toBe(false);
    expect(el.withPauseWhenHidden).toBe(true);
    expect(el.withSwipeDismiss).toBe(false);
    expect(el.paused).toBe(false);
    expect(el.notifications).toEqual([]);
  });

  it("queues a toast via addNotification and returns id", async () => {
    const el = await fixture<VuNotification>(html`<vu-notification></vu-notification>`);
    await elementUpdated(el);
    const id = el.addNotification({ title: "Saved", message: "Done.", color: "success" });
    await elementUpdated(el);
    expect(id).toBe(1);
    expect(el.notifications[0]?.title).toBe("Saved");
  });

  it("auto-dismisses after defaultDuration", async () => {
    vi.useFakeTimers();
    const el = await fixture<VuNotification>(
      html`<vu-notification .defaultDuration=${1000}></vu-notification>`,
    );
    await elementUpdated(el);
    el.addNotification({ title: "Timed" });
    await elementUpdated(el);
    await vi.advanceTimersByTimeAsync(1000);
    await elementUpdated(el);
    await vi.advanceTimersByTimeAsync(400);
    await elementUpdated(el);
    expect(el.notifications).toHaveLength(0);
    vi.useRealTimers();
  });

  it("keeps persistent toasts when duration is 0", async () => {
    vi.useFakeTimers();
    const el = await fixture<VuNotification>(html`<vu-notification></vu-notification>`);
    await elementUpdated(el);
    el.addNotification({ title: "Stay", duration: 0 });
    await elementUpdated(el);
    vi.advanceTimersByTime(10000);
    await elementUpdated(el);
    expect(el.notifications).toHaveLength(1);
    vi.useRealTimers();
  });

  it("renders variant on toast items", async () => {
    const el = await fixture<VuNotification>(html`<vu-notification></vu-notification>`);
    await elementUpdated(el);
    el.addNotification({ title: "Solid", color: "success", variant: "solid" });
    await elementUpdated(el);
    const item = el.shadowRoot?.querySelector('[part="item"]');
    expect(item?.getAttribute("variant")).toBe("solid");
    expect(item?.getAttribute("color")).toBe("success");
  });

  it("renders custom content via notify.custom()", async () => {
    const root = await fixture(html`<vu-notification-provider></vu-notification-provider>`);
    const provider = root as VuNotificationProvider;
    await elementUpdated(provider);
    const host = provider.shadowRoot!.querySelector("vu-notification") as VuNotification;
    notify.custom(() => html`<p data-testid="custom-body">Custom toast</p>`, { color: "primary" });
    await elementUpdated(host);
    expect(host.notifications[0]?.custom).toBe(true);
    expect(host.shadowRoot?.querySelector("[data-testid='custom-body']")?.textContent).toBe(
      "Custom toast",
    );
  });

  it("custom dismiss callback removes toast", async () => {
    const root = await fixture(html`<vu-notification-provider></vu-notification-provider>`);
    const provider = root as VuNotificationProvider;
    await elementUpdated(provider);
    const host = provider.shadowRoot!.querySelector("vu-notification") as VuNotification;
    notify.custom(
      ({ dismiss }) => html`
        <vu-button size="sm" data-testid="custom-dismiss" @click=${dismiss}>Close</vu-button>
      `,
    );
    await elementUpdated(host);
    host.shadowRoot?.querySelector<HTMLElement>("[data-testid='custom-dismiss']")?.click();
    await new Promise((resolve) => window.setTimeout(resolve, 400));
    await elementUpdated(host);
    expect(host.notifications).toHaveLength(0);
  });

  it("renders action button and calls onPress", async () => {
    const onPress = vi.fn();
    const el = await fixture<VuNotification>(html`<vu-notification></vu-notification>`);
    await elementUpdated(el);
    el.addNotification({
      title: "Invite",
      message: "Join the team",
      action: { label: "View", onPress },
    });
    await elementUpdated(el);
    el.shadowRoot?.querySelector<HTMLElement>('[part="action"]')?.click();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("calls onClose after removal", async () => {
    vi.useFakeTimers();
    try {
      const onClose = vi.fn();
      const el = await fixture<VuNotification>(html`<vu-notification></vu-notification>`);
      await elementUpdated(el);
      const id = el.addNotification({ title: "Bye", onClose });
      await elementUpdated(el);
      el.removeNotification(id);
      await vi.advanceTimersByTimeAsync(400);
      await elementUpdated(el);
      expect(onClose).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("trims oldest toast when maxVisible is exceeded", async () => {
    const el = await fixture<VuNotification>(
      html`<vu-notification .maxVisible=${2}></vu-notification>`,
    );
    await elementUpdated(el);
    el.addNotification({ title: "One" });
    el.addNotification({ title: "Two" });
    el.addNotification({ title: "Three" });
    await elementUpdated(el);
    expect(el.notifications).toHaveLength(2);
    expect(el.notifications.map((item) => item.title)).toEqual(["Two", "Three"]);
  });

  it("applies list enter motion on new toasts", async () => {
    const el = await fixture<VuNotification>(html`<vu-notification></vu-notification>`);
    await elementUpdated(el);
    el.addNotification({ title: "Hello" });
    await elementUpdated(el);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const item = el.shadowRoot?.querySelector('[part="item"]');
    expect(item?.hasAttribute("data-list-mounted")).toBe(false);
    expect(item?.classList.contains("is-list-mounted")).toBe(true);
    expect(item?.style.transform).toContain("translate3d");
  });

  it("keeps the middle layer offset when toasts are added one at a time", async () => {
    const stackLift = (style: CSSStyleDeclaration) => Number.parseFloat(style.insetBlockEnd || "0");

    const el = await fixture<VuNotification>(
      html`<vu-notification layout="stack" position="bottom-end"></vu-notification>`,
    );
    await elementUpdated(el);

    el.addNotification({ title: "One", message: "First toast body" });
    await elementUpdated(el);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    el.addNotification({ title: "Two", message: "Second toast body" });
    await elementUpdated(el);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    el.addNotification({ title: "Three", message: "Third toast body" });
    await elementUpdated(el);
    await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    await elementUpdated(el);

    const items = Array.from(el.shadowRoot?.querySelectorAll<HTMLElement>('[part="item"]') ?? []);
    expect(items).toHaveLength(3);
    expect(stackLift(items[0].style)).toBe(18);
    expect(stackLift(items[1].style)).toBe(30);
    expect(stackLift(items[2].style)).toBe(42);
    expect(items[1].style.transform).toContain("scale(0.95)");
  });

  it("offsets collapsed stack layers behind the front toast", async () => {
    const stackLift = (style: CSSStyleDeclaration) => Number.parseFloat(style.insetBlockEnd || "0");

    const el = await fixture<VuNotification>(
      html`<vu-notification layout="stack" position="bottom-end"></vu-notification>`,
    );
    await elementUpdated(el);
    el.addNotification({ title: "One", message: "First toast body" });
    el.addNotification({ title: "Two", message: "Second toast body" });
    el.addNotification({ title: "Three", message: "Third toast body" });
    await elementUpdated(el);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await elementUpdated(el);

    const items = Array.from(el.shadowRoot?.querySelectorAll<HTMLElement>('[part="item"]') ?? []);
    expect(items).toHaveLength(3);
    expect(stackLift(items[0].style)).toBe(18);
    expect(stackLift(items[1].style)).toBe(30);
    expect(stackLift(items[2].style)).toBe(42);
    expect(items[1].style.transform).toContain("scale(0.95)");
    expect(items[2].style.transform).toContain("scale(0.9)");
  });

  it("offsets collapsed top stack layers below the front toast", async () => {
    const el = await fixture<VuNotification>(
      html`<vu-notification layout="stack" position="top-end"></vu-notification>`,
    );
    await elementUpdated(el);
    el.addNotification({ title: "One", message: "First" });
    el.addNotification({ title: "Two", message: "Second" });
    el.addNotification({ title: "Three", message: "Third" });
    await elementUpdated(el);
    await new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
    await elementUpdated(el);

    const items = Array.from(el.shadowRoot?.querySelectorAll<HTMLElement>('[part="item"]') ?? []);
    const stackLift = (style: CSSStyleDeclaration) =>
      Number.parseFloat(style.insetBlockStart || style.insetBlockEnd);
    expect(items).toHaveLength(3);
    expect(stackLift(items[0].style)).toBe(18);
    expect(stackLift(items[1].style)).toBe(30);
    expect(stackLift(items[2].style)).toBe(42);
    expect(items[1].style.transform).toContain("scale(0.95)");
    expect(items[2].style.transform).toContain("scale(0.9)");
  });

  it("fans a fourth toast while keeping three collapsed peek layers", async () => {
    const el = await fixture<VuNotification>(
      html`<vu-notification layout="stack" position="bottom-end"></vu-notification>`,
    );
    await elementUpdated(el);
    const settle = () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
    for (const [title, message] of [
      ["One", "First"],
      ["Two", "Second"],
      ["Three", "Third"],
    ] as const) {
      el.addNotification({ title, message });
      await elementUpdated(el);
      await settle();
    }
    el.addNotification({ title: "Four", message: "Fourth" });
    await elementUpdated(el);
    await settle();
    await elementUpdated(el);

    const items = Array.from(el.shadowRoot?.querySelectorAll<HTMLElement>('[part="item"]') ?? []);
    expect(items).toHaveLength(4);
    expect(items[0].classList.contains("is-front")).toBe(true);
    expect(items[1].classList.contains("is-hidden")).toBe(false);
    expect(items[2].classList.contains("is-hidden")).toBe(false);
    expect(items[3].classList.contains("is-hidden")).toBe(false);
    const stackLift = (style: CSSStyleDeclaration) =>
      Number.parseFloat(style.insetBlockEnd || style.insetBlockStart);
    expect(stackLift(items[1].style)).toBe(30);
    expect(stackLift(items[2].style)).toBe(42);
    expect(items[3].style.opacity).toBe("0");
    expect(items[3].classList.contains("is-overflow-fading")).toBe(true);
    expect(items[3].style.visibility).toBe("visible");
    expect(items[3].style.transition).toContain("inset-block-end");
  });

  it("applies stack fan transforms in stack layout", async () => {
    const el = await fixture<VuNotification>(
      html`<vu-notification layout="stack"></vu-notification>`,
    );
    await elementUpdated(el);
    el.addNotification({ title: "One" });
    el.addNotification({ title: "Two" });
    el.addNotification({ title: "Three" });
    await elementUpdated(el);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await elementUpdated(el);
    const items = el.shadowRoot?.querySelectorAll('[part="item"]');
    expect(items?.length).toBe(3);
    expect(items?.[0]?.classList.contains("is-front")).toBe(true);
    expect(items?.[0]?.style.transform).toContain("translate3d");
    expect(items?.[1]?.style.transform).toContain("scale(0.95)");
  });

  it("anchors each position on the matching viewport edge", async () => {
    const cases = [
      ["top-start", "insetBlockStart", "insetInlineStart"],
      ["top-end", "insetBlockStart", "insetInlineEnd"],
      ["bottom-start", "insetBlockEnd", "insetInlineStart"],
      ["bottom-end", "insetBlockEnd", "insetInlineEnd"],
    ] as const;

    for (const [position, blockEdge, inlineEdge] of cases) {
      const el = await fixture<VuNotification>(
        html`<vu-notification position=${position}></vu-notification>`,
      );
      await elementUpdated(el);
      const anchor = el.shadowRoot?.querySelector('[part="anchor"]') as HTMLElement;
      expect(anchor.style[blockEdge]).not.toBe("unset");
      expect(anchor.style[blockEdge]).not.toBe("");
      expect(anchor.style[inlineEdge]).not.toBe("unset");
      expect(anchor.style[inlineEdge]).not.toBe("");
    }
  });

  describe("accessibility", () => {
    it("default list layout", async () => {
      const el = await fixture<VuNotification>(html`<vu-notification></vu-notification>`);
      await elementUpdated(el);
      el.addNotification({ title: "Hello", message: "World", color: "primary" });
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("stack layout", async () => {
      const el = await fixture<VuNotification>(
        html`<vu-notification layout="stack"></vu-notification>`,
      );
      await elementUpdated(el);
      el.addNotification({ title: "Stack", message: "Peek layers", color: "success" });
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("soft variant", async () => {
      const el = await fixture<VuNotification>(html`<vu-notification></vu-notification>`);
      await elementUpdated(el);
      el.addNotification({ title: "Soft", variant: "soft", color: "primary" });
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("danger toasts use assertive aria-live", async () => {
      const el = await fixture<VuNotification>(html`<vu-notification></vu-notification>`);
      await elementUpdated(el);
      el.addNotification({ title: "Error", color: "danger" });
      await elementUpdated(el);
      const item = el.shadowRoot?.querySelector('[part="item"]');
      expect(item?.getAttribute("aria-live")).toBe("assertive");
    });

    it("default in RTL document context", async () => {
      const wrap = await fixture(html`
        <div dir="rtl" lang="en">
          <vu-notification></vu-notification>
        </div>
      `);
      await elementUpdated(wrap);
      const el = wrap.querySelector("vu-notification") as VuNotification;
      el.addNotification({ title: "RTL", message: "Toast copy" });
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });
  });

  it("pauses auto-dismiss while the list is hovered", async () => {
    vi.useFakeTimers();
    try {
      const el = await fixture<VuNotification>(
        html`<vu-notification withpauseonhover .defaultDuration=${1000}></vu-notification>`,
      );
      await elementUpdated(el);
      el.addNotification({ title: "Hover me" });
      await elementUpdated(el);
      const list = el.shadowRoot?.querySelector('[part="list"]') as HTMLElement;
      list.dispatchEvent(new Event("pointerenter", { bubbles: true }));
      await elementUpdated(el);
      expect(el.paused).toBe(true);
      await vi.advanceTimersByTimeAsync(2000);
      await elementUpdated(el);
      expect(el.notifications).toHaveLength(1);
      list.dispatchEvent(new Event("pointerleave", { bubbles: true }));
      await elementUpdated(el);
      expect(el.paused).toBe(false);
      await vi.advanceTimersByTimeAsync(1000);
      await elementUpdated(el);
      await vi.advanceTimersByTimeAsync(400);
      await elementUpdated(el);
      expect(el.notifications).toHaveLength(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it("applies itemClass and itemStyle on preset toasts", async () => {
    const el = await fixture<VuNotification>(html`<vu-notification></vu-notification>`);
    await elementUpdated(el);
    el.addNotification({
      title: "Styled",
      itemClass: "demo-toast",
      itemStyle: { outline: "2px solid hotpink" },
    });
    await elementUpdated(el);
    const item = el.shadowRoot?.querySelector('[part="item"]') as HTMLElement;
    expect(item.classList.contains("demo-toast")).toBe(true);
    expect(item.getAttribute("style")).toContain("hotpink");
  });

  it("syncs visibleToasts to the stack fan limit token", async () => {
    const el = await fixture<VuNotification>(
      html`<vu-notification layout="stack" .visibleToasts=${2}></vu-notification>`,
    );
    await elementUpdated(el);
    expect(el.style.getPropertyValue("--nt-stack-fan-limit").trim()).toBe("2");
  });

  it("pauses auto-dismiss while the document is hidden", async () => {
    vi.useFakeTimers();
    try {
      const el = await fixture<VuNotification>(
        html`<vu-notification
          .defaultDuration=${1000}
          .withPauseWhenHidden=${true}
        ></vu-notification>`,
      );
      await elementUpdated(el);
      el.addNotification({ title: "Hidden pause" });
      await elementUpdated(el);
      expect(el.withPauseWhenHidden).toBe(true);
      Object.defineProperty(Document.prototype, "hidden", {
        configurable: true,
        get: () => true,
      });
      (el as unknown as { _onVisibilityChange: () => void })._onVisibilityChange();
      await elementUpdated(el);
      await vi.advanceTimersByTimeAsync(2000);
      await elementUpdated(el);
      expect(el.notifications).toHaveLength(1);
      Object.defineProperty(Document.prototype, "hidden", {
        configurable: true,
        get: () => false,
      });
      (el as unknown as { _onVisibilityChange: () => void })._onVisibilityChange();
      await elementUpdated(el);
      await vi.advanceTimersByTimeAsync(1000);
      await elementUpdated(el);
      await vi.advanceTimersByTimeAsync(400);
      await elementUpdated(el);
      expect(el.notifications).toHaveLength(0);
    } finally {
      Object.defineProperty(Document.prototype, "hidden", {
        configurable: true,
        get: () => false,
      });
      vi.useRealTimers();
    }
  });

  it("renders dismiss progress bar when withProgress is enabled", async () => {
    const el = await fixture<VuNotification>(
      html`<vu-notification withprogress></vu-notification>`,
    );
    await elementUpdated(el);
    el.addNotification({ title: "Timed", duration: 5000 });
    await elementUpdated(el);
    const progress = el.shadowRoot?.querySelector('[part="progress"]');
    expect(progress).not.toBeNull();
    expect(progress?.getAttribute("style")).toContain("--nt-item-duration-ms");
  });

  it("omits progress bar by default", async () => {
    const el = await fixture<VuNotification>(html`<vu-notification></vu-notification>`);
    await elementUpdated(el);
    el.addNotification({ title: "Timed", duration: 5000 });
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="progress"]')).toBeNull();
  });

  it("shows overflow count in stack layout", async () => {
    const el = await fixture<VuNotification>(
      html`<vu-notification layout="stack" ?withoverflowcount=${true}></vu-notification>`,
    );
    await elementUpdated(el);
    for (let i = 1; i <= 4; i += 1) {
      el.addNotification({ title: `Toast ${i}` });
      await elementUpdated(el);
    }
    const overflow = el.shadowRoot?.querySelector('[part="overflow"]');
    expect(overflow?.textContent).toContain("+1");
  });

  it("renders leading image and text alignment", async () => {
    const el = await fixture<VuNotification>(html`<vu-notification></vu-notification>`);
    await elementUpdated(el);
    el.addNotification({
      title: "Photo",
      message: "Centered copy",
      image: "https://example.com/avatar.png",
      imageAlt: "Avatar",
      textAlign: "center",
    });
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="media"]')?.getAttribute("src")).toContain(
      "avatar.png",
    );
    expect(el.shadowRoot?.querySelector('[part="message"]')?.getAttribute("style")).toContain(
      "center",
    );
  });

  it("dismisses the front toast on Escape via the dismissible stack", async () => {
    resetDismissibleStackForTests();
    const el = await fixture<VuNotification>(html`<vu-notification></vu-notification>`);
    await elementUpdated(el);
    el.addNotification({ title: "One" });
    el.addNotification({ title: "Two" });
    await elementUpdated(el);
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }),
    );
    await elementUpdated(el);
    expect(el.notifications.filter((item) => !item.removing)).toHaveLength(1);
    expect(el.notifications.find((item) => !item.removing)?.title).toBe("One");
    resetDismissibleStackForTests();
  });
});

describe("vu-notification-provider", () => {
  it("is defined", () => {
    expect(customElements.get("vu-notification-provider")).toBe(VuNotificationProvider);
  });

  async function hostFrom(root: HTMLElement): Promise<VuNotification> {
    const provider = (
      root.tagName.toLowerCase() === "vu-notification-provider"
        ? root
        : root.querySelector("vu-notification-provider")
    ) as VuNotificationProvider;
    await elementUpdated(provider);
    const host = provider.shadowRoot!.querySelector("vu-notification") as VuNotification;
    await elementUpdated(host);
    return host;
  }

  it("exposes global notify() after connect", async () => {
    const root = await fixture(html`
      <vu-notification-provider>
        <main>App</main>
      </vu-notification-provider>
    `);
    const host = await hostFrom(root);
    const id = notify.success("Saved", { message: "All good." });
    await elementUpdated(host);
    expect(id).toBe(1);
    expect(host.notifications[0]?.color).toBe("success");
    expect(host.shadowRoot?.querySelector('[part="item"]')).not.toBeNull();
  });

  it("supports notify.promise()", async () => {
    const root = await fixture(html`<vu-notification-provider></vu-notification-provider>`);
    const host = await hostFrom(root);
    const task = vi.fn().mockResolvedValue("ok");
    await notify.promise(task, {
      loading: "Saving",
      success: "Saved",
      error: "Failed",
    });
    await elementUpdated(host);
    expect(task).toHaveBeenCalled();
    expect(host.notifications[0]?.title).toBe("Saved");
    expect(host.notifications[0]?.color).toBe("success");
  });

  it("notify.clear() dismisses all toasts", async () => {
    const root = await fixture(html`<vu-notification-provider></vu-notification-provider>`);
    const host = await hostFrom(root);
    notify("One");
    notify("Two");
    await elementUpdated(host);
    notify.clear();
    await new Promise((resolve) => window.setTimeout(resolve, 600));
    await elementUpdated(host);
    expect(host.notifications).toHaveLength(0);
  });

  it("routes notify() via toasterId to a named provider", async () => {
    const root = await fixture(html`
      <div>
        <vu-notification-provider
          providerid="alerts"
          position="top-center"
        ></vu-notification-provider>
        <vu-notification-provider></vu-notification-provider>
      </div>
    `);
    await elementUpdated(root);
    const providers = root.querySelectorAll<VuNotificationProvider>("vu-notification-provider");
    const alertsHost = providers[0]!.shadowRoot!.querySelector("vu-notification") as VuNotification;
    const defaultHost = providers[1]!.shadowRoot!.querySelector(
      "vu-notification",
    ) as VuNotification;

    notify.success("Default");
    notify.warning("Alert", { toasterId: "alerts" });
    await elementUpdated(defaultHost);
    await elementUpdated(alertsHost);

    expect(defaultHost.notifications).toHaveLength(1);
    expect(defaultHost.notifications[0]?.color).toBe("success");
    expect(alertsHost.notifications).toHaveLength(1);
    expect(alertsHost.notifications[0]?.color).toBe("warning");
  });

  it("notify.update() patches an existing toast", async () => {
    const root = await fixture(html`<vu-notification-provider></vu-notification-provider>`);
    const host = await hostFrom(root);
    const id = notify.primary("Loading");
    await elementUpdated(host);
    notify.update(id, { title: "Done", color: "success", message: "Updated copy." });
    await elementUpdated(host);
    expect(host.notifications[0]?.title).toBe("Done");
    expect(host.notifications[0]?.color).toBe("success");
    expect(host.shadowRoot?.querySelector('[part="message"]')?.textContent).toContain(
      "Updated copy.",
    );
  });
});
