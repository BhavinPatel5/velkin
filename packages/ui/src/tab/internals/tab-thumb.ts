import {
  motionDurationMs,
  prefersReducedMotion,
  readMotionDurationMs,
  readMotionEasing,
} from "../../internals/utils/motion.js";
import { canUseRaf, canUseResizeObserver, isClient } from "../../internals/utils/env.js";

/** Surface the indicator positioner reads and mutates on the host. */
export type TabThumbHost = {
  readonly renderRoot: HTMLElement | DocumentFragment;
  readonly shadowRoot: ShadowRoot | null;
  readonly index: number;
  readonly ready: boolean;
  readonly initialRenderComplete: boolean;
  isConnected: boolean;
  closest(selector: string): Element | null;
  /** Active segment node for indicator measurement (`.btn` or `<vu-tab-item>`). */
  segmentAt(index: number): HTMLElement | null;
};

type ThumbState = {
  animation?: Animation;
  updateScheduled: boolean;
  resizeTimeout?: number;
  windowResizeTimeout?: number;
};

const thumbStateByHost = new WeakMap<object, ThumbState>();

const INDICATOR_VARS = {
  x: "--tab-indicator-x",
  y: "--tab-indicator-y",
  w: "--tab-indicator-w",
  h: "--tab-indicator-h",
  opacity: "--tab-indicator-opacity",
} as const;

function thumbState(host: object): ThumbState {
  let state = thumbStateByHost.get(host);
  if (!state) {
    state = { updateScheduled: false };
    thumbStateByHost.set(host, state);
  }
  return state;
}

/** Writes measured indicator geometry to track CSS variables. */
export function applyTabIndicatorVars(
  wrap: HTMLElement,
  x: number,
  y: number,
  width: number,
  height: number,
  opacity: number,
): void {
  wrap.style.setProperty(INDICATOR_VARS.x, `${x}px`);
  wrap.style.setProperty(INDICATOR_VARS.y, `${y}px`);
  wrap.style.setProperty(INDICATOR_VARS.w, `${width}px`);
  wrap.style.setProperty(INDICATOR_VARS.h, `${height}px`);
  wrap.style.setProperty(INDICATOR_VARS.opacity, String(opacity));
}

/** True when the host is visible enough to measure indicator geometry. */
export function isTabVisible(host: TabThumbHost): boolean {
  if (!host.isConnected) return false;
  if (host instanceof Element) {
    const style = window.getComputedStyle(host);
    if (style.display === "none" || style.visibility === "hidden") return false;
  }
  const dialog = host.closest("vu-dialog, dialog");
  if (dialog && !dialog.hasAttribute("open")) return false;
  return true;
}

/** Coalesces indicator layout work to the next animation frame. */
export function scheduleTabThumbUpdate(host: TabThumbHost): void {
  if (!canUseRaf()) return;
  const state = thumbState(host);
  if (state.updateScheduled) return;
  state.updateScheduled = true;
  requestAnimationFrame(() => {
    positionTabThumb(host);
    state.updateScheduled = false;
  });
}

