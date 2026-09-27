/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6 N/A 7✓ 8✓ 9 N/A 10✓
 */
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { consume } from "@lit/context";
import { fixture, html as wcHtml, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { afterEach, expect, vi } from "vitest";
import {
  expectMountNoChangeInUpdate,
  expectNoChangeInUpdate,
} from "../../../internals/test/change-in-update.js";
import {
  VuThemeProvider,
  VU_THEME_EVENT,
  themeContext,
  type ThemeContextValue,
} from "../theme-provider.js";
import { THEME_KEY } from "../internals/theme-core.js";

const STYLE_IDS = [
  "vu-theme-vars-root",
  "vu-theme-provider-global-style",
  "vu-theme-keyframes",
] as const;

@customElement("vu-test-theme-ctx")
class VuTestThemeCtx extends LitElement {
  @consume({ context: themeContext, subscribe: true })
  ctx?: ThemeContextValue;

  override render() {
    return html`<span>${this.ctx?.mode ?? "none"}</span>`;
  }
}

function stubLocalStorage() {
  const store = new Map<string, string>();
  const storage = {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    key: (index: number) => [...store.keys()][index] ?? null,
    get length() {
      return store.size;
    },
  };
  vi.stubGlobal("localStorage", storage);
  return storage;
}

function cleanupThemeArtifacts() {
  for (const id of STYLE_IDS) {
    document.getElementById(id)?.remove();
  }
  const de = document.documentElement;
  de.removeAttribute("data-theme");
  de.removeAttribute("data-theme-light");
  de.removeAttribute("data-theme-dark");
  de.removeAttribute("data-vibrant-palette");
  de.removeAttribute("data-glass");
  (de.style as CSSStyleDeclaration).removeProperty("color-scheme");
  try {
    localStorage.removeItem(THEME_KEY);
  } catch {
    /* ignore */
  }
}

afterEach(() => {
  cleanupThemeArtifacts();
  vi.unstubAllGlobals();
});

describe("vu-theme-provider", () => {
  it("is defined", () => {
    expect(customElements.get("vu-theme-provider")).toBe(VuThemeProvider);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuThemeProvider>(wcHtml`<vu-theme-provider></vu-theme-provider>`);
    await elementUpdated(el);
    expect(el).toBeTruthy();
    expect(el.scope).toBe("root");
    expect(el.persist).toBe(true);
    expect(el.broadcast).toBe(true);
    expect(el.injectStyles).toBe(true);
    expect(el.locale).toBe("en");
    expect(el.glass).toBe(true);
  });

  it("mirrors glass onto data-glass on the document root", async () => {
    const el = await fixture<VuThemeProvider>(
      wcHtml`<vu-theme-provider glass .broadcast=${false}></vu-theme-provider>`,
    );
    await elementUpdated(el);
    expect(el.glass).toBe(true);
    expect(el.hasAttribute("glass")).toBe(true);
    expect(document.documentElement.hasAttribute("data-glass")).toBe(true);

    el.glass = false;
    await elementUpdated(el);
    expect(document.documentElement.hasAttribute("data-glass")).toBe(false);
  });

  it("accepts scope, persist, broadcast", async () => {
    const el = await fixture<VuThemeProvider>(
      wcHtml`<vu-theme-provider
        scope="host"
        .injectStyles=${false}
        .persist=${false}
        .broadcast=${false}
      ></vu-theme-provider>`,
    );
    await elementUpdated(el);
    expect(el.scope).toBe("host");
    expect(el.persist).toBe(false);
    expect(el.broadcast).toBe(false);
  });

  it("projects default slot content", async () => {
    const root = await fixture<HTMLElement>(
      wcHtml`
        <vu-theme-provider .broadcast=${false} .injectStyles=${false}>
          <p id="slot-child">Hello</p>
        </vu-theme-provider>
      `,
    );
    await elementUpdated(root);
    expect(root.querySelector("#slot-child")?.textContent).toBe("Hello");
  });

  it("reflects injectstyles boolean attribute (Lit default lowercased name)", async () => {
    const off = await fixture<VuThemeProvider>(
      wcHtml`<vu-theme-provider .injectStyles=${false} .broadcast=${false}></vu-theme-provider>`,
    );
    await elementUpdated(off);
    expect(off.injectStyles).toBe(false);
    expect(off.hasAttribute("injectstyles")).toBe(false);

    const on = await fixture<VuThemeProvider>(
      wcHtml`<vu-theme-provider injectstyles .broadcast=${false}></vu-theme-provider>`,
    );
    await elementUpdated(on);
    expect(on.injectStyles).toBe(true);
    expect(on.hasAttribute("injectstyles")).toBe(true);
  });

  it("setPreference dispatches vu-theme with detail when broadcast is true", async () => {
    const handler = vi.fn();
    const el = await fixture<VuThemeProvider>(
      wcHtml`<vu-theme-provider .broadcast=${true} .injectStyles=${false}></vu-theme-provider>`,
    );
    await elementUpdated(el);
    el.addEventListener(VU_THEME_EVENT, handler);

    el.setPreference("dark");
    await elementUpdated(el);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]?.[0]).toMatchObject({
      detail: { mode: "dark", preference: "dark" },
    });
  });

  describe("accessibility", () => {
    it("default with slotted content", async () => {
      const root = await fixture<HTMLElement>(
        wcHtml`
          <vu-theme-provider .broadcast=${false} .injectStyles=${false}>
            <p>Theme content</p>
          </vu-theme-provider>
        `,
      );
      await elementUpdated(root);
      await expectA11y(root).to.be.accessible();
    });
  });

  it("sets document root data-theme from preference", async () => {
    const el = await fixture<VuThemeProvider>(
      wcHtml`<vu-theme-provider preference="dark" .injectStyles=${false} .broadcast=${false}></vu-theme-provider>`,
    );
    await elementUpdated(el);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(document.documentElement.hasAttribute("data-theme-dark")).toBe(true);
    expect(document.documentElement.hasAttribute("data-theme-light")).toBe(false);
    expect(el.getAttribute("data-theme")).toBe("dark");
  });

  it("injects root style tags when injectStyles is true", async () => {
    const el = await fixture<VuThemeProvider>(
      wcHtml`<vu-theme-provider preference="light" .broadcast=${false}></vu-theme-provider>`,
    );
    await elementUpdated(el);
    expect(document.getElementById(STYLE_IDS[0])?.textContent).toMatch(/--vu-/);
    expect(document.getElementById(STYLE_IDS[1])).toBeTruthy();
    expect(document.getElementById(STYLE_IDS[2])).toBeTruthy();
  });

  it("clears injected root styles when injectStyles becomes false", async () => {
    const el = await fixture<VuThemeProvider>(
      wcHtml`<vu-theme-provider preference="light" .broadcast=${false}></vu-theme-provider>`,
    );
    await elementUpdated(el);
    expect(document.getElementById(STYLE_IDS[0])).toBeTruthy();

    el.injectStyles = false;
    await elementUpdated(el);
    expect(document.getElementById(STYLE_IDS[0])).toBeNull();
    expect(document.getElementById(STYLE_IDS[1])).toBeNull();
    expect(document.getElementById(STYLE_IDS[2])).toBeNull();
  });

  it("setPreference persists to localStorage when persist is true", async () => {
    const storage = stubLocalStorage();
    const el = await fixture<VuThemeProvider>(
      wcHtml`<vu-theme-provider .persist=${true} .broadcast=${false} .injectStyles=${false}></vu-theme-provider>`,
    );
    await elementUpdated(el);
    el.setPreference("dark");
    expect(storage.getItem(THEME_KEY)).toBe("dark");
  });

  it("restores stored preference after first update so SSR hydrate can match", async () => {
    const storage = stubLocalStorage();
    storage.setItem(THEME_KEY, "dark");
    const el = document.createElement("vu-theme-provider") as VuThemeProvider;
    el.persist = true;
    el.broadcast = false;
    el.injectStyles = false;
    expect(el.preference).toBe("system");
    document.body.append(el);
    expect(await el.updateComplete).toBe(true);
    await Promise.resolve();
    await el.updateComplete;
    expect(el.preference).toBe("dark");
    el.remove();
  });

  describe("change-in-update", () => {
    it("mounts without a follow-up update when persist is off", async () => {
      const el = document.createElement("vu-theme-provider") as VuThemeProvider;
      el.persist = false;
      el.broadcast = false;
      el.injectStyles = false;
      await expectMountNoChangeInUpdate(el);
      el.remove();
    });

    it("first paint settles when a stored preference will restore after hydrate", async () => {
      const storage = stubLocalStorage();
      storage.setItem(THEME_KEY, "dark");
      const el = document.createElement("vu-theme-provider") as VuThemeProvider;
      el.persist = true;
      el.broadcast = false;
      el.injectStyles = false;
      await expectMountNoChangeInUpdate(el);
      await Promise.resolve();
      await el.updateComplete;
      expect(el.preference).toBe("dark");
      el.remove();
    });

    it("preference writes settle in one update", async () => {
      const el = await fixture<VuThemeProvider>(
        wcHtml`<vu-theme-provider preference="light" .persist=${false} .broadcast=${false} .injectStyles=${false}></vu-theme-provider>`,
      );
      await expectNoChangeInUpdate(el, () => {
        el.preference = "dark";
      });
    });
  });

  it("does not persist when persist is false", async () => {
    const storage = stubLocalStorage();
    const el = await fixture<VuThemeProvider>(
      wcHtml`<vu-theme-provider .persist=${false} .broadcast=${false} .injectStyles=${false}></vu-theme-provider>`,
    );
    await elementUpdated(el);
    el.setPreference("dark");
    expect(storage.getItem(THEME_KEY)).toBeNull();
  });

  it("broadcast false suppresses window vu-theme events", async () => {
    const handler = vi.fn();
    window.addEventListener(VU_THEME_EVENT, handler);

    const el = await fixture<VuThemeProvider>(
      wcHtml`<vu-theme-provider .broadcast=${false} .injectStyles=${false}></vu-theme-provider>`,
    );
    await elementUpdated(el);
    handler.mockClear();

    el.setPreference("dark");
    await elementUpdated(el);
    expect(handler).not.toHaveBeenCalled();

    window.removeEventListener(VU_THEME_EVENT, handler);
  });

  it("fires a single window vu-theme event per preference change when broadcast is true", async () => {
    const handler = vi.fn();
    window.addEventListener(VU_THEME_EVENT, handler);

    const el = await fixture<VuThemeProvider>(
      wcHtml`<vu-theme-provider .broadcast=${true} .injectStyles=${false}></vu-theme-provider>`,
    );
    await elementUpdated(el);
    handler.mockClear();

    el.setPreference("dark");
    await elementUpdated(el);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]?.[0]).toMatchObject({
      detail: { mode: "dark", preference: "dark" },
    });

    window.removeEventListener(VU_THEME_EVENT, handler);
  });

  it("provides theme context to descendants", async () => {
    const root = await fixture<HTMLElement>(
      wcHtml`
        <vu-theme-provider preference="dark" .injectStyles=${false} .broadcast=${false}>
          <vu-test-theme-ctx></vu-test-theme-ctx>
        </vu-theme-provider>
      `,
    );
    await elementUpdated(root);
    const consumer = root.querySelector("vu-test-theme-ctx") as VuTestThemeCtx;
    await elementUpdated(consumer);
    expect(consumer.shadowRoot?.textContent?.trim()).toBe("dark");
  });

  it("togglePreference cycles light → dark → system → light", async () => {
    const el = await fixture<VuThemeProvider>(
      wcHtml`<vu-theme-provider preference="light" .broadcast=${false} .injectStyles=${false}></vu-theme-provider>`,
    );
    await elementUpdated(el);
    expect(el.togglePreference()).toBe("dark");
    expect(el.togglePreference()).toBe("system");
    expect(el.togglePreference()).toBe("light");
  });

  it("expands theme seeds into injected tokens", async () => {
    const el = await fixture<VuThemeProvider>(
      wcHtml`<vu-theme-provider
        preference="light"
        .broadcast=${false}
        .theme=${{ primary: "oklch(0.58 0.2 264)" }}
      ></vu-theme-provider>`,
    );
    await elementUpdated(el);
    expect(el.theme?.primary).toBe("oklch(0.58 0.2 264)");
    const rootCss = document.getElementById(STYLE_IDS[0])?.textContent ?? "";
    expect(rootCss).toContain("oklch(0.58 0.2 264)");
  });

  it("raw vars override the derived accent", async () => {
    const el = await fixture<VuThemeProvider>(
      wcHtml`<vu-theme-provider
        preference="light"
        .broadcast=${false}
        .theme=${{
          primary: "oklch(0.58 0.2 264)",
          vars: { light: { "--vu-color-accent": "#112233" } },
        }}
      ></vu-theme-provider>`,
    );
    await elementUpdated(el);
    const rootCss = document.getElementById(STYLE_IDS[0])?.textContent ?? "";
    expect(rootCss).toContain("#112233");
    expect(rootCss).toContain("color-accent-foreground:var(--vu-snow)");
    expect(rootCss).not.toContain("oklch(0.58 0.2 264)");
  });
});

declare global {
  interface HTMLElementTagNameMap {
    "vu-test-theme-ctx": VuTestThemeCtx;
  }
}
