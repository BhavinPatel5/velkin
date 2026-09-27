import { localized } from "@lit/localize";
import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { msg, str } from "../internals/utils/localize.js";
import { devWarnOnceForHost } from "../internals/utils/dev-warn.js";
import { VuCarouselItem } from "../carousel-item/carousel-item.js";
import { VuIcon } from "../icon/icon.js";
import { carouselStyles } from "./carousel.style.js";
import {
  connectCarouselAutoplay,
  createCarouselAutoplayState,
  disconnectCarouselAutoplay,
  onCarouselFocusIn,
  onCarouselFocusOut,
  onCarouselMouseEnter,
  onCarouselMouseLeave,
  reconcileCarouselAutoplay,
  type CarouselAutoplayHost,
} from "./internals/carousel-autoplay.js";
import {
  renderCarouselArrows,
  renderCarouselDots,
  renderCarouselLive,
  type CarouselControlsRenderContext,
} from "./internals/carousel-controls.render.js";
import {
  onCarouselPointerCancel,
  onCarouselPointerDown,
  onCarouselPointerMove,
  onCarouselPointerUp,
  syncCarouselDragTransform,
  type CarouselDragHost,
} from "./internals/carousel-drag.js";
import {
  getCarouselItems,
  isCarouselDragControlTarget,
  syncCarouselItems,
} from "./internals/carousel-slides.js";
import type {
  VuCarouselChangeDetail,
  VuCarouselControls,
  VuCarouselGap,
  VuCarouselOrientation,
} from "./carousel.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuCarouselChangeDetail,
  VuCarouselControls,
  VuCarouselGap,
  VuCarouselOrientation,
} from "./carousel.types.js";

/**
 * @element vu-carousel
 *
 * @summary A slide carousel component with navigation, drag, and autoplay.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/carousel
 * @dependency vu-icon
 * @dependency vu-carousel-item
 *
 * @slot - Default slot for `<vu-carousel-item>` slides. The parent relays slide ARIA (`role="group"`, roledescription, "N of M" / item `label`, `inert` / `aria-hidden` when offscreen).
 * @slot prev-icon - Optional override for the previous-arrow icon. Defaults to a chevron.
 * @slot next-icon - Optional override for the next-arrow icon. Defaults to a chevron.
 *
 * @csspart base - Outer wrapper containing viewport and controls.
 * @csspart viewport - The clipping container; slides translate within this.
 * @csspart track - The flex container that translates by `--carousel-index`.
 * @csspart prev - The previous-slide button.
 * @csspart next - The next-slide button.
 * @csspart dots - The container for dot indicators.
 * @csspart dot - Each dot indicator (a real `<button>`).
 * @csspart dot-active - Added to the active dot (for `::part(dot-active)` styling).
 * @csspart live - The visually-hidden live region announcing the current slide.
 * @csspart loading - The loading overlay shown when `loading` is true.
 * @csspart spinner - The spinner inside the loading overlay.
 *
 * @cssproperty --carousel-gap - Resolved gap between slides. Override per-host to bypass the `gap` preset.
 * @cssproperty --carousel-duration - Slide-transition duration (default `--vu-duration-slow`).
 * @cssproperty --carousel-easing - Slide-transition easing (default `--vu-ease-out-fluid`).
 *
 * @fires {CustomEvent<VuCarouselChangeDetail>} vu-change - Active slide index changed (API, click, drag, keyboard, or autoplay).
 *
 * Composition: slot `<vu-carousel-item>` children as slides. The component handles layout (flex track + per-slide flex-basis), translation (CSS `transform` driven by `--carousel-index`), drag (pointer events with capture, snaps on threshold), autoplay (auto-pauses on hover, focus-within, when offscreen, when reduced-motion is set), and ARIA (region/slide labels, live region, dot tablist semantics).
 *
 * Layout: `slidesPerView` and `gap` together determine each slide's flex-basis: `(100% - (slidesPerView - 1) * gap) / slidesPerView`. The track translates by `index * (basis + gap)` — one transform handles every (slides, gap, direction) combination. Vertical orientation flips the axis; consumers must give the host a `block-size` so there's a viewport to clip against. `<vu-carousel-item>` fills each vertical slice automatically.
 *
 * Accessibility (per WAI-ARIA APG carousel pattern): host carries `role="region"` and `aria-roledescription="carousel"`; pass `label` to set the accessible name (e.g., "Featured products"). Each `<vu-carousel-item>` gets `role="group"`, `aria-roledescription="slide"`, `aria-label` from item `label` or "N of M", and `inert` + `aria-hidden` when offscreen. Dots are real `<button>` elements with `aria-current="true"` on the active one. A visually-hidden live region (`aria-live="polite"`) announces the current slide on change. Keyboard: ArrowLeft / ArrowRight (or ArrowUp / ArrowDown for vertical) move; Home / End jump to first / last. Autoplay pauses on hover, focus-within, when the carousel scrolls offscreen, and when `prefers-reduced-motion: reduce` is set.
 */
