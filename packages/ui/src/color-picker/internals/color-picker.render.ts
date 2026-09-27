import { html, nothing, type TemplateResult } from "lit";
import { msg, str } from "../../internals/utils/localize.js";
import { repeat } from "lit/directives/repeat.js";
import {
  hsvToHsl,
  hsvToRgb,
  parseCssColor,
  rgbToCss,
} from "../../internals/utils/color-conversion.js";
import type {
  VuColorAreaChannel,
  VuColorAreaColorSpace,
} from "../../color-area/color-area.types.js";
import type { VuColorSliderOrientation } from "../../color-slider/color-slider.types.js";
import type { VuColorPickerFormat } from "../color-picker.types.js";
import {
  areaRenderable,
  sliderRenderable,
  swatchRenderable,
  dropdownRenderable,
  syncChunkFlagsFromRegistry,
  type ColorPickerChunkHost,
} from "./color-picker-chunks.js";
import type { ColorPickerHandlers } from "./color-picker-handlers.js";
import { type ColorPickerStateHost } from "./color-picker-state.js";

/** Plane channel props forwarded to `<vu-color-area>`. */
export type ColorPickerPlaneAreaProps = {
  hue: number;
  saturation: number;
  brightness: number;
  red: number;
  green: number;
  blue: number;
};

/** Host surface for picker body render. */
export type ColorPickerRenderHost = ColorPickerChunkHost &
  ColorPickerStateHost & {
    label: string;
    formatLabel: string;
    swatchesLabel: string;
    disabled: boolean;
    readonly: boolean;
    planeColorSpace: VuColorAreaColorSpace;
    planeXChannel: VuColorAreaChannel;
    planeYChannel: VuColorAreaChannel;
    planeShowDots: boolean;
    showHueSlider: boolean;
    showInput: boolean;
    showPreview: boolean;
    showFormat: boolean;
    sliderOrientation: VuColorSliderOrientation;
    handlers: ColorPickerHandlers;
  };

/** Accessible label forwarded to area / sliders / input; empty uses locale catalog. */
export function resolvedLabel(host: { label: string }): string {
  return (
    host.label.trim() || String(msg("Color", { desc: "Accessible name for a color control." }))
  );
}

/** Map HSV+A to `<vu-color-area>` channel props for the active plane color space. */
export function planeAreaProps(host: {
  planeColorSpace: VuColorAreaColorSpace;
  _h: number;
  _s: number;
  _v: number;
}): ColorPickerPlaneAreaProps {
  const rgb = hsvToRgb(host._h, host._s, host._v);
  if (host.planeColorSpace === "hsl") {
    const hsl = hsvToHsl(host._h, host._s, host._v);
    return {
      hue: hsl.h,
      saturation: hsl.s,
      brightness: hsl.l,
      red: rgb.r,
      green: rgb.g,
      blue: rgb.b,
    };
  }
  return {
    hue: host._h,
    saturation: host._s,
    brightness: host._v,
    red: rgb.r,
    green: rgb.g,
    blue: rgb.b,
  };
}

/** True when a preset swatch matches current HSV+A (alpha compared when `showAlpha`). */
export function matchesSwatch(
  host: Pick<ColorPickerStateHost, "_h" | "_s" | "_v" | "_a" | "showAlpha">,
  swatch: string,
): boolean {
  const parsed = parseCssColor(swatch);
  if (!parsed) return false;
  const rgb = hsvToRgb(host._h, host._s, host._v);
  const sameRgb = parsed.rgb.r === rgb.r && parsed.rgb.g === rgb.g && parsed.rgb.b === rgb.b;
  if (!sameRgb) return false;
  if (!host.showAlpha) return true;
  return Math.round(parsed.alpha * 100) === Math.round(host._a * 100);
}

