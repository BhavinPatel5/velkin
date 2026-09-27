import { MOTION_DURATION_MS } from "../../internals/utils/motion.js";
import type { VuNotificationPosition } from "../notification.types.js";
import { notificationMotionEdge } from "./notification-placement.js";
import {
  notificationExitOffset,
  notificationMotionTransition,
  readNotificationMotionMs,
} from "./notification-motion.js";

const SWIPE_THRESHOLD_PX = 48;

type SwipeActive = {
  id: number;
  x: number;
  y: number;
  el: HTMLElement;
  pointerId: number;
};

/** Tracks pointer swipes that dismiss a toast toward the viewport edge. */
export class NotificationSwipeDismiss {
  private _active: SwipeActive | null = null;

  constructor(
    private readonly getPosition: () => VuNotificationPosition,
    private readonly getElement: (id: number) => HTMLElement | null,
    private readonly getHost: () => HTMLElement | null,
    private readonly onDismiss: (id: number) => void,
  ) {}

  onPointerDown(id: number, event: PointerEvent): void {
    if (event.button !== 0) return;
    const el = this.getElement(id);
    if (!el) return;
    this._active = {
      id,
      x: event.clientX,
      y: event.clientY,
      el,
      pointerId: event.pointerId,
    };
    el.setPointerCapture(event.pointerId);
  }

  onPointerMove(id: number, event: PointerEvent): void {
    if (!this._active || this._active.id !== id) return;
    const dx = event.clientX - this._active.x;
    const dy = event.clientY - this._active.y;
    const { x, y } = this._swipeOffset(dx, dy);
    const progress = Math.min(1, Math.hypot(x, y) / 120);
    this._active.el.style.transition = "none";
    this._active.el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    this._active.el.style.opacity = String(Math.max(0.35, 1 - progress * 0.65));
  }

  onPointerUp(id: number, event: PointerEvent): void {
    if (!this._active || this._active.id !== id) return;
    const { el, pointerId, id: toastId } = this._active;
    const dx = event.clientX - this._active.x;
    const dy = event.clientY - this._active.y;
    this._active = null;
    if (el.hasPointerCapture(pointerId)) {
      el.releasePointerCapture(pointerId);
    }

    if (this._shouldDismiss(dx, dy)) {
      this._animateDismiss(el, toastId);
      return;
    }
    this._snapBack(el);
  }

  onPointerCancel(): void {
    if (!this._active) return;
    const { el, pointerId } = this._active;
    this._active = null;
    if (el.hasPointerCapture(pointerId)) {
      el.releasePointerCapture(pointerId);
    }
    this._snapBack(el);
  }

  private _swipeOffset(dx: number, dy: number): { x: number; y: number } {
    const edge = notificationMotionEdge(this.getPosition());
    const vertical = Math.abs(dy) >= Math.abs(dx);
    if (vertical) {
      const y = edge === "top" ? Math.min(0, dy) : Math.max(0, dy);
      return { x: 0, y };
    }
    return { x: dx, y: 0 };
  }

  private _shouldDismiss(dx: number, dy: number): boolean {
    const edge = notificationMotionEdge(this.getPosition());
    const towardEdge = edge === "top" ? dy < -SWIPE_THRESHOLD_PX : dy > SWIPE_THRESHOLD_PX;
    const horizontal = Math.abs(dx) > SWIPE_THRESHOLD_PX && Math.abs(dx) > Math.abs(dy);
    return towardEdge || horizontal;
  }

  private _motionMs(): number {
    const host = this.getHost();
    if (!host) return MOTION_DURATION_MS.slow;
    return readNotificationMotionMs(host, "list");
  }

  private _snapBack(el: HTMLElement): void {
    const host = this.getHost();
    const ms = this._motionMs();
    const transition = notificationMotionTransition(host, ms, "enter");
    el.style.transition = transition;
    el.style.transform = "";
    el.style.opacity = "1";
  }

  private _animateDismiss(el: HTMLElement, id: number): void {
    const host = this.getHost();
    const ms = this._motionMs();
    const exit = notificationExitOffset(this.getPosition());
    const transition = notificationMotionTransition(host, ms, "exit");
    el.style.transition = transition;
    el.style.transform = `translate3d(${exit.x}px, ${exit.y}px, 0) scale(0.96)`;
    el.style.opacity = "0";
    window.setTimeout(() => this.onDismiss(id), ms);
  }
}
