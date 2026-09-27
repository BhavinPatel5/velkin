import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, queryAssignedElements } from "lit/decorators.js";
import { VuListitem } from "../list-item/list-item.js";
import { handleListRowKeydown, type ListRowKeyboardHost } from "./internals/list-keyboard.js";
import {
  applyListSelectedValues,
  isListSubheader,
  listFocusableItems,
  listSelectionAfterActivate,
} from "./internals/list-selection.js";
import { findListTypeaheadMatch, listItemLabel } from "./internals/list-typeahead.js";
import { listStyles } from "./list.style.js";
import type {
  VuListChangeDetail,
  VuListSelectionMode,
  VuListSize,
  VuListTone,
} from "./list.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuListChangeDetail,
  VuListSelectionMode,
  VuListSize,
  VuListTone,
} from "./list.types.js";
export type { VuListitemActivateDetail, VuListitemSize } from "../list-item/list-item.types.js";

const TYPEAHEAD_RESET_MS = 500;

/**
 * @element vu-list
 *
 * @summary A list component with selection, type-ahead, and keyboard navigation.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/list
 * @dependency vu-listitem
 *
 * @uiVModel selectedValues vu-change detail=selectedValues
 *
 * @slot - Default slot for `<vu-listitem>` children.
 *
 * @property {VuListSelectionMode} selection - Selection mode for child rows. Default: `"none"`.
 * @property {string[] | undefined} selectedValues - Controlled selection tokens; omit for uncontrolled mode.
 * @property {string[]} defaultSelectedValues - Initial selection when uncontrolled. Default: `[]`.
 * @property {VuListSize} size - Default row density. Default: `"md"`.
 * @property {VuListTone} tone - Neutral surface weight for the list shell. Default: `"normal"`.
 * @property {boolean} dense - Compact rows on the list and items. Default: `false`.
 * @property {boolean} autofocus - Focuses the first row after first render. Default: `false`.
 * @property {string} ariaLabel - Accessible name when there is no visible list label. Default: `""`.
 *
 * @method focusListItem - Focuses a focusable item by index among non-subheader rows.
 * @method getItems - Returns slotted `<vu-listitem>` instances in document order.
 * @method handleRowKeydown - Keyboard handler invoked by each row (internal).
 *
 * @fires {CustomEvent<VuListChangeDetail>} vu-change - When selection changes (`detail.selectedValues`).
 *
 * @csspart base - Bordered list surface wrapping the default slot.
 */
