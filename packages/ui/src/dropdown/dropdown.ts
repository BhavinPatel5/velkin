import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, query, queryAssignedElements } from "lit/decorators.js";
import { PopoverController } from "../internals/controllers/popover-controller.js";
import {
  createMenuTypeaheadState,
  handleMenuKeydown,
  isMenuRowDisabled,
  menuOrientationFromPlacement,
  menuRowLabel,
  menuSideFromElement,
  resetMenuTypeahead,
  type MenuTypeaheadState,
} from "../internals/utils/menu.js";
import { VuDivider } from "../divider/divider.js";
import { VuDropdownItem } from "../dropdown-item/dropdown-item.js";
import { dropdownStyles } from "./dropdown.style.js";
import { syncDropdownItems, type DropdownItemRelayHost } from "./internals/dropdown-item-relay.js";
import {
  collectDropdownMenuRows,
  findActiveDropdownMenuRow,
  focusDropdownMenuRowAt,
  resetDropdownRovingTabindex,
} from "./internals/dropdown-menu-nav.js";
import {
  motionDurationMs,
  readMotionDurationMs,
} from "../internals/utils/motion.js";
import {
  applyNestedDropdownSelect,
  clearDropdownDefaultSelections,
  dropdownItemToken,
  highlightDropdownSelection,
  syncDropdownRadioGroup,
  syncDropdownSelectedFromValue,
} from "./internals/dropdown-selection.js";
import {
  clearDropdownHoverTimeouts,
  detachDropdownTriggerListeners,
  onDropdownBodyEnter,
  onDropdownBodyLeave,
  onDropdownTriggerClick,
  onDropdownTriggerControlClick,
  onDropdownTriggerEnter,
  onDropdownTriggerKeydown,
  onDropdownTriggerLeave,
  onDropdownTriggerSlotChange,
  resolveDropdownTriggerControl,
  syncDropdownSubmenuDismissGuard,
  syncDropdownTriggerA11y,
  type DropdownTriggerHost,
} from "./internals/dropdown-trigger.js";
import type { VuDropdownItemSelectDetail } from "../dropdown-item/dropdown-item.types.js";
import type {
  VuDropdownAlign,
  VuDropdownOpenChangeDetail,
  VuDropdownItemColor,
  VuDropdownPlacement,
  VuDropdownRadius,
  VuDropdownSelectDetail,
  VuDropdownSize,
  VuDropdownTone,
  VuDropdownTrigger,
  VuDropdownVariant,
  VuDropdownWidthPreset,
} from "./dropdown.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

const ITEM_SELECTOR = "vu-dropdown-item";

const VIEWPORT_PAD = 8;

export type {
  VuDropdownAlign,
  VuDropdownOpenChangeDetail,
  VuDropdownItemColor,
  VuDropdownPlacement,
  VuDropdownRadius,
  VuDropdownSelectDetail,
  VuDropdownSize,
  VuDropdownTone,
  VuDropdownTrigger,
  VuDropdownVariant,
  VuDropdownWidthPreset,
} from "./dropdown.types.js";
export type {
  VuDropdownSubmenuHoverDetail,
  VuDropdownSubmenuHoverPhase,
  VuDropdownSubmenuHost,
} from "./dropdown.types.js";

