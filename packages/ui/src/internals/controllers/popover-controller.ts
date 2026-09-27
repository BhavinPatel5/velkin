import type { ReactiveController, ReactiveControllerHost } from "lit";
import {
  motionDurationMs,
  prefersReducedMotion,
  readMotionEasing,
  resolvePopoverDurationMs,
  resolvePopoverEasing,
  POPOVER_PRESET_DURATION_BASE,
} from "../utils/motion.js";
import { devWarnWaapiCssConflict } from "../utils/dev-warn.js";
import { POPOVER_PRESET_REGISTRY } from "./popover-presets.js";

export type PopoverSide = "top" | "bottom" | "left" | "right";
export type PopoverPlacement = PopoverSide | "auto";
export type PopoverAlign = "start" | "center" | "end";
export type MaxWidthMode = "cap" | "fill";
export type CloseReason = "api" | "toggle" | "escape" | "light-dismiss" | "group";
type ArrowAlign = "center" | "start" | "end";
type ScrollContainerMode = "auto" | "window";

/** ✅ Presets: consumer only names it */
export type PopoverPreset =
  | "none"
  | "fade"
  | "scale"
  | "slide"
  | "iosMenu"
  | "iosSheet"
  | "materialMenu"
  | "materialSheet"
  | "floaty"
  | "soft"
  | "sharp"
  | "blurIn"
  | "blurFade"
  | "zoomFromAnchor"
  | "zoomFromCorner"
  | "flip3d"
  | "card3d"
  | "tilt3d"
  | "depth3d"
  | "rotate3d"
  | "springy"
  | "bouncy"
  | "glide"
  | "pop"
  | "drop"
  | "grow";

export type PopoverPresetConfig = {
  enterPx?: number;      // translate distance
  exitPx?: number;
  enterScale?: number;
  exitScale?: number;
  blurInPx?: number;
  blurOutPx?: number;
  perspectivePx?: number;
  rotateDeg?: number;    // 3d rotation magnitude
  tiltDeg?: number;      // 3d tilt magnitude
  origin?: "auto" | "anchor" | "center" | "corner";
  easingOpen?: string;
  easingClose?: string;
  enterDuration?: number;
  exitDuration?: number;
};

type PresetDef = {
  name: PopoverPreset;
  defaults: Required<PopoverPresetConfig>;
  getKeyframes: (
    args: {
      side: PopoverSide;
      phase: "open" | "close";
      cfg: Required<PopoverPresetConfig>;
      origin: string;
    }
  ) => Keyframe[];
};

export interface PopoverControllerOptions {
  // Required functions
  getAnchor: () => HTMLElement | null;
  getPopover: () => HTMLElement | null;

  // CSS variable names
  cssVarLeft?: string;
  cssVarTop?: string;
  cssVarWidth?: string;

  // ---------- Reactive Property Getters ----------
  // (Preferred - automatically update when component properties change)
  getPlacement?: () => PopoverPlacement;
  getAlign?: () => PopoverAlign;
  getGap?: () => number;
  /** Viewport edge inset (px) for flip/clamp math — not the popover element's CSS padding. */
  getPadding?: () => number;
  getMatchAnchorWidth?: () => boolean;
  getMaxWidthToViewport?: () => boolean;
  getMaxWidthMode?: () => MaxWidthMode;
  getFlip?: () => boolean;
  getFlipOrder?: () => PopoverSide[];
  /** When false, positions as a viewport bottom sheet instead of anchoring to the trigger. */
  getAnchorPosition?: () => boolean;
  getPreset?: () => PopoverPreset;
  getDuration?: () => number;
  getCloseDuration?: () => number;
  getAnimateReposition?: () => boolean;
  getRepositionMs?: () => number;
  getCloseOnEscape?: () => boolean;
  /** When false, Escape closes while open even if focus is outside anchor/popover (hover tooltips). */
  getEscapeRequiresFocus?: () => boolean;
  getRestoreFocusOnClose?: () => boolean;
  getCloseOnOutside?: () => boolean;
  getIgnoreOutsideSelector?: () => string;
  getIgnoreOutsideAttr?: () => string;

  // ---------- Static Fallback Values ----------
  // (For backward compatibility or when values don't change)
  placement?: PopoverPlacement;
  align?: PopoverAlign;
  gap?: number;
  /** Viewport edge inset (px) for flip/clamp math — not the popover element's CSS padding. */
  padding?: number;
  matchAnchorWidth?: boolean;
  maxWidthToViewport?: boolean;
  maxWidthMode?: MaxWidthMode;
  flip?: boolean;
  flipOrder?: PopoverSide[];
  anchorPosition?: boolean;
  preset?: PopoverPreset;
  duration?: number;
  closeDuration?: number;
  animateReposition?: boolean;
  repositionMs?: number;
  closeOnEscape?: boolean;
  escapeRequiresFocus?: boolean;
  restoreFocusOnClose?: boolean;
  closeOnOutside?: boolean;
  ignoreOutsideSelector?: string;
  ignoreOutsideAttr?: string;

