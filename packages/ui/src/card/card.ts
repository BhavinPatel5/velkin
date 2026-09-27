import { html, LitElement, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { hasLightChildrenInSlot } from "../internals/utils/slot.js";
import { VuDivider } from "../divider/divider.js";
import { cardStyles } from "./card.style.js";
import type {
  VuCardActivateDetail,
  VuCardDivider,
  VuCardOrientation,
  VuCardRadius,
  VuCardSize,
  VuCardTone,
  VuCardVariant,
} from "./card.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuCardActivateDetail,
  VuCardDivider,
  VuCardOrientation,
  VuCardRadius,
  VuCardSize,
  VuCardTone,
  VuCardVariant,
} from "./card.types.js";

/**
 * @element vu-card
 *
 * @summary A card component with media, header, body, and footer slots.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/card
 * @dependency vu-divider
 *
 * @slot media - Full-bleed media (image, video, picture, svg). No padding; auto-sizes common media tags to `inline-size: 100%`. In `orientation="horizontal"`, this slot sits on the start edge instead of on top.
 * @slot media-actions - Overlay actions positioned at the top-end of `media` (favorite, play, options menu). `media` is the containing block, so any slotted element is absolutely positioned for free — typically icon buttons.
 * @slot header - Top section. Renders as a flex row with `space-between` (title left, secondary action right) so a slotted heading + actions split naturally; wraps on narrow widths.
 * @slot - Body content (the default slot).
 * @slot footer - Bottom section. Renders as a flex row with `flex-end` (actions on the trailing edge — `Cancel` + `Save` pattern). For status-text + action layouts, add `margin-inline-start: auto` to the trailing item.
 *
 * @property {VuCardVariant} variant - Surface paint recipe. Default: `"elevated"`.
 * @property {VuCardTone} tone - Neutral surface weight. Default: `"normal"`.
 * @property {VuCardSize} size - Content shell padding and section gap. Default: `"md"`.
 * @property {VuCardRadius} radius - Corner radius preset. Default: `"md"`.
 * @property {VuCardOrientation} orientation - Layout axis. Default: `"vertical"`.
 * @property {VuCardDivider} divider - Section hairline strategy. Default: `"none"`.
 * @property {boolean} flush - Zeros content shell padding. Default: `false`.
 * @property {boolean} interactive - Focusable surface that dispatches `vu-activate`. Default: `false`.
 * @property {boolean} selected - Chosen-state ring; sets `aria-pressed` when `interactive`. Default: `false`.
 * @property {boolean} disabled - Blocks interaction when `interactive`. Default: `false`.
 * @property {string} label - Accessible name when `interactive` and no visible heading.
 *
 * @csspart base - The outer surface that lays the variant paint.
 * @csspart media - The media wrapper around the `media` slot. Acts as the positioning context for `media-actions`.
 * @csspart media-actions - The overlay wrapper around the `media-actions` slot. Top-end of `media` by default.
 * @csspart media-divider - Hairline between media and content when `divider` is `header` or `all`.
 * @csspart content - Column wrapping `header` / body / `footer`; holds the shared padding inset and vertical `gap` between sections.
 * @csspart header - The header section.
 * @csspart section-divider - Hairline between adjacent content sections when `divider` is set.
 * @csspart body - The body section.
 * @csspart footer - The footer section.
 *
 * @cssproperty --card-strong-bg - Strong background channel (used by `filled` and as the gradient end-stop).
 * @cssproperty --card-strong-fg - Foreground that contrasts with `--card-strong-bg`.
 * @cssproperty --card-soft-bg - Soft background channel (used by `soft` and as the gradient start-stop).
 * @cssproperty --card-soft-fg - Foreground that contrasts with `--card-soft-bg`.
 * @cssproperty --card-edge - Border / outline color (used by `outline` + `selected`).
 * @cssproperty --card-surface-bg - Neutral surface background (used by `elevated` / `outline` / `ghost` defaults). Override at the host to repaint without changing variant.
 * @cssproperty --card-surface-fg - Foreground for the neutral surface.
 * @cssproperty --card-radius - Resolved corner radius. Override to bypass the `radius` preset.
 * @cssproperty --card-pad - Inset on 'content' part around the header/body/footer stack (one shell, not repeated per section).
 * @cssproperty --card-gap - Space between adjacent sections inside the content stack (paired with '--card-pad' by 'size').
 * @cssproperty --card-pad-header - Extra padding inside the header only (default 0). Typical with 'flush' to pad the title row while the body bleeds.
 * @cssproperty --card-pad-body - Extra padding inside the body only (default 0).
 * @cssproperty --card-pad-footer - Extra padding inside the footer only (default 0).
 * @cssproperty --card-media-size - Inline-size of the media sidecar in `orientation="horizontal"` (default `33%`). Ignored in vertical orientation.
 * @cssproperty --card-shadow - Shadow used by `elevated` / `gradient`.
 * @cssproperty --card-shadow-hover - Shadow used on hover when `interactive` + `elevated`.
 * @cssproperty --card-divider - Hairline color for `vu-divider` sections (only when `divider` is set). Auto-derived from `currentColor` per variant.
 *
 * @fires {CustomEvent<VuCardActivateDetail>} vu-activate - Fires on click or keyboard activation (Enter / Space) when `interactive` and not `disabled`. Detail: `{ source }` where `source` is the original `MouseEvent` / `KeyboardEvent`.
 */