/**
 * @element vu-dropdown
 *
 * @summary A dropdown menu component with trigger slot and keyboard navigation.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/dropdown
 * @dependency vu-dropdown-item
 * @dependency vu-divider
 *
 * @uiVModel value vu-select detail=value
 * @uiVModel open vu-open-change detail=open
 *
 * @slot trigger - Clickable or hoverable control (typically `<vu-button>`).
 * @slot - Menu rows (`<vu-dropdown-item>`), `<vu-divider>`, or `role="menuitem"`.
 *
 * @csspart trigger - Wrapper around the trigger slot.
 * @csspart body - Positioned menu panel (`role="menu"`).
 * @csspart body-scroll - Scrollable inner wrapper when content exceeds max height.
 *
 * @cssproperty --dropdown-left - Physical viewport `left` (PopoverController).
 * @cssproperty --dropdown-top - Physical viewport `top` (PopoverController).
 * @cssproperty --dropdown-width - Panel inline size (`width` preset or custom length).
 * @cssproperty --dropdown-max-height - Max block size of the scroll region (default `320px`).
 * @cssproperty --dropdown-surface-bg - Panel background.
 * @cssproperty --dropdown-surface-fg - Panel foreground.
 * @cssproperty --dropdown-radius - Panel corner radius (from `size`).
 * @cssproperty --dropdown-pad - Padding inside the panel.
 *
 * @property {VuDropdownTrigger} trigger - Open interaction mode. Default: `"click"`.
 * @property {VuDropdownPlacement} placement - Preferred side before collision flip. Default: `"bottom"`.
 * @property {VuDropdownAlign} align - Alignment along the trigger edge. Default: `"center"`.
 * @property {boolean} open - Whether the menu is visible. Default: `false`.
 * @property {string} value - Last selected row token. Default: `""`.
 * @property {VuDropdownWidthPreset | string} width - Panel inline size preset or CSS length. Default: `"auto"`.
 * @property {VuDropdownVariant} variant - Panel surface paint recipe. Default: `"elevated"`.
 * @property {VuDropdownTone} tone - Neutral surface weight. Default: `"normal"`.
 * @property {VuDropdownSize} size - Panel padding scale; forwards to items without their own. Default: `"md"`.
 * @property {VuDropdownItemColor} itemColor - Row intent forwarded to items without their own. Default: `"default"`.
 * @property {VuDropdownRadius} radius - Panel corner preset (`sm`/`md`/`lg`; Role C′ omits `none`/`full`). Default: `"md"`.
 * @property {string} maxHeight - Max scroll region block size; empty uses stylesheet default. Default: `""`.
 * @property {boolean} closeOnSelect - Close after a row activates. Default: `true`.
 * @property {number} offset - Gap in px between trigger and panel. Default: `8`.
 * @property {boolean} disabled - Blocks open and closes an open menu. Default: `false`.
 *
 * @method show - Sets `open` to true.
 * @method hide - Sets `open` to false.
 * @method toggle - Toggles `open`.
 * @method focus - Focuses the slotted trigger control.
 *
 * @fires {CustomEvent<VuDropdownOpenChangeDetail>} vu-open-change - When `open` changes (`detail.open`).
 * @fires {CustomEvent<VuDropdownSelectDetail>} vu-select - When a row is activated.
 * @fires {CustomEvent<void>} vu-open - When the menu begins opening.
 * @fires {CustomEvent<void>} vu-close - When the menu begins closing.
 */
