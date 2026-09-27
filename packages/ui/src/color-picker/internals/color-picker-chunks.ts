import {
  ensureVuColorArea,
  ensureVuColorSlider,
  ensureVuColorSwatch,
  ensureVuDropdown,
  ensureVuDropdownItem,
} from "../../internals/utils/lazy-vu-deps.js";

/** Lazy-chunk host surface for `<vu-color-picker>` child custom elements. */
export type ColorPickerChunkHost = {
  showArea: boolean;
  showHueSlider: boolean;
  showAlpha: boolean;
  showFormat: boolean;
  swatches: string[];
  _areaChunkReady: boolean;
  _sliderChunkReady: boolean;
  _swatchChunkReady: boolean;
  _dropdownChunkReady: boolean;
  _chunkLoadToken: number;
  requestUpdate: () => void;
};

/** True when the color-area chunk must be loaded. */
export function needsAreaChunk(host: ColorPickerChunkHost): boolean {
  return host.showArea;
}

/** True when hue or alpha slider chunks must be loaded. */
export function needsSliderChunk(host: ColorPickerChunkHost): boolean {
  return host.showHueSlider || host.showAlpha;
}

/** True when preset swatch chunk must be loaded. */
export function needsSwatchChunk(host: ColorPickerChunkHost): boolean {
  return host.swatches.length > 0;
}

/** True when format dropdown must be loaded. */
export function needsDropdownChunk(host: ColorPickerChunkHost): boolean {
  return host.showFormat;
}

/** Area pad can render (chunk registered or already loaded). */
export function areaRenderable(host: ColorPickerChunkHost): boolean {
  return host.showArea && (host._areaChunkReady || !!customElements.get("vu-color-area"));
}

/** Slider row can render (chunk registered or already loaded). */
export function sliderRenderable(host: ColorPickerChunkHost): boolean {
  return (
    (host.showHueSlider || host.showAlpha) &&
    (host._sliderChunkReady || !!customElements.get("vu-color-slider"))
  );
}

/** Swatch palette can render (chunk registered or already loaded). */
export function swatchRenderable(host: ColorPickerChunkHost): boolean {
  return (
    host.swatches.length > 0 && (host._swatchChunkReady || !!customElements.get("vu-color-swatch"))
  );
}

/** Dropdown can render (chunk registered or already loaded). */
export function dropdownRenderable(host: ColorPickerChunkHost): boolean {
  return (
    host.showFormat && (host._dropdownChunkReady || (!!customElements.get("vu-dropdown") && !!customElements.get("vu-dropdown-item")))
  );
}

export function syncChunkFlagsFromRegistry(host: ColorPickerChunkHost): void {
  if (needsAreaChunk(host) && customElements.get("vu-color-area")) {
    host._areaChunkReady = true;
  }
  if (needsSliderChunk(host) && customElements.get("vu-color-slider")) {
    host._sliderChunkReady = true;
  }
  if (needsSwatchChunk(host) && customElements.get("vu-color-swatch")) {
    host._swatchChunkReady = true;
  }
  if (needsDropdownChunk(host) && customElements.get("vu-dropdown") && customElements.get("vu-dropdown-item")) {
    host._dropdownChunkReady = true;
  }
}

/** Dynamically import child `vu-*` chunks on first need; no-op when already ready. */
export async function ensureChildChunks(host: ColorPickerChunkHost): Promise<void> {
  syncChunkFlagsFromRegistry(host);
  const token = ++host._chunkLoadToken;
  const tasks: Promise<void>[] = [];
  if (needsAreaChunk(host) && !host._areaChunkReady) {
    tasks.push(
      ensureVuColorArea().then(() => {
        if (token === host._chunkLoadToken) host._areaChunkReady = true;
      }),
    );
  }
  if (needsSliderChunk(host) && !host._sliderChunkReady) {
    tasks.push(
      ensureVuColorSlider().then(() => {
        if (token === host._chunkLoadToken) host._sliderChunkReady = true;
      }),
    );
  }
  if (needsSwatchChunk(host) && !host._swatchChunkReady) {
    tasks.push(
      ensureVuColorSwatch().then(() => {
        if (token === host._chunkLoadToken) host._swatchChunkReady = true;
      }),
    );
  }
  if (needsDropdownChunk(host) && !host._dropdownChunkReady) {
    tasks.push(
      Promise.all([ensureVuDropdown(), ensureVuDropdownItem()]).then(() => {
        if (token === host._chunkLoadToken) host._dropdownChunkReady = true;
      }),
    );
  }
  if (!tasks.length) return;
  await Promise.all(tasks);
  if (token === host._chunkLoadToken) host.requestUpdate();
}
