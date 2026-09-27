import { LitElement, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  canUseRaf,
  canUseResizeObserver,
} from "../internals/utils/env.js";
import { VuIcon } from "../icon/icon.js";
import { VuTooltip } from "../tooltip/tooltip.js";
import {
  buildNavPanelGroups,
  collectNavPanelGroupKeys,
  flattenNavPanelItems,
  navPanelRowHint,
  navPanelRowValue,
  mergeNavPanelCollapsedGroups,
} from "./internals/nav-panel-groups.js";
import { stepRovingIndex } from "./internals/nav-panel-keyboard.js";
import { renderNavPanel, type NavPanelRenderHost } from "./internals/nav-panel.render.js";
import { navPanelStyles } from "./nav-panel.style.js";
import type {
  VuNavPanelChangeDetail,
  VuNavPanelCollapseChangeDetail,
  VuNavPanelCollapsedHints,
  VuNavPanelColor,
  VuNavPanelHintPlacement,
  VuNavPanelItem,
  VuNavPanelSize,
} from "./nav-panel.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuNavPanelChangeDetail,
  VuNavPanelCollapseChangeDetail,
  VuNavPanelCollapsedHints,
  VuNavPanelColor,
  VuNavPanelHintPlacement,
  VuNavPanelItem,
  VuNavPanelItemIconPosition,
  VuNavPanelSize,
} from "./nav-panel.types.js";
import { reflectString } from "../internals/utils/reflect-string.js";

/**
 * @element vu-nav-panel
 *
 * @summary A navigation panel component for drawer bodies with icon-rail collapse.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/nav-panel
 * @dependency vu-icon
 * @dependency vu-tooltip
 *
 * @slot prepend - Content before rows inside the list body.
 * @slot append - Content after rows inside the list body.
 *
 * @csspart panel - Root list region.
 * @csspart body - Scrollable container for rows and groups.
 * @csspart prepend - Prepend slot wrapper.
 * @csspart append - Append slot wrapper.
 * @csspart list - Flat list container when items have no categories.
 * @csspart group - Wrapper for a category section.
 * @csspart heading - Clickable heading row of a category.
 * @csspart chevron - Chevron icon in the heading.
 * @csspart group-content - Container of rows inside a category.
 * @csspart row - A single selectable row (`button` or `a`).
 * @csspart stack - Label and description column inside a row.
 * @csspart label - Primary row text.
 * @csspart description - Secondary row text.
 * @csspart badge - Optional trailing meta on a row.
 * @csspart icon - Leading or trailing icon on a row.
 * @csspart fallback - Initial in icon rail when the row has no icon.
 * @csspart collapsed-hint - Per-row tooltip bubble when `collapsedHints="tooltip"` (`exportparts` from `<vu-tooltip>`).
 *
 * @cssproperty --nav-panel-width-collapsed - Icon-rail inline size (default `3.25rem`).
 * @cssproperty --np-panel-bg - Optional background (default `transparent`).
 * @cssproperty --np-panel-fg - Foreground when a custom background is set.
 *
 * @property {VuNavPanelItem[]} items - Rows to render; shared `category` values create collapsible groups.
 * @property {string} value - Currently selected row key.
 * @property {Record<string, boolean>} collapsedGroups - Group collapsed-state map (`true` means collapsed).
 * @property {boolean} collapsed - Icon-rail mode; labels and group headings are hidden.
 * @property {string} label - Accessible name for the listbox.
 * @property {VuNavPanelSize} size - Row density (`sm`, `md`, `lg`); relayed to rail tooltips.
 * @property {VuNavPanelColor} color - Active-row accent color.
 * @property {VuNavPanelCollapsedHints} collapsedHints - Icon-rail label reveal: per-row `vu-tooltip`, native `title`, or `none`.
 * @property {VuNavPanelHintPlacement} collapsedHintPlacement - Hint side for rail rows when `collapsedHints="tooltip"`.
 *
 * @method select - Sets the selected row by `value`.
 * @method collapse - Collapses to the icon rail.
 * @method expand - Expands from the icon rail.
 * @method toggleCollapse - Toggles icon-rail mode.
 * @method toggleGroup - Toggles or forces a group collapsed state.
 * @method expandAllGroups - Expands all known groups.
 * @method collapseAllGroups - Collapses all known groups.
 *
 * @fires {CustomEvent<VuNavPanelChangeDetail>} vu-change - When the selected row changes.
 * @fires {CustomEvent<VuNavPanelCollapseChangeDetail>} vu-collapse-change - When icon-rail `collapsed` flips.
 */
