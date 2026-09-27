import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { VuIcon } from "../icon/icon.js";
import { devTag, devWarnOnceForHost } from "../internals/utils/dev-warn.js";
import { tabItemStyles } from "./tab-item.style.js";
import type { VuTabItemColor } from "./tab-item.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";
import { reflectString } from "../internals/utils/reflect-string.js";


export type { VuTabItemColor } from "./tab-item.types.js";

/**
 * @element vu-tab-item
 *
 * @summary A tab item component for use inside `<vu-tab>`.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/tab
 * @dependency vu-icon
 *
 * @slot - Custom segment label; wins over string `label` when assigned.
 * @slot icon - Leading icon; wins over string `icon` when assigned.
 *
 * @csspart base - Segment button (`role="radio"`).
 * @csspart icon - Leading icon fallback or slotted icon content.
 * @csspart label - Label text wrapper (default slot + string fallback).
 *
 * @property {string} value - Stable segment id used by parent `value` / `vu-change`.
 * @property {string} label - Plain-text label fallback when the default slot is empty.
 * @property {string} icon - Iconify id fallback when the `icon` slot is empty.
 * @property {boolean} disabled - Disables only this segment.
 * @property {VuTabItemColor} color - Indicator intent when this segment is selected.
 */
@customElement("vu-tab-item")
@withComponentPresets
export class VuTabItem extends LitElement {
  static override styles = tabItemStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
  };

  /** Stable segment id used by parent `value` / `vu-change`. */
  @property(reflectString) value = "";

  /** Plain-text label fallback when the default slot is empty. */
  @property({ type: String }) label = "";

  /** Iconify id fallback when the `icon` slot is empty. */
  @property({ type: String }) icon = "";

  /** Disables only this segment. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Indicator intent when this segment is selected. */
  @property({ type: String }) color: VuTabItemColor = "";

  /** @internal Selected state relayed from `<vu-tab>`. */
  @property({ type: Boolean, attribute: false })
  selected = false;

  /** @internal Host or segment disabled — relayed from parent. */
  @property({ type: Boolean, attribute: false })
  segmentDisabled = false;

  /** @internal Collapses label width when parent `showCurrentLabelOnly` is set. */
  @property({ type: Boolean, reflect: true })
  labelCollapsed = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.closest("vu-tab")) {
      devWarnOnceForHost(
        this,
        "orphan-tab-item",
        `${devTag(this)} should be slotted inside <vu-tab> for correct radiogroup semantics.`,
      );
    }
  }

  /** Focuses the segment button. */
  focusSegment(): void {
    this.shadowRoot?.querySelector<HTMLButtonElement>(".btn")?.focus();
  }

  override render() {
    const inactive = this.segmentDisabled || this.disabled;

    return html`
      <button
        class="btn"
        part="base"
        type="button"
        role="radio"
        aria-checked=${this.selected}
        aria-disabled=${inactive ? "true" : "false"}
        tabindex=${this.selected ? "0" : "-1"}
        ?disabled=${inactive}
        @click=${this.#onClick}
      >
        <span
          part="icon"
          class=${this.icon ? "has-fallback" : nothing}
        >
          <slot name="icon">
            ${when(
              this.icon,
              () => html` <vu-icon .icon=${this.icon} aria-hidden="true"></vu-icon> `,
            )}
          </slot>
        </span>
        <span
          class=${this.label.trim() ? "label has-text" : "label"}
          part="label"
        >
          <slot>${this.label}</slot>
        </span>
      </button>
    `;
  }

  #onClick(event: MouseEvent): void {
    if (this.segmentDisabled || this.disabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-tab-item": VuTabItem;
  }
}