  // ---------- Scroll and Focus ----------
  focusOnOpen?: () => void;
  scrollContainer?: ScrollContainerMode | HTMLElement;

  // ---------- Group Behavior ----------
  groupEventName?: string;
  groupId?: unknown;

  // ---------- Callbacks ----------
  onOpenChange?: (open: boolean, meta: { reason: CloseReason }) => void;

  // ---------- Other Options ----------
  sideAttr?: string;
  respectReducedMotion?: boolean;
}

/**
 * PopoverController with Reactive Getter Bindings
 * - Automatically reads latest values from host component via getter functions
 * - No manual updates needed when host properties change
 * - WAAPI preset animations with side-aware enter/exit
 * - Smooth reposition animation on flip/move
 */
export class PopoverController implements ReactiveController {
  private host: ReactiveControllerHost;
  private _open = false;

  private raf = 0;

  private anchorRO?: ResizeObserver;
  private popoverRO?: ResizeObserver;

  private boundScrollParents: Array<{ el: EventTarget; fn: EventListener }> = [];
  private visualViewport?: VisualViewport;
  /** When true, global listeners and observers are attached (deferred until first open for perf with many instances). */
  private _listenersAttached = false;

  private lastCloseReason: CloseReason = "toggle";
  private lastFocusedEl: Element | null = null;

  private hasEverOpened = false;
  private _skipNextReposition = false;

  private lastMeta: { place: PopoverSide; arrowAlign: ArrowAlign } = {
    place: "bottom",
    arrowAlign: "center",
  };

  /** `:popover-open` is unsupported in some test runtimes (e.g. jsdom). */
  private static _matchesPopoverOpen(pop: HTMLElement): boolean {
    try {
      return pop.matches(":popover-open");
    } catch {
      return false;
    }
  }

  private _phase: "idle" | "opening" | "open" | "closing" = "idle";
  private presetAnim?: Animation;
  private moveAnim?: Animation;

  // Helper to create getters with fallback to static values
  private static createGetter<T>(
    getter: (() => T) | undefined,
    staticValue: T | undefined,
    defaultValue: T
  ): () => T {
    return getter || (() => staticValue ?? defaultValue);
  }

  private opts: {
    // Required functions
    getAnchor: () => HTMLElement | null;
    getPopover: () => HTMLElement | null;

    // Reactive property getters
    getPlacement: () => PopoverPlacement;
    getAlign: () => PopoverAlign;
    getGap: () => number;
    getPadding: () => number;
    getMatchAnchorWidth: () => boolean;
    getMaxWidthToViewport: () => boolean;
    getMaxWidthMode: () => MaxWidthMode;
    getFlip: () => boolean;
    getFlipOrder: () => PopoverSide[];
    getAnchorPosition: () => boolean;
    getPreset: () => PopoverPreset;
    getDuration: () => number;
    getCloseDuration: () => number;
    getAnimateReposition: () => boolean;
    getRepositionMs: () => number;
    getCloseOnEscape: () => boolean;
    getEscapeRequiresFocus: () => boolean;
    getRestoreFocusOnClose: () => boolean;
    getCloseOnOutside: () => boolean;
    getIgnoreOutsideSelector: () => string;
    getIgnoreOutsideAttr: () => string;

    // Other options
    cssVarLeft: string;
    cssVarTop: string;
    cssVarWidth: string;
    focusOnOpen?: () => void;
    scrollContainer: ScrollContainerMode | HTMLElement;
    groupEventName?: string;
    groupId?: unknown;
    onOpenChange?: (open: boolean, meta: { reason: CloseReason }) => void;
    sideAttr: string;
    respectReducedMotion: boolean;
  };

