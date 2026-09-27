import { LitElement, html, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { PopoverController } from "../internals/controllers/popover-controller.js";
import { ICONS } from "../internals/icon.js";
import { canUseRaf, canUseResizeObserver, isServer } from "../internals/utils/env.js";
import {
  createMenuTypeaheadState,
  findFocusableDescendant,
  focusMenuRowAt,
  handleMenuKeydown,
  isMenuRowDisabled,
  menuOrientationFromPlacement,
  menuRowLabel,
  resetMenuTypeahead,
  type MenuTypeaheadState,
} from "../internals/utils/menu.js";
import { VuIcon } from "../icon/icon.js";
import { VuAdaptiveItem } from "../adaptive-item/adaptive-item.js";
import { adaptiveBarMeasureLayout, adaptiveBarParsePx } from "./internals/adaptive-bar-measure.js";
import { adaptiveBarStyles } from "./adaptive-bar.style.js";
import type {
  VuAdaptiveBarJustify,
  VuAdaptiveBarOpenChangeDetail,
  VuAdaptiveBarPlacement,
  VuAdaptiveBarSize,
  VuAdaptiveBarTone,
  VuAdaptiveBarVariant,
} from "./adaptive-bar.types.js";
import type { VuAdaptiveItemSize } from "../adaptive-item/adaptive-item.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";
import { reflectString } from "../internals/utils/reflect-string.js";


export type {
  VuAdaptiveBarJustify,
  VuAdaptiveBarOpenChangeDetail,
  VuAdaptiveBarPlacement,
  VuAdaptiveBarSize,
  VuAdaptiveBarTone,
  VuAdaptiveBarVariant,
} from "./adaptive-bar.types.js";

const ITEM_SELECTOR = "vu-adaptive-item, [data-adaptive-item]";

/**
 * @element vu-adaptive-bar
 *
 * @summary A responsive toolbar component that overflows extra items into a menu.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/adaptive-bar
 * @dependency vu-icon
 * @dependency vu-adaptive-item
 *
 * @uiVModel menuOpen vu-open-change detail=open
 *
 * @slot - Default slot for bar items. Use `<vu-adaptive-item>` or any element with `data-adaptive-item`.
 * @slot overflow - Receives items that no longer fit in the main bar (assigned automatically).
 *
 * @property {VuAdaptiveBarVariant} variant - Bar surface treatment. Default: `"flat"`.
 * @property {VuAdaptiveBarTone} tone - Neutral bar surface weight. Default: `"normal"`.
 * @property {VuAdaptiveBarSize} size - Bar padding, gap, and minimum height. Default: `"md"`.
 * @property {VuAdaptiveBarJustify} justify - Inline alignment of visible items. Default: `"start"`.
 * @property {VuAdaptiveItemSize | ""} itemSize - Optional override for `<vu-adaptive-item>` children without their own `size`. When omitted, follows `size`.
 * @property {boolean} menuOpen - Whether the overflow menu is open.
 * @property {boolean} fullyOverflowed - Read-only — true when every item is in the overflow menu.
 * @property {number} gapThreshold - Extra px buffer subtracted during measurement (padding/gaps are computed automatically). Default: `0`.
 * @property {string} moreLabel - Accessible name for the overflow trigger. Default: `"More"`.
 * @property {VuAdaptiveBarPlacement} placement - Preferred overflow popover side. Default: `"bottom"`.
 *
 * @fires {CustomEvent<VuAdaptiveBarOpenChangeDetail>} vu-open-change - Fired when the overflow menu opens or closes.
 * @method openMenu Opens the overflow menu.
 * @method closeMenu Closes the overflow menu.
 * @method toggleMenu Toggles the overflow menu state.
 * @method recalculateLayout Re-runs layout and overflow measurement.
 *
 * @csspart bar - Outer paint surface (background, border, shadow).
 * @csspart container - Inner flex row (padding, gap, item alignment).
 * @csspart items - Visible-item list wrapper (`role="list"`).
 * @csspart overflow-button - The overflow toggle button.
 * @csspart menu - The dropdown menu container.
 * @csspart menu-inner - Wrapper inside the dropdown menu.
 *
 * @cssproperty --adaptive-bar-bg - Bar background color.
 * @cssproperty --adaptive-bar-fg - Bar foreground color.
 * @cssproperty --adaptive-bar-py - Bar block padding.
 * @cssproperty --adaptive-bar-px - Bar inline padding.
 * @cssproperty --adaptive-bar-gap - Gap between bar items.
 * @cssproperty --adaptive-menu-bg - Overflow panel background.
 * @cssproperty --adaptive-menu-fg - Overflow panel foreground.
 * @cssproperty --adaptive-menu-radius - Overflow panel corner radius.
 */
@customElement("vu-adaptive-bar")
@withComponentPresets
export class VuAdaptiveBar extends LitElement {
  static override styles = adaptiveBarStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
    "vu-adaptive-item": VuAdaptiveItem,
  };

  private static _idCounter = 0;
  private readonly _autoId = `vu-adapt-bar-${VuAdaptiveBar._idCounter++}`;

  /** Bar surface treatment. */
  @property({ type: String, reflect: true })
  variant: VuAdaptiveBarVariant = "flat";

  /** Neutral bar surface weight. */
  @property({ type: String, reflect: true })
  tone: VuAdaptiveBarTone = "normal";

  /** Bar padding, gap, and minimum height. */
  @property({ type: String, reflect: true })
  size: VuAdaptiveBarSize = "md";

  /** Inline alignment of visible items. */
  @property({ type: String, reflect: true })
  justify: VuAdaptiveBarJustify = "start";

  /** Optional item size override; when unset, items follow `size`. */
  @property(reflectString)
  itemSize: VuAdaptiveItemSize | "" = "";

  /** Whether the overflow menu is open. */
  @property({ type: Boolean })
  menuOpen = false;

  /** Extra px buffer subtracted during measurement. */
  @property({ type: Number })
  gapThreshold = 0;

  /** Accessible name for the overflow trigger. */
  @property({ type: String })
  moreLabel = "More";

  /** Preferred overflow popover side. */
  @property({ type: String, reflect: true })
  placement: VuAdaptiveBarPlacement = "bottom";

  /** @internal */
  @state()
  private _fullyOverflowed = false;

  /** True when every tracked item is in the overflow menu. */
  get fullyOverflowed(): boolean {
    return this._fullyOverflowed;
  }

  /** @internal */
  private _ro?: ResizeObserver;

  /** @internal */
  private _itemElements: HTMLElement[] = [];

  /** @internal */
  private _scheduled = false;

  /** @internal */
  private _mo?: MutationObserver;

  /** @internal */
  @query(".overflow-menu")
  private overflowMenuEl!: HTMLElement;

  /** @internal */
  @query('slot[name="overflow"]')
  private overflowSlotEl!: HTMLSlotElement;

  /** @internal */
  private readonly _menuTypeahead: MenuTypeaheadState = createMenuTypeaheadState();

  /** Stable overflow menu id derived from host `id` or an auto fallback. */
  private get _menuId(): string {
    return `${this.id || this._autoId}-menu`;
  }

  /** @internal */
  private dropdownPopover = new PopoverController(this, {
    getAnchor: () => this,
    getPopover: () => this.overflowMenuEl,
    cssVarLeft: "--vu-dd-left",
    cssVarTop: "--vu-dd-top",
    cssVarWidth: "--vu-dd-width",
    getPlacement: () => this.placement,
    getAlign: () => "start",
    getGap: () => 6,
    getPadding: () => 8,
    getMatchAnchorWidth: () => true,
    getMaxWidthToViewport: () => true,
    getMaxWidthMode: () => "cap",
    getFlip: () => true,
    getFlipOrder: () => [],
    getAnimateReposition: () => true,
    getRepositionMs: () => 160,
    getCloseOnEscape: () => true,
    getCloseOnOutside: () => true,
    getRestoreFocusOnClose: () => true,
    focusOnOpen: () => this._focusOverflowItemAt(0),
    onOpenChange: (open) => {
      this.menuOpen = open;
      if (!open) resetMenuTypeahead(this._menuTypeahead);
      this.dispatchEvent(
        new CustomEvent<VuAdaptiveBarOpenChangeDetail>("vu-open-change", {
          detail: { open },
          bubbles: true,
          composed: true,
        }),
      );
    },
  });

  /** @protected */
  protected override firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);
    this.dropdownPopover.refreshTargets();
    this._relayItemSize();
  }

  /** @protected */
  override updated(changed: PropertyValues<this>): void {
    if (changed.has("itemSize") || changed.has("size")) this._relayItemSize();
    if (changed.has("placement")) this.dropdownPopover.refreshTargets();
    if (changed.has("size") || changed.has("gapThreshold")) this._scheduleMeasure();
  }

  /** @protected */
  override connectedCallback() {
    super.connectedCallback();

    this.addEventListener("vu-resize", this._onItemSizeChange);

    this._collectItems();

    if (isServer) {
      return;
    }

    if (canUseResizeObserver()) {
      this._ro = new ResizeObserver(() => this._scheduleMeasure());
      this._ro.observe(this);
    }

    this._mo = new MutationObserver(() => {
      this._collectItems();
      this._relayItemSize();
    });
    this._mo.observe(this, { childList: true, subtree: true });

    this.updateComplete.then(() => this._measure());
  }

  /** @protected */
  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("vu-resize", this._onItemSizeChange);
    this._ro?.disconnect();
    this._mo?.disconnect();
    resetMenuTypeahead(this._menuTypeahead);
  }

  /** @internal */
  private _onItemSizeChange = () => {
    this._scheduleMeasure();
  };

  /** @internal */
  private _effectiveItemSize(): VuAdaptiveItemSize {
    return this.itemSize || this.size;
  }

  /** @internal */
  private _relayItemSize() {
    const next = this._effectiveItemSize();
    for (const item of Array.from(this.querySelectorAll<VuAdaptiveItem>("vu-adaptive-item"))) {
      if (!item.hasAttribute("size")) {
        item.size = next;
      }
    }
  }

  /** @internal */
  private _collectItems() {
    this._itemElements = Array.from(this.querySelectorAll<HTMLElement>(ITEM_SELECTOR));
    this._scheduleMeasure();
  }

  /** @internal */
  private _scheduleMeasure() {
    if (this._scheduled || !canUseRaf()) return;
    this._scheduled = true;
    requestAnimationFrame(() => {
      this._scheduled = false;
      this._measure();
    });
  }

  /** @internal */
  private _measure() {
    if (this._itemElements.length === 0) {
      this._fullyOverflowed = false;
      return;
    }

    for (const item of this._itemElements) {
      item.removeAttribute("slot");
      this._clearPlainItemOverflowRole(item);
    }

    const mainItems = this.shadowRoot?.querySelector<HTMLElement>(".main-items");
    const btn = this.shadowRoot?.querySelector<HTMLElement>(".overflow-btn");
    if (!mainItems || !btn) return;

    const prevDisplay = btn.style.display;
    const prevVisibility = btn.style.visibility;
    const prevPointerEvents = btn.style.pointerEvents;
    btn.style.display = "flex";
    btn.style.visibility = "hidden";
    btn.style.pointerEvents = "none";

    const itemGap = adaptiveBarParsePx(getComputedStyle(mainItems).gap);
    const itemWidths = this._itemElements.map((el) => el.getBoundingClientRect().width);
    const availableWidth = mainItems.clientWidth;
    const { hiddenCount, fullyOverflowed } = adaptiveBarMeasureLayout({
      itemWidths,
      itemGap,
      availableWidth,
      buffer: this.gapThreshold,
    });

    const showOverflow = hiddenCount > 0;
    btn.style.display = showOverflow ? "flex" : "none";
    btn.style.visibility = showOverflow ? "" : prevVisibility;
    btn.style.pointerEvents = showOverflow ? "" : prevPointerEvents;
    if (!showOverflow) {
      btn.style.display = prevDisplay || "none";
    }

    const hidden = this._itemElements.slice(this._itemElements.length - hiddenCount);
    for (const el of hidden) {
      el.setAttribute("slot", "overflow");
      this._applyPlainItemOverflowRole(el);
    }

    this._fullyOverflowed = fullyOverflowed;

    if (!showOverflow) this.dropdownPopover.closePopover();
  }

  /** @internal */
  private _applyPlainItemOverflowRole(el: HTMLElement) {
    const focusable = findFocusableDescendant(el);
    if (focusable) focusable.setAttribute("role", "menuitem");
  }

  /** @internal */
  private _clearPlainItemOverflowRole(el: HTMLElement) {
    const focusable = findFocusableDescendant(el);
    if (focusable?.getAttribute("role") === "menuitem") focusable.removeAttribute("role");
  }

  /** @internal */
  private get _overflowFocusables(): HTMLElement[] {
    const assigned = this.overflowSlotEl?.assignedElements({ flatten: true }) ?? [];
    return assigned
      .filter((el): el is HTMLElement => el instanceof HTMLElement)
      .map((el) => findFocusableDescendant(el) ?? el)
      .filter((el) => !isMenuRowDisabled(el));
  }

  /** @internal */
  private _focusOverflowItemAt(index: number): void {
    focusMenuRowAt(this._overflowFocusables, index);
  }

  /** @internal */
  private _activeMenuElement(): Element | null {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement) || !this.contains(active)) return null;
    return active;
  }

  /** @internal */
  private _onMenuKeydown = (event: KeyboardEvent): void => {
    handleMenuKeydown(
      event,
      this._overflowFocusables,
      this._activeMenuElement(),
      this._menuTypeahead,
      (index) => this._focusOverflowItemAt(index),
      menuRowLabel,
      menuOrientationFromPlacement(this.placement),
    );
  };

  /** Opens the overflow menu. */
  openMenu() {
    this.dropdownPopover.openPopover();
  }

  /** Closes the overflow menu. */
  closeMenu() {
    this.dropdownPopover.closePopover();
  }

  /** Toggles the overflow menu. */
  toggleMenu() {
    this.dropdownPopover.toggle();
  }

  /** Re-runs layout and overflow measurement. */
  recalculateLayout() {
    this._measure();
  }

  /** @internal */
  private _onOverflowClick = () => {
    this.dropdownPopover.toggle();
  };

  /** @internal */
  private _onOverflowKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.dropdownPopover.toggle();
    }
  };

  /** @protected */
  override render() {
    const icon = this._fullyOverflowed ? ICONS.menu : ICONS.ellipsis;

    return html`
      <div part="bar">
        <div class="main-container" part="container">
          <div class="main-items" role="list" part="items">
            <slot></slot>
          </div>

          <div class="spacer"></div>

          <button
            type="button"
            class="overflow-btn"
            part="overflow-button"
            aria-label=${this.moreLabel}
            aria-haspopup="menu"
            .aria-expanded=${String(this.menuOpen)}
            aria-controls=${this._menuId}
            @click=${this._onOverflowClick}
            @keydown=${this._onOverflowKeydown}
          >
            <vu-icon icon=${icon} aria-hidden="true"></vu-icon>
          </button>
        </div>
      </div>

      <div
        id=${this._menuId}
        class="overflow-menu"
        @toggle=${this.dropdownPopover.onToggle}
        @keydown=${this._onMenuKeydown}
        popover="manual"
        part="menu"
        role="menu"
        ?inert=${!this.menuOpen}
        aria-label="Overflow menu items"
      >
        <div class="overflow-inner" part="menu-inner">
          <slot name="overflow"></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-adaptive-bar": VuAdaptiveBar;
  }
}
