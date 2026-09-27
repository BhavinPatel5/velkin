import { html, LitElement, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { AnimationController } from "../internals/controllers/animation-controller.js";
import {
  isTopDismissible,
  registerDismissible,
  unregisterDismissible,
} from "../internals/utils/dismissible-stack.js";
import { activateFocusTrap, type FocusTrapHandle } from "../internals/utils/focus-trap.js";
import { lockDialogScroll, unlockDialogScroll } from "../internals/utils/dialog-scroll-lock.js";
import { devWarnMissingAccessibleName } from "../internals/utils/dev-warn.js";
import { canUseDocument } from "../internals/utils/env.js";
import { motionDurationMs } from "../internals/utils/motion.js";
import { hasLightChildrenInSlot } from "../internals/utils/slot.js";
import { overlayStyles } from "./overlay.style.js";
import type { VuOverlayCloseDetail, VuOverlayCloseReason } from "./overlay.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";


export type { VuOverlayCloseDetail, VuOverlayCloseReason } from "./overlay.types.js";
const OPEN_MS = 250;
const CLOSE_MS = 200;

/**
 * @element vu-overlay
 *
 * @summary An overlay component with backdrop and centered content slot.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/overlay
 *
 * @uiVModel open vu-close sync=constant:false
 *
 * @slot - Centered content above the backdrop (e.g. a `vu-card` panel).
 *
 * @csspart backdrop - Full-area scrim behind slotted content.
 * @csspart content - Flex centering frame for the default slot.
 *
 * @cssproperty --overlay-backdrop-color - Scrim fill (`var(--vu-color-backdrop)`).
 * @cssproperty --overlay-z - Stacking order for the viewport overlay.
 *
 * @property {boolean} open - Whether the overlay is visible. Default: `false`.
 * @property {boolean} persistent - Blocks backdrop and Escape close. Default: `false`.
 * @property {boolean} closeOnEsc - Escape emits `vu-close` when topmost. Default: `true`.
 * @property {boolean} backdropblur - Blurs content behind the scrim. Default: `false`.
 * @property {boolean} lockscroll - Locks document scroll when open. Default: `true`.
 * @property {string} ariaLabel - Accessible name when slotted content has no visible title. Default: `""`.
 *
 * @fires {CustomEvent<void>} vu-open - When the overlay begins opening.
 * @fires {CustomEvent<void>} vu-afteropen - After the open transition window.
 * @fires {CustomEvent<VuOverlayCloseDetail>} vu-close - Cancelable close intent; parent sets `open` false when not prevented.
 * @fires {CustomEvent<void>} vu-afterclose - After the close transition window.
 *
 * @method show - Sets `open` to true.
 * @method hide - Sets `open` to false.
 * @method toggle - Toggles `open`.
 * @method focus - Focuses the content frame.
 */
@customElement("vu-overlay")
@withComponentPresets
export class VuOverlay extends LitElement {
  static override styles = overlayStyles;

  /** Whether the overlay is visible. */
  @property({ type: Boolean, reflect: true }) open = false;
  /** Blocks backdrop and Escape close. */
  @property({ type: Boolean, reflect: true }) persistent = false;
  /** Escape emits `vu-close` when topmost. */
  @property({ type: Boolean, reflect: true }) closeOnEsc = true;
  /** Blurs content behind the scrim. */
  @property({ type: Boolean, reflect: true }) backdropblur = false;
  /** Locks document scroll when open. */
  @property({ type: Boolean, reflect: true }) lockscroll = true;
  /** Accessible name when slotted content has no visible title. */
  @property({ type: String })
  override ariaLabel = "";

  @query('[part="content"]')
  private contentElement?: HTMLElement;

  private _returnFocus: HTMLElement | null = null;
  private _focusTrap: FocusTrapHandle | null = null;
  private _openTimer: ReturnType<typeof setTimeout> | null = null;
  private _closeTimer: ReturnType<typeof setTimeout> | null = null;
  private _highlightAnimation: Animation | null = null;
  private _motion: AnimationController | null = null;

  private get _hasContent(): boolean {
    return hasLightChildrenInSlot(this);
  }

  private get _ariaLabel(): string | undefined {
    const label = this.ariaLabel.trim();
    return label.length > 0 ? label : undefined;
  }

  private get _isDialog(): boolean {
    return this.open && this._hasContent;
  }

  override disconnectedCallback(): void {
    this._clearTimers();
    if (this.open) {
      this._finishClose();
    } else {
      this._teardownOverlay();
    }
    super.disconnectedCallback();
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has("open")) {
      const previous = changed.get("open") as boolean;
      if (this.open && !previous) {
        this._onOpen();
      } else if (!this.open && previous) {
        this._onClose();
      }
    }
  }

  /** Opens the overlay (`open = true`). */
  show(): void {
    this.open = true;
  }

  /** Closes the overlay (`open = false`). */
  hide(): void {
    this.open = false;
  }

  /** Toggles `open`. */
  toggle(): void {
    this.open = !this.open;
  }

  override focus(options?: FocusOptions): void {
    this.contentElement?.focus(options);
  }

  private _onOpen(): void {
    if (this._isDialog) {
      devWarnMissingAccessibleName(
        this,
        !this._ariaLabel,
        "Set `ariaLabel` or provide slotted content with a visible title.",
      );
    }

    this._returnFocus = canUseDocument() ? (document.activeElement as HTMLElement | null) : null;

    if (this.lockscroll) {
      lockDialogScroll();
    }

    this._setupOverlay();
    this._emitLifecycle("vu-open");
    this._scheduleAfterOpen();
  }

  private _onClose(): void {
    this._clearTimers();
    this._scheduleAfterClose();
  }

  private _setupOverlay(): void {
    registerDismissible({
      host: this,
      onDismiss: () => {
        if (!isTopDismissible(this)) return;
        this._emitCloseIntent("escape");
      },
      canDismiss: () => this.open && !this.persistent && this.closeOnEsc,
    });

    if (this._hasContent) {
      this._focusTrap?.deactivate();
      this._focusTrap = activateFocusTrap(this, {
        returnFocus: this._returnFocus,
      });
    }
  }

  private _teardownOverlay(): void {
    unregisterDismissible(this);
    this._focusTrap?.deactivate();
    this._focusTrap = null;

    if (this.lockscroll) {
      unlockDialogScroll();
    }

    this._restoreFocus();
  }

  private _scheduleAfterOpen(): void {
    this._clearTimers();
    const ms = motionDurationMs(OPEN_MS);
    if (ms === 0) {
      this._emitLifecycle("vu-afteropen");
      return;
    }
    this._openTimer = setTimeout(() => this._emitLifecycle("vu-afteropen"), ms);
  }

  private _scheduleAfterClose(): void {
    const ms = motionDurationMs(CLOSE_MS);
    if (ms === 0) {
      this._finishClose();
      return;
    }
    this._closeTimer = setTimeout(() => this._finishClose(), ms);
  }

  private _finishClose(): void {
    this._teardownOverlay();
    this._emitLifecycle("vu-afterclose");
  }

  private _clearTimers(): void {
    if (this._openTimer !== null) {
      clearTimeout(this._openTimer);
      this._openTimer = null;
    }
    if (this._closeTimer !== null) {
      clearTimeout(this._closeTimer);
      this._closeTimer = null;
    }
  }

  private _emitLifecycle(name: string): void {
    this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true }));
  }

  private _emitCloseIntent(reason: VuOverlayCloseReason): void {
    const allowed = this.dispatchEvent(
      new CustomEvent<VuOverlayCloseDetail>("vu-close", {
        detail: { reason },
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (!allowed) return;
  }

  private _motionController(): AnimationController {
    if (!this._motion) {
      this._motion = new AnimationController(this);
    }
    return this._motion;
  }

  private _highlightContent(): void {
    const target = this.contentElement;
    if (!target) return;

    this._highlightAnimation?.cancel();
    this._highlightAnimation = this._motionController().highlightPulse(target);
  }

  private _restoreFocus(): void {
    const target = this._returnFocus;
    this._returnFocus = null;
    if (target?.isConnected) {
      target.focus();
    }
  }

  private _onBackdropClick = (): void => {
    if (this.persistent) {
      this._highlightContent();
      return;
    }
    this._emitCloseIntent("backdrop");
  };

  private _stopContentClick = (event: Event): void => {
    event.stopPropagation();
  };

  override render() {
    return html`
      <div part="backdrop" aria-hidden="true" tabindex="-1" @click=${this._onBackdropClick}></div>
      <div
        part="content"
        role=${ifDefined(this._isDialog ? "dialog" : undefined)}
        aria-modal=${ifDefined(this._isDialog ? "true" : undefined)}
        aria-hidden=${ifDefined(this.open ? undefined : "true")}
        aria-label=${ifDefined(this._isDialog ? this._ariaLabel : undefined)}
        tabindex=${ifDefined(this.open && this._hasContent ? "-1" : undefined)}
        @click=${this._stopContentClick}
      >
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-overlay": VuOverlay;
  }
}
