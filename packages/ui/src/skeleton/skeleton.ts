import { html, LitElement, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { devTag, devWarnOnceForHost } from "../internals/utils/dev-warn.js";
import { normalizeSurfaceTone } from "../internals/utils/surface-tone.js";
import { resolveSkeletonDimensions } from "./internals/skeleton-shape.js";
import { skeletonStyles } from "./skeleton.style.js";
import type { VuSkeletonAnimation, VuSkeletonTone, VuSkeletonVariant } from "./skeleton.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";


export type { VuSkeletonAnimation, VuSkeletonTone, VuSkeletonVariant } from "./skeleton.types.js";

const VARIANTS = ["text", "circular", "rectangular"] as const;
const VARIANT_SET = new Set<string>(VARIANTS);
const ANIMATIONS = ["wave", "pulse", "none"] as const;
const ANIMATION_SET = new Set<string>(ANIMATIONS);

/**
 * @element vu-skeleton
 *
 * @summary A skeleton component with shimmer placeholders for loading layouts.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/skeleton
 *
 * @csspart root - Shimmer block; wave overlay is `::after`.
 *
 * @cssproperty --skel-bg - Placeholder surface color.
 * @cssproperty --skel-highlight - Wave highlight color.
 * @cssproperty --skel-wave-speed - Wave animation period.
 * @cssproperty --skel-pulse-speed - Pulse animation period.
 *
 * @property {VuSkeletonVariant} variant - Shape hint (`text`, `circular`, `rectangular`).
 * @property {string} width - CSS width; blank uses the variant default.
 * @property {string} height - CSS height; blank uses the variant default.
 * @property {string} radius - Corner preset or length; ignored for `circular`.
 * @property {VuSkeletonAnimation} animation - `wave`, `pulse`, or `none`.
 * @property {VuSkeletonTone} tone - Neutral surface weight behind the shimmer.
 * @property {boolean} inline - Inline-block text-line layout.
 */
@customElement("vu-skeleton")
@withComponentPresets
export class VuSkeleton extends LitElement {
  static override styles = skeletonStyles;

  /** Shape hint (`text`, `circular`, `rectangular`). */
  @property({ type: String, reflect: true }) variant: VuSkeletonVariant = "rectangular";
  /** CSS width; blank uses the variant default. */
  @property({ type: String }) width = "";
  /** CSS height; blank uses the variant default. */
  @property({ type: String }) height = "";
  /** Corner preset or length; ignored for `circular`. */
  @property({ type: String }) radius = "";
  /** `wave`, `pulse`, or `none`. */
  @property({ type: String, reflect: true }) animation: VuSkeletonAnimation = "wave";
  /** Neutral surface weight behind the shimmer. */
  @property({ type: String, reflect: true }) tone: VuSkeletonTone = "normal";
  /** Inline-block text-line layout. */
  @property({ type: Boolean, reflect: true }) inline = false;

  override updated(changed: PropertyValues<this>): void {
    if (changed.has("variant") && !VARIANT_SET.has(this.variant)) {
      devWarnOnceForHost(
        this,
        `invalid-variant:${this.variant}`,
        `${devTag(this)} received invalid \`variant="${this.variant}"\`. Allowed: ${VARIANTS.join(", ")}.`,
      );
    }

    if (changed.has("animation") && !ANIMATION_SET.has(this.animation)) {
      devWarnOnceForHost(
        this,
        `invalid-animation:${this.animation}`,
        `${devTag(this)} received invalid \`animation="${this.animation}"\`. Allowed: ${ANIMATIONS.join(", ")}.`,
      );
    }

    if (changed.has("tone")) {
      normalizeSurfaceTone(this.tone, this);
    }
  }

  override render() {
    const dims = resolveSkeletonDimensions(this.variant, this.width, this.height, this.radius);

    return html`
      <div
        part="root"
        aria-hidden="true"
        style=${styleMap({
          inlineSize: dims.width,
          blockSize: dims.height,
          borderRadius: dims.borderRadius,
        })}
      ></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-skeleton": VuSkeleton;
  }
}
