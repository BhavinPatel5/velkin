/** Field chrome scale (Role E); mirrors `VuCounterSize`. */
export type VuComboboxSize = "sm" | "md" | "lg";

/** Explicit corner preset; `full` is capsule ends, `none` is square. */
export type VuComboboxRadius = "none" | "sm" | "md" | "lg" | "full";

/** Neutral surface weight for field chrome (`variant` + `tone`, no intent `color`). */
export type { VuSurfaceTone as VuComboboxTone } from "../internals/utils/surface-tone.js";

/** Visual treatment of the field chrome (Role E field variants). */
export type { VuFieldVariant as VuComboboxVariant } from "../internals/utils/field-variant.js";

import type { TemplateResult } from "lit";

/** Primitive string or `{ label, value }` object entry in `options`. */
export type VuComboboxOption = string | { label: string; value: string; [key: string]: unknown };

/** Single-select value or multi-select value array. */
export type VuComboboxValue = string | string[];

/** Context passed to `renderer` for each dropdown row. */
export type VuComboboxRendererContext = {
  option: VuComboboxOption;
  index: number;
  label: string;
  /** Plain label text (never HTML); default UI highlights via Lit segments. */
  highlighted: string;
  selected: boolean;
  active: boolean;
};

/** Per-row renderer for `renderer`; return null/undefined for the default label. */
export type VuComboboxRendererFn = (
  context: VuComboboxRendererContext,
) => TemplateResult | string | null | undefined;

/** Filtered option row used for list rendering. */
export type VuComboboxFilteredRow = {
  original: VuComboboxOption;
  _idx: number;
  label: string;
  highlighted: string;
};

/** `vu-change` when the committed selection changes. */
export type VuComboboxChangeDetail = {
  value: VuComboboxValue;
  selectedItems: VuComboboxOption[];
};

/** `vu-input` when the field filter query changes. */
export type VuComboboxInputDetail = { query: string };

/** `vu-invalid` when validation messages are recomputed. */
export type VuComboboxInvalidDetail = { errors: string[] };

/** `vu-add` when the user confirms creating a new option from filter text. */
export type VuComboboxAddDetail = { value: string };
