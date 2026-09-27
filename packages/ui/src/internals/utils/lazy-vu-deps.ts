/** Cached dynamic imports so composite hosts do not pull optional `vu-*` chunks up front. */

let colorAreaPromise: Promise<void> | null = null;
let colorSliderPromise: Promise<void> | null = null;
let colorSwatchPromise: Promise<void> | null = null;
let vuIconPromise: Promise<void> | null = null;
let vuDropdownPromise: Promise<void> | null = null;
let vuDropdownItemPromise: Promise<void> | null = null;

export function ensureVuColorArea(): Promise<void> {
  colorAreaPromise ??= import("../../color-area/color-area.js").then(() => undefined);
  return colorAreaPromise;
}

export function ensureVuColorSlider(): Promise<void> {
  colorSliderPromise ??= import("../../color-slider/color-slider.js").then(
    () => undefined,
  );
  return colorSliderPromise;
}

export function ensureVuColorSwatch(): Promise<void> {
  colorSwatchPromise ??= import("../../color-swatch/color-swatch.js").then(
    () => undefined,
  );
  return colorSwatchPromise;
}

export function ensureVuIcon(): Promise<void> {
  vuIconPromise ??= import("../../icon/icon.js").then(() => undefined);
  return vuIconPromise;
}

export function ensureVuDropdown(): Promise<void> {
  vuDropdownPromise ??= import("../../dropdown/dropdown.js").then(() => undefined);
  return vuDropdownPromise;
}

export function ensureVuDropdownItem(): Promise<void> {
  vuDropdownItemPromise ??= import("../../dropdown-item/dropdown-item.js").then(() => undefined);
  return vuDropdownItemPromise;
}
