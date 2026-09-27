import { parseCssColor, rgbToHsv } from "../../internals/utils/color-conversion.js";
import type { VuColorAreaChangeDetail } from "../../color-area/color-area.js";
import type { VuColorSliderChangeDetail } from "../../color-slider/color-slider.js";
import type { VuColorSwatchSelectDetail } from "../../color-swatch/color-swatch.js";
import type { VuColorPickerFormat } from "../color-picker.types.js";
import {
  formatCurrent,
  publish,
  setHsva,
  type ColorPickerStateHost,
} from "./color-picker-state.js";

/** Minimal host surface for inner control event handlers. */
export type ColorPickerHandlerHost = ColorPickerStateHost & {
  format: VuColorPickerFormat;
  readonly: boolean;
  validateField: () => void;
};

/** Bound handlers for area, sliders, swatches, and text input. */
export type ColorPickerHandlers = {
  onAreaInput: (event: Event) => void;
  onAreaChange: (event: Event) => void;
  onHueInput: (event: Event) => void;
  onHueChange: (event: Event) => void;
  onAlphaInput: (event: Event) => void;
  onAlphaChange: (event: Event) => void;
  onSwatchSelect: (event: Event) => void;
  onInput: (event: Event) => void;
  onInputChange: () => void;
  onInputBlur: () => void;
  onFormatChange: (event: Event) => void;
};

/** Factory for picker event handlers that stop inner propagation and re-emit picker detail. */
export function createColorPickerHandlers(host: ColorPickerHandlerHost): ColorPickerHandlers {
  const onAreaInput = (event: Event): void => {
    event.stopPropagation();
    const detail = (event as CustomEvent<VuColorAreaChangeDetail>).detail;
    const { hsv, rgb } = detail;
    const gray = rgb.r === rgb.g && rgb.g === rgb.b;
    const h = gray ? host._h : hsv.h;
    setHsva(host, h, hsv.s, hsv.v, host._a, ["vu-input"]);
  };

  const onAreaChange = (event: Event): void => {
    event.stopPropagation();
    const detail = (event as CustomEvent<VuColorAreaChangeDetail>).detail;
    const { hsv, rgb } = detail;
    const gray = rgb.r === rgb.g && rgb.g === rgb.b;
    const h = gray ? host._h : hsv.h;
    setHsva(host, h, hsv.s, hsv.v, host._a, ["vu-change"]);
    host.validateField();
  };

  const onHueInput = (event: Event): void => {
    event.stopPropagation();
    const detail = (event as CustomEvent<VuColorSliderChangeDetail>).detail;
    if (detail.channel !== "hue") return;
    setHsva(host, detail.channelValue, host._s, host._v, host._a, ["vu-input"]);
  };

  const onHueChange = (event: Event): void => {
    event.stopPropagation();
    const detail = (event as CustomEvent<VuColorSliderChangeDetail>).detail;
    if (detail.channel !== "hue") return;
    setHsva(host, detail.channelValue, host._s, host._v, host._a, ["vu-change"]);
    host.validateField();
  };

  const onAlphaInput = (event: Event): void => {
    event.stopPropagation();
    const detail = (event as CustomEvent<VuColorSliderChangeDetail>).detail;
    if (detail.channel !== "alpha") return;
    setHsva(host, host._h, host._s, host._v, detail.channelValue, ["vu-input"]);
  };

  const onAlphaChange = (event: Event): void => {
    event.stopPropagation();
    const detail = (event as CustomEvent<VuColorSliderChangeDetail>).detail;
    if (detail.channel !== "alpha") return;
    setHsva(host, host._h, host._s, host._v, detail.channelValue, ["vu-change"]);
    host.validateField();
  };

  const onSwatchSelect = (event: Event): void => {
    if (host.readonly) return;
    event.stopPropagation();
    const detail = (event as CustomEvent<VuColorSwatchSelectDetail>).detail;
    const parsed = parseCssColor(detail.color);
    if (!parsed) return;
    const hsv = rgbToHsv(parsed.rgb);
    const h = parsed.rgb.r === parsed.rgb.g && parsed.rgb.g === parsed.rgb.b ? host._h : hsv.h;
    setHsva(host, h, hsv.s, hsv.v, parsed.alpha, ["vu-input", "vu-change"]);
    host.validateField();
  };

  const onInput = (event: Event): void => {
    if (host.readonly) return;
    const target = event.target as HTMLInputElement;
    host._inputDirty = true;
    host._inputDraft = target.value;
    const parsed = parseCssColor(target.value);
    if (parsed) {
      host._inputInvalid = false;
      const hsv = rgbToHsv(parsed.rgb);
      const h = parsed.rgb.r === parsed.rgb.g && parsed.rgb.g === parsed.rgb.b ? host._h : hsv.h;
      setHsva(host, h, hsv.s, hsv.v, parsed.alpha, ["vu-input"]);
    } else {
      host._inputInvalid = true;
    }
  };

  const onInputChange = (): void => {
    if (host.readonly) return;
    host._inputDirty = false;
    if (host._inputInvalid) {
      host._inputDraft = formatCurrent(host);
      host._inputInvalid = false;
    }
    publish(host, ["vu-change"]);
    host.validateField();
  };

  const onInputBlur = (): void => {
    host._inputDirty = false;
    host._inputDraft = formatCurrent(host);
    host._inputInvalid = false;
    host.validateField();
  };

  const onFormatChange = (event: Event): void => {
    if (host.readonly) return;
    const detail = (event as CustomEvent<{ value: string }>).detail;
    if (detail && detail.value) {
      host.format = detail.value as VuColorPickerFormat;
    }
    host._inputDraft = formatCurrent(host);
    publish(host, ["vu-change"]);
    host.validateField();
  };

  return {
    onAreaInput,
    onAreaChange,
    onHueInput,
    onHueChange,
    onAlphaInput,
    onAlphaChange,
    onSwatchSelect,
    onInput,
    onInputChange,
    onInputBlur,
    onFormatChange,
  };
}