  constructor(host: ReactiveControllerHost, options: PopoverControllerOptions) {
    this.host = host;
    host.addController(this);

    // Initialize getters with fallback values
    const dur = options.duration ?? 220;
    const closeDur = options.closeDuration ?? Math.min(180, dur);

    this.opts = {
      // Required functions
      getAnchor: options.getAnchor,
      getPopover: options.getPopover,

      // Reactive property getters
      getPlacement: PopoverController.createGetter(
        options.getPlacement,
        options.placement,
        "auto"
      ),
      getAlign: PopoverController.createGetter(
        options.getAlign,
        options.align,
        "start"
      ),
      getGap: PopoverController.createGetter(
        options.getGap,
        options.gap,
        6
      ),
      getPadding: PopoverController.createGetter(
        options.getPadding,
        options.padding,
        8
      ),
      getMatchAnchorWidth: PopoverController.createGetter(
        options.getMatchAnchorWidth,
        options.matchAnchorWidth,
        true
      ),
      getMaxWidthToViewport: PopoverController.createGetter(
        options.getMaxWidthToViewport,
        options.maxWidthToViewport,
        true
      ),
      getMaxWidthMode: PopoverController.createGetter(
        options.getMaxWidthMode,
        options.maxWidthMode,
        "cap"
      ),
      getFlip: PopoverController.createGetter(
        options.getFlip,
        options.flip,
        true
      ),
      getFlipOrder: PopoverController.createGetter(
        options.getFlipOrder,
        options.flipOrder,
        []
      ),
      getAnchorPosition: PopoverController.createGetter(
        options.getAnchorPosition,
        options.anchorPosition,
        true,
      ),
      getPreset: PopoverController.createGetter(
        options.getPreset,
        options.preset,
        "slide"
      ),
      getDuration: PopoverController.createGetter(
        options.getDuration,
        options.duration,
        dur
      ),
      getCloseDuration: PopoverController.createGetter(
        options.getCloseDuration,
        options.closeDuration,
        closeDur
      ),
      getAnimateReposition: PopoverController.createGetter(
        options.getAnimateReposition,
        options.animateReposition,
        true
      ),
      getRepositionMs: PopoverController.createGetter(
        options.getRepositionMs,
        options.repositionMs,
        160
      ),
      getCloseOnEscape: PopoverController.createGetter(
        options.getCloseOnEscape,
        options.closeOnEscape,
        true
      ),
      getEscapeRequiresFocus: PopoverController.createGetter(
        options.getEscapeRequiresFocus,
        options.escapeRequiresFocus,
        true
      ),
      getCloseOnOutside: PopoverController.createGetter(
        options.getCloseOnOutside,
        options.closeOnOutside,
        false
      ),

      getIgnoreOutsideSelector: PopoverController.createGetter(
        options.getIgnoreOutsideSelector,
        options.ignoreOutsideSelector,
        "" // none by default
      ),

      getIgnoreOutsideAttr: PopoverController.createGetter(
        options.getIgnoreOutsideAttr,
        options.ignoreOutsideAttr,
        "data-popover-ignore-outside"
      ),
      getRestoreFocusOnClose: PopoverController.createGetter(
        options.getRestoreFocusOnClose,
        options.restoreFocusOnClose,
        true
      ),

      // Physical viewport coords (getBoundingClientRect); bind with CSS `left`/`top`, not logical insets.
      cssVarLeft: options.cssVarLeft ?? "--vu-pop-left",
      cssVarTop: options.cssVarTop ?? "--vu-pop-top",
      cssVarWidth: options.cssVarWidth ?? "--vu-pop-width",
      focusOnOpen: options.focusOnOpen,
      scrollContainer: options.scrollContainer ?? "auto",
      groupEventName: options.groupEventName,
      groupId: options.groupId,
      onOpenChange: options.onOpenChange,
      sideAttr: options.sideAttr ?? "data-side",
      respectReducedMotion: options.respectReducedMotion ?? true,
    };
  }

  get open() {
    return this._open;
  }

  get meta() {
    return this.lastMeta;
  }

  /* -------------------------------- Lifecycle -------------------------------- */

  hostConnected() {
    if (typeof window === "undefined") return;
    this.visualViewport = window.visualViewport ?? undefined;
    // Defer global listeners and observers until first open (avoids N×listeners with many instances, e.g. combobox in every flow node).
  }

