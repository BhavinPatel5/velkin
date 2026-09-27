import type { VuTabNormalizedItem } from "../tab.types.js";

/** Value surface shared by selection helpers. */
export type TabValueHost = {
  defaultValue: string;
  value: string | undefined;
  internalValue: string;
  controlled: boolean;
};

/** Effective selected segment value (controlled `value` or internal state). */
export function tabSelectedValue(host: TabValueHost): string {
  return host.controlled ? (host.value ?? "") : host.internalValue;
}

/** Seeds internal selection from `defaultValue` and available segments. */
export function seedTabInternalValue(items: VuTabNormalizedItem[], defaultValue: string): string {
  const values = items.map((item) => item.value);
  if (!values.length) return "";
  if (defaultValue && values.includes(defaultValue)) return defaultValue;
  return values[0];
}

/** Clamps selection to the first item when empty or invalid. */
export function ensureTabValue(items: VuTabNormalizedItem[], value: string): string {
  const values = items.map((item) => item.value);
  if (!values.length) return "";
  if (!values.includes(value)) return values[0];
  return value;
}
