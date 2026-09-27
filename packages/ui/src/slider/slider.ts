import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { FormControlBase, type FormState } from "../internals/form/form-control-base.js";
import { FieldValidationController } from "../internals/form/field-validation-controller.js";
import {
  customFieldValidator,
  requiredFieldValidator,
} from "../internals/form/field-validation.js";
import {
  renderFieldErrors,
  renderFieldHint,
} from "../internals/form/field-validation-render.js";
import { isClient } from "../internals/utils/env.js";
import { slotOrPropVisible } from "../internals/utils/slot.js";
import {
  dispatchSliderClear,
  emitSliderChange,
  type SliderCommitHost,
} from "./internals/slider-commit.js";
import {
  handleSliderChange,
  handleSliderInput,
  type SliderInputHost,
} from "./internals/slider-input.js";
import {
  formatSliderValue,
  parseSliderFormState,
  serializeSliderFormValue,
  sliderFillPercent,
  snapSliderValue,
  clampSliderValue,
} from "./internals/slider-value.js";
import { sliderStyles } from "./slider.style.js";
import type {
  VuSliderChangeDetail,
  VuSliderClearDetail,
  VuSliderInvalidDetail,
  VuSliderSize,
  VuSliderTone,
  VuSliderVariant,
  VuSliderRadius
} from "./slider.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuSliderChangeDetail,
  VuSliderClearDetail,
  VuSliderInvalidDetail,
  VuSliderSize,
  VuSliderTone,
  VuSliderVariant,
  VuSliderRadius
} from "./slider.types.js";

/**
 * @element vu-slider
 *
 * @summary A slider component for choosing a numeric value with label and validation.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/slider
 *
 * @uiVModel value vu-change detail=value
 *
 * @slot label - Rich label markup; takes precedence over string `label` when assigned.
 * @slot hint - Optional helper copy (HTML); overrides string `hint` when assigned.
 * @slot error - Replaces default validation message list when assigned.
 *
 * @property {string} name - Form field name for submit (`name` attr).
 * @property {string} defaultvalue - Restored on `<form reset>` (`defaultvalue` attr).
 * @property {string} formid - External `<form>` id (`formid` attr).
 * @property {boolean} disabled - Non-interactive; blocks thumb dragging (`disabled` attr).
 * @property {boolean} readonly - Focusable but cannot change the value (`readonly` attr).
 * @property {boolean} required - Blocks valid submit when invalid (`required` attr).
 * @property {string} requiredmessage - Custom `valueMissing` message (`requiredmessage` attr).
 * @property {string} label - Plain-text label; slotted `label` wins when assigned.
 * @property {string} hint - Helper text; `hint` slot wins when assigned.
 * @property {string} id - Host id for label `for` / `aria-*` wiring.
 * @property {VuSliderVariant} variant - Field chrome recipe. Default: `"default"`.
 * @property {VuSliderTone} tone - Neutral surface weight. Default: `"normal"`.
 * @property {VuSliderSize} size - Track scale. Default: `"md"`.
 * @property {VuSliderRadius} radius - Corner preset (`none`/`sm`/`md`/`lg`/`full`). Default: `md`.
 * @property {boolean} block - Stretches the control to the container width. Default: `false`.
 * @property {boolean} compact - Tighter label/hint/error spacing. Default: `false`.
 * @property {number} min - Minimum selectable value. Default: `0`.
 * @property {number} max - Maximum selectable value. Default: `100`.
 * @property {number} step - Step interval for snapping. Default: `1`.
 * @property {number} value - Snapped slider value. Default: `50`.
 * @property {number} displayvalue - Live visual value while dragging when `commitonly`.
 * @property {string} prefix - Text before the formatted value.
 * @property {string} suffix - Text after the formatted value.
 * @property {boolean} showvalue - Shows the formatted value summary. Default: `true`.
 * @property {boolean} commitonly - Emits `vu-change` on thumb commit only. Default: `false`.
 * @property {boolean} showerrors - Shows validation after activation (`showerrors` attr). Default: `false`.
 * @property {boolean} validationactive - Drives invalid styling after activation (`validationactive` attr). Default: `false`.
 * @property {boolean} invalid - True when last validation found errors (`invalid` attr). Default: `false`.
 * @property {string} arialabel - Names the track when no visible label is present.
 *
 * @csspart field - Column stacking label, header, track, hint, and error.
 * @csspart label - Label element above the control.
 * @csspart header - Row with label and value summary.
 * @csspart control - Interactive track row (`.slider-track`) with variant chrome.
 * @csspart value - Formatted value summary.
 * @csspart affix - Prefix or suffix text in the value summary.
 * @csspart highlight - Accent fill from min to the current value.
 * @csspart thumb-visual - Visible thumb on the highlight edge.
 * @csspart thumb - Native `<input type="range">` drag target.
 * @csspart hint - Neutral helper text under the track.
 * @csspart error-message - Region for `slot="error"` or stacked default validation lines.
 * @csspart error-line - One default validation string when `slot="error"` is empty.
 * @csspart text - String `label` text when the `label` slot is empty.
 *
 * @cssproperty --slider-fill-pct - Accent fill width (set by the host).
 * @cssproperty --slider-track-size - Track thickness per `size`.
 * @cssproperty --slider-thumb-width - Thumb width per `size`.
 * @cssproperty --slider-thumb-height - Thumb height per `size`.
 *
 * @method setValue - Sets value after clamp/snap and emits `vu-change`.
 * @method reset - Restores `defaultValue` and dispatches `vu-clear`.
 * @method validateInput - Runs validators and syncs validity.
 *
 * @fires {CustomEvent<VuSliderChangeDetail>} vu-change - Committed or live value update.
 * @fires {CustomEvent<VuSliderInvalidDetail>} vu-invalid - When validation messages are recomputed.
 * @fires {CustomEvent<VuSliderClearDetail>} vu-clear - After `reset()` syncs from `defaultValue`.
 */
