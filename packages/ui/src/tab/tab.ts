import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, queryAssignedElements, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { repeat } from "lit/directives/repeat.js";
import { styleMap } from "lit/directives/style-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { VuIcon } from "../icon/icon.js";
import { VuTabItem } from "../tab-item/tab-item.js";
import { canUseRaf, isClient } from "../internals/utils/env.js";
import { onTabKeydown } from "./internals/tab-keyboard.js";
import {
  applyTabEffectiveColor,
  createTabMeasureContext,
  estimateTabSegmentMinWidth,
  measureTabLabelWidths,
  normalizeTabItems,
  tabEffectiveColor,
  tabSelectedIndex,
} from "./internals/tab-items.js";
import {
  connectTabThumbObservers,
  disconnectTabThumb,
  scheduleTabThumbUpdate,
} from "./internals/tab-thumb.js";
import {
  resolveTabSlotMembers,
  SLOT_MEMBER_SELECTOR,
  syncTabSlotMembers,
  tabItemsFromSlot,
  tabUsesSlotItems,
} from "./internals/tab-slot.js";
import {
  ensureTabValue,
  seedTabInternalValue,
  tabSelectedValue,
} from "./internals/tab-value.js";
import { devWarnMissingAccessibleName } from "../internals/utils/dev-warn.js";
import { tabStyles } from "./tab.style.js";
import type {
  VuTabChangeDetail,
  VuTabColor,
  VuTabOrientation,
  VuTabStateItem,
  VuTabNormalizedItem,
  VuTabSize,
  VuTabRadius
} from "./tab.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuTabChangeDetail,
  VuTabColor,
  VuTabOrientation,
  VuTabStateItem,
  VuTabNormalizedItem,
  VuTabSize,
  VuTabRadius
} from "./tab.types.js";
import { reflectString } from "../internals/utils/reflect-string.js";
export type { VuTabItemColor } from "../tab-item/tab-item.types.js";

/**
 * @element vu-tab
 *
 * @summary A tab component with animated thumb and keyboard navigation.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/tab
 * @dependency vu-icon
 * @dependency vu-tab-item
 *
 * @uiVModel value vu-change
 *
 * @slot - `<vu-tab-item>` segments; when assigned, replaces the `states` prop.
 *
 * @csspart wrap - Outer radiogroup wrapper.
 * @csspart indicator - Sliding highlight behind the active segment.
 * @csspart thumb - Alias for the sliding indicator.
 * @csspart base - Each segment button in prop mode.
 * @csspart base--selected - Currently selected segment button.
 * @csspart label - Optional label span inside each button.
 * @csspart icon - Optional icon inside each button.
 *
 * @cssproperty --tab-gap - Spacing between segments; set via the `gap` prop.
 * @cssproperty --tab-thumb-bg - Selected indicator / thumb background; resolved from `color` (focus uses `--vu-focus-ring`).
 * @cssproperty --tab-active-fg - Selected segment label color.
 * @cssproperty --tab-radius - Segment corner preset (maps to `--tab-segment-radius` on items).
 * @cssproperty --tab-track-radius - Outer wrap track corner radius.
 * @cssproperty --tab-segment-radius - Segment and indicator corner radius.
 * @cssproperty --tab-bg - Wrap track background.
 * @cssproperty --tab-pad - Wrap track inset around segments.
 * @cssproperty --tab-shadow - Wrap track elevation shadow.
 * @cssproperty --tab-anim-ms - Color and indicator transition duration.
 * @cssproperty --tab-anim-ease - Color and indicator transition easing.
 * @cssproperty --tab-indicator-x - Indicator horizontal offset (set by thumb layout).
 * @cssproperty --tab-indicator-y - Indicator vertical offset (set by thumb layout).
 * @cssproperty --tab-indicator-w - Indicator width (set by thumb layout).
 * @cssproperty --tab-indicator-h - Indicator height (set by thumb layout).
 * @cssproperty --tab-indicator-opacity - Indicator visibility (set by thumb layout).
 * @cssproperty --font-size - Segment typography size; overridden per `size`.
 * @cssproperty --item-pad - Segment button padding; overridden per `size`.
 * @cssproperty --item-min-w - Segment minimum width; overridden per `size`.
 * @cssproperty --item-min-h - Segment minimum height; overridden per `size`.
 *
 * @property {VuTabStateItem[]} states - Segment list when the default slot is empty. Default: `[]`.
 * @property {string | undefined} value - Selected segment when controlled; omit for uncontrolled mode.
 * @property {string} defaultValue - Initial selection when uncontrolled. Default: `""`.
 * @property {boolean} disabled - Disables every segment. Default: `false`.
 * @property {string} label - Accessible name when no visible group label exists. Default: `""`.
 * @property {VuTabSize} size - Padding/type preset; `sm`|`md`|`lg` align with list/tree, `xs`/`xl` are density extras. Default: `"sm"`.
 * @property {VuTabOrientation} orientation - Horizontal row or vertical stack. Default: `"horizontal"`.
 * @property {boolean} stretch - Fills container width; horizontal segments share space equally. Default: `false`.
 * @property {string} gap - Spacing between segments; empty for flush layout. Default: `""`.
 * @property {VuTabRadius} radius - Corner preset (`none`/`sm`/`md`/`lg`/`full`). Default: `"full"`.
 * @property {boolean} showCurrentLabelOnly - Hides inactive labels. Default: `false`.
 * @property {boolean} iconOnly - Square 1:1 segments; labels stay for a11y only. Default: `false`.
 * @property {VuTabColor} color - Thumb intent token; per-item color overrides. Default: `"primary"`.
 *
 * @fires {CustomEvent<VuTabChangeDetail>} vu-change - User-driven selection changes only.
 * @method focusSegment - Focuses the currently selected segment.
 * @method reset - Restores uncontrolled selection from `defaultValue`.
 */