@customElement("vu-nav-panel")
@withComponentPresets
export class VuNavPanel extends LitElement {
  static override styles = navPanelStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
    "vu-tooltip": VuTooltip,
  };

  /** Rows to render; shared `category` values create collapsible groups. */
  @property({ type: Array }) items: VuNavPanelItem[] = [];
  /** Currently selected row key. */
  @property(reflectString) value = "";
  /** Group collapsed-state map (`true` means collapsed). */
  @property({ type: Object }) collapsedGroups: Record<string, boolean> = {};
  /** Icon-rail mode; labels and group headings are hidden. */
  @property({ type: Boolean, reflect: true }) collapsed = false;
  /** Accessible name for the listbox. */
  @property({ type: String }) label = "Navigation";
  /** Row density (`sm`, `md`, `lg`). */
  @property({ type: String, reflect: true }) size: VuNavPanelSize = "md";
  /** Active-row accent color. */
  @property({ type: String, reflect: true }) color: VuNavPanelColor = "default";
  /** Icon-rail label reveal: per-row `vu-tooltip`, native `title`, or `none`. */
  @property({ type: String, reflect: true }) collapsedHints: VuNavPanelCollapsedHints = "tooltip";
  /** Hint side for rail rows when `collapsedHints="tooltip"`. */
  @property({ type: String }) collapsedHintPlacement: VuNavPanelHintPlacement = "right";

  @state() private _groupHeights: Record<string, number> = {};
  @state() private _rovingKey = "";

  private _ready = false;
  private _resizeObs?: ResizeObserver;

  private get _renderHost(): NavPanelRenderHost {
    return this as unknown as NavPanelRenderHost;
  }

  private get _isRail(): boolean {
    return this.collapsed;
  }

  /** Sets the selected row by `value`. */
  select(next: string): void {
    if (this.value === next) return;
    this.value = next;
    const item = this._itemByValue(next);
    if (item) {
      this._emitChange({ value: next, item });
    }
  }

  /** Collapses to the icon rail. */
  collapse(): void {
    if (this.collapsed) return;
    this.collapsed = true;
  }

  /** Expands from the icon rail. */
  expand(): void {
    if (!this.collapsed) return;
    this.collapsed = false;
  }

  /** Toggles icon-rail mode. */
  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  /** Toggles or forces a group collapsed state. */
  toggleGroup(groupKey: string, force?: boolean): void {
    const current = !!this.collapsedGroups[groupKey];
    const next = typeof force === "boolean" ? force : !current;
    this.collapsedGroups = {
      ...this.collapsedGroups,
      [groupKey]: next,
    };
  }

  /** Expands all known groups. */
  expandAllGroups(): void {
    const next: Record<string, boolean> = {};
    for (const key of collectNavPanelGroupKeys(this.items)) {
      next[key] = false;
    }
    this.collapsedGroups = next;
  }

  /** Collapses all known groups. */
  collapseAllGroups(): void {
    const next: Record<string, boolean> = {};
    for (const key of collectNavPanelGroupKeys(this.items)) {
      next[key] = true;
    }
    this.collapsedGroups = next;
  }

  override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("items")) {
      const next = mergeNavPanelCollapsedGroups(this.items, this.collapsedGroups);
      if (!this._recordsEqual(next, this.collapsedGroups)) {
        this.collapsedGroups = next;
      }
    }
    if (changed.has("value") || changed.has("items")) {
      this._syncRovingToValue();
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this._ready) this._observeGroups();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._resizeObs?.disconnect();
    this._resizeObs = undefined;
  }

  override firstUpdated(): void {
    const markReady = (): void => {
      if (!this.isConnected) return;
      this._ready = true;
      this.toggleAttribute("data-ready", true);
      this._observeGroups();
      this._measureAllGroups();
    };
    if (!canUseRaf()) {
      markReady();
      return;
    }
    requestAnimationFrame(markReady);
  }

  override updated(changed: PropertyValues<this>): void {
    if (this._ready && changed.has("collapsed")) {
      this._emitCollapseChange({ collapsed: this.collapsed });
    }
    if (changed.has("items") || changed.has("collapsed") || changed.has("collapsedGroups")) {
      if (!canUseRaf()) {
        if (this.isConnected) this._measureAllGroups();
        return;
      }
      requestAnimationFrame(() => {
        if (this.isConnected) this._measureAllGroups();
      });
    }
  }

  private _recordsEqual(
    a: Record<string, boolean | number>,
    b: Record<string, boolean | number>,
  ): boolean {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((key) => a[key] === b[key]);
  }

  private _observeGroups(): void {
    if (this._resizeObs || !canUseResizeObserver()) return;
    this._resizeObs = new ResizeObserver(() => {
      if (!canUseRaf()) {
        if (this.isConnected) this._measureAllGroups();
        return;
      }
      requestAnimationFrame(() => {
        if (this.isConnected) this._measureAllGroups();
      });
    });
    this._resizeObs.observe(this);
  }

  private _queryRoot(): ParentNode | null {
    const root = this.shadowRoot ?? this.renderRoot;
    if (!root || typeof root.querySelectorAll !== "function") return null;
    return root;
  }

  private _measureAllGroups = (): void => {
    if (this._isRail) return;
    const root = this._queryRoot();
    if (!root) return;
    const groups = root.querySelectorAll<HTMLElement>('[part="group"]');
    const next: Record<string, number> = { ...this._groupHeights };

    for (const group of groups) {
      const key = group.dataset.key;
      const content = group.querySelector<HTMLElement>('[part="group-content"]');
      if (!key || !content) continue;
      next[key] = content.scrollHeight;
    }

    if (!this._recordsEqual(next, this._groupHeights)) {
      this._groupHeights = next;
    }
  };

  private _emitChange(detail: VuNavPanelChangeDetail): void {
    this.dispatchEvent(
      new CustomEvent<VuNavPanelChangeDetail>("vu-change", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _emitCollapseChange(detail: VuNavPanelCollapseChangeDetail): void {
    this.dispatchEvent(
      new CustomEvent<VuNavPanelCollapseChangeDetail>("vu-collapse-change", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _itemValue(item: VuNavPanelItem, index: number): string {
    return navPanelRowValue(item, index);
  }

  private _itemByValue(value: string): VuNavPanelItem | null {
    const groups = buildNavPanelGroups(this.items);
    const flat = flattenNavPanelItems(this.items, groups);
    return flat.find((item, index) => this._itemValue(item, index) === value) ?? null;
  }

  private _rowAriaLabel(item: VuNavPanelItem): string {
    return navPanelRowHint(item);
  }

  private _rowDomId(itemValue: string): string {
    return `nav-panel-row-${itemValue.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
  }

  private _onItemActivate(event: Event, item: VuNavPanelItem, index: number): void {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    const next = this._itemValue(item, index);
    if (this.value === next) {
      event.preventDefault();
      return;
    }
    if (!item.href) event.preventDefault();
    this.value = next;
    this._emitChange({ value: next, item });
  }

  private _getFocusableItems(): HTMLElement[] {
    const root = this._queryRoot();
    if (!root) return [];
    const items = Array.from(
      root.querySelectorAll<HTMLElement>(
        '[part="heading"], [part="row"]:not([aria-hidden="true"])',
      ),
    );

    return items.filter((el) => {
      if (el.getAttribute("part") !== "row") return true;
      const group = el.closest('[part="group"]');
      const content = group?.querySelector('[part="group-content"]');
      return !content?.hasAttribute("data-collapsed");
    });
  }

  private _syncRovingToValue(): void {
    if (this.value) {
      this._rovingKey = this.value;
      return;
    }
    const groups = buildNavPanelGroups(this.items);
    const flat = flattenNavPanelItems(this.items, groups);
    this._rovingKey = flat[0] ? this._itemValue(flat[0], 0) : "";
  }

  private _rovingKeyFromElement(el: HTMLElement): string {
    if (el.dataset.itemValue) return el.dataset.itemValue;
    if (el.getAttribute("part") === "heading") {
      const key = el.closest<HTMLElement>('[part="group"]')?.dataset.key;
      return key ? `heading:${key}` : "";
    }
    return "";
  }

  private _onFocusIn = (event: FocusEvent): void => {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      '[part="row"], [part="heading"]',
    );
    if (!target) return;
    const next = this._rovingKeyFromElement(target);
    if (next) this._rovingKey = next;
  };

  private _onKeyDown = (event: KeyboardEvent): void => {
    const focusables = this._getFocusableItems();
    if (focusables.length === 0) return;

    const shadowActive = (this.renderRoot as ShadowRoot | null)?.activeElement as HTMLElement | null;
    const headingEl = shadowActive?.closest<HTMLElement>('[part="heading"]');
    const activeEl = headingEl ?? shadowActive;
    if (!activeEl) return;

    let idx = focusables.indexOf(activeEl);
    if (idx < 0) {
      idx = focusables.findIndex((el) => this._rovingKeyFromElement(el) === this._rovingKey);
    }

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        const next = stepRovingIndex(idx, 1, focusables.length);
        const el = focusables[next];
        if (el) {
          this._rovingKey = this._rovingKeyFromElement(el);
          el.focus();
        }
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        const prev = stepRovingIndex(idx, -1, focusables.length);
        const el = focusables[prev];
        if (el) {
          this._rovingKey = this._rovingKeyFromElement(el);
          el.focus();
        }
        break;
      }
      case "Home": {
        event.preventDefault();
        const el = focusables[0];
        if (el) {
          this._rovingKey = this._rovingKeyFromElement(el);
          el.focus();
        }
        break;
      }
      case "End": {
        event.preventDefault();
        const el = focusables[focusables.length - 1];
        if (el) {
          this._rovingKey = this._rovingKeyFromElement(el);
          el.focus();
        }
        break;
      }
      case "Enter":
      case " ": {
        if (headingEl) {
          event.preventDefault();
          const key = (headingEl.closest('[part="group"]') as HTMLElement | null)?.dataset.key;
          if (!key) return;
          this.toggleGroup(key);
          requestAnimationFrame(() => headingEl.focus());
          return;
        }

        const row = shadowActive?.closest<HTMLElement>('[part="row"]');
        const itemValue = row?.dataset.itemValue;
        if (!itemValue) return;

        const item = this._itemByValue(itemValue);
        if (!item || item.disabled) return;

        event.preventDefault();
        if (this.value !== itemValue) {
          this.value = itemValue;
          this._emitChange({ value: itemValue, item });
        }
        break;
      }
    }
  };

  override render() {
    return renderNavPanel(this._renderHost);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-nav-panel": VuNavPanel;
  }
}
