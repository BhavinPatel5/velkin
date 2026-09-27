import { localized } from "@lit/localize";
import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, query, queryAll, state } from "lit/decorators.js";
import { msg, str } from "../internals/utils/localize.js";
import { isClient, isServer } from "../internals/utils/env.js";
import { PopoverController } from "../internals/controllers/popover-controller.js";
import { LayoutAnimateController } from "../internals/controllers/layout-animate-controller.js";
import { ICONS } from "../internals/icon.js";
import {
  createMenuTypeaheadState,
  focusMenuRowAt,
  handleMenuKeydown,
  resetMenuTypeahead,
  type MenuTypeaheadState,
} from "../internals/utils/menu.js";
import { VuIcon } from "../icon/icon.js";
import { VuDivider } from "../divider/divider.js";
import { VuBreadcrumbItem } from "../breadcrumb-item/breadcrumb-item.js";
import { breadcrumbStyles } from "./breadcrumb.style.js";
import {
  breadcrumbCollapseInput,
  breadcrumbHiddenCount,
  breadcrumbHiddenItems,
  breadcrumbIsCollapsed,
  breadcrumbLeadingKeep,
  breadcrumbLeadingVisible,
  breadcrumbTrailingKeep,
  breadcrumbTrailingVisible,
  type BreadcrumbCollapseInput,
} from "./internals/breadcrumb-collapse.js";
import {
  breadcrumbForwardAttributes,
  breadcrumbForwardSeparator,
} from "./internals/breadcrumb-coordinator.js";
import { renderBreadcrumbOverflow } from "./internals/breadcrumb-overflow.render.js";
import {
  breadcrumbCaptureWidths,
  breadcrumbDisposeResizeObserver,
  breadcrumbEnsureResizeObserver,
  breadcrumbRecomputeResponsive,
  breadcrumbRequestMeasure,
  breadcrumbScheduleResponsiveRecompute,
  type BreadcrumbResponsiveHost,
} from "./internals/breadcrumb-responsive.js";
import type {
  VuBreadcrumbRevealDetail,
  VuBreadcrumbOverflow,
  VuBreadcrumbSize,
} from "./breadcrumb.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuBreadcrumbRevealDetail,
  VuBreadcrumbOverflow,
  VuBreadcrumbSize,
} from "./breadcrumb.types.js";

const ITEM_TAG = "vu-breadcrumb-item";

/** Hoisted ellipsis icon — never re-allocated per render. */
const ELLIPSIS_ICON = html`<vu-icon icon=${ICONS.ellipsis} aria-hidden="true"></vu-icon>`;