  hostDisconnected() {
    this.detachGlobalListenersIfAttached();
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  /** Attach window/document listeners and observers. Called on first open. */
  private attachGlobalListeners() {
    if (typeof window === "undefined" || this._listenersAttached) return;
    this._listenersAttached = true;

    if (this.visualViewport) {
      this.visualViewport.addEventListener("resize", this.onViewportMove, { passive: true });
      this.visualViewport.addEventListener("scroll", this.onViewportMove, { passive: true });
    }
    window.addEventListener("resize", this.onViewportMove, { passive: true });
    window.addEventListener("scroll", this.onViewportMove, { passive: true, capture: true });

    if (this.opts.groupEventName) {
      window.addEventListener(this.opts.groupEventName, this.onGroupOpen as EventListener);
    }
    if (this.opts.getCloseOnEscape()) {
      window.addEventListener("keydown", this.onKeydown, true);
    }
    document.addEventListener("pointerdown", this.onDocumentPointerDown, true);

    this.setupObserversAndScrollParents();
  }

  /** Remove window/document listeners and observers. Called on close and on hostDisconnected. */
  private detachGlobalListenersIfAttached() {
    if (!this._listenersAttached) return;
    this._listenersAttached = false;

    if (typeof window !== "undefined") {
      window.removeEventListener("resize", this.onViewportMove);
      window.removeEventListener("scroll", this.onViewportMove, true);
      if (this.visualViewport) {
        this.visualViewport.removeEventListener("resize", this.onViewportMove);
        this.visualViewport.removeEventListener("scroll", this.onViewportMove);
      }
      if (this.opts.groupEventName) {
        window.removeEventListener(this.opts.groupEventName, this.onGroupOpen as EventListener);
      }
      window.removeEventListener("keydown", this.onKeydown, true);
    }
    document.removeEventListener("pointerdown", this.onDocumentPointerDown, true);

    this.teardownScrollParents();
    this.anchorRO?.disconnect();
    this.anchorRO = undefined;
    this.popoverRO?.disconnect();
    this.popoverRO = undefined;
  }

  refreshTargets() {
    if (this._listenersAttached) this.setupObserversAndScrollParents();
    if (this._open) this.position();
  }

  /* -------------------------------- Open/Close -------------------------------- */

  /** Wire to popover element: @toggle=${controller.onToggle} */
  onToggle = (e: Event) => {
    if (this.lastCloseReason === "light-dismiss") {
      this.lastCloseReason = "toggle";
      return;
    }
    const pop = this.opts.getPopover();
    const ev = e as any;

    let isOpen: boolean | null = null;
    if (typeof ev?.newState === "string") isOpen = ev.newState === "open";
    if (isOpen === null && pop) isOpen = PopoverController._matchesPopoverOpen(pop);
    if (isOpen === null) return;

    if (!isOpen) {
      this._open = false;
      this.detachGlobalListenersIfAttached();
      this.opts.onOpenChange?.(false, { reason: this.lastCloseReason });
      if (this.opts.getRestoreFocusOnClose()) this.restoreFocus();
      return;
    }

    this._open = true;
    this.attachGlobalListeners();
    this.opts.onOpenChange?.(true, { reason: "toggle" });

    this.position();
    this.raf = requestAnimationFrame(() => this.opts.focusOnOpen?.());
  };

  toggle() {
    this._open ? this.closePopover("api") : this.openPopover();
  }

  openPopover() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    const pop = this.opts.getPopover();
    if (!pop) return;

    if (typeof window !== "undefined" && this.opts.groupEventName) {
      window.dispatchEvent(
        new CustomEvent(this.opts.groupEventName, {
          detail: { id: this.opts.groupId ?? this.host },
        }),
      );
    }

    this.captureFocusBeforeOpen();
    this.ensurePopoverPositioningBaseline();

    this._open = true;
    this.attachGlobalListeners();
    this.opts.onOpenChange?.(true, { reason: "api" });

    // ✅ prevent first-paint flicker at wrong position
    const prevVisibility = pop.style.visibility;
    pop.style.visibility = "hidden";

    (pop as any).showPopover?.();
    const wasEverOpen = this.hasEverOpened;
    this.hasEverOpened = true;

    // later: pass this to position or set a field
    this._skipNextReposition = !wasEverOpen;

    // Flush layout before measuring — top/left placement needs untransformed size.
    void pop.offsetWidth;

    // 1) compute and apply css-var position ASAP
    this.position();

    // 2) force style/layout flush so left/top vars take effect before animation
    pop.getBoundingClientRect();

    // 3) now animate + reveal
    const side = this.lastMeta.place;
    this.setSideAttr(side);

    // reveal on next frame so hidden state doesn't get captured mid-animation
    this.raf = requestAnimationFrame(() => {
      pop.style.visibility = prevVisibility || "visible";

      this.playPreset(pop, side, "open").then(() => this.opts.focusOnOpen?.());
    });
  }

  private onDocumentPointerDown = (e: PointerEvent) => {
    if (!this._open) return;
    if (!this.opts.getCloseOnOutside()) return;

    const pop = this.opts.getPopover();
    const anchor = this.opts.getAnchor();
    if (!pop || !anchor) return;

    // ignore non-primary clicks
    if (typeof e.button === "number" && e.button !== 0) return;

    const path = (e.composedPath?.() ?? []) as EventTarget[];

    // If click is on anchor or inside popover => not outside
    const insidePopover = path.includes(pop);
    const insideAnchor = path.includes(anchor);
    if (insidePopover || insideAnchor) return;

    // Ignore scrollbar clicks (rare but real)
    const x = e.clientX, y = e.clientY;
    if (x >= window.innerWidth || y >= window.innerHeight) return;

    // Ignore zones: attr + selector
    const ignoreAttr = this.opts.getIgnoreOutsideAttr();
    const ignoreSel = (this.opts.getIgnoreOutsideSelector() || "").trim();

    for (const node of path) {
      if (!(node instanceof HTMLElement)) continue;

      // attr ignore
      if (ignoreAttr && node.hasAttribute(ignoreAttr)) return;

      // selector ignore
      if (ignoreSel) {
        // If any node in the path matches OR is inside an element that matches
        if (node.matches(ignoreSel)) return;
        if (node.closest(ignoreSel)) return;
      }
    }

    // ✅ real outside click
    this.closePopover("light-dismiss");
  };



