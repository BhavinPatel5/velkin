import { html, LitElement, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { PopoverController } from "../internals/controllers/popover-controller.js";
import { isClient } from "../internals/utils/env.js";
import { normalizeSurfaceTone } from "../internals/utils/surface-tone.js";
import {
  motionDurationMs,
  POPOVER_PRESET_DURATION_BASE,
  readMotionDurationMs,
  readThemeTimeMs,
  resolvePopoverDurationMs,
} from "../internals/utils/motion.js";
import {
  slotOrPropVisible,
} from "../internals/utils/slot.js";
import { tooltipStyles } from "./tooltip.style.js";
import type {
  VuTooltipAlign,
  VuTooltipOpenChangeDetail,
  VuTooltipPlacement,
  VuTooltipRadius,
  VuTooltipSize,
  VuTooltipTone,
  VuTooltipTrigger,
  VuTooltipVariant,
} from "./tooltip.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuTooltipAlign,
  VuTooltipOpenChangeDetail,
  VuTooltipPlacement,
  VuTooltipRadius,
  VuTooltipSize,
  VuTooltipTone,
  VuTooltipTrigger,
  VuTooltipVariant,
} from "./tooltip.types.js";

const VIEWPORT_PAD = 8;

/**
 * @element vu-tooltip
 *
 * @summary A tooltip component with smart placement and hover or click triggers.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/tooltip
 * @dependency popover-controller
 *
 * @uiVModel open vu-open-change detail=open
 *
 * @slot - Trigger content (button, icon, text).
 * @slot tooltip - Tooltip body; when empty, the `label` prop is shown.
 *
 * @csspart trigger - Wrapper around the default slot.
 * @csspart surface - Positioned popover shell (`popover="manual"`).
 * @csspart content - Bubble surface with padding and optional arrow.
 *
 * @cssproperty --tooltip-panel-bg - Bubble background (overlay token).
 * @cssproperty --tooltip-panel-fg - Bubble foreground.
 * @cssproperty --tooltip-border-color - Bubble stroke; matches the arrow when `arrow` is set.
 * @cssproperty --tooltip-arrow-offset - Arrow position along the attached edge (px from start).
 * @cssproperty --tooltip-arrow-edge-pad - Minimum inset from bubble corners for the arrow.
 * @cssproperty --tooltip-radius - Corner radius preset.
 * @cssproperty --tooltip-pad-block - Block padding inside the bubble.
 * @cssproperty --tooltip-pad-inline - Inline padding inside the bubble.
 * @cssproperty --tooltip-font-size - Type scale for tooltip copy.
 * @cssproperty --tooltip-max-width - Max inline size of the bubble.
 * @cssproperty --tooltip-left - Physical viewport `left` (PopoverController).
 * @cssproperty --tooltip-top - Physical viewport `top` (PopoverController).
 *
 * @property {boolean} open - Whether the tooltip is visible.
 * @property {VuTooltipPlacement} placement - Preferred side before collision flip.
 * @property {VuTooltipAlign} align - Alignment along the trigger edge.
 * @property {VuTooltipTrigger} trigger - `hover`, `click`, or `both`.
 * @property {string} label - Plain-text fallback when the `tooltip` slot is empty.
 * @property {VuTooltipVariant} variant - Floating surface recipe (`elevated`, `outline`, `soft`).
 * @property {VuTooltipTone} tone - Neutral overlay weight.
 * @property {VuTooltipSize} size - Padding and type scale.
 * @property {VuTooltipRadius} radius - Corner preset (`sm`/`md`/`lg`; Role C′ omits `none`/`full`).
 * @property {boolean} arrow - Draws a placement arrow on the bubble.
 * @property {boolean} interactive - Allows pointer interaction with tooltip content.
 * @property {boolean} noAutoTrigger - Disables hover/click/focus auto triggers; use methods only.
 * @property {number} delay - Hover/focus dwell time (ms) before open; omit for `--vu-tooltip-delay` (1500ms).
 * @property {number} closeDelay - Ms after pointer/focus leaves before close; omit for `--vu-tooltip-close-delay`.
 * @property {number} offset - Gap between trigger and bubble in px.
 * @property {boolean} block - Stretches the trigger to the container width.
 *
 * @method show - Sets `open` to true.
 * @method hide - Sets `open` to false (immediate; ignores `closeDelay`).
 * @method toggle - Toggles `open`.
 *
 * @fires {CustomEvent<void>} vu-open - When the tooltip begins opening.
 * @fires {CustomEvent<void>} vu-close - When the tooltip begins closing.
 * @fires {CustomEvent<VuTooltipOpenChangeDetail>} vu-open-change - When `open` changes (including via methods).
 */
