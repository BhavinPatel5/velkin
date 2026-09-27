import { localized } from "@lit/localize";
import { html, LitElement, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { msg, str } from "../internals/utils/localize.js";
import { colorSwatchStyles } from "./color-swatch.style.js";
import type {
  VuColorSwatchSelectDetail,
  VuColorSwatchShape,
  VuColorSwatchSize,
} from "./color-swatch.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuColorSwatchSelectDetail,
  VuColorSwatchShape,
  VuColorSwatchSize,
} from "./color-swatch.types.js";
import { reflectString } from "../internals/utils/reflect-string.js";

const SIZES = new Set<VuColorSwatchSize>(["xs", "sm", "md", "lg", "xl"]);

function normalizeSize(raw: string): VuColorSwatchSize {
  return SIZES.has(raw as VuColorSwatchSize) ? (raw as VuColorSwatchSize) : "md";
}

/**
 * @element vu-color-swatch
 *
 * @summary A color swatch component for palettes, presets, and recent colors.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/color-swatch
 *
 * @property {string} color - CSS color painted on the chip. Default: `"transparent"`.
 * @property {string} value - Selection token in `vu-select` detail; defaults to `color`.
 * @property {VuColorSwatchSize} size - Visual size preset. Default: `"md"`.
 * @property {VuColorSwatchShape} shape - Chip outline (`circle` or `square`). Default: `"circle"`.
 * @property {boolean} checkerboard - Transparency checkerboard under the fill (`checkerboard` attr).
 * @property {boolean} selected - Contrast ring and checkmark (`selected` attr). Default: `false`.
 * @property {boolean} selectable - Focusable and clickable; emits `vu-select` (`selectable` attr).
 * @property {boolean} disabled - Disables interaction when `selectable` (`disabled` attr).
 * @property {boolean} readonly - Focusable but does not emit `vu-select` when `selectable`.
 * @property {string} colorName - Accessible name; blank defaults to `Color {color}`.
 *
 * @csspart base - The colored chip (`<button>` when selectable, `<div>` otherwise).
 *
 * @cssproperty --color-swatch-size - Edge length. Defaults follow `size`; override freely.
 * @cssproperty --color-swatch-radius - Corner radius; follows `shape` (`circle` | `square`).
 *
 * @fires {CustomEvent<VuColorSwatchSelectDetail>} vu-select - A `selectable` swatch was activated.
 */
@localized()
@customElement("vu-color-swatch")
@withComponentPresets
export class VuColorSwatch extends LitElement {
  static override styles = colorSwatchStyles;

  /** CSS color painted on the chip. */
  @property({ type: String, reflect: true })
  color = "transparent";

  /** Selection token in `vu-select` detail; defaults to `color`. */
  @property(reflectString)
  value = "";

  /** Visual size preset. */
  @property({ type: String, reflect: true })
  size: VuColorSwatchSize = "md";

  /** Chip outline (`circle` or `square`). */
  @property({ type: String, reflect: true })
  shape: VuColorSwatchShape = "circle";

  /** Transparency checkerboard under the fill (`checkerboard` attr). */
  @property({ type: Boolean, reflect: true })
  checkerboard = false;

  /** Contrast ring and checkmark (`selected` attr). */
  @property({ type: Boolean, reflect: true })
  selected = false;

  /** Focusable and clickable; emits `vu-select` (`selectable` attr). */
  @property({ type: Boolean, reflect: true })
  selectable = false;

  /** Disables interaction when `selectable` (`disabled` attr). */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Focusable but does not emit `vu-select` when `selectable`. */
  @property({ type: Boolean, reflect: true })
  readonly = false;

  /** Accessible name; blank defaults to `Color {color}`. */
  @property({ type: String })
  colorName = "";

  override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("disabled")) {
      if (this.disabled) {
        this.setAttribute("aria-disabled", "true");
      } else {
        this.removeAttribute("aria-disabled");
      }
    }
    if ((this.shape as string) !== "square") {
      this.shape = "circle";
    }
    if (!SIZES.has(this.size)) {
      this.size = normalizeSize(String(this.size));
    }
  }

  override updated(changed: PropertyValues): void {
    if (changed.has("color")) {
      this.style.setProperty("--color-swatch-color", this.color);
    }
    super.updated(changed);
  }

  private _ariaLabel(): string {
    const explicit = this.colorName.trim();
    if (explicit) return explicit;
    return String(
      msg(str`Color ${this.color}`, { desc: "Fallback accessible name for a color swatch chip." }),
    );
  }

  private _onClick = (event: Event): void => {
    if (!this.selectable || this.disabled || this.readonly) return;
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent<VuColorSwatchSelectDetail>("vu-select", {
        detail: { color: this.color, value: this.value || this.color },
        bubbles: true,
        composed: true,
      }),
    );
  };

  /** Picker-owned swatches use role=radio on the host; the host is focusable, not an inner button. */
  private get _isRadioSwatch(): boolean {
    return this.getAttribute("role") === "radio";
  }

  override render() {
    const aria = this._ariaLabel();
    if (this.selectable && !this._isRadioSwatch) {
      return html`
        <button
          part="base"
          type="button"
          aria-label=${aria}
          aria-pressed=${this.selected ? "true" : "false"}
          ?disabled=${this.disabled}
          @click=${this._onClick}
        ></button>
      `;
    }
    if (this.selectable) {
      return html`<div part="base" @click=${this._onClick}></div>`;
    }
    return html`
      <div part="base" role="img" aria-label=${aria}></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-color-swatch": VuColorSwatch;
  }
}
