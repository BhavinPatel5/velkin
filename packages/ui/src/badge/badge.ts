import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap, type StyleInfo } from "lit/directives/style-map.js";
import { hasLightChildrenInSlot } from "../internals/utils/slot.js";
import { badgeStyles } from "./badge.style.js";
import type { VuBadgeColor, VuBadgePlacement, VuBadgeSize } from "./badge.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";
import { reflectString } from "../internals/utils/reflect-string.js";


export type { VuBadgeColor, VuBadgePlacement, VuBadgeSize } from "./badge.types.js";

/**
 * @element vu-badge
 *
 * @summary A badge component for counts, status dots, and overlay marks.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/badge
 *
 * @slot - Anchor content the badge overlays.
 * @slot mark - Custom badge glyph; ignored when `dot` is true.
 *
 * @property {string} value - Count or short text fallback.
 * @property {number} max - Cap numeric values to `N+`; `0` disables. Default: `99`.
 * @property {boolean} dot - Pure-dot mode. Default: `false`.
 * @property {VuBadgeSize} size - Pill / dot scale. Default: `"md"`.
 * @property {VuBadgeColor} color - Intent palette; defaults to `"danger"` for count/alert marks. Default: `"danger"`.
 * @property {VuBadgePlacement} placement - Corner anchor. Default: `"top-right"`.
 * @property {string} offset - CSS-length nudge from the anchor corner.
 * @property {boolean} bordered - Halo cutout ring (match parent via `--badge-bordered-gap-color`). Default: `true`.
 * @property {boolean} show - Explicit visibility toggle. Default: `true`.
 * @property {boolean} hideOnZero - Auto-hides when numeric `value` is 0 (`hideonzero` attr). Default: `false`.
 * @property {boolean} processing - Outward pulse animation. Default: `false`.
 * @property {boolean} disabled - Dims the badge. Default: `false`.
 * @property {string} label - Accessible name override.
 *
 * @csspart base - Wrapper holding anchor and badge.
 * @csspart badge - Overlaid pill or dot.
 *
 * @cssproperty --badge-bg - Surface color.
 * @cssproperty --badge-fg - Text or glyph color.
 * @cssproperty --badge-ring - Pulse color when `processing`.
 * @cssproperty --badge-min-size - Dot diameter and pill block-size / min inline-size.
 * @cssproperty --badge-px - Horizontal pill padding (block padding is 0; height from min-size).
 * @cssproperty --badge-font-size - Pill type size.
 * @cssproperty --badge-bordered-gap-color - Halo fill — must match the parent surface (defaults to page background).
 */
@customElement("vu-badge")
@withComponentPresets
export class VuBadge extends LitElement {
  static override styles = badgeStyles;

  /** Count or short text fallback. */
  @property({ type: String })
  value = "";

  /** Cap numeric values to `N+`; `0` disables. */
  @property({ type: Number })
  max = 99;

  /** Pure-dot mode. */
  @property({ type: Boolean, reflect: true })
  dot = false;

  /** Pill / dot scale. */
  @property({ type: String, reflect: true })
  size: VuBadgeSize = "md";

  /** Intent palette; defaults to `"danger"` for count/alert marks. */
  @property({ type: String, reflect: true })
  color: VuBadgeColor = "danger";

  /** Corner anchor over slotted content. */
  @property({ type: String, reflect: true })
  placement: VuBadgePlacement = "top-right";

  /** CSS-length nudge from the anchor corner. */
  @property(reflectString)
  offset = "";

  /** Colored ring with halo cutout. */
  @property({ type: Boolean, reflect: true })
  bordered = true;

  /** Explicit visibility toggle. */
  @property({ type: Boolean })
  show = true;

  /** Auto-hides when numeric `value` is 0. */
  @property({ type: Boolean })
  hideOnZero = false;

  /** Outward pulse animation. */
  @property({ type: Boolean, reflect: true })
  processing = false;

  /** Dims the badge. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Accessible name override. */
  @property({ type: String })
  label = "";

  override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("disabled")) {
      if (this.disabled) {
        this.setAttribute("aria-disabled", "true");
      } else {
        this.removeAttribute("aria-disabled");
      }
    }
  }

  private get _hasMarkSlot(): boolean {
    return hasLightChildrenInSlot(this, "mark");
  }

  /** True when the badge should render at all (combines `show` + `hideOnZero`). */
  private get _isVisible(): boolean {
    if (!this.show) return false;
    if (this.hideOnZero) {
      const n = Number(this.value);
      if (!Number.isNaN(n) && n === 0) return false;
    }
    return true;
  }

  /** Formatted text shown inside the pill — or empty string for dot mode. */
  private get _displayValue(): string {
    if (this.dot || this.value === "") return "";
    const n = Number(this.value);
    if (!Number.isNaN(n) && this.max > 0 && n > this.max) {
      return `${this.max}+`;
    }
    return this.value;
  }

  /** True when the badge should render as a pure dot (no value, no slotted content, or `dot` forced). */
  private get _isDotMode(): boolean {
    if (this.dot) return true;
    return this._displayValue === "" && !this._hasMarkSlot;
  }

  /** Effective accessible name. Empty for decorative dots and icon-only badges; otherwise the displayed value. */
  private get _accessibleLabel(): string {
    if (this.label) return this.label;
    if (this._isDotMode || this._hasMarkSlot) return "";
    return this._displayValue;
  }

  /** Inline margin offsets pushed outward from the anchor corner; sign derived from placement. */
  private get _offsetStyle(): StyleInfo {
    if (!this.offset) return {};
    const isBottom = this.placement.startsWith("bottom");
    const isLeft = this.placement.endsWith("left");
    const isCenter = this.placement === "top-center";

    return {
      marginBlockStart: isBottom ? this.offset : `calc(-1 * ${this.offset})`,
      marginInlineStart: isCenter
        ? "0"
        : isLeft
          ? `calc(-1 * ${this.offset})`
          : this.offset,
    };
  }

  private _onMarkSlotChange = (): void => {
    this.requestUpdate();
  };

  override render() {
    const display = this._displayValue;
    const isDot = this._isDotMode;
    const isVisible = this._isVisible;
    const accessibleLabel = this._accessibleLabel;

    const badgeClass = classMap({
      "is-dot": isDot,
      "is-hidden": !isVisible,
    });

    return html`
      <div part="base">
        <slot></slot>
        <span
          part="badge"
          class=${badgeClass}
          style=${styleMap(this._offsetStyle)}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label=${accessibleLabel || nothing}
          aria-hidden=${isVisible ? "false" : "true"}
        >${
          isDot
            ? html`<slot name="mark" hidden @slotchange=${this._onMarkSlotChange}></slot>`
            : html`<slot name="mark" @slotchange=${this._onMarkSlotChange}>${display}</slot>`
        }</span>
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "vu-badge": VuBadge;
  }
}