/**
 * @element vu-breadcrumb
 *
 * @summary A breadcrumb component for navigation trails with optional collapse.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/breadcrumb
 * @dependency vu-breadcrumb-item
 * @dependency vu-icon
 *
 * @slot - One or more `<vu-breadcrumb-item>` children, in hierarchy order (root → leaf).
 *
 * @property {string} separator - Glyph between items; forwarded via `--breadcrumb-separator`. Default: `"/"`.
 * @property {VuBreadcrumbSize} size - Typography scale forwarded to children. Default: `"md"`.
 * @property {number} max - Collapse threshold; `0` never collapses by count. Default: `0`.
 * @property {number} itemsBefore - Leading items kept when collapsed; HTML attribute is `itemsbefore`. Default: `1`.
 * @property {number} itemsAfter - Trailing items kept when collapsed; HTML attribute is `itemsafter`. Default: `1`.
 * @property {boolean} responsive - Auto-collapse when the trail no longer fits. Default: `false`.
 * @property {VuBreadcrumbOverflow} overflow - Hidden-segment UI (`menu` | `inline`). Default: `"menu"`.
 * @property {boolean} expanded - Suspends collapse and reveals every item. Default: `false`.
 * @property {boolean} showExpandAction - Footer action to reveal the full trail when `overflow="menu"`. Default: `true`.
 * @property {string} expandActionLabel - Footer action label; empty uses the locale catalog.
 * @property {boolean} disabled - Dims the trail and disables pointer events. Default: `false`.
 * @property {string} label - Accessible name for the wrapping `<nav>`. Default: `"Breadcrumb"`.
 *
 * @csspart base - The `<nav>` wrapper.
 * @csspart list - The `role="list"` container holding items + ellipsis.
 * @csspart ellipsis - The `<li>` housing the overflow trigger; only present while collapsed.
 * @csspart ellipsis-separator - The leading separator inside the ellipsis tile.
 * @csspart ellipsis-button - The clickable button that opens the overflow menu or expands inline.
 * @csspart overflow-menu - The popover panel listing hidden segments (`overflow="menu"` only).
 * @csspart overflow-item - Each row button inside the overflow menu.
 * @csspart overflow-divider - Separator before the optional expand footer.
 * @csspart overflow-expand - Footer button that sets `expanded` to show the full trail.
 *
 * @cssproperty --breadcrumb-separator - Separator glyph used by both children and the ellipsis tile.
 *
 * @fires {CustomEvent<VuBreadcrumbRevealDetail>} vu-reveal - Fired when the full trail is revealed (`overflow="inline"` ellipsis click, or "Show full trail" in the menu).
 */
