import { localized } from "@lit/localize";
import { html, nothing, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { PopoverController } from "../internals/controllers/popover-controller.js";
import type { CloseReason } from "../internals/controllers/popover-controller.js";
import {
  FormControlBase,
  type FormState,
} from "../internals/form/form-control-base.js";
import { FieldValidationController } from "../internals/form/field-validation-controller.js";
import { requiredFieldValidator } from "../internals/form/field-validation.js";
import { renderFieldErrors } from "../internals/form/field-validation-render.js";
import { isClient } from "../internals/utils/env.js";
import type {
  VuColorAreaChannel,
  VuColorAreaColorSpace,
} from "../color-area/color-area.types.js";
import type { VuColorSliderOrientation } from "../color-slider/color-slider.types.js";
import { colorPickerStyles } from "./color-picker.style.js";
import type {
  VuColorPickerChangeDetail,
  VuColorPickerFormat,
  VuColorPickerPlacement,
  VuColorPickerTrigger,
} from "./color-picker.types.js";
import {
  ensureChildChunks,
  syncChunkFlagsFromRegistry,
} from "./internals/color-picker-chunks.js";
import { createColorPickerHandlers } from "./internals/color-picker-handlers.js";
import { colorPickerPopoverOptions } from "./internals/color-picker.popover.js";
import {
  formatCurrent,
  ingestValue,
  type ColorPickerHsvaState,
} from "./internals/color-picker-state.js";
import {
  renderColorPickerBody,
  resolvedLabel,
  type ColorPickerRenderHost,
} from "./internals/color-picker.render.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuColorPickerChangeDetail,
  VuColorPickerFormat,
  VuColorPickerPlacement,
  VuColorPickerTrigger,
  VuColorPickerPlaneChannel,
  VuColorPickerPlaneColorSpace,
  VuColorPickerSliderOrientation,
} from "./color-picker.types.js";

export type { ColorPickerHsvaState };

const PLANE_COLOR_SPACES = new Set<VuColorAreaColorSpace>(["hsb", "hsl", "rgb"]);
const SLIDER_ORIENTATIONS = new Set<VuColorSliderOrientation>(["horizontal", "vertical"]);

