/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5 N/A 6 N/A 7 N/A 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect } from "vitest";
import { VuAppbar } from "../appbar";

describe("vu-appbar", () => {
  it("is defined", () => {
    expect(customElements.get("vu-appbar")).toBe(VuAppbar);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuAppbar>(html`<vu-appbar></vu-appbar>`);
    await elementUpdated(el);

    expect(el.variant).toBe("flat");
    expect(el.tone).toBe("normal");
    expect(el.size).toBe("md");
    expect(el.placement).toBe("top");
    expect(el.sticky).toBe(false);
    expect(el.condense).toBe(false);
    expect(el.autohide).toBe(false);

    expect(el.shadowRoot?.querySelector('[part="bar"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="container"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="start"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="body"]')).toBeTruthy();
    expect(el.shadowRoot?.querySelector('[part="end"]')).toBeTruthy();
  });

  it("structural: zones live inside [part='container'], which lives inside [part='bar']", async () => {
    const el = await fixture<VuAppbar>(html`<vu-appbar>X</vu-appbar>`);
    await elementUpdated(el);
    const bar = el.shadowRoot?.querySelector('[part="bar"]') as HTMLElement;
    const container = bar.querySelector('[part="container"]') as HTMLElement;
    expect(container).toBeTruthy();
    expect(container.querySelector('[part="start"]')).toBeTruthy();
    expect(container.querySelector('[part="body"]')).toBeTruthy();
    expect(container.querySelector('[part="end"]')).toBeTruthy();
  });

  it("reflects variant, size, placement, sticky, condense, autohide as host attributes", async () => {
    const el = await fixture<VuAppbar>(
      html`<vu-appbar
        variant="elevated"
        size="lg"
        placement="bottom"
        sticky
        condense
        autohide
      ></vu-appbar>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("variant")).toBe("elevated");
    expect(el.getAttribute("size")).toBe("lg");
    expect(el.getAttribute("placement")).toBe("bottom");
    expect(el.hasAttribute("sticky")).toBe(true);
    expect(el.hasAttribute("condense")).toBe(true);
    expect(el.hasAttribute("autohide")).toBe(true);
  });

  it("accepts all three variant values", async () => {
    for (const v of ["flat", "outline", "elevated"] as const) {
      const el = await fixture<VuAppbar>(html`<vu-appbar variant=${v}></vu-appbar>`);
      await elementUpdated(el);
      expect(el.variant).toBe(v);
      expect(el.getAttribute("variant")).toBe(v);
    }
  });

  it("accepts all three size values", async () => {
    for (const s of ["sm", "md", "lg"] as const) {
      const el = await fixture<VuAppbar>(html`<vu-appbar size=${s}></vu-appbar>`);
      await elementUpdated(el);
      expect(el.size).toBe(s);
      expect(el.getAttribute("size")).toBe(s);
    }
  });

  it("accepts both placement values", async () => {
    for (const p of ["top", "bottom"] as const) {
      const el = await fixture<VuAppbar>(html`<vu-appbar placement=${p}></vu-appbar>`);
      await elementUpdated(el);
      expect(el.placement).toBe(p);
      expect(el.getAttribute("placement")).toBe(p);
    }
  });

  it("keeps every zone in the tree without hidden when no slot has content", async () => {
    const el = await fixture<VuAppbar>(html`<vu-appbar></vu-appbar>`);
    await elementUpdated(el);
    const start = el.shadowRoot?.querySelector('[part="start"]') as HTMLElement;
    const content = el.shadowRoot?.querySelector('[part="body"]') as HTMLElement;
    const end = el.shadowRoot?.querySelector('[part="end"]') as HTMLElement;
    expect(start.hasAttribute("hidden")).toBe(false);
    expect(content.hasAttribute("hidden")).toBe(false);
    expect(end.hasAttribute("hidden")).toBe(false);
  });

  it("shows the start zone when start slot has content", async () => {
    const el = await fixture<VuAppbar>(html`
      <vu-appbar>
        <button slot="start" aria-label="Open menu">M</button>
      </vu-appbar>
    `);
    await elementUpdated(el);
    const start = el.shadowRoot?.querySelector('[part="start"]') as HTMLElement;
    expect(start.hasAttribute("hidden")).toBe(false);
    expect(el.querySelector('[slot="start"]')?.textContent?.trim()).toBe("M");
  });

  it("shows the content zone when default slot has content", async () => {
    const el = await fixture<VuAppbar>(html` <vu-appbar><span>Brand</span></vu-appbar> `);
    await elementUpdated(el);
    const content = el.shadowRoot?.querySelector('[part="body"]') as HTMLElement;
    expect(content.hasAttribute("hidden")).toBe(false);
  });

  it("shows the content zone when default slot has plain text", async () => {
    const el = await fixture<VuAppbar>(html`<vu-appbar>Brand</vu-appbar>`);
    await elementUpdated(el);
    const content = el.shadowRoot?.querySelector('[part="body"]') as HTMLElement;
    expect(content.hasAttribute("hidden")).toBe(false);
  });

  it("shows the end zone when end slot has content", async () => {
    const el = await fixture<VuAppbar>(html`
      <vu-appbar>
        <button slot="end" aria-label="Profile">P</button>
      </vu-appbar>
    `);
    await elementUpdated(el);
    const end = el.shadowRoot?.querySelector('[part="end"]') as HTMLElement;
    expect(end.hasAttribute("hidden")).toBe(false);
  });

  it("renders all three zones simultaneously when fully populated", async () => {
    const el = await fixture<VuAppbar>(html`
      <vu-appbar>
        <button slot="start" aria-label="Menu">M</button>
        <span>App title</span>
        <button slot="end" aria-label="Profile">P</button>
      </vu-appbar>
    `);
    await elementUpdated(el);
    const start = el.shadowRoot?.querySelector('[part="start"]') as HTMLElement;
    const content = el.shadowRoot?.querySelector('[part="body"]') as HTMLElement;
    const end = el.shadowRoot?.querySelector('[part="end"]') as HTMLElement;
    expect(start.hasAttribute("hidden")).toBe(false);
    expect(content.hasAttribute("hidden")).toBe(false);
    expect(end.hasAttribute("hidden")).toBe(false);
  });

  it("does not impose a default landmark role on the host", async () => {
    const el = await fixture<VuAppbar>(html`<vu-appbar>Brand</vu-appbar>`);
    await elementUpdated(el);
    expect(el.hasAttribute("role")).toBe(false);
    const bar = el.shadowRoot?.querySelector('[part="bar"]');
    expect(bar?.hasAttribute("role")).toBe(false);
  });

  it("respects a host-supplied role attribute (consumer opts in to landmark)", async () => {
    const el = await fixture<VuAppbar>(html`<vu-appbar role="banner">Brand</vu-appbar>`);
    await elementUpdated(el);
    expect(el.getAttribute("role")).toBe("banner");
  });

  it("[part='bar'] starts without the 'is-stuck' or 'is-hidden' modifier classes", async () => {
    const el = await fixture<VuAppbar>(html`<vu-appbar sticky condense autohide>X</vu-appbar>`);
    await elementUpdated(el);
    const bar = el.shadowRoot?.querySelector('[part="bar"]') as HTMLElement;
    expect(bar.classList.contains("is-stuck")).toBe(false);
    expect(bar.classList.contains("is-hidden")).toBe(false);
  });

  it("turning autohide off resets the hidden state", async () => {
    const el = await fixture<VuAppbar>(html`<vu-appbar autohide>X</vu-appbar>`);
    await elementUpdated(el);
    const internal = el as unknown as { _isHidden: boolean };
    internal._isHidden = true;
    await elementUpdated(el);
    el.autohide = false;
    await elementUpdated(el);
    const bar = el.shadowRoot?.querySelector('[part="bar"]') as HTMLElement;
    expect(bar.classList.contains("is-hidden")).toBe(false);
    expect(internal._isHidden).toBe(false);
  });

  it("accepts all three tone values", async () => {
    for (const t of ["subtle", "normal", "strong"] as const) {
      const el = await fixture<VuAppbar>(html`<vu-appbar tone=${t}>Brand</vu-appbar>`);
      await elementUpdated(el);
      expect(el.tone).toBe(t);
      expect(el.getAttribute("tone")).toBe(t);
    }
  });

  it("exposes --appbar-control-size that tracks size via csm", async () => {
    const el = await fixture<VuAppbar>(html`<vu-appbar size="lg">X</vu-appbar>`);
    await elementUpdated(el);
    const control = getComputedStyle(el).getPropertyValue("--appbar-control-size").trim();
    const csm = getComputedStyle(el).getPropertyValue("--vu-csm-action-min-block-size").trim();
    expect(control).toBe(csm);
  });

  it("declares matching zone and container gaps via --appbar-gap", () => {
    const cssText = (VuAppbar.styles as { cssText: string }).cssText;
    expect(cssText).toMatch(/\[part="start"\][\s\S]*gap:\s*var\(--appbar-gap\)/);
    expect(cssText).toMatch(/\[part="body"\][\s\S]*gap:\s*var\(--appbar-gap\)/);
    expect(cssText).toMatch(/\[part="container"\][\s\S]*gap:\s*var\(--appbar-gap\)/);
  });

  it("autohide tracks the nearest overflow scrollport", async () => {
    const pane = document.createElement("div");
    pane.style.overflow = "auto";
    pane.style.blockSize = "120px";
    document.body.appendChild(pane);

    const filler = document.createElement("div");
    filler.style.blockSize = "400px";
    const el = document.createElement("vu-appbar") as VuAppbar;
    el.autohide = true;
    el.sticky = true;
    el.textContent = "X";
    pane.append(el, filler);
    await elementUpdated(el);

    // Rebind after the host is under a connected scrollport (connect may run mid-append).
    const internal = el as unknown as {
      _scrollRoot: HTMLElement | null;
      _isHidden: boolean;
      _lastScrollY: number;
      _bindScrollListener: () => void;
      _evaluateAutohide: () => void;
    };
    internal._bindScrollListener();
    expect(internal._scrollRoot).toBe(pane);

    pane.scrollTop = 0;
    internal._lastScrollY = 0;
    pane.scrollTop = 120;
    internal._evaluateAutohide();
    expect(internal._isHidden).toBe(true);

    pane.scrollTop = 40;
    internal._evaluateAutohide();
    expect(internal._isHidden).toBe(false);

    pane.remove();
  });
});

describe("accessibility", () => {
  it("default appbar passes axe", async () => {
    const el = await fixture(html`<vu-appbar>App title</vu-appbar>`);
    await elementUpdated(el);
    await expectA11y(el).to.be.accessible();
  });
});