@customElement("vu-tab")
@withComponentPresets
export class VuTab extends LitElement {
  static override styles = tabStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
    "vu-tab-item": VuTabItem,
  };

  /** Segment list when the default slot is empty. */
  @property({ type: Array }) states: VuTabStateItem[] = [];

  /** Selected segment when controlled; omit for uncontrolled mode. */
  @property({ type: String, attribute: false })
  value: string | undefined = undefined;

  /** Initial selection when uncontrolled. */
  @property(reflectString)
  defaultValue = "";

  /** Disables every segment. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Accessible name when no visible group label exists. */
  @property({ type: String }) label = "";

  /** Padding and typography preset. */
  @property({ type: String, reflect: true }) size: VuTabSize = "sm";

  /** Horizontal row or vertical stack. */
  @property({ type: String, reflect: true })
  orientation: VuTabOrientation = "horizontal";

  /** Fills container width; horizontal segments share space equally. */
  @property({ type: Boolean, reflect: true }) stretch = false;

  /** Spacing between segments; empty for flush layout. */
  @property({ type: String }) gap = "";

  /** Capsule segments. */
  @property({ type: String, reflect: true }) radius: VuTabRadius = "full";

  /** Hides inactive labels. */
  @property({ type: Boolean }) showCurrentLabelOnly = false;

  /** Square 1:1 segments; labels stay for a11y only. */
  @property({ type: Boolean, reflect: true }) iconOnly = false;

  /** Thumb intent token; per-item color overrides. */
  @property({ type: String }) color: VuTabColor = "primary";

  @state() private _labelWidths = new Map<number, number>();
  @state() private _ready = false;

  private _itemsCache: VuTabNormalizedItem[] = [];
  @state() private _internalValue = "";
  private _controlled = false;
  private _canvasContext?: CanvasRenderingContext2D;
  private _initialRenderComplete = false;
  private _thumbObservers?: ReturnType<typeof connectTabThumbObservers>;

  @queryAssignedElements({ flatten: true, selector: SLOT_MEMBER_SELECTOR })
  private _slotMembers!: VuTabItem[];

  /** True when slotted `<vu-tab-item>` children drive the segment list. */
  get usesSlotItems(): boolean {
    return tabUsesSlotItems(this, this._slotMembers, this.states.length);
  }

  /** Assigned or pending light-DOM slot members. */
  get slotMembers(): VuTabItem[] {
    return resolveTabSlotMembers(this, this._slotMembers);
  }

  /** Active segment element for indicator measurement and focus. */
  segmentAt(index: number): HTMLElement | null {
    if (this.usesSlotItems) {
      return this.slotMembers[index] ?? null;
    }
    const root = this.shadowRoot ?? this.renderRoot;
    if (!root || typeof root.querySelectorAll !== "function") return null;
    return root.querySelectorAll<HTMLElement>(".btn")[index] ?? null;
  }

  get items(): VuTabNormalizedItem[] {
    return this._itemsCache;
  }

  get index(): number {
    return tabSelectedIndex(this.items, this.selectedValue);
  }

  set index(nextIndex: number) {
    this.setSelectedIndex(nextIndex, null);
  }

  /** Effective selected segment value. */
  get selectedValue(): string {
    return tabSelectedValue({
      defaultValue: this.defaultValue,
      value: this.value,
      internalValue: this._internalValue,
      controlled: this._controlled,
    });
  }

  /** @internal Thumb + keyboard helpers share this host surface. */
  get ready(): boolean {
    return this._ready;
  }

  /** @internal */
  get initialRenderComplete(): boolean {
    return this._initialRenderComplete;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.#syncGapToken();
    this._controlled = this.value !== undefined;
    this._itemsCache = normalizeTabItems(this.states);
    this.#syncSelectionFromProps();

    this._thumbObservers = connectTabThumbObservers(this, () => {
      if (!this._initialRenderComplete) return;
      scheduleTabThumbUpdate(this);
    });
    if (isClient()) {
      window.addEventListener("resize", this.#onWindowResize, { passive: true });
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._thumbObservers?.disconnect();
    disconnectTabThumb(this);
    if (isClient()) {
      window.removeEventListener("resize", this.#onWindowResize);
    }
  }

  protected override firstUpdated(_changed: PropertyValues): void {
    this.#syncEffectiveColor();
    this._canvasContext = createTabMeasureContext();
    if (!canUseRaf()) {
      this.#refreshLabelWidths();
      this._ready = true;
      this._initialRenderComplete = true;
      return;
    }
    requestAnimationFrame(() => {
      this.#refreshLabelWidths();
      this._ready = true;
      this._initialRenderComplete = true;
      void this.updateComplete.then(() => {
        scheduleTabThumbUpdate(this);
      });
    });
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("value")) {
      this._controlled = this.value !== undefined;
    }

    this._itemsCache = this.usesSlotItems
      ? tabItemsFromSlot(this.slotMembers)
      : normalizeTabItems(this.states);

    if (
      changed.has("states")
      || changed.has("defaultValue")
      || changed.has("value")
      || changed.has("_slotMembers")
    ) {
      this.#syncSelectionFromProps();
      if (this._initialRenderComplete && (changed.has("states") || changed.has("_slotMembers"))) {
        this.#refreshLabelWidths();
        scheduleTabThumbUpdate(this);
      }
    }

    if (changed.has("size") && this._initialRenderComplete) {
      this.#refreshLabelWidths();
      scheduleTabThumbUpdate(this);
    }

    if (changed.has("orientation") && this._initialRenderComplete) {
      scheduleTabThumbUpdate(this);
    }

    if (changed.has("gap")) {
      this.#syncGapToken();
    }
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (
      changed.has("label")
      || changed.has("states")
      || changed.has("_slotMembers")
    ) {
      this.#warnAccessibleName();
    }

    if (changed.has("stretch") && this._initialRenderComplete) {
      scheduleTabThumbUpdate(this);
    }
    if (changed.has("color") || changed.has("value") || changed.has("states") || changed.has("_slotMembers")) {
      this.#syncEffectiveColor();
    }

    if (this.usesSlotItems) {
      this.#syncSlotMembers();
    }

    if (
      changed.has("states")
      || changed.has("_slotMembers")
      || changed.has("showCurrentLabelOnly")
      || changed.has("disabled")
      || changed.has("value")
      || changed.has("_internalValue")
    ) {
      scheduleTabThumbUpdate(this);
    }
  }

  #syncGapToken(): void {
    if (typeof this.style?.setProperty !== "function") return;
    if (this.gap) {
      this.style.setProperty("--tab-gap", this.gap);
      return;
    }
    this.style.removeProperty("--tab-gap");
  }

  #warnAccessibleName(): void {
    devWarnMissingAccessibleName(
      this,
      this.items.length > 0 && !this.label.trim(),
      "Set the `label` prop so the radiogroup has an accessible name.",
    );
  }

  #syncSlotMembers(): void {
    if (!this.usesSlotItems) return;
    syncTabSlotMembers(this.slotMembers, {
      selectedIndex: this.index,
      hostDisabled: this.disabled,
      labelCollapsed: this.showCurrentLabelOnly,
    });
  }

  #onDefaultSlotChange = (): void => {
    void this.#onDefaultSlotChangeAsync();
  };

  async #onDefaultSlotChangeAsync(): Promise<void> {
    this._itemsCache = tabItemsFromSlot(this.slotMembers);
    this.#syncSelectionFromProps();
    this.#syncSlotMembers();
    if (this._initialRenderComplete) {
      this.#refreshLabelWidths();
      scheduleTabThumbUpdate(this);
    }
    await this.updateComplete;
  }

  /** Restores uncontrolled selection from `defaultValue`. */
  reset(): void {
    const next = seedTabInternalValue(this.items, this.defaultValue);
    if (this._controlled) {
      this.value = next;
      return;
    }
    this._internalValue = next;
    this.requestUpdate();
  }

  #syncSelectionFromProps(): void {
    const items = this.items;
    if (this._controlled) {
      this.value = ensureTabValue(items, this.value ?? "");
      return;
    }
    this._internalValue = ensureTabValue(
      items,
      seedTabInternalValue(items, this.defaultValue),
    );
  }

  #onWindowResize = (): void => {
    this._thumbObservers?.onWindowResize();
  };

  #refreshLabelWidths(): void {
    const fallbackFontSize =
      typeof getComputedStyle !== "undefined"
        ? getComputedStyle(this).getPropertyValue("--font-size")
        : "";
    const root = this.shadowRoot ?? this.renderRoot;
    const wrap =
      root && typeof root.querySelector === "function"
        ? root.querySelector(".wrap")
        : null;
    this._labelWidths = measureTabLabelWidths(
      this.items,
      wrap instanceof HTMLElement ? wrap : null,
      fallbackFontSize,
      this._canvasContext,
    );
  }

  #syncEffectiveColor(): void {
    const token = tabEffectiveColor(this.items, this.index, this.color);
    applyTabEffectiveColor(this.style, token);
  }

  #emitChange(
    detail: VuTabChangeDetail,
  ): void {
    this.dispatchEvent(
      new CustomEvent<VuTabChangeDetail>("vu-change", {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  setSelectedIndex(nextIndex: number, source: HTMLElement | null): void {
    const items = this.items;
    if (!items.length) return;
    const clamped = Math.max(0, Math.min(items.length - 1, nextIndex));
    const nextValue = items[clamped].value;
    const previous = this.selectedValue;
    if (nextValue === previous) return;

    if (this._controlled) {
      this.value = nextValue;
    } else {
      this._internalValue = nextValue;
    }

    if (source) {
      this.#emitChange({
        value: nextValue,
        previous,
        index: clamped,
        item: items[clamped],
        source,
      });
    }
  }

  #onWrapClick = (event: MouseEvent): void => {
    if (this.disabled) return;

    if (this.usesSlotItems) {
      const slotItem = event
        .composedPath()
        .find((node): node is VuTabItem => node instanceof VuTabItem);
      if (!slotItem) return;
      const index = this.slotMembers.indexOf(slotItem);
      if (index < 0 || slotItem.disabled) return;
      this.setSelectedIndex(index, slotItem);
      return;
    }

    const button = (event.target as HTMLElement).closest?.(".btn") as
      | HTMLButtonElement
      | null;
    if (!button) return;
    const index = Number.parseInt(button.getAttribute("data-index") ?? "-1", 10);
    if (index < 0) return;
    const item = this.items[index];
    if (item?.disabled) return;
    this.setSelectedIndex(index, button);
  };

  #onKeydown = (event: KeyboardEvent): void => {
    onTabKeydown(this, event);
  };

  override render() {
    const selectedIndex = this.index;
    const items = this.items;
    const slotMode = this.usesSlotItems;

    return html`
      <div
        class="wrap"
        part="wrap"
        role="radiogroup"
        aria-label=${ifDefined(this.label || undefined)}
        aria-orientation=${this.orientation}
        style=${styleMap({ fontSize: "var(--font-size)" })}
        data-ready=${String(this._ready)}
        @keydown=${this.#onKeydown}
        @click=${this.#onWrapClick}
      >
        <span class="indicator" part="indicator thumb" aria-hidden="true"></span>
        ${repeat(
          slotMode ? [] : items,
          (item) => item.value,
          (item, index) => this.#renderPropSegment(item, index, selectedIndex),
        )}
        <slot @slotchange=${this.#onDefaultSlotChange} ?hidden=${this.hasUpdated && !slotMode}></slot>
      </div>
    `;
  }

  #renderPropSegment(
    item: VuTabNormalizedItem,
    index: number,
    selectedIndex: number,
  ) {
    const selected = index === selectedIndex;
    const showLabel = !this.showCurrentLabelOnly || selected;
    const labelHidden = this.showCurrentLabelOnly && !selected;
    const labelWidth = this._labelWidths.get(index) ?? 0;
    const approxButtonWidth = estimateTabSegmentMinWidth(
      item,
      labelWidth,
      this.size,
      this.iconOnly,
    );
    const isDisabled = this.disabled || Boolean(item.disabled);
    const vertical = this.orientation === "vertical";

    return html`
      <button
        class="btn"
        part=${selected ? "base base--selected" : "base"}
        role="radio"
        aria-checked=${selected}
        aria-disabled=${isDisabled ? "true" : "false"}
        tabindex=${selected ? "0" : "-1"}
        data-index=${index}
        ?disabled=${isDisabled}
        style=${this.stretch || vertical
          ? styleMap({ width: "100%" })
          : this.iconOnly
            ? nothing
            : styleMap({ minWidth: `${approxButtonWidth}px` })}
      >
        ${when(item.icon, () => html`
          <vu-icon
            .icon=${item.icon!}
            part="icon"
            aria-hidden="true"
          ></vu-icon>
        `)}
        ${when(item.label, () => html`
          <span
            class="label"
            part="label"
            data-hidden=${String(labelHidden)}
            data-index=${index}
            style=${styleMap({ maxWidth: showLabel ? "none" : "0" })}
          >
            ${item.label}
          </span>
        `)}
      </button>
    `;
  }

  /** Focuses the currently selected segment. */
  focusSegment(): void {
    const target = this.segmentAt(this.index);
    if (!target) return;
    if ("focusSegment" in target && typeof target.focusSegment === "function") {
      (target as VuTabItem).focusSegment();
      return;
    }
    (target as HTMLButtonElement).focus();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-tab": VuTab;
  }
}