@customElement("vu-slider")
@withComponentPresets
export class VuSlider extends FormControlBase {
  private static _idCounter = 0;

  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = sliderStyles;

  /** Field chrome recipe. Default: `"default"`. */
  @property({ type: String, reflect: true }) variant: VuSliderVariant = "default";
  /** Neutral surface weight. Default: `"normal"`. */
  @property({ type: String, reflect: true }) tone: VuSliderTone = "normal";
  /** Track scale. Default: `"md"`. */
  @property({ type: String, reflect: true }) size: VuSliderSize = "md";

  /** Explicit corner preset; `full` is capsule ends, `none` is square. */
  @property({ type: String, reflect: true })
  radius: VuSliderRadius = "md";
  /** Stretches the control to the container width. */
  @property({ type: Boolean, reflect: true }) block = false;
  /** Tighter label/hint/error spacing. */
  @property({ type: Boolean, reflect: true }) compact = false;

  /** Minimum selectable value. */
  @property({ type: Number }) min = 0;
  /** Maximum selectable value. */
  @property({ type: Number }) max = 100;
  /** Step interval for snapping. */
  @property({ type: Number }) step = 1;
  /** Snapped slider value. */
  @property({ type: Number }) value = 50;
  /** Live visual value while dragging when `commitonly`. */
  @property({ type: Number }) displayValue = 50;

  /** Plain-text label; slotted `label` wins when assigned. */
  @property({ type: String }) label = "";
  /** Helper text; `hint` slot wins when assigned. */
  @property({ type: String }) hint = "";
  /** Text before the formatted value. */
  @property({ type: String }) override prefix = "";
  /** Text after the formatted value. */
  @property({ type: String }) suffix = "";
  /** Shows the formatted value summary. */
  @property({ type: Boolean, reflect: true }) showValue = true;
  /** Emits `vu-change` on thumb commit only. */
  @property({ type: Boolean, reflect: true }) commitOnly = false;
  /** Names the track when no visible label is present. */
  @property({ type: String }) override ariaLabel = "";
  /** Host id for label `for` / `aria-*` wiring. */
  @property({ type: String }) override id = "";
  /** Shows validation after activation. */
  @property({ type: Boolean, reflect: true }) showErrors = false;
  /** Drives invalid styling after activation. */
  @property({ type: Boolean, reflect: true }) validationActive = false;
  /** True when the last validation run found errors. */
  @property({ type: Boolean, reflect: true }) invalid = false;

  @state() validationErrors: string[] = [];

