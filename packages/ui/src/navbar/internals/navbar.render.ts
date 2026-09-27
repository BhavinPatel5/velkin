import { html, nothing, type TemplateResult } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { repeat } from "lit/directives/repeat.js";
import { when } from "lit/directives/when.js";
import { ICONS } from "../../internals/icon.js";
import type { VuIconFlip } from "../../icon/icon.types.js";
import type { VuNavPanelItem } from "../../nav-panel/nav-panel.types.js";
import {
  VU_NAVBAR_OVERFLOW_ID,
  type VuNavbarIcon,
  type VuNavbarItem,
  type VuNavbarLabels,
  type VuNavbarSize,
  type VuNavbarTone,
} from "../navbar.types.js";
import { navbarItemId, navbarItemRel, navbarItemRouteActive, navbarPath } from "./navbar.utils.js";

/** Host surface for navbar shadow markup and interaction callbacks. */
export type NavNavbarRenderHost = {
  readonly items: VuNavbarItem[];
  readonly activeRoute: string | null;
  readonly visibleItems: VuNavbarItem[];
  readonly overflowItems: VuNavbarItem[];
  readonly activePath: string[];
  readonly topMenuOpen: boolean;
  readonly nestedMenuOpen: boolean;
  readonly lastTopId: string | null;
  readonly drawerOpen: boolean;
  readonly topMenuId: string;
  readonly nestedMenuId: string;
  readonly topMenuItems: VuNavbarItem[];
  readonly nestedMenuItems: VuNavbarItem[];
  readonly navPanelItems: VuNavPanelItem[];
  readonly navPanelValue: string;
  readonly customEvent: boolean;
  readonly labels: VuNavbarLabels;
  readonly isMegaPanel: boolean;
  readonly megaColumns: number;
  readonly sticky: boolean;
  readonly condense: boolean;
  readonly stuck: boolean;
  readonly size: VuNavbarSize;
  readonly tone: VuNavbarTone;
  onTopLinkEnter(event: Event, item: VuNavbarItem, index: number): void;
  onTopLinkLeave(event: Event, item: VuNavbarItem): void;
  onTopLinkClick(event: MouseEvent, item: VuNavbarItem, index: number): void;
  onTopMenuToggle(event: Event): void;
  onTopMenuEnter(): void;
  onTopMenuLeave(): void;
  onNestedMenuToggle(event: Event): void;
  onNestedMenuEnter(): void;
  onNestedMenuLeave(): void;
  onMenuRowEnter(event: Event, item: VuNavbarItem, parentPath: string | null): void;
  onMenuRowClick(event: Event, item: VuNavbarItem, parentPath: string | null): void;
  onMenubarKeydown(event: KeyboardEvent): void;
  onTopMenuKeydown(event: KeyboardEvent): void;
  onNestedMenuKeydown(event: KeyboardEvent): void;
  onMobileDrawerClose(event: CustomEvent): void;
  onNavPanelChange(event: CustomEvent): void;
  onBarSlotChange(event: Event): void;
  activate(item: VuNavbarItem, path: string | null, event?: Event): void;
  toggleMenu(): void;
};

function renderIcon(node: VuNavbarIcon | null | undefined): TemplateResult | typeof nothing {
  if (node == null) return nothing;
  if (typeof node === "string") {
    return html`<vu-icon .icon=${node} aria-hidden="true"></vu-icon>`;
  }
  if (typeof node === "object" && "icon" in node && typeof node.icon === "string") {
    return html`<vu-icon
      .icon=${node.icon}
      ?inline=${node.inline ?? false}
      .flip=${(node.flip ?? "") as VuIconFlip}
      .rotate=${node.rotate ?? "0"}
      aria-hidden="true"
    ></vu-icon>`;
  }
  return node as TemplateResult;
}

function topLinkTag(item: VuNavbarItem, hasSub: boolean): "button" | "a" {
  if (!hasSub && (item.href || item.route)) return "a";
  return "button";
}

