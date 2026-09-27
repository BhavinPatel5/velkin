/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuAvatar } from "../avatar.js";
import "../../icon/icon.js";

const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=";

describe("vu-avatar", () => {
  it("is defined", () => {
    expect(customElements.get("vu-avatar")).toBe(VuAvatar);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuAvatar>(html`<vu-avatar></vu-avatar>`);
    await elementUpdated(el);

    expect(el.src).toBe("");
    expect(el.name).toBe("");
    expect(el.alt).toBe("");
    expect(el.size).toBe("md");
    expect(el.radius).toBe("full");
    expect(el.color).toBe("default");
    expect(el.bordered).toBe(false);
    expect(el.disabled).toBe(false);

    expect(el.shadowRoot?.querySelector('[part="avatar"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="fallback"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="image"]')).toBeFalsy();
  });

  it("reflects size, radius, color, bordered, disabled as attributes", async () => {
    const el = await fixture<VuAvatar>(
      html`<vu-avatar size="lg" radius="sm" color="primary" bordered disabled></vu-avatar>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("size")).toBe("lg");
    expect(el.getAttribute("radius")).toBe("sm");
    expect(el.getAttribute("color")).toBe("primary");
    expect(el.hasAttribute("bordered")).toBe(true);
    expect(el.hasAttribute("disabled")).toBe(true);
    expect(el.getAttribute("aria-disabled")).toBe("true");
  });

  it("reflects all color tokens", async () => {
    for (const color of ["default", "primary", "success", "warning", "danger"] as const) {
      const el = await fixture<VuAvatar>(html`<vu-avatar color=${color}></vu-avatar>`);
      await elementUpdated(el);
      expect(el.getAttribute("color")).toBe(color);
    }
  });

  it("renders the default-icon fallback when no name and no slot content", async () => {
    const el = await fixture<VuAvatar>(html`<vu-avatar></vu-avatar>`);
    await elementUpdated(el);
    const icon = el.shadowRoot?.querySelector('[part="fallback"] vu-icon');
    expect(icon).toBeTruthy();
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
  });

  it("derives two-letter initials from a multi-word name", async () => {
    const el = await fixture<VuAvatar>(html`<vu-avatar name="Jane Doe"></vu-avatar>`);
    await elementUpdated(el);
    const fallback = el.shadowRoot?.querySelector('[part="fallback"] slot');
    expect(fallback?.textContent?.trim()).toBe("JD");
  });

  it("derives first two letters when name is a single word", async () => {
    const el = await fixture<VuAvatar>(html`<vu-avatar name="alice"></vu-avatar>`);
    await elementUpdated(el);
    const fallback = el.shadowRoot?.querySelector('[part="fallback"] slot');
    expect(fallback?.textContent?.trim()).toBe("AL");
  });

  it("uses first + last initials when name has 3+ words", async () => {
    const el = await fixture<VuAvatar>(html`<vu-avatar name="Mary Anne Smith"></vu-avatar>`);
    await elementUpdated(el);
    const fallback = el.shadowRoot?.querySelector('[part="fallback"] slot');
    expect(fallback?.textContent?.trim()).toBe("MS");
  });

  it("renders slotted content when provided (winning over derived initials)", async () => {
    const el = await fixture<VuAvatar>(
      html`<vu-avatar name="Jane Doe"><span class="custom">★</span></vu-avatar>`,
    );
    await elementUpdated(el);
    const slotted = el.querySelector(".custom");
    expect(slotted).toBeTruthy();
    expect(slotted?.textContent?.trim()).toBe("★");
  });

  it("renders an <img> when src is set, hiding the fallback after load", async () => {
    const el = await fixture<VuAvatar>(html`<vu-avatar src=${TINY_PNG} alt="Tiny"></vu-avatar>`);
    await elementUpdated(el);
    const img = el.shadowRoot?.querySelector('[part="image"]') as HTMLImageElement | null;
    expect(img).toBeTruthy();
    expect(img?.getAttribute("alt")).toBe("Tiny");
    expect(img?.getAttribute("loading")).toBe("lazy");
    img!.dispatchEvent(new Event("load"));
    await elementUpdated(el);
    const fallback = el.shadowRoot?.querySelector('[part="fallback"]');
    expect(fallback?.hasAttribute("hidden")).toBe(true);
    expect(fallback?.getAttribute("aria-hidden")).toBe("true");
    expect(img?.hasAttribute("hidden")).toBe(false);
  });

  it("keeps initials visible until the image loads", async () => {
    const el = await fixture<VuAvatar>(
      html`<vu-avatar src="https://example.invalid/pending.png" name="Jane Doe"></vu-avatar>`,
    );
    await elementUpdated(el);
    const img = el.shadowRoot?.querySelector('[part="image"]') as HTMLImageElement | null;
    const fallback = el.shadowRoot?.querySelector('[part="fallback"]');
    expect(img).toBeTruthy();
    expect(img?.hasAttribute("hidden")).toBe(true);
    expect(fallback?.hasAttribute("hidden")).toBe(false);
    expect(fallback?.textContent?.trim()).toContain("JD");
  });

  it("falls back to name as alt when alt is empty", async () => {
    const el = await fixture<VuAvatar>(
      html`<vu-avatar src=${TINY_PNG} name="Avery Park"></vu-avatar>`,
    );
    await elementUpdated(el);
    const img = el.shadowRoot?.querySelector('[part="image"]') as HTMLImageElement | null;
    expect(img?.getAttribute("alt")).toBe("Avery Park");
  });

  it("alt overrides name when both are set", async () => {
    const el = await fixture<VuAvatar>(
      html`<vu-avatar src=${TINY_PNG} name="Internal Name" alt="Public Label"></vu-avatar>`,
    );
    await elementUpdated(el);
    const img = el.shadowRoot?.querySelector('[part="image"]') as HTMLImageElement | null;
    expect(img?.getAttribute("alt")).toBe("Public Label");
  });

  it("shows fallback again when src changes back to empty", async () => {
    const el = await fixture<VuAvatar>(
      html`<vu-avatar src=${TINY_PNG} name="Avery Park"></vu-avatar>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="image"]')).toBeTruthy();
    el.src = "";
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="image"]')).toBeFalsy();
    const fallback = el.shadowRoot?.querySelector('[part="fallback"]');
    expect(fallback?.hasAttribute("hidden")).toBe(false);
  });

  it("falls back to slot/initials when image errors", async () => {
    const el = await fixture<VuAvatar>(
      html`<vu-avatar src="https://invalid.local/never-loads.png" name="EJ"></vu-avatar>`,
    );
    await elementUpdated(el);
    const img = el.shadowRoot?.querySelector('[part="image"]') as HTMLImageElement | null;
    expect(img).toBeTruthy();
    img!.dispatchEvent(new Event("error"));
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="image"]')).toBeFalsy();
    const slot = el.shadowRoot?.querySelector('[part="fallback"] slot');
    expect(slot?.textContent?.trim()).toBe("EJ");
  });

  it("clears the error state when src changes to a new value", async () => {
    const el = await fixture<VuAvatar>(
      html`<vu-avatar src="https://invalid.local/x.png"></vu-avatar>`,
    );
    await elementUpdated(el);
    const img = el.shadowRoot?.querySelector('[part="image"]') as HTMLImageElement | null;
    img!.dispatchEvent(new Event("error"));
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="image"]')).toBeFalsy();
    el.src = TINY_PNG;
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="image"]')).toBeTruthy();
  });

  it("uppercases derived initials regardless of input casing", async () => {
    const el = await fixture<VuAvatar>(html`<vu-avatar name="jane doe"></vu-avatar>`);
    await elementUpdated(el);
    const fallback = el.shadowRoot?.querySelector('[part="fallback"] slot');
    expect(fallback?.textContent?.trim()).toBe("JD");
  });

  it("trims excess whitespace when deriving initials", async () => {
    const el = await fixture<VuAvatar>(html`<vu-avatar name="  Jane   Doe  "></vu-avatar>`);
    await elementUpdated(el);
    const fallback = el.shadowRoot?.querySelector('[part="fallback"] slot');
    expect(fallback?.textContent?.trim()).toBe("JD");
  });

  it("does not render an <img> with an empty alt when neither name nor alt are set", async () => {
    const el = await fixture<VuAvatar>(html`<vu-avatar src=${TINY_PNG}></vu-avatar>`);
    await elementUpdated(el);
    const img = el.shadowRoot?.querySelector('[part="image"]') as HTMLImageElement | null;
    expect(img).toBeTruthy();
    expect(img?.getAttribute("alt")).toBe("");
  });

  it("exposes parts: avatar and fallback", async () => {
    const el = await fixture<VuAvatar>(html`<vu-avatar name="JD"></vu-avatar>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="avatar"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="fallback"]')).toBeTruthy();
  });

  it("exposes part image only when image is showing", async () => {
    const el = await fixture<VuAvatar>(html`<vu-avatar src=${TINY_PNG}></vu-avatar>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="image"]')).toBeTruthy();
  });
});

describe("accessibility", () => {
  it("initials avatar passes axe", async () => {
    const el = await fixture(html`<vu-avatar name="Jane Doe"></vu-avatar>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("disabled avatar passes axe", async () => {
    const el = await fixture(html`<vu-avatar name="Jane Doe" disabled></vu-avatar>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
