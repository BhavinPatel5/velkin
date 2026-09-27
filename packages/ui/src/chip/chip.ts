import { LitElement, html, nothing, type PropertyValues } from "lit";
import { localized } from "@lit/localize";
import { customElement, property, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { classMap } from "lit/directives/class-map.js";
import { ICONS } from "../internals/icon.js";
import { msg } from "../internals/utils/localize.js";
import { VuIcon } from "../icon/icon.js";
import { AnimationController } from "../internals/controllers/animation-controller.js";
import { LayoutAnimateController } from "../internals/controllers/layout-animate-controller.js";
import { devTag, devWarnOnceForHost } from "../internals/utils/dev-warn.js";
import { vuAnimate } from "../internals/utils/lit-animate.js";
import { chipStyles } from "./chip.style.js";
import type {
  VuChipChangeDetail,
  VuChipColor,
  VuChipCloseDetail,
  VuChipCloseReason,
  VuChipSize,
  VuChipVariant,
  VuChipRadius
} from "./chip.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuChipChangeDetail,
  VuChipColor,
  VuChipCloseDetail,
  VuChipCloseReason,
  VuChipSize,
  VuChipVariant,
  VuChipRadius
} from "./chip.types.js";

/**
 * @element vu-chip
 *
 * @summary A chip component for tags and filters with dismiss or toggle actions.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/chip
 * @dependency vu-icon
 *
 * @slot - Primary label; when empty, the string `label` prop is shown.
 * @slot start - Leading content before icons and label.
 * @slot end - Trailing content after label and before dismiss.
 *
 * @property {string} label - Plain-text fallback when the default slot has no meaningful content.
 * @property {string} value - Stable id for lists, filters, and `vu-close` / `vu-change` detail.
 * @property {boolean} removable - Shows dismiss control; `close()` fires cancelable `vu-close`. Default: `false`.
 * @property {VuChipColor} color - Intent token only (no arbitrary CSS colors). Default: `"default"`.
 * @property {VuChipRadius} radius - Corner preset (`none`/`sm`/`md`/`lg`/`full`). Default: `"full"`.
 * @property {VuChipSize} size - Padding/type scale; `sm`|`md`|`lg` match button, `xs`/`xl` are density extras. Default: `"md"`.
 * @property {string} iconstart - Iconify id for the leading icon.
 * @property {string} iconend - Iconify id for the trailing icon.
 * @property {boolean} loading - Loading overlay; hides label chrome like `vu-button`. Default: `false`.
 * @property {boolean} disabled - Disables interaction. Default: `false`.
 * @property {VuChipVariant} variant - Paint recipe. Default: `"soft"`.
 * @property {boolean} selected - Toggle/filter selected state; sets `aria-pressed` when interactive. Default: `false`.
 * @property {boolean} interactive - Renders the label as a `<button>` when `href` is empty. Default: `false`.
 * @property {boolean} iconOnly - Square 1:1 chip; hides the label and uses it as `aria-label`. Default: `false`.
 * @property {string} href - When set, renders the label as an `<a>` instead of static text.
 * @property {string} target - Anchor target when `href` is set.
 * @property {string} rel - Anchor rel when `href` is set.
 * @property {string} closelabel - Accessible name for dismiss; empty uses the locale catalog.
 * @property {string} arialabel - Accessible name override for the interactive label control.
 *
 * @csspart chip - Outer pill surface.
 * @csspart control - Label region (span, button, or anchor depending on mode).
 * @csspart start - Leading slot wrapper.
 * @csspart end - Trailing slot wrapper.
 * @csspart icon - Each leading or trailing Iconify icon.
 * @csspart close - Dismiss control when `removable` (same UI as vu-alert `close`).
 * @csspart loading-overlay - Loading scrim.
 * @csspart loading-spinner - Spinner node.
 *
 * @cssproperty --chip-close-size - Dismiss box (`--vu-space-*`; one step below vu-alert per size).
 * @cssproperty --chip-close-icon - Close icon size (`--vu-space-*`).
 * @cssproperty --chip-gap - Inline gap between chip children.
 * @cssproperty --chip-py - Block padding inside the pill.
 * @cssproperty --chip-px - Inline padding inside the pill.
 * @cssproperty --chip-font-size - Label font size.
 * @cssproperty --chip-icon-size - Icon font size inside the pill.
 * @cssproperty --chip-radius - Corner radius of the pill.
 *
 * @method close - Fires cancelable `vu-close`; removes the host when not prevented.
 *
 * @fires {CustomEvent<VuChipCloseDetail>} vu-close - Cancelable; default action removes the host.
 * @fires {CustomEvent<VuChipChangeDetail>} vu-change - When `interactive` and the user toggles `selected`.
 */
