/** Public type aliases for `<vu-slider>`. Re-exported from `slider.ts`. */

/** Discrete track scale. */
export type VuSliderSize = "sm" | "md" | "lg";

/** Explicit corner preset; `full` is capsule ends, `none` is square. */
export type VuSliderRadius = "none" | "sm" | "md" | "lg" | "full";

/** Neutral field chrome recipe. */
export type VuSliderVariant = "default" | "outline" | "underline";

/** Neutral surface weight. */
export type VuSliderTone = "subtle" | "normal" | "strong";

/** Payload for `vu-change` after a committed or live value update. */
export type VuSliderChangeDetail = { value: number };

/** Payload for `vu-invalid`. */
export type VuSliderInvalidDetail = { errors: string[] };

/** Payload for `vu-clear` after `reset()`. */
export type VuSliderClearDetail = { value: number };
