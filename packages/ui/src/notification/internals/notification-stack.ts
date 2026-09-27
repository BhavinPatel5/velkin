import {
  MOTION_DURATION_MS,
  motionDurationMs,
  parseDurationMs,
} from "../../internals/utils/motion.js";
import type { VuNotificationLayout, VuNotificationPosition } from "../notification.types.js";
import { readNotificationItemDomId } from "./notification-dom.js";
import { notificationMotionEdge } from "./notification-placement.js";
import {
  notificationEnterOffset,
  notificationStackTransition,
  notificationStackPeekSign,
  notificationTransform,
} from "./notification-motion.js";

type StackConfig = {
  hoverGap: number;
  fanLimit: number;
  peek: number;
  scaleStep: number;
  transitionMs: number;
  inset: number;
};

type StackFrame = {
  lift: number;
  offset: number;
  scale: number;
  opacity: number;
  hidden: boolean;
};

/** Manages stack fan layout for `<vu-notification layout="stack">`. */
export class NotificationStackLayout {
  private _bound = false;
  private _expanded = false;
  private _clickPinned = false;
  private _lastFrontNatural = 0;
  private _rafId: number | null = null;
  private _enterRafId: number | null = null;
  private _ro?: ResizeObserver;
  private _applying = false;
  private _overflowFadeTimers = new WeakMap<HTMLElement, number>();
  private _prevItemIds: string[] = [];

  constructor(
    private readonly getRoot: () => ShadowRoot | null,
    private readonly getLayout: () => VuNotificationLayout,
    private readonly getPosition: () => VuNotificationPosition,
    private readonly getHost: () => HTMLElement,
    private readonly onReposition: () => void,
    private readonly getExpandOnClick: () => boolean,
  ) {}

  schedule(): void {
    if (this._rafId != null) return;
    this._rafId = requestAnimationFrame(() => {
      this._rafId = null;
      this.layout();
      this.onReposition();
    });
  }

  disconnect(): void {
    if (this._rafId != null) cancelAnimationFrame(this._rafId);
    if (this._enterRafId != null) cancelAnimationFrame(this._enterRafId);
    this._rafId = null;
    this._enterRafId = null;
    this._ro?.disconnect();
    this._bound = false;
    this._expanded = false;
    this._clickPinned = false;
    this._prevItemIds = [];
  }

  retainExpandedOnUpdate(): void {
    if (!this._isHovered()) this._expanded = false;
  }

  layout(): void {
    if (this.getLayout() !== "stack") return;
    this._bindHover();
    this._observeItems();
    this._fanOut(this._expanded);
  }

  private _config(): StackConfig {
    const style = getComputedStyle(this.getHost());
    return {
      hoverGap: Number.parseFloat(style.getPropertyValue("--nt-stack-hover-gap")) || 8,
      fanLimit: Number.parseInt(style.getPropertyValue("--nt-stack-fan-limit"), 10) || 3,
      peek: Number.parseFloat(style.getPropertyValue("--nt-stack-peek")) || 12,
      scaleStep: Number.parseFloat(style.getPropertyValue("--nt-stack-scale-step")) || 0.05,
      transitionMs:
        motionDurationMs(
          parseDurationMs(style.getPropertyValue("--nt-stack-transition-ms")) ||
            MOTION_DURATION_MS.slow,
        ),
      inset: Number.parseFloat(style.getPropertyValue("--nt-stack-inset")) || 18,
    };
  }

  private _peekSign(): number {
    return notificationStackPeekSign(this.getPosition());
  }

  private _isTopStack(): boolean {
    return notificationMotionEdge(this.getPosition()) === "top";
  }

  private _frameTranslate(frame: StackFrame): { x: number; y: number } {
    if (!this._expanded) return { x: 0, y: 0 };
    const delta = this._peekSign() * frame.offset;
    return { x: 0, y: delta };
  }

  private _frameTransform(frame: StackFrame): string {
    const { x, y } = this._frameTranslate(frame);
    return notificationTransform({ x, y }, frame.scale);
  }

  private _bindHover(): void {
    if (this._bound) return;
    const list = this.getRoot()?.querySelector('[part="list"]');
    if (!(list instanceof HTMLElement)) return;
    this._bound = true;
    const expand = () => this._fanOut(true);
    const collapse = () => {
      this._clickPinned = false;
      this._fanOut(false);
    };
    list.addEventListener("mouseenter", expand);
    list.addEventListener("mousemove", expand);
    list.addEventListener("mouseleave", collapse);
    list.addEventListener("click", () => {
      if (!this.getExpandOnClick()) return;
      this._clickPinned = true;
      this._fanOut(true);
    });
    list.addEventListener("focusin", expand);
    list.addEventListener("focusout", (event) => {
      const next = event.relatedTarget;
      if (next instanceof Node && list.contains(next)) return;
      collapse();
    });
  }

