import { localized } from "@lit/localize";
import { LitElement, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import type { PopoverController } from "../internals/controllers/popover-controller.js";
import { isClient } from "../internals/utils/env.js";
import { VuDrawer } from "../drawer/drawer.js";
import { VuIcon } from "../icon/icon.js";
import { VuDivider } from "../divider/divider.js";
import { VuNavPanel } from "../nav-panel/nav-panel.js";
import type { VuDrawerCloseDetail } from "../drawer/drawer.types.js";
import type { VuNavPanelChangeDetail } from "../nav-panel/nav-panel.types.js";
import { activateNavbarItem } from "./internals/navbar.activate.js";
import {
  navbarActivateFocusedRow,
  navbarBarLinkItems,
  navbarCloseNestedMenu,
  navbarFocusNestedMenuRow,
  navbarFocusTopMenuRow,
  navbarHoverHandlers,
  navbarOnBarSlotChange,
  navbarOnMenubarKeydown,
  navbarOnMenuRowClick,
  navbarOnMenuRowEnter,
  navbarOnMobileDrawerClose,
  navbarOnNavPanelChange,
  navbarOnNestedMenuKeydown,
  navbarOnTopLinkClick,
  navbarOnTopLinkEnter,
  navbarOnTopLinkLeave,
  navbarOnTopMenuKeydown,
  navbarOpenNestedFromRow,
  type NavbarHandlerHost,
} from "./internals/navbar.handlers.js";
import { createNavbarTypeaheadState } from "./internals/navbar-keyboard.js";
import { buildNavbarLabels } from "./internals/navbar.labels.js";
import {
  navbarCloseDesktopMenus,
  navbarOnConnected,
  navbarOnDisconnected,
  navbarOnFirstUpdated,
  navbarOnLocationChange,
  navbarOnUpdated,
  navbarSyncResponsive,
  navbarWillUpdate,
  type NavbarLifecycleHost,
} from "./internals/navbar.lifecycle.js";
import { measureNavbarOverflow } from "./internals/navbar.overflow.js";
import type { NavbarOverlayHost } from "./internals/navbar.overlay.js";
import type { NavbarPathHost } from "./internals/navbar.paths.js";
import { resolveNavbarMenuTrigger } from "./internals/navbar-pointer.js";
import {
  createNavbarPopoverControllers,
  type NavbarPopoverSetupHost,
} from "./internals/navbar.popovers-setup.js";
import { renderNavbar } from "./internals/navbar.render.js";
import {
  navbarItemAtPath,
  navbarItemsToNavPanel,
  navbarNavPanelValue,
  navbarRootItems,
} from "./internals/navbar.utils.js";
import { navbarStyles } from "./navbar.style.js";
import type {
  VuNavbarAlign,
  VuNavbarIndicator,
  VuNavbarItem,
  VuNavbarItemActivateDetail,
  VuNavbarLabels,
  VuNavbarMenuTrigger,
  VuNavbarNavigateDetail,
  VuNavbarPlacement,
  VuNavbarRouteMatch,
  VuNavbarSize,
  VuNavbarTone,
  VuNavbarVariant,
} from "./navbar.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuNavbarAction,
  VuNavbarActionContext,
  VuNavbarAlign,
  VuNavbarIcon,
  VuNavbarIndicator,
  VuNavbarItem,
  VuNavbarItemActivateDetail,
  VuNavbarNavigateDetail,
  VuNavbarLabels,
  VuNavbarMenuTrigger,
  VuNavbarPanelVariant,
  VuNavbarPlacement,
  VuNavbarRouteMatch,
  VuNavbarSize,
  VuNavbarTone,
  VuNavbarVariant,
} from "./navbar.types.js";