  async closePopover(reason: CloseReason = "api") {
    const pop = this.opts.getPopover();
    if (!pop) return;

    this.lastCloseReason = reason;

    if (!this._open) {
      (pop as any).hidePopover?.();
      return;
    }

    this._open = false;
    // Restore focus before onOpenChange so the host can re-render with aria-hidden="true"
    // without violating "aria-hidden must not hide a focused element" (focus is already on anchor).
    if (this.opts.getRestoreFocusOnClose()) this.restoreFocus();
    this.detachGlobalListenersIfAttached();
    this.opts.onOpenChange?.(false, { reason });

    const side = this.lastMeta.place;
    this.setSideAttr(side);
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.moveAnim?.cancel();
    await this.playPreset(pop, side, "close");

    (pop as any).hidePopover?.();
  }

  /* -------------------------------- Positioning -------------------------------- */

  private normalizeFlipOrder(order?: PopoverSide[]) {
    const valid = new Set<PopoverSide>(["top", "bottom", "left", "right"]);
    const out: PopoverSide[] = [];
    if (order) {
      for (const s of order) {
        if (valid.has(s) && !out.includes(s)) out.push(s);
      }
    }
    return out;
  }

  private defaultOrderFromPlacement(p: PopoverPlacement): PopoverSide[] {
    switch (p) {
      case "top": return ["top", "bottom"];
      case "bottom": return ["bottom", "top"];
      case "left": return ["left", "right"];
      case "right": return ["right", "left"];
      default: return ["bottom", "top"];
    }
  }

  position() {
    if (typeof window === "undefined") return;

    const anchor = this.opts.getAnchor();
    const pop = this.opts.getPopover();
    if (!anchor || !pop) return;

    this.ensurePopoverPositioningBaseline();

    const isActuallyVisible =
      PopoverController._matchesPopoverOpen(pop) && pop.offsetParent !== null;

    const before = (this._open && isActuallyVisible) ? pop.getBoundingClientRect() : null;

    const hostEl = this.host as unknown as HTMLElement;
    const pad = this.opts.getPadding();

    if (!this.opts.getAnchorPosition()) {
      const vv = window.visualViewport ?? null;
      const vw = vv?.width ?? window.innerWidth;
      const vh = vv?.height ?? window.innerHeight;
      const offsetY = vv?.offsetTop ?? 0;
      const popH = pop.offsetHeight || pop.scrollHeight || 320;

      hostEl.style.setProperty(this.opts.cssVarWidth, `${vw}px`);
      hostEl.style.setProperty(this.opts.cssVarLeft, "0px");
      hostEl.style.setProperty(this.opts.cssVarTop, `${Math.max(pad, vh - popH - pad) + offsetY}px`);
      this.lastMeta = { place: "bottom", arrowAlign: "center" };
      this.setSideAttr("bottom");
      this._skipNextReposition = false;
      return;
    }

    const gap = this.opts.getGap();

    const a = anchor.getBoundingClientRect();

    const vv = window.visualViewport ?? null;
    const vw = vv?.width ?? window.innerWidth;
    const vh = vv?.height ?? window.innerHeight;

    const offsetX = vv?.offsetLeft ?? 0;
    const offsetY = vv?.offsetTop ?? 0;

    if (this.opts.getMaxWidthToViewport()) {
      const maxW = Math.max(0, vw - pad * 2);
      pop.style.maxWidth = `${maxW}px`;
      pop.style.boxSizing = "border-box";
    }

    const popW = pop.offsetWidth || pop.scrollWidth || 220;
    const popH = pop.offsetHeight || pop.scrollHeight || 50;

    const space = {
      top: a.top - gap - offsetY,
      bottom: vh - (a.bottom - offsetY) - gap,
      left: a.left - gap - offsetX,
      right: vw - (a.right - offsetX) - gap,
    };

    const fits = (side: PopoverSide) => {
      if (side === "top") return space.top >= popH;
      if (side === "bottom") return space.bottom >= popH;
      if (side === "left") return space.left >= popW;
      return space.right >= popW;
    };

    // ✅ Get current values via getters
    const requested = this.opts.getPlacement();
    const flipEnabled = this.opts.getFlip();

    const baseOrder =
      this.opts.getFlipOrder()?.length
        ? this.normalizeFlipOrder(this.opts.getFlipOrder())
        : this.normalizeFlipOrder(this.defaultOrderFromPlacement(requested));

    let place: PopoverSide;

    if (requested === "auto") {
      const firstFit = baseOrder.find(fits);
      place =
        firstFit ??
        (baseOrder
          .map((s) => [s, space[s]] as const)
          .sort((x, y) => y[1] - x[1])[0][0]);
    } else if (!flipEnabled) {
      place = requested as PopoverSide;
    } else {
      const req = requested as PopoverSide;
      const prioritized = baseOrder.includes(req)
        ? [req, ...baseOrder.filter((s) => s !== req)]
        : [req, ...baseOrder];

      const firstFit = prioritized.find(fits);
      place =
        firstFit ??
        (prioritized
          .map((s) => [s, space[s]] as const)
          .sort((x, y) => y[1] - x[1])[0][0]);
    }

    let top = 0;
    let left = 0;
    let arrowAlign: ArrowAlign = "center";

    const isRTL = getComputedStyle(anchor).direction === "rtl";
    let align = this.opts.getAlign();
    if (isRTL) {
      if (align === "start") align = "end";
      else if (align === "end") align = "start";
    }

    const ax1 = a.left - offsetX;
    const ax2 = a.right - offsetX;
    const ay1 = a.top - offsetY;
    const ay2 = a.bottom - offsetY;
    const aw = a.width;
    const ah = a.height;

    if (place === "top" || place === "bottom") {
      if (align === "start") left = ax1;
      else if (align === "end") left = ax2 - popW;
      else left = ax1 + aw / 2 - popW / 2;

      top = place === "top" ? ay1 - popH - gap : ay2 + gap;

      const clampedLeft = Math.max(pad, Math.min(vw - popW - pad, left));
      if (clampedLeft !== left) arrowAlign = clampedLeft <= pad + 0.5 ? "start" : "end";
      left = clampedLeft;

      top = Math.max(pad, Math.min(vh - popH - pad, top));
    } else {
      left = place === "left" ? ax1 - popW - gap : ax2 + gap;
      if (align === "start") top = ay1;
      else if (align === "end") top = ay2 - popH;
      else top = ay1 + ah / 2 - popH / 2;

      const clampedTop = Math.max(pad, Math.min(vh - popH - pad, top));
      if (clampedTop !== top) arrowAlign = clampedTop <= pad + 0.5 ? "start" : "end";
      top = clampedTop;

      left = Math.max(pad, Math.min(vw - popW - pad, left));
    }

    left += offsetX;
    top += offsetY;

    if (this.opts.getMatchAnchorWidth()) {
      const maxW = Math.max(0, vw - pad * 2);
      const width = Math.min(a.width, maxW);
      hostEl.style.setProperty(this.opts.cssVarWidth, `${width}px`);
    } else {
      hostEl.style.removeProperty(this.opts.cssVarWidth);
    }

    hostEl.style.setProperty(this.opts.cssVarLeft, `${left}px`);
    hostEl.style.setProperty(this.opts.cssVarTop, `${top}px`);

    const prevPlace = this.lastMeta.place;
    this.lastMeta = { place, arrowAlign };
    this.setSideAttr(place);

    const canReposition =
      this._open &&
      this.opts.getAnimateReposition() &&
      before &&
      !this._skipNextReposition &&
      PopoverController._matchesPopoverOpen(pop) &&
      isActuallyVisible &&
      this._phase === "open" &&
      !this.presetAnim; // extra safety

    if (canReposition) {
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = requestAnimationFrame(() => {
        const after = pop.getBoundingClientRect();
        this.animateMove(pop, before, after);
      });
    }

    this._skipNextReposition = false;
  }