@customElement("vu-list")
@withComponentPresets
export class VuList extends LitElement implements ListRowKeyboardHost {
  static override styles = listStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-listitem": VuListitem,
  };

  /** Selection mode for child rows. */
  @property({ type: String, reflect: true })
  selection: VuListSelectionMode = "none";

  /** Controlled selection as item `value` strings; omit for uncontrolled usage. */
  @property({ type: Array })
  selectedValues?: string[];

  /** Initial selection when `selectedValues` is omitted. */
  @property({ type: Array, attribute: false })
  defaultSelectedValues: string[] = [];

  /** Default row density for items without their own `size`. */
  @property({ type: String, reflect: true })
  size: VuListSize = "md";

  /** Neutral surface weight for the list shell. */
  @property({ type: String, reflect: true })
  tone: VuListTone = "normal";

  /** Compact rows on the list and items. */
  @property({ type: Boolean, reflect: true })
  dense = false;

  /** Focuses the first row after first render. */
  @property({ type: Boolean, reflect: true })
  override autofocus = false;

  /** Accessible name when no visible label is present. */
  @property({ type: String })
  override ariaLabel = "";

  @queryAssignedElements({ selector: "vu-listitem" })
  private _items!: VuListitem[];

  private _focusedIndex = 0;
  private _internalSelectedValues: string[] = [];
  private _typeaheadBuffer = "";
  private _typeaheadTimer: ReturnType<typeof setTimeout> | undefined;

  /** Suppresses prop→item sync while pushing selection from an activation. */
  private _syncingSelectedValues = false;

  private _defaultsApplied = false;

  private _onItemActivate = (event: Event) => {
    const custom = event as CustomEvent<{ item: VuListitem }>;
    const item = custom.detail?.item;
    if (!item || this.selection === "none") return;

    const selectedValues = listSelectionAfterActivate(this._items, this.selection, item);
    this._commitSelection(selectedValues);
  };

  private get _listRole(): "list" | "listbox" {
    return this.selection === "none" ? "list" : "listbox";
  }

  private get _effectiveSelectedValues(): string[] {
    if (this.selectedValues !== undefined) return this.selectedValues;
    return this._internalSelectedValues;
  }

  private get _ariaLabel(): string | typeof nothing {
    const label = this.ariaLabel.trim();
    return label ? label : nothing;
  }

  focusableItems(): VuListitem[] {
    return listFocusableItems(this._items ?? []);
  }

  getFocusedIndex(): number {
    return this._focusedIndex;
  }

  setFocusedIndex(index: number): void {
    this._focusedIndex = index;
  }

  focusItemAt(index: number): void {
    const items = this.focusableItems();
    if (!items.length) return;
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    this._focusedIndex = clamped;
    this._syncTabIndices();
    items[clamped]?.focus();
  }

  activateFocused(): void {
    const items = this.focusableItems();
    items[this._focusedIndex]?.activate();
  }

  appendTypeahead(char: string): number | null {
    this._typeaheadBuffer += char;
    if (this._typeaheadTimer) clearTimeout(this._typeaheadTimer);
    this._typeaheadTimer = setTimeout(() => {
      this._typeaheadBuffer = "";
    }, TYPEAHEAD_RESET_MS);

    const items = this.focusableItems();
    if (!items.length) return null;
    const match = findListTypeaheadMatch(items, this._focusedIndex, this._typeaheadBuffer);
    return match;
  }

  /** @internal Called from `<vu-listitem>` keydown handlers. */
  handleRowKeydown(row: VuListitem, event: KeyboardEvent): boolean {
    return handleListRowKeydown(this, row, event);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("vu-activate", this._onItemActivate);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("vu-activate", this._onItemActivate);
    if (this._typeaheadTimer) clearTimeout(this._typeaheadTimer);
  }

  override updated(changed: PropertyValues<this>): void {
    super.updated(changed);

    if (
      (changed.has("selectedValues") ||
        changed.has("selection") ||
        changed.has("defaultSelectedValues")) &&
      !this._syncingSelectedValues
    ) {
      this._applySelectionFromHost();
      this._syncTabIndices();
    }
  }

  override firstUpdated(): void {
    this._applyDefaultSelectionIfNeeded();
    this._syncTabIndices();
    if (this.autofocus) this.focusItemAt(0);
  }

  /** Focuses a focusable item by index (skips subheaders and disabled rows). */
  focusListItem(index: number): void {
    this.focusItemAt(index);
  }

  /** Slotted list items in document order. */
  getItems(): VuListitem[] {
    return [...(this._items ?? [])];
  }

  override render() {
    const multiselectable = this.selection === "multiple" ? "true" : nothing;

    return html`
      <div
        part="base"
        role=${this._listRole}
        aria-label=${this._ariaLabel}
        aria-multiselectable=${multiselectable}
      >
        <slot @slotchange=${this._onSlotChange}></slot>
      </div>
    `;
  }

  private _commitSelection(selectedValues: string[]): void {
    const selectedItems = this._items.filter((i) => i.selected && !isListSubheader(i));

    this._syncingSelectedValues = true;
    if (this.selectedValues === undefined) {
      this._internalSelectedValues = [...selectedValues];
    } else {
      this.selectedValues = [...selectedValues];
    }
    this._syncingSelectedValues = false;

    this.dispatchEvent(
      new CustomEvent<VuListChangeDetail>("vu-change", {
        detail: { selectedItems, selectedValues },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _applyDefaultSelectionIfNeeded(): void {
    if (this._defaultsApplied || this.selectedValues !== undefined) return;
    if (!this.defaultSelectedValues.length) return;
    this._defaultsApplied = true;
    this._internalSelectedValues = [...this.defaultSelectedValues];
    queueMicrotask(() => {
      applyListSelectedValues(this._items, this.selection, this._internalSelectedValues);
      this._syncTabIndices();
    });
  }

  private _applySelectionFromHost(): void {
    this._relayListContext();
    applyListSelectedValues(this._items, this.selection, this._effectiveSelectedValues);
  }

  private _relayListContext(): void {
    for (const item of this._items ?? []) {
      item.listSelectionMode = this.selection;
    }
  }

  private _syncTabIndices(): void {
    const focusable = this.focusableItems();
    this._relayListContext();
    for (const item of this._items ?? []) {
      item.itemTabIndex = -1;
    }
    const current = focusable[this._focusedIndex];
    if (current) current.itemTabIndex = 0;
  }

  private _onSlotChange(): void {
    if (this._syncingSelectedValues) return;
    this._applyDefaultSelectionIfNeeded();
    this._applySelectionFromHost();
    const focusable = this.focusableItems();
    if (focusable.length && this._focusedIndex >= focusable.length) {
      this._focusedIndex = focusable.length - 1;
    }
    this._syncTabIndices();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-list": VuList;
  }
}

export { listItemLabel };