function renderTopButton(
  host: NavNavbarRenderHost,
  item: VuNavbarItem,
  index: number,
): TemplateResult {
  const id = navbarItemId(item);
  const isMenuOpen = host.topMenuOpen && host.activePath[0] === id;
  const isRouteActive = navbarItemRouteActive(host.activeRoute, item);
  const hasSub = !!item.submenu?.length;
  const tag = topLinkTag(item, hasSub);
  const href = item.href ?? (hasSub ? undefined : item.route);
  const target = item.external ? "_blank" : item.target;
  const rel = navbarItemRel(item);
  const classes = classMap({
    btn: true,
    active: isRouteActive,
    open: isMenuOpen,
  });

  const content = html`
    ${renderIcon(item.iconL)}
    ${when(item.id !== VU_NAVBAR_OVERFLOW_ID, () => html`<span>${item.label}</span>`)}
    ${when(hasSub && item.id !== VU_NAVBAR_OVERFLOW_ID, () =>
      renderIcon(item.iconR ?? { icon: ICONS.chevronDown }),
    )}
    ${when(item.external && !hasSub, () => renderIcon({ icon: ICONS.openInNew }))}
  `;

  if (tag === "a") {
    return html`
      <a
        part="nav-link"
        class=${classes}
        href=${href!}
        target=${ifDefined(target)}
        rel=${ifDefined(rel)}
        role="menuitem"
        aria-current=${ifDefined(isRouteActive ? "page" : undefined)}
        aria-haspopup=${hasSub ? "menu" : "false"}
        aria-expanded=${hasSub && isMenuOpen ? "true" : "false"}
        aria-controls=${ifDefined(hasSub ? host.topMenuId : undefined)}
        data-path=${id}
        tabindex=${index === 0 ? "0" : "-1"}
        @mouseenter=${(e: Event) => host.onTopLinkEnter(e, item, index)}
        @mouseleave=${(e: Event) => host.onTopLinkLeave(e, item)}
        @click=${(e: MouseEvent) => {
          if (item.action || host.customEvent || item.route) e.preventDefault();
          host.onTopLinkClick(e, item, index);
        }}
      >
        ${content}
      </a>
    `;
  }

  return html`
    <button
      part="nav-link"
      class=${classes}
      type="button"
      role="menuitem"
      aria-current=${ifDefined(isRouteActive ? "page" : undefined)}
      aria-haspopup=${hasSub ? "menu" : "false"}
      aria-expanded=${hasSub && isMenuOpen ? "true" : "false"}
      aria-controls=${ifDefined(hasSub ? host.topMenuId : undefined)}
      data-path=${id}
      tabindex=${index === 0 ? "0" : "-1"}
      @mouseenter=${(e: Event) => host.onTopLinkEnter(e, item, index)}
      @mouseleave=${(e: Event) => host.onTopLinkLeave(e, item)}
      @click=${(e: MouseEvent) => host.onTopLinkClick(e, item, index)}
    >
      ${content}
    </button>
  `;
}

function renderMenuRowMeta(item: VuNavbarItem, hasSub: boolean): TemplateResult | typeof nothing {
  const showShortcut = !!item.shortcut && !hasSub;
  const showBadge = !!item.badge && !hasSub;
  const showExternal = !!item.external && !hasSub;
  const showChevron = hasSub;
  const showIconR = !hasSub && !!item.iconR;

  if (!showShortcut && !showBadge && !showExternal && !showChevron && !showIconR) {
    return nothing;
  }

  return html`
    <span class="cell-R">
      ${when(showShortcut, () => html`<span class="shortcut">${item.shortcut}</span>`)}
      ${when(showBadge, () => html`<span class="badge">${item.badge}</span>`)}
      ${when(showExternal, () => renderIcon({ icon: ICONS.openInNew }))}
      ${when(showChevron, () => renderIcon({ icon: ICONS.chevronRight }))}
      ${when(showIconR, () => renderIcon(item.iconR))}
    </span>
  `;
}