  /* -------------------------------- WAAPI Presets -------------------------------- */

  private shouldSkipMotion(): boolean {
    if (!this.opts.respectReducedMotion) return false;
    return prefersReducedMotion();
  }

  private presetRegistry(): Record<PopoverPreset, PresetDef> {
    return POPOVER_PRESET_REGISTRY;
  }

  private motionScope(fallback: HTMLElement): Element | null {
    return this.host instanceof Element ? this.host : fallback;
  }

  /** sets transformOrigin according to preset + side */
  private computeOrigin(side: PopoverSide, mode: PopoverPresetConfig["origin"]) {
    if (mode === "center") return "50% 50%";
    if (mode === "corner") {
      // corner opposite of side looks best
      if (side === "top") return "50% 100%";
      if (side === "bottom") return "50% 0%";
      if (side === "left") return "100% 50%";
      return "0% 50%";
    }
    if (mode === "anchor") {
      // you can refine this using anchor rect; for now side-based is good
      if (side === "top") return "50% 100%";
      if (side === "bottom") return "50% 0%";
      if (side === "left") return "100% 50%";
      return "0% 50%";
    }
    // auto
    if (side === "top") return "50% 100%";
    if (side === "bottom") return "50% 0%";
    if (side === "left") return "100% 50%";
    return "0% 50%";
  }

  private getPresetKeyframes(
    preset: PopoverPreset,
    side: PopoverSide,
    phase: "open" | "close",
    overrides?: PopoverPresetConfig,
  ) {
    const reg = this.presetRegistry();
    const def = reg[preset] ?? reg.iosMenu;
    const scope = this.host instanceof Element ? this.host : null;

    const cfg = {
      ...this.getBaseDefaults(scope),
      ...def.defaults,
      ...(overrides ?? {}),
    } as Required<PopoverPresetConfig>;

    const origin = this.computeOrigin(side, cfg.origin);

    return {
      keyframes: def.getKeyframes({ side, phase, cfg, origin }),
      cfg,
      origin
    };
  }

