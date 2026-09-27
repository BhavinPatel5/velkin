/** Intent hue for menu row copy and fills (Role A). */
export type VuDropdownItemColor = "default" | "primary" | "success" | "warning" | "danger";

/** Density preset for row padding and type. */
export type VuDropdownItemSize = "sm" | "md" | "lg";

/** Row interaction pattern inside a menu. */
export type VuDropdownItemKind = "default" | "checkbox" | "radio";

/** `vu-select` when the row is activated. */
export type VuDropdownItemSelectDetail = {
  value: string;
  label: string;
  color: VuDropdownItemColor;
  selected: boolean;
  kind: VuDropdownItemKind;
  checked: boolean;
  href: string;
};
