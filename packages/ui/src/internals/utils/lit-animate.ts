/**
 * Lit motion can throw when calculateKeyframes returns undefined (same-size FLIP)
 * then frames.forEach / frames[0] runs. Patch Animate here and export local bindings
 * so Rollup does not rewrite consumers onto a raw @lit-labs/motion import.
 */
import {
  animate as litAnimate,
  fade as litFade,
  fadeIn,
  fadeOut,
  fadeInSlow,
  flyAbove,
  flyBelow,
  flyLeft,
  flyRight,
  Animate,
  type Options,
} from "@lit-labs/motion";
import { prefersReducedMotion, readMotionDurationMs, readMotionEasing } from "./motion.js";

/** Lit animate directive (prototype patched below). Import from this module only. */
export const animate = litAnimate;
export const fade = litFade;
export { fadeIn, fadeOut, fadeInSlow, flyAbove, flyBelow, flyLeft, flyRight };

/** Preset enter/exit keyframes aligned with motion-presets scale values. */
export const VU_ENTER_FADE_SCALE: Keyframe[] = [{ opacity: 0, transform: "scale(0.97)" }];
export const VU_EXIT_FADE_SCALE: Keyframe[] = [{ opacity: 0, transform: "scale(0.97)" }];

/** Built-in FLIP / mount presets for vuAnimate(). */
export type VuAnimatePreset = "fade" | "enter-fade-scale" | "none";

/** Options for vuAnimate() — extends Lit motion with theme tokens and presets. */
export type VuAnimateOptions = Options & {
  preset?: VuAnimatePreset;
};

type AnimateHost = {
  calculateKeyframes: (
    from: Record<string, string | number>,
    to: Record<string, string | number>,
    center?: boolean,
  ) => Keyframe[] | undefined;
  hostUpdated: () => Promise<void>;
  options: Options;
};

const patchedAnimate = new WeakSet<object>();

function emptyFlipFrames(): Keyframe[] {
  return [{}, {}];
}

function patchLitAnimatePrototype(ctor: { prototype: object }): void {
  if (patchedAnimate.has(ctor)) return;
  patchedAnimate.add(ctor);
  const proto = ctor.prototype as AnimateHost;
  const originalCalculate = proto.calculateKeyframes;
  proto.calculateKeyframes = function calculateKeyframesSafe(from, to, center) {
    return originalCalculate.call(this, from, to, center) ?? emptyFlipFrames();
  };
  const originalHostUpdated = proto.hostUpdated;
  proto.hostUpdated = async function hostUpdatedSafe(this: AnimateHost) {
    try {
      await originalHostUpdated.call(this);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (/forEach|reading '0'/.test(message)) return;
      throw err;
    }
  };
}

patchLitAnimatePrototype(Animate);

/** Builds Lit animate Options from theme motion tokens and reduced-motion preference. */
export function vuAnimateOptions(
  scope: Element | null | undefined,
  options: VuAnimateOptions = {},
): Options {
  if (options.disabled ?? prefersReducedMotion()) {
    return { ...options, disabled: true };
  }

  const { preset = "none", in: inKeyframes, out: outKeyframes, ...rest } = options;

  let resolvedIn = inKeyframes;
  let resolvedOut = outKeyframes;
  if (preset === "fade") {
    resolvedIn ??= fadeIn;
    resolvedOut ??= fadeOut;
  } else if (preset === "enter-fade-scale") {
    resolvedIn ??= VU_ENTER_FADE_SCALE;
    resolvedOut ??= VU_EXIT_FADE_SCALE;
  }

  return {
    ...rest,
    in: resolvedIn,
    out: resolvedOut,
    properties: rest.properties ?? ["opacity", "transform", "height"],
    keyframeOptions: {
      duration: readMotionDurationMs(scope, "normal"),
      easing: readMotionEasing(scope, "enter"),
      ...rest.keyframeOptions,
    },
  };
}

/** Host AnimateController defaults: timing only — never inherit enter/exit `in`/`out`. */
export function vuLayoutDefaultOptions(
  scope: Element | null | undefined,
  options: VuAnimateOptions = {},
): Options {
  const { preset: _preset, in: _in, out: _out, ...rest } = options;
  const resolved = vuAnimateOptions(scope, { ...rest, preset: "none" });
  const { in: _resolvedIn, out: _resolvedOut, ...timing } = resolved;
  return timing;
}

/** Theme-aware wrapper around the Lit animate directive. */
export function vuAnimate(
  scope: Element | null | undefined,
  options?: VuAnimateOptions,
): ReturnType<typeof litAnimate> {
  return litAnimate(vuAnimateOptions(scope, options));
}
