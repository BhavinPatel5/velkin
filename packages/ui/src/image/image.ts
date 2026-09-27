import { LitElement, html, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { ImageAutoSizes } from "./internals/image-auto-sizes.js";
import { imageStyles } from "./image.style.js";
import type { VuImageDecoding, VuImageFit, VuImageLoading } from "./image.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";


export type { VuImageDecoding, VuImageFit, VuImageLoading } from "./image.types.js";

/**
 * @element vu-image
 *
 * @summary An image component with responsive srcset and optional auto sizes.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/image
 *
 * @property {string} src - Primary image source URL.
 * @property {string} alt - Alternative text; empty marks decorative.
 * @property {string} srcset - Responsive source set string.
 * @property {string} sizes - Responsive sizes string.
 * @property {boolean} autoSizes - Computes `sizes` from host width (`autosizes` attr). Default: `false`.
 * @property {VuImageFit} fit - Object-fit preset. Default: `"cover"`.
 * @property {VuImageLoading} loading - Native loading hint. Default: `"lazy"`.
 * @property {VuImageDecoding} decoding - Native decoding hint. Default: `"async"`.
 *
 * @csspart img - The underlying `<img>` element.
 * @csspart placeholder - Empty-state block when `src` is blank.
 */
@customElement("vu-image")
@withComponentPresets
export class VuImage extends LitElement {
  static override styles = imageStyles;

  /** Primary image source URL. */
  @property({ type: String })
  src = "";

  /** Alternative text; empty marks decorative. */
  @property({ type: String })
  alt = "";

  /** Responsive source set string. */
  @property({ type: String })
  srcset = "";

  /** Responsive sizes string. */
  @property({ type: String })
  sizes = "";

  /** Computes `sizes` from host width. */
  @property({ type: Boolean })
  autoSizes = false;

  /** Object-fit preset. */
  @property({ type: String, reflect: true })
  fit: VuImageFit = "cover";

  /** Native loading hint. */
  @property({ type: String })
  loading: VuImageLoading = "lazy";

  /** Native decoding hint. */
  @property({ type: String })
  decoding: VuImageDecoding = "async";

  @state()
  private _computedSizes = "";

  private _autoSizes: ImageAutoSizes | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this._syncAutoSizes();
  }

  override disconnectedCallback(): void {
    this._autoSizes?.stop();
    this._autoSizes = null;
    super.disconnectedCallback();
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has("autoSizes")) {
      this._syncAutoSizes();
    }
  }

  private _syncAutoSizes(): void {
    if (!this.autoSizes) {
      this._autoSizes?.stop();
      this._autoSizes = null;
      this._computedSizes = "";
      return;
    }

    this._autoSizes ??= new ImageAutoSizes(this, (sizes) => {
      this._computedSizes = sizes;
    });
    this._autoSizes.start();
  }

  private _resolvedSizes(): string | undefined {
    const value = this.autoSizes ? this._computedSizes : this.sizes.trim();
    return value || undefined;
  }

  override render() {
    const hasSrc = this.src.trim() !== "";
    const sizesAttr = this._resolvedSizes();
    const alt = this.alt.trim();

    if (!hasSrc) {
      return html`
        <div
          part="placeholder"
          role=${alt ? "img" : nothing}
          aria-label=${alt ? alt : nothing}
          aria-hidden=${alt ? nothing : "true"}
        ></div>
      `;
    }

    return html`
      <img
        part="img"
        src=${this.src}
        alt=${alt}
        srcset=${ifDefined(this.srcset.trim() || undefined)}
        sizes=${ifDefined(sizesAttr)}
        loading=${this.loading}
        decoding=${this.decoding}
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-image": VuImage;
  }
}
