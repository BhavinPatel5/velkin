import { render } from "lit";
import { describe, expect, it, vi } from "vitest";
import { navPanelRowHint, navPanelRowValue } from "../../internals/nav-panel-groups.js";
import { renderNavPanel, type NavPanelRenderHost } from "../../internals/nav-panel.render.js";
import type { VuNavPanelItem } from "../../nav-panel.types.js";
import "../../../icon/icon.js";
import "../../../tooltip/tooltip.js";

const flatItems: VuNavPanelItem[] = [
  { label: "Home", value: "home", icon: "ion:home-outline" },
  { label: "Settings", value: "settings", icon: "ion:settings-outline" },
];

const groupedItems: VuNavPanelItem[] = [
  { label: "Dashboard", value: "dashboard", category: "Main" },
  { label: "Profile", value: "profile", category: "Main" },
  { label: "Billing", value: "billing", category: "Account" },
];

function createHost(
  overrides: Partial<NavPanelRenderHost> & Pick<NavPanelRenderHost, "items">,
): NavPanelRenderHost {
  return {
    items: overrides.items,
    value: "",
    collapsedGroups: {},
    collapsed: false,
    label: "Navigation",
    collapsedHints: "tooltip",
    collapsedHintPlacement: "right",
    size: "md",
    _isRail: false,
    _groupHeights: {},
    _rovingKey: "",
    _itemValue: navPanelRowValue,
    _rowAriaLabel: navPanelRowHint,
    _rowDomId: (value) => `nav-panel-row-${value}`,
    _onItemActivate: vi.fn(),
    _onFocusIn: vi.fn(),
    _onKeyDown: vi.fn(),
    toggleGroup: vi.fn(),
    ...overrides,
  };
}

function mount(host: NavPanelRenderHost): HTMLElement {
  const root = document.createElement("div");
  render(renderNavPanel(host), root);
  return root;
}

describe("renderNavPanel", () => {
  it("uses listbox semantics for a flat uncategorized list", () => {
    const root = mount(createHost({ items: flatItems, value: "home", _rovingKey: "home" }));
    const body = root.querySelector('[part="body"]');
    expect(body?.getAttribute("role")).toBe("listbox");
    expect(body?.getAttribute("aria-label")).toBe("Navigation");
    expect(root.querySelectorAll('[part="row"][role="option"]')).toHaveLength(2);
    expect(root.querySelector('[part="flat"]')?.hasAttribute("hidden")).toBe(false);
    expect(root.querySelector('[part="groups"]')?.hasAttribute("hidden")).toBe(true);
    expect(root.querySelector('[part="list"]')).not.toBeNull();
  });

  it("renders grouped sections without listbox semantics", () => {
    const root = mount(
      createHost({
        items: groupedItems,
        value: "dashboard",
        _rovingKey: "dashboard",
        _groupHeights: { "Main-0": 120, "Account-1": 80 },
      }),
    );
    const body = root.querySelector('[part="body"]');
    expect(body?.hasAttribute("role")).toBe(false);
    expect(root.querySelectorAll('[part="group"]')).toHaveLength(2);
    expect(root.querySelectorAll('[part="heading"]')).toHaveLength(2);
    expect(root.querySelector('[part="groups"]')?.hasAttribute("hidden")).toBe(false);
    expect(root.querySelector('[part="flat"]')?.hasAttribute("hidden")).toBe(true);
  });

  it("renders link rows as anchors when expanded", () => {
    const items: VuNavPanelItem[] = [
      { label: "Docs", value: "docs", href: "/docs", target: "_blank" },
    ];
    const root = mount(createHost({ items, value: "docs", _rovingKey: "docs" }));
    const row = root.querySelector<HTMLAnchorElement>('[part="row"]');
    expect(row?.tagName).toBe("A");
    expect(row?.getAttribute("href")).toBe("/docs");
    expect(row?.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("icon rail hides prepend and wraps rows in vu-tooltip", () => {
    const root = mount(
      createHost({
        items: flatItems,
        collapsed: true,
        collapsedHints: "tooltip",
        _isRail: true,
        _rovingKey: "home",
      }),
    );
    expect(root.querySelector('[part="prepend"]')?.hasAttribute("hidden")).toBe(false);
    expect(root.querySelector('[part="label"]')).toBeNull();
    expect(root.querySelectorAll("vu-tooltip").length).toBe(2);
    expect(
      root.querySelector('[part="fallback"]') ?? root.querySelector('[part="icon"]'),
    ).not.toBeNull();
  });

  it("icon rail native hints skip vu-tooltip", () => {
    const root = mount(
      createHost({
        items: flatItems,
        collapsed: true,
        collapsedHints: "native",
        _isRail: true,
        _rovingKey: "home",
      }),
    );
    expect(root.querySelector("vu-tooltip")).toBeNull();
    const row = root.querySelector<HTMLButtonElement>('[part="row"]');
    expect(row?.getAttribute("title")).toBe("Home");
  });
});