  private readonly _validation = new FieldValidationController(this, "vu-slider");
  private readonly _idBase = VuSlider._idCounter++;
  private readonly _labelId = `vu-slider-label-${this._idBase}`;
  private readonly _groupId = `vu-slider-group-${this._idBase}`;

  /** @internal Last value emitted by `vu-change`. */
  _lastCommitted = 50;

  private get _inputHost(): SliderInputHost {
    const host = this;
    return {
      get min() {
        return host.min;
      },
      get max() {
        return host.max;
      },
      get step() {
        return host.step;
      },
      get value() {
        return host.value;
      },
      set value(v: number) {
        host.value = v;
      },
      get displayValue() {
        return host.displayValue;
      },
      set displayValue(v: number) {
        host.displayValue = v;
      },
      get commitOnly() {
        return host.commitOnly;
      },
      get disabled() {
        return host.disabled;
      },
      get readonly() {
        return host.readonly;
      },
      requestUpdate: (name, old) => host.requestUpdate(name, old),
      onSliderChange: () => host._onSliderChange(),
    };
  }

  private get _commitHost(): SliderCommitHost {
    const host = this;
    return {
      get value() {
        return host.value;
      },
      get _lastCommitted() {
        return host._lastCommitted;
      },
      set _lastCommitted(v: number) {
        host._lastCommitted = v;
      },
      dispatchEvent: (event) => host.dispatchEvent(event),
    };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.captureDefaultValue(serializeSliderFormValue(this.value));
    if (!this.hasAttribute("tabindex")) this.tabIndex = -1;
    this._syncGeometryVars();
  }

  override firstUpdated(): void {
    this._normalizeValue();
    this._lastCommitted = this.value;
    this.displayValue = this.value;
    this.syncFormValue();
    this.syncValidity();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    super.willUpdate(changed);
    if (changed.has("value") && this.displayValue !== this.value) {
      this.displayValue = this.value;
    }
    if (
      changed.has("value") ||
      changed.has("displayValue") ||
      changed.has("min") ||
      changed.has("max") ||
      changed.has("step")
    ) {
      this._normalizeValue();
      this._syncGeometryVars();
    }
  }

  protected override getFormValue(): FormState {
    if (!this.name || this.disabled) return null;
    return serializeSliderFormValue(this.value);
  }

  protected override setValueFromFormState(state: FormState): void {
    const s = typeof state === "string" ? state : "";
    const parsed = parseSliderFormState(s, this);
    if (parsed === null) return;
    this.value = parsed;
    this.displayValue = parsed;
    this._lastCommitted = parsed;
    this._syncGeometryVars();
  }

  protected override getValidityAnchor(): HTMLElement | undefined {
    return this.shadowRoot?.querySelector<HTMLInputElement>('[part="thumb"]') ?? undefined;
  }

  protected override isEmpty(): boolean {
    return false;
  }

  protected override getNativeControl(): HTMLElement | null {
    return this.shadowRoot?.querySelector('[part="thumb"]') ?? null;
  }

  protected override onFormReset(): void {
    const parsed =
      parseSliderFormState(this.defaultValue, this) ??
      snapSliderValue(this, clampSliderValue(this, this.value));
    this.value = parsed;
    this.displayValue = parsed;
    this._lastCommitted = parsed;
    this._validation.clear();
    this._syncGeometryVars();
  }

  private _normalizeValue(): void {
    const snapped = snapSliderValue(this, clampSliderValue(this, this.value));
    if (this.value !== snapped) this.value = snapped;
    const displaySnapped = snapSliderValue(this, clampSliderValue(this, this.displayValue));
    if (this.displayValue !== displaySnapped) this.displayValue = displaySnapped;
  }

  private _syncGeometryVars(): void {
    if (!isClient() || typeof this.style?.setProperty !== "function") return;
    const position = this.commitOnly ? this.displayValue : this.value;
    this.style.setProperty("--slider-fill-pct", `${sliderFillPercent(this, position)}%`);
  }

  private _fieldValidators() {
    return [
      customFieldValidator(() => ""),
      requiredFieldValidator(
        this.required,
        () => this.isEmpty(),
        this.requiredMessage,
      ),
    ];
  }

