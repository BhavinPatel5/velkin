import { localized } from "@lit/localize";
import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { msg } from "../internals/utils/localize.js";
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
import { ICONS } from "../internals/icon.js";
import { slotOrPropVisible } from "../internals/utils/slot.js";
import {
  canDecrease as stepperCanDecrease,
  canIncrease as stepperCanIncrease,
  clampNumber,
  normalizeStepperNumber,
  roundPrecision,
  snapToStep,
  stepWrapped,
  type NumericStepperBounds,
} from "../internals/utils/numeric-stepper.js";
import { VuIcon } from "../icon/icon.js";
import {
  startCounterHold,
  stopCounterHold,
  type CounterHoldState,
} from "./internals/counter-hold.js";
import {
  applyCounterStep,
  commitCounterValue,
  onCounterInputBlur,
  onCounterInputChange,
  onCounterKeyDown,
  type CounterValueHost,
} from "./internals/counter-value.js";
import { counterStyles } from "./counter.style.js";
import type {
  VuCounterChangeDetail,
  VuCounterClearDetail,
  VuCounterInvalidDetail,
  VuCounterSize,
  VuCounterTone,
  VuCounterVariant,
  VuCounterRadius
} from "./counter.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuCounterChangeDetail,
  VuCounterChangeReason,
  VuCounterClearDetail,
  VuCounterInvalidDetail,
  VuCounterSize,
  VuCounterTone,
  VuCounterVariant,
  VuCounterRadius
} from "./counter.types.js";

/**
 * @element vu-counter
 *
 * @summary A counter component for numeric input with label, hint, and validation.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/counter
 * @dependency vu-icon
 *
 * @uiVModel value vu-change detail=value
 *
 * @slot label - Rich label markup; takes precedence over string `label` when assigned.
 * @slot hint - Optional helper copy (HTML); overrides string `hint` when assigned.
 * @slot error - Replaces default validation message list when assigned.
 * @slot start - Leading unit or symbol inside the field container.
 * @slot end - Trailing unit or symbol inside the field container.
 *
 * @property {string} name - Form field name for submit (`name` attr).
 * @property {string} defaultvalue - Restored on `<form reset>`; falls back to `defaultnumber` (`defaultvalue` attr).
 * @property {string} formid - External `<form>` id (`formid` attr).
 * @property {boolean} disabled - Non-interactive; blocks stepping and typing (`disabled` attr).
 * @property {boolean} readonly - Focusable but cannot change value (`readonly` attr).
 * @property {boolean} required - Blocks valid submit when empty (`required` attr).
 * @property {string} requiredmessage - Custom `valueMissing` message (`requiredmessage` attr).
 * @property {string} label - Plain-text label; slotted `label` wins when assigned.
 * @property {string} hint - Helper text; `hint` slot wins when assigned.
 * @property {string} id - Host id forwarded to the internal input.
 * @property {number} value - Current value; `NaN` when empty with `allowempty`. Default: `0`.
 * @property {VuCounterVariant} variant - Field chrome recipe. Default: `"default"`.
 * @property {VuCounterTone} tone - Neutral surface weight. Default: `"normal"`.
 * @property {VuCounterSize} size - Control scale. Default: `"md"`.
 * @property {VuCounterRadius} radius - Corner preset (`none`/`sm`/`md`/`lg`/`full`). Default: `md`.
 * @property {boolean} block - Stretches the stepper to the container width. Default: `false`.
 * @property {boolean} compact - Tighter label/hint/error spacing. Default: `false`.
 * @property {number} min - Minimum allowed value. Default: `0`.
 * @property {number} max - Optional maximum allowed value.
 * @property {number} step - Increment/decrement step size. Default: `1`.
 * @property {boolean} allowtyping - Enables direct typing in the number input. Default: `false`.
 * @property {boolean} allowempty - Permits an empty field (`NaN`) until blur when typing. Default: `false`.
 * @property {boolean} wrap - At bounds, step wraps to the opposite bound. Default: `false`.
 * @property {boolean} commitonly - Typing emits `vu-change` on blur only; buttons emit immediately. Default: `false`.
 * @property {number} precision - Decimal places applied on blur and programmatic sets. Default: `0`.
 * @property {string} placeholder - Shown when the value is empty (`NaN`).
 * @property {boolean} showerrors - Shows validation after activation (`showerrors` attr). Default: `false`.
 * @property {boolean} validationactive - Drives invalid styling after activation (`validationactive` attr). Default: `false`.
 * @property {boolean} invalid - True when last validation found errors (`invalid` attr). Default: `false`.
 * @property {string} icondecrease - Iconify id for the decrease button.
 * @property {string} iconincrease - Iconify id for the increase button.
 * @property {number} defaultnumber - Baseline for `reset()` when `defaultvalue` is unset. Default: `0`.
 * @property {string} decreaselabel - Accessible name for the decrease button.
 * @property {string} increaselabel - Accessible name for the increase button.
 * @property {string} arialabel - Input name when no visible label is present.
 * @property {number} holddelay - ms before press-and-hold repeat starts. Default: `400`.
 * @property {number} holdinterval - ms between repeats while held. Default: `80`.
 * @property {boolean} holdaccelerate - Halves repeat interval after sustained hold. Default: `true`.
 *
 * @csspart field - Column stacking label, control row, hint, and error.
 * @csspart label - Label element wired to the input.
 * @csspart start - Leading affix wrapper.
 * @csspart end - Trailing affix wrapper.
 * @csspart container - Stepper chrome (buttons + input).
 * @csspart button - Shared part on decrease and increase buttons.
 * @csspart button--decrease - Decrease button.
 * @csspart button--increase - Increase button.
 * @csspart icon - Shared part on decrease and increase icons.
 * @csspart icon--decrease - Decrease icon.
 * @csspart icon--increase - Increase icon.
 * @csspart input - Numeric input field.
 * @csspart hint - Helper text region.
 * @csspart error-message - Validation error region.
 * @csspart error-line - One default validation string.
 *
 * @method increment - Increases value by `step`.
 * @method decrement - Decreases value by `step`.
 * @method setValue - Sets value after clamp/snap and emits `vu-change`.
 * @method reset - Restores baseline value and dispatches `vu-clear`.
 * @method validateInput - Recomputes validation messages and syncs validity.
 *
 * @fires {CustomEvent<VuCounterChangeDetail>} vu-change - Value updates (`detail.previous`, `detail.reason`).
 * @fires {CustomEvent<VuCounterClearDetail>} vu-clear - After `reset()` syncs the default value.
 * @fires {CustomEvent<VuCounterInvalidDetail>} vu-invalid - When validation messages are recomputed.
 */
