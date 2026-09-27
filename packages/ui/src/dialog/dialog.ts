import { localized } from "@lit/localize";
import { html, LitElement, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { msg } from "../internals/utils/localize.js";
import { when } from "lit/directives/when.js";
import { ifDefined } from "lit/directives/if-defined.js";
import {
  isTopDismissible,
  registerDismissible,
  unregisterDismissible,
} from "../internals/utils/dismissible-stack.js";
import {
  activateFocusTrap,
  type FocusTrapHandle,
} from "../internals/utils/focus-trap.js";
import { lockDialogScroll, unlockDialogScroll } from "../internals/utils/dialog-scroll-lock.js";
import { devWarnMissingAccessibleName } from "../internals/utils/dev-warn.js";
import { AnimationController } from "../internals/controllers/animation-controller.js";
import { hasLightChildrenInSlot } from "../internals/utils/slot.js";
import { normalizeSurfaceTone } from "../internals/utils/surface-tone.js";
import { ICONS } from "../internals/icon.js";
import { VuIcon } from "../icon/icon.js";
import { VuDivider } from "../divider/divider.js";
import { dialogStyles } from "./dialog.style.js";
import type {
  VuDialogCloseDetail,
  VuDialogCloseReason,
  VuDialogRadius,
  VuDialogSize,
  VuDialogTone,
  VuDialogVariant,
} from "./dialog.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuDialogCloseDetail,
  VuDialogCloseReason,
  VuDialogRadius,
  VuDialogSize,
  VuDialogTone,
  VuDialogVariant,
} from "./dialog.types.js";

const OPEN_MS = 300;
const CLOSE_MS = 150;

/**
 * @element vu-dialog
 *
 * @summary A dialog component with region slots, focus trap, and backdrop.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/dialog
 * @dependency vu-icon
 *
 * @uiVModel open vu-close sync=constant:false
 *
 * @slot header - Title or toolbar row at the top.
 * @slot body - Main content region.
 * @slot footer - Action buttons at the bottom.
 *
 * @property {boolean} open - Whether the dialog is visible. Default: `false`.
 * @property {boolean} closable - Shows a dismiss control in the corner. Default: `false`.
 * @property {string} closeLabel - Accessible name for the dismiss control; empty uses locale catalog. Default: `""`.
 * @property {string} ariaLabel - Accessible name when the header slot is empty. Default: `""`.
 * @property {VuDialogVariant} variant - Surface paint recipe. Default: `"elevated"`.
 * @property {VuDialogTone} tone - Neutral surface weight. Default: `"normal"`.
 * @property {VuDialogSize} size - Padding scale for header, body, and footer (`sm`/`md`/`lg`). Default: `"md"`.
 * @property {VuDialogRadius} radius - Panel corner preset (`sm`/`md`/`lg`; Role C′ omits `none`/`full`). Default: `"md"`.
 * @property {boolean} divider - Hairlines between shown regions. Default: `false`.
 * @property {boolean} persistent - Blocks backdrop and Escape close. Default: `false`.
 * @property {boolean} closeOnEsc - Escape emits `vu-close` when topmost. Default: `true`.
 * @property {string} maxWidth - Optional CSS max-width; empty keeps `auto`. Default: `""`.
 * @property {string} maxHeight - Optional CSS max-height; empty keeps `auto`. Default: `""`.
 *
 * @method show - Sets `open` to true.
 * @method hide - Sets `open` to false.
 * @method toggle - Toggles `open`.
 * @method focus - Focuses the dialog element.
 *
 * @fires {CustomEvent<VuDialogCloseDetail>} vu-close - Cancelable close intent; parent sets `open` false when not prevented.
 * @fires {CustomEvent<void>} vu-open - When the dialog begins opening.
 * @fires {CustomEvent<void>} vu-afteropen - After the open animation finishes.
 * @fires {CustomEvent<void>} vu-afterclose - After the close animation finishes.
 *
 * @csspart dialog - Native `<dialog>` surface.
 * @csspart close-button - Dismiss control when `closable`.
 * @csspart header - Header slot wrapper.
 * @csspart header-divider - Hairline below the header when `divider` is set.
 * @csspart body - Body slot wrapper.
 * @csspart footer-divider - Hairline above the footer when `divider` is set.
 * @csspart footer - Footer slot wrapper.
 *
 * @cssproperty --dialog-surface-bg - Panel background (from `tone` + `variant`).
 * @cssproperty --dialog-surface-fg - Panel foreground.
 * @cssproperty --dialog-header-pad - Header region padding.
 * @cssproperty --dialog-body-pad - Body region padding.
 * @cssproperty --dialog-footer-pad - Footer region padding.
 * @cssproperty --dialog-radius - Panel corner radius (from `radius`).
 * @cssproperty --dialog-max-width - Max inline size of the panel (default `auto`; set via `maxWidth`).
 * @cssproperty --dialog-max-height - Max block size of the panel (default `auto`; set via `maxHeight`).
 * @cssproperty --dialog-backdrop-color - Backdrop fill (`var(--vu-color-backdrop)`); use `transparent` to undim.
 * @cssproperty --dialog-close-size - Dismiss control hit box (default `--vu-control-height-sm`).
 * @cssproperty --dialog-close-icon-size - Dismiss glyph scale inside the control.
 */