@customElement("vu-tooltip")
@withComponentPresets
export class VuTooltip extends LitElement {
  static override styles = tooltipStyles;

  private static _idSeq = 0;

  /** Whether the tooltip is visible. */
  @property({ type: Boolean, reflect: true }) open = false;
  /** Preferred side before collision flip. */
  @property({ type: String, reflect: true }) placement: VuTooltipPlacement = "top";
  /** Alignment along the trigger edge. */
  @property({ type: String, reflect: true }) align: VuTooltipAlign = "center";
  /** `hover`, `click`, or `both`. */
  @property({ type: String, reflect: true }) trigger: VuTooltipTrigger = "hover";
  /** Plain-text fallback when the `tooltip` slot is empty. */
  @property({ type: String }) label = "";
  /** Floating surface recipe (`elevated`, `outline`, `soft`). */
  @property({ type: String, reflect: true }) variant: VuTooltipVariant = "elevated";
  /** Neutral overlay weight. */
  @property({ type: String, reflect: true }) tone: VuTooltipTone = "normal";
  /** Padding and type scale. */
  @property({ type: String, reflect: true }) size: VuTooltipSize = "md";
  /** Corner preset (`sm`/`md`/`lg`; Role C′ omits `none`/`full`). */
  @property({ type: String, reflect: true }) radius: VuTooltipRadius = "md";
  /** Draws a placement arrow on the bubble. */
  @property({ type: Boolean, reflect: true }) arrow = false;
  /** Allows pointer interaction with tooltip content. */
  @property({ type: Boolean, reflect: true }) interactive = false;
  /** Disables hover/click/focus auto triggers; use methods only. */
  @property({ type: Boolean, reflect: true }) noAutoTrigger = false;
  /** Hover/focus dwell time (ms) before open; omit for theme `--vu-tooltip-delay`. */
  @property({ type: Number }) delay?: number;
  /** Ms after pointer/focus leaves before close; omit for theme `--vu-tooltip-close-delay`. */
  @property({ type: Number }) closeDelay?: number;
  /** Gap between trigger and bubble in px. */
  @property({ type: Number }) offset = 6;
  /** Stretches the trigger to the container width. */
  @property({ type: Boolean, reflect: true }) block = false;

  @query('[part="trigger"]')
  private _triggerEl?: HTMLElement;

  @query('[part="surface"]')
  private _surfaceEl?: HTMLElement;

  private readonly _tooltipId = `vu-tooltip-${++VuTooltip._idSeq}`;
  private _ready = false;
  private _syncingFromController = false;
  private _viewportListeners = false;
  private _openTimer: ReturnType<typeof setTimeout> | null = null;
  private _hideDelayTimer: ReturnType<typeof setTimeout> | null = null;
  private _arrowSyncTimer: ReturnType<typeof setTimeout> | null = null;
  private _arrowViewportRaf = 0;

  private readonly _popover = new PopoverController(this, {
    getAnchor: () => this._triggerEl ?? null,
    getPopover: () => this._surfaceEl ?? null,
    cssVarLeft: "--tooltip-left",
    cssVarTop: "--tooltip-top",
    cssVarWidth: "--tooltip-width",
    getPlacement: () => this.placement,
    getAlign: () => this.align,
    getGap: () => this.offset,
    getPadding: () => VIEWPORT_PAD,
    getMatchAnchorWidth: () => false,
    getMaxWidthToViewport: () => true,
    getMaxWidthMode: () => "cap",
    getFlip: () => true,
    getFlipOrder: () => [],
    getPreset: () => "fade",
    getCloseOnEscape: () => true,
    getEscapeRequiresFocus: () => false,
    getCloseOnOutside: () => true,
    getRestoreFocusOnClose: () => false,
    animateReposition: false,
    getRepositionMs: () => motionDurationMs(readMotionDurationMs(this, "normal")),
    respectReducedMotion: true,
    onOpenChange: (next) => {
      this._syncingFromController = true;
      this.open = next;
      this._syncingFromController = false;
      this._emitOpenChange(next);
      if (next) {
        this._attachArrowViewportListeners();
        this._scheduleArrowOffsetSync();
      } else {
        this._detachArrowViewportListeners();
        this._clearArrowSyncTimer();
      }
    },
  });

  private get _hasContent(): boolean {
    return slotOrPropVisible(this, "tooltip", this.label);
  }

  private get _describedBy(): string | undefined {
    return this.open && this._hasContent ? this._tooltipId : undefined;
  }

