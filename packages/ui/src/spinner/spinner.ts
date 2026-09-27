import { html, LitElement, type PropertyValues } from "lit";
import { localized } from "@lit/localize";
import { customElement, property } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { devTag, devWarnOnceForHost } from "../internals/utils/dev-warn.js";
import { msg } from "../internals/utils/localize.js";
import {
  isSpinnerSizePreset,
  resolveSpinnerSize,
  spinnerSpeedPeriod,
} from "./internals/spinner-size.js";
import { spinnerStyles } from "./spinner.style.js";
import type { VuSpinnerColor, VuSpinnerSizePreset, VuSpinnerVariant } from "./spinner.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";


export type { VuSpinnerColor, VuSpinnerSizePreset, VuSpinnerVariant } from "./spinner.types.js";

const VARIANTS = [
  "solid",
  "track",
  "dashed",
  "segment",
  "gradient",
  "dual",
  "material",
  "pulse",
  "dots",
  "bars",
] as const;

const VARIANT_SET = new Set<string>(VARIANTS);

/**
 * @element vu-spinner
 *
 * @summary A spinner component with multiple visual variants and overlay modes.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/spinner
 *
 * @csspart spinner - Root flex container; becomes the overlay surface when `overlay` / `fullscreen`.
 * @csspart circle - Ring-style variants (`solid`, `track`, `gradient`, …).
 * @csspart dots - Three-dot variant container.
 * @csspart dot - Individual dot in the `dots` variant.
 * @csspart bars - Four-bar variant container.
 * @csspart bar - Individual bar in the `bars` variant.
 *
 * @cssproperty --spinner-speed - Animation period derived from `speed`.
 * @cssproperty --spinner-size - Glyph block size; preset via `size` or custom CSS length.
 * @cssproperty --spinner-thickness - Ring stroke width.
 *
 * @property {VuSpinnerVariant} variant - Spinner visual style.
 * @property {VuSpinnerSizePreset | string} size - Size preset or CSS length.
 * @property {VuSpinnerColor} color - Foreground intent token (`currentColor`).
 * @property {string} label - Accessible name; defaults to a localized loading label.
 * @property {boolean} overlay - Covers the parent element as an overlay.
 * @property {boolean} fullscreen - Covers the viewport as a fullscreen overlay.
 * @property {boolean} backdropBlur - Blurs content behind overlay modes.
 * @property {number} speed - Animation speed multiplier (`1` = default rate).
 * @property {boolean} paused - Pauses animation without removing the element.
 */
@localized()
@customElement("vu-spinner")
@withComponentPresets
export class VuSpinner extends LitElement {
  static override styles = spinnerStyles;

  /** Spinner visual style. */
  @property({ type: String, reflect: true }) variant: VuSpinnerVariant = "solid";
  /** Size preset or CSS length. */
  @property({ type: String, reflect: true }) size: VuSpinnerSizePreset | string = "md";
  /** Foreground intent token (`currentColor`). */
  @property({ type: String, reflect: true }) color: VuSpinnerColor = "primary";
  /** Accessible name; defaults to a localized loading label. */
  @property({ type: String }) label = "";
  /** Covers the parent element as an overlay. */
  @property({ type: Boolean, reflect: true }) overlay = false;
  /** Covers the viewport as a fullscreen overlay. */
  @property({ type: Boolean, reflect: true }) fullscreen = false;
  /** Blurs content behind overlay modes. */
  @property({ type: Boolean, reflect: true }) backdropBlur = false;
  /** Animation speed multiplier (`1` = default rate). */
  @property({ type: Number }) speed = 1;
  /** Pauses animation without removing the element. */
  @property({ type: Boolean, reflect: true }) paused = false;

  private _ariaLabel(): string {
    const explicit = this.label.trim();
    return explicit || String(msg("Loading", { desc: "Accessible name for a loading spinner." }));
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this._syncHostVars();
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has("variant") && !VARIANT_SET.has(this.variant)) {
      devWarnOnceForHost(
        this,
        `invalid-variant:${this.variant}`,
        `${devTag(this)} received invalid \`variant="${this.variant}"\`. Allowed: ${VARIANTS.join(", ")}.`,
      );
    }

    if (changed.has("speed") && (!this.speed || this.speed <= 0)) {
      this.speed = 1;
    }

    if (changed.has("size") || changed.has("speed")) {
      this._syncHostVars();
    }
  }

  private _syncHostVars(): void {
    const sizeValue = resolveSpinnerSize(this.size);
    if (!isSpinnerSizePreset(this.size)) {
      this.style.setProperty("--spinner-size", sizeValue);
    } else {
      this.style.removeProperty("--spinner-size");
    }

    this.style.setProperty("--spinner-speed", spinnerSpeedPeriod(this.speed));
  }

  override render() {
    return html`
      <div
        part="spinner"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label=${this._ariaLabel()}
      >
        ${when(
          this.variant === "dots",
          () => html`
            <div part="dots">
              <div part="dot"></div>
              <div part="dot"></div>
              <div part="dot"></div>
            </div>
          `,
          () =>
            when(
              this.variant === "bars",
              () => html`
                <div part="bars">
                  <div part="bar"></div>
                  <div part="bar"></div>
                  <div part="bar"></div>
                  <div part="bar"></div>
                </div>
              `,
              () => html`<div part="circle"></div>`,
            ),
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-spinner": VuSpinner;
  }
}
