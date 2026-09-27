/** Public type aliases for `<vu-range>`. Re-exported from `range.ts`. */

/** Discrete track scale. */
export type VuRangeSize = "sm" | "md" | "lg";

/** Explicit corner preset; `full` is capsule ends, `none` is square. */
export type VuRangeRadius = "none" | "sm" | "md" | "lg" | "full";

/** Neutral field chrome recipe. */
export type VuRangeVariant = "default" | "outline" | "underline";

/** Neutral surface weight. */
export type VuRangeTone = "subtle" | "normal" | "strong";

/** Payload for `vu-change` after a committed or live range update. */
export type VuRangeChangeDetail = { from: number; to: number };

/** Payload for `vu-invalid`. */
export type VuRangeInvalidDetail = { errors: string[] };

/** Payload for `vu-clear` after `reset()`. */
export type VuRangeClearDetail = { from: number; to: number };