@localized()
@customElement("vu-chip")
@withComponentPresets
export class VuChip extends LitElement {
  static override styles = chipStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
  };

  private readonly _layoutAnim = new LayoutAnimateController(this, {
    preset: "enter-fade-scale",
  });
  private readonly _motion = new AnimationController(this);

  /** Plain-text fallback when the default slot has no meaningful content. */
  @property({ type: String }) label = "";
  /** Stable id for lists, filters, and event detail. */
  @property({ type: String }) value = "";
  /** Shows dismiss control; `close()` fires cancelable `vu-close`. */
  @property({ type: Boolean, reflect: true }) removable = false;

  /** Intent token only (no arbitrary CSS colors). */
  @property({ type: String, reflect: true }) color: VuChipColor = "default";

  /** Explicit corner preset; `full` is capsule ends, `none` is square. */
  @property({ type: String, reflect: true }) radius: VuChipRadius = "full";

  /** Padding and font scale preset. */
  @property({ type: String, reflect: true }) size: VuChipSize = "md";

  /** Iconify id for the leading icon. */
  @property({ type: String }) iconStart = "";

  /** Iconify id for the trailing icon. */
  @property({ type: String }) iconEnd = "";

  /** Loading overlay; hides label chrome like `vu-button`. */
  @property({ type: Boolean, reflect: true }) loading = false;
  /** Disables interaction. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Paint recipe. Default: `"soft"`. */
  @property({ type: String, reflect: true }) variant: VuChipVariant = "soft";

  /** Toggle/filter selected state; sets `aria-pressed` when interactive. */
  @property({ type: Boolean, reflect: true }) selected = false;
  /** Renders the label as a `<button>` when `href` is empty. */
  @property({ type: Boolean, reflect: true }) interactive = false;

  /** Square 1:1 chip; hides the label and uses it as `aria-label`. */
  @property({ type: Boolean, reflect: true }) iconOnly = false;

  /** When set, renders the label as an `<a>` instead of static text. */
  @property({ type: String }) href = "";
  /** Anchor target when `href` is set. */
  @property({ type: String }) target = "";
  /** Anchor rel when `href` is set. */
  @property({ type: String }) rel = "";

  /** Accessible name for dismiss; empty uses the locale catalog. */
  @property({ type: String }) closeLabel = "";
  /** Accessible name override for the interactive label control. */
  @property({ type: String }) override ariaLabel = "";

  @state() private _isClosing = false;

  override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("disabled")) {
      if (this.disabled) {
        this.setAttribute("aria-disabled", "true");
      } else {
        this.removeAttribute("aria-disabled");
      }
    }
    if (changed.has("href") || changed.has("interactive")) {
      this._warnHrefInteractiveConflict();
    }
  }

  override firstUpdated(changed: PropertyValues): void {
    super.firstUpdated(changed);
    this._warnHrefInteractiveConflict();
  }

  override updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has("loading")) {
      this.toggleAttribute("aria-busy", this.loading);
    }
    if (changed.has("_isClosing")) {
      this._layoutAnim.setMotionDisabled(this._isClosing);
    }
  }

  private _warnHrefInteractiveConflict(): void {
    if (this._href && this.interactive) {
      devWarnOnceForHost(
        this,
        "href-interactive",
        `${devTag(this)} has both \`href\` and \`interactive\`; \`href\` wins and the chip renders as a link, not a toggle.`,
      );
    }
  }

  /** Fires cancelable `vu-close`; animates out then removes the host when not prevented. */
  async close(reason: VuChipCloseReason = "method"): Promise<void> {
    if (this._isClosing) return;

    const event = new CustomEvent<VuChipCloseDetail>("vu-close", {
      detail: {
        label: this.label,
        value: this.value,
        reason,
      },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    if (!this.dispatchEvent(event)) return;

    this._isClosing = true;
    await this.updateComplete;

    const surface = this.renderRoot.querySelector('[part="chip"]') as HTMLElement | null;
    if (!surface) {
      this.remove();
      return;
    }

    await new Promise<void>((resolve) => {
      const animation = this._motion.exitFadeScale(surface, {
        toScale: 0.97,
        transformOrigin: "center center",
        onFinish: resolve,
      });
      if (!animation) resolve();
    });
    this.remove();
  }

  private get _isInert(): boolean {
    return this.disabled || this.loading;
  }

  private get _href(): string {
    return this.href.trim();
  }

  private get _isLink(): boolean {
    return this._href.length > 0 && !this._isInert;
  }

  private get _isToggle(): boolean {
    return this.interactive && !this._isLink && !this._isInert;
  }

  private get _contentAriaLabel(): string | typeof nothing {
    const explicit = this.ariaLabel.trim();
    if (explicit) return explicit;
    if (this.iconOnly || this._isLink || this._isToggle) {
      const fallback = this.label.trim();
      return fallback || nothing;
    }
    return nothing;
  }

  private _onDismissClick = (e: Event) => {
    e.stopPropagation();
    if (this._isInert) {
      e.preventDefault();
      return;
    }
    this.close("user");
  };

  private _onContentClick = (e: Event) => {
    if (!this._isToggle || this._isInert) return;
    e.preventDefault();
    const next = !this.selected;
    this.selected = next;
    this.dispatchEvent(
      new CustomEvent<VuChipChangeDetail>("vu-change", {
        detail: {
          selected: next,
          value: this.value,
          label: this.label,
        },
        bubbles: true,
        composed: true,
      }),
    );
  };

  private _renderLabelBody() {
    const startIcon = this.iconStart.trim();
    const endIcon = this.iconEnd.trim();

    return html`
      <span part="start">
        <slot name="start"></slot>
      </span>
      ${when(startIcon, () => html`
        <vu-icon class="icon" part="icon" icon="${startIcon}"></vu-icon>
      `)}
      <slot ?hidden=${this.iconOnly}>${this.label}</slot>
      ${when(endIcon, () => html`
        <vu-icon class="icon icon-end" part="icon" icon="${endIcon}"></vu-icon>
      `)}
      <span part="end">
        <slot name="end"></slot>
      </span>
    `;
  }

  private _renderContent() {
    const body = this._renderLabelBody();
    const sharedClass = "content";

    if (this._isLink) {
      return html`
        <a
          part="control"
          class=${sharedClass}
          href=${this._href}
          target=${this.target || nothing}
          rel=${this.rel || nothing}
          aria-label=${this._contentAriaLabel}
        >
          ${body}
        </a>
      `;
    }

    if (this._isToggle) {
      return html`
        <button
          part="control"
          class=${sharedClass}
          type="button"
          aria-pressed=${this.selected ? "true" : "false"}
          aria-label=${this._contentAriaLabel}
          @click=${this._onContentClick}
        >
          ${body}
        </button>
      `;
    }

    return html`
      <span
        part="control"
        class=${sharedClass}
        role=${this.iconOnly ? "img" : nothing}
        aria-label=${this._contentAriaLabel}
      >
        ${body}
      </span>
    `;
  }

  override render() {
    const chipClass = classMap({
      chip: true,
      [this.variant]: true,
      loading: this.loading,
      selected: this.selected,
      interactive: this.interactive || this._isLink,
      "is-closing": this._isClosing,
    });

    return html`
      <div
        class=${chipClass}
        part="chip"
        ${vuAnimate(this, { preset: "enter-fade-scale" })}
      >
        ${this._renderContent()}
        ${when(this.removable, () => html`
          <button
            part="close"
            type="button"
            aria-label=${this.closeLabel.trim() ||
            msg("Remove chip", {
              desc: "Accessible name for the chip dismiss control.",
            })}
            ?disabled=${this._isInert}
            @click=${this._onDismissClick}
          >
            <vu-icon icon=${ICONS.close}></vu-icon>
          </button>
        `)}
        ${when(this.loading, () => html`
          <div class="loading-overlay" part="loading-overlay">
            <div class="loading-spinner" part="loading-spinner"></div>
          </div>
        `)}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-chip": VuChip;
  }
}
