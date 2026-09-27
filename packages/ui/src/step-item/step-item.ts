import { html, LitElement, nothing } from "lit";
import { localized } from "@lit/localize";
import { str } from "@lit/localize";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { when } from "lit/directives/when.js";
import { VuIcon } from "../icon/icon.js";
import { ICONS } from "../internals/icon.js";
import { devTag, devWarnOnceForHost } from "../internals/utils/dev-warn.js";
import { msg } from "../internals/utils/localize.js";
import { renderStepLabels, renderStepNode } from "../steps/internals/steps-node.js";
import { stepItemStyles } from "./step-item.style.js";
import type {
  VuStepsLabelPlacement,
  VuStepsLayout,
  VuStepsSize,
  VuStepsVariant,
  VuStepStatus,
} from "../steps/steps.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuStepStatus,
  VuStepsLabelPlacement,
  VuStepsSize,
  VuStepsVariant,
} from "../steps/steps.types.js";

/**
 * @element vu-step-item
 *
 * @summary A step item component for use inside `<vu-steps>`.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/steps
 * @dependency vu-icon
 *
 * @slot - Step panel body; inline when parent `layout` is `vertical`, stacked below the nav when horizontal.
 *
 * @csspart base - Step header trigger button.
 * @csspart node - Circular step indicator.
 * @csspart labels - Label and subtitle stack.
 * @csspart panel - Panel wrapper around the default slot (vertical layout).
 *
 * @property {string} label - Primary step label.
 * @property {string} subtitle - Optional secondary line under the label.
 * @property {boolean} disabled - Disables only this step.
 * @property {boolean} optional - Shows an optional hint under the label.
 * @property {VuStepStatus} status - Visual status override; auto-derived when empty.
 * @property {string} icon - Iconify id for the inactive node.
 * @property {string} checkedIcon - Iconify id when the step is completed.
 */