@localized()
@customElement("vu-carousel")
@withComponentPresets
export class VuCarousel extends LitElement implements CarouselAutoplayHost, CarouselDragHost {
  static override styles = carouselStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
    "vu-carousel-item": VuCarouselItem,
  };

  /** Active slide index (zero-based). Reflected so consumers can drive it from outside via `index` attribute. */
  @property({ type: Number, reflect: true })
  index = 0;

  /** How many slides are visible at once. */
  @property({ type: Number })
  slidesPerView = 1;

  /** How many slides advance per `next()` / `prev()` / dot click. */
  @property({ type: Number })
  slidesToScroll = 1;

  /** Wraps around at the end / start instead of stopping. When `false` (default), navigation stops at the edges and arrow buttons get `disabled`. */
  @property({ type: Boolean, reflect: true })
  loop = false;

  /** Auto-rotates through slides. Off by default — auto-rotation is hostile UX without an explicit ask. Respects `prefers-reduced-motion: reduce` (treated as off). */
  @property({ type: Boolean, reflect: true })
  autoplay = false;

  /** Milliseconds between autoplay advances. */
  @property({ type: Number })
  interval = 5000;

  /** Pause autoplay while the pointer is over the carousel. Focus-within always pauses regardless of this flag (a11y requirement). */
  @property({ type: Boolean })
  pauseOnHover = true;

  /** Which navigation affordances render. */
  @property({ type: String, reflect: true })
  controls: VuCarouselControls = "dots";

  /** Gap between slides. */
  @property({ type: String, reflect: true })
  gap: VuCarouselGap = "none";

  /** Layout axis. `vertical` requires a host `block-size` so the viewport has something to clip against. */
  @property({ type: String, reflect: true })
  orientation: VuCarouselOrientation = "horizontal";

  /** Accessible name for the carousel — required by the WAI-ARIA carousel pattern (the screen reader needs to know the *purpose* of the carousel). */
  @property({ type: String })
  label = "";

  /** Previous control name; empty uses the locale catalog. */
  @property({ type: String })
  prevLabel = "";

  /** Next control name; empty uses the locale catalog. */
  @property({ type: String })
  nextLabel = "";

  /** Dot tablist name; empty uses the locale catalog. */
  @property({ type: String })
  dotsLabel = "";

  /** Show a loading overlay (spinner + dimmed surface) and mark the host `aria-busy`. */
  @property({ type: Boolean, reflect: true })
  loading = false;

  /** Number of slides assigned to the default slot — derived, not user-set. */
  @state()
  private _slideCount = 0;

  /** True while the user is actively dragging — used for both visual (no transition) and to suppress click-through on bullets. */
  @state()
  _isDragging = false;

  /** Pixel offset added to the track during drag, on top of the index-based transform. */
  @state()
  _dragOffset = 0;

  @query("slot:not([name])")
  private _slot!: HTMLSlotElement | null;

  @query('[part="track"]')
  private _track!: HTMLElement | null;

  @query('[part="viewport"]')
  _viewport!: HTMLElement | null;

  private _autoplay = createCarouselAutoplayState();

  /** Latched once the no-label dev warning has fired so we don't spam the console on every render. */
  _dragStartX = 0;
  _dragStartY = 0;
  _dragPointerId: number | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("keydown", this._onKeydown);
    connectCarouselAutoplay(
      this,
      this._autoplay,
      this._onReducedMotion,
      this._onVisibilityChange,
    );
  }

  override disconnectedCallback(): void {
    this.removeEventListener("keydown", this._onKeydown);
    disconnectCarouselAutoplay(
      this._autoplay,
      this._onReducedMotion,
      this._onVisibilityChange,
    );
    super.disconnectedCallback();
  }

  override firstUpdated(): void {
    queueMicrotask(() => this._syncSlides());
  }

  override updated(changed: PropertyValues): void {
    if (changed.has("index") || changed.has("slidesPerView")) {
      this.style.setProperty("--carousel-index", String(this.clampedIndex));
      this.style.setProperty("--carousel-slides-per-view", String(this.slidesPerView));
    }
    /* Relay every update so @localized() locale swaps refresh slide labels. */
    if (this._slideCount > 0) {
      this._syncItems();
    }
    if (changed.has("_isDragging") || changed.has("_dragOffset")) {
      syncCarouselDragTransform(this, this._track);
    }
    if (changed.has("_isDragging")) {
      this.toggleAttribute("dragging", this._isDragging);
    }
    this._applyHostA11y();
    if (
      changed.has("autoplay") ||
      changed.has("interval") ||
      changed.has("loop") ||
      changed.has("slidesPerView")
    ) {
      reconcileCarouselAutoplay(this._autoplay, this);
    }
  }

  private get _maxIndex(): number {
    return Math.max(0, this._slideCount - this.slidesPerView);
  }

  get clampedIndex(): number {
    return Math.max(0, Math.min(this.index, this._maxIndex));
  }

  get maxIndex(): number {
    return this._maxIndex;
  }

  get isStatic(): boolean {
    return this._slideCount <= this.slidesPerView;
  }

  next(): void {
    if (this.isStatic) return;
    const next = this.clampedIndex + this.slidesToScroll;
    const target = next > this._maxIndex ? (this.loop ? 0 : this._maxIndex) : next;
    this._setIndex(target);
  }

  prev(): void {
    if (this.isStatic) return;
    const prev = this.clampedIndex - this.slidesToScroll;
    const target = prev < 0 ? (this.loop ? this._maxIndex : 0) : prev;
    this._setIndex(target);
  }

  goTo(target: number): void {
    if (this.isStatic) return;
    this._setIndex(Math.max(0, Math.min(target, this._maxIndex)));
  }

  play(): void {
    this.autoplay = true;
  }

  pause(): void {
    this.autoplay = false;
  }

  private _setIndex(value: number): void {
    const previous = this.index;
    if (value === previous) return;
    this.index = value;
    this.dispatchEvent(
      new CustomEvent<VuCarouselChangeDetail>("vu-change", {
        detail: { index: value, previous },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onSlotChange = (): void => {
    this._syncSlides();
  };

  private _slideAriaLabel(index: number, total: number): string {
    return String(
      msg(str`${index + 1} of ${total}`, {
        desc: "Carousel slide position announced on each slide.",
      }),
    );
  }

  private _syncSlides(): void {
    const items = getCarouselItems(this._slot);
    this._slideCount = items.length;
    this._syncItems();
  }

  private _syncItems(): void {
    const items = getCarouselItems(this._slot);
    const slideRole = String(
      msg("slide", { desc: "ARIA role description for a carousel slide." }),
    );
    syncCarouselItems(items, {
      slideRole,
      positionLabel: (i, total) => this._slideAriaLabel(i, total),
      start: this.clampedIndex,
      end: this.clampedIndex + this.slidesPerView,
      orientation: this.orientation,
    });
  }

  private _onReducedMotion = (): void => {
    reconcileCarouselAutoplay(this._autoplay, this);
  };

  private _onVisibilityChange = (): void => {
    reconcileCarouselAutoplay(this._autoplay, this);
  };

  private _onMouseEnter = (): void => {
    onCarouselMouseEnter(this._autoplay, this);
  };

  private _onMouseLeave = (): void => {
    onCarouselMouseLeave(this._autoplay, this);
  };

  private _onFocusIn = (): void => {
    onCarouselFocusIn(this._autoplay, this);
  };

  private _onFocusOut = (event: FocusEvent): void => {
    onCarouselFocusOut(this._autoplay, this, event.relatedTarget, (node) =>
      this.contains(node),
    );
  };

  private _onKeydown = (event: KeyboardEvent): void => {
    const target = event.target as HTMLElement | null;
    const isFormField =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target?.isContentEditable;
    if (isFormField) return;

    const isHorizontal = this.orientation === "horizontal";
    const prevKeys = isHorizontal ? ["ArrowLeft"] : ["ArrowUp"];
    const nextKeys = isHorizontal ? ["ArrowRight"] : ["ArrowDown"];

    if (prevKeys.includes(event.key)) {
      event.preventDefault();
      this.prev();
    } else if (nextKeys.includes(event.key)) {
      event.preventDefault();
      this.next();
    } else if (event.key === "Home") {
      event.preventDefault();
      this.goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      this.goTo(this._maxIndex);
    }
  };

  private _onPointerDown = (event: PointerEvent): void => {
    onCarouselPointerDown(this, event, isCarouselDragControlTarget);
  };

  private _onPointerMove = (event: PointerEvent): void => {
    onCarouselPointerMove(this, event);
  };

  private _onPointerUp = (event: PointerEvent): void => {
    onCarouselPointerUp(this, event);
  };

  private _onPointerCancel = (event: PointerEvent): void => {
    onCarouselPointerCancel(this, event);
  };

  private _controlsContext(): CarouselControlsRenderContext {
    return {
      controls: this.controls,
      orientation: this.orientation,
      index: this.clampedIndex,
      maxIndex: this._maxIndex,
      loop: this.loop,
      slidesPerView: this.slidesPerView,
      slidesToScroll: this.slidesToScroll,
      slideCount: this._slideCount,
      isStatic: this.isStatic,
      loading: this.loading,
      prevLabel: this.prevLabel,
      nextLabel: this.nextLabel,
      dotsLabel: this.dotsLabel,
      prev: () => this.prev(),
      next: () => this.next(),
      goTo: (target) => this.goTo(target),
    };
  }

  override render() {
    const ctx = this._controlsContext();
    return html`
      <div
        part="base"
        @mouseenter=${this._onMouseEnter}
        @mouseleave=${this._onMouseLeave}
        @focusin=${this._onFocusIn}
        @focusout=${this._onFocusOut}
      >
        <div
          part="viewport"
          @pointerdown=${this._onPointerDown}
          @pointermove=${this._onPointerMove}
          @pointerup=${this._onPointerUp}
          @pointercancel=${this._onPointerCancel}
        >
          <div part="track">
            <slot @slotchange=${this._onSlotChange}></slot>
          </div>
          ${renderCarouselArrows(ctx)}
          ${this.loading
            ? html`
                <div part="loading" aria-hidden="true">
                  <div part="spinner"></div>
                </div>
              `
            : nothing}
        </div>
        ${renderCarouselDots(ctx)}
        ${renderCarouselLive(ctx)}
      </div>
    `;
  }

  private _applyHostA11y(): void {
    const trimmedLabel = this.label.trim();
    const consumerSetRole = this.hasAttribute("role");
    if (!consumerSetRole) {
      this.setAttribute("role", trimmedLabel ? "region" : "group");
    }
    if (!this.hasAttribute("aria-roledescription")) {
      this.setAttribute(
        "aria-roledescription",
        String(msg("carousel", { desc: "ARIA role description for a carousel." })),
      );
    }
    if (trimmedLabel) {
      this.setAttribute("aria-label", trimmedLabel);
    } else {
      this.removeAttribute("aria-label");
      if (!consumerSetRole) {
        devWarnOnceForHost(
          this,
          "missing-label",
          "<vu-carousel> is missing the `label` property. The WAI-ARIA carousel pattern requires an accessible name. Without one the carousel is downgraded to role='group' for AT.",
        );
      }
    }
    if (this.loading) {
      this.setAttribute("aria-busy", "true");
    } else {
      this.removeAttribute("aria-busy");
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-carousel": VuCarousel;
  }
}
