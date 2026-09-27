/** Public type aliases for `<vu-serial>`. Re-exported from `serial.ts`. */

/** Discrete cell scale. */
export type VuSerialSize = "sm" | "md" | "lg";

/** Explicit corner preset; `full` is capsule ends, `none` is square. */
export type VuSerialRadius = "none" | "sm" | "md" | "lg" | "full";

/** Neutral field chrome recipe. */
export type VuSerialVariant = "default" | "outline" | "underline";

/** Neutral surface weight. */
export type VuSerialTone = "subtle" | "normal" | "strong";

/** Payload for `vu-change` after a committed value update. */
export type VuSerialChangeDetail = { value: string };

/** Payload for `vu-invalid`. */
export type VuSerialInvalidDetail = { errors: string[] };

/** Payload for `vu-clear` after `reset()`. */
export type VuSerialClearDetail = { value: string };
