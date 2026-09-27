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
import { hasLightChildrenInSlot } from "../internals/utils/slot.js";
import { normalizeSurfaceTone } from "../internals/utils/surface-tone.js";
import { ICONS } from "../internals/icon.js";
import { VuIcon } from "../icon/icon.js";
import { VuDivider } from "../divider/divider.js";
import { motionDurationMs } from "../internals/utils/motion.js";
import { devWarnMissingAccessibleName } from "../internals/utils/dev-warn.js";
import { PopoverController } from "../internals/controllers/popover-controller.js";
import type { CloseReason } from "../internals/controllers/popover-controller.js";
import { AnimationController } from "../internals/controllers/animation-controller.js";
import {
  DRAWER_CLOSE_MS,
  DRAWER_OPEN_MS,
  drawerPopoverOptions,
  type DrawerPopoverHost,
} from "./internals/drawer.popover.js";
import { drawerStyles } from "./drawer.style.js";
import type {
  VuDrawerCloseDetail,
  VuDrawerCloseReason,
  VuDrawerRadius,
  VuDrawerSide,
  VuDrawerSize,
  VuDrawerTone,
  VuDrawerVariant,
} from "./drawer.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuDrawerCloseDetail,
  VuDrawerCloseReason,
  VuDrawerRadius,
  VuDrawerSide,
  VuDrawerSize,
  VuDrawerTone,
  VuDrawerVariant,
} from "./drawer.types.js";

/**
 * @element vu-drawer
 *
 * @summary A drawer component with slide-in panel, backdrop, and focus trap.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/drawer
 * @dependency vu-icon
 *
 * @uiVModel open vu-close sync=constant:false
 *
 * @slot header - Top region (title or toolbar).
 * @slot body - Main scrollable content.
 * @slot footer - Bottom actions region.
 *
 * @property {boolean} open - Whether the drawer is visible. Default: `false`.
 * @property {boolean} closable - Shows a dismiss control on the panel. Default: `false`.
 * @property {string} closeLabel - Accessible name for the dismiss control; empty uses locale catalog. Default: `""`.
 * @property {string} ariaLabel - Accessible name when the header slot is empty. Default: `""`.
 * @property {VuDrawerSide} side - Edge the panel slides in from. Default: `"left"`.
 * @property {VuDrawerVariant} variant - Surface paint recipe. Default: `"elevated"`.
 * @property {VuDrawerTone} tone - Neutral surface weight. Default: `"normal"`.
 * @property {VuDrawerSize} size - Padding scale for header, body, and footer. Default: `"md"`.
 * @property {VuDrawerRadius} radius - Panel corner preset (`sm`/`md`/`lg`; Role C′ omits `none`/`full`). Default: `"md"`.
 * @property {boolean} divider - Hairlines between shown regions. Default: `false`.
 * @property {boolean} persistent - Blocks backdrop and Escape close. Default: `false`.
 * @property {boolean} closeOnEsc - Escape emits `vu-close` when topmost. Default: `true`.
 *
 * @method show - Sets `open` to true.
 * @method hide - Sets `open` to false.
 * @method toggle - Toggles `open`.
 * @method focus - Focuses the panel container.
 *
 * @fires {CustomEvent<VuDrawerCloseDetail>} vu-close - Cancelable close intent; parent sets `open` false when not prevented.
 * @fires {CustomEvent<void>} vu-open - When the drawer begins opening.
 * @fires {CustomEvent<void>} vu-afteropen - After the open transition finishes.
 * @fires {CustomEvent<void>} vu-afterclose - After the close transition finishes.
 *
 * @csspart overlay - Backdrop behind the panel.
 * @csspart panel - Sliding surface.
 * @csspart close-button - Dismiss control when `closable`.
 * @csspart header - Header slot wrapper.
 * @csspart header-divider - Hairline below the header when `divider` is set.
 * @csspart body - Body slot wrapper.
 * @csspart footer-divider - Hairline above the footer when `divider` is set.
 * @csspart footer - Footer slot wrapper.
 *
 * @cssproperty --drawer-surface-bg - Panel background (from `tone` + `variant`).
 * @cssproperty --drawer-surface-fg - Panel foreground.
 * @cssproperty --drawer-header-pad - Header padding.
 * @cssproperty --drawer-body-pad - Body padding.
 * @cssproperty --drawer-footer-pad - Footer padding.
 * @cssproperty --drawer-radius - Panel corner radius (from `radius`).
 * @cssproperty --drawer-width - Panel inline size.
 * @cssproperty --drawer-height - Panel block size.
 * @cssproperty --drawer-backdrop-color - Backdrop fill; use `transparent` to undim.
 * @cssproperty --drawer-close-size - Dismiss control hit box.
 * @cssproperty --drawer-close-icon-size - Dismiss glyph scale.
 */
