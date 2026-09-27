import {
  bindAnimationFinish,
  MOTION_SPRING,
  motionDurationMs,
  readMotionEasing,
  prefersReducedMotion,
} from "./motion.js";

/** Options shared by enter/exit overlay presets. */
export interface MotionEnterExitOptions {
  durationMs: number;
  onFinish?: () => void;
  scope?: Element | null;
  fromScale?: number;
  toScale?: number;
  transformOrigin?: string;
  /** Override theme enter/exit easing (e.g. MOTION_SPRING.soft). */
  easing?: string;
}

/** Options for a brief reject/dismiss pulse on a panel. */
export interface MotionHighlightOptions {
  scope?: Element | null;
  scale?: number;
  /** Prepended to scale keyframes (e.g. `translateX(0)` for sliding panels). */
  transformPrefix?: string;
}

function runWaapi(
  element: HTMLElement,
  keyframes: Keyframe[],
  durationMs: number,
  easing: string,
  onFinish?: () => void,
): Animation | null {
  if (typeof element.animate !== "function") {
    onFinish?.();
    return null;
  }
  const duration = motionDurationMs(durationMs);
  const animation = element.animate(keyframes, {
    duration,
    easing,
    fill: "forwards",
  });
  bindAnimationFinish(animation, duration, onFinish);
  return animation;
}

function scaleTransform(prefix: string | undefined, scale: number): string {
  const scalePart = `scale(${scale})`;
  return prefix ? `${prefix} ${scalePart}` : scalePart;
}

function withTransformOrigin(keyframe: Keyframe, transformOrigin?: string): Keyframe {
  if (!transformOrigin) return keyframe;
  return { ...keyframe, transformOrigin };
}

/** Fade + scale in (opacity 0 → 1, scale 0.95 → 1). */
export function animateEnterFadeScale(
  element: HTMLElement,
  options: MotionEnterExitOptions,
): Animation | null {
  const from = options.fromScale ?? 0.95;
  const easing =
    options.easing ?? readMotionEasing(options.scope ?? element, "enter");
  const origin = options.transformOrigin ?? "center center";
  return runWaapi(
    element,
    [
      withTransformOrigin(
        {
          opacity: 0,
          transform: scaleTransform(undefined, from),
        },
        origin,
      ),
      withTransformOrigin(
        {
          opacity: 1,
          transform: scaleTransform(undefined, 1),
        },
        origin,
      ),
    ],
    options.durationMs,
    easing,
    options.onFinish,
  );
}

/** Soft-spring fade + scale enter for dialogs / playful overlays. */
export function animateEnterFadeScaleSpring(
  element: HTMLElement,
  options: MotionEnterExitOptions,
): Animation | null {
  return animateEnterFadeScale(element, {
    ...options,
    fromScale: options.fromScale ?? 0.92,
    easing: options.easing ?? MOTION_SPRING.soft,
  });
}

/** Fade + scale out (opacity 1 → 0, scale 1 → 0.95). */
export function animateExitFadeScale(
  element: HTMLElement,
  options: MotionEnterExitOptions,
): Animation | null {
  const to = options.toScale ?? 0.95;
  const easing =
    options.easing ?? readMotionEasing(options.scope ?? element, "exit");
  const origin = options.transformOrigin ?? "center center";
  return runWaapi(
    element,
    [
      withTransformOrigin(
        {
          opacity: 1,
          transform: scaleTransform(undefined, 1),
        },
        origin,
      ),
      withTransformOrigin(
        {
          opacity: 0,
          transform: scaleTransform(undefined, to),
        },
        origin,
      ),
    ],
    options.durationMs,
    easing,
    options.onFinish,
  );
}

/** Brief scale pulse when a persistent overlay rejects dismiss. */
export function animateHighlightPulse(
  element: HTMLElement,
  options: MotionHighlightOptions = {},
): Animation | null {
  if (prefersReducedMotion()) return null;
  if (typeof element.animate !== "function") return null;

  const scale = options.scale ?? 1.05;
  const prefix = options.transformPrefix;
  const easing = readMotionEasing(options.scope ?? element, "interactive");
  return element.animate(
    [
      { transform: scaleTransform(prefix, 1) },
      { transform: scaleTransform(prefix, scale) },
      { transform: scaleTransform(prefix, 1) },
    ],
    { duration: motionDurationMs(300), easing },
  );
}