@customElement("vu-card")
@withComponentPresets
export class VuCard extends LitElement {
  static override styles = cardStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-divider": VuDivider,
  };

  /** Visual treatment. */
  @property({ type: String, reflect: true })
  variant: VuCardVariant = "elevated";

  /** Neutral surface weight. */
  @property({ type: String, reflect: true })
  tone: VuCardTone = "normal";

  /** Content shell padding and section gap scale. */
  @property({ type: String, reflect: true })
  size: VuCardSize = "md";

  /** Corner radius preset. */
  @property({ type: String, reflect: true })
  radius: VuCardRadius = "md";

  /** Layout axis; vertical stacks media above content. */
  @property({ type: String, reflect: true })
  orientation: VuCardOrientation = "vertical";

  /** Section hairline strategy (`none` | `footer` | `header` | `all`). */
  @property({ type: String, reflect: true })
  divider: VuCardDivider = "none";

  /** Zeros content shell padding; pair with per-section pad vars. */
  @property({ type: Boolean, reflect: true })
  flush = false;

  /** Focusable surface that dispatches `vu-activate` on activation. */
  @property({ type: Boolean, reflect: true })
  interactive = false;

  /** Chosen-state ring; sets `aria-pressed` when `interactive`. */
  @property({ type: Boolean, reflect: true })
  selected = false;

  /** Blocks interaction when `interactive`. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Accessible name when `interactive` and no visible heading. */
  @property({ type: String })
  label = "";

  @query('[part="base"]')
  private _base!: HTMLElement | null;

  private get _hasMedia(): boolean {
    return hasLightChildrenInSlot(this, "media");
  }

  private get _hasMediaActions(): boolean {
    return hasLightChildrenInSlot(this, "media-actions");
  }

  private get _hasHeader(): boolean {
    return hasLightChildrenInSlot(this, "header");
  }

  private get _hasBody(): boolean {
    return hasLightChildrenInSlot(this, "");
  }

  private get _hasFooter(): boolean {
    return hasLightChildrenInSlot(this, "footer");
  }

  private get _hasContentSections(): boolean {
    return this._hasHeader || this._hasBody || this._hasFooter;
  }

  /** Media↔content hairline when `divider` is `header` or `all`. */
  private get _showMediaDivider(): boolean {
    return (
      (this.divider === "header" || this.divider === "all") &&
      this._hasMedia &&
      this._hasContentSections
    );
  }

  /** Header↔body hairline when `divider` is `header` or `all`. */
  private get _showHeaderBodyDivider(): boolean {
    return (
      (this.divider === "header" || this.divider === "all") &&
      this._hasHeader &&
      this._hasBody
    );
  }

  /** Body↔footer hairline when `divider` is `footer` or `all`. */
  private get _showBodyFooterDivider(): boolean {
    return (
      (this.divider === "footer" || this.divider === "all") &&
      this._hasBody &&
      this._hasFooter
    );
  }

  /** Header↔footer hairline when body is empty and `divider` is `footer` or `all`. */
  private get _showHeaderFooterDivider(): boolean {
    return (
      (this.divider === "footer" || this.divider === "all") &&
      this._hasHeader &&
      this._hasFooter &&
      !this._hasBody
    );
  }

  /** True when the card is a non-interactive activation no-op. */
  private get _isInert(): boolean {
    return !this.interactive || this.disabled;
  }

  /** Native `focus()` delegates to the inner activation surface so consumers don't need to reach into shadow DOM. No-op when the card isn't `interactive` (or is `disabled`) — there's nothing focusable then. */
  override focus(options?: FocusOptions): void {
    if (this._isInert) return;
    this._base?.focus(options);
  }

  private _onClick = (event: MouseEvent): void => {
    /* Non-interactive cards are passive surfaces — bubbled clicks from slotted
       controls (radios, links, buttons) must pass through untouched. */
    if (!this.interactive) return;
    if (this.disabled) {
      /* Suppress the card's own surface activation only; never cancel clicks
         that originate from slotted light-DOM content. */
      if (!(event.target instanceof Node && this.contains(event.target))) {
        event.preventDefault();
      }
      return;
    }
    this._emitActivate(event);
  };

  private _onKeydown = (event: KeyboardEvent): void => {
    if (this._isInert) return;
    /* Enter / Space match native button semantics. preventDefault on Space
       stops page scroll; on Enter it's a no-op but kept for symmetry. */
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    this._emitActivate(event);
  };

  private _emitActivate(source: Event): void {
    this.dispatchEvent(
      new CustomEvent<VuCardActivateDetail>("vu-activate", {
        detail: { source },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onSlotChange = (): void => {
    this.requestUpdate();
  };

  override render() {
    /* Interactive cards are role="button" + tabindex 0 (or -1 when disabled,
       so they remain queryable for AT but not in the tab order). Selected
       toggles aria-pressed only when also interactive — a non-interactive
       selected card is purely visual decoration. */
    const role = this.interactive ? "button" : nothing;
    const tabIndex = this.interactive ? (this.disabled ? -1 : 0) : nothing;
    const ariaPressed =
      this.interactive ? (this.selected ? "true" : "false") : nothing;
    const ariaDisabled = this.disabled ? "true" : nothing;
    const ariaLabel = this.label.trim() || nothing;
    const mediaDividerVertical = this.orientation === "horizontal";

    return html`
      <div
        part="base"
        role=${role}
        tabindex=${tabIndex}
        aria-pressed=${ariaPressed}
        aria-disabled=${ariaDisabled}
        aria-label=${ariaLabel}
        @click=${this._onClick}
        @keydown=${this._onKeydown}
      >
        <div part="media">
          <slot name="media" @slotchange=${this._onSlotChange}></slot>
          <div part="media-actions">
            <slot name="media-actions" @slotchange=${this._onSlotChange}></slot>
          </div>
        </div>
        <vu-divider
          part="media-divider"
          direction=${mediaDividerVertical ? "vertical" : "horizontal"}
          ?hidden=${!this._showMediaDivider}
        ></vu-divider>
        <div part="content">
          <div part="header">
            <slot name="header" @slotchange=${this._onSlotChange}></slot>
          </div>
          <vu-divider
            part="section-divider"
            data-between="header-body"
            ?hidden=${!this._showHeaderBodyDivider}
          ></vu-divider>
          <div part="body">
            <slot @slotchange=${this._onSlotChange}></slot>
          </div>
          <vu-divider
            part="section-divider"
            data-between="footer"
            ?hidden=${!(this._showBodyFooterDivider || this._showHeaderFooterDivider)}
          ></vu-divider>
          <div part="footer">
            <slot name="footer" @slotchange=${this._onSlotChange}></slot>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-card": VuCard;
  }
}