/** Render area + sliders + input row + preset swatches. */
export function renderColorPickerBody(
  host: Omit<ColorPickerRenderHost, "handlers">,
  handlers: ColorPickerHandlers,
): TemplateResult {
  syncChunkFlagsFromRegistry(host);
  const pickerLabel = resolvedLabel(host);
  const sliderValue = rgbToCss(hsvToRgb(host._h, host._s, host._v), host._a);
  const plane = planeAreaProps(host);
  const showSliderChrome = host.showHueSlider || host.showAlpha;
  const showInputRow = host.showPreview || host.showInput || host.showFormat;
  const areaReady = areaRenderable(host);
  const sliderReady = sliderRenderable(host);
  const swatchReady = swatchRenderable(host);
  const dropdownReady = dropdownRenderable(host);

  return html`
    <div part="base" aria-label=${pickerLabel} role="group">
      ${
        areaReady
          ? html`
              <vu-color-area
                .colorSpace=${host.planeColorSpace}
                .xChannel=${host.planeXChannel}
                .yChannel=${host.planeYChannel}
                ?showDots=${host.planeShowDots}
                .hue=${plane.hue}
                .saturation=${plane.saturation}
                .brightness=${plane.brightness}
                .red=${plane.red}
                .green=${plane.green}
                .blue=${plane.blue}
                ?disabled=${host.disabled}
                ?readonly=${host.readonly}
                label=${pickerLabel}
                @vu-input=${handlers.onAreaInput}
                @vu-change=${handlers.onAreaChange}
              ></vu-color-area>
            `
          : nothing
      }
      ${
        showSliderChrome && sliderReady
          ? html`
              <div part="sliders">
                ${
                  host.showHueSlider
                    ? html`
                        <vu-color-slider
                          channel="hue"
                          .colorSpace=${"hsb"}
                          .orientation=${host.sliderOrientation}
                          .value=${sliderValue}
                          ?disabled=${host.disabled}
                          ?readonly=${host.readonly}
                          label=${String(msg("Hue", { desc: "Accessible name for the hue slider." }))}
                          @vu-input=${handlers.onHueInput}
                          @vu-change=${handlers.onHueChange}
                        ></vu-color-slider>
                      `
                    : nothing
                }
                ${
                  host.showAlpha
                    ? html`
                        <vu-color-slider
                          channel="alpha"
                          .colorSpace=${"hsb"}
                          .orientation=${host.sliderOrientation}
                          .value=${sliderValue}
                          ?disabled=${host.disabled}
                          ?readonly=${host.readonly}
                          label=${String(msg("Alpha", { desc: "Accessible name for the alpha slider." }))}
                          @vu-input=${handlers.onAlphaInput}
                          @vu-change=${handlers.onAlphaChange}
                        ></vu-color-slider>
                      `
                    : nothing
                }
              </div>
            `
          : nothing
      }
      ${
        showInputRow
          ? html`
              <div part="row">
                ${host.showPreview ? html`<div part="preview" aria-hidden="true"></div>` : nothing}
                ${
                  host.showInput
                    ? html`
                        <input
                          part="input"
                          type="text"
                          spellcheck="false"
                          autocomplete="off"
                          aria-label=${msg(str`${pickerLabel} value`, {
                            desc: "Accessible name for the color picker text input.",
                          })}
                          aria-invalid=${host._inputInvalid ? "true" : "false"}
                          ?disabled=${host.disabled}
                          .readOnly=${host.readonly}
                          .value=${host._inputDraft}
                          @input=${handlers.onInput}
                          @change=${handlers.onInputChange}
                          @blur=${handlers.onInputBlur}
                        />
                      `
                    : nothing
                }
                ${
                  dropdownReady
                    ? html`
                        <vu-dropdown
                          part="format-dropdown"
                          placement="bottom"
                          align="end"
                          .value=${host.format as VuColorPickerFormat}
                          @vu-select=${handlers.onFormatChange}
                        >
                          <button
                            slot="trigger"
                            type="button"
                            part="format"
                            aria-label=${
                              host.formatLabel.trim() ||
                              msg("Color format", {
                                desc: "Accessible name for the color format selector.",
                              })
                            }
                            ?disabled=${host.disabled || host.readonly}
                          >
                            ${host.format.toUpperCase()}
                          </button>
                          <vu-dropdown-item value="hex" label="HEX"></vu-dropdown-item>
                          <vu-dropdown-item value="rgb" label="RGB"></vu-dropdown-item>
                          <vu-dropdown-item value="hsl" label="HSL"></vu-dropdown-item>
                        </vu-dropdown>
                      `
                    : nothing
                }
              </div>
            `
          : nothing
      }
      ${
        swatchReady
          ? html`
              <div
                part="swatches"
                role="listbox"
                aria-label=${
                  host.swatchesLabel.trim() ||
                  msg("Preset colors", { desc: "Accessible name for the preset color list." })
                }
              >
                ${repeat(
                  host.swatches,
                  (c) => c,
                  (c) => html`
                    <vu-color-swatch
                      .color=${c}
                      selectable
                      ?selected=${matchesSwatch(host, c)}
                      ?disabled=${host.disabled}
                      ?readonly=${host.readonly}
                      @vu-select=${handlers.onSwatchSelect}
                    ></vu-color-swatch>
                  `,
                )}
              </div>
            `
          : nothing
      }
    </div>
  `;
}