  // Add this helper method for base defaults:
  private getBaseDefaults(scope: Element | null): Required<PopoverPresetConfig> {
    return {
      enterPx: 12,
      exitPx: 8,
      enterScale: 0.98,
      exitScale: 0.99,
      blurInPx: 6,
      blurOutPx: 3,
      perspectivePx: 900,
      rotateDeg: 10,
      tiltDeg: 8,
      origin: "auto",
      easingOpen: readMotionEasing(scope, "enter"),
      easingClose: readMotionEasing(scope, "exit"),
      enterDuration: POPOVER_PRESET_DURATION_BASE.enter,
      exitDuration: POPOVER_PRESET_DURATION_BASE.exit,
    };
  }

  private async playPreset(pop: HTMLElement, side: PopoverSide, phase: "open" | "close") {
    pop.style.transition = "none";
    this.checkForConflictingCSS(pop);
    if (this.shouldSkipMotion()) return;

    // ✅ Get current preset via getter
    const preset = this.opts.getPreset();
    if (preset === "none") return;

    // cancel transform-related animations
    this.moveAnim?.cancel();
    this.presetAnim?.cancel();

    this._phase = phase === "open" ? "opening" : "closing";

    // Get keyframes and config for the current preset
    const { keyframes, cfg, origin } = this.getPresetKeyframes(preset, side, phase);
    const scope = this.motionScope(pop);

    const presetMs = phase === "open" ? cfg.enterDuration : cfg.exitDuration;
    const userMs =
      phase === "open" ? this.opts.getDuration() : this.opts.getCloseDuration();
    const baseMs =
      phase === "open"
        ? POPOVER_PRESET_DURATION_BASE.enter
        : POPOVER_PRESET_DURATION_BASE.exit;
    const scaledPresetMs = Math.round(presetMs * (userMs / baseMs));

    const duration = resolvePopoverDurationMs(scope, phase, scaledPresetMs);

    /* ---------------- 3D SAFETY LOGIC ---------------- */
    const is3d = this.is3dPreset(preset);
    if (is3d) {
      pop.style.transformStyle = "preserve-3d";
      pop.style.backfaceVisibility = "hidden";
      // DON'T set perspective here - it's already in the transform
    } else {
      pop.style.transformStyle = "";
      pop.style.backfaceVisibility = "";
    }
    /* -------------------------------------------------- */

    pop.style.transformOrigin = origin;
    pop.style.willChange = "opacity, transform, filter";

    const presetEasing = phase === "open" ? cfg.easingOpen : cfg.easingClose;
    const easing = resolvePopoverEasing(scope, phase, preset, presetEasing);

    const anim = pop.animate(keyframes as any, {
      duration,
      easing,
      fill: "both",
    });

    this.presetAnim = anim;

    try {
      await anim.finished;
    } catch {
      // cancelled is fine
    } finally {
      if (this.presetAnim === anim) this.presetAnim = undefined;
      pop.style.transition = "";
      if (is3d) {
        pop.style.transformStyle = "";
        pop.style.backfaceVisibility = "";
      }
      if (phase === "close") {
        pop.style.opacity = "";
        pop.style.transform = "";
        pop.style.filter = "";
      }
      pop.style.willChange = "";

      this._phase = phase === "open" ? "open" : "idle";
    }
  }

  private checkForConflictingCSS(pop: HTMLElement) {
    const source = this.host instanceof Element ? this.host : pop;
    devWarnWaapiCssConflict(source, pop, [
      "transform",
      "opacity",
      "margin",
      "padding",
    ]);
  }

  /* -------------------------------- Move Animation (Flip Smooth) -------------------------------- */

  private animateMove(pop: HTMLElement, from: DOMRect, to: DOMRect) {
    if (this._phase !== "open") return; // ✅ hard gate

    const dx = from.left - to.left;
    const dy = from.top - to.top;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;

    this.moveAnim?.cancel();

    const scope = this.motionScope(pop);
    const duration = motionDurationMs(this.opts.getRepositionMs());

    const anim = pop.animate(
      [
        { transform: `translate3d(${dx}px, ${dy}px, 0)` },
        { transform: "translate3d(0, 0, 0)" },
      ],
      {
        duration,
        easing: readMotionEasing(scope, "interactive"),
        fill: "both",
      },
    );

    this.moveAnim = anim;
    anim.finished.finally(() => {
      if (this.moveAnim === anim) this.moveAnim = undefined;
    });
  }

  private is3dPreset(preset: PopoverPreset) {
    return (
      preset === "flip3d" ||
      preset === "card3d" ||
      preset === "tilt3d" ||
      preset === "depth3d" ||
      preset === "rotate3d"
    );
  }

  private setSideAttr(side: PopoverSide) {
    const pop = this.opts.getPopover();
    if (!pop) return;
    pop.setAttribute(this.opts.sideAttr, side);
  }

  /* -------------------------------- Observers & Scroll Parents -------------------------------- */