@customElement("vu-dropdown")
@withComponentPresets
export class VuDropdown extends LitElement {
  static override styles = dropdownStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-dropdown-item": VuDropdownItem,
    "vu-divider": VuDivider,
  };

  private static _idCounter = 0;
  private readonly _bodyId = `vu-dd-${VuDropdown._idCounter++}`;

  /** Open interaction mode. */
  @property({ type: String, reflect: true })
  trigger: VuDropdownTrigger = "click";

  /** Preferred side before collision flip. */
  @property({ type: String, reflect: true })
  placement: VuDropdownPlacement = "bottom";

  /** Alignment along the trigger edge. */
  @property({ type: String, reflect: true })
  align: VuDropdownAlign = "center";

  /** Whether the menu is visible. */
  @property({ type: Boolean, reflect: true })
  open = false;

  /** Last activated row token. */
  @property({ type: String })
  value = "";

  /** Panel inline size preset or CSS length. */
  @property({ type: String, reflect: true })
  width: VuDropdownWidthPreset | string = "auto";

  /** Panel surface paint recipe. */
  @property({ type: String, reflect: true })
  variant: VuDropdownVariant = "elevated";

  /** Neutral surface weight. */
  @property({ type: String, reflect: true })
  tone: VuDropdownTone = "normal";

  /** Panel padding scale; forwards `size` to items without their own. */
  @property({ type: String, reflect: true })
  size: VuDropdownSize = "md";

  /** Row intent forwarded to items without their own. */
  @property({ type: String, reflect: true })
  itemColor: VuDropdownItemColor = "default";

  /** Panel corner radius preset. */
  @property({ type: String, reflect: true })
  radius: VuDropdownRadius = "md";

  /** Max scroll region block size; empty uses stylesheet default. */
  @property({ type: String })
  maxHeight = "";

  /** Close after a row activates. */
  @property({ type: Boolean })
  closeOnSelect = true;

  /** Gap in px between trigger and panel. */
  @property({ type: Number })
  offset = 8;

  /** Blocks open and closes an open menu. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  @query('[part="trigger"]')
  private _triggerWrap!: HTMLElement;

  @query('slot[name="trigger"]')
  private _triggerSlot!: HTMLSlotElement;

  @query('[part="body"]')
  private _bodyEl!: HTMLElement;

  @query("slot:not([name])")
  private _menuSlot!: HTMLSlotElement;

  @queryAssignedElements({ flatten: true, selector: ITEM_SELECTOR })
  private _items!: VuDropdownItem[];

  private readonly _typeahead: MenuTypeaheadState = createMenuTypeaheadState();

  /** Hover flags for open/close scheduling — not rendered; keep off `@state`. */
  _hoverTrigger = false;
  _hoverBody = false;

  private _openTimeout: number | null = null;
  private _closeTimeout: number | null = null;
  private _ready = false;
  private _syncingFromController = false;
  private _triggerControl: HTMLElement | null = null;
  private _submenuAnchor: HTMLElement | null = null;

  private readonly _onTriggerKeydown = (e: KeyboardEvent) =>
    onDropdownTriggerKeydown(this._triggerHost, e);

  private readonly _onTriggerControlClick = (e: MouseEvent) =>
    onDropdownTriggerControlClick(this._triggerHost, e);

  private get _triggerHost(): DropdownTriggerHost {
    return this as unknown as DropdownTriggerHost;
  }

  private get _relayHost(): DropdownItemRelayHost {
    return this as unknown as DropdownItemRelayHost;
  }

  private get _isSubmenu(): boolean {
    return this.trigger === "submenu";
  }

  private get _widthPreset(): VuDropdownWidthPreset | null {
    return this.width === "auto" || this.width === "trigger" ? this.width : null;
  }

  private readonly _popover = new PopoverController(this, {
    getAnchor: () => this._submenuAnchor ?? this._triggerControl ?? this._triggerWrap,
    getPopover: () => this._bodyEl,
    cssVarLeft: "--dropdown-left",
    cssVarTop: "--dropdown-top",
    cssVarWidth: "--dropdown-width",
    getPlacement: () => this.placement,
    getAlign: () => this.align,
    getGap: () => this.offset,
    getPadding: () => VIEWPORT_PAD,
    getMatchAnchorWidth: () => this._widthPreset === "trigger",
    getFlip: () => true,
    getPreset: () => "scale",
    getCloseOnEscape: () => true,
    getCloseOnOutside: () => true,
    getRestoreFocusOnClose: () => !this._isSubmenu,
    focusOnOpen: () => this._focusMenuRowAt(0),
    maxWidthToViewport: true,
    maxWidthMode: "cap",
    flipOrder: ["bottom", "top", "right", "left"],
    animateReposition: true,
    getRepositionMs: () => motionDurationMs(readMotionDurationMs(this, "normal")),
    sideAttr: "data-side",
    respectReducedMotion: true,
    onOpenChange: (next) => {
      this._syncingFromController = true;
      this.open = next;
      this._syncingFromController = false;
      this._emitOpenChange(next);
      if (!next) {
        this._hoverTrigger = false;
        this._hoverBody = false;
        clearDropdownHoverTimeouts(this._triggerHost);
        resetMenuTypeahead(this._typeahead);
        this._resetRovingTabindex();
      }
      syncDropdownTriggerA11y(this._triggerHost);
      if (next) queueMicrotask(() => this._syncLayoutVars());
    },
  });

  override firstUpdated(_changed: PropertyValues): void {
    this._ready = true;
    this._syncLayoutVars();
    this._syncItems();
    this._syncSelectedFromValue();
    resolveDropdownTriggerControl(this._triggerHost);
    this._popover.refreshTargets();
    syncDropdownTriggerA11y(this._triggerHost);
    this._applyOpenToController(false);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    syncDropdownSubmenuDismissGuard(this._triggerHost);
  }

  override willUpdate(changed: PropertyValues): void {
    if (changed.has("disabled")) {
      if (this.disabled) {
        this.setAttribute("aria-disabled", "true");
      } else {
        this.removeAttribute("aria-disabled");
      }
    }
  }

  override updated(changed: PropertyValues): void {
    if (changed.has("trigger")) {
      syncDropdownSubmenuDismissGuard(this._triggerHost);
    }

    if (changed.has("width") || changed.has("maxHeight")) {
      this._syncLayoutVars();
    }

    if (changed.has("size") || changed.has("itemColor")) {
      this._syncItems();
    }

    if (changed.has("value")) {
      this._syncSelectedFromValue();
    }

    if (
      this._ready &&
      this.open &&
      (changed.has("placement") ||
        changed.has("align") ||
        changed.has("offset") ||
        changed.has("width"))
    ) {
      this._popover.refreshTargets();
    }

    if (changed.has("open")) {
      this._applyOpenToController(Boolean(changed.get("open")));
    }

    if (changed.has("trigger") || changed.has("disabled")) {
      resolveDropdownTriggerControl(this._triggerHost);
      syncDropdownTriggerA11y(this._triggerHost);
    }

    if (changed.has("disabled") && this.disabled && this.open) {
      this.hide();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearDropdownHoverTimeouts(this._triggerHost);
    resetMenuTypeahead(this._typeahead);
    detachDropdownTriggerListeners(this._triggerHost);
    if (typeof this._bodyEl?.animate === "function" && this._popover.open) {
      try {
        this._popover.closePopover("api");
      } catch {}
    }
    this._ready = false;
  }

  /** Sets `open` to true. */
  show(): void {
    if (this.disabled) return;
    this.open = true;
  }

  /** Sets `open` to false. */
  hide(): void {
    this.open = false;
    clearDropdownHoverTimeouts(this._triggerHost);
  }

  /** Toggles `open`. */
  toggle(): void {
    if (this.disabled) return;
    if (this.open) this.hide();
    else this.show();
  }

  /** Focuses the slotted trigger control, or the submenu anchor when `trigger="submenu"`. */
  override focus(): void {
    if (this._isSubmenu) {
      this._submenuAnchor?.focus();
      return;
    }
    (this._triggerControl ?? this._triggerWrap)?.focus();
  }

  /** @internal Binds the flyout anchor when used as a nested submenu (`trigger="submenu"`). */
  bindSubmenuAnchor(el: HTMLElement): void {
    this._submenuAnchor = el;
    if (this._ready) this._popover.refreshTargets();
  }

  /** Collects focusable menu rows in slot order (includes disabled; skips dividers). */
  private _menuRows(): HTMLElement[] {
    const assigned = this._menuSlot?.assignedElements({ flatten: true }) ?? [];
    return collectDropdownMenuRows(assigned);
  }

  private _focusMenuRowAt(index: number): void {
    focusDropdownMenuRowAt(this._menuRows(), index);
  }

  private _resetRovingTabindex(): void {
    resetDropdownRovingTabindex(this._menuRows());
  }

  private _itemToken(el: VuDropdownItem): string {
    return dropdownItemToken(el);
  }

  /** Mirrors host `value` onto matching item `selected` / `checked` state (includes nested rows). */
  private _syncSelectedFromValue(): void {
    syncDropdownSelectedFromValue(this.value, this._allItems());
  }

  /** Every `vu-dropdown-item` under this menu, including nested flyouts. */
  private _allItems(): VuDropdownItem[] {
    return [...this.querySelectorAll("vu-dropdown-item")].filter(
      (el): el is VuDropdownItem => el instanceof VuDropdownItem,
    );
  }

  private _clearDefaultSelections(): void {
    clearDropdownDefaultSelections(this._items ?? []);
  }

  /** Syncs root `value` / `selected` from a nested flyout pick without closing the root menu. */
  private _applyNestedSelect(detail: VuDropdownSelectDetail): void {
    applyNestedDropdownSelect(detail, this._items ?? [], (value) => {
      this.value = value;
    });
  }

  private _syncRadioGroup(selected: VuDropdownItem): void {
    syncDropdownRadioGroup(selected, this._items ?? []);
  }

  private _highlightSelection(row: HTMLElement): void {
    if (!(row instanceof VuDropdownItem)) return;
    highlightDropdownSelection(row, this._items ?? []);
  }

  private _syncItems(): void {
    syncDropdownItems(this._relayHost);
  }

  /** @internal Excludes this host when relaying props onto nested submenu flyouts. */
  isSameMenuFlyout(flyout: Element): boolean {
    return flyout === this;
  }

  private _onMenuSlotChange = (): void => {
    this._syncItems();
    this._syncSelectedFromValue();
    if (this.open) this._focusMenuRowAt(0);
  };

  /** Mirrors `width` / `maxHeight` props onto host CSS variables. */
  private _syncLayoutVars(): void {
    const preset = this._widthPreset;
    if (preset === "trigger") {
      if (!this.open) this.style.removeProperty("--dropdown-width");
    } else if (preset === "auto") {
      this.style.removeProperty("--dropdown-width");
    } else {
      this.style.setProperty("--dropdown-width", this.width);
    }

    if (this.maxHeight.trim()) {
      this.style.setProperty("--dropdown-max-height", this.maxHeight.trim());
    } else {
      this.style.removeProperty("--dropdown-max-height");
    }
  }

  private _applyOpenToController(previousOpen: boolean): void {
    if (!this._ready || this._syncingFromController) return;
    if (this.open && !this._popover.open) {
      if (this.disabled) {
        this._syncingFromController = true;
        this.open = false;
        this._syncingFromController = false;
        return;
      }
      this._popover.openPopover();
      return;
    }
    if (!this.open && (previousOpen || this._popover.open)) {
      this._popover.closePopover("api");
    }
  }

  private _emitOpenChange(open: boolean): void {
    this.dispatchEvent(
      new CustomEvent(open ? "vu-open" : "vu-close", {
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(
      new CustomEvent<VuDropdownOpenChangeDetail>("vu-open-change", {
        detail: { open },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onTriggerSlotChange = (): void => onDropdownTriggerSlotChange(this._triggerHost);

  private _onTriggerClick = (e: MouseEvent) => onDropdownTriggerClick(this._triggerHost, e);

  private _onTriggerEnter = (): void => onDropdownTriggerEnter(this._triggerHost);

  private _onTriggerLeave = (): void => onDropdownTriggerLeave(this._triggerHost);

  private _onBodyEnter = (): void => onDropdownBodyEnter(this._triggerHost);

  private _onBodyLeave = (): void => onDropdownBodyLeave(this._triggerHost);

  private _activeMenuRow(): Element | null {
    return findActiveDropdownMenuRow(this._menuRows());
  }

  private _menuOrientation() {
    return menuOrientationFromPlacement(this.placement, menuSideFromElement(this._bodyEl));
  }

  private _onMenuKeydown = (e: KeyboardEvent): void => {
    const rows = this._menuRows();
    const active = this._activeMenuRow();
    const orientation = this._menuOrientation();

    if (this._isSubmenu && e.key === "ArrowLeft") {
      e.preventDefault();
      this.hide();
      this._submenuAnchor?.focus();
      return;
    }

    if (active instanceof VuDropdownItem && active.hasSubmenu()) {
      const openKey = orientation === "horizontal" ? "ArrowDown" : "ArrowRight";
      if (e.key === openKey) {
        e.preventDefault();
        active.openSubmenu();
        return;
      }
    }

    handleMenuKeydown(
      e,
      rows,
      active,
      this._typeahead,
      (index) => this._focusMenuRowAt(index),
      menuRowLabel,
      orientation,
    );
  };

  private _onMenuClick = (e: Event): void => {
    const path = e.composedPath() as EventTarget[];

    if (
      path.some((n) => n instanceof HTMLElement && n.tagName.toLowerCase() === "vu-dropdown-item")
    ) {
      return;
    }
    const row = path.find(
      (n) =>
        n instanceof HTMLElement &&
        n.getAttribute("role") === "menuitem" &&
        n.tagName.toLowerCase() !== "vu-dropdown-item",
    ) as HTMLElement | undefined;
    if (row) this._activateRow(row);
  };

  private _onMenuSelect = (e: Event): void => {
    if (!(e instanceof CustomEvent) || e.type !== "vu-select") return;
    const t = e.target;
    if (!(t instanceof HTMLElement) || !this.contains(t)) return;

    if (t instanceof VuDropdown && t !== this && t.trigger === "submenu") {
      this._applyNestedSelect(e.detail as VuDropdownSelectDetail);
      return;
    }

    if (t.tagName.toLowerCase() !== "vu-dropdown-item") return;
    e.stopPropagation();
    const d = e.detail as VuDropdownItemSelectDetail;
    this._activateRow(t, {
      value: d.value,
      label: d.label,
      item: t,
      checked: d.checked,
      kind: d.kind,
      href: d.href,
    });
  };

  private _activateRow(
    row: HTMLElement,
    detail?: Partial<VuDropdownSelectDetail> & { value?: string; label?: string },
  ): void {
    if (isMenuRowDisabled(row)) return;

    const value =
      detail?.value != null
        ? String(detail.value)
        : ((row as { value?: string }).value ?? (row as { label?: string }).label ?? "");
    const label = detail?.label != null ? String(detail.label) : menuRowLabel(row);

    const kind = detail?.kind ?? (row instanceof VuDropdownItem ? row.kind : "default");
    const shouldClose = this.closeOnSelect && kind !== "checkbox";

    if (kind !== "checkbox") this.value = value;
    this._highlightSelection(row);
    this.dispatchEvent(
      new CustomEvent<VuDropdownSelectDetail>("vu-select", {
        detail: {
          value,
          label,
          item: row,
          checked: detail?.checked,
          kind,
          href: detail?.href,
        },
        bubbles: true,
        composed: true,
      }),
    );
    if (shouldClose) this.hide();
  }

  override render() {
    return html`
      ${
        this._isSubmenu
          ? nothing
          : html`
              <div
                part="trigger"
                @click=${this._onTriggerClick}
                @keydown=${this._onTriggerKeydown}
                @mouseenter=${this._onTriggerEnter}
                @mouseleave=${this._onTriggerLeave}
              >
                <slot name="trigger" @slotchange=${this._onTriggerSlotChange}></slot>
              </div>
            `
      }

      <div
        part="body"
        id=${this._bodyId}
        popover="manual"
        role="menu"
        @toggle=${this._popover.onToggle}
        @keydown=${this._onMenuKeydown}
        @click=${this._onMenuClick}
        @vu-select=${this._onMenuSelect}
        @mouseenter=${this._onBodyEnter}
        @mouseleave=${this._onBodyLeave}
      >
        <div part="body-scroll">
          <slot @slotchange=${this._onMenuSlotChange}></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-dropdown": VuDropdown;
  }
}