/**
 * @element vu-navbar
 *
 * @summary A responsive navbar component with desktop menus and a mobile drawer.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/navbar
 * @dependency vu-icon
 * @dependency vu-nav-panel
 * @dependency vu-drawer
 *
 * @uiVModel activeRoute vu-navigate detail=route
 *
 * @slot prepend - Content before navigation items on desktop.
 * @slot append - Content after navigation items on desktop.
 * @slot prepend-mobile - Content before navigation items in mobile mode.
 * @slot append-mobile - Content after navigation items in mobile mode.
 * @slot header - Header content for the mobile drawer.
 * @slot footer - Footer content for the mobile drawer.
 *
 * @property {VuNavbarItem[]} items - Full menu item model.
 * @property {VuNavbarVariant} variant - Bar surface recipe (`flat`/`outline`/`elevated` plus chrome extras `transparent`/`inset`). Default: `"flat"`.
 * @property {VuNavbarTone} tone - Neutral surface weight; also relays into flyout panels. Default: `"normal"`.
 * @property {VuNavbarSize} size - Bar height and link padding scale; also relays into flyout panels. Default: `"md"`.
 * @property {VuNavbarIndicator} indicator - Active top-level link affordance (`underline`/`pill`/`dot`/`none`); `pill` is selection chrome — not `radius="full"`. Default: `"underline"`.
 * @property {boolean} contained - Centers the bar row with a max inline width. Default: `false`.
 * @property {string | null} activeRoute - Active route for highlighting (`activeroute` attr).
 * @property {number} breakpoint - Mobile breakpoint in pixels. Default: `768`.
 * @property {boolean} isMobile - Mobile layout flag (`ismobile` attr).
 * @property {number} overflowThreshold - Minimum visible items before overflow mode. Default: `0`.
 * @property {string} justifyBar - CSS `justify-content` for the outer bar (`justifybar` attr).
 * @property {string} justifyBarItems - CSS `justify-content` for the item row (`justifybaritems` attr).
 * @property {boolean} pwaOverlay - Window-controls-overlay placement (`pwaoverlay` attr). Default: `false`.
 * @property {boolean} customEvent - Emits `vu-activate` instead of `vu-navigate` (`customevent` attr). Default: `false`.
 * @property {VuNavbarMenuTrigger} menuTrigger - Desktop submenu open interaction (`menutrigger` attr). Default: `"hover"`.
 * @property {VuNavbarPlacement} placement - Preferred side for top dropdown. Default: `"bottom"`.
 * @property {VuNavbarAlign} align - Alignment along the trigger edge. Default: `"start"`.
 * @property {number} offset - Gap in px between trigger and dropdown. Default: `8`.
 * @property {boolean} sticky - Pins to the top of the scroll container. Default: `false`.
 * @property {boolean} condense - Elevates and shortens the bar when `sticky`. Default: `false`.
 * @property {string} arialabel - Mobile drawer accessible name (`arialabel` attr).
 * @property {string} menuLabel - Mobile menu toggle accessible name (`menulabel` attr).
 * @property {string} closeLabel - Mobile drawer close accessible name (`closelabel` attr).
 * @property {string} menubarLabel - Desktop menubar row accessible name (`menubarlabel` attr).
 *
 * @method openMenu - Opens the mobile drawer menu.
 * @method closeMenu - Closes mobile drawer and desktop submenus.
 * @method toggleMenu - Toggles the mobile drawer menu.
 * @method closeMenus - Closes all open menus.
 *
 * @fires {CustomEvent<VuNavbarNavigateDetail>} vu-navigate - When a route item is activated.
 * @fires {CustomEvent<VuNavbarItemActivateDetail>} vu-activate - When an item is activated in `customEvent` mode.
 *
 * @csspart nav-desktop - Desktop navigation container.
 * @csspart nav-mobile - Mobile navigation container.
 * @csspart nav-bar - Navigation bar container.
 * @csspart nav-link - Desktop top-level nav control.
 * @csspart top-menu - Desktop dropdown panel.
 * @csspart nested-menu - Nested flyout panel.
 *
 * @cssproperty --navbar-menu-left - Top menu inline position.
 * @cssproperty --navbar-menu-top - Top menu block position.
 * @cssproperty --navbar-submenu-left - Nested menu inline position.
 * @cssproperty --navbar-submenu-top - Nested menu block position.
 * @cssproperty --navbar-bg - Bar surface background.
 * @cssproperty --navbar-fg - Bar foreground.
 * @cssproperty --navbar-max-width - Max inline size when `contained`.
 */
