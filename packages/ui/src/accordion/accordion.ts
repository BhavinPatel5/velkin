import { LitElement, html, nothing, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { devTag, devWarnOnceForHost } from "../internals/utils/dev-warn.js";
import { VuAccordionItem } from "../accordion-item/accordion-item.js";
import type { VuAccordionItemOpenChangeDetail } from "../accordion-item/accordion-item.types.js";
import { accordionStyles } from "./accordion.style.js";
import type { VuAccordionSize, VuAccordionTone, VuAccordionVariant } from "./accordion.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";


export type { VuAccordionSize, VuAccordionTone, VuAccordionVariant } from "./accordion.types.js";
export type { VuAccordionItemOpenChangeDetail } from "../accordion-item/accordion-item.types.js";

/**
 * @element vu-accordion
 *
 * @summary An accordion component for expandable sections with keyboard navigation.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/accordion
 * @dependency vu-accordion-item
 *
 * @slot - One or more direct `<vu-accordion-item>` children.
 *
 * @property {boolean} multiple - When false, at most one item may be open at a time. Default: `true`.
 * @property {boolean} collapsible - With `multiple={false}`, allows closing the last open panel. Default: `true`.
 * @property {VuAccordionVariant} variant - Visual variant of the container. Default: `"solid"`.
 * @property {VuAccordionTone} tone - Neutral surface weight for `solid` / `splitted` fills. Default: `"normal"`.
 * @property {VuAccordionSize} size - Header/body density (`sm` \| `md` \| `lg`). Default: `"md"`.
 * @property {boolean} disabled - Disables interaction for all direct items. Default: `false`.
 * @property {boolean} flush - Removes the dividing line between items in `light`, `solid`, and `outline` variants. Default: `false`.
 * @method expandAll Opens all items; in single mode opens only the first.
 * @method collapseAll Closes all items (respects `collapsible` in single mode).
 * @method openItem Opens an item by index; returns whether the operation succeeded.
 * @method closeItem Closes an item by index; returns whether the operation succeeded.
 * @method toggleItem Toggles an item by index; returns whether the operation succeeded.
 * @method focusItem Moves focus to an item header by index.
 *
 * @fires {CustomEvent<VuAccordionItemOpenChangeDetail>} vu-open-change - Bubbles from items when their open state changes.
 *
 * @csspart group - Wrapper that contains all slotted accordion items.
 */
@customElement("vu-accordion")
@withComponentPresets
export class VuAccordion extends LitElement {
  static override styles = accordionStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-accordion-item": VuAccordionItem,
  };

  /** When false, at most one item may stay open. */
  @property({ type: Boolean, reflect: true })
  multiple = true;

  /** With `multiple={false}`, allows closing the last open panel. */
  @property({ type: Boolean, reflect: true })
  collapsible = true;

  /** Visual variant applied to the container. */
  @property({ type: String, reflect: true })
  variant: VuAccordionVariant = "solid";

  /** Neutral surface weight for filled variants (`solid`, `splitted`). */
  @property({ type: String, reflect: true })
  tone: VuAccordionTone = "normal";

  /** Header/body density scale. */
  @property({ type: String, reflect: true })
  size: VuAccordionSize = "md";

  /** Disables interaction for all direct items. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Removes the dividing line between items; ignored by the `splitted` variant which has no shared border. */
  @property({ type: Boolean, reflect: true })
  flush = false;

  private _itemsCache: VuAccordionItem[] | null = null;
  private _ownedAttrs: WeakMap<VuAccordionItem, Set<string>> = new WeakMap();

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("vu-open-change", this.handleItemToggle, { capture: true });
    this.addEventListener("keydown", this.handleKeydown, { capture: true });
    queueMicrotask(() => this._syncItems());
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has("disabled")) this._syncItems();
  }

  override firstUpdated(): void {
    if (this.querySelectorAll(":scope > vu-accordion-item").length === 0) {
      devWarnOnceForHost(
        this,
        "missing-items",
        `${devTag(this)} has no direct \`<vu-accordion-item>\` children in the default slot.`,
      );
    }
  }

  override disconnectedCallback(): void {
    this.removeEventListener("vu-open-change", this.handleItemToggle, { capture: true });
    this.removeEventListener("keydown", this.handleKeydown, { capture: true });
    super.disconnectedCallback();
  }

  /** Opens all items; in single mode opens only the first. */
  expandAll(): void {
    if (this.disabled) return;
    const items = this.items;
    if (items.length === 0) return;
    if (!this.multiple) {
      items.forEach((item, index) => {
        item.open = index === 0;
      });
      return;
    }
    items.forEach((item) => {
      item.open = true;
    });
  }

  /** Closes all items (respects `collapsible` in single mode). */
  collapseAll(): void {
    if (this.disabled) return;
    if (!this.multiple && !this.collapsible && this.items.some((i) => i.open)) return;
    this.items.forEach((item) => {
      item.open = false;
    });
  }

  openItem(index: number): boolean {
    if (this.disabled) return false;
    const items = this.items;
    const target = items[index];
    if (!target || target.disabled) return false;
    if (!this.multiple) {
      for (const item of items) item.open = item === target;
    } else {
      target.open = true;
    }
    return true;
  }

  closeItem(index: number): boolean {
    if (this.disabled) return false;
    const target = this.items[index];
    if (!target || target.disabled) return false;
    if (!this.multiple && !this.collapsible) {
      const items = this.items;
      let othersOpen = false;
      for (const item of items) {
        if (item !== target && item.open) { othersOpen = true; break; }
      }
      if (!othersOpen && target.open) return false;
    }
    target.open = false;
    return true;
  }

  toggleItem(index: number): boolean {
    if (this.disabled) return false;
    const target = this.items[index];
    if (!target || target.disabled) return false;
    return target.open ? this.closeItem(index) : this.openItem(index);
  }

  focusItem(index: number): boolean {
    if (this.disabled) return false;
    const target = this.items[index];
    if (!target || target.disabled) return false;
    const header = target.shadowRoot?.querySelector<HTMLElement>('[part="header"]');
    if (!header) return false;
    header.focus();
    return true;
  }

  /** Coordinates open state across siblings when an item toggles. */
  private handleItemToggle(e: Event): void {
    const target = e.target as VuAccordionItem | null;
    if (!target) return;
    const items = this.items;
    if (!items.includes(target)) return;

    if (!this.multiple && target.open) {
      for (const item of items) {
        if (item !== target) item.open = false;
      }
      return;
    }

    if (!this.multiple && !this.collapsible && !target.open) {
      let anyOtherOpen = false;
      for (const item of items) {
        if (item !== target && item.open) {
          anyOtherOpen = true;
          break;
        }
      }
      if (!anyOtherOpen) {
        queueMicrotask(() => {
          target.open = true;
        });
      }
    }
  }

  /** Roving focus across item headers (Arrow Up/Down / Home / End). */
  private handleKeydown(e: KeyboardEvent): void {
    if (this.disabled) return;
    const key = e.key;
    if (key !== "ArrowDown" && key !== "ArrowUp" && key !== "Home" && key !== "End") return;

    const items = this.items;
    if (items.length === 0) return;

    const path = e.composedPath();
    let currentIndex = -1;
    for (const node of path) {
      if (node === this) break;
      if (node instanceof VuAccordionItem) {
        const idx = items.indexOf(node);
        if (idx >= 0) {
          currentIndex = idx;
          break;
        }
      }
    }
    if (currentIndex < 0) return;

    let newIndex: number;
    if (key === "ArrowDown") newIndex = this._nextEnabled(items, currentIndex, 1);
    else if (key === "ArrowUp") newIndex = this._nextEnabled(items, currentIndex, -1);
    else if (key === "Home") newIndex = this._firstEnabled(items);
    else newIndex = this._lastEnabled(items);
    if (newIndex < 0 || newIndex === currentIndex) return;

    const header = items[newIndex].shadowRoot?.querySelector<HTMLElement>('[part="header"]');
    if (header) {
      e.preventDefault();
      header.focus();
    }
  }

  /** Returns the next enabled index in `direction`, stopping at edges; -1 if none. */
  private _nextEnabled(items: VuAccordionItem[], from: number, direction: 1 | -1): number {
    const len = items.length;
    for (let i = from + direction; i >= 0 && i < len; i += direction) {
      if (!items[i].disabled) return i;
    }
    return -1;
  }

  /** Index of the first non-disabled item, or -1 if all disabled. */
  private _firstEnabled(items: VuAccordionItem[]): number {
    for (let i = 0; i < items.length; i++) {
      if (!items[i].disabled) return i;
    }
    return -1;
  }

  /** Index of the last non-disabled item, or -1 if all disabled. */
  private _lastEnabled(items: VuAccordionItem[]): number {
    for (let i = items.length - 1; i >= 0; i--) {
      if (!items[i].disabled) return i;
    }
    return -1;
  }

  /** Drops the cached child list when the default slot's assignments change. */
  private handleSlotChange = (): void => {
    this._itemsCache = null;
    this._syncItems();
  };

  /** Forwards host `disabled` onto direct items without stomping consumer-set item `disabled`. */
  private _syncItems(): void {
    const wantDisabled = this.disabled;
    for (const item of this.items) {
      if (wantDisabled) this._claimItemDisabled(item, true);
      else this._releaseItemDisabled(item);
    }
  }

  /** Sets item `disabled` when the item has no own `disabled` attr or this host already claimed it. */
  private _claimItemDisabled(item: VuAccordionItem, value: boolean): void {
    if (!value) {
      this._releaseItemDisabled(item);
      return;
    }
    const owned = this._ownsItemAttr(item, "disabled");
    if (owned || !item.hasAttribute("disabled")) {
      item.disabled = true;
      this._setItemOwnership(item, "disabled", true);
    }
  }

  /** Clears forwarded `disabled` only when this host previously claimed it on the item. */
  private _releaseItemDisabled(item: VuAccordionItem): void {
    if (!this._ownsItemAttr(item, "disabled")) return;
    item.disabled = false;
    this._setItemOwnership(item, "disabled", false);
  }

  private _ownsItemAttr(item: VuAccordionItem, attr: string): boolean {
    return this._ownedAttrs.get(item)?.has(attr) ?? false;
  }

  private _setItemOwnership(item: VuAccordionItem, attr: string, owned: boolean): void {
    let set = this._ownedAttrs.get(item);
    if (!set) {
      if (!owned) return;
      set = new Set();
      this._ownedAttrs.set(item, set);
    }
    if (owned) set.add(attr);
    else set.delete(attr);
  }

  /** Returns the cached list of direct items, or builds it from the default slot. */
  private get items(): VuAccordionItem[] {
    if (!this._itemsCache) {
      const out: VuAccordionItem[] = [];
      const children = this.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child instanceof VuAccordionItem) out.push(child);
      }
      this._itemsCache = out;
    }
    return this._itemsCache;
  }

  override render() {
    return html`
      <div part="group" role="group" aria-disabled=${this.disabled ? "true" : nothing}>
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "vu-accordion": VuAccordion;
  }
}
