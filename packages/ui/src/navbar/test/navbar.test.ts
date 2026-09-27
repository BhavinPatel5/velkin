/**
 * Coverage: tests/COMPONENT-TEST-DEFINITION.md
 * 1✓ 2✓ 3✓ 4✓ 5✓ 6 N/A 7✓ 8✓ 9 N/A 10✓
 */
import { fixture, html, elementUpdated, expect as expectA11y } from "@open-wc/testing";
import { expect, vi } from "vitest";
import {
  expectMountNoChangeInUpdate,
  expectNoChangeInUpdate,
  expectTreeNoChangeInUpdate,
} from "../../../internals/test/change-in-update.js";
import { mockActiveElement } from "../../../internals/test/keyboard-test-helpers.js";
import { resetDismissibleStackForTests } from "../../../internals/utils/dismissible-stack.js";
import { VuNavbar } from "../navbar.js";
import type { VuNavbarItem } from "../navbar.types.js";
import {
  navbarItemRouteActive,
  navbarRouteActive,
} from "../internals/navbar.utils.js";
import { resolveNavbarMenuTrigger } from "../internals/navbar-pointer.js";
import "../../icon/icon.js";
import "../../button/button.js";
import "../../nav-panel/nav-panel.js";
import "../../drawer/drawer.js";

const desktopItems: VuNavbarItem[] = [
  { id: "home", label: "Home", route: "/" },
  {
    id: "products",
    label: "Products",
    submenu: [
      { id: "catalog", label: "Catalog", route: "/products" },
      {
        id: "collections",
        label: "Collections",
        submenu: [{ id: "featured", label: "Featured", route: "/collections/featured" }],
      },
    ],
  },
  { id: "docs", label: "Docs", route: "/docs" },
];

async function mountDesktopNavbar(
  items: VuNavbarItem[] = desktopItems,
  customEvent = false,
): Promise<VuNavbar> {
  const el = await fixture<VuNavbar>(
    customEvent
      ? html`<vu-navbar
          menuTrigger="click"
          customEvent
          .items=${items}
          .breakpoint=${1}
          .isMobile=${false}
        ></vu-navbar>`
      : html`<vu-navbar
          menuTrigger="click"
          .items=${items}
          .breakpoint=${1}
          .isMobile=${false}
        ></vu-navbar>`,
  );
  el.setVisibleItems(items);
  await elementUpdated(el);
  return el;
}

