import { html, LitElement, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { devTag, devWarnOnceForHost } from "../internals/utils/dev-warn.js";
import { carouselItemStyles } from "./carousel-item.style.js";
import type { VuCarouselItemOrientation } from "./carousel-item.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";


export type { VuCarouselItemOrientation } from "./carousel-item.types.js";

/**
 * @element vu-carousel-item
 *
 * @summary A carousel slide component for use inside `<vu-carousel>`.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/carousel
 *
 * @slot - Slide content (media, cards, or any markup).
 *
 * @property {string} label - Optional accessible name for this slide; when empty the parent supplies "N of M".
 *
 * @csspart base - Slide content wrapper.
 *
 * Always slot inside `<vu-carousel>`. The parent relays slide position, visibility, orientation, and localized role text via internal properties — do not set those yourself.
 */
@customElement("vu-carousel-item")
@withComponentPresets
export class VuCarouselItem extends LitElement {
  static override styles = carouselItemStyles;

  /** Optional accessible name; when empty the parent supplies the "N of M" position label. */
  @property({ type: String })
  label = "";

  /** @internal Localized `aria-roledescription` relayed from `<vu-carousel>`. */
  @property({ type: String, attribute: false })
  slideRole = "slide";

  /** @internal Position label ("N of M") relayed from the parent when `label` is empty. */
  @property({ type: String, attribute: false })
  positionLabel = "";

  /** @internal Whether this slide is in the visible viewport window. */
  @property({ type: Boolean, attribute: false })
  inView = false;

  /** @internal Layout axis relayed from the parent (reflected for CSS vertical fill). */
  @property({ type: String, reflect: true })
  orientation: VuCarouselItemOrientation = "horizontal";

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.closest("vu-carousel")) {
      devWarnOnceForHost(
        this,
        "orphan-carousel-item",
        `${devTag(this)} should be slotted inside <vu-carousel> for slide layout and ARIA.`,
      );
    }
  }

  override updated(changed: PropertyValues<this>): void {
    if (
      changed.has("label") ||
      changed.has("slideRole") ||
      changed.has("positionLabel") ||
      changed.has("inView")
    ) {
      this._applySlideA11y();
    }
  }

  private _applySlideA11y(): void {
    this.setAttribute("role", "group");
    this.setAttribute("aria-roledescription", this.slideRole);
    const name = this.label.trim() || this.positionLabel;
    if (name) {
      this.setAttribute("aria-label", name);
    } else {
      this.removeAttribute("aria-label");
    }
    if (this.inView) {
      this.inert = false;
      this.removeAttribute("inert");
      this.removeAttribute("aria-hidden");
    } else {
      this.inert = true;
      this.setAttribute("inert", "");
      this.setAttribute("aria-hidden", "true");
    }
  }

  override render() {
    return html`<div part="base"><slot></slot></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-carousel-item": VuCarouselItem;
  }
}
