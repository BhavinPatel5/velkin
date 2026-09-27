import { html, LitElement, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { isClient, isServer, canUseRaf } from "../internals/utils/env.js";
import { getNearestScrollParent } from "../internals/utils/scroll-parent.js";
import { appbarStyles } from "./appbar.style.js";
import type {
  VuAppbarPlacement,
  VuAppbarSize,
  VuAppbarTone,
  VuAppbarVariant,
} from "./appbar.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuAppbarPlacement,
  VuAppbarSize,
  VuAppbarTone,
  VuAppbarVariant,
} from "./appbar.types.js";

/** Min scroll-delta (px) to react to — filters out trackpad jitter. */
const SCROLL_DELTA_THRESHOLD = 8;

/** Don't auto-hide until the user has scrolled at least this far from the top. */
const SCROLL_HIDE_FLOOR = 80;

/**
 * @element vu-appbar
 *
 * @summary An application bar component with start, center, and end slots.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/appbar
 *
 * @slot start - Leading content; hidden when empty.
 * @slot - Center content; hidden when empty.
 * @slot end - Trailing content; hidden when empty.
 *
 * @property {VuAppbarVariant} variant - Surface paint recipe. Default: `"flat"`.
 * @property {VuAppbarTone} tone - Neutral surface weight. Default: `"normal"`.
 * @property {VuAppbarSize} size - Padding, gap, and bar height. Default: `"md"`.
 * @property {VuAppbarPlacement} placement - Pin to top or bottom when `sticky`. Default: `"top"`.
 * @property {boolean} sticky - Pins via `position: sticky`. Default: `false`.
 * @property {boolean} condense - Elevates the bar after scroll when `sticky`. Default: `false`.
 * @property {boolean} autohide - Hides on scroll-down, reveals on scroll-up (nearest scrollport or window). Default: `false`.
 *
 * @csspart bar - Outer paint surface.
 * @csspart container - Inner layout row.
 * @csspart start - Leading slot wrapper.
 * @csspart body - Center slot wrapper.
 * @csspart end - Trailing slot wrapper.
 *
 * @cssproperty --appbar-bg - Surface background.
 * @cssproperty --appbar-fg - Surface text color.
 * @cssproperty --appbar-py - Block padding.
 * @cssproperty --appbar-px - Inline padding.
 * @cssproperty --appbar-gap - Gap between and within zones.
 * @cssproperty --appbar-border - Border shorthand.
 * @cssproperty --appbar-shadow - Surface shadow.
 * @cssproperty --appbar-min-block-size - Minimum bar height.
 * @cssproperty --appbar-control-size - Recommended slotted icon-action hit target.
 * @cssproperty --appbar-control-icon-size - Recommended slotted icon glyph size.
 * @cssproperty --appbar-content-max-inline-size - Max width for centered content.
 * @cssproperty --appbar-offset-top - Sticky top inset.
 * @cssproperty --appbar-offset-bottom - Sticky bottom inset.
 */
@customElement("vu-appbar")
@withComponentPresets
export class VuAppbar extends LitElement {
  static override styles = appbarStyles;

  /** Surface paint recipe. */
  @property({ type: String, reflect: true })
  variant: VuAppbarVariant = "flat";

  /** Neutral surface weight. */
  @property({ type: String, reflect: true })
  tone: VuAppbarTone = "normal";

  /** Padding, gap, and bar height. */
  @property({ type: String, reflect: true })
  size: VuAppbarSize = "md";

  /** Pin to top or bottom when `sticky`. */
  @property({ type: String, reflect: true })
  placement: VuAppbarPlacement = "top";

  /** Pins via `position: sticky`. */
  @property({ type: Boolean, reflect: true })
  sticky = false;

  /** Elevates the bar after scroll when `sticky` (nearest scrollport or viewport). */
  @property({ type: Boolean, reflect: true })
  condense = false;

  /** Hides on scroll-down, reveals on scroll-up (nearest scrollport or window). */
  @property({ type: Boolean, reflect: true })
  autohide = false;

  /** True once the IntersectionObserver reports the host has scrolled past its natural position. */
  @state()
  private _isStuck = false;

  /** True while autohide has slid the surface out of view; reset on scroll-up. */
  @state()
  private _isHidden = false;

