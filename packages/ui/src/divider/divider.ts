import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { dividerStyles } from "./divider.style.js";
import type { VuDividerDirection, VuDividerSize } from "./divider.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";


export type { VuDividerDirection, VuDividerSize } from "./divider.types.js";

/**
 * @element vu-divider
 *
 * @summary A divider component for horizontal or vertical layout separation.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/divider
 *
 * @property {VuDividerDirection} direction - Divider orientation. Default: `"horizontal"`.
 * @property {boolean} inset - Indents the line from the start/end edges. Default: `false`.
 * @property {VuDividerSize} size - Hairline thickness scale. Default: `"md"`.
 *
 * @csspart divider - The `role="separator"` line element.
 *
 * @cssproperty --divider-color - Line color.
 * @cssproperty --divider-thickness - Line thickness.
 * @cssproperty --divider-margin - Outer margin on the host around the line (prefer symmetric values like '0.5rem 0').
 * @cssproperty --divider-length - Block size when `direction="vertical"`.
 * @cssproperty --divider-inset - Inline/block inset padding when `inset` is true.
 */
@customElement("vu-divider")
@withComponentPresets
export class VuDivider extends LitElement {
  static override styles = dividerStyles;

  /** Divider orientation. */
  @property({ type: String, reflect: true })
  direction: VuDividerDirection = "horizontal";

  /** Indents the line from the start/end edges. */
  @property({ type: Boolean, reflect: true })
  inset = false;

  /** Hairline thickness scale. */
  @property({ type: String, reflect: true })
  size: VuDividerSize = "md";

  /** @protected */
  override render() {
    const orientation = this.direction === "vertical" ? "vertical" : "horizontal";
    return html` <hr part="divider" role="separator" aria-orientation=${orientation} /> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-divider": VuDivider;
  }
}
