import type { VuNotificationPosition } from "../notification.types.js";
import {
  notificationEnterOffset,
  notificationMotionTransition,
  notificationTransform,
  readNotificationMotionMs,
} from "./notification-motion.js";

/** JS-driven enter for `<vu-notification layout="list">`. */
export class NotificationListMotion {
  private _rafId: number | null = null;
  private _enterRafId: number | null = null;

  schedule(root: ShadowRoot | null, position: VuNotificationPosition): void {
    if (this._rafId != null) return;
    this._rafId = requestAnimationFrame(() => {
      this._rafId = null;
      this._runEnter(root, position);
    });
  }

  disconnect(): void {
    if (this._rafId != null) cancelAnimationFrame(this._rafId);
    if (this._enterRafId != null) cancelAnimationFrame(this._enterRafId);
    this._rafId = null;
    this._enterRafId = null;
  }

  resetStackInlineStyles(root: ShadowRoot | null): void {
    root?.querySelectorAll<HTMLElement>('[part="item"]').forEach((el) => {
      el.style.transform = "";
      el.style.transition = "";
      el.style.opacity = "";
      el.style.blockSize = "";
      el.style.inlineSize = "";
      el.style.overflow = "";
      el.style.visibility = "";
      el.style.pointerEvents = "";
      el.style.zIndex = "";
      el.classList.remove(
        "is-stack-mounted",
        "is-front",
        "is-expanded",
        "is-hidden",
        "is-overflow-fading",
      );
    });
    const list = root?.querySelector<HTMLElement>('[part="list"]');
    if (list) {
      list.style.blockSize = "";
      list.style.inlineSize = "";
      list.classList.remove("is-expanded");
    }
  }

  private _runEnter(root: ShadowRoot | null, position: VuNotificationPosition): void {
    const entering = Array.from(
      root?.querySelectorAll<HTMLElement>(
        '[part="item"]:not(.is-removing):not(.is-list-mounted)',
      ) ?? [],
    );
    if (!entering.length || !(root?.host instanceof HTMLElement)) return;

    const ms = readNotificationMotionMs(root.host, "list");
    const transition = notificationMotionTransition(root.host, ms, "enter");
    const offset = notificationEnterOffset(position);

    entering.forEach((el) => {
      el.style.transition = "none";
      el.style.transform = notificationTransform(offset, 0.96);
      el.style.opacity = "0";
    });

    if (this._enterRafId != null) cancelAnimationFrame(this._enterRafId);
    this._enterRafId = requestAnimationFrame(() => {
      this._enterRafId = null;
      entering.forEach((el) => {
        el.style.transition = transition;
        el.style.transform = notificationTransform({ x: 0, y: 0 }, 1);
        el.style.opacity = "1";
        el.classList.add("is-list-mounted");
      });
    });
  }
}
