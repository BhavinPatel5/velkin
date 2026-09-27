import { html, LitElement, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { skeletonLoaderStyles } from "./skeleton-loader.style.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";


export type { VuSkeletonLoaderSlot } from "./skeleton-loader.types.js";

/**
 * @element vu-skeleton-loader
 *
 * @summary A skeleton loader component that swaps placeholders for content.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/skeleton-loader
 *
 * @slot placeholder - Composed `<vu-skeleton>` layout shown when `loading` is true.
 * @slot - Loaded content shown when `loading` is false.
 *
 * @csspart container - Root wrapper around both regions.
 * @csspart placeholder - Region that hosts the `placeholder` slot.
 * @csspart content - Region that hosts the default slot.
 *
 * @property {boolean} loading - Shows the `placeholder` slot and sets `aria-busy` when true.
 */
@customElement("vu-skeleton-loader")
@withComponentPresets
export class VuSkeletonLoader extends LitElement {
  static override styles = skeletonLoaderStyles;

  /** Shows the `placeholder` slot and sets `aria-busy` when true. */
  @property({ type: Boolean, reflect: true }) loading = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this._syncAriaBusy();
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has("loading")) {
      this._syncAriaBusy();
    }
  }

  private _syncAriaBusy(): void {
    this.setAttribute("aria-busy", String(this.loading));
  }

  override render() {
    return html`
      <div part="container">
        <div part="placeholder" ?hidden=${!this.loading}>
          <slot name="placeholder"></slot>
        </div>
        <div part="content" ?hidden=${this.loading}>
          <slot></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-skeleton-loader": VuSkeletonLoader;
  }
}
