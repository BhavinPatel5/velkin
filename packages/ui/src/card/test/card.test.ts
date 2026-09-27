/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuCard } from "../card.js";

/** Lit adopted styles in jsdom — getComputedStyle often returns empty on shadow parts. */
function cardCss(el: VuCard): string {
  return Array.from(el.shadowRoot?.querySelectorAll("style") ?? [])
    .map((n) => n.textContent ?? "")
    .join("\n");
}

describe("vu-card", () => {
  it("is defined", () => {
    expect(customElements.get("vu-card")).toBe(VuCard);
  });

  it("renders defaults — elevated/default/md, no dividers, no role, body slot", async () => {
    const el = await fixture<VuCard>(html`<vu-card>Hi</vu-card>`);
    await elementUpdated(el);

    expect(el.variant).toBe("elevated");
    expect(el.tone).toBe("normal");
    expect(el.size).toBe("md");
    expect(el.radius).toBe("md");
    expect(el.orientation).toBe("vertical");
    expect(el.divider).toBe("none");
    expect(el.flush).toBe(false);
    expect(el.interactive).toBe(false);
    expect(el.selected).toBe(false);
    expect(el.disabled).toBe(false);

    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
    expect(base).toBeTruthy();
    expect(base.getAttribute("role")).toBe(null);
    expect(base.hasAttribute("tabindex")).toBe(false);
  });

  it("projects header slot content added at runtime", async () => {
    const el = await fixture<VuCard>(html`<vu-card>Body only</vu-card>`);
    await elementUpdated(el);
    const headerSlot = el.shadowRoot?.querySelector('slot[name="header"]') as HTMLSlotElement;
    expect(headerSlot.assignedElements().length).toBe(0);

    const h = document.createElement("h3");
    h.slot = "header";
    h.textContent = "Title";
    el.appendChild(h);
    await elementUpdated(el);
    expect(headerSlot.assignedElements().length).toBe(1);
  });

  it("reads slot presence from light DOM on first paint (no extra update cycle)", async () => {
    /* Presence comes from hasLightChildrenInSlot during render — [hidden] should
       be correct on the very first frame when slotted children are in markup. */
    const el = await fixture<VuCard>(html`
      <vu-card>
        <h3 slot="header">Title</h3>
        <p>Body</p>
        <div slot="footer">Footer</div>
      </vu-card>
    `);
    /* IMPORTANT: do not call elementUpdated here — we want the FIRST render. */
    const header = el.shadowRoot?.querySelector('[part="header"]') as HTMLElement;
    const body = el.shadowRoot?.querySelector('[part="body"]') as HTMLElement;
    const footer = el.shadowRoot?.querySelector('[part="footer"]') as HTMLElement;
    expect(header.hasAttribute("hidden")).toBe(false);
    expect(body.hasAttribute("hidden")).toBe(false);
    expect(footer.hasAttribute("hidden")).toBe(false);
  });

  it("interactive=true → role=button, tabindex=0, aria-pressed=false (when not selected)", async () => {
    const el = await fixture<VuCard>(html`<vu-card interactive label="Open">Body</vu-card>`);
    await elementUpdated(el);
    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
    expect(base.getAttribute("role")).toBe("button");
    expect(base.getAttribute("tabindex")).toBe("0");
    expect(base.getAttribute("aria-pressed")).toBe("false");
    expect(base.getAttribute("aria-label")).toBe("Open");
  });

  it("interactive + disabled → tabindex=-1, aria-disabled=true, click is suppressed", async () => {
    const el = await fixture<VuCard>(html`<vu-card interactive disabled>Body</vu-card>`);
    await elementUpdated(el);
    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
    expect(base.getAttribute("tabindex")).toBe("-1");
    expect(base.getAttribute("aria-disabled")).toBe("true");

    let activated = 0;
    el.addEventListener("vu-activate", () => activated++);
    base.click();
    await elementUpdated(el);
    expect(activated).toBe(0);
  });

  it("interactive click dispatches vu-activate with the original MouseEvent in detail.source", async () => {
    const el = await fixture<VuCard>(html`<vu-card interactive>Body</vu-card>`);
    await elementUpdated(el);
    let detail: { source: Event } | null = null;
    el.addEventListener("vu-activate", (e) => {
      detail = (e as CustomEvent).detail;
    });
    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
    base.click();
    await elementUpdated(el);
    expect(detail).not.toBeNull();
    expect(detail!.source).toBeInstanceOf(MouseEvent);
  });

  it("interactive Enter / Space dispatches vu-activate; other keys are ignored", async () => {
    const el = await fixture<VuCard>(html`<vu-card interactive>Body</vu-card>`);
    await elementUpdated(el);
    const events: KeyboardEvent[] = [];
    el.addEventListener("vu-activate", (e) => {
      events.push((e as CustomEvent).detail.source as KeyboardEvent);
    });
    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;

    base.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    base.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    base.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    base.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
    await elementUpdated(el);

    expect(events.map((e) => e.key)).toEqual(["Enter", " "]);
  });

  it("non-interactive cards never dispatch vu-activate (clicks are inert)", async () => {
    const el = await fixture<VuCard>(html`<vu-card>Body</vu-card>`);
    await elementUpdated(el);
    let fired = 0;
    el.addEventListener("vu-activate", () => fired++);
    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
    base.click();
    base.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await elementUpdated(el);
    expect(fired).toBe(0);
  });

  it("non-interactive cards let slotted control clicks pass through untouched", async () => {
    const el = await fixture<VuCard>(html`
      <vu-card><input type="radio" value="a" /></vu-card>
    `);
    await elementUpdated(el);
    const radio = el.querySelector("input")!;
    let seenOutside = false;
    let prevented = false;
    document.body.addEventListener(
      "click",
      (e) => {
        seenOutside = true;
        prevented = e.defaultPrevented;
      },
      { once: true },
    );
    radio.click();
    expect(seenOutside).toBe(true);
    expect(prevented).toBe(false);
    expect(radio.checked).toBe(true);
  });

  it("disabled interactive cards do not cancel slotted control clicks", async () => {
    const el = await fixture<VuCard>(html`
      <vu-card interactive disabled><input type="checkbox" /></vu-card>
    `);
    await elementUpdated(el);
    let fired = 0;
    el.addEventListener("vu-activate", () => fired++);
    const box = el.querySelector("input")!;
    box.click();
    expect(box.checked).toBe(true);
    expect(fired).toBe(0);
  });

  it("selected + interactive → aria-pressed=true (toggle-card semantic)", async () => {
    const el = await fixture<VuCard>(html`<vu-card interactive selected>Body</vu-card>`);
    await elementUpdated(el);
    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
    expect(base.getAttribute("aria-pressed")).toBe("true");
  });

  it("selected without interactive is purely visual — no aria-pressed leaks", async () => {
    const el = await fixture<VuCard>(html`<vu-card selected>Body</vu-card>`);
    await elementUpdated(el);
    const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
    expect(base.hasAttribute("aria-pressed")).toBe(false);
  });

  it("variant + tone + size + radius + orientation reflect to host attributes for CSS targeting", async () => {
    const el = await fixture<VuCard>(html`
      <vu-card
        variant="filled"
        tone="strong"
        size="lg"
        radius="lg"
        orientation="horizontal"
      ></vu-card>
    `);
    await elementUpdated(el);
    expect(el.getAttribute("variant")).toBe("filled");
    expect(el.getAttribute("tone")).toBe("strong");
    expect(el.getAttribute("size")).toBe("lg");
    expect(el.getAttribute("radius")).toBe("lg");
    expect(el.getAttribute("orientation")).toBe("horizontal");
  });

  it("supports every documented variant (smoke test for the variant axis)", async () => {
    const variants = ["elevated", "outline", "soft", "filled", "ghost", "glass", "gradient"] as const;
    for (const v of variants) {
      const el = await fixture<VuCard>(html`<vu-card variant=${v}>x</vu-card>`);
      await elementUpdated(el);
      expect(el.getAttribute("variant")).toBe(v);
      const base = el.shadowRoot?.querySelector('[part="base"]') as HTMLElement;
      expect(base).toBeTruthy();
    }
  });

  it("divider defaults to 'none'", async () => {
    const el = await fixture<VuCard>(html`<vu-card><p>Body</p></vu-card>`);
    await elementUpdated(el);
    expect(el.divider).toBe("none");
    expect(el.getAttribute("divider")).toBe("none");
  });

  it("divider modes are reflected and render vu-divider between sections", async () => {
    const footer = await fixture<VuCard>(html`
      <vu-card divider="footer"><p>B</p><span slot="footer">F</span></vu-card>
    `);
    await elementUpdated(footer);
    expect(footer.getAttribute("divider")).toBe("footer");
    expect(
      footer.shadowRoot?.querySelectorAll('[part="section-divider"]:not([hidden])').length,
    ).toBe(1);

    const header = await fixture<VuCard>(html`
      <vu-card divider="header"><h3 slot="header">T</h3><p>B</p></vu-card>
    `);
    await elementUpdated(header);
    expect(header.getAttribute("divider")).toBe("header");
    expect(
      header.shadowRoot?.querySelectorAll('[part="section-divider"]:not([hidden])').length,
    ).toBe(1);

    const all = await fixture<VuCard>(html`
      <vu-card divider="all"><h3 slot="header">T</h3><p>B</p><span slot="footer">F</span></vu-card>
    `);
    await elementUpdated(all);
    expect(all.getAttribute("divider")).toBe("all");
    expect(
      all.shadowRoot?.querySelectorAll('[part="section-divider"]:not([hidden])').length,
    ).toBe(2);
  });

  it("skips section dividers when adjacent sections are empty", async () => {
    const el = await fixture<VuCard>(html`<vu-card divider="all"><p>Body only</p></vu-card>`);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelectorAll("vu-divider:not([hidden])").length).toBe(0);
  });

  it("renders media-divider for header/all when media and content are present", async () => {
    const el = await fixture<VuCard>(html`
      <vu-card divider="header">
        <img slot="media" alt="" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" />
        <p>Body</p>
      </vu-card>
    `);
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[part="media-divider"]:not([hidden])')).toBeTruthy();
  });
  it("flush=true zeros shell padding via --card-pad", async () => {
    const el = await fixture<VuCard>(html`<vu-card flush><p>B</p></vu-card>`);
    await elementUpdated(el);
    expect(el.flush).toBe(true);
    expect(cardCss(el)).toContain(":host([flush])");
    expect(cardCss(el)).toMatch(/--card-pad:\s*0/);
  });

  it("content shell uses single inset + gap (stylesheet contract)", async () => {
    const css = cardCss(await fixture<VuCard>(html`<vu-card></vu-card>`));
    expect(css).toContain('[part="content"]');
    expect(css).toContain("padding: var(--card-pad)");
    expect(css).toContain("gap: var(--card-gap)");
    expect(css).toContain('[part="body"]');
    expect(css).toMatch(/\[part="body"\][^{]*\{[^}]*padding:\s*var\(--card-pad-body,\s*0\)/);
  });

  it("footer and header flex alignment are defined in CSS", async () => {
    const css = cardCss(await fixture<VuCard>(html`<vu-card></vu-card>`));
    expect(css).toContain("justify-content: flex-end");
    expect(css).toContain("justify-content: space-between");
  });

  it("media-actions slot is hidden by default and shows when populated", async () => {
    const el = await fixture<VuCard>(html`
      <vu-card>
        <img slot="media" src="" alt="" />
        <p>Body</p>
      </vu-card>
    `);
    await elementUpdated(el);
    const overlay = el.shadowRoot?.querySelector('[part="media-actions"]') as HTMLElement;
    const overlaySlot = overlay.querySelector("slot") as HTMLSlotElement;
    expect(overlaySlot.assignedElements().length).toBe(0);

    const fav = document.createElement("button");
    fav.slot = "media-actions";
    fav.textContent = "★";
    el.appendChild(fav);
    await elementUpdated(el);
    expect(overlaySlot.assignedElements().length).toBe(1);
  });

  it("media-actions overlay uses absolute positioning in CSS", async () => {
    const css = cardCss(
      await fixture<VuCard>(html`
        <vu-card><img slot="media" src="" alt="" /><p>Body</p></vu-card>
      `),
    );
    expect(css).toContain('[part="media-actions"]');
    expect(css).toMatch(/\[part="media-actions"\][^{]*\{[^}]*position:\s*absolute/);
  });

  it("orientation='horizontal' is reflected and switches base flex axis", async () => {
    const el = await fixture<VuCard>(html`
      <vu-card orientation="horizontal"><img slot="media" src="" alt="" /><p>Body</p></vu-card>
    `);
    await elementUpdated(el);
    expect(el.orientation).toBe("horizontal");
    expect(cardCss(el)).toContain(':host([orientation="horizontal"])');
    expect(cardCss(el)).toContain("flex-direction: row");
  });

  it("focus() is a no-op when not interactive and works when interactive", async () => {
    const inert = await fixture<VuCard>(html`<vu-card>x</vu-card>`);
    await elementUpdated(inert);
    inert.focus();
    expect(document.activeElement).not.toBe(inert);

    const live = await fixture<VuCard>(html`<vu-card interactive>x</vu-card>`);
    await elementUpdated(live);
    live.focus();
    /* The host receives focus because we set tabindex on [part='base'] within
       its shadow root. Activation is what matters here, not focus path. */
    expect(document.activeElement).toBe(live);
  });
});

describe("accessibility", () => {
  it("default elevated card passes axe", async () => {
    const el = await fixture(html`
      <vu-card>
        <h3 slot="header">Title</h3>
        <p>Body copy.</p>
      </vu-card>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("interactive selected card passes axe", async () => {
    const el = await fixture(html`
      <vu-card interactive selected label="Pro plan">
        <h3 slot="header">Pro</h3>
        <p>$29 / mo</p>
      </vu-card>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("outline card with tone strong passes axe", async () => {
    const el = await fixture(html`
      <vu-card variant="outline" tone="strong" divider="footer">
        <p>Quota warning.</p>
      </vu-card>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });

  it("disabled interactive card passes axe", async () => {
    const el = await fixture(html`
      <vu-card interactive disabled label="Unavailable plan">
        <h3 slot="header">Pro</h3>
        <p>$29 / mo</p>
      </vu-card>
    `);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
