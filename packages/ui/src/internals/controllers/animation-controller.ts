import type { ReactiveController, ReactiveControllerHost } from "lit";
import {
  bindAnimationFinish,
  MOTION_SPRING,
  motionDurationMs,
  prefersReducedMotion,
  readMotionDurationMs,
  readMotionEasing,
} from "../utils/motion.js";
import { devWarnLayoutWaapiStack, devWarnWaapiCssConflict } from "../utils/dev-warn.js";
import {
  hostHasLayoutAnimateController,
  isLayoutMotionSuppressed,
} from "./layout-animate-controller.js";

/** Fill mode for WAAPI (KeyframeEffectOptions). */
export type FillMode = "none" | "forwards" | "backwards" | "both";

/** Playback direction for WAAPI (KeyframeEffectOptions). */
export type AnimationDirection = "normal" | "reverse" | "alternate" | "alternate-reverse";

/**
 * Options for a single animation run (Web Animations API).
 * @see https://developer.mozilla.org/en-US/docs/Web/API/KeyframeEffect/KeyframeEffect#options
 */
export interface AnimationOptions {
  /** Duration in milliseconds. */
  duration?: number;
  /** Delay before start in milliseconds. */
  delay?: number;
  /** Easing function (CSS easing or cubic-bezier). */
  easing?: string;
  /** Fill mode: 'none' | 'forwards' | 'backwards' | 'both'. */
  fill?: FillMode;
  /** Number of iterations (default 1). */
  iterations?: number;
  /** Playback direction. */
  direction?: AnimationDirection;
  /** End delay in milliseconds. */
  endDelay?: number;
  /** Unique id for the animation (useful for canceling by id). */
  id?: string;
  /** Called when the animation finishes or is skipped (reduced motion / no WAAPI). */
  onFinish?: () => void;
}

/**
 * Keyframes format accepted by Element.animate().
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Keyframe_Formats
 */
export type AnimationKeyframes = Keyframe[] | PropertyIndexedKeyframes;

/**
 * Configuration for the controller defaults (used when not overridden per call).
 */
export interface AnimationControllerConfig {
  defaultDuration?: number;
  defaultEasing?: string;
  defaultFill?: FillMode;
}

/** Direction for slide presets. */
export type SlideDirection = "up" | "down" | "left" | "right";

/**
 * AnimationController – consistent animations via the Web Animations API (WAAPI).
 *
 * Use as a Lit ReactiveController so components get:
 * - Shared defaults (duration, easing, fill)
 * - Preset helpers: fadeIn, fadeOut, slideIn, slideOut, scaleIn, scaleOut
 * - Low-level animate() for custom keyframes
 * - Automatic cancellation of running animations when the host disconnects
 */
export class AnimationController implements ReactiveController {
  readonly host: ReactiveControllerHost;
  private readonly config: Required<AnimationControllerConfig>;
  private readonly running = new Set<Animation>();

  constructor(host: ReactiveControllerHost, config: AnimationControllerConfig = {}) {
    this.host = host;
    const scope = typeof Element !== "undefined" && host instanceof Element ? host : null;
    this.config = {
      defaultDuration: config.defaultDuration ?? readMotionDurationMs(scope, "normal"),
      defaultEasing: config.defaultEasing ?? readMotionEasing(scope, "interactive"),
      defaultFill: config.defaultFill ?? "forwards",
    };
    host.addController(this);
  }

  hostDisconnected(): void {
    this.running.forEach((a) => {
      try {
        a.cancel();
      } catch {
        // ignore
      }
    });
    this.running.clear();
  }

  /**
   * Run a WAAPI animation on an element. Returns the Animation for chaining or await .finished.
   * Running animations are tracked and cancelled when the host disconnects.
   */
  animate(
    element: Element | null | undefined,
    keyframes: AnimationKeyframes,
    options: AnimationOptions = {},
  ): Animation | null {
    if (!element) {
      options.onFinish?.();
      return null;
    }

    const duration = motionDurationMs(options.duration ?? this.config.defaultDuration);
    const easing = options.easing ?? this.config.defaultEasing;
    const fill = options.fill ?? this.config.defaultFill;

    if (typeof element.animate !== "function") {
      options.onFinish?.();
      return null;
    }

    const opts: KeyframeAnimationOptions = {
      duration,
      delay: options.delay ?? 0,
      easing,
      fill,
      iterations: options.iterations ?? 1,
      direction: options.direction ?? "normal",
      endDelay: options.endDelay ?? 0,
      id: options.id,
    };

    const animation = element.animate(keyframes as Keyframe[], opts);
    this.running.add(animation);
    animation.finished
      .then(() => this.running.delete(animation))
      .catch(() => this.running.delete(animation));
    if (options.onFinish) {
      bindAnimationFinish(animation, duration, options.onFinish);
    }
    if (element instanceof HTMLElement) {
      this.warnMotionDev(element, keyframes);
    }
    return animation;
  }

