import { html, LitElement, nothing, type PropertyValues } from "lit";
import { localized } from "@lit/localize";
import { customElement, property, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { classMap } from "lit/directives/class-map.js";
import { VuIcon } from "../icon/icon.js";
import { ICONS } from "../internals/icon.js";
import { msg } from "../internals/utils/localize.js";
import { hasLightChildrenInSlot } from "../internals/utils/slot.js";
import { alertStyles } from "./alert.style.js";
import { AnimationController } from "../internals/controllers/animation-controller.js";
import { LayoutAnimateController } from "../internals/controllers/layout-animate-controller.js";
import { devTag, devWarnOnceForHost } from "../internals/utils/dev-warn.js";
import { vuAnimate } from "../internals/utils/lit-animate.js";
import type {
  VuAlertCloseDetail,
  VuAlertColor,
  VuAlertSize,
  VuAlertVariant,
} from "./alert.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuAlertCloseDetail,
  VuAlertColor,
  VuAlertSize,
  VuAlertVariant,
} from "./alert.types.js";

/** Default iconify name per intent; `null` means "no auto icon". */
const DEFAULT_INTENT_ICON: Record<VuAlertColor, string | null> = {
  default: null,
  primary: ICONS.intentInfo,
  success: ICONS.intentSuccess,
  warning: ICONS.intentWarning,
  danger: ICONS.intentDanger,
};

const DEFAULT_CLOSE_ICON = html`<vu-icon icon=${ICONS.close}></vu-icon>`;

/**
 * @element vu-alert
 *
 * @summary An alert component with intent colors, variants, and optional dismiss.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/alert
 * @dependency vu-icon
 *
 * @slot - Body content when `message` is empty.
 * @slot heading - Heading content when `heading` is empty.
 * @slot icon - Custom leading icon.
 * @slot actions - Trailing buttons or links.
 *
 * @property {VuAlertColor} color - Intent driving surface color. Default: `"default"`.
 * @property {VuAlertVariant} variant - Surface paint recipe. Default: `"soft"`.
 * @property {VuAlertSize} size - Padding, gap, and font scale. Default: `"md"`.
 * @property {string} heading - Heading text above the body.
 * @property {string} message - Body text when the default slot is empty.
 * @property {string | null} icon - Iconify name; `null` derives from `color`, `""` disables.
 * @property {boolean} removable - Shows a dismiss button. Default: `false`.
 * @property {string} closeLabel - Dismiss accessible name (`closelabel` attr).
 *
 * @method close - Programmatic dismiss; fires `vu-close` then animates out.
 *
 * @fires {CustomEvent<VuAlertCloseDetail>} vu-close - Cancelable before exit animation.
 *
 * @csspart alert - Outer surface container.
 * @csspart icon - Leading icon wrapper.
 * @csspart stack - Heading and body column.
 * @csspart heading - Heading text element.
 * @csspart body - Body region wrapper.
 * @csspart message - Body paragraph when `message` is set.
 * @csspart actions - Trailing controls cluster.
 * @csspart close - Dismiss button when `removable`.
 *
 * @cssproperty --alert-bg - Surface background.
 * @cssproperty --alert-fg - Surface text color.
 * @cssproperty --alert-border - Surface border shorthand.
 * @cssproperty --alert-py - Block padding.
 * @cssproperty --alert-px - Inline padding.
 * @cssproperty --alert-gap - Gap between icon, content, and actions.
 * @cssproperty --alert-icon-size - Leading icon size.
 * @cssproperty --alert-heading-size - Heading font size.
 * @cssproperty --alert-message-size - Body font size.
 * @cssproperty --alert-close-size - Dismiss button hit target.
 * @cssproperty --alert-close-icon-size - Dismiss glyph scale inside the control.
 */