function renderMenuRow(
  host: NavNavbarRenderHost,
  item: VuNavbarItem,
  parentPath: string | null,
): TemplateResult {
  if (item.divider) return html`<vu-divider class="divider"></vu-divider>`;
  const thisPath = navbarPath(parentPath, item);
  const disabled = !!item.disabled;
  const hasSub = Array.isArray(item.submenu) && item.submenu.length > 0;
  const isRouteActive = navbarItemRouteActive(host.activeRoute, item);
  const hasIcon = !!item.iconL;
  const href = item.href ?? (!hasSub ? item.route : undefined);
  const target = item.external ? "_blank" : item.target;
  const rel = navbarItemRel(item);
  const classes = classMap({
    "menu-row": true,
    "no-icon": !hasIcon,
    active: isRouteActive,
  });

  const body = html`
    ${when(hasIcon, () => html`<span class="cell-state">${renderIcon(item.iconL)}</span>`)}
    <span class="cell-label">
      <span>${item.label ?? ""}</span>
      ${when(item.sublabel, () => html`<span class="sub">${item.sublabel}</span>`)}
    </span>
    ${renderMenuRowMeta(item, hasSub)}
  `;

  if (href && !hasSub) {
    return html`
      <a
        class=${classes}
        role="menuitem"
        tabindex="-1"
        data-path=${thisPath}
        href=${href}
        target=${ifDefined(target)}
        rel=${ifDefined(rel)}
        aria-disabled=${disabled ? "true" : "false"}
        aria-haspopup="false"
        aria-current=${ifDefined(isRouteActive ? "page" : undefined)}
        @mouseenter=${(e: Event) => host.onMenuRowEnter(e, item, parentPath)}
        @click=${(e: Event) => {
          if (item.action || host.customEvent || item.route) e.preventDefault();
          host.onMenuRowClick(e, item, parentPath);
        }}
      >
        ${body}
      </a>
    `;
  }

  return html`
    <button
      class=${classes}
      type="button"
      role="menuitem"
      tabindex="-1"
      data-path=${thisPath}
      aria-disabled=${disabled ? "true" : "false"}
      aria-haspopup=${hasSub ? "menu" : "false"}
      aria-current=${ifDefined(isRouteActive && !hasSub ? "page" : undefined)}
      aria-expanded=${hasSub && host.activePath.includes(thisPath) ? "true" : "false"}
      aria-controls=${ifDefined(hasSub ? host.nestedMenuId : undefined)}
      @mouseenter=${(e: Event) => host.onMenuRowEnter(e, item, parentPath)}
      @click=${(e: Event) => host.onMenuRowClick(e, item, parentPath)}
    >
      ${body}
    </button>
  `;
}

function renderMegaColumn(
  host: NavNavbarRenderHost,
  item: VuNavbarItem,
  parentPath: string | null,
): TemplateResult {
  if (item.divider) return html``;
  const columnPath = navbarPath(parentPath, item);
  const leaves = item.submenu?.length ? item.submenu : [item];
  return html`
    <div class="mega-col" role="group" aria-label=${item.label ?? columnPath}>
      ${when(item.label, () => html`<div class="mega-heading">${item.label}</div>`)}
      ${when(item.sublabel, () => html`<div class="mega-sub">${item.sublabel}</div>`)}
      <div class="mega-rows">
        ${repeat(
          leaves.filter((leaf) => !leaf.divider),
          (leaf) => `${columnPath}-${navbarItemId(leaf)}`,
          (leaf) => renderMenuRow(host, leaf, columnPath),
        )}
      </div>
    </div>
  `;
}

function renderDesktopBar(host: NavNavbarRenderHost): TemplateResult {
  const allInOverflow = host.visibleItems.length === 0 && host.overflowItems.length > 0;
  const menuBtn: VuNavbarItem = allInOverflow
    ? {
        id: VU_NAVBAR_OVERFLOW_ID,
        iconL: { icon: ICONS.menu },
        submenu: host.overflowItems,
      }
    : {
        id: VU_NAVBAR_OVERFLOW_ID,
        iconL: { icon: ICONS.ellipsis },
        submenu: host.overflowItems,
      };

  return html`
    <nav
      class=${classMap({
        bar: true,
        "is-stuck": host.sticky && host.condense && host.stuck,
      })}
      part="nav-bar"
      aria-label=${host.labels.main}
    >
      <div class="slot-pre">
        <slot name="prepend" @slotchange=${host.onBarSlotChange}></slot>
      </div>
      <div
        class="bar-items"
        role="menubar"
        aria-label=${host.labels.menubar}
        @keydown=${host.onMenubarKeydown}
      >
        ${repeat(
          host.visibleItems,
          (it, i) => navbarItemId(it) + "-" + i,
          (it, i) => renderTopButton(host, it, i),
        )}
        ${when(host.overflowItems.length > 0, () => renderTopButton(host, menuBtn, host.visibleItems.length))}
      </div>
      <div class="slot-post">
        <slot name="append" @slotchange=${host.onBarSlotChange}></slot>
      </div>
    </nav>
  `;
}