@localized()
@customElement("vu-counter")
@withComponentPresets
export class VuCounter extends FormControlBase {
  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = counterStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
  };

  /** Field chrome recipe. Default: `"default"`. */
  @property({ type: String, reflect: true }) variant: VuCounterVariant = "default";
  /** Neutral surface weight. Default: `"normal"`. */
  @property({ type: String, reflect: true }) tone: VuCounterTone = "normal";
  /** Control scale. Default: `"md"`. */
  @property({ type: String, reflect: true }) size: VuCounterSize = "md";
  /** Corner preset (`none`/`sm`/`md`/`lg`/`full`). */
  @property({ type: String, reflect: true }) radius: VuCounterRadius = "md";
  /** Stretches the stepper to the container width. */
  @property({ type: Boolean, reflect: true }) block = false;
  /** Tighter label/hint/error spacing. */
  @property({ type: Boolean, reflect: true }) compact = false;

  /** Current value; `NaN` when empty with `allowempty`. */
  @property({ type: Number, reflect: true }) value = 0;
  /** Minimum allowed value. */
  @property({ type: Number, reflect: true }) min = 0;
  /** Optional maximum allowed value. */
  @property({ type: Number, reflect: true }) max?: number;
  /** Increment/decrement step size. */
  @property({ type: Number, reflect: true }) step = 1;
  /** Enables direct typing in the number input. */
  @property({ type: Boolean, reflect: true }) allowTyping = false;
  /** Permits an empty field (`NaN`) until blur when typing. */
  @property({ type: Boolean, reflect: true }) allowEmpty = false;
  /** At bounds, step wraps to the opposite bound. */
  @property({ type: Boolean, reflect: true }) wrap = false;
  /** Typing emits `vu-change` on blur only; buttons emit immediately. */
  @property({ type: Boolean, reflect: true }) commitOnly = false;
  /** Decimal places applied on blur and programmatic sets. */
  @property({ type: Number }) precision = 0;
  /** Shown when the value is empty (`NaN`). */
  @property({ type: String }) placeholder = "";
  /** Plain-text label; slotted `label` wins when assigned. */
  @property({ type: String }) label = "";
  /** Helper text; `hint` slot wins when assigned. */
  @property({ type: String }) hint = "";
  /** Shows validation after activation. */
  @property({ type: Boolean, reflect: true }) showErrors = false;

  /** Iconify id for the decrease button. */
  @property({ type: String }) iconDecrease = ICONS.decrement;
  /** Iconify id for the increase button. */
  @property({ type: String }) iconIncrease = ICONS.increment;
  /** Baseline for `reset()` when `defaultvalue` is unset. */
  @property({ type: Number }) defaultNumber = 0;
  /** Accessible name for the decrease button. */
  @property({ type: String }) decreaseLabel = "";
  /** Accessible name for the increase button. */
  @property({ type: String }) increaseLabel = "";
  /** Input name when no visible label is present. */
  @property({ type: String }) override ariaLabel = "";
  /** ms before press-and-hold repeat starts. */
  @property({ type: Number }) holdDelay = 400;
  /** ms between repeats while held. */
  @property({ type: Number }) holdInterval = 80;
  /** Halves repeat interval after sustained hold. */
  @property({ type: Boolean }) holdAccelerate = true;

  /** Host id forwarded to the internal input. */
  @property({ type: String }) override id = "";
  /** True when the last validation run found errors. */
  @property({ type: Boolean, reflect: true }) invalid = false;
  /** Drives invalid styling after activation. */
  @property({ type: Boolean, reflect: true }) validationActive = false;

  @state() validationErrors: string[] = [];

  readonly _validation = new FieldValidationController(this, "vu-ctr");
  private static _idCounter = 0;
  private _inputId = `vu-ctr-${VuCounter._idCounter++}`;
  _lastCommitted = 0;
  holdTimer: number | null = null;
  holdIntervalId: number | null = null;
  holdTicks = 0;

  override connectedCallback(): void {
    super.connectedCallback();
    this.captureDefaultValue(String(this.defaultNumber));
    if (this.id.trim()) {
      this._inputId = `${this.id.trim()}-input`;
    }
  }

  onChromeSlotChange = (): void => {
    this.requestUpdate();
  };

  private get _inputElementId(): string {
    return this.id.trim() ? `${this.id.trim()}-input` : this._inputId;
  }

  private get _hasLabel(): boolean {
    return slotOrPropVisible(this, "label", this.label);
  }

  private get _inputAriaLabel(): string | typeof nothing {
    if (this._hasLabel) return nothing;
    const a = this.ariaLabel.trim();
    return a ? a : nothing;
  }

  private get _ariaDescribedBy(): string | typeof nothing {
    const ids = this._validation.ariaDescribedBy();
    return ids ? ids : nothing;
  }

  private _fieldValidators() {
    return [
      customFieldValidator(() => this.validateForForm()),
      requiredFieldValidator(
        this.required,
        () => !Number.isFinite(this.value),
        this.requiredMessage || "This field is required.",
      ),
    ];
  }

  private get _valueHost(): CounterValueHost {
    return this as unknown as CounterValueHost;
  }

  private get _holdState(): CounterHoldState {
    return this;
  }

  protected override getFormValue(): FormState {
    if (!this.name || this.disabled) return null;
    if (!Number.isFinite(this.value)) return "";
    return String(this.value);
  }

  protected override setValueFromFormState(state: FormState): void {
    if (typeof state === "string") {
      const t = state.trim();
      if (t === "") {
        commitCounterValue(this._valueHost, this.allowEmpty ? Number.NaN : this.clamp(this.defaultNumber), "programmatic", false);
        return;
      }
      const parsed = Number(t);
      commitCounterValue(
        this._valueHost,
        this.normalizeNumber(Number.isFinite(parsed) ? parsed : this.defaultNumber),
        "programmatic",
        false,
      );
      return;
    }

    if (typeof state === "number") {
      commitCounterValue(this._valueHost, this.normalizeNumber(state), "programmatic", false);
      return;
    }

    commitCounterValue(this._valueHost, this.clamp(this.defaultNumber), "programmatic", false);
  }

  protected override getValidityAnchor(): HTMLElement | undefined {
    return this.shadowRoot?.querySelector("input") ?? undefined;
  }

  protected override isEmpty(): boolean {
    return !Number.isFinite(this.value);
  }

  protected override getNativeControl(): HTMLElement | null {
    return this.shadowRoot?.querySelector("input") ?? null;
  }

  protected override validateForForm(): string {
    if (!Number.isFinite(this.value)) return "";
    if (this.value < this.min) return `Value must be ≥ ${this.min}.`;
    if (this.max !== undefined && this.value > this.max) {
      return `Value must be ≤ ${this.max}.`;
    }
    if (!(this.step > 0)) return "Step must be a positive number.";
    const base = Number.isFinite(this.min) ? this.min : 0;
    const k = (this.value - base) / this.step;
    if (Math.abs(k - Math.round(k)) >= 1e-9) {
      return `Value must align with step ${this.step}.`;
    }
    return "";
  }

  protected override onFormReset(): void {
    const captured = Number(this.defaultValue);
    const baseline = Number.isFinite(captured) ? captured : this.defaultNumber;
    this.value = this.normalizeNumber(baseline);
    this._lastCommitted = Number.isFinite(this.value) ? this.value : baseline;
    this._validation.clear();
  }

  private _stepperBounds(): NumericStepperBounds {
    return {
      min: this.min,
      max: this.max,
      step: this.step,
      precision: this.precision,
      wrap: this.wrap,
    };
  }

  private roundPrecision(n: number): number {
    return roundPrecision(n, this.precision);
  }

  private snapToStep(n: number): number {
    return snapToStep(n, this._stepperBounds());
  }

  normalizeNumber(n: number): number {
    return normalizeStepperNumber(n, this._stepperBounds());
  }

  clamp(n: number): number {
    return clampNumber(n, this.min, this.max);
  }

  stepWrapped(current: number, delta: number): number {
    return stepWrapped(current, delta, this._stepperBounds());
  }

  private canDecrease(): boolean {
    return stepperCanDecrease(this.value, this._stepperBounds());
  }

  private canIncrease(): boolean {
    return stepperCanIncrease(this.value, this._stepperBounds());
  }

  /** Recomputes validation messages; returns true when valid. */
  validateInput(): boolean {
    return this._validation.validate(this._fieldValidators(), {
      syncValidity: () => this.syncValidity(),
    });
  }

  override firstUpdated(): void {
    this._lastCommitted = Number.isFinite(this.value) ? this.value : this.defaultNumber;
    this.syncFormValue();
    this.syncValidity();
  }

  override willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has("id") && this.id.trim()) {
      this._inputId = `${this.id.trim()}-input`;
    }
    if (changed.has("disabled")) {
      if (this.disabled) {
        this.setAttribute("aria-disabled", "true");
      } else {
        this.removeAttribute("aria-disabled");
      }
    }
    if (changed.has("min") || changed.has("max") || changed.has("step") || changed.has("precision")) {
      if (Number.isFinite(this.value)) {
        this.value = this.normalizeNumber(this.value);
      }
    }
    if (
      changed.has("value") ||
      changed.has("name") ||
      changed.has("disabled") ||
      changed.has("required") ||
      changed.has("min") ||
      changed.has("max") ||
      changed.has("step")
    ) {
      this.syncFormValue();
      this.syncValidity();
    }
  }

  private stopHold = (): void => {
    stopCounterHold(this._holdState);
  };

  increment(): void {
    applyCounterStep(this._valueHost, this.step, "increment");
  }

  decrement(): void {
    applyCounterStep(this._valueHost, -this.step, "decrement");
  }

  setValue(nextValue: number): void {
    this._validation.activate();
    commitCounterValue(this._valueHost, this.normalizeNumber(nextValue), "programmatic", true);
    this.validateInput();
    this.syncFormValue();
    this.syncValidity();
  }

  private onInputChange = (e: Event): void => {
    onCounterInputChange(this._valueHost, e);
  };

  private onInputBlur = (): void => {
    onCounterInputBlur(this._valueHost);
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    onCounterKeyDown(this._valueHost, e);
  };

  reset(): void {
    this.onFormReset();
    this.syncFormValue();
    this.syncValidity();
    this.dispatchEvent(
      new CustomEvent<VuCounterClearDetail>("vu-clear", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    const decDisabled = this.disabled || this.readonly || !this.canDecrease();
    const incDisabled = this.disabled || this.readonly || !this.canIncrease();
    const displayValue = Number.isFinite(this.value) ? String(this.value) : "";

    return html`
      <div class="counter-field" part="field">
        <label
          class="counter-label"
          part="label"
          for=${this._inputElementId}
          aria-hidden=${!this._hasLabel ? "true" : nothing}
        >
          <slot name="label" @slotchange=${this.onChromeSlotChange}>${this.label}</slot>
        </label>

        <div class="counter-control-row">
          <div class="container" part="container">
            <span part="start" class="counter-affix">
              <slot name="start"></slot>
            </span>

            <button
              part="button button--decrease"
              aria-label=${this.decreaseLabel.trim() ||
              msg("Decrease", {
                desc: "Accessible name for the counter decrease control.",
              })}
              @pointerdown=${() =>
                startCounterHold(this._holdState, () =>
                  applyCounterStep(this._valueHost, -this.step, "decrement"))}
              @pointerup=${this.stopHold}
              @pointerleave=${this.stopHold}
              @pointercancel=${this.stopHold}
              ?disabled=${decDisabled}
              type="button"
              tabindex="-1"
            >
              <vu-icon part="icon icon--decrease" icon=${this.iconDecrease}></vu-icon>
            </button>

            <input
              part="input"
              id=${this._inputElementId}
              type="number"
              .value=${displayValue}
              placeholder=${this.placeholder || nothing}
              ?disabled=${this.disabled}
              ?readonly=${!this.allowTyping || this.disabled || this.readonly}
              min=${this.min}
              max=${ifDefined(this.max)}
              step=${this.step}
              inputmode="decimal"
              @input=${this.onInputChange}
              @blur=${this.onInputBlur}
              @keydown=${this.onKeyDown}
              role="spinbutton"
              aria-valuemin=${this.min}
              aria-valuemax=${ifDefined(this.max)}
              aria-valuenow=${ifDefined(Number.isFinite(this.value) ? this.value : undefined)}
              aria-valuetext=${ifDefined(
                Number.isFinite(this.value) ? String(this.value) : undefined,
              )}
              aria-readonly=${this.readonly ? "true" : nothing}
              aria-invalid=${this._validation.showError ? "true" : "false"}
              aria-describedby=${this._ariaDescribedBy}
              aria-label=${this._inputAriaLabel}
            />

            <button
              part="button button--increase"
              aria-label=${this.increaseLabel.trim() ||
              msg("Increase", {
                desc: "Accessible name for the counter increase control.",
              })}
              @pointerdown=${() =>
                startCounterHold(this._holdState, () =>
                  applyCounterStep(this._valueHost, this.step, "increment"))}
              @pointerup=${this.stopHold}
              @pointerleave=${this.stopHold}
              @pointercancel=${this.stopHold}
              ?disabled=${incDisabled}
              type="button"
              tabindex="-1"
            >
              <vu-icon part="icon icon--increase" icon=${this.iconIncrease}></vu-icon>
            </button>

            <span part="end" class="counter-affix">
              <slot name="end"></slot>
            </span>
          </div>
        </div>

        ${when(this._validation.showHint, () =>
          renderFieldHint({
            hintId: this._validation.hintId,
            hintText: this.hint,
          }),
        )}

        ${when(this._validation.showError, () =>
          renderFieldErrors({
            errorId: this._validation.errorId,
            errors: this.validationErrors,
          }),
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-counter": VuCounter;
  }
}