/** Positions the sliding indicator behind the active segment (WAAPI + CSS var track). */
export function positionTabThumb(host: TabThumbHost): void {
  if (!isClient()) return;
  const root = host.shadowRoot ?? host.renderRoot;
  if (!root || typeof root.querySelector !== "function") return;
  const wrap = root.querySelector(".wrap") as HTMLElement | null;
  const active = host.segmentAt(host.index);
  const indicator = wrap?.querySelector(".indicator") as HTMLElement | null;
  const state = thumbState(host);

  if (!wrap || !active || !indicator || !host.ready) {
    if (host.initialRenderComplete && !state.updateScheduled) {
      requestAnimationFrame(() => positionTabThumb(host));
    }
    return;
  }

  if (!isTabVisible(host)) {
    applyTabIndicatorVars(wrap, 0, 0, 0, 0, 0);
    return;
  }

  const wrapRect = wrap.getBoundingClientRect();
  const activeRect = active.getBoundingClientRect();

  if (
    wrapRect.width === 0 ||
    wrapRect.height === 0 ||
    activeRect.width === 0 ||
    activeRect.height === 0
  ) {
    if (host.initialRenderComplete && !state.updateScheduled) {
      setTimeout(() => positionTabThumb(host), 50);
    }
    return;
  }

  const computed = getComputedStyle(wrap);
  const padLeft = Number.parseFloat(computed.paddingLeft || "0");
  const padTop = Number.parseFloat(computed.paddingTop || "0");

  const localWidth = wrap.clientWidth || wrapRect.width;
  const localHeight = wrap.clientHeight || wrapRect.height;
  const scaleX = localWidth ? wrapRect.width / localWidth : 1;
  const scaleY = localHeight ? wrapRect.height / localHeight : 1;

  const xScreen = activeRect.left - wrapRect.left - padLeft * scaleX;
  const yScreen = activeRect.top - wrapRect.top - padTop * scaleY;
  const xLocal = xScreen / (scaleX || 1);
  const yLocal = yScreen / (scaleY || 1);
  const indicatorWidth = Math.max(1, activeRect.width / (scaleX || 1));
  const indicatorHeight = Math.max(1, activeRect.height / (scaleY || 1));
  const targetTransform = `translate(${xLocal}px, ${yLocal}px)`;
  const targetWidth = `${indicatorWidth}px`;
  const targetHeight = `${indicatorHeight}px`;

  applyTabIndicatorVars(wrap, xLocal, yLocal, indicatorWidth, indicatorHeight, 1);

  if (prefersReducedMotion()) {
    return;
  }

  const scope = host instanceof Element ? host : null;
  const duration = motionDurationMs(readMotionDurationMs(scope, "normal"));
  const easing = readMotionEasing(scope, "interactive");
  const cs = getComputedStyle(indicator);
  const keyframes: Keyframe[] = [
    {
      transform: cs.transform || "translate(0, 0)",
      width: cs.width || "var(--vu-space-0)",
      height: cs.height || "var(--vu-space-0)",
      opacity: Number.parseFloat(cs.opacity || "0"),
    },
    {
      transform: targetTransform,
      width: targetWidth,
      height: targetHeight,
      opacity: 1,
    },
  ];

  state.animation?.cancel();
  state.animation = indicator.animate(keyframes, {
    duration,
    easing,
    fill: "forwards",
  });
}

/** Wires ResizeObserver, IntersectionObserver, and window resize to indicator updates. */
export function connectTabThumbObservers(
  host: TabThumbHost & HTMLElement,
  onUpdate: () => void,
):
  | {
      disconnect(): void;
      onWindowResize(): void;
    }
  | undefined {
  if (!canUseResizeObserver() || !canUseRaf()) {
    return undefined;
  }

  const state = thumbState(host);
  const resizeObserver = new ResizeObserver(() => {
    if (state.resizeTimeout) window.clearTimeout(state.resizeTimeout);
    state.resizeTimeout = window.setTimeout(onUpdate, 50);
  });

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onUpdate();
      }
    },
    { threshold: 0.1 },
  );

  requestAnimationFrame(() => {
    resizeObserver.observe(host);
    intersectionObserver.observe(host);
    onUpdate();
  });

  return {
    disconnect() {
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      state.animation?.cancel();
      if (state.resizeTimeout) window.clearTimeout(state.resizeTimeout);
      if (state.windowResizeTimeout) window.clearTimeout(state.windowResizeTimeout);
    },
    onWindowResize() {
      if (state.windowResizeTimeout) {
        window.clearTimeout(state.windowResizeTimeout);
      }
      state.windowResizeTimeout = window.setTimeout(() => {
        state.windowResizeTimeout = undefined;
        onUpdate();
      }, 50);
    },
  };
}

/** Clears indicator animation state when the host disconnects. */
export function disconnectTabThumb(host: object): void {
  const state = thumbStateByHost.get(host);
  state?.animation?.cancel();
  thumbStateByHost.delete(host);
}