@localized()
@customElement("vu-alert")
@withComponentPresets
export class VuAlert extends LitElement {
  static override styles = alertStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
  };

  private readonly _layoutAnim = new LayoutAnimateController(this, {
    preset: "enter-fade-scale",
  });
  private readonly _motion = new AnimationController(this);

  /** Intent driving surface color. */
  @property({ type: String, reflect: true })
  color: VuAlertColor = "default";

  /** Surface paint recipe. */
  @property({ type: String, reflect: true })
  variant: VuAlertVariant = "soft";

  /** Padding, gap, and font scale. */
  @property({ type: String, reflect: true })
  size: VuAlertSize = "md";

  /** Heading text above the body. */
  @property({ type: String })
  heading = "";

  /** Body text when the default slot is empty. */
  @property({ type: String })
  message = "";

  /** Iconify name; `null` derives from `color`, `""` disables. */
  @property({ type: String })
  icon: string | null = null;

  /** Shows a dismiss button. */
  @property({ type: Boolean, reflect: true })
  removable = false;

  /** Dismiss accessible name. */
  @property({ type: String })
  closeLabel = "";

  /** Drives the exit animation class on `[part="alert"]`. */
  @state()
  private _isClosing = false;

  private get _hasHeadingSlot(): boolean {
    return hasLightChildrenInSlot(this, "heading");
  }

  private get _hasIconSlot(): boolean {
    return hasLightChildrenInSlot(this, "icon");
  }

  private get _hasActionsSlot(): boolean {
    return hasLightChildrenInSlot(this, "actions");
  }

  private get _hasDefaultSlot(): boolean {
    return hasLightChildrenInSlot(this, "");
  }

  /** Auto-generated fallback id; used only when the host has no `id` attribute set. */
  private static _idCounter = 0;
  private _autoId = `vu-alert-${VuAlert._idCounter++}`;

  /** Heading id derived from the host `id` (preferred for SSR determinism) or the auto fallback. */
  private get _headingId(): string {
    return `${this.id || this._autoId}-heading`;
  }

  /** Message id derived from the host `id` or the auto fallback. */
  private get _messageId(): string {
    return `${this.id || this._autoId}-message`;
  }

  /** Effective iconify name after slot/prop/intent resolution; null means "no icon". */
  private get _resolvedIcon(): string | null {
    if (this._hasIconSlot) return null;
    if (this.icon === null) return DEFAULT_INTENT_ICON[this.color];
    return this.icon || null;
  }

  /** True when the icon wrapper should be visible (slot, prop, or auto-derived). */
  private get _showIcon(): boolean {
    return this._hasIconSlot || this._resolvedIcon !== null;
  }

  /** True when the trailing actions wrapper should be visible. */
  private get _showActions(): boolean {
    return this._hasActionsSlot || this.removable;
  }

  /** True when the heading wrapper should be visible (slot or string). */
  private get _showHeading(): boolean {
    return this._hasHeadingSlot || this.heading.trim().length > 0;
  }

  /** True when the styled `<p part="message">` renders (string prop wins over the default slot). */
  private get _showMessage(): boolean {
    return this.message.length > 0;
  }

  /** True when the body wrapper should be visible (string message OR default-slot content). */
  private get _showBody(): boolean {
    return this._showMessage || this._hasDefaultSlot;
  }

  /** ARIA role — assertive `alert` for danger/warning, polite `status` otherwise. */
  private get _ariaRole(): "alert" | "status" {
    return this.color === "danger" || this.color === "warning" ? "alert" : "status";
  }

  override firstUpdated(changed: PropertyValues): void {
    super.firstUpdated(changed);
    if (!this._showBody && !this._showHeading) {
      devWarnOnceForHost(
        this,
        "empty-content",
        `${devTag(this)} has no heading or body content. Set \`heading\`, \`message\`, or slotted content.`,
      );
    }
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has("_isClosing")) {
      this._layoutAnim.setMotionDisabled(this._isClosing);
    }
  }

  /**
   * Programmatic dismiss — fires cancelable `vu-close`, then (if not prevented) animates out
   * and removes the host. Resolves once the host is detached. Concurrent calls are no-ops.
   */
  async close(reason: "user" | "method" = "method"): Promise<void> {
    if (this._isClosing) return;

    const event = new CustomEvent<VuAlertCloseDetail>("vu-close", {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { heading: this.heading, message: this.message, reason },
    });
    if (!this.dispatchEvent(event)) return;

    this._isClosing = true;
    await this.updateComplete;

    const surface = this.renderRoot.querySelector('[part="alert"]') as HTMLElement | null;
    if (!surface) {
      this.remove();
      return;
    }

    await new Promise<void>((resolve) => {
      const animation = this._motion.exitFadeScale(surface, {
        toScale: 0.97,
        transformOrigin: "center top",
        onFinish: resolve,
      });
      if (!animation) resolve();
    });
    this.remove();
  }

  private _handleCloseClick = (): void => {
    void this.close("user");
  };

  override render() {
    const resolvedIcon = this._resolvedIcon;
    const surfaceClass = classMap({
      "is-closing": this._isClosing,
      "has-heading": this._showHeading,
    });
    const labelledBy = this._showHeading ? this._headingId : nothing;
    const describedBy = this._showBody ? this._messageId : nothing;

    return html`
      <div
        part="alert"
        class=${surfaceClass}
        ${vuAnimate(this, { preset: "enter-fade-scale" })}
        role=${this._ariaRole}
        aria-live=${this._ariaRole === "alert" ? "assertive" : "polite"}
        aria-labelledby=${labelledBy}
        aria-describedby=${describedBy}
      >
        <span part="icon" aria-hidden="true">
          <slot name="icon">
            <vu-icon icon=${resolvedIcon ?? ""} ?hidden=${!resolvedIcon}></vu-icon>
          </slot>
        </span>

        <div part="stack">
          <span
            part="heading"
            id=${this._headingId}
            class=${classMap({ "has-text": this.heading.trim().length > 0 })}
          >
            <slot name="heading">${this.heading}</slot>
          </span>
          <div
            part="body"
            id=${this._messageId}
            class=${classMap({ "has-text": this._showMessage })}
          >
            ${this._showMessage
              ? html`<p part="message">${this.message}</p>`
              : nothing}
            <slot ?hidden=${this._showMessage}></slot>
          </div>
        </div>

        <div part="actions">
          <slot name="actions"></slot>
          ${when(this.removable, () => html`
            <button
              part="close"
              type="button"
              aria-label=${this.closeLabel.trim() ||
              msg("Dismiss", {
                desc: "Accessible name for the alert dismiss control.",
              })}
              @click=${this._handleCloseClick}
            >
              ${DEFAULT_CLOSE_ICON}
            </button>
          `)}
        </div>
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "vu-alert": VuAlert;
  }
}
