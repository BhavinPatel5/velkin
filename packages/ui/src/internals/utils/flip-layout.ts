import {
  prefersReducedMotion,
  readMotionDurationMs,
  readMotionEasing,
  type MotionDurationToken,
} from "./motion.js";

export type FlipLayoutOptions = {
  /** Element used to resolve theme motion tokens. */
  scope?: Element | null;
  /** Duration token. Default: `"normal"`. */
  duration?: MotionDurationToken;
};

/**
 * FLIP-animates layout shifts: measure → mutate → play invert on `transform`.
 * Skips when reduced motion is preferred.
 */
export function flipLayout(
  elements: Iterable<Element>,
  mutate: () => void,
  options: FlipLayoutOptions = {},
): void {
  if (prefersReducedMotion()) {
    mutate();
    return;
  }

  const list = [...elements].filter(
    (el): el is HTMLElement => el instanceof HTMLElement && el.isConnected,
  );
  const first = new Map<HTMLElement, DOMRect>();
  for (const el of list) first.set(el, el.getBoundingClientRect());

  mutate();

  const duration = readMotionDurationMs(options.scope, options.duration ?? "normal");
  if (duration <= 0) return;
  const easing = readMotionEasing(options.scope, "enter");

  for (const el of list) {
    if (!el.isConnected) continue;
    const from = first.get(el);
    if (!from) continue;
    const to = el.getBoundingClientRect();
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
    // Cancel in-flight FLIP so rapid dragover stays smooth.
    el.getAnimations().forEach((a) => {
      if (a.id === "vu-flip-layout") a.cancel();
    });
    const anim = el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px)` },
        { transform: "translate(0, 0)" },
      ],
      { duration, easing },
    );
    anim.id = "vu-flip-layout";
  }
}