  /** Runs validators; `vu-form` aggregates `validationErrors`. */
  validateInput(): boolean {
    return this._validation.validate(this._fieldValidators(), {
      syncValidity: () => this.syncValidity(),
    });
  }

  private _onSliderChange(): void {
    this._validation.validateNow(this._fieldValidators(), {
      syncValidity: () => this.syncValidity(),
    });
    emitSliderChange(this._commitHost);
    this.syncFormValue();
    this.syncValidity();
  }

  /** Sets value after clamp/snap and emits `vu-change`. */
  setValue(nextValue: number): void {
    const snapped = snapSliderValue(this, clampSliderValue(this, nextValue));
    if (this.value === snapped && this.displayValue === snapped) return;
    this.value = snapped;
    this.displayValue = snapped;
    this._syncGeometryVars();
    this._onSliderChange();
  }

  /** Restores `defaultValue` and dispatches `vu-clear`. */
  reset(): void {
    this.onFormReset();
    this.syncFormValue();
    this.syncValidity();
    dispatchSliderClear(this._commitHost);
  }

  private get _hasLabel(): boolean {
    return slotOrPropVisible(this, "label", this.label);
  }

  private get _groupAriaLabel(): string | typeof nothing {
    if (this._hasLabel) return nothing;
    const a = this.ariaLabel.trim();
    return a ? a : "Slider";
  }

  private get _ariaDescribedBy(): string | undefined {
    const ids = this._validation.ariaDescribedBy();
    return ids || undefined;
  }

  private get _showHeader(): boolean {
    return this.showValue || this._hasLabel;
  }

  private _formatValue(position: number): string {
    return formatSliderValue(position, this.step);
  }

  override render() {
    const hasLabel = this._hasLabel;
    const describedBy = this._ariaDescribedBy;
    const shown = this.commitOnly ? this.displayValue : this.value;
    const thumbInvalid = this.invalid || this._validation.showError;

    return html`
      <div class="slider-field" part="field">
        <div class="slider-header" part="header">
            <label
              id=${this._labelId}
              class="slider-label"
              part="label"
            >
              <slot name="label">
                ${this.label
                  ? html`<span part="text">${this.label}</span>`
                  : nothing}
              </slot>
            </label>
            ${when(this.showValue, () => html`
              <div class="slider-value" part="value" aria-live="polite">
                ${when(this.prefix, () => html`
                  <span class="slider-affix" part="affix">${this.prefix}</span>
                `)}
                ${this._formatValue(shown)}
                ${when(this.suffix, () => html`
                  <span class="slider-affix" part="affix">${this.suffix}</span>
                `)}
              </div>
            `)}
          </div>

        <div
          id=${this._groupId}
          class="slider-track"
          part="control"
          role="group"
          aria-labelledby=${hasLabel ? this._labelId : nothing}
          aria-label=${this._groupAriaLabel as string | typeof nothing}
          aria-describedby=${ifDefined(describedBy)}
        >
          <div class="slider-highlight" part="highlight">
            <div
              class="slider-thumb-visual"
              part="thumb-visual"
              aria-hidden="true"
            ></div>
          </div>

          <input
            class="slider-thumb-input"
            part="thumb"
            type="range"
            min=${this.min}
            max=${this.max}
            step=${this.step}
            .value=${String(this.displayValue)}
            ?disabled=${this.disabled || this.readonly}
            aria-label=${hasLabel ? this.label : this._groupAriaLabel as string}
            aria-invalid=${thumbInvalid ? "true" : "false"}
            @input=${(e: Event) => handleSliderInput(this._inputHost, e)}
            @change=${(e: Event) => handleSliderChange(this._inputHost, e)}
          />
        </div>

        ${when(this._validation.showHint, () =>
          renderFieldHint({
            hintId: this._validation.hintId,
            hintText: this.hint,
            hintClass: "slider-hint field-hint",
            hintTag: "div",
            ariaLive: "polite",
          }),
        )}
        ${when(this._validation.showError, () =>
          renderFieldErrors({
            errorId: this._validation.errorId,
            errors: this.validationErrors,
            errorMessageClass: "error-message field-error-message",
            errorLineClass: "slider-error-line field-error-line",
          }),
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-slider": VuSlider;
  }
}