/**
 * @element vu-color-picker
 *
 * @summary A color picker component with swatches, sliders, and input field.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/color-picker
 * @dependency vu-color-area
 * @dependency vu-color-slider
 * @dependency vu-color-swatch
 *
 * @uiVModel value vu-change
 *
 * @property {string} value - Selected color as hex, rgb(), hsl(), or a named CSS color. Default: `"#3b82f6"`.
 * @property {VuColorPickerFormat} format - Text field and emitted string format. Default: `"hex"`.
 * @property {boolean} showalpha - Renders the alpha slider (`showalpha` attr). Default: `false`.
 * @property {boolean} showformat - Renders the hex / rgb / hsl format `<select>` (`showformat` attr). Default: `true`.
 * @property {string[]} swatches - Optional preset palette of CSS color strings.
 * @property {string} label - Accessible name forwarded to area, sliders, and input.
 * @property {string} formatlabel - Accessible name for the format `<select>` (`formatlabel` prop).
 * @property {string} swatcheslabel - Accessible name for the preset swatch list (`swatcheslabel` prop).
 * @property {VuColorPickerTrigger} trigger - `inline` panel or `swatch` popover opener. Default: `"inline"`.
 * @property {VuColorPickerPlacement} placement - Popover placement when `trigger="swatch"`. Default: `"bottom-start"`.
 * @property {boolean} open - Popover open state when `trigger="swatch"`. Default: `false`.
 * @property {VuColorAreaColorSpace} planecolorspace - 2D pad color model (`planecolorspace` attr). Default: `"hsb"`.
 * @property {VuColorAreaChannel} planexchannel - Horizontal pad axis (`planexchannel` attr). Default: `"saturation"`.
 * @property {VuColorAreaChannel} planeychannel - Vertical pad axis (`planeychannel` attr). Default: `"brightness"`.
 * @property {boolean} planeshowdots - Passes `showdots` to `<vu-color-area>` (`planeshowdots` attr). Default: `false`.
 * @property {boolean} showarea - Renders the 2D color pad (`showarea` attr). Default: `true`.
 * @property {boolean} showhueslider - Renders the hue gradient slider (`showhueslider` attr). Default: `true`.
 * @property {boolean} showinput - Renders the text color field (`showinput` attr). Default: `true`.
 * @property {boolean} showpreview - Renders the live preview chip (`showpreview` attr). Default: `true`.
 * @property {VuColorSliderOrientation} sliderorientation - Hue and alpha slider axis (`sliderorientation` attr). Default: `"horizontal"`.
 * @property {string} name - Form field name for submit.
 * @property {string} defaultvalue - Value restored on `<form reset>` (`defaultvalue` attr).
 * @property {string} formid - External `<form>` id (`formid` attr).
 * @property {boolean} disabled - Non-interactive; blocks popover and input.
 * @property {boolean} readonly - Focusable but value cannot be edited.
 * @property {boolean} required - Blocks valid submit when empty.
 * @property {string} requiredmessage - Custom `valueMissing` message (`requiredmessage` attr).
 * @property {boolean} showerrors - Shows validation after activation (`showerrors` attr). Default: `false`.
 * @property {boolean} validationactive - Drives invalid styling after activation (`validationactive` attr). Default: `false`.
 * @property {boolean} invalid - True when last validation found errors (`invalid` attr). Default: `false`.
 *
 * @slot error - Replaces default validation message list when assigned.
 *
 * @csspart base - Picker body wrapper (area, sliders, input, swatches).
 * @csspart sliders - Hue and optional alpha slider group.
 * @csspart row - Preview chip, text input, and format toggle row.
 * @csspart preview - Live color preview chip.
 * @csspart input - Text input that round-trips the value.
 * @csspart format - Hex / rgb / hsl format `<select>`.
 * @csspart swatches - Preset swatch list container.
 * @csspart trigger - Swatch button when `trigger="swatch"`.
 * @csspart popover - Popover panel when `trigger="swatch"`.
 *
 * @csspart error-message - Region for `slot="error"` or stacked default validation lines.
 * @csspart error-line - One default validation string when `slot="error"` is empty.
 * @csspart field - Column that stacks the picker and optional error.
 *
 * @cssproperty --color-picker-width - Max panel width. Default: 18rem.
 * @cssproperty --color-picker-area-size - Color pad edge length.
 * @cssproperty --color-picker-trigger-size - Swatch trigger edge when `trigger="swatch"`.
 * @cssproperty --color-picker-trigger-radius - Swatch trigger corner radius.
 * @cssproperty --color-picker-popover-padding - Padding inside the popover panel.
 *
 * @uiVModel open vu-open-change detail=open
 *
 * @fires {CustomEvent<VuColorPickerChangeDetail>} vu-input - Live value while dragging or typing.
 * @fires {CustomEvent<VuColorPickerChangeDetail>} vu-change - Committed value on pointer up, blur, or swatch pick.
 * @fires {CustomEvent<{ open: boolean }>} vu-open-change - When `open` changes (`trigger="swatch"`).
 * @fires {CustomEvent} vu-open - Popover opened (`trigger="swatch"`).
 * @fires {CustomEvent} vu-close - Popover closed (`trigger="swatch"`).
 *
 * @fires {CustomEvent} vu-invalid - When validation messages are recomputed while `validationActive`.
 *
 * @method show - Opens the swatch popover; no-op when `trigger="inline"`.
 * @method hide - Closes the swatch popover; no-op when `trigger="inline"`.
 * @method validateInput - Runs validators and syncs validity.
 */
