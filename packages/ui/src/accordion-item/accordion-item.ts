import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { VuIcon } from "../icon/icon.js";
import { ICONS } from "../internals/icon.js";
import { accordionItemStyles } from "./accordion-item.style.js";
import { LayoutAnimateController } from "../internals/controllers/layout-animate-controller.js";
import { animate } from "../internals/utils/lit-animate.js";
import type { VuAccordionItemOpenChangeDetail } from "./accordion-item.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";


export type { VuAccordionItemOpenChangeDetail } from "./accordion-item.types.js";

const DEFAULT_EXPAND_ICON = html`<vu-icon icon=${ICONS.chevronDown}></vu-icon>`;
const DEFAULT_COLLAPSE_ICON = html`<vu-icon icon=${ICONS.chevronUp}></vu-icon>`;

/**
 * @element vu-accordion-item
 *
 * @summary A collapsible accordion item component with a header trigger and body panel.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/accordion
 * @dependency vu-icon
 *
 * @uiVModel open vu-open-change detail=open
 *
 * @slot start - Leading visual before the title group.
 * @slot title - Primary header content.
 * @slot sub-title - Secondary header content.
 * @slot expand-icon - Trailing control while collapsed.
 * @slot collapse-icon - Trailing control while expanded.
 * @slot body - Collapsible body content.
 *
 * @property {boolean} open - Whether the item is expanded. Default: `false`.
 * @property {boolean} disabled - Prevents interaction. Default: `false`.
 *
 * @method expand - Expands and emits `vu-open-change` when state changes.
 * @method collapse - Collapses and emits `vu-open-change` when state changes.
 * @method toggle - Toggles open state and emits `vu-open-change`.
 *
 * @fires {CustomEvent<VuAccordionItemOpenChangeDetail>} vu-open-change - After open state changes.
 *
 * @csspart item - Item root wrapper.
 * @csspart header - Interactive header trigger.
 * @csspart start - Leading visual wrapper.
 * @csspart title - Primary title wrapper.
 * @csspart sub-title - Secondary title wrapper.
 * @csspart icon - Expand or collapse icon wrapper.
 * @csspart body - Collapsible body container.
 */
@customElement("vu-accordion-item")
@withComponentPresets
export class VuAccordionItem extends LitElement {
  static override styles = accordionItemStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
  };

  private readonly _layoutAnim = new LayoutAnimateController(this, {
    preset: "fade",
    properties: ["opacity", "transform"],
  });

  /** Whether the item is expanded. */
  @property({ type: Boolean, reflect: true })
  open = false;

  /** Prevents interaction and toggling. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Auto-generated fallback id; used only when the host has no `id` attribute set. */
  private static _idCounter = 0;
  private _autoId = `vu-acc-${VuAccordionItem._idCounter++}`;

  /** Header id derived from the host `id` (preferred for SSR determinism) or the auto fallback. */
  private get _headerId(): string {
    return `${this.id || this._autoId}-h`;
  }

  /** Body region id derived from the host `id` or the auto fallback. */
  private get _bodyId(): string {
    return `${this.id || this._autoId}-b`;
  }

  /** Expands when collapsed. */
  expand(): void {
    if (this.disabled || this.open) return;
    this.open = true;
    this.dispatchToggleEvent();
  }

  /** Collapses when expanded. */
  collapse(): void {
    if (this.disabled || !this.open) return;
    this.open = false;
    this.dispatchToggleEvent();
  }

  /** Toggles open state. */
  toggle(): void {
    if (this.disabled) return;
    this.open = !this.open;
    this.dispatchToggleEvent();
  }

  /** Dispatches bubbling, composed `vu-open-change` with the current `open`. */
  private dispatchToggleEvent(): void {
    this.dispatchEvent(
      new CustomEvent<VuAccordionItemOpenChangeDetail>("vu-open-change", {
        bubbles: true,
        composed: true,
        detail: { open: this.open },
      }),
    );
  }

  /** Activates the header on Enter / Space; preventDefault avoids page scroll and accidental form submit. */
  private handleHeaderKeydown(e: KeyboardEvent): void {
    if (this.disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.toggle();
    }
  }

  override render() {
    return html`
      <div part="item">
        <div
          part="header"
          id=${this._headerId}
          role="button"
          aria-expanded=${this.open ? "true" : "false"}
          aria-controls=${this._bodyId}
          aria-disabled=${this.disabled ? "true" : "false"}
          tabindex=${this.disabled ? "-1" : "0"}
          @click=${this.toggle}
          @keydown=${this.handleHeaderKeydown}
        >
          <span part="start" aria-hidden="true">
            <slot name="start"></slot>
          </span>

          <div class="title-group">
            <span part="title">
              <slot name="title"></slot>
            </span>
            <span part="sub-title">
              <slot name="sub-title"></slot>
            </span>
          </div>

          <span
            part="icon"
            aria-hidden="true"
            ${animate({
              skipInitial: true,
              guard: () => this.open,
              properties: ["opacity", "transform"],
            })}
          >
            <span class="icon-slot" ?hidden=${this.open}>
              <slot name="expand-icon">${DEFAULT_EXPAND_ICON}</slot>
            </span>
            <span class="icon-slot" ?hidden=${!this.open}>
              <slot name="collapse-icon">${DEFAULT_COLLAPSE_ICON}</slot>
            </span>
          </span>
        </div>

        <div
          class="body"
          id=${this._bodyId}
          role="region"
          aria-labelledby=${this._headerId}
          aria-hidden=${this.open ? "false" : "true"}
        >
          <div class="body-clip">
            <div part="body">
              <slot name="body"></slot>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "vu-accordion-item": VuAccordionItem;
  }
}
