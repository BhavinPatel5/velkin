import { resolveRadius } from "../../internals/utils/size-resolver.js";
import type { VuSkeletonVariant } from "../skeleton.types.js";

export type SkeletonDimensions = {
  width: string;
  height: string;
  borderRadius: string;
};

const VARIANT_DEFAULTS: Record<VuSkeletonVariant, SkeletonDimensions> = {
  text: {
    width: "100%",
    height: "0.875em",
    borderRadius: "var(--vu-radius-sm)",
  },
  circular: {
    width: "var(--vu-space-10)",
    height: "var(--vu-space-10)",
    borderRadius: "var(--vu-radius-full)",
  },
  rectangular: {
    width: "100%",
    height: "var(--vu-space-10)",
    borderRadius: "var(--vu-radius-md)",
  },
};

/** Merges variant defaults with author overrides for inline skeleton styles. */
export function resolveSkeletonDimensions(
  variant: VuSkeletonVariant,
  width: string,
  height: string,
  radius: string,
): SkeletonDimensions {
  const defaults = VARIANT_DEFAULTS[variant];
  return {
    width: width.trim() || defaults.width,
    height: height.trim() || defaults.height,
    borderRadius:
      radius.trim() && variant !== "circular"
        ? resolveRadius(radius.trim())
        : defaults.borderRadius,
  };
}