@localized()
@customElement("vu-drawer")
@withComponentPresets
export class VuDrawer extends LitElement implements DrawerPopoverHost {
  static override styles = drawerStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
    "vu-divider": VuDivider,
  };

  private static _idCounter = 0;
  private readonly _idBase = VuDrawer._idCounter++;
  private readonly _headerId = `vu-drw-h-${this._idBase}`;
  private readonly _bodyId = `vu-drw-b-${this._idBase}`;

  /** Whether the drawer is visible. */
  @property({ type: Boolean, reflect: true })
  open = false;

  /** Shows the dismiss control on the panel. */
  @property({ type: Boolean, reflect: true })
  closable = false;

  /** Accessible name for the dismiss control; empty uses locale catalog. */
  @property({ type: String })
  closeLabel = "";

  /** Accessible name when the header slot is empty. */
  @property({ type: String })
  override ariaLabel = "";

  /** Edge the panel slides in from. */
  @property({ type: String, reflect: true })
  side: VuDrawerSide = "left";

  /** Surface paint recipe. */
  @property({ type: String, reflect: true })
  variant: VuDrawerVariant = "elevated";

  /** Neutral surface weight. */
  @property({ type: String, reflect: true })
  tone: VuDrawerTone = "normal";

  /** Padding scale for header, body, and footer. */
  @property({ type: String, reflect: true })
  size: VuDrawerSize = "md";

  /** Panel corner radius preset. */
  @property({ type: String, reflect: true })
  radius: VuDrawerRadius = "md";

  /** Hairlines between shown regions. */
  @property({ type: Boolean, reflect: true })
  divider = false;

  /** Blocks backdrop and Escape close. */
  @property({ type: Boolean, reflect: true })
  persistent = false;

  /** Escape emits `vu-close` when topmost. */
  @property({ type: Boolean, reflect: true })
  closeOnEsc = true;

  @query(".panel")
  panelElement?: HTMLElement;

  @query(".edge-anchor")
  edgeAnchorElement?: HTMLElement;

  private _returnFocus: HTMLElement | null = null;
  private _focusTrap: FocusTrapHandle | null = null;
  private _openTimer: ReturnType<typeof setTimeout> | null = null;
  private _closeTimer: ReturnType<typeof setTimeout> | null = null;
  private _highlightAnimation: Animation | null = null;
  private _overlayActive = false;
  private _syncingPopover = false;
  private readonly _motion = new AnimationController(this);
  private readonly _popover: PopoverController;

  constructor() {
    super();
    this._popover = new PopoverController(this, drawerPopoverOptions(this));
  }

  onChromeSlotChange = (): void => {
    this.requestUpdate();
  };

  focusPanel(): void {
    this.panelElement?.focus();
  }

  onPopoverOpenChange(open: boolean, _meta: { reason: CloseReason }): void {
    if (this._syncingPopover) return;
    this._syncingPopover = true;
    if (open) {
      this.open = true;
      this._onOpen();
    } else {
      this.open = false;
      this._onClose();
    }
    this._syncingPopover = false;
  }

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

  override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("tone")) {
      this.tone = normalizeSurfaceTone(this.tone, this);
    }
  }

  override disconnectedCallback(): void {
    this._clearTimers();
    if (this._popover.open) {
      void this._popover.closePopover("api");
    }
    if (this._overlayActive) {
      this._finishClose();
    } else {
      this._teardownOverlay();
    }
    super.disconnectedCallback();
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has("open") && !this._syncingPopover) {
      if (this.open && !this._popover.open) {
        void this._popover.openPopover();
      } else if (!this.open && this._popover.open) {
        void this._popover.closePopover("api");
      }
    }
    if (changed.has("side") && this._popover.open) {
      this._popover.refreshTargets();
    }
  }

  /** Opens the drawer (`open = true`). */
  show(): void {
    this.open = true;
  }

  /** Closes the drawer (`open = false`). */
  hide(): void {
    this.open = false;
  }

  /** Toggles `open`. */
  toggle(): void {
    this.open = !this.open;
  }

  /** Focuses the panel container. */
  override focus(options?: FocusOptions): void {
    this.panelElement?.focus(options);
  }

  private _onOpen(): void {
    if (this._overlayActive) return;
    this._overlayActive = true;
    devWarnMissingAccessibleName(
      this,
      !this._labelledBy && !this._ariaLabel,
      "Set `ariaLabel` or provide a `header` slot with visible title text.",
    );
    this._returnFocus = (document.activeElement as HTMLElement | null);
    lockDialogScroll();
    this._setupOverlay();
    this._emitLifecycle("vu-open");
    this._scheduleAfterOpen();
  }

  private _onClose(): void {
    if (!this._overlayActive) return;
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

    const panel = this.panelElement;
    if (!panel) return;

    this._focusTrap?.deactivate();
    this._focusTrap = activateFocusTrap(panel, {
      returnFocus: this._returnFocus,
    });
  }

  private _teardownOverlay(): void {
    unregisterDismissible(this);
    this._focusTrap?.deactivate();
    this._focusTrap = null;
    unlockDialogScroll();
    this._restoreFocus();
  }

  private _scheduleAfterOpen(): void {
    this._clearTimers();
    const ms = motionDurationMs(DRAWER_OPEN_MS);
    if (ms === 0) {
      this._emitLifecycle("vu-afteropen");
      return;
    }
    this._openTimer = setTimeout(() => this._emitLifecycle("vu-afteropen"), ms);
  }

  private _scheduleAfterClose(): void {
    const ms = motionDurationMs(DRAWER_CLOSE_MS);
    if (ms === 0) {
      this._finishClose();
      return;
    }
    this._closeTimer = setTimeout(() => this._finishClose(), ms);
  }

  private _finishClose(): void {
    this._overlayActive = false;
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
    this.dispatchEvent(
      new CustomEvent(name, { bubbles: true, composed: true }),
    );
  }

  private _emitCloseIntent(reason: VuDrawerCloseReason): void {
    const allowed = this.dispatchEvent(
      new CustomEvent<VuDrawerCloseDetail>("vu-close", {
        detail: { reason },
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (!allowed) return;
  }

  private _highlightPanel(): void {
    const panel = this.panelElement;
    if (!panel) return;

    this._highlightAnimation?.cancel();
    this._highlightAnimation = this._motion.highlightPulse(panel, {
      scale: 1.02,
      transformPrefix: "translateX(0)",
    });
  }

  private _restoreFocus(): void {
    const target = this._returnFocus;
    this._returnFocus = null;
    if (target?.isConnected) {
      target.focus();
    }
  }

  private _onOverlayClick = (): void => {
    if (this.persistent) {
      this._highlightPanel();
      return;
    }
    this._emitCloseIntent("backdrop");
  };

  private _stopPanelClick = (event: Event): void => {
    event.stopPropagation();
  };

  override render() {
    return html`
      <div
        class="edge-anchor"
        aria-hidden="true"
      ></div>

      <div
        class="overlay"
        part="overlay"
        aria-hidden="true"
        tabindex="-1"
        @click=${this._onOverlayClick}
      ></div>

      <div
        class="panel"
        part="panel"
        popover="manual"
        @toggle=${this._popover.onToggle}
        role=${ifDefined(this.open ? "dialog" : undefined)}
        aria-modal=${ifDefined(this.open ? "true" : undefined)}
        aria-hidden=${ifDefined(this.open ? undefined : "true")}
        tabindex=${ifDefined(this.open ? "-1" : undefined)}
        aria-label=${ifDefined(this.open ? this._ariaLabel : undefined)}
        aria-labelledby=${ifDefined(this.open ? this._labelledBy : undefined)}
        aria-describedby=${ifDefined(this.open ? this._describedBy : undefined)}
        @click=${this._stopPanelClick}
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
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "vu-drawer": VuDrawer;
  }
}