  private _observeItems(): void {
    if (!this._ro) {
      this._ro = new ResizeObserver(() => {
        if (this._applying) return;
        this.schedule();
      });
    }
    this._ro.disconnect();
    const front = this._activeItems()[0];
    if (front) this._ro.observe(front);
  }

  private _activeItems(): HTMLElement[] {
    return Array.from(
      this.getRoot()?.querySelectorAll<HTMLElement>('[part="item"]:not(.is-removing)') ?? [],
    );
  }

  private _isHovered(): boolean {
    const list = this.getRoot()?.querySelector('[part="list"]');
    return list instanceof HTMLElement && list.matches(":hover");
  }

  private _fanOut(expanded: boolean): void {
    if (this.getLayout() !== "stack") return;
    this._expanded = this._isHovered() || this._clickPinned ? true : expanded;
    this._applyFrames();
  }

  private _collapsedLift(index: number): number {
    if (index <= 0) return 0;
    return index * this._config().peek;
  }

  private _collapsedFrames(): StackFrame[] {
    const { fanLimit, scaleStep } = this._config();
    const items = this._activeItems();
    const visibleLimit = Math.max(1, fanLimit);
    const capIndex = visibleLimit - 1;
    const capLift = this._collapsedLift(capIndex);
    const capScale = Math.max(0.88, 1 - scaleStep * capIndex);

    return items.map((_, index) => {
      if (index >= visibleLimit) {
        return {
          lift: capLift,
          offset: 0,
          scale: capScale,
          opacity: 0,
          hidden: true,
        };
      }

      return {
        lift: this._collapsedLift(index),
        offset: 0,
        scale: Math.max(0.88, 1 - scaleStep * index),
        opacity: 1,
        hidden: false,
      };
    });
  }

  private _expandedFrames(): StackFrame[] {
    const { hoverGap } = this._config();
    const items = this._activeItems();
    const heights = items.map((el) => this._naturalHeight(el));
    const frames: StackFrame[] = [];
    let offset = 0;

    for (let i = 0; i < heights.length; i++) {
      frames.push({ lift: 0, offset, scale: 1, opacity: 1, hidden: false });
      offset += heights[i] + hoverGap;
    }

    return frames;
  }

  private _naturalHeight(el: HTMLElement): number {
    const prevBlockSize = el.style.blockSize;
    const prevHeight = el.style.height;
    const prevOverflow = el.style.overflow;
    el.style.blockSize = "";
    el.style.height = "";
    el.style.overflow = "";
    const height = el.offsetHeight || el.getBoundingClientRect().height;
    el.style.blockSize = prevBlockSize;
    el.style.height = prevHeight;
    el.style.overflow = prevOverflow;
    return height;
  }

  private _applyAnchorInset(el: HTMLElement, frame: StackFrame): void {
    const { inset } = this._config();
    const edge = inset + frame.lift;

    if (this._isTopStack()) {
      el.style.insetBlockStart = `${edge}px`;
      el.style.insetBlockEnd = "";
    } else {
      el.style.insetBlockEnd = `${edge}px`;
      el.style.insetBlockStart = "";
    }
  }

  private _applyFrame(
    el: HTMLElement,
    index: number,
    frame: StackFrame,
    transition: string,
    entering: boolean,
    enterBase: { x: number; y: number },
  ): void {
    const transform = this._frameTransform(frame);

    if (entering) {
      el.style.transition = "none";
      el.style.transform = notificationTransform(enterBase, 0.96);
      el.style.opacity = "0";
      return;
    }

    if (!this._expanded && index > 0) {
      const snap = !el.classList.contains("is-stack-mounted");
      if (snap) {
        el.style.transition = "none";
        el.style.transform = transform;
        el.style.opacity = String(frame.opacity);
        void el.offsetHeight;
        el.style.transition = transition;
        return;
      }
    }

    el.style.transition = transition;
    el.style.transform = transform;
    el.style.opacity = String(frame.opacity);
  }

  private _clearOverflowFade(el: HTMLElement): void {
    const timer = this._overflowFadeTimers.get(el);
    if (timer != null) {
      window.clearTimeout(timer);
      this._overflowFadeTimers.delete(el);
    }
    el.classList.remove("is-overflow-fading");
  }