  /** Live observer for the 'is-stuck' detection; rebuilt when sticky/placement/condense flips. */
  private _stickyObserver: IntersectionObserver | null = null;

  /** Nearest overflow scrollport, or null when the viewport / window is the scroll root. */
  private _scrollRoot: HTMLElement | null = null;

  /** EventTarget currently holding the scroll listener (element or window). */
  private _scrollTarget: EventTarget | null = null;

  /** Last observed scroll offset — used to compute scroll direction for autohide. */
  private _lastScrollY = 0;

  /** Throttle flag for the rAF-batched scroll handler. */
  private _scrollFrame: number | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    if (isServer) return;
    this._bindScrollListener();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (isServer) return;
    this._unbindScrollListener();
    if (this._scrollFrame !== null) cancelAnimationFrame(this._scrollFrame);
    this._scrollFrame = null;
    this._teardownStickyObserver();
  }

  override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("autohide") && !this.autohide) {
      this._isHidden = false;
    }
  }

  override firstUpdated(changed: PropertyValues<this>): void {
    super.firstUpdated(changed);
    if (this.sticky && this.condense) this._setupStickyObserver();
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has("sticky") || changed.has("condense") || changed.has("placement")) {
      this._teardownStickyObserver();
      if (this.sticky && this.condense) this._setupStickyObserver();
    }
    if (changed.has("autohide") && isClient()) {
      this._bindScrollListener();
    }
  }

  /** Visibility intent — autohide must be on for the scroll-tracked '_isHidden' state to actually hide the bar. */
  private get _effectivelyHidden(): boolean {
    return this.autohide && this._isHidden;
  }

  private _readScrollY(): number {
    return this._scrollRoot ? this._scrollRoot.scrollTop : window.scrollY;
  }

  private _bindScrollListener(): void {
    this._unbindScrollListener();
    if (!isClient()) return;
    this._scrollRoot = getNearestScrollParent(this);
    this._scrollTarget = this._scrollRoot ?? window;
    this._lastScrollY = this._readScrollY();
    this._scrollTarget.addEventListener("scroll", this._onScroll, { passive: true });
  }

  private _unbindScrollListener(): void {
    this._scrollTarget?.removeEventListener("scroll", this._onScroll);
    this._scrollTarget = null;
  }

  /** Wires an IntersectionObserver that flips `_isStuck` when the host pins to its scrollport edge. */
  private _setupStickyObserver(): void {
    if (!isClient() || typeof IntersectionObserver === "undefined") return;
    const root = getNearestScrollParent(this);
    const rootMargin = this.placement === "bottom" ? "0px 0px -1px 0px" : "-1px 0px 0px 0px";
    this._stickyObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        this._isStuck = entry.intersectionRatio < 1;
      },
      { threshold: [1], rootMargin, root },
    );
    this._stickyObserver.observe(this);
  }

  private _teardownStickyObserver(): void {
    this._stickyObserver?.disconnect();
    this._stickyObserver = null;
    this._isStuck = false;
  }

  private _onScroll = (): void => {
    if (!this.autohide || !canUseRaf()) return;
    if (this._scrollFrame !== null) return;
    this._scrollFrame = requestAnimationFrame(() => {
      this._scrollFrame = null;
      this._evaluateAutohide();
    });
  };

  /** Direction-tracked autohide; ignores small jitter and floors at SCROLL_HIDE_FLOOR. */
  private _evaluateAutohide(): void {
    const y = this._readScrollY();
    const dy = y - this._lastScrollY;
    if (Math.abs(dy) < SCROLL_DELTA_THRESHOLD) return;
    if (dy > 0 && y > SCROLL_HIDE_FLOOR) {
      this._isHidden = true;
    } else if (dy < 0) {
      this._isHidden = false;
    }
    this._lastScrollY = y;
  }

  override render() {
    const barClasses = classMap({
      "is-stuck": this._isStuck,
      "is-hidden": this._effectivelyHidden,
    });
    return html`
      <div part="bar" class=${barClasses}>
        <div part="container">
          <div part="start">
            <slot name="start"></slot>
          </div>
          <div part="body">
            <slot></slot>
          </div>
          <div part="end">
            <slot name="end"></slot>
          </div>
        </div>
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "vu-appbar": VuAppbar;
  }
}