@localized()
@customElement("vu-dialog")
@withComponentPresets
export class VuDialog extends LitElement {
  static override styles = dialogStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
    "vu-divider": VuDivider,
  };

  private static _idCounter = 0;
  private readonly _idBase = VuDialog._idCounter++;
  private readonly _headerId = `vu-dlg-h-${this._idBase}`;
  private readonly _bodyId = `vu-dlg-b-${this._idBase}`;

  /** Whether the dialog is visible. */
  @property({ type: Boolean, reflect: true })
  open = false;

  /** Shows the dismiss control. */
  @property({ type: Boolean, reflect: true })
  closable = false;

  /** Accessible name for the dismiss control; empty uses locale catalog. */
  @property({ type: String })
  closeLabel = "";

  /** Accessible name when the header slot is empty. */
  @property({ type: String })
  override ariaLabel = "";

  /** Surface paint recipe. */
  @property({ type: String, reflect: true })
  variant: VuDialogVariant = "elevated";

  /** Neutral surface weight. */
  @property({ type: String, reflect: true })
  tone: VuDialogTone = "normal";

  /** Padding scale for header, body, and footer. */
  @property({ type: String, reflect: true })
  size: VuDialogSize = "md";

  /** Panel corner radius preset. */
  @property({ type: String, reflect: true })
  radius: VuDialogRadius = "md";

  /** Hairlines between shown regions. */
  @property({ type: Boolean, reflect: true })
  divider = false;

  /** Blocks backdrop and Escape close. */
  @property({ type: Boolean, reflect: true })
  persistent = false;

  /** Escape emits `vu-close` when topmost. */
  @property({ type: Boolean, reflect: true })
  closeOnEsc = true;

  /** Optional CSS max-width; empty keeps `auto`. */
  @property({ type: String })
  maxWidth = "";

  /** Optional CSS max-height; empty keeps `auto`. */
  @property({ type: String })
  maxHeight = "";

  @query("dialog")
  private dialogElement?: HTMLDialogElement;

  private _returnFocus: HTMLElement | null = null;
  private _focusTrap: FocusTrapHandle | null = null;
  private _isClosing = false;
  private _openAnimation: Animation | null = null;
  private _closeAnimation: Animation | null = null;
  private _highlightAnimation: Animation | null = null;
  private readonly _motion = new AnimationController(this);

  private get _hasHeader(): boolean {
    return hasLightChildrenInSlot(this, "header");
  }

  private get _hasBody(): boolean {
    return hasLightChildrenInSlot(this, "body");
  }

  private get _hasFooter(): boolean {
    return hasLightChildrenInSlot(this, "footer");
  }

  private get _labelledBy(): string | undefined {
    return this._hasHeader ? this._headerId : undefined;
  }

  private get _describedBy(): string | undefined {
    return this._hasBody ? this._bodyId : undefined;
  }

  private get _ariaLabel(): string | undefined {
    if (this._labelledBy) return undefined;
    const label = this.ariaLabel.trim();
    return label.length > 0 ? label : undefined;
  }

  constructor() {
    super();
    this._handleCancel = this._handleCancel.bind(this);
  }

  onChromeSlotChange = (): void => {
    this.requestUpdate();
  };

  override disconnectedCallback(): void {
    const d = this.dialogElement;
    if (d) {
      d.removeEventListener("pointerdown", this._onBackdropPointerDown);
      d.removeEventListener("cancel", this._handleCancel as EventListener);
      d.removeEventListener("close", this._onNativeClose);
    }
    this._teardownOverlay();
    super.disconnectedCallback();
    unlockDialogScroll();
    if (d?.open && typeof d.close === "function") d.close();
  }

  override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("tone")) {
      this.tone = normalizeSurfaceTone(this.tone, this);
    }
    if (changed.has("maxWidth") && this.style) {
      const next = this.maxWidth.trim();
      if (next) this.style.setProperty("--dialog-max-width", next);
      else this.style.removeProperty("--dialog-max-width");
    }
    if (changed.has("maxHeight") && this.style) {
      const next = this.maxHeight.trim();
      if (next) this.style.setProperty("--dialog-max-height", next);
      else this.style.removeProperty("--dialog-max-height");
    }
  }

  override firstUpdated(): void {
    const d = this.dialogElement;
    if (!d) return;

    d.addEventListener("pointerdown", this._onBackdropPointerDown);
    d.addEventListener("cancel", this._handleCancel as EventListener);
    d.addEventListener("close", this._onNativeClose);

    if (this.open && !d.open) {
      this._syncOpenState(false);
    }
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has("open")) {
      const previous = changed.get("open") as boolean;
      queueMicrotask(() => this._syncOpenState(previous));
    }
  }

  /** Opens the dialog (`open = true`). */
  show(): void {
    this.open = true;
  }

  /** Closes the dialog (`open = false`). */
  hide(): void {
    this.open = false;
  }

  /** Toggles `open`. */
  toggle(): void {
    this.open = !this.open;
  }

  /** Focuses the dialog element. */
  override focus(options?: FocusOptions): void {
    this.dialogElement?.focus(options);
  }

  private _onNativeClose = (): void => {
    if (!this.open) return;
    requestAnimationFrame(() => {
      if (this.open && !this.dialogElement?.open) {
        this.dialogElement?.showModal();
      }
    });
  };

  private _syncOpenState(previousOpen: boolean): void {
    const dialog = this.dialogElement;
    if (!dialog || typeof dialog.showModal !== "function") return;

    if (this.open && !dialog.open) {
      devWarnMissingAccessibleName(
        this,
        !this._labelledBy && !this._ariaLabel,
        "Set `ariaLabel` or provide a `header` slot with visible title text.",
      );
      this._returnFocus =
        (document.activeElement as HTMLElement | null);
      lockDialogScroll();
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      }
      this._setupOverlay();
      this._emitLifecycle("vu-open");
      requestAnimationFrame(() => this._animateOpen());
      return;
    }

    if (!this.open && previousOpen) {
      this._isClosing = true;
      this._animateClose();
    }
  }

  private _setupOverlay(): void {
    const dialog = this.dialogElement;
    if (!dialog) return;

    registerDismissible({
      host: this,
      onDismiss: () => {
        if (!isTopDismissible(this)) return;
        this._emitCloseIntent("escape");
      },
      canDismiss: () => this.open && !this.persistent && this.closeOnEsc,
    });

    this._focusTrap?.deactivate();
    this._focusTrap = activateFocusTrap(dialog, {
      returnFocus: this._returnFocus,
    });
  }

  private _teardownOverlay(): void {
    unregisterDismissible(this);
    this._focusTrap?.deactivate();
    this._focusTrap = null;
  }

  private _animateOpen(): void {
    const dialog = this.dialogElement;
    if (!dialog) return;

    this._openAnimation?.cancel();
    this._closeAnimation?.cancel();
    this._openAnimation = this._motion.enterFadeScaleSpring(dialog, {
      duration: OPEN_MS,
      onFinish: () => this._emitLifecycle("vu-afteropen"),
    });
  }

  private _animateClose(): void {
    const dialog = this.dialogElement;
    if (!dialog) return;

    this._openAnimation?.cancel();
    this._closeAnimation?.cancel();

    const finish = (): void => {
      if (typeof dialog.close === "function") dialog.close();
      unlockDialogScroll();
      this._isClosing = false;
      this._teardownOverlay();
      this._restoreFocus();
      this._emitLifecycle("vu-afterclose");
    };

    this._closeAnimation = this._motion.exitFadeScale(dialog, {
      duration: CLOSE_MS,
      onFinish: finish,
    });
  }

  private _emitLifecycle(name: string): void {
    this.dispatchEvent(
      new CustomEvent(name, { bubbles: true, composed: true }),
    );
  }

  private _emitCloseIntent(reason: VuDialogCloseReason): void {
    if (this._isClosing) return;
    const allowed = this.dispatchEvent(
      new CustomEvent<VuDialogCloseDetail>("vu-close", {
        detail: { reason },
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (!allowed) return;
  }

  private _handleCancel(event: Event): void {
    event.preventDefault();
    if (this.persistent || !this.closeOnEsc) {
      this._highlightDialog();
      return;
    }
    this._emitCloseIntent("escape");
  }

  private _highlightDialog(): void {
    const dialog = this.dialogElement;
    if (!dialog) return;

    this._highlightAnimation?.cancel();
    this._highlightAnimation = this._motion.highlightPulse(dialog, { scale: 1.05 });
  }

  private _restoreFocus(): void {
    const target = this._returnFocus;
    this._returnFocus = null;
    if (target?.isConnected) {
      target.focus();
      return;
    }
    this.dialogElement?.focus();
  }

  private _onBackdropPointerDown = (event: PointerEvent): void => {
    const dialog = this.dialogElement;
    if (!dialog?.open || event.target !== dialog) return;

    if (this.persistent) {
      this._highlightDialog();
      return;
    }

    this._emitCloseIntent("backdrop");
  };

  override render() {
    return html`
      <dialog
        part="dialog"
        tabindex="-1"
        aria-modal="true"
        aria-label=${ifDefined(this._ariaLabel)}
        aria-labelledby=${ifDefined(this._labelledBy)}
        aria-describedby=${ifDefined(this._describedBy)}
      >
        <div
          part="header"
          id=${ifDefined(this._labelledBy)}
          class="header"
        >
          <slot name="header" @slotchange=${this.onChromeSlotChange}></slot>
        </div>
        <vu-divider
          part="header-divider"
          ?hidden=${!this.divider}
        ></vu-divider>

        <div
          part="body"
          id=${ifDefined(this._hasBody ? this._bodyId : undefined)}
          class="body"
        >
          <slot name="body" @slotchange=${this.onChromeSlotChange}></slot>
        </div>

        <vu-divider
          part="footer-divider"
          ?hidden=${!this.divider}
        ></vu-divider>
        <div
          part="footer"
          class="footer"
        >
          <slot name="footer" @slotchange=${this.onChromeSlotChange}></slot>
        </div>

        ${when(this.closable, () => html`
          <button
            type="button"
            class="close-button"
            part="close-button"
            aria-label=${this.closeLabel.trim() ||
            msg("Close", { id: "nu.close", desc: "Accessible name for a dismiss control." })}
            @click=${() => this._emitCloseIntent("close-button")}
          >
            <vu-icon icon=${ICONS.close}></vu-icon>
          </button>
        `)}
      </dialog>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "vu-dialog": VuDialog;
  }
}
