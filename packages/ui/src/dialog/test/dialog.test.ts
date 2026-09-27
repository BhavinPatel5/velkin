/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect, vi } from "vitest";
import { VuDialog } from "../dialog.js";
import "../../icon/icon.js";
import "../../button/button.js";

describe("vu-dialog", () => {
  it("is defined", () => {
    expect(customElements.get("vu-dialog")).toBe(VuDialog);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuDialog>(html`<vu-dialog></vu-dialog>`);
    await elementUpdated(el);
    expect(el.open).toBe(false);
    expect(el.closable).toBe(false);
    expect(el.variant).toBe("elevated");
    expect(el.divider).toBe(false);
    expect(el.persistent).toBe(false);
    expect(el.closeLabel).toBe("");
    expect(el.ariaLabel).toBe("");
    expect(el.closeOnEsc).toBe(true);
    expect(el.tone).toBe("normal");
    expect(el.size).toBe("md");
    expect(el.radius).toBe("md");
  });

  it("reflects open state", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true}>
          <div slot="body">Content</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    expect(el.open).toBe(true);
    expect(el.getAttribute("open")).toBe("");
  });

  it("accepts closable", async () => {
    const el = await fixture<VuDialog>(html`<vu-dialog closable></vu-dialog>`);
    await elementUpdated(el);
    expect(el.closable).toBe(true);
  });

  it("accepts variant and divider", async () => {
    const el = await fixture<VuDialog>(
      html`<vu-dialog variant="soft" divider></vu-dialog>`,
    );
    await elementUpdated(el);
    expect(el.variant).toBe("soft");
    expect(el.divider).toBe(true);
  });

  it("accepts closeonesc and persistent", async () => {
    const el = await fixture<VuDialog>(
      html`<vu-dialog closeonesc persistent></vu-dialog>`,
    );
    await elementUpdated(el);
    expect(el.closeOnEsc).toBe(true);
    expect(el.persistent).toBe(true);
  });

  it("has dialog part when open", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true}>
          <div slot="body">Body</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    const dialog = el.shadowRoot?.querySelector('[part="dialog"]');
    expect(dialog).toBeTruthy();
  });

  it("has header part when open and header slotted", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true}>
          <div slot="header">Title</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    const header = el.shadowRoot?.querySelector('[part="header"]');
    expect(header).toBeTruthy();
    expect(header?.hasAttribute("hidden")).toBe(false);
  });

  it("keeps header part when header slot is empty so SSR can project late children", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true}>
          <div slot="body">Body</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    const header = el.shadowRoot?.querySelector('[part="header"]');
    expect(header).toBeTruthy();
    expect(header?.hasAttribute("hidden")).toBe(false);
  });

  it("has body part when open with body", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true}>
          <div slot="body">Content</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    const body = el.shadowRoot?.querySelector('[part="body"]');
    expect(body).toBeTruthy();
    expect(body?.hasAttribute("hidden")).toBe(false);
  });

  it("keeps body part when body slot is empty so SSR can project late children", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true}>
          <div slot="header">Title</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    const body = el.shadowRoot?.querySelector('[part="body"]');
    expect(body).toBeTruthy();
    expect(body?.hasAttribute("hidden")).toBe(false);
  });

  it("closable and open shows close-button part", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true} closable>
          <div slot="body">Body</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    const closeBtn = el.shadowRoot?.querySelector('[part="close-button"]');
    expect(closeBtn).toBeTruthy();
    expect(closeBtn?.getAttribute("aria-label")).toBe("Close");
  });

  it("uses closelabel for the dismiss control", async () => {
    const el = await fixture<VuDialog>(
      html`<vu-dialog .open=${true} closable closelabel="Dismiss"></vu-dialog>`,
    );
    await elementUpdated(el);
    const closeBtn = el.shadowRoot?.querySelector('[part="close-button"]');
    expect(closeBtn?.getAttribute("aria-label")).toBe("Dismiss");
  });

  it("does not show close-button when not closable", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true}>
          <div slot="body">Body</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    const closeBtn = el.shadowRoot?.querySelector('[part="close-button"]');
    expect(closeBtn).toBeFalsy();
  });

  it("has footer part when open with footer slotted", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true}>
          <div slot="body">Body</div>
          <div slot="footer">Actions</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    const footer = el.shadowRoot?.querySelector('[part="footer"]');
    expect(footer).toBeTruthy();
    expect(footer?.hasAttribute("hidden")).toBe(false);
  });

  it("collapses footer chrome when footer slot is empty", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true}>
          <div slot="body">Body</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    const footer = el.shadowRoot?.querySelector('[part="footer"]') as HTMLElement;
    const footerSlot = footer.querySelector("slot") as HTMLSlotElement;
    expect(footer).toBeTruthy();
    expect(footerSlot.assignedElements().length).toBe(0);
    expect(footer.hasAttribute("hidden")).toBe(false);
  });

  it("close button dispatches vu-close", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true} closable>
          <div slot="body">Body</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    let fired = false;
    el.addEventListener("vu-close", () => {
      fired = true;
    });
    const closeBtn = el.shadowRoot?.querySelector('[part="close-button"]') as HTMLElement;
    closeBtn?.click();
    expect(fired).toBe(true);
  });

  it("accepts Role C appearance props", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog
          variant="outline"
          tone="subtle"
          size="lg"
          radius="lg"
        ></vu-dialog>
      `,
    );
    await elementUpdated(el);
    expect(el.variant).toBe("outline");
    expect(el.tone).toBe("subtle");
    expect(el.size).toBe("lg");
    expect(el.radius).toBe("lg");
  });

  it("variant filled and ghost", async () => {
    const elFilled = await fixture<VuDialog>(
      html`<vu-dialog variant="filled"></vu-dialog>`,
    );
    await elementUpdated(elFilled);
    expect(elFilled.variant).toBe("filled");
    expect(elFilled.getAttribute("variant")).toBe("filled");
    const elGhost = await fixture<VuDialog>(
      html`<vu-dialog variant="ghost"></vu-dialog>`,
    );
    await elementUpdated(elGhost);
    expect(elGhost.variant).toBe("ghost");
    expect(elGhost.getAttribute("variant")).toBe("ghost");
  });

  it("reflects each Role C variant for CSS :host([variant]) hooks", async () => {
    const variants = ["elevated", "outline", "soft", "filled", "ghost"] as const;
    for (const variant of variants) {
      const el = await fixture<VuDialog>(html`<vu-dialog variant=${variant}></vu-dialog>`);
      await elementUpdated(el);
      expect(el.getAttribute("variant")).toBe(variant);
      el.remove();
    }
  });

  it("native dialog element exists when open", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true}>
          <div slot="body">Body</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    const dialog = el.shadowRoot?.querySelector("dialog");
    expect(dialog).toBeTruthy();
    expect(el.open).toBe(true);
  });

  it("renders slots when content provided", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true}>
          <div slot="header">Title</div>
          <div slot="body">Content</div>
          <div slot="footer">Actions</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    expect(el.querySelector('[slot="header"]')?.textContent?.trim()).toBe("Title");
    expect(el.querySelector('[slot="body"]')?.textContent?.trim()).toBe("Content");
    expect(el.querySelector('[slot="footer"]')?.textContent?.trim()).toBe("Actions");
  });

  it("show(), hide(), and toggle() control open", async () => {
    const el = await fixture<VuDialog>(html`<vu-dialog></vu-dialog>`);
    await elementUpdated(el);
    el.show();
    await elementUpdated(el);
    expect(el.open).toBe(true);
    el.toggle();
    await elementUpdated(el);
    expect(el.open).toBe(false);
    el.hide();
    await elementUpdated(el);
    expect(el.open).toBe(false);
  });

  it("emits vu-open and vu-afteropen when opened", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog>
          <div slot="body">Body</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    const events: string[] = [];
    el.addEventListener("vu-open", () => events.push("vu-open"));
    el.addEventListener("vu-afteropen", () => events.push("vu-afteropen"));
    el.show();
    await elementUpdated(el);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    expect(events).toContain("vu-open");
    expect(events).toContain("vu-afteropen");
  });

  it("emits vu-afterclose when closed", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true}>
          <div slot="body">Body</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    const events: string[] = [];
    el.addEventListener("vu-afterclose", () => events.push("vu-afterclose"));
    el.hide();
    await elementUpdated(el);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    expect(events).toContain("vu-afterclose");
  });

  it("backdrop pointerdown emits vu-close with reason backdrop", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true}>
          <div slot="body">Body</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    let reason = "";
    el.addEventListener("vu-close", ((e: CustomEvent<{ reason: string }>) => {
      reason = e.detail.reason;
    }) as EventListener);
    const dialog = el.shadowRoot?.querySelector("dialog") as HTMLDialogElement;
    dialog?.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: false }),
    );
    expect(reason).toBe("backdrop");
  });

  it("backdrop does not emit vu-close when persistent", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true} persistent>
          <div slot="body">Body</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    let fired = false;
    el.addEventListener("vu-close", () => {
      fired = true;
    });
    const dialog = el.shadowRoot?.querySelector("dialog") as HTMLDialogElement;
    dialog?.dispatchEvent(
      new MouseEvent("pointerdown", { bubbles: false }),
    );
    expect(fired).toBe(false);
  });

  it("focus() delegates to the native dialog", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true}>
          <div slot="body">Body</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    const dialog = el.shadowRoot?.querySelector("dialog") as HTMLDialogElement;
    const spy = vi.spyOn(dialog, "focus");
    el.focus();
    expect(spy).toHaveBeenCalled();
  });

  it("does not move initial focus to the close button when other controls exist", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true} closable>
          <div slot="body">Confirm this action.</div>
          <button slot="footer" type="button">Save</button>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    const save = el.querySelector('[slot="footer"]') as HTMLButtonElement;
    const close = el.shadowRoot?.querySelector('[part="close-button"]') as HTMLElement;
    expect(document.activeElement).toBe(save);
    expect(document.activeElement).not.toBe(close);
  });

  it("does not move initial focus to the close button when no other control exists", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true} closable arialabel="Notice">
          <div slot="body">Read-only notice.</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    const close = el.shadowRoot?.querySelector('[part="close-button"]') as HTMLElement;
    expect(document.activeElement).not.toBe(close);
    expect(el.shadowRoot?.activeElement).not.toBe(close);
  });

  it("exposes layout tokens as CSS variables", async () => {
    const el = await fixture<VuDialog>(html`<vu-dialog></vu-dialog>`);
    await elementUpdated(el);
    const cssText = el.shadowRoot?.querySelector("style")?.textContent ?? "";
    expect(cssText).toContain("--dialog-max-width");
    expect(cssText).toContain("--dialog-max-height");
    expect(cssText).toContain("--dialog-backdrop-color");
  });

  it("size presets only change padding tokens (not max-width)", async () => {
    const el = await fixture<VuDialog>(html`<vu-dialog size="md" open></vu-dialog>`);
    await elementUpdated(el);
    const cssText = el.shadowRoot?.querySelector("style")?.textContent ?? "";
    expect(cssText).toContain("--dialog-max-width: auto");
    expect(cssText).toContain("--dialog-max-height: auto");
    expect(cssText).not.toMatch(/:host\(\[size="md"\]\)[\s\S]*--dialog-max-width:\s*min\(/);
  });

  it("maxWidth applies only when set", async () => {
    const el = await fixture<VuDialog>(
      html`<vu-dialog size="sm" maxWidth="18rem" open></vu-dialog>`,
    );
    await elementUpdated(el);
    expect(el.style.getPropertyValue("--dialog-max-width").trim()).toBe("18rem");
  });

  it("maxHeight applies only when set", async () => {
    const el = await fixture<VuDialog>(
      html`<vu-dialog maxHeight="70vh" open></vu-dialog>`,
    );
    await elementUpdated(el);
    expect(el.style.getPropertyValue("--dialog-max-height").trim()).toBe("70vh");
  });

  it("vu-close is cancelable", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true} closable>
          <div slot="body">Body</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    el.addEventListener("vu-close", (e) => e.preventDefault());
    const closeBtn = el.shadowRoot?.querySelector('[part="close-button"]') as HTMLElement;
    closeBtn?.click();
    await elementUpdated(el);
    expect(el.open).toBe(true);
  });

  it("sets aria-describedby on body when header is absent", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true}>
          <p slot="body">Confirm delete?</p>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    const dialog = el.shadowRoot?.querySelector("dialog");
    const body = el.shadowRoot?.querySelector('[part="body"]');
    const describedBy = dialog?.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(body?.id).toBe(describedBy);
    expect(dialog?.hasAttribute("aria-labelledby")).toBe(false);
  });

  it("uses ariaLabel when header slot is empty", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true} arialabel="Confirm action">
          <p slot="body">Proceed?</p>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    const dialog = el.shadowRoot?.querySelector("dialog");
    expect(dialog?.getAttribute("aria-label")).toBe("Confirm action");
    expect(dialog?.hasAttribute("aria-labelledby")).toBe(false);
  });

  it("sets aria-labelledby when header is present", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true}>
          <h2 slot="header">Title</h2>
          <p slot="body">Body</p>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    const dialog = el.shadowRoot?.querySelector("dialog");
    const header = el.shadowRoot?.querySelector('[part="header"]');
    expect(dialog?.getAttribute("aria-labelledby")).toBe(header?.id);
    expect(dialog?.getAttribute("aria-describedby")).toBeTruthy();
  });

  it("updates header visibility and aria-labelledby when header is added at runtime", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true} arialabel="Confirm">
          <p slot="body">Proceed?</p>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    const dialog = () => el.shadowRoot?.querySelector("dialog") as HTMLDialogElement;
    const header = () => el.shadowRoot?.querySelector('[part="header"]') as HTMLElement;
    expect(header().hasAttribute("hidden")).toBe(false);
    expect(dialog().getAttribute("aria-label")).toBe("Confirm");
    expect(dialog().hasAttribute("aria-labelledby")).toBe(false);

    const slotHeader = document.createElement("h2");
    slotHeader.slot = "header";
    slotHeader.textContent = "Runtime title";
    el.insertBefore(slotHeader, el.firstChild);
    await elementUpdated(el);

    expect(header().hasAttribute("hidden")).toBe(false);
    expect(dialog().getAttribute("aria-labelledby")).toBe(header().id);
    expect(dialog().hasAttribute("aria-label")).toBe(false);
  });

  it("updates body visibility and aria-describedby when body is added at runtime", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true} arialabel="Confirm">
          <h2 slot="header">Title</h2>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    const dialog = () => el.shadowRoot?.querySelector("dialog") as HTMLDialogElement;
    const body = () => el.shadowRoot?.querySelector('[part="body"]') as HTMLElement;
    expect(body().hasAttribute("hidden")).toBe(false);
    expect(dialog().hasAttribute("aria-describedby")).toBe(false);

    const slotBody = document.createElement("p");
    slotBody.slot = "body";
    slotBody.textContent = "Runtime body";
    el.appendChild(slotBody);
    await elementUpdated(el);

    expect(body().hasAttribute("hidden")).toBe(false);
    expect(dialog().getAttribute("aria-describedby")).toBe(body().id);
  });

  it("styles body region for vertical scroll", async () => {
    const el = await fixture<VuDialog>(html`<vu-dialog></vu-dialog>`);
    await elementUpdated(el);
    const cssText = el.shadowRoot?.querySelector("style")?.textContent ?? "";
    expect(cssText).toContain("overflow-y: auto");
    expect(cssText).toContain("flex-direction: column");
  });

  it("vu-close carries reason detail and bubbles", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true} closable>
          <div slot="body">Body</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    let reason = "";
    let bubbles = false;
    let cancelable = false;
    el.addEventListener("vu-close", ((e: CustomEvent<{ reason: string }>) => {
      reason = e.detail.reason;
      bubbles = e.bubbles;
      cancelable = e.cancelable;
    }) as EventListener);
    const closeBtn = el.shadowRoot?.querySelector('[part="close-button"]') as HTMLElement;
    closeBtn?.click();
    expect(reason).toBe("close-button");
    expect(bubbles).toBe(true);
    expect(cancelable).toBe(true);
  });

  it("Escape dispatches vu-close when topmost by default", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true}>
          <div slot="body">Body</div>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    let fired = false;
    el.addEventListener("vu-close", () => {
      fired = true;
    });
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    expect(fired).toBe(true);
  });
});

describe("accessibility", () => {
  it("closed default", async () => {
    const el = await fixture<VuDialog>(html`<vu-dialog></vu-dialog>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("open with header, body, footer, and closable", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true} closable>
          <h2 slot="header">Title</h2>
          <p slot="body">Body copy</p>
          <vu-button slot="footer" label="OK"></vu-button>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("open with body slot only and ariaLabel", async () => {
    const el = await fixture<VuDialog>(
      html`
        <vu-dialog .open=${true} arialabel="Confirm">
          <p slot="body">Proceed?</p>
        </vu-dialog>
      `,
    );
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