describe("vu-navbar", () => {
  afterEach(() => {
    resetDismissibleStackForTests();
  });

  it("is defined", () => {
    expect(customElements.get("vu-navbar")).toBe(VuNavbar);
  });

  it("renders with default props", async () => {
    const el = await fixture<VuNavbar>(html`<vu-navbar></vu-navbar>`);
    await elementUpdated(el);
    expect(el).toBeTruthy();
    expect(el.items).toEqual([]);
    expect(el.breakpoint).toBe(768);
    expect(el.variant).toBe("flat");
    expect(el.tone).toBe("normal");
    expect(el.size).toBe("md");
    expect(el.indicator).toBe("underline");
    expect(el.contained).toBe(false);
  });

  it("accepts items and activeRoute", async () => {
    const el = await fixture<VuNavbar>(
      html`<vu-navbar .items=${[{ id: "n1", label: "Home", route: "/" }]} activeRoute="/"></vu-navbar>`,
    );
    await elementUpdated(el);
    expect(el.items).toHaveLength(1);
    expect(el.items[0].label).toBe("Home");
    expect(el.activeRoute).toBe("/");
  });

  it("projects desktop prepend and append slots", async () => {
    const el = await fixture<VuNavbar>(
      html`<vu-navbar .breakpoint=${1} .isMobile=${false}>
        <span slot="prepend">Brand</span>
        <span slot="append">Sign in</span>
      </vu-navbar>`,
    );
    await elementUpdated(el);
    const prepend = el.shadowRoot?.querySelector(
      'slot[name="prepend"]',
    ) as HTMLSlotElement;
    const append = el.shadowRoot?.querySelector(
      'slot[name="append"]',
    ) as HTMLSlotElement;
    expect(prepend?.assignedElements()[0]?.textContent?.trim()).toBe("Brand");
    expect(append?.assignedElements()[0]?.textContent?.trim()).toBe("Sign in");
    expect(el.shadowRoot?.querySelector(".slot-pre")?.hasAttribute("hidden")).toBe(false);
    expect(el.shadowRoot?.querySelector(".slot-post")?.hasAttribute("hidden")).toBe(false);
  });

  it("keeps empty prepend and append slots in the tree without hidden", async () => {
    const el = await fixture<VuNavbar>(
      html`<vu-navbar .breakpoint=${1} .isMobile=${false}></vu-navbar>`,
    );
    await elementUpdated(el);
    const prepend = el.shadowRoot?.querySelector(
      'slot[name="prepend"]',
    ) as HTMLSlotElement;
    const append = el.shadowRoot?.querySelector(
      'slot[name="append"]',
    ) as HTMLSlotElement;
    expect(prepend?.assignedElements().length).toBe(0);
    expect(append?.assignedElements().length).toBe(0);
    expect(el.shadowRoot?.querySelector(".slot-pre")?.hasAttribute("hidden")).toBe(false);
    expect(el.shadowRoot?.querySelector(".slot-post")?.hasAttribute("hidden")).toBe(false);
  });

  it("projects prepend after a late slotted child", async () => {
    const el = await fixture<VuNavbar>(
      html`<vu-navbar .breakpoint=${1} .isMobile=${false}></vu-navbar>`,
    );
    await elementUpdated(el);
    const brand = document.createElement("span");
    brand.slot = "prepend";
    brand.textContent = "Late brand";
    el.append(brand);
    await elementUpdated(el);
    const prepend = el.shadowRoot?.querySelector(
      'slot[name="prepend"]',
    ) as HTMLSlotElement;
    expect(prepend?.assignedElements()[0]?.textContent?.trim()).toBe("Late brand");
  });

  it("projects mobile prepend-mobile and append-mobile slots", async () => {
    const el = await fixture<VuNavbar>(
      html`<vu-navbar .breakpoint=${99999}>
        <span slot="prepend-mobile">M-Pre</span>
        <span slot="append-mobile">M-Post</span>
      </vu-navbar>`,
    );
    await elementUpdated(el);
    const prepend = el.shadowRoot?.querySelector(
      'slot[name="prepend-mobile"]',
    ) as HTMLSlotElement;
    const append = el.shadowRoot?.querySelector(
      'slot[name="append-mobile"]',
    ) as HTMLSlotElement;
    expect(prepend?.assignedElements()[0]?.textContent?.trim()).toBe("M-Pre");
    expect(append?.assignedElements()[0]?.textContent?.trim()).toBe("M-Post");
  });

  it("projects header and footer slots in the mobile drawer", async () => {
    const el = await fixture<VuNavbar>(
      html`<vu-navbar .breakpoint=${99999}>
        <span slot="header">Drawer head</span>
        <span slot="footer">Drawer foot</span>
      </vu-navbar>`,
    );
    await elementUpdated(el);
    const header = el.shadowRoot?.querySelector(
      'slot[name="header"]',
    ) as HTMLSlotElement;
    const footer = el.shadowRoot?.querySelector(
      'slot[name="footer"]',
    ) as HTMLSlotElement;
    expect(header?.assignedElements()[0]?.textContent?.trim()).toBe("Drawer head");
    expect(footer?.assignedElements()[0]?.textContent?.trim()).toBe("Drawer foot");
  });

  it("uses label override props for built-in copy", async () => {
    const el = await fixture<VuNavbar>(
      html`<vu-navbar
        menuLabel="Open nav"
        menubarLabel="Top links"
        closeLabel="Dismiss"
        ariaLabel="Side nav"
        .breakpoint=${99999}
      ></vu-navbar>`,
    );
    await elementUpdated(el);
    expect(el.labels.menu).toBe("Open nav");
    expect(el.labels.menubar).toBe("Top links");
    expect(el.labels.close).toBe("Dismiss");
    expect(el.labels.navigation).toBe("Side nav");
  });

  it("exposes menu control methods on mobile", async () => {
    const el = await fixture<VuNavbar>(
      html`<vu-navbar .breakpoint=${99999}></vu-navbar>`,
    );
    await elementUpdated(el);
    expect(el.isMobile).toBe(true);
    el.openMenu();
    await elementUpdated(el);
    expect(el.drawerOpen).toBe(true);
    el.closeMenu();
    await elementUpdated(el);
    expect(el.drawerOpen).toBe(false);
    el.toggleMenu();
    await elementUpdated(el);
    expect(el.drawerOpen).toBe(true);
    el.closeMenus();
    await elementUpdated(el);
    expect(el.drawerOpen).toBe(false);
  });

  it("dispatches vu-navigate when a route item is activated", async () => {
    const el = await mountDesktopNavbar();
    let detail: { route: string } | null = null;
    el.addEventListener("vu-navigate", ((e: CustomEvent<{ route: string }>) => {
      detail = e.detail;
    }) as EventListener);
    const home = el.shadowRoot?.querySelector('[part="nav-link"][data-path="home"]') as HTMLElement;
    home?.click();
    await elementUpdated(el);
    expect(detail?.route).toBe("/");
  });

  it("dispatches vu-activate in customEvent mode", async () => {
    const el = await mountDesktopNavbar(desktopItems, true);
    let detail: { path: string | null } | null = null;
    el.addEventListener("vu-activate", ((e: CustomEvent) => {
      detail = e.detail;
    }) as EventListener);
    const docs = el.shadowRoot?.querySelector('[part="nav-link"][data-path="docs"]') as HTMLElement;
    docs?.click();
    await elementUpdated(el);
    expect(detail?.path).toBe("docs");
  });

  it("opens desktop submenu on click", async () => {
    const el = await mountDesktopNavbar();
    const products = el.shadowRoot?.querySelector('[part="nav-link"][data-path="products"]') as HTMLElement;
    products?.click();
    await elementUpdated(el);
    expect(el.topMenuOpen).toBe(true);
    expect(el.shadowRoot?.querySelector('[part="top-menu"]')).toBeTruthy();
  });

  it("closes desktop menus with closeMenus", async () => {
    const el = await mountDesktopNavbar();
    const products = el.shadowRoot?.querySelector('[part="nav-link"][data-path="products"]') as HTMLElement;
    products?.click();
    await elementUpdated(el);
    el.closeMenus();
    await elementUpdated(el);
    expect(el.topMenuOpen).toBe(false);
    expect(el.nestedMenuOpen).toBe(false);
  });

  it("renders badge and shortcut in submenu rows", async () => {
    const items: VuNavbarItem[] = [
      {
        id: "products",
        label: "Products",
        submenu: [
          {
            id: "catalog",
            label: "Catalog",
            route: "/products",
            badge: "Hot",
            shortcut: "⌘P",
          },
        ],
      },
    ];
    const el = await mountDesktopNavbar(items);
    const products = el.shadowRoot?.querySelector('[part="nav-link"][data-path="products"]') as HTMLElement;
    products?.click();
    await elementUpdated(el);
    const row = el.shadowRoot?.querySelector(".menu-row");
    expect(row?.textContent).toContain("Hot");
    expect(row?.textContent).toContain("⌘P");
  });

  it("matches routes with prefix mode", () => {
    expect(navbarRouteActive("/products/catalog", "/products", "prefix")).toBe(true);
    expect(navbarRouteActive("/products", "/products", "prefix")).toBe(true);
    expect(navbarRouteActive("/pricing", "/products", "prefix")).toBe(false);
    expect(
      navbarItemRouteActive("/collections/featured", {
        route: "/collections",
        routeMatch: "prefix",
      }),
    ).toBe(true);
  });

  it("renders vu-nav-panel in mobile drawer", async () => {
    const el = await fixture<VuNavbar>(
      html`<vu-navbar .items=${desktopItems} .breakpoint=${99999}></vu-navbar>`,
    );
    await elementUpdated(el);
    el.openMenu();
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector("vu-nav-panel")).toBeTruthy();
  });

  it("relays size and tone to mobile vu-drawer and vu-nav-panel", async () => {
    const el = await fixture<VuNavbar>(
      html`<vu-navbar
        .items=${desktopItems}
        .breakpoint=${99999}
        size="lg"
        tone="strong"
      ></vu-navbar>`,
    );
    await elementUpdated(el);
    const drawer = el.shadowRoot?.querySelector("vu-drawer");
    const panel = el.shadowRoot?.querySelector("vu-nav-panel");
    expect(drawer?.size).toBe("lg");
    expect(drawer?.tone).toBe("strong");
    expect(panel?.size).toBe("lg");
  });

  it("keeps indicator affordance on bar links, not flyout rows", async () => {
    const el = await mountDesktopNavbar();
    el.indicator = "pill";
    await elementUpdated(el);
    const products = el.shadowRoot?.querySelector(
      '[part="nav-link"][data-path="products"]',
    ) as HTMLElement;
    products?.click();
    await elementUpdated(el);
    const barLink = el.shadowRoot?.querySelector('[part="nav-link"].btn');
    const menuRow = el.shadowRoot?.querySelector(".menu-row");
    expect(barLink?.classList.contains("btn")).toBe(true);
    expect(menuRow?.classList.contains("btn")).toBe(false);
    expect(menuRow?.classList.contains("menu-row")).toBe(true);
  });

  it("accepts popover tuning props", async () => {
    const el = await fixture<VuNavbar>(
      html`<vu-navbar placement="top" align="end" .offset=${12}></vu-navbar>`,
    );
    await elementUpdated(el);
    expect(el.placement).toBe("top");
    expect(el.align).toBe("end");
    expect(el.offset).toBe(12);
  });

  it("reflects sticky and condense", async () => {
    const el = await fixture<VuNavbar>(
      html`<vu-navbar sticky condense></vu-navbar>`,
    );
    await elementUpdated(el);
    expect(el.hasAttribute("sticky")).toBe(true);
    expect(el.hasAttribute("condense")).toBe(true);
  });

  it("reflects variant, tone, size, indicator, and contained", async () => {
    const el = await fixture<VuNavbar>(
      html`<vu-navbar
        variant="elevated"
        tone="strong"
        size="lg"
        indicator="pill"
        contained
      ></vu-navbar>`,
    );
    await elementUpdated(el);
    expect(el.getAttribute("variant")).toBe("elevated");
    expect(el.getAttribute("tone")).toBe("strong");
    expect(el.getAttribute("size")).toBe("lg");
    expect(el.getAttribute("indicator")).toBe("pill");
    expect(el.hasAttribute("contained")).toBe(true);
  });

  it("accepts all surface variants", async () => {
    for (const variant of ["flat", "outline", "elevated", "transparent", "inset"] as const) {
      const el = await fixture<VuNavbar>(html`<vu-navbar variant=${variant}></vu-navbar>`);
      await elementUpdated(el);
      expect(el.variant).toBe(variant);
    }
  });

  it("accepts all active link indicators", async () => {
    for (const indicator of ["underline", "pill", "dot", "none"] as const) {
      const el = await fixture<VuNavbar>(html`<vu-navbar indicator=${indicator}></vu-navbar>`);
      await elementUpdated(el);
      expect(el.indicator).toBe(indicator);
    }
  });

  it("resolves auto menu trigger from pointer capabilities", () => {
    const fine = { matches: true } as MediaQueryList;
    const coarse = { matches: false } as MediaQueryList;
    vi.spyOn(window, "matchMedia").mockImplementation((query) =>
      query.includes("pointer: fine") ? fine : coarse,
    );
    expect(resolveNavbarMenuTrigger("auto")).toBe("hover");
    coarse.matches = false;
    fine.matches = false;
    expect(resolveNavbarMenuTrigger("auto")).toBe("click");
    vi.restoreAllMocks();
  });

  it("splits overflow into the overflow trigger", async () => {
    const el = await mountDesktopNavbar(desktopItems);
    el.setVisibleItems(desktopItems.slice(0, 1));
    el.setOverflowItems(desktopItems.slice(1));
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector('[data-path="__overflow__"]')).toBeTruthy();
    expect(el.visibleItems).toHaveLength(1);
    expect(el.overflowItems.length).toBe(2);
  });

  it("opens mega menu panel layout", async () => {
    const items: VuNavbarItem[] = [
      {
        id: "platform",
        label: "Platform",
        panel: "mega",
        columns: 2,
        submenu: [
          {
            id: "build",
            label: "Build",
            submenu: [{ id: "editor", label: "Editor", route: "/editor" }],
          },
          {
            id: "scale",
            label: "Scale",
            submenu: [{ id: "edge", label: "Edge", route: "/edge" }],
          },
        ],
      },
    ];
    const el = await mountDesktopNavbar(items);
    const platform = el.shadowRoot?.querySelector('[data-path="platform"]') as HTMLElement;
    platform?.click();
    await elementUpdated(el);
    expect(el.isMegaPanel).toBe(true);
    expect(el.shadowRoot?.querySelector(".mega-grid")).toBeTruthy();
    expect(el.nestedMenuOpen).toBe(false);
  });

  it("moves menubar focus with ArrowRight", async () => {
    const el = await mountDesktopNavbar();
    const home = el.shadowRoot?.querySelector('[data-path="home"]') as HTMLElement;
    const products = el.shadowRoot?.querySelector('[data-path="products"]') as HTMLElement;
    const menubar = el.shadowRoot?.querySelector(".bar-items") as HTMLElement;
    const focusSpy = vi.spyOn(products, "focus");
    Object.defineProperty(document, "activeElement", {
      configurable: true,
      get: () => home,
    });
    menubar.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    expect(focusSpy).toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it("closes desktop menus on Escape from menubar", async () => {
    const el = await mountDesktopNavbar();
    const products = el.shadowRoot?.querySelector('[data-path="products"]') as HTMLElement;
    products?.click();
    await elementUpdated(el);
    const menubar = el.shadowRoot?.querySelector(".bar-items") as HTMLElement;
    menubar?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    await elementUpdated(el);
    expect(el.topMenuOpen).toBe(false);
  });

  describe("keyboard — submenu panels", () => {
    async function openProductsSubmenu(el: VuNavbar): Promise<void> {
      const products = el.shadowRoot?.querySelector(
        '[data-path="products"]',
      ) as HTMLElement;
      products?.click();
      await elementUpdated(el);
      await el.updateComplete;
    }

    function findMenuRow(
      el: VuNavbar,
      label: string,
      panel = '[part="top-menu"]',
    ): HTMLElement | undefined {
      return [...(el.shadowRoot?.querySelectorAll(`${panel} .menu-row`) ?? [])].find(
        (row) => row.textContent?.includes(label),
      ) as HTMLElement | undefined;
    }

    it("ArrowDown moves focus between top submenu rows", async () => {
      const el = await mountDesktopNavbar();
      await openProductsSubmenu(el);
      const panel = el.shadowRoot?.querySelector('[part="top-menu"]');
      panel?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
      await elementUpdated(el);
      const rows = panel?.querySelectorAll(".menu-row");
      expect((rows?.[1] as HTMLElement | undefined)?.getAttribute("tabindex")).toBe(
        "0",
      );
    });

    it("Home and End jump to first and last top submenu rows", async () => {
      const el = await mountDesktopNavbar();
      await openProductsSubmenu(el);
      const panel = el.shadowRoot?.querySelector('[part="top-menu"]');
      panel?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "End", bubbles: true }),
      );
      await elementUpdated(el);
      const rows = panel?.querySelectorAll(".menu-row");
      expect(
        (rows?.[(rows?.length ?? 1) - 1] as HTMLElement | undefined)?.getAttribute(
          "tabindex",
        ),
      ).toBe("0");
      panel?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
      );
      await elementUpdated(el);
      expect((rows?.[0] as HTMLElement | undefined)?.getAttribute("tabindex")).toBe("0");
    });

    it("ArrowRight opens nested flyout from top submenu row", async () => {
      const el = await mountDesktopNavbar();
      await openProductsSubmenu(el);
      const panel = el.shadowRoot?.querySelector('[part="top-menu"]');
      const collections = findMenuRow(el, "Collections")!;
      const restore = mockActiveElement(collections);
      panel?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );
      await elementUpdated(el);
      await el.updateComplete;
      restore();
      expect(el.nestedMenuOpen).toBe(true);
      expect(el.shadowRoot?.querySelector('[part="nested-menu"]')).toBeTruthy();
    });

    it("ArrowLeft closes nested flyout and restores parent row focus", async () => {
      const el = await mountDesktopNavbar();
      await openProductsSubmenu(el);
      findMenuRow(el, "Collections")?.click();
      await elementUpdated(el);
      await el.updateComplete;
      const nestedPanel = el.shadowRoot?.querySelector('[part="nested-menu"]');
      nestedPanel?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
      );
      await elementUpdated(el);
      await el.updateComplete;
      expect(el.nestedMenuOpen).toBe(false);
      const collections = findMenuRow(el, "Collections");
      expect(collections?.getAttribute("tabindex")).toBe("0");
    });

    it("type-ahead focuses the next matching submenu row", async () => {
      const el = await mountDesktopNavbar();
      await openProductsSubmenu(el);
      const panel = el.shadowRoot?.querySelector('[part="top-menu"]');
      const rows = panel?.querySelectorAll(".menu-row");
      (rows?.[0] as HTMLElement | undefined)?.focus();
      panel?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "c", bubbles: true }),
      );
      await elementUpdated(el);
      expect(findMenuRow(el, "Collections")?.getAttribute("tabindex")).toBe("0");
    });
  });

  it("renders vu-drawer on mobile", async () => {
    const el = await fixture<VuNavbar>(
      html`<vu-navbar .items=${desktopItems} .breakpoint=${99999}></vu-navbar>`,
    );
    await elementUpdated(el);
    expect(el.shadowRoot?.querySelector("vu-drawer")).toBeTruthy();
    el.openMenu();
    await elementUpdated(el);
    expect(el.drawerOpen).toBe(true);
  });

  it("uses stable flyout ids without Math.random", async () => {
    const a = await fixture<VuNavbar>(html`<vu-navbar .items=${desktopItems}></vu-navbar>`);
    const b = await fixture<VuNavbar>(html`<vu-navbar .items=${desktopItems}></vu-navbar>`);
    await elementUpdated(a);
    await elementUpdated(b);
    expect(a.topMenuId).toMatch(/^vu-navbar-top-\d+$/);
    expect(a.nestedMenuId).toMatch(/^vu-navbar-nested-\d+$/);
    expect(a.topMenuId).not.toBe(b.topMenuId);
    expect(a.nestedMenuId).not.toBe(b.nestedMenuId);
  });

  it("relays mobile menu icon via Lit property binding", async () => {
    const el = await fixture<VuNavbar>(
      html`<vu-navbar .items=${desktopItems} .breakpoint=${99999}></vu-navbar>`,
    );
    await elementUpdated(el);
    const icon = el.shadowRoot?.querySelector(".m-btn vu-icon") as
      | import("../../icon/icon.js").VuIcon
      | null;
    expect(icon?.icon).toBeTruthy();
  });

  it("includes CSS preference media queries", async () => {
    const el = await fixture<VuNavbar>(html`<vu-navbar .items=${desktopItems}></vu-navbar>`);
    await elementUpdated(el);
    const cssText = el.shadowRoot?.querySelector("style")?.textContent ?? "";
    expect(cssText).toContain("prefers-reduced-motion: reduce");
    expect(cssText).toContain("prefers-contrast: more");
    expect(cssText).toContain("prefers-reduced-transparency: reduce");
    expect(cssText).toContain("forced-colors: active");
  });

  it("renders external href links in submenu rows", async () => {
    const items: VuNavbarItem[] = [
      {
        id: "more",
        label: "More",
        submenu: [
          { id: "api", label: "API", href: "https://example.com/api", external: true },
        ],
      },
    ];
    const el = await mountDesktopNavbar(items);
    const more = el.shadowRoot?.querySelector('[data-path="more"]') as HTMLElement;
    more?.click();
    await elementUpdated(el);
    const link = el.shadowRoot?.querySelector('.menu-row[href="https://example.com/api"]');
    expect(link).toBeTruthy();
    expect(link?.getAttribute("target")).toBe("_blank");
  });

  describe("accessibility", () => {
    it("default desktop navbar", async () => {
      const el = await mountDesktopNavbar(desktopItems);
      await expectA11y(el).to.be.accessible();
    });

    it("mobile drawer open", async () => {
      const el = await fixture<VuNavbar>(
        html`<vu-navbar .items=${desktopItems} .breakpoint=${99999}></vu-navbar>`,
      );
      await elementUpdated(el);
      el.openMenu();
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });

    it("desktop submenu open", async () => {
      const el = await mountDesktopNavbar();
      const products = el.shadowRoot?.querySelector('[part="nav-link"][data-path="products"]') as HTMLElement;
      products?.click();
      await elementUpdated(el);
      await expectA11y(el).to.be.accessible();
    });
  });

  describe("change-in-update", () => {
    it("mounts without a follow-up update", async () => {
      const el = document.createElement("vu-navbar") as VuNavbar;
      el.items = [{ id: "home", label: "Home", route: "/" }];
      el.activeRoute = "/";
      await expectMountNoChangeInUpdate(el);
      el.remove();
    });

    it("hot props settle in one update", async () => {
      const el = await fixture<VuNavbar>(
        html`<vu-navbar
          .items=${[{ id: "home", label: "Home", route: "/" }]}
          activeRoute="/"
          .breakpoint=${1}
          .isMobile=${false}
        ></vu-navbar>`,
      );
      await expectNoChangeInUpdate(el, () => {
        el.sticky = true;
      });
      await expectNoChangeInUpdate(el, () => {
        el.breakpoint = 2;
      });
      await expectNoChangeInUpdate(el, () => {
        el.activeRoute = "/docs";
      });
      await expectTreeNoChangeInUpdate(el, () => {
        el.items = [
          { id: "home", label: "Home", route: "/" },
          { id: "docs", label: "Docs", route: "/docs" },
        ];
      });
    });
  });
});