function renderTopMenu(host: NavNavbarRenderHost): TemplateResult {
  const topId = host.activePath[0] ?? host.lastTopId;
  return html`
    <div
      id=${host.topMenuId}
      part="top-menu"
      class=${classMap({
        "menu-panel": true,
        "menu-mega": host.isMegaPanel,
      })}
      data-cols=${ifDefined(host.isMegaPanel ? String(host.megaColumns) : undefined)}
      popover="manual"
      role="menu"
      aria-label=${topId ? host.labels.submenuFor(topId) : host.labels.navigation}
      @toggle=${host.onTopMenuToggle}
      @mouseenter=${host.onTopMenuEnter}
      @mouseleave=${host.onTopMenuLeave}
      @keydown=${host.onTopMenuKeydown}
    >
      <div class=${classMap({ "menu-scroll": !host.isMegaPanel, "mega-grid": host.isMegaPanel })}>
        ${repeat(
          host.isMegaPanel ? host.topMenuItems.filter((it) => !it.divider) : [],
          (it) => `${topId}-mega-${navbarItemId(it)}`,
          (it) => renderMegaColumn(host, it, topId ?? null),
        )}
        ${repeat(
          host.isMegaPanel ? [] : host.topMenuItems,
          (it, i) => `${topId}-${i}-${navbarItemId(it)}`,
          (it) => renderMenuRow(host, it, topId ?? null),
        )}
      </div>
    </div>
  `;
}

function renderNestedMenu(host: NavNavbarRenderHost): TemplateResult {
  const show = host.activePath.length >= 2 && !host.isMegaPanel;
  const parentPath = show ? host.activePath[host.activePath.length - 1] : "";
  return html`
    <div
      id=${host.nestedMenuId}
      part="nested-menu"
      class="menu-panel"
      data-kind="nested"
      popover="manual"
      role="menu"
      aria-label=${host.labels.nestedSubmenu}
      data-popover-ignore-outside
      @toggle=${host.onNestedMenuToggle}
      @mouseenter=${host.onNestedMenuEnter}
      @mouseleave=${host.onNestedMenuLeave}
      @keydown=${host.onNestedMenuKeydown}
    >
      <div class="menu-scroll">
        ${repeat(
          show ? host.nestedMenuItems : [],
          (it, i) => `${parentPath}-${i}-${navbarItemId(it)}`,
          (it) => renderMenuRow(host, it, parentPath),
        )}
      </div>
    </div>
  `;
}

function renderMobileNavPanel(host: NavNavbarRenderHost): TemplateResult {
  return html`
    <vu-nav-panel
      .label=${host.labels.navigation}
      .size=${host.size}
      .items=${host.navPanelItems}
      .value=${host.navPanelValue}
      @vu-change=${host.onNavPanelChange}
    ></vu-nav-panel>
  `;
}

function renderMobileDrawer(host: NavNavbarRenderHost): TemplateResult {
  return html`
    <vu-drawer
      .open=${host.drawerOpen}
      side="left"
      closable
      .tone=${host.tone}
      .size=${host.size}
      .closeLabel=${host.labels.close}
      .ariaLabel=${host.labels.navigation}
      @vu-close=${host.onMobileDrawerClose}
    >
      <div slot="body" class="m-drawer-body">
        <slot name="header"></slot>
        ${renderMobileNavPanel(host)}
        <slot name="footer"></slot>
      </div>
    </vu-drawer>
  `;
}

function renderMobile(host: NavNavbarRenderHost): TemplateResult {
  return html`
    <div class="m-top">
      <button
        class="m-btn"
        type="button"
        aria-label=${host.labels.menu}
        .aria-expanded=${String(host.drawerOpen)}
        @click=${() => host.toggleMenu()}
      >
        <vu-icon .icon=${ICONS.menu}></vu-icon>
      </button>
      <div class="slot-pre">
        <slot name="prepend-mobile"></slot>
      </div>
      <div class="slot-post">
        <slot name="append-mobile"></slot>
      </div>
    </div>
    ${renderMobileDrawer(host)}
  `;
}

/** Root navbar shadow template. */
export function renderNavbar(host: NavNavbarRenderHost): TemplateResult {
  return html`
    <div class="desktop" part="nav-desktop">
      ${renderDesktopBar(host)} ${renderTopMenu(host)} ${renderNestedMenu(host)}
    </div>
    <div class="mobile" part="nav-mobile">${renderMobile(host)}</div>
  `;
}