@localized()
@customElement("vu-step-item")
@withComponentPresets
export class VuStepItem extends LitElement {
  static override styles = stepItemStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
  };

  /** Primary step label. */
  @property({ type: String }) label = "";

  /** Optional secondary line under the label. */
  @property({ type: String }) subtitle = "";

  /** Disables only this step. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Shows an optional hint under the label. */
  @property({ type: Boolean, reflect: true }) optional = false;

  /** Visual status override; auto-derived by parent when empty. */
  @property({ type: String }) status: VuStepStatus | "" = "";

  /** Iconify id for the inactive node. */
  @property({ type: String }) icon = "";

  /** Iconify id when the step is completed. */
  @property({ type: String }) checkedIcon = "";

  /** @internal 1-based index relayed from `<vu-steps>`. */
  @property({ type: Number, attribute: false })
  index = 0;

  /** @internal Whether this step is the current step. */
  @property({ type: Boolean, attribute: false })
  current = false;

  /** @internal Parent `expandAll` — keep the vertical panel open. */
  @property({ type: Boolean, attribute: false })
  expandAll = false;

  /** @internal Whether this step is marked completed. */
  @property({ type: Boolean, reflect: true })
  completed = false;

  /** @internal Renders the horizontal trailing connector. */
  @property({ type: Boolean, attribute: false })
  showConnector = false;

  /** @internal Whether the horizontal trailing connector is active. */
  @property({ type: Boolean, attribute: false })
  connectorActive = false;

  /** @internal Resolved status from parent when `status` is empty. */
  @property({ type: String, attribute: false })
  resolvedStatus: VuStepStatus = "wait";

  /** @internal Parent layout relay. */
  @property({ type: String, attribute: false })
  layout: VuStepsLayout = "horizontal";

  /** @internal Parent `hideNumbers` relay. */
  @property({ type: Boolean, attribute: false })
  hideNumbers = false;

  /** @internal Parent `showLabels` relay. */
  @property({ type: Boolean, attribute: false })
  showLabels = true;

  /** @internal Parent `labelPlacement` relay. */
  @property({ type: String, attribute: false })
  labelPlacement: VuStepsLabelPlacement = "inline";

  /** @internal Parent `readonly` relay. */
  @property({ type: Boolean, attribute: false })
  readonly = false;

  /** @internal Parent `size` relay. */
  @property({ type: String, attribute: false })
  size: VuStepsSize = "md";

  /** @internal Parent `variant` relay. */
  @property({ type: String, attribute: false })
  variant: VuStepsVariant = "default";

  /** @internal Parent default step icon relay. */
  @property({ type: String, attribute: false })
  stepIconDefault = "";

  /** @internal Parent default checked icon relay. */
  @property({ type: String, attribute: false })
  checkedIconDefault = "";

  /** @internal Parent default error icon relay. */
  @property({ type: String, attribute: false })
  errorIconDefault = "";

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.closest("vu-steps")) {
      devWarnOnceForHost(
        this,
        "orphan-step-item",
        `${devTag(this)} should be slotted inside <vu-steps>.`,
      );
    }
  }

  /** Focuses the step header button. */
  focusStep(): void {
    const index1 = this.index || 1;
    this.renderRoot?.querySelector<HTMLButtonElement>(`#step-header-${index1}`)?.focus();
  }

  #stepLabel(index1: number): string {
    return (
      this.label.trim() ||
      msg(str`Step ${index1}`, {
        desc: "Fallback label for a step without a custom title.",
      })
    );
  }

  #optionalLabel = () =>
    msg("Optional", {
      desc: "Hint that a step may be skipped.",
    });

  override render() {
    const index1 = this.index || 1;
    const label = this.#stepLabel(index1);
    const status = this.status || this.resolvedStatus;
    const vertical = this.layout === "vertical";
    const panelOpen = this.current || this.expandAll;
    const panelId = `step-panel-${index1}`;
    const headerId = `step-header-${index1}`;
    const inactive = this.disabled || this.readonly;
    const below = this.labelPlacement === "below";

    const node = renderStepNode({
      index1,
      status,
      hideNumbers: this.hideNumbers,
      icon: this.icon || undefined,
      checkedIcon: this.checkedIcon || undefined,
      errorIcon: this.errorIconDefault || ICONS.stepError,
      stepIconDefault: this.stepIconDefault || undefined,
      checkedIconDefault: this.checkedIconDefault || undefined,
      iconTag: (icon) => html`<vu-icon icon=${icon} aria-hidden="true"></vu-icon>`,
    });

    const labels = this.showLabels
      ? renderStepLabels(label, {
          subtitle: this.subtitle || undefined,
          optional: this.optional,
          optionalLabel: this.#optionalLabel(),
          labelPlacement: this.labelPlacement,
        })
      : null;

    return html`
      <div class="v-header">
        <button
          class=${classMap({ "step-btn": true, "step-btn-below": below })}
          part="base"
          type="button"
          id=${headerId}
          aria-current=${this.current ? "step" : "false"}
          aria-disabled=${inactive ? "true" : "false"}
          aria-expanded=${vertical ? String(panelOpen) : nothing}
          aria-controls=${vertical ? panelId : nothing}
          tabindex=${inactive ? "-1" : this.current ? "0" : "-1"}
        >
          ${node}${labels}
        </button>
      </div>
      ${when(
        !vertical && this.showConnector,
        () =>
          html`<div
            class=${classMap({ connector: true, active: this.connectorActive })}
            aria-hidden="true"
          ></div>`,
      )}
      ${
        vertical
          ? html`
              <div
                id=${panelId}
                class=${classMap({ "v-panel": true, "is-open": panelOpen })}
                part="panel"
                role="region"
                aria-labelledby=${headerId}
              >
                <div class="v-inner">
                  <div class="v-content panel-body">
                    <slot></slot>
                  </div>
                </div>
              </div>
            `
          : html`<slot hidden></slot>`
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-step-item": VuStepItem;
  }
}