  override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("tone")) {
      this.tone = normalizeSurfaceTone(this.tone, this);
    }
  }

  override firstUpdated(): void {
    this._popover.refreshTargets();
    this._ready = true;
    if (this.open) {
      this._applyOpenToController(false);
    }
  }

  override disconnectedCallback(): void {
    this._clearOpenTimer();
    this._clearHideDelayTimer();
    this._clearArrowSyncTimer();
    if (this._arrowViewportRaf) {
      cancelAnimationFrame(this._arrowViewportRaf);
      this._arrowViewportRaf = 0;
    }
    this._detachArrowViewportListeners();
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
    if (changed.has("placement") && this._popover.open) {
      this._popover.position();
      this._scheduleArrowOffsetSync();
    }

    if (changed.has("open")) {
      const previous = changed.get("open") as boolean;
      this._applyOpenToController(previous);
    }
  }

  /** Sets `open` to true. */
  show(): void {
    if (!this._hasContent) return;
    this.open = true;
  }

  /** Sets `open` to false (immediate; ignores `closeDelay`). */
  hide(): void {
    this._clearHideDelayTimer();
    this.open = false;
  }

  /** Toggles `open`. */
  toggle(): void {
    if (this.open) this.hide();
    else this.show();
  }

  private _applyOpenToController(previousOpen: boolean): void {
    if (!this._ready || this._syncingFromController) return;
    if (this.open && !this._popover.open) {
      if (!this._hasContent) {
        this._syncingFromController = true;
        this.open = false;
        this._syncingFromController = false;
        return;
      }
      this._popover.openPopover();
      return;
    }
    if (!this.open && (previousOpen || this._popover.open)) {
      this._popover.closePopover("api");
    }
  }

  private _emitOpenChange(open: boolean): void {
    this.dispatchEvent(
      new CustomEvent(open ? "vu-open" : "vu-close", {
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(
      new CustomEvent<VuTooltipOpenChangeDetail>("vu-open-change", {
        detail: { open },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _scheduleArrowOffsetSync(): void {
    if (!this.arrow) return;
    this._clearArrowSyncTimer();

    const sync = (): void => {
      this._syncArrowOffset();
    };

    requestAnimationFrame(sync);

    const ms = resolvePopoverDurationMs(
      this,
      "open",
      POPOVER_PRESET_DURATION_BASE.enter,
    );
    if (ms > 0) {
      this._arrowSyncTimer = setTimeout(sync, ms + 16);
    }
  }

  private _clearArrowSyncTimer(): void {
    if (this._arrowSyncTimer !== null) {
      clearTimeout(this._arrowSyncTimer);
      this._arrowSyncTimer = null;
    }
  }

  private _syncArrowOffset(): void {
    if (!this.arrow || !this.open) return;

    const trigger = this._triggerEl;
    const content = this._surfaceEl?.querySelector('[part="content"]') as
      | HTMLElement
      | null;
    if (!trigger || !content) return;

    const anchor = trigger.getBoundingClientRect();
    const panel = content.getBoundingClientRect();
    const hostStyles = getComputedStyle(this);
    const panelLeft =
      Number.parseFloat(hostStyles.getPropertyValue("--tooltip-left")) || 0;
    const panelTop =
      Number.parseFloat(hostStyles.getPropertyValue("--tooltip-top")) || 0;
    const side = this._popover.meta.place;
    const styles = getComputedStyle(this);
    const arrowBox =
      Number.parseFloat(styles.getPropertyValue("--tooltip-arrow-box")) || 8;
    const edgePad = Math.max(
      Number.parseFloat(styles.getPropertyValue("--tooltip-arrow-edge-pad")) || 12,
      arrowBox,
    );

    let offset = 0;
    if (side === "top" || side === "bottom") {
      offset = anchor.left + anchor.width / 2 - panelLeft;
      offset = Math.max(edgePad, Math.min(panel.width - edgePad, offset));
    } else {
      offset = anchor.top + anchor.height / 2 - panelTop;
      offset = Math.max(edgePad, Math.min(panel.height - edgePad, offset));
    }

    const next = `${offset}px`;
    if (this.style.getPropertyValue("--tooltip-arrow-offset") === next) return;
    this.style.setProperty("--tooltip-arrow-offset", next);
  }

  private _onViewportChange = (): void => {
    if (!this.open || !this.arrow) return;
    if (this._arrowViewportRaf) cancelAnimationFrame(this._arrowViewportRaf);
    this._arrowViewportRaf = requestAnimationFrame(() => {
      this._arrowViewportRaf = 0;
      this._syncArrowOffset();
    });
  };

  private _attachArrowViewportListeners(): void {
    if (this._viewportListeners || !isClient()) return;
    window.addEventListener("scroll", this._onViewportChange, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", this._onViewportChange, { passive: true });
    this._viewportListeners = true;
  }

  private _detachArrowViewportListeners(): void {
    if (!this._viewportListeners || !isClient()) return;
    window.removeEventListener("scroll", this._onViewportChange, true);
    window.removeEventListener("resize", this._onViewportChange);
    this._viewportListeners = false;
  }

  private _clearOpenTimer(): void {
    if (this._openTimer !== null) {
      clearTimeout(this._openTimer);
      this._openTimer = null;
    }
  }

  private _clearHideDelayTimer(): void {
    if (this._hideDelayTimer !== null) {
      clearTimeout(this._hideDelayTimer);
      this._hideDelayTimer = null;
    }
  }

  private _scheduleOpen(): void {
    if (this.noAutoTrigger) return;
    if (this.open || this._popover.open) {
      this._clearOpenTimer();
      return;
    }
    this._clearOpenTimer();
    const ms =
      this.delay !== undefined
        ? Math.max(0, this.delay)
        : readThemeTimeMs(this, "tooltip-delay", 1500);
    if (ms > 0) {
      this._openTimer = setTimeout(() => {
        this._openTimer = null;
        this.show();
      }, ms);
    } else {
      this.show();
    }
  }

  private _scheduleHideAfterLeave(): void {
    this._clearHideDelayTimer();
    const ms =
      this.closeDelay !== undefined
        ? Math.max(0, this.closeDelay)
        : readThemeTimeMs(this, "tooltip-close-delay", 500);
    if (ms > 0) {
      this._hideDelayTimer = setTimeout(() => {
        this._hideDelayTimer = null;
        this.hide();
      }, ms);
    } else {
      this.hide();
    }
  }

  private _pointerOpenTrigger(): boolean {
    return this.trigger === "hover" || this.trigger === "both";
  }

  private _clickOpenTrigger(): boolean {
    return this.trigger === "click" || this.trigger === "both";
  }

  private _onTriggerPointerEnter = (): void => {
    if (!this._pointerOpenTrigger()) return;
    this._clearHideDelayTimer();
    this._scheduleOpen();
  };

  private _onTriggerPointerLeave = (event: PointerEvent): void => {
    if (!this._pointerOpenTrigger()) return;
    const related = event.relatedTarget;
    if (
      this.interactive &&
      related instanceof Node &&
      this._surfaceEl?.contains(related)
    ) {
      return;
    }
    this._clearOpenTimer();
    this._scheduleHideAfterLeave();
  };

  private _onTriggerFocusIn = (): void => {
    if (!this._pointerOpenTrigger()) return;
    this._clearHideDelayTimer();
    this._scheduleOpen();
  };

  private _onTriggerFocusOut = (event: FocusEvent): void => {
    if (!this._pointerOpenTrigger()) return;
    const related = event.relatedTarget;
    if (
      this.interactive &&
      related instanceof Node &&
      this._surfaceEl?.contains(related)
    ) {
      return;
    }
    this._clearOpenTimer();
    this._scheduleHideAfterLeave();
  };

  private _onTriggerClick = (event: Event): void => {
    if (this.noAutoTrigger || !this._clickOpenTrigger()) return;
    const path = event.composedPath();
    const insideSurface = path.some(
      (node) =>
        node instanceof HTMLElement &&
        node.getAttribute("part")?.includes("content"),
    );
    if (insideSurface) {
      event.stopPropagation();
      return;
    }
    this.toggle();
  };

  private _onSurfacePointerLeave = (): void => {
    if (this.noAutoTrigger || !this.interactive || !this._pointerOpenTrigger()) {
      return;
    }
    this._scheduleHideAfterLeave();
  };

  private _stopContentClick = (event: Event): void => {
    event.stopPropagation();
  };

  override render() {
    return html`
      <div
        part="trigger"
        aria-describedby=${ifDefined(this._describedBy)}
        @pointerenter=${this._onTriggerPointerEnter}
        @pointerleave=${this._onTriggerPointerLeave}
        @focusin=${this._onTriggerFocusIn}
        @focusout=${this._onTriggerFocusOut}
        @click=${this._onTriggerClick}
      >
        <slot></slot>

        <div
          part="surface"
          popover="manual"
          id=${this._tooltipId}
          role="tooltip"
          aria-hidden=${ifDefined(this.open ? undefined : "true")}
          @toggle=${this._popover.onToggle}
          @pointerleave=${this._onSurfacePointerLeave}
        >
          <div part="content" @click=${this._stopContentClick}>
            <slot name="tooltip">${this.label}</slot>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-tooltip": VuTooltip;
  }
}
