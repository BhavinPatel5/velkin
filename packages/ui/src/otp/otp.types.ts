/** Public type aliases for `<vu-otp>`. Re-exported from `otp.ts`. */

/** Discrete cell scale. */
export type VuOtpSize = "sm" | "md" | "lg";

/** Explicit corner preset; `full` is capsule ends, `none` is square. */
export type VuOtpRadius = "none" | "sm" | "md" | "lg" | "full";

/** Neutral field chrome recipe. */
export type VuOtpVariant = "default" | "outline" | "underline";

/** Neutral surface weight. */
export type VuOtpTone = "subtle" | "normal" | "strong";

/** Payload for `vu-change` after a committed value update. */
export type VuOtpChangeDetail = { value: string };

/** Payload for `vu-invalid`. */
export type VuOtpInvalidDetail = { errors: string[] };

/** Payload for `vu-clear` after `reset()`. */
export type VuOtpClearDetail = { value: string };
