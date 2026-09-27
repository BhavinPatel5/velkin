/** Visual chip treatments — same archetypes as `vu-button`, plus `dot` for status pips. */
export type VuChipVariant = "solid" | "soft" | "outline" | "ghost" | "dot";

/** Intent palette; token keys only (same vocabulary as vu-button). */
export type VuChipColor = "default" | "primary" | "success" | "warning" | "danger";

/** Discrete padding + type scale; `sm`|`md`|`lg` match button for relay, `xs`/`xl` are density extras. */
export type VuChipSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Explicit corner preset; `full` is capsule ends, `none` is square. */
export type VuChipRadius = "none" | "sm" | "md" | "lg" | "full";

/** Who initiated close — mirrors `vu-alert` close reasons. */
export type VuChipCloseReason = "user" | "method";

/** Payload for cancelable `vu-close` before optional host removal. */
export type VuChipCloseDetail = {
  label: string;
  value: string;
  reason: VuChipCloseReason;
};

/** Payload for `vu-change` when an interactive chip toggles `selected`. */
export type VuChipChangeDetail = {
  selected: boolean;
  value: string;
  label: string;
};