  private setupObserversAndScrollParents() {
    if (typeof window === "undefined") return;

    const anchor = this.opts.getAnchor();
    const pop = this.opts.getPopover();

    if (anchor && "ResizeObserver" in window) {
      this.anchorRO?.disconnect();
      this.anchorRO = new ResizeObserver(() => {
        if (this._open) this.position();
      });
      this.anchorRO.observe(anchor);
    }

    if (pop && "ResizeObserver" in window) {
      this.popoverRO?.disconnect();
      this.popoverRO = new ResizeObserver(() => {
        if (!this._open || this.presetAnim) return;
        this.position();
      });
      this.popoverRO.observe(pop);
    }

    this.teardownScrollParents();

    const mode = this.opts.scrollContainer;
    if (mode === "window") return;

    if (mode instanceof HTMLElement) {
      this.bindScroll(mode);
      return;
    }

    if (anchor) {
      for (const p of this.getScrollParents(anchor)) this.bindScroll(p);
    }
  }

  private bindScroll(el: HTMLElement) {
    const fn = this.onViewportMove as EventListener;
    el.addEventListener("scroll", fn, { passive: true });
    this.boundScrollParents.push({ el, fn });
  }

  private teardownScrollParents() {
    for (const { el, fn } of this.boundScrollParents) {
      (el as any).removeEventListener?.("scroll", fn);
    }
    this.boundScrollParents = [];
  }

  private getScrollParents(node: HTMLElement): HTMLElement[] {
    const parents: HTMLElement[] = [];
    let el: HTMLElement | null = node.parentElement;

    while (el && el !== document.body) {
      const style = getComputedStyle(el);
      const overflowY = style.overflowY;
      const overflowX = style.overflowX;

      const canScrollY =
        (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
        el.scrollHeight > el.clientHeight;

      const canScrollX =
        (overflowX === "auto" || overflowX === "scroll" || overflowX === "overlay") &&
        el.scrollWidth > el.clientWidth;

      if (canScrollY || canScrollX) parents.push(el);
      el = el.parentElement;
    }

    return parents;
  }

  /* -------------------------------- Close / Focus / Group -------------------------------- */

  private onViewportMove = () => {
    if (this._open) this.position();
  };

  private onKeydown = (e: KeyboardEvent) => {
    if (!this._open) return;
    if (e.key !== "Escape") return;

    // ✅ Check if escape closing is enabled via getter
    if (!this.opts.getCloseOnEscape()) return;

    if (!this.opts.getEscapeRequiresFocus()) {
      e.preventDefault();
      e.stopPropagation();
      this.closePopover("escape");
      return;
    }

    const pop = this.opts.getPopover();
    const anchor = this.opts.getAnchor();
    const active = document.activeElement;

    const withinPopover = !!(pop && active && pop.contains(active));
    const onAnchor = !!(anchor && active && anchor.contains(active));

    if (withinPopover || onAnchor) {
      e.preventDefault();
      e.stopPropagation();
      this.closePopover("escape");
    }
  };

  private onGroupOpen = (e: CustomEvent) => {
    const other = e.detail?.id;
    const mine = this.opts.groupId ?? this.host;

    if (other !== mine && this._open) {
      this.closePopover("group");
    }
  };

  private captureFocusBeforeOpen() {
    this.lastFocusedEl = document.activeElement;
  }

  private restoreFocus() {
    // ✅ Check if focus restoration is enabled via getter
    if (!this.opts.getRestoreFocusOnClose()) return;

    const anchor = this.opts.getAnchor();
    if (!anchor) return;

    const active = document.activeElement;

    const last = this.lastFocusedEl as HTMLElement | null;
    const pop = this.opts.getPopover();

    const lastWasInsidePopover = !!(pop && last && pop.contains(last));
    const lastWasInsideHost = !!(anchor && last && anchor.contains(last));
    const activeInsidePopover = !!(pop && active && pop.contains(active));

    if (activeInsidePopover || lastWasInsidePopover || lastWasInsideHost) {
      anchor.focus?.();
    }
  }

  /* -------------------------------- CSS Guard -------------------------------- */

  /** UA popovers may ship default margin; never touch padding — panels own inset via CSS. */
  private ensurePopoverPositioningBaseline() {
    const pop = this.opts.getPopover();
    if (!pop) return;
    pop.style.margin = "0";
    pop.style.removeProperty("padding");
    pop.style.transition = "none";
  }

  /* -------------------------------- Utility Methods -------------------------------- */

  /**
   * Utility method to manually update a specific option
   * (Useful for edge cases where you need direct control)
   */
  updateOption<T extends keyof typeof this.opts>(
    key: T,
    value: typeof this.opts[T]
  ) {
    if (typeof value === "function") {
      // For getters, replace the function
      (this.opts as any)[key] = value;
    } else {
      // For other values, wrap in a getter
      (this.opts as any)[key] = () => value;
    }

    if (this._open && key.startsWith("get")) {
      // Reposition if open and a positioning property changed
      this.position();
    }
  }
}