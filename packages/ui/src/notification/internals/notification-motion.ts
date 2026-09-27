import {
  MOTION_DURATION_MS,
  motionDurationMs,
  parseDurationMs,
  readMotionDurationMs,
  readMotionEasing,
} from "../../internals/utils/motion.js";
import type { VuNotificationLayout, VuNotificationPosition } from "../notification.types.js";
import { notificationMotionEdge } from "./notification-placement.js";

export type MotionOffset = { x: number; y: number };

/** Enter offset for a toast sliding in from outside the viewport edge. */
export function notificationEnterOffset(position: VuNotificationPosition): MotionOffset {
  return notificationMotionEdge(position) === "top" ? { x: 0, y: -16 } : { x: 0, y: 16 };
}

/** Exit offset for a toast sliding back out past the viewport edge. */
export function notificationExitOffset(position: VuNotificationPosition): MotionOffset {
  return notificationMotionEdge(position) === "top" ? { x: 0, y: -20 } : { x: 0, y: 20 };
}

/** Peek sign for stacked layers along the block axis. */
export function notificationStackPeekSign(position: VuNotificationPosition): number {
  return notificationMotionEdge(position) === "top" ? 1 : -1;
}

/** Reads notification motion duration from host CSS tokens (respects reduced motion). */
export function readNotificationMotionMs(host: HTMLElement, layout: VuNotificationLayout): number {
  const token = layout === "stack" ? "--nt-stack-transition-ms" : "--nt-motion-ms";
  const raw = getComputedStyle(host).getPropertyValue(token).trim();
  const parsed = parseDurationMs(raw);
  const ms =
    parsed > 0 ? parsed : readMotionDurationMs(host, "slow") || MOTION_DURATION_MS.slow;
  return motionDurationMs(ms);
}

/** CSS transition string for list enter/exit motion. */
export function notificationMotionTransition(
  scope: Element | null,
  ms: number,
  phase: "enter" | "exit",
): string {
  const easing = readMotionEasing(scope, phase === "enter" ? "enter" : "exit");
  return [
    `transform ${ms}ms ${easing}`,
    `opacity ${ms}ms ${easing}`,
    `box-shadow ${ms}ms ${easing}`,
  ].join(", ");
}

/** CSS transition string for collapsed stack fan layout. */
export function notificationStackTransition(
  scope: Element | null,
  ms: number,
  phase: "enter" | "exit" = "enter",
): string {
  const easing = readMotionEasing(scope, phase === "enter" ? "enter" : "exit");
  return [
    `inset-block-start ${ms}ms ${easing}`,
    `inset-block-end ${ms}ms ${easing}`,
    `transform ${ms}ms ${easing}`,
    `opacity ${ms}ms ${easing}`,
    `box-shadow ${ms}ms ${easing}`,
  ].join(", ");
}

/** Builds a translate+scale transform for stack/list motion. */
export function notificationTransform(offset: MotionOffset, scale = 1): string {
  return `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`;
}

function readTransformOffset(transform: string): MotionOffset {
  const match = transform.match(/translate3d\(([^)]+)\)/);
  if (!match) return { x: 0, y: 0 };
  const parts = match[1].split(",").map((part) => Number.parseFloat(part.trim()));
  return { x: parts[0] || 0, y: parts[1] || 0 };
}

function readTransformScale(transform: string): number {
  const match = transform.match(/scale\(([^)]+)\)/);
  return match ? Number.parseFloat(match[1]) || 1 : 1;
}

/** Runs a position-aware exit transition on a toast element. */
export function animateNotificationExit(
  el: HTMLElement,
  position: VuNotificationPosition,
  layout: VuNotificationLayout,
  ms: number,
): void {
  const exit = notificationExitOffset(position);
  const scope = el.getRootNode() instanceof ShadowRoot ? (el.getRootNode() as ShadowRoot).host : el;
  const transition =
    layout === "stack"
      ? notificationStackTransition(scope instanceof HTMLElement ? scope : null, ms, "exit")
      : notificationMotionTransition(scope instanceof HTMLElement ? scope : null, ms, "exit");
  const computed = getComputedStyle(el);
  const startOpacity = computed.opacity || el.style.opacity || "1";
  const startTransform = el.style.transform || computed.transform;
  const expandedStack = layout === "stack" && el.classList.contains("is-expanded");

  el.style.transition = "none";
  if (!el.style.transform || el.style.transform === "none") {
    el.style.transform = notificationTransform({ x: 0, y: 0 }, 1);
  }
  el.style.opacity = startOpacity;

  void el.offsetHeight;

  requestAnimationFrame(() => {
    el.style.transition = transition;
    if (layout === "stack") {
      const base = expandedStack ? readTransformOffset(startTransform) : { x: 0, y: 0 };
      const scale = readTransformScale(startTransform);
      el.style.transform = notificationTransform(
        { x: base.x + exit.x, y: base.y + exit.y },
        scale * 0.96,
      );
    } else {
      el.style.transform = notificationTransform(exit, 0.96);
    }
    el.style.opacity = "0";
  });
}