  private warnMotionDev(element: HTMLElement, keyframes: AnimationKeyframes): void {
    if (!(this.host instanceof Element)) return;
    const props = collectAnimatedProperties(keyframes);
    if (props.length > 0) {
      devWarnWaapiCssConflict(this.host, element, props);
    }
  }

  private warnLayoutWaapiStack(): void {
    if (!(this.host instanceof Element)) return;
    if (!hostHasLayoutAnimateController(this.host)) return;
    if (isLayoutMotionSuppressed(this.host)) return;
    devWarnLayoutWaapiStack(this.host);
  }

  /** Fade + scale in with theme enter easing (overlay open). */
  enterFadeScale(
    element: Element | null | undefined,
    options: AnimationOptions & {
      fromScale?: number;
      transformOrigin?: string;
    } = {},
  ): Animation | null {
    this.warnLayoutWaapiStack();
    const scope = this.motionScope(element);
    const from = options.fromScale ?? 0.95;
    const origin = options.transformOrigin ?? "center center";
    return this.animate(
      element,
      [
        { opacity: 0, transform: `scale(${from})`, transformOrigin: origin },
        { opacity: 1, transform: "scale(1)", transformOrigin: origin },
      ],
      {
        ...options,
        duration: options.duration ?? readMotionDurationMs(scope, "slow"),
        easing: options.easing ?? readMotionEasing(scope, "enter"),
      },
    );
  }

  /** Soft-spring fade + scale enter (dialog / playful overlay open). */
  enterFadeScaleSpring(
    element: Element | null | undefined,
    options: AnimationOptions & {
      fromScale?: number;
      transformOrigin?: string;
    } = {},
  ): Animation | null {
    return this.enterFadeScale(element, {
      ...options,
      fromScale: options.fromScale ?? 0.92,
      easing: options.easing ?? MOTION_SPRING.soft,
    });
  }

  /** Fade + scale out with theme exit easing (overlay close). */
  exitFadeScale(
    element: Element | null | undefined,
    options: AnimationOptions & {
      toScale?: number;
      transformOrigin?: string;
    } = {},
  ): Animation | null {
    this.warnLayoutWaapiStack();
    const scope = this.motionScope(element);
    const to = options.toScale ?? 0.95;
    const origin = options.transformOrigin ?? "center center";
    return this.animate(
      element,
      [
        { opacity: 1, transform: "scale(1)", transformOrigin: origin },
        { opacity: 0, transform: `scale(${to})`, transformOrigin: origin },
      ],
      {
        ...options,
        duration: options.duration ?? readMotionDurationMs(scope, "fast"),
        easing: options.easing ?? readMotionEasing(scope, "exit"),
      },
    );
  }

  /** Brief scale pulse when a persistent overlay rejects dismiss. */
  highlightPulse(
    element: Element | null | undefined,
    options: AnimationOptions & {
      scale?: number;
      transformPrefix?: string;
    } = {},
  ): Animation | null {
    if (prefersReducedMotion()) return null;
    const scope = this.motionScope(element);
    const peak = options.scale ?? 1.05;
    const prefix = options.transformPrefix;
    const transform = (scale: number): string => {
      const part = `scale(${scale})`;
      return prefix ? `${prefix} ${part}` : part;
    };
    return this.animate(
      element,
      [{ transform: transform(1) }, { transform: transform(peak) }, { transform: transform(1) }],
      {
        ...options,
        duration: options.duration ?? readMotionDurationMs(scope, "slow"),
        easing: options.easing ?? readMotionEasing(scope, "interactive"),
      },
    );
  }

  private motionScope(element: Element | null | undefined): Element | null {
    if (this.host instanceof Element) return this.host;
    return element instanceof Element ? element : null;
  }