@localized()
@customElement("vu-color-picker")
@withComponentPresets
export class VuColorPicker
  extends FormControlBase
  implements Omit<ColorPickerRenderHost, "handlers">
{
  static override styles = colorPickerStyles;

  /** Selected color as a CSS string. */
  @property({ type: String, reflect: true })
  value = "#3b82f6";

  /** Text input and emitted value format. */
  @property({ type: String, reflect: true })
  format: VuColorPickerFormat = "hex";

  /** Renders the alpha slider (`showalpha` attr). */
  @property({ type: Boolean, reflect: true })
  showAlpha = false;

  /** Renders the format `<select>` (`showformat` attr). */
  @property({ type: Boolean, reflect: true })
  showFormat = true;

  /** Preset palette entries as CSS color strings. */
  @property({ type: Array })
  swatches: string[] = [];

  /** Accessible name forwarded to area, sliders, and input. */
  @property({ type: String })
  label = "";

  /** Accessible name for the format `<select>`. */
  @property({ type: String })
  formatLabel = "";

  /** Accessible name for the preset swatch list. */
  @property({ type: String })
  swatchesLabel = "";

  /** `inline` panel or `swatch` popover opener. */
  @property({ type: String, reflect: true })
  trigger: VuColorPickerTrigger = "inline";

  /** Popover placement when `trigger="swatch"`. */
  @property({ type: String, reflect: true })
  placement: VuColorPickerPlacement = "bottom-start";

  /** Popover open state when `trigger="swatch"`. */
  @property({ type: Boolean, reflect: true })
  open = false;

  /** 2D pad color model (`planecolorspace` attr). */
  @property({ type: String, reflect: true })
  planeColorSpace: VuColorAreaColorSpace = "hsb";

  /** Horizontal pad axis (`planexchannel` attr). */
  @property({ type: String, reflect: true })
  planeXChannel: VuColorAreaChannel = "saturation";

  /** Vertical pad axis (`planeychannel` attr). */
  @property({ type: String, reflect: true })
  planeYChannel: VuColorAreaChannel = "brightness";

  /** Passes `showdots` to `<vu-color-area>` (`planeshowdots` attr). */
  @property({ type: Boolean, reflect: true })
  planeShowDots = false;

  /** Renders the 2D color pad (`showarea` attr). */
  @property({ type: Boolean, reflect: true })
  showArea = true;

  /** Renders the hue slider (`showhueslider` attr). */
  @property({ type: Boolean, reflect: true })
  showHueSlider = true;

  /** Renders the text color field (`showinput` attr). */
  @property({ type: Boolean, reflect: true })
  showInput = true;

  /** Renders the live preview chip (`showpreview` attr). */
  @property({ type: Boolean, reflect: true })
  showPreview = true;

  /** Hue and alpha slider axis (`sliderorientation` attr). */
  @property({ type: String, reflect: true })
  sliderOrientation: VuColorSliderOrientation = "horizontal";

  /** Shows validation after activation. */
  @property({ type: Boolean, reflect: true })
  showErrors = false;

  /** Drives invalid styling after activation. */
  @property({ type: Boolean, reflect: true })
  validationActive = false;

  /** True when the last validation run found errors. */
  @property({ type: Boolean, reflect: true })
  invalid = false;

  @state()
  _h = 0;
  @state()
  _s = 100;
  @state()
  _v = 100;
  @state()
  _a = 1;

  @state()
  _inputDraft = "";

  @state()
  _inputDirty = false;

  @state()
  _inputInvalid = false;

  @query('[part="input"]')
  _inputEl!: HTMLInputElement | null;

  @query('[part="trigger"]')
  _triggerEl!: HTMLButtonElement | null;

  @query('[part="popover"]')
  _popoverEl!: HTMLElement | null;

  _suppressIncoming = false;

  private _popoverReady = false;
  private _syncingFromController = false;
  private readonly _popover: PopoverController;

  @state()
  _areaChunkReady = false;

  @state()
  _sliderChunkReady = false;

  @state()
  _swatchChunkReady = false;

  @state()
  _dropdownChunkReady = false;

  _chunkLoadToken = 0;

  @state() validationErrors: string[] = [];

  readonly _validation = new FieldValidationController(this, "vu-cp");

  private readonly _handlers = createColorPickerHandlers(this);

  constructor() {
    super();
    this._popover = new PopoverController(this, colorPickerPopoverOptions(this));
  }

  override willUpdate(changed: PropertyValues): void {
    if (changed.has("planeColorSpace") && !PLANE_COLOR_SPACES.has(this.planeColorSpace)) {
      this.planeColorSpace = "hsb";
    }
    if (
      changed.has("sliderOrientation") &&
      !SLIDER_ORIENTATIONS.has(this.sliderOrientation)
    ) {
      this.sliderOrientation = "horizontal";
    }
    if (changed.has("disabled")) {
      if (this.disabled) {
        this.setAttribute("aria-disabled", "true");
      } else {
        this.removeAttribute("aria-disabled");
      }
    }
    if (
      changed.has("showArea") ||
      changed.has("showHueSlider") ||
      changed.has("showAlpha") ||
      changed.has("swatches")
    ) {
      void ensureChildChunks(this);
    }
    if (!this._suppressIncoming && (changed.has("value") || !this.hasUpdated)) {
      ingestValue(this, this.value);
    }

    if (changed.has("format")) {
      this._inputDraft = formatCurrent(this);
    }
    super.willUpdate(changed);
  }

  override firstUpdated(): void {
    this._popover.refreshTargets();
    this._popoverReady = true;
    if (this.trigger === "swatch" && this.open) {
      this._applyOpenToController(false);
    }
  }

  override updated(changed: PropertyValues): void {
    if (this.trigger === "swatch") {
      if (changed.has("placement") && this._popover.open) {
        this._popover.position();
      }
      if (changed.has("open")) {
        this._applyOpenToController(changed.get("open") as boolean);
      }
    }
    super.updated(changed);
    if (
      changed.has("value") ||
      changed.has("name") ||
      changed.has("disabled") ||
      changed.has("format") ||
      changed.has("showAlpha")
    ) {
      this.syncFormValue();
      this.syncValidity();
    }
  }

  protected override getFormValue(): FormState {
    if (!this.name) return null;
    return this.value || null;
  }

  protected override setValueFromFormState(state: FormState): void {
    this.value = typeof state === "string" ? state : "";
  }

  protected override getValidityAnchor(): HTMLElement | undefined {
    return (
      this._inputEl ??
      (this.shadowRoot?.querySelector("vu-color-slider") as HTMLElement | null) ??
      this._triggerEl ??
      undefined
    );
  }

  protected override isEmpty(): boolean {
    return !this.value;
  }

  private _fieldValidators() {
    return [
      requiredFieldValidator(this.required, () => this.isEmpty(), this.requiredMessage),
    ];
  }

  /** Runs validators; `vu-form` aggregates `validationErrors`. */
  validateInput(): boolean {
    return this._validation.validate(this._fieldValidators(), {
      syncValidity: () => this.syncValidity(),
    });
  }

  /** Activates field validation after a committed color change. */
  validateField(): void {
    this._validation.validateNow(this._fieldValidators(), {
      syncValidity: () => this.syncValidity(),
    });
  }

  protected override onFormReset(): void {
    super.onFormReset();
    this._validation.clear();
  }

  protected override getNativeControl(): HTMLElement | null {
    return (
      this._inputEl ??
      (this.shadowRoot?.querySelector("vu-color-slider") as HTMLElement | null) ??
      this._triggerEl ??
      null
    );
  }

  override connectedCallback(): void {
    super.connectedCallback();
    ingestValue(this, this.value);
    this.captureDefaultValue(this.value);
    syncChunkFlagsFromRegistry(this);
    void ensureChildChunks(this);
  }

  /** Open the picker popover. No-op when `trigger="inline"`. */
  show(): void {
    if (this.trigger !== "swatch") return;
    this.open = true;
  }

  /** Close the picker popover. No-op when `trigger="inline"`. */
  hide(): void {
    if (this.trigger !== "swatch") return;
    this.open = false;
  }

  private _onTriggerClick = (): void => {
    if (this.disabled || this.readonly) return;
    this.open = !this.open;
  };

  onPopoverOpenChange(open: boolean, _meta: { reason: CloseReason }): void {
    this._syncingFromController = true;
    this.open = open;
    this._syncingFromController = false;
    this.dispatchEvent(
      new CustomEvent(open ? "vu-open" : "vu-close", {
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(
      new CustomEvent<{ open: boolean }>("vu-open-change", {
        detail: { open },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _applyOpenToController(previousOpen: boolean): void {
    if (!this._popoverReady || this._syncingFromController) return;
    if (this.open && !this._popover.open) {
      this._popover.openPopover();
      return;
    }
    if (!this.open && (previousOpen || this._popover.open)) {
      void this._popover.closePopover("api");
    }
  }

  override disconnectedCallback(): void {
    if (this._popover.open) {
      try {
        void this._popover.closePopover("api");
      } catch {

      }
    }
    this._popoverReady = false;
    super.disconnectedCallback();
  }

  override render() {
    const previewColor = formatCurrent(this);
    const pickerLabel = resolvedLabel(this);
    if (isClient()) {
      this.style.setProperty("--color-picker-preview-color", previewColor);
    }

    if (this.trigger === "swatch") {
      return html`
        <div class="color-picker-field" part="field">
          <button
            part="trigger"
            type="button"
            aria-label="${pickerLabel}: ${previewColor}"
            aria-haspopup="dialog"
            aria-expanded=${this.open ? "true" : "false"}
            aria-invalid=${this._validation.showError ? "true" : "false"}
            aria-describedby=${this._validation.ariaDescribedBy() || nothing}
            ?disabled=${this.disabled}
            @click=${this._onTriggerClick}
          ></button>
          <div
            part="popover"
            popover="manual"
            role="dialog"
            aria-label=${pickerLabel}
            @toggle=${this._popover.onToggle}
          >
            ${renderColorPickerBody(this, this._handlers)}
          </div>
          ${when(this._validation.showError, () =>
            renderFieldErrors({
              errorId: this._validation.errorId,
              errors: this.validationErrors,
              errorMessageClass: "error-message field-error-message",
              errorLineClass: "color-picker-error-line field-error-line",
            }),
          )}
        </div>
      `;
    }

    return html`
      <div class="color-picker-field" part="field">
        ${renderColorPickerBody(this, this._handlers)}
        ${when(this._validation.showError, () =>
          renderFieldErrors({
            errorId: this._validation.errorId,
            errors: this.validationErrors,
            errorMessageClass: "error-message field-error-message",
            errorLineClass: "color-picker-error-line field-error-line",
          }),
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-color-picker": VuColorPicker;
  }
}
