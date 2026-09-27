import { html, LitElement, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { PopoverController } from "../internals/controllers/popover-controller.js";
import {
  isTopDismissible,
  registerDismissible,
  unregisterDismissible,
} from "../internals/utils/dismissible-stack.js";
import { canUseDocument } from "../internals/utils/env.js";
import { popoverStyles } from "./popover.style.js";
import type {
  VuPopoverAlign,
  VuPopoverAnchor,
  VuPopoverAnchorScope,
  VuPopoverOpenChangeDetail,
  VuPopoverFlipSide,
  VuPopoverMaxWidthMode,
  VuPopoverPlacement,
  VuPopoverPreset,
} from "./popover.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuPopoverAlign,
  VuPopoverAnchor,
  VuPopoverAnchorScope,
  VuPopoverOpenChangeDetail,
  VuPopoverFlipSide,
  VuPopoverMaxWidthMode,
  VuPopoverPlacement,
  VuPopoverPreset,
} from "./popover.types.js";

/**
 * @element vu-popover
 *
 * @summary A popover component with smart placement and a trigger slot.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/popover
 * @dependency popover-controller
 *
 * @uiVModel open vu-open-change detail=open
 *
 * @slot - Popover body (light DOM for host styling compatibility).
 *
 * @csspart base - Host is the positioned `popover="manual"` surface.
 *
 * @cssproperty --popover-left - Physical viewport `left` (set by PopoverController).
 * @cssproperty --popover-top - Physical viewport `top` (set by PopoverController).
 * @cssproperty --popover-width - Inline size when `matchanchorwidth` is enabled.
 *
 * @property {boolean} open - Whether the popover is open.
 * @property {VuPopoverAnchor} anchor - Anchor selector, element, or ref object.
 * @property {VuPopoverAnchorScope} anchorScope - `document` or shadow `root` lookup for selectors.
 * @property {HTMLElement | null} anchorEl - Direct anchor element (JS only).
 * @property {VuPopoverPlacement} placement - Preferred placement before flip.
 * @property {VuPopoverAlign} align - Alignment along the anchor edge.
 * @property {number} gap - Gap between anchor and surface in px.
 * @property {number} padding - Viewport edge inset for flip/clamp math in px.
 * @property {boolean} matchAnchorWidth - Matches surface width to the anchor.
 * @property {boolean} maxWidthToViewport - Caps surface width to the viewport.
 * @property {VuPopoverMaxWidthMode} maxWidthMode - Max-width application strategy.
 * @property {boolean} flip - Enables placement flipping.
 * @property {VuPopoverFlipSide[]} flipOrder - Preferred flip order.
 * @property {VuPopoverPreset} preset - Open/close animation preset.
 * @property {number} duration - Open animation duration in ms.
 * @property {number} closeDuration - Close animation duration in ms.
 * @property {boolean} animateReposition - Animates position updates while open.
 * @property {number} repositionMs - Reposition animation duration in ms.
 * @property {boolean} closeOnEscape - Closes on Escape.
 * @property {boolean} closeOnOutside - Closes on outside pointer down.
 * @property {boolean} restoreFocusOnClose - Restores focus to the prior active element.
 * @property {string} ignoreOutsideSelector - Selector for elements that ignore outside dismiss.
 * @property {string} ignoreOutsideAttr - Attribute marking ignore zones for outside dismiss.
 * @property {string} groupEventName - Optional coordinated group event channel.
 * @property {unknown} groupId - Optional group identifier for coordinated open/close.
 *
 * @method show - Sets `open` to true.
 * @method hide - Sets `open` to false.
 * @method toggle - Toggles `open`.
 * @method reconnectTarget - Re-resolves the anchor and syncs controller state.
 *
 * @fires {CustomEvent<void>} vu-open - When the popover begins opening.
 * @fires {CustomEvent<void>} vu-close - When the popover begins closing.
 * @fires {CustomEvent<VuPopoverOpenChangeDetail>} vu-open-change - When `open` changes.
 */
@customElement("vu-popover")
@withComponentPresets
export class VuPopover extends LitElement {
  static override styles = popoverStyles;

  /** Whether the popover is open. */
  @property({ type: Boolean, reflect: true })
  open = false;

