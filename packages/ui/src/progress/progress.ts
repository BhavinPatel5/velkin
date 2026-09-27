import { html, LitElement, nothing, type PropertyValues } from "lit";
import { localized } from "@lit/localize";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { when } from "lit/directives/when.js";
import { styleMap } from "lit/directives/style-map.js";
import { devTag, devWarnOnceForHost } from "../internals/utils/dev-warn.js";
import { isServer } from "../internals/utils/env.js";
import { msg } from "../internals/utils/localize.js";
import { normalizeSurfaceTone } from "../internals/utils/surface-tone.js";
import {
  indeterminateAnimationName,
  progressWidths,
} from "./internals/progress-value.js";
import { progressStyles } from "./progress.style.js";
import type {
  VuProgressColor,
  VuProgressSize,
  VuProgressTone,
  VuProgressVariant,
} from "./progress.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuProgressColor,
  VuProgressSize,
  VuProgressTone,
  VuProgressVariant,
  VuProgressWidths,
} from "./progress.types.js";

const VARIANTS = ["default", "outline", "underline", "ring"] as const;
const VARIANT_SET = new Set<string>(VARIANTS);

/**
 * @element vu-progress
 *
 * @summary A progress component with linear, ring, and indeterminate modes.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/progress
 *
 * @csspart container - Outer track shell or ring frame.
 * @csspart bar - Foreground fill in determinate mode.
 * @csspart buffer - Buffered segment behind the fill.
 * @csspart indeterminate - Animated segment in indeterminate mode.
 * @csspart track - Ring track stroke (`variant="ring"` only).
 *
 * @cssproperty --progress-track-size - Track block size; overridden by `size`.
 * @cssproperty --progress-radius - Track and bar corner radius.
 * @cssproperty --progress-track-bg - Unfilled rail color.
 * @cssproperty --progress-buffer-bg - Buffer segment color.
 * @cssproperty --progress-fill-bg - Foreground fill color.
 * @cssproperty --progress-indeterminate-width - Indeterminate segment width.
 * @cssproperty --progress-indeterminate-speed - Indeterminate animation duration.
 * @cssproperty --progress-ring-size - Ring diameter when `variant="ring"`.
 * @cssproperty --progress-ring-stroke - Ring stroke width when `variant="ring"`.
 *
 * @property {VuProgressVariant} variant - Linear rail style or ring mode. Default: `"default"`.
 * @property {number} value - Determinate fill from 0 to max. Default: `0`.
 * @property {number} max - Maximum value for normalization. Default: `100`.
 * @property {number} buffer - Buffered amount behind the fill. Default: `0`.
 * @property {boolean} indeterminate - Animated unknown-progress mode. Default: `false`.
 * @property {VuProgressSize} size - Track thickness preset. Default: `"md"`.
 * @property {VuProgressTone} tone - Neutral rail weight behind the fill. Default: `"normal"`.
 * @property {boolean} block - Stretches to the container width. Default: `false`.
 * @property {VuProgressColor} color - Foreground fill intent token. Default: `"primary"`.
 * @property {string} speed - Indeterminate animation duration. Default: `"1s"`.
 * @property {string} label - Accessible name; empty uses locale catalog. Default: `""`.
 */
@localized()
@customElement("vu-progress")
@withComponentPresets
export class VuProgress extends LitElement {
  static override styles = progressStyles;

  /** Linear rail style or ring mode. */
  @property({ type: String, reflect: true }) variant: VuProgressVariant = "default";
  /** Determinate fill from 0 to max. */
  @property({ type: Number }) value = 0;
  /** Maximum value for normalization. */
  @property({ type: Number }) max = 100;
  /** Buffered amount behind the fill. */
  @property({ type: Number }) buffer = 0;
  /** Animated unknown-progress mode. */
  @property({ type: Boolean, reflect: true }) indeterminate = false;
  /** Track thickness preset. */
  @property({ type: String, reflect: true }) size: VuProgressSize = "md";
  /** Neutral rail weight behind the fill. */
  @property({ type: String, reflect: true }) tone: VuProgressTone = "normal";
  /** Stretches to the container width. */
  @property({ type: Boolean, reflect: true }) block = false;
  /** Foreground fill intent token. */
  @property({ type: String, reflect: true }) color: VuProgressColor = "primary";
  /** Indeterminate animation duration. */
  @property({ type: String }) speed = "1s";
  /** Accessible name; empty uses locale catalog. */
  @property({ type: String }) label = "";

