import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { canUseResizeObserver, isServer } from "../internals/utils/env.js";
import { adaptiveItemStyles } from "./adaptive-item.style.js";
import type { VuAdaptiveItemSize, VuAdaptiveItemSizeDetail } from "./adaptive-item.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";


export type { VuAdaptiveItemSize, VuAdaptiveItemSizeDetail } from "./adaptive-item.types.js";

/**
 * @element vu-adaptive-item
 *
 * @summary An adaptive bar item component for use inside `<vu-adaptive-bar>`.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/adaptive-bar
 *
 * @slot - Item content (buttons, links, labels, icons, or any markup).
 *
 * @property {VuAdaptiveItemSize} size - Padding and gap scale. Default: `"md"`.
 * @property {boolean} disabled - Dims the item and blocks pointer events.
 * @fires {CustomEvent<VuAdaptiveItemSizeDetail>} vu-resize - Fired when the component size changes.
 * @method getSize Returns the current element bounding rect.
 * @method isInOverflow Returns whether the item is in the overflow menu.
 *
 * @csspart item - The main container element.
 * @csspart in-overflow - Applied when the item is in the overflow menu.
 * @csspart in-bar - Applied when the item is in the main bar.
 *
 * @cssproperty --adaptive-item-gap - Gap between slotted nodes.
 * @cssproperty --adaptive-item-py - Block padding inside the item (default `0` — content owns hit padding).
 * @cssproperty --adaptive-item-px - Inline padding inside the item (default `0`).
 * @cssproperty --adaptive-item-font-size - Typography scale for the item shell.
 * @cssproperty --adaptive-item-min-block-size - Minimum block size of the item shell.
 * @cssproperty --adaptive-item-radius - Corner radius of the item shell.
 */
@customElement("vu-adaptive-item")
@withComponentPresets
export class VuAdaptiveItem extends LitElement {
  static override styles = adaptiveItemStyles;

  /** Padding and gap scale. */
  @property({ type: String, reflect: true })
  size: VuAdaptiveItemSize = "md";

  /** Dims the item and blocks pointer events. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** @internal */
  @state()
  private _inOverflow = false;

  /** @internal */
  private _resizeObserver?: ResizeObserver;

  static override get observedAttributes() {
    return [...super.observedAttributes, "slot"];
  }

  /** @protected */
  override attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null) {
    super.attributeChangedCallback(name, oldVal, newVal);
    if (name === "slot" && oldVal !== newVal) {
      this._inOverflow = newVal === "overflow";
      if (this._inOverflow) {
        this.setAttribute("inoverflow", "");
        this.removeAttribute("role");
      } else {
        this.removeAttribute("inoverflow");
        this.setAttribute("role", "listitem");
      }
      this._measureAndReportSize();
    }
  }

  /** @internal */
  private _measureAndReportSize() {
    this.dispatchEvent(
      new CustomEvent<VuAdaptiveItemSizeDetail>("vu-resize", {
        bubbles: true,
        composed: true,
        detail: {
          element: this,
          width: this.offsetWidth,
          height: this.offsetHeight,
        },
      }),
    );
  }

  /** @protected */
  override connectedCallback() {
    super.connectedCallback();

    this._inOverflow = this.slot === "overflow";
    if (this._inOverflow) {
      this.setAttribute("inoverflow", "");
    } else {
      this.setAttribute("role", "listitem");
    }

    this.updateComplete.then(() => this._measureAndReportSize());

    if (isServer || !canUseResizeObserver()) {
      return;
    }

    this._resizeObserver = new ResizeObserver(() => this._measureAndReportSize());
    this._resizeObserver.observe(this);
  }

  /** @protected */
  override disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
  }

  /** Returns the current bounding rect of the item. */
  getSize(): DOMRect {
    return this.getBoundingClientRect();
  }

  /** True when the parent bar has moved this item into the overflow menu. */
  isInOverflow(): boolean {
    return this._inOverflow;
  }

  /** @protected */
  override render() {
    const partTokens = this._inOverflow ? "item in-overflow" : "item in-bar";
    return html`
      <div
        part=${partTokens}
        class="item-container"
        aria-disabled=${this.disabled ? "true" : nothing}
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-adaptive-item": VuAdaptiveItem;
  }
}