  /** Anchor selector, element, or ref object. */
  @property()
  anchor?: VuPopoverAnchor;

  /** `document` or shadow `root` lookup for selector anchors. */
  @property({ type: String })
  anchorScope: VuPopoverAnchorScope = "document";

  /** Direct anchor element (JS only). */
  @property({ attribute: false })
  anchorEl?: HTMLElement | null;

  /** Preferred placement before flip. */
  @property({ type: String })
  placement: VuPopoverPlacement = "auto";

  /** Alignment along the anchor edge. */
  @property({ type: String })
  align: VuPopoverAlign = "start";

  /** Gap between anchor and surface in px. */
  @property({ type: Number })
  gap = 6;

  /** Viewport edge inset for flip/clamp math in px. */
  @property({ type: Number })
  padding = 8;

  /** Matches surface width to the anchor. */
  @property({ type: Boolean })
  matchAnchorWidth = false;

  /** Caps surface width to the viewport. */
  @property({ type: Boolean })
  maxWidthToViewport = true;

  /** Max-width application strategy. */
  @property({ type: String })
  maxWidthMode: VuPopoverMaxWidthMode = "cap";

  /** Enables placement flipping. */
  @property({ type: Boolean })
  flip = true;

  /** Preferred flip order. */
  @property({ type: Array })
  flipOrder: VuPopoverFlipSide[] = [];

  /** Open/close animation preset. */
  @property({ type: String })
  preset: VuPopoverPreset = "scale";

  /** Open animation duration in ms. */
  @property({ type: Number })
  duration = 220;

  /** Close animation duration in ms. */
  @property({ type: Number })
  closeDuration = 180;

  /** Animates position updates while open. */
  @property({ type: Boolean })
  animateReposition = true;

  /** Reposition animation duration in ms. */
  @property({ type: Number })
  repositionMs = 160;

  /** Closes on Escape. */
  @property({ type: Boolean })
  closeOnEscape = true;

  /** Closes on outside pointer down. */
  @property({ type: Boolean })
  closeOnOutside = true;

  /** Restores focus to the prior active element. */
  @property({ type: Boolean })
  restoreFocusOnClose = true;

  /** Selector for elements that ignore outside dismiss. */
  @property({ type: String })
  ignoreOutsideSelector = "";

  /** Attribute marking ignore zones for outside dismiss. */
  @property({ type: String })
  ignoreOutsideAttr = "data-popover-ignore-outside";

  /** Optional coordinated group event channel. */
  @property({ type: String })
  groupEventName?: string;

  /** Optional group identifier for coordinated open/close. */
  @property()
  groupId?: unknown;

  private _ready = false;
  private _syncingFromController = false;