  private _scheduleOverflowHide(el: HTMLElement, ms: number): void {
    const prev = this._overflowFadeTimers.get(el);
    if (prev != null) window.clearTimeout(prev);
    const timer = window.setTimeout(() => {
      this._overflowFadeTimers.delete(el);
      if (!el.isConnected) return;
      el.style.visibility = "hidden";
      el.classList.remove("is-overflow-fading");
    }, ms + 32);
    this._overflowFadeTimers.set(el, timer);
  }

  private _applyItem(
    el: HTMLElement,
    index: number,
    frame: StackFrame,
    transition: string,
    frontNatural: number,
    entering: boolean,
    enterBase: { x: number; y: number },
    itemCount: number,
    effectiveFront: number,
    prevIndex: number,
  ): void {
    const { fanLimit, transitionMs } = this._config();
    const visibleLimit = Math.max(1, fanLimit);
    const crossingOverflow =
      frame.hidden &&
      prevIndex >= 0 &&
      prevIndex < visibleLimit &&
      el.classList.contains("is-stack-mounted");
    const isOverflowFade =
      !this._expanded &&
      frame.hidden &&
      (el.classList.contains("is-overflow-fading") || crossingOverflow);

    this._applyAnchorInset(el, frame);
    this._applyFrame(el, index, frame, transition, entering, enterBase);

    if (!entering) {
      el.classList.add("is-stack-mounted");
    }

    el.style.zIndex = String(itemCount - index);
    el.classList.toggle("is-front", index === 0);
    el.classList.toggle("is-expanded", this._expanded);
    el.classList.toggle("is-hidden", frame.hidden && !isOverflowFade);

    if (!this._expanded && index > 0 && effectiveFront > 0) {
      el.style.blockSize = `${effectiveFront}px`;
      el.style.height = "";
      el.style.overflow = "hidden";
      el.style.transformOrigin = this._isTopStack() ? "center top" : "center bottom";
    } else {
      el.style.blockSize = "";
      el.style.height = "";
      el.style.overflow = "";
      el.style.transformOrigin = "";
    }

    const interactive = this._expanded ? !frame.hidden : index === 0;
    el.style.pointerEvents = interactive ? "auto" : "none";

    if (isOverflowFade) {
      el.classList.add("is-overflow-fading");
      el.style.visibility = "visible";
      if (!this._overflowFadeTimers.has(el)) {
        this._scheduleOverflowHide(el, transitionMs);
      }
    } else if (frame.hidden) {
      this._clearOverflowFade(el);
      el.style.visibility = "hidden";
    } else {
      this._clearOverflowFade(el);
      el.style.visibility = "visible";
    }
  }

  private _effectiveFrontNatural(measured: number, list: HTMLElement | null): number {
    const cached = Number.parseFloat(list?.style.getPropertyValue("--nt-front-height") ?? "") || 0;
    const effective = Math.max(measured, cached, this._lastFrontNatural);
    if (effective > 0) this._lastFrontNatural = effective;
    return effective;
  }

  private _applyItemOrder(items: HTMLElement[]): number[] {
    const order: number[] = [];
    for (let i = items.length - 1; i >= 0; i--) order.push(i);
    return order;
  }

  private _frontHeight(items: HTMLElement[], list: HTMLElement | null): number {
    if (items[0]) {
      const front = this._naturalHeight(items[0]);
      if (front > 0) return front;
    }

    for (let i = 1; i < items.length; i++) {
      const height = this._naturalHeight(items[i]);
      if (height > 0) return height;
    }

    const cached = list?.style.getPropertyValue("--nt-front-height") ?? "";
    return Number.parseFloat(cached) || 0;
  }