@localized()
@customElement("vu-navbar")
@withComponentPresets
export class VuNavbar extends LitElement {
  static override styles = navbarStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
    "vu-divider": VuDivider,
    "vu-nav-panel": VuNavPanel,
    "vu-drawer": VuDrawer,
  };

  /** Full menu item model. */
  @property({ type: Array }) items: VuNavbarItem[] = [];

  /** Bar surface paint recipe. */
  @property({ type: String, reflect: true }) variant: VuNavbarVariant = "flat";

  /** Neutral surface weight. */
  @property({ type: String, reflect: true }) tone: VuNavbarTone = "normal";

  /** Bar height and link padding scale. */
  @property({ type: String, reflect: true }) size: VuNavbarSize = "md";

  /** Active top-level link affordance (`underline`/`pill`/`dot`/`none`). `pill` is selection chrome — not `radius="full"`. */
  @property({ type: String, reflect: true }) indicator: VuNavbarIndicator = "underline";

  /** Centers the bar row with a max inline width. */
  @property({ type: Boolean, reflect: true }) contained = false;

  /** Active route for highlighting. */
  @property({ type: String }) activeRoute: string | null = null;

  /** Mobile breakpoint in pixels. */
  @property({ type: Number }) breakpoint = 768;

  /** Mobile layout flag. */
  @property({ type: Boolean, reflect: true }) isMobile = false;

  /** Minimum visible items before overflow mode. */
  @property({ type: Number }) overflowThreshold = 0;

  /** CSS `justify-content` for the outer bar. */
  @property({ type: String }) justifyBar = "space-between";

  /** CSS `justify-content` for the item row. */
  @property({ type: String }) justifyBarItems = "center";

  /** Window-controls-overlay placement. */
  @property({ type: Boolean, reflect: true }) pwaOverlay = false;

  /** Emits `vu-activate` instead of `vu-navigate`. */
  @property({ type: Boolean, reflect: true }) customEvent = false;

  /** Desktop submenu open interaction. */
  @property({ type: String, reflect: true }) menuTrigger: VuNavbarMenuTrigger = "hover";

  /** Preferred side for top dropdown. */
  @property({ type: String, reflect: true }) placement: VuNavbarPlacement = "bottom";

  /** Alignment along the trigger edge. */
  @property({ type: String, reflect: true }) align: VuNavbarAlign = "start";

  /** Gap in px between trigger and dropdown. */
  @property({ type: Number }) offset = 8;

  /** Pins to the top of the scroll container. */
  @property({ type: Boolean, reflect: true }) sticky = false;

  /** Elevates and shortens the bar when `sticky`. */
  @property({ type: Boolean, reflect: true }) condense = false;

  /** Mobile drawer accessible name. */
  @property({ type: String }) override ariaLabel = "";

  /** Mobile menu toggle accessible name. */
  @property({ type: String }) menuLabel = "";

  /** Mobile drawer close accessible name. */
  @property({ type: String }) closeLabel = "";

  /** Desktop menubar row accessible name. */
  @property({ type: String }) menubarLabel = "";

  /** Desktop open path (topId[/childId[/...]]). */
  @state() activePath: string[] = [];

  /** Whether the top dropdown popover is open */
  @state() topMenuOpen = false;

  /** Whether the nested flyout popover is open */
  @state() nestedMenuOpen = false;

  /** Desktop items that fit in the bar */
  @state() visibleItems: VuNavbarItem[] = [];

  /** Desktop items moved into the overflow menu */
  @state() overflowItems: VuNavbarItem[] = [];

  /** Last top submenu id for panel content while closing */
  @state() lastTopId: string | null = null;

  /** Mobile drawer open */
  @state() drawerOpen = false;

  /** True when `sticky` + `condense` and the host has scrolled past its natural position */
  @state() stuck = false;

  /** True when a top submenu was recently open (hover chaining); not rendered. */
  lastTopHadSubmenuOpen = false;

  /** Overflow measurement flags; not rendered. */
  _isMeasuring = false;
  _measurementRequested = false;

  private static _idCounter = 0;
  readonly topMenuId = `vu-navbar-top-${VuNavbar._idCounter++}`;
  readonly nestedMenuId = `vu-navbar-nested-${VuNavbar._idCounter++}`;

  @query(".bar") barEl!: HTMLElement;
  @query('[part="top-menu"]') _topMenuEl!: HTMLElement;
  @query('[part="nested-menu"]') _nestedMenuEl!: HTMLElement;

  _topAnchorEl: HTMLElement | null = null;
  _nestedAnchorEl: HTMLElement | null = null;
  _pendingTopId: string | null = null;
  _ready = false;
  _syncingTopPopover = false;
  _syncingNestedPopover = false;
  _overlayOpen = false;
  _hoverTopLink = false;
  _hoverTopMenu = false;
  _hoverNestedMenu = false;
  _openTimeout: number | null = null;
  _closeTimeout: number | null = null;

  readonly _menuTypeahead = createNavbarTypeaheadState();
  private _stickyHandle: NavbarLifecycleHost["_stickyHandle"] = null;
  private readonly _winResize = () => navbarSyncResponsive(this._lifecycleHost);
  private readonly _onLocationChange = () => navbarOnLocationChange(this._lifecycleHost);

  private readonly _topPopover: PopoverController;
  private readonly _nestedPopover: PopoverController;

  constructor() {
    super();
    this.isMobile = isClient() && window.innerWidth <= this.breakpoint;
    const popovers = createNavbarPopoverControllers(this._popoverHost);
    this._topPopover = popovers.top;
    this._nestedPopover = popovers.nested;
  }

  private get _handlerHost(): NavbarHandlerHost {
    return this as unknown as NavbarHandlerHost;
  }

  private get _lifecycleHost(): NavbarLifecycleHost {
    return this as unknown as NavbarLifecycleHost;
  }

  private get _overlayHost(): NavbarOverlayHost {
    return this as unknown as NavbarOverlayHost;
  }

  private get _pathHost(): NavbarPathHost {
    return this as unknown as NavbarPathHost;
  }

  private get _popoverHost(): NavbarPopoverSetupHost {
    return this as unknown as NavbarPopoverSetupHost;
  }

  get effectiveMenuTrigger(): "hover" | "click" {
    return resolveNavbarMenuTrigger(this.menuTrigger);
  }

  get labels(): VuNavbarLabels {
    return buildNavbarLabels(this);
  }

  closeAfterActivate(): void {
    this._closeMobileDrawer();
    this._closeDesktopMenus();
  }

  refreshNestedPopoverTargets(): void {
    this._nestedPopover.refreshTargets();
  }

  get activeTopItem(): VuNavbarItem | undefined {
    const topId = this.activePath[0] ?? this.lastTopId;
    if (!topId) return undefined;
    return navbarItemAtPath(this._roots(), [topId]);
  }

  get isMegaPanel(): boolean {
    return this.activeTopItem?.panel === "mega";
  }

  get megaColumns(): number {
    return this.activeTopItem?.columns ?? 3;
  }

  setStuck(stuck: boolean): void {
    this.stuck = stuck;
  }

  _roots(): VuNavbarItem[] {
    return navbarRootItems(this.visibleItems, this.overflowItems);
  }

  get topMenuItems(): VuNavbarItem[] {
    const topId = this.activePath[0] ?? this.lastTopId;
    if (!topId) return [];
    return navbarItemAtPath(this._roots(), [topId])?.submenu ?? [];
  }

  get nestedMenuItems(): VuNavbarItem[] {
    if (this.activePath.length < 2) return [];
    const key = this.activePath[this.activePath.length - 1];
    return navbarItemAtPath(this._roots(), key.split("/"))?.submenu ?? [];
  }

  get navPanelItems() {
    return navbarItemsToNavPanel(this.items);
  }

  get navPanelValue(): string {
    return navbarNavPanelValue(this.activeRoute, this.navPanelItems, this.items);
  }

  openMenu(): void {
    this.setDrawerOpen(true);
  }

  closeMenu(): void {
    this._closeMobileDrawer();
    this._closeDesktopMenus();
  }

  toggleMenu(): void {
    this.setDrawerOpen(!this.drawerOpen);
  }

  closeMenus(): void {
    this.closeMenu();
  }

  openTopMenu(): void {
    if (this.isMobile || !this._pendingTopId || !this._topAnchorEl) return;
    const item = navbarItemAtPath(this._roots(), [this._pendingTopId]);
    if (!item?.submenu?.length) return;
    this.activePath = [this._pendingTopId];
    this.lastTopId = this._pendingTopId;
    this.lastTopHadSubmenuOpen = true;
    this.topMenuOpen = true;
  }

  closeTopMenu(): void {
    this.topMenuOpen = false;
    this.nestedMenuOpen = false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    navbarOnConnected(this._lifecycleHost);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    navbarOnDisconnected(this._lifecycleHost);
  }

  override firstUpdated(): void {
    navbarOnFirstUpdated(this._lifecycleHost);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    navbarWillUpdate(this._lifecycleHost, changed);
  }

  protected override updated(changed: PropertyValues<this>): void {
    navbarOnUpdated(this._lifecycleHost, changed);
  }

  override render() {
    return renderNavbar(this);
  }

  setVisibleItems(items: VuNavbarItem[]): void {
    this.visibleItems = items;
  }

  setOverflowItems(items: VuNavbarItem[]): void {
    this.overflowItems = items;
  }

  setDrawerOpen(open: boolean): void {
    this.drawerOpen = open;
  }

  onTopLinkEnter = (e: Event, item: VuNavbarItem, index: number): void =>
    navbarOnTopLinkEnter(this._handlerHost, e, item, index);

  onTopLinkLeave = (e: Event, item: VuNavbarItem): void => {
    navbarOnTopLinkLeave(this._handlerHost);
    void e;
    void item;
  };

  onTopLinkClick = (e: MouseEvent, item: VuNavbarItem, index: number): void =>
    navbarOnTopLinkClick(this._handlerHost, e, item, index);

  onTopMenuToggle = (e: Event): void => this._topPopover.onToggle(e);
  onTopMenuEnter = (): void => navbarHoverHandlers.onTopMenuEnter(this);
  onTopMenuLeave = (): void => navbarHoverHandlers.onTopMenuLeave(this);
  onNestedMenuToggle = (e: Event): void => this._nestedPopover.onToggle(e);
  onNestedMenuEnter = (): void => navbarHoverHandlers.onNestedMenuEnter(this);
  onNestedMenuLeave = (): void => navbarHoverHandlers.onNestedMenuLeave(this);

  onMenuRowEnter = (e: Event, item: VuNavbarItem, parentPath: string | null): void =>
    navbarOnMenuRowEnter(this._handlerHost, e, item, parentPath);

  onMenuRowClick = (e: Event, item: VuNavbarItem, parentPath: string | null): void =>
    navbarOnMenuRowClick(this._handlerHost, e, item, parentPath);

  onMobileDrawerClose = (e: CustomEvent<VuDrawerCloseDetail>): void =>
    navbarOnMobileDrawerClose(this._handlerHost, e);

  onBarSlotChange = (): void => navbarOnBarSlotChange(this._handlerHost);

  onNavPanelChange = (e: CustomEvent<VuNavPanelChangeDetail>): void =>
    navbarOnNavPanelChange(this._handlerHost, e);

  onMenubarKeydown = (e: KeyboardEvent): void =>
    navbarOnMenubarKeydown(this._handlerHost, e);

  onTopMenuKeydown = (e: KeyboardEvent): void =>
    navbarOnTopMenuKeydown(this._handlerHost, e);

  onNestedMenuKeydown = (e: KeyboardEvent): void =>
    navbarOnNestedMenuKeydown(this._handlerHost, e);

  closeNestedMenu(): void {
    navbarCloseNestedMenu(this._handlerHost);
  }

  focusTopMenuRow(index: number): void {
    navbarFocusTopMenuRow(this._handlerHost, index);
  }

  focusNestedMenuRow(index: number): void {
    navbarFocusNestedMenuRow(this._handlerHost, index);
  }

  openNestedFromRow(row: HTMLElement): void {
    navbarOpenNestedFromRow(this._handlerHost, row);
  }

  activateFocusedRow(row: HTMLElement): void {
    navbarActivateFocusedRow(this._handlerHost, row);
  }

  closeDesktopMenus(): void {
    this._closeDesktopMenus();
  }

  activate = (item: VuNavbarItem, path: string | null, event?: Event): void => {
    activateNavbarItem(this, item, path, event);
  };

  _barLinkItems(): VuNavbarItem[] {
    return navbarBarLinkItems(this._handlerHost);
  }

  private _closeDesktopMenus(resetHoverState = true): void {
    navbarCloseDesktopMenus(this._lifecycleHost, resetHoverState);
  }

  private _closeMobileDrawer(): void {
    if (!this.isMobile) return;
    this.setDrawerOpen(false);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-navbar": VuNavbar;
  }
}