@localized()
@customElement("vu-breadcrumb")
@withComponentPresets
export class VuBreadcrumb extends LitElement {
  static override styles = breadcrumbStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
    "vu-divider": VuDivider,
    "vu-breadcrumb-item": VuBreadcrumbItem,
  };

  /** Glyph rendered between items; forwarded to every child via `--breadcrumb-separator`. */
  @property({ type: String, reflect: true })
  separator = "/";

  /** Forwarded to every child for uniform typography. */
  @property({ type: String, reflect: true })
  size: VuBreadcrumbSize = "md";

  /** Collapse threshold — `items.length > max` engages collapse. `0` never collapses by count. */
  @property({ type: Number })
  max = 0;

  /** Leading items kept when collapsed; HTML attribute is `itemsbefore`. */
  @property({ type: Number })
  itemsBefore = 1;

  /** Trailing items kept when collapsed; HTML attribute is `itemsafter`. */
  @property({ type: Number })
  itemsAfter = 1;

  /** Auto-collapse when the trail no longer fits its container width. */
  @property({ type: Boolean, reflect: true })
  responsive = false;

  /** `menu` opens a dropdown for hidden segments; `inline` expands the full trail on ellipsis click. */
  @property({ type: String, reflect: true })
  overflow: VuBreadcrumbOverflow = "menu";

  /** Suspends collapse and reveals every item. */
  @property({ type: Boolean, reflect: true })
  expanded = false;

  /** When `overflow="menu"`, shows a footer that sets `expanded` to reveal the full trail. */
  @property({ type: Boolean })
  showExpandAction = true;

  /** Label for the expand footer; empty uses the built-in "Show full trail" copy. */
  @property({ type: String })
  expandActionLabel = "";

  /** Dims the trail; disables pointer events at the wrapper level. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Accessible name for the wrapping `<nav>`; empty uses the locale catalog. */
  @property({ type: String })
  label = "";

  /** True while the overflow menu popover is open (`overflow="menu"`). */
  @state()
  private _menuOpen = false;

  /** Live cache of slotted children; @state so a slot mutation triggers re-render and the derived getters recompute. */
  @state()
  private _slottedChildren: Element[] = [];

  /** True when responsive width measurement says the full trail no longer fits. */
  @state()
  _responsiveCollapse = false;

  /** When true, the next render forces uncollapsed mode so widths can be measured honestly. */
  @state()
  _measuring = false;

  @query('[part="list"]')
  _list!: HTMLElement | null;

  @query('[part="ellipsis-button"]')
  private _ellipsisButton!: HTMLButtonElement | null;

  @query('[part="overflow-menu"]')
  private _overflowMenu!: HTMLElement | null;

  /** All focusable rows inside the overflow menu — used by arrow-key + type-ahead navigation. */
  @queryAll('[part="overflow-menu"] [role="menuitem"]:not([disabled])')
  private _menuItems!: NodeListOf<HTMLButtonElement>;

  private readonly _layoutAnim = new LayoutAnimateController(this, {
    preset: "fade",
  });

  private _overflowPop = new PopoverController(this, {
    getAnchor: () => this._ellipsisButton,
    getPopover: () =>
      this.overflow === "menu" ? this._overflowMenu : null,
    cssVarLeft: "--vu-bc-left",
    cssVarTop: "--vu-bc-top",
    cssVarWidth: "--vu-bc-width",
    placement: "bottom",
    align: "start",
    gap: 4,
    padding: 8,
    matchAnchorWidth: false,
    maxWidthToViewport: true,
    maxWidthMode: "cap",
    closeOnEscape: true,
    closeOnOutside: true,
    restoreFocusOnClose: true,
    focusOnOpen: () => this._focusMenuItemAt(0),
    onOpenChange: (open) => {
      this._menuOpen = open;
    },
  });

  /** Snapshots collapsed state across updates so we only refresh popover targets when it flips. */
  private _wasCollapsed = false;

  /** Cached natural widths per slotted item; refilled during a measure pass. */
  _itemWidths = new WeakMap<VuBreadcrumbItem, number>();

  /** True once we've successfully cached widths for the current item set. */
  _widthsCached = false;

  /** ResizeObserver bound to this host; created only while `responsive` is true. */
  _resizeObserver: ResizeObserver | null = null;

  /** rAF token for coalescing rapid resize/measure callbacks. */
  _rafToken = 0;

  private readonly _menuTypeahead: MenuTypeaheadState = createMenuTypeaheadState();

  private get _responsiveHost(): BreadcrumbResponsiveHost {
    return this as BreadcrumbResponsiveHost;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (isServer) return;
    if (this.responsive) {
      breadcrumbEnsureResizeObserver(this._responsiveHost, () => this._scheduleResponsiveRecompute());
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    breadcrumbDisposeResizeObserver(this._responsiveHost);
    if (isClient() && this._rafToken) cancelAnimationFrame(this._rafToken);
    resetMenuTypeahead(this._menuTypeahead);
  }

  override firstUpdated(): void {
    this._overflowPop.refreshTargets();
    this._wasCollapsed = this._isCollapsed;
    if (this.responsive) this._requestMeasureAfterUpdate();
    this._forwardAttributes();
  }

  override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("disabled")) {
      if (this.disabled) {
        this.setAttribute("aria-disabled", "true");
      } else {
        this.removeAttribute("aria-disabled");
      }
    }

    if (changed.has("responsive") && !this.responsive) {
      this._responsiveCollapse = false;
    }
  }

  private _requestMeasure(): void {
    breadcrumbRequestMeasure(this._responsiveHost);
  }

  private _scheduleResponsiveRecompute(): void {
    breadcrumbScheduleResponsiveRecompute(this._responsiveHost, this._items);
  }

  /** @internal Test hook — recomputes responsive collapse from cached widths. */
  private _recomputeResponsive(): void {
    breadcrumbRecomputeResponsive(this._responsiveHost, this._items);
  }

  /** Kick measure after the current update settles (avoid Lit change-in-update). */
  private _requestMeasureAfterUpdate(): void {
    requestAnimationFrame(() => {
      if (!this.isConnected || !this.responsive) return;
      this._requestMeasure();
    });
  }

  override updated(changed: PropertyValues<this>): void {
    if (
      changed.has("size") ||
      changed.has("max") ||
      changed.has("itemsBefore") ||
      changed.has("itemsAfter") ||
      changed.has("expanded") ||
      changed.has("_responsiveCollapse") ||
      changed.has("_measuring")
    ) {
      this._forwardAttributes();
    }
    if (changed.has("separator")) breadcrumbForwardSeparator(this, this.separator);

    const widthDeps = changed.has("size") || changed.has("separator");
    if (widthDeps) this._widthsCached = false;

    if (changed.has("responsive")) {
      if (this.responsive) {
        breadcrumbEnsureResizeObserver(this._responsiveHost, () => this._scheduleResponsiveRecompute());
        this._requestMeasureAfterUpdate();
      } else {
        breadcrumbDisposeResizeObserver(this._responsiveHost);
      }
    } else if (widthDeps && this.responsive) {
      this._requestMeasureAfterUpdate();
    }

    if (this._measuring) {
      breadcrumbCaptureWidths(this._responsiveHost, this._items);
      this._measuring = false;
      breadcrumbRecomputeResponsive(this._responsiveHost, this._items);
    }

    const collapsed = this._isCollapsed;
    if (changed.has("expanded") && this.expanded) {
      this._overflowPop.closePopover("api");
    }
    if (!collapsed && this._overflowPop.open) {
      this._overflowPop.closePopover("api");
    }
    if (collapsed !== this._wasCollapsed) {
      this._overflowPop.refreshTargets();
      this._wasCollapsed = collapsed;
    }
  }

  /** Slotted children filtered to actual `vu-breadcrumb-item` elements. */
  private get _items(): VuBreadcrumbItem[] {
    return this._slottedChildren.filter(
      (el): el is VuBreadcrumbItem => el.tagName.toLowerCase() === ITEM_TAG,
    );
  }

  /** Collapse snapshot derived from host props + measure state. */
  private get _collapseInput(): BreadcrumbCollapseInput {
    return breadcrumbCollapseInput(
      this,
      this._items.length,
      this._measuring,
      this._responsiveCollapse,
    );
  }

  /** Leading items kept; clamped to `[0, items.length]`. */
  private get _leadingKeep(): number {
    return breadcrumbLeadingKeep(this._collapseInput);
  }

  /** Trailing items kept; clamped so leading + trailing never exceeds the total. */
  private get _trailingKeep(): number {
    return breadcrumbTrailingKeep(this._collapseInput);
  }

  private get _isCollapsed(): boolean {
    return breadcrumbIsCollapsed(this._collapseInput);
  }

  private get _leadingVisible(): number {
    return breadcrumbLeadingVisible(this._collapseInput);
  }

  private get _trailingVisible(): number {
    return breadcrumbTrailingVisible(this._collapseInput);
  }

  private get _hiddenCount(): number {
    return breadcrumbHiddenCount(this._collapseInput);
  }

  private get _hiddenItems(): VuBreadcrumbItem[] {
    return breadcrumbHiddenItems(this._items, this._collapseInput);
  }

  /** Mirrors group props onto every slotted item AND positions them via 'order'. */
  private _forwardAttributes(): void {
    breadcrumbForwardAttributes(this._items, {
      size: this.size,
      collapsed: this._isCollapsed,
      leading: this._leadingVisible,
      trailing: this._trailingVisible,
    });
  }

  private _onSlotChange = (event: Event): void => {
    this._slottedChildren = (event.currentTarget as HTMLSlotElement).assignedElements({
      flatten: false,
    });
    this._forwardAttributes();
    this._widthsCached = false;
    if (this.responsive) this._requestMeasure();
  };

  private _expandAll(): void {
    const revealed = this._hiddenCount;
    this.expanded = true;
    this.dispatchEvent(
      new CustomEvent<VuBreadcrumbRevealDetail>("vu-reveal", {
        detail: { revealed },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onEllipsisClick = (): void => {
    if (this.overflow === "inline") {
      this._expandAll();
      return;
    }
    this._overflowPop.toggle();
    requestAnimationFrame(() => {
      this._overflowPop.position();
    });
  };

  /** Activates the slotted item the same way a direct link click would (fires `vu-activate` on the item). */
  private _activateSlottedItem(item: VuBreadcrumbItem): void {
    const anchor = item.shadowRoot?.querySelector(
      'a[part="link"]',
    ) as HTMLAnchorElement | undefined;
    anchor?.click();
  }

  private _onOverflowItemClick = (item: VuBreadcrumbItem): void => {
    this._overflowPop.closePopover("api");
    this._activateSlottedItem(item);
  };

  private _onShowFullTrailFromMenu = (): void => {
    this._overflowPop.closePopover("api");
    this._expandAll();
  };

  /** Moves focus to the menuitem at `index`, wrapping around the ends. */
  private _focusMenuItemAt(index: number): void {
    focusMenuRowAt(Array.from(this._menuItems), index);
  }

  /** ARIA APG menu pattern: arrow nav + Home/End jumps + type-ahead letter search. */
  private _onMenuKeydown = (event: KeyboardEvent): void => {
    const items = Array.from(this._menuItems);
    handleMenuKeydown(
      event,
      items,
      this.shadowRoot?.activeElement ?? null,
      this._menuTypeahead,
      (index) => this._focusMenuItemAt(index),
      (el) => (el.textContent ?? "").trim(),
    );
  };

  private _overflowItemLabel(item: VuBreadcrumbItem): string {
    return item.textContent?.trim() || item.href || "…";
  }

  override render() {
    const collapsed = this._isCollapsed;
    const ellipsisOrder = collapsed ? this._leadingVisible + 1 : 0;
    const hiddenCount = this._hiddenCount;
    const menuMode = this.overflow === "menu";
    const expandFooterLabel =
      this.expandActionLabel.trim() ||
      String(msg("Show full trail", { desc: "Overflow menu action to expand the breadcrumb trail." }));

    const ellipsisAriaLabel = menuMode
      ? hiddenCount === 1
        ? String(
            msg(str`Open menu — ${hiddenCount} hidden segment`, {
              desc: "Ellipsis control when one segment is hidden.",
            }),
          )
        : String(
            msg(str`Open menu — ${hiddenCount} hidden segments`, {
              desc: "Ellipsis control when multiple segments are hidden.",
            }),
          )
      : hiddenCount === 1
        ? String(
            msg(str`Show ${hiddenCount} more breadcrumb`, {
              desc: "Inline ellipsis when one segment is hidden.",
            }),
          )
        : String(
            msg(str`Show ${hiddenCount} more breadcrumbs`, {
              desc: "Inline ellipsis when multiple segments are hidden.",
            }),
          );

    const hiddenItems = this._hiddenItems;

    return html`
      <nav
        part="base"
        aria-label=${this.label.trim() ||
        msg("Breadcrumb", { desc: "Accessible name for the breadcrumb navigation." })}
      >
        <div part="list" role="list">
          <slot @slotchange=${this._onSlotChange}></slot>
          ${renderBreadcrumbOverflow({
            layoutAnimateHost: this,
            collapsed,
            ellipsisOrder,
            hiddenCount,
            menuMode,
            menuOpen: this._menuOpen,
            expandFooterLabel,
            ellipsisAriaLabel,
            hiddenItems,
            showExpandAction: this.showExpandAction,
            ellipsisIcon: ELLIPSIS_ICON,
            overflowItemLabel: (item) => this._overflowItemLabel(item),
            onEllipsisClick: this._onEllipsisClick,
            onOverflowToggle: this._overflowPop.onToggle,
            onMenuKeydown: this._onMenuKeydown,
            onOverflowItemClick: (item) => this._onOverflowItemClick(item),
            onShowFullTrailFromMenu: this._onShowFullTrailFromMenu,
          })}
        </div>
      </nav>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "vu-breadcrumb": VuBreadcrumb;
  }
}