  private _applyFrames(): void {
    const items = this._activeItems();
    const list = this.getRoot()?.querySelector('[part="list"]');
    const listEl = list instanceof HTMLElement ? list : null;
    const { transitionMs } = this._config();
    const transition = notificationStackTransition(this.getHost(), transitionMs);
    const frontNatural = this._frontHeight(items, listEl);
    const effectiveFront = this._effectiveFrontNatural(frontNatural, listEl);
    const frames = this._expanded ? this._expandedFrames() : this._collapsedFrames();
    const entering: HTMLElement[] = [];
    const enterBase = notificationEnterOffset(this.getPosition());
    const order = this._applyItemOrder(items);
    const prevIds = this._prevItemIds;

    this._applying = true;
    try {
      for (const index of order) {
        const el = items[index];
        if (!el) continue;
        const id = readNotificationItemDomId(el);
        const prevIndex = id ? prevIds.indexOf(id) : -1;
        const frame = frames[index] ?? {
          lift: 0,
          offset: 0,
          scale: 1,
          opacity: 1,
          hidden: false,
        };
        const isEntering = index === 0 && !el.classList.contains("is-stack-mounted");
        if (isEntering) entering.push(el);
        this._applyItem(
          el,
          index,
          frame,
          transition,
          frontNatural,
          isEntering,
          enterBase,
          items.length,
          effectiveFront,
          prevIndex,
        );
      }

      this._prevItemIds = items.map((el) => readNotificationItemDomId(el));

      if (entering.length) {
        if (this._enterRafId != null) cancelAnimationFrame(this._enterRafId);
        this._enterRafId = requestAnimationFrame(() => {
          this._enterRafId = null;
          const freshItems = this._activeItems();
          const freshList = this.getRoot()?.querySelector('[part="list"]');
          const freshListEl = freshList instanceof HTMLElement ? freshList : null;
          const freshFront = this._frontHeight(freshItems, freshListEl);
          const freshEffective = this._effectiveFrontNatural(freshFront, freshListEl);
          const freshFrames = this._expanded ? this._expandedFrames() : this._collapsedFrames();
          const freshOrder = this._applyItemOrder(freshItems);
          for (const index of freshOrder) {
            const el = freshItems[index];
            if (!el) continue;
            const frame = freshFrames[index];
            if (!frame) continue;
            const id = readNotificationItemDomId(el);
            const prevIndex = id ? prevIds.indexOf(id) : -1;
            this._applyItem(
              el,
              index,
              frame,
              transition,
              freshFront,
              false,
              enterBase,
              freshItems.length,
              freshEffective,
              prevIndex,
            );
          }
          if (!this._expanded && freshEffective > 0) {
            requestAnimationFrame(() => this.schedule());
          }
        });
      }

      if (!listEl) return;

      const collapsedHeight = this._collapsedHeight(effectiveFront, items.length);
      const expandedHeight = this._expandedHeight();

      if (items.length === 0) {
        listEl.style.blockSize = "";
        listEl.style.height = "";
        listEl.style.removeProperty("--nt-front-height");
        this._lastFrontNatural = 0;
      } else if (effectiveFront <= 0) {
        requestAnimationFrame(() => this.schedule());
      } else {
        const nextSize = this._expanded ? expandedHeight : collapsedHeight;
        const animateSize =
          this._expanded &&
          listEl.getBoundingClientRect().height > 0 &&
          prevIds.length > items.length;
        this._setListBlockSize(listEl, nextSize, animateSize);
        listEl.style.setProperty("--nt-front-height", `${effectiveFront}px`);
      }

      listEl.style.setProperty(
        "--nt-stack-hit",
        this._expanded ? `${Math.max(0, expandedHeight - collapsedHeight + 16)}px` : "0px",
      );
      listEl.classList.toggle("is-expanded", this._expanded);
    } finally {
      this._applying = false;
    }
  }

  private _collapsedHeight(frontNatural: number, count: number): number {
    const { peek, fanLimit } = this._config();
    if (!count || frontNatural <= 0) return 0;
    const visible = Math.min(count, Math.max(1, fanLimit));
    return frontNatural + (visible - 1) * peek;
  }

  private _expandedHeight(): number {
    const { hoverGap } = this._config();
    const items = this._activeItems();
    const heights = items.map((el) => this._naturalHeight(el));
    if (!heights.length) return 0;
    return (
      heights.reduce((sum, height) => sum + height, 0) + Math.max(0, heights.length - 1) * hoverGap
    );
  }

  private _setListBlockSize(listEl: HTMLElement, nextPx: number, animate: boolean): void {
    if (!animate || nextPx <= 0) {
      listEl.style.blockSize = nextPx > 0 ? `${nextPx}px` : "";
      listEl.style.height = nextPx > 0 ? `${nextPx}px` : "";
      return;
    }

    const prevPx = listEl.getBoundingClientRect().height;
    if (Math.abs(prevPx - nextPx) < 0.5) {
      listEl.style.blockSize = `${nextPx}px`;
      listEl.style.height = `${nextPx}px`;
      return;
    }

    listEl.style.blockSize = `${prevPx}px`;
    listEl.style.height = `${prevPx}px`;
    void listEl.offsetHeight;
    listEl.style.blockSize = `${nextPx}px`;
    listEl.style.height = `${nextPx}px`;
  }
}