  /**
   * Fade in: opacity 0 → 1.
   */
  fadeIn(element: Element | null | undefined, options: AnimationOptions = {}): Animation | null {
    return this.animate(element, [{ opacity: 0 }, { opacity: 1 }], options);
  }

  /**
   * Fade out: opacity 1 → 0.
   */
  fadeOut(element: Element | null | undefined, options: AnimationOptions = {}): Animation | null {
    return this.animate(element, [{ opacity: 1 }, { opacity: 0 }], options);
  }

  /**
   * Slide in from the given direction (translate from off-screen to 0).
   */
  slideIn(
    element: Element | null | undefined,
    options: AnimationOptions & { direction?: SlideDirection } = {},
  ): Animation | null {
    const dir = options.direction ?? "down";
    const [fromX, fromY] = slideOffset(dir, true);
    const keyframes: Keyframe[] = [
      { transform: `translate(${fromX}, ${fromY})` },
      { transform: "translate(0, 0)" },
    ];
    return this.animate(element, keyframes, options);
  }

  /**
   * Slide out toward the given direction (translate from 0 to off-screen).
   */
  slideOut(
    element: Element | null | undefined,
    options: AnimationOptions & { direction?: SlideDirection } = {},
  ): Animation | null {
    const dir = options.direction ?? "up";
    const [toX, toY] = slideOffset(dir, false);
    const keyframes: Keyframe[] = [
      { transform: "translate(0, 0)" },
      { transform: `translate(${toX}, ${toY})` },
    ];
    return this.animate(element, keyframes, options);
  }

  /**
   * Scale in: scale(0) or scale(0.9) → scale(1). Optionally combine with opacity.
   */
  scaleIn(
    element: Element | null | undefined,
    options: AnimationOptions & { fromScale?: number; opacity?: boolean } = {},
  ): Animation | null {
    const from = options.fromScale ?? 0.95;
    const withOpacity = options.opacity !== false;
    const keyframes: Keyframe[] = withOpacity
      ? [
          { transform: `scale(${from})`, opacity: 0 },
          { transform: "scale(1)", opacity: 1 },
        ]
      : [{ transform: `scale(${from})` }, { transform: "scale(1)" }];
    return this.animate(element, keyframes, options);
  }

  /**
   * Scale out: scale(1) → scale(0.95) or custom. Optionally combine with opacity.
   */
  scaleOut(
    element: Element | null | undefined,
    options: AnimationOptions & { toScale?: number; opacity?: boolean } = {},
  ): Animation | null {
    const to = options.toScale ?? 0.95;
    const withOpacity = options.opacity !== false;
    const keyframes: Keyframe[] = withOpacity
      ? [
          { transform: "scale(1)", opacity: 1 },
          { transform: `scale(${to})`, opacity: 0 },
        ]
      : [{ transform: "scale(1)" }, { transform: `scale(${to})` }];
    return this.animate(element, keyframes, options);
  }

  /**
   * Cancel a specific animation (e.g. one you stored from animate() or a preset).
   */
  cancel(animation: Animation): void {
    animation.cancel();
    this.running.delete(animation);
  }

  /**
   * Cancel all animations currently running for this controller.
   */
  cancelAll(): void {
    this.running.forEach((a) => {
      try {
        a.cancel();
      } catch {
        // ignore
      }
    });
    this.running.clear();
  }
}

function slideOffset(direction: SlideDirection, isIn: boolean): [string, string] {
  const pct = "100%";
  switch (direction) {
    case "up":
      return ["0", isIn ? pct : `-${pct}`];
    case "down":
      return ["0", isIn ? `-${pct}` : pct];
    case "left":
      return [isIn ? pct : `-${pct}`, "0"];
    case "right":
      return [isIn ? `-${pct}` : pct, "0"];
    default:
      return ["0", isIn ? `-${pct}` : pct];
  }
}

function collectAnimatedProperties(keyframes: AnimationKeyframes): string[] {
  const props = new Set<string>();
  const list = Array.isArray(keyframes) ? keyframes : Object.keys(keyframes);
  for (const frame of list) {
    if (typeof frame !== "object" || frame === null) continue;
    for (const key of Object.keys(frame)) {
      if (key === "offset" || key === "easing" || key === "composite") continue;
      props.add(key);
    }
  }
  return [...props];
}