  private readonly _popover = new PopoverController(this, {
    getAnchor: () => this.#resolveAnchorEl(),
    getPopover: () => this,
    cssVarLeft: "--popover-left",
    cssVarTop: "--popover-top",
    cssVarWidth: "--popover-width",
    getPlacement: () => this.placement,
    getAlign: () => this.align,
    getGap: () => this.gap,
    getPadding: () => this.padding,
    getMatchAnchorWidth: () => this.matchAnchorWidth,
    getMaxWidthToViewport: () => this.maxWidthToViewport,
    getMaxWidthMode: () => this.maxWidthMode,
    getFlip: () => this.flip,
    getFlipOrder: () => this.flipOrder,
    getPreset: () => this.preset,
    getDuration: () => this.duration,
    getCloseDuration: () => this.closeDuration,
    getAnimateReposition: () => this.animateReposition,
    getRepositionMs: () => this.repositionMs,
    getCloseOnEscape: () => false,
    getRestoreFocusOnClose: () => this.restoreFocusOnClose,
    getCloseOnOutside: () => this.closeOnOutside,
    getIgnoreOutsideSelector: () => this.ignoreOutsideSelector,
    getIgnoreOutsideAttr: () => this.ignoreOutsideAttr,
    groupEventName: this.groupEventName,
    groupId: this.groupId,
    onOpenChange: (next, meta) => {
      this._syncingFromController = true;
      this.open = next;
      this._syncingFromController = false;
      this.#syncDismissible(next);
      this.#emitChange(next, meta.reason);
    },
  });

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("popover", "manual");
    if (!this.hasAttribute("part")) {
      this.setAttribute("part", "base");
    }
    this.addEventListener("toggle", this._popover.onToggle);
  }

  override firstUpdated(): void {
    this._popover.refreshTargets();
    this._ready = true;
    if (this.open) {
      this.#applyOpenToController(false);
    }
  }

  override disconnectedCallback(): void {
    unregisterDismissible(this);
    this.removeEventListener("toggle", this._popover.onToggle);
    if (this._popover.open) {
      try {
        this._popover.closePopover("api");
      } catch {

      }
    }
    this._ready = false;
    super.disconnectedCallback();
  }

  override updated(changed: PropertyValues<this>): void {
    const anchorChanged =
      changed.has("anchor")
      || changed.has("anchorScope")
      || changed.has("anchorEl");

    if (anchorChanged) {
      this._popover.refreshTargets();
    }

    if (changed.has("open") || anchorChanged) {
      if (anchorChanged) this.#ensureAnchorAlive();
      const previous = changed.has("open") ? (changed.get("open") as boolean) : this.open;
      this.#applyOpenToController(previous);
    }
  }

  /** Sets `open` to true. */
  show(): void {
    this.open = true;
  }

  /** Sets `open` to false. */
  hide(): void {
    this.open = false;
  }

  /** Toggles `open`. */
  toggle(): void {
    this.open = !this.open;
  }

  /** Re-resolves the anchor and syncs controller state. */
  reconnectTarget(): void {
    this._popover.refreshTargets();
    this.#ensureAnchorAlive();
    this.#applyOpenToController(this.open);
  }

  #applyOpenToController(previousOpen: boolean): void {
    if (!this._ready || this._syncingFromController) return;

    if (this.open && !this._popover.open) {
      if (!this.#resolveAnchorEl()) {

        this.#revertOpenWithoutAnchor();
        return;
      }
      this._popover.openPopover();
      return;
    }

    if (!this.open && (previousOpen || this._popover.open)) {
      this._popover.closePopover("api");
    }
  }

  #ensureAnchorAlive(): void {
    if (this.open && !this.#resolveAnchorEl()) {
      this.#revertOpenWithoutAnchor();
      this._popover.closePopover("api");
    }
  }

  /** Closes when open was requested without a resolvable anchor (post-render discovery). */
  #revertOpenWithoutAnchor(): void {
    queueMicrotask(() => {
      if (!this.open || this.#resolveAnchorEl()) return;
      this._syncingFromController = true;
      this.open = false;
      this._syncingFromController = false;
    });
  }

  #syncDismissible(open: boolean): void {
    if (!open || !this.closeOnEscape) {
      unregisterDismissible(this);
      return;
    }

    registerDismissible({
      host: this,
      onDismiss: () => {
        if (!isTopDismissible(this)) return;
        this._popover.closePopover("escape");
      },
      canDismiss: () => this.open && this.closeOnEscape,
    });
  }

  #emitChange(open: boolean, reason: VuPopoverOpenChangeDetail["reason"]): void {
    this.dispatchEvent(
      new CustomEvent(open ? "vu-open" : "vu-close", {
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(
      new CustomEvent<VuPopoverOpenChangeDetail>("vu-open-change", {
        detail: { open, reason },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #resolveMaybeRef(value: unknown): HTMLElement | null {
    if (value instanceof HTMLElement) return value;
    if (value && typeof value === "object" && "value" in value) {
      const el = (value as { value?: unknown }).value;
      return el instanceof HTMLElement ? el : null;
    }
    return null;
  }

  #resolveAnchorEl(): HTMLElement | null {
    if (this.anchorEl instanceof HTMLElement) return this.anchorEl;

    const direct = this.#resolveMaybeRef(this.anchor);
    if (direct) return direct;

    const selector = typeof this.anchor === "string" ? this.anchor.trim() : "";
    if (!selector) return null;

    if (this.anchorScope === "root") {
      const root = this.getRootNode() as Document | ShadowRoot;
      return root.querySelector<HTMLElement>(selector);
    }

    if (!canUseDocument()) return null;
    return document.querySelector<HTMLElement>(selector);
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-popover": VuPopover;
  }
}