  private get _isRing(): boolean {
    return this.variant === "ring";
  }

  private _ariaLabel(): string {
    const explicit = this.label.trim();
    return (
      explicit ||
      String(msg("Progress", {
        id: "nu.progress.aria-label",
        desc: "Accessible name for a progress bar.",
      }))
    );
  }

  private _ariaValueNow(): number | typeof nothing {
    if (this.indeterminate) return nothing;
    return Math.max(0, Math.min(this.value, this.max));
  }

  private _ariaValueText(): string | typeof nothing {
    if (this.indeterminate) return nothing;
    const clamped = Math.max(0, Math.min(this.value, this.max));
    const pct = this.max > 0 ? Math.round((clamped / this.max) * 100) : 0;
    return `${pct}%`;
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

    if (changed.has("tone")) {
      normalizeSurfaceTone(this.tone, this);
    }

    if (
      this.indeterminate &&
      this.value > 0 &&
      (changed.has("indeterminate") || changed.has("value"))
    ) {
      devWarnOnceForHost(
        this,
        "indeterminate-value-semantics",
        `${devTag(this)} In indeterminate mode, \`value\` sets the sweep segment width (0–100%), not fill progress.`,
      );
    }

    if (
      changed.has("speed") ||
      changed.has("indeterminate") ||
      changed.has("value")
    ) {
      this._syncHostVars();
    }
  }

  private _syncHostVars(): void {
    this.style.setProperty("--progress-indeterminate-speed", this.speed);
    if (this.indeterminate && this.value > 0) {
      const segment = Math.min(100, Math.max(0, this.value));
      this.style.setProperty("--progress-indeterminate-width", `${segment}%`);
    } else {
      this.style.removeProperty("--progress-indeterminate-width");
    }
  }

  private _renderLinear(widths: ReturnType<typeof progressWidths>) {
    return when(
      this.indeterminate,
      () => html`
        <div
          part="indeterminate"
          style=${styleMap({ animationName: indeterminateAnimationName(this, isServer) })}
        ></div>
      `,
      () => html`
        <div
          part="buffer"
          style=${styleMap({ inlineSize: `${widths.buffer}%` })}
        ></div>
        <div
          part="bar"
          style=${styleMap({ inlineSize: `${widths.progress}%` })}
        ></div>
      `,
    );
  }

  private _ringArcStyle(percent: number) {
    return styleMap({ "--progress-ring-pct": `${percent}%` });
  }

  private _renderRing(widths: ReturnType<typeof progressWidths>) {
    return html`
      <div part="ring" aria-hidden="true">
        <div part="track"></div>
        ${when(
          this.indeterminate,
          () => html`<div part="indeterminate"></div>`,
          () => html`
            ${when(
              this.buffer > 0,
              () => html`
                <div
                  part="buffer"
                  style=${this._ringArcStyle(widths.buffer)}
                ></div>
              `,
            )}
            <div part="bar" style=${this._ringArcStyle(widths.progress)}></div>
          `,
        )}
      </div>
    `;
  }

  override render() {
    const widths = progressWidths(this.value, this.max, this.buffer);

    return html`
      <div
        part="container"
        role="progressbar"
        aria-label=${this._ariaLabel()}
        aria-valuemin="0"
        aria-valuemax=${this.max}
        aria-valuenow=${this._ariaValueNow()}
        aria-valuetext=${ifDefined(this._ariaValueText())}
      >
        ${this._isRing ? this._renderRing(widths) : this._renderLinear(widths)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-progress": VuProgress;
  }
}
