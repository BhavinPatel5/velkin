import { LitElement, html, nothing, type PropertyValues } from "lit";
import { property, customElement, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { classMap } from "lit/directives/class-map.js";
import { FormControlBase, type FormState } from "../internals/form/form-control-base.js";
import { FieldValidationController } from "../internals/form/field-validation-controller.js";
import { requiredFieldValidator } from "../internals/form/field-validation.js";
import {
  renderFieldErrors,
  renderFieldHint,
} from "../internals/form/field-validation-render.js";
import { slotOrPropVisible } from "../internals/utils/slot.js";
import { normalizeSurfaceTone } from "../internals/utils/surface-tone.js";
import {
  handleRadioChange,
  uncheckRadioPeers,
  updateRadioVisualState,
  type RadioChangeHost,
} from "./internals/radio-change.js";
import { radioStyles } from "./radio.style.js";
import type {
  VuRadioColor,
  VuRadioSize,
  VuRadioTone,
  VuRadioValueClearedDetail,
  VuRadioVariant,
} from "./radio.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuRadioChangeDetail,
  VuRadioColor,
  VuRadioSize,
  VuRadioTone,
  VuRadioValidationErrorDetail,
  VuRadioValueClearedDetail,
  VuRadioVariant,
} from "./radio.types.js";
import { reflectString } from "../internals/utils/reflect-string.js";

/**
 * @element vu-radio
 *
 * @summary A radio component with label, hint, and validation.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/radio
 *
 * @uiVModel checked vu-change detail=checked
 *
 * @slot label - Rich label markup; takes precedence over string `label` when assigned.
 * @slot hint - Optional helper copy (HTML); overrides string `hint` when assigned.
 * @slot error - Replaces default validation message list when assigned.
 *
 * @property {string} name - Form field name for submit (`name` attr).
 * @property {string} defaultvalue - Value restored on `<form reset>` (`defaultvalue` attr).
 * @property {string} formid - External `<form>` id (`formid` attr).
 * @property {boolean} disabled - Non-interactive; blocks selection (`disabled` attr).
 * @property {boolean} readonly - Focusable but cannot change checked state (`readonly` attr).
 * @property {boolean} required - Blocks valid submit when unchecked (`required` attr).
 * @property {string} requiredmessage - Custom `valueMissing` message (`requiredmessage` attr).
 * @property {string} label - Plain-text label; slotted `label` wins when assigned.
 * @property {string} hint - Helper text; `hint` slot wins when assigned.
 * @property {string} id - Host id forwarded to the internal input.
 * @property {string} value - Form submit token when checked (`value` attr).
 * @property {VuRadioColor} color - Intent palette token for the checked accent. Default: `"primary"`.
 * @property {VuRadioTone} tone - Neutral idle-ring weight (`subtle`/`normal`/`strong`). Default: `"normal"`.
 * @property {VuRadioSize} size - Ring, gap, and label scale. Default: `"md"`.
 * @property {VuRadioVariant} variant - Ring paint recipe. Default: `"default"`.
 * @property {string} arialabel - Accessible name when no visible label.
 * @property {boolean} compact - Tighter hint/error spacing (`compact` attr). Default: `false`.
 * @property {boolean} defaultchecked - Restored by `reset()` / form reset (`defaultchecked` attr). Default: `false`.
 * @property {boolean} showerrors - Shows validation after first blur when `required` (`showerrors` attr). Default: `false`.
 * @property {boolean} validationactive - Drives invalid styling after activation (`validationactive` attr). Default: `false`.
 * @property {boolean} invalid - True when last validation found errors (`invalid` attr). Default: `false`.
 * @property {boolean} checked - Checked state (`checked` attr). Default: `false`.
 *
 * @csspart field - Column that stacks the control row, optional hint, and optional error.
 * @csspart wrapper - The wrapper element for the radio.
 * @csspart input - The native input element used for the radio.
 * @csspart label - The label element for the radio.
 * @csspart ring - The visual ring for the radio.
 * @csspart hint - Neutral helper text under the label.
 * @csspart error-message - Region for `slot="error"` or stacked default validation lines.
 * @csspart error-line - One default validation string when `slot="error"` is empty.
 * @csspart text - String `label` text when the `label` slot is empty.
 *
 * @cssproperty --rd-strong - Filled checked ring surface (pinned by `color`).
 * @cssproperty --rd-strong-fg - Dot on filled ring surface.
 * @cssproperty --rd-strong-hover - Hover fill when checked.
 * @cssproperty --rd-soft - Intent-tinted idle fill for variant soft.
 * @cssproperty --rd-soft-hover - Intent-tinted idle hover for variant soft.
 * @cssproperty --rd-edge - Unchecked border / outline-variant edge.
 * @cssproperty --rd-idle-ring-bg - Unchecked ring fill (`tone` surface stack; intent-tint when `variant="soft"`).
 * @cssproperty --radio-ring - Outer ring diameter (size-scaled).
 *
 * @fires {CustomEvent<VuRadioChangeDetail>} vu-change - User selection; `detail.checked` and `detail.value`.
 * @fires {CustomEvent<VuRadioValidationErrorDetail>} vu-invalid - When validation messages are recomputed while `validationActive`.
 * @fires {CustomEvent<VuRadioValueClearedDetail>} vu-clear - After `reset()` syncs state from `defaultChecked`.
 *
 * @method check - Selects this radio option.
 * @method focusRadio - Focuses the underlying native radio control.
 * @method validateInput - Runs `required` validation; `vu-form` calls this when aggregating field errors.
 * @method reset - Resets to `defaultChecked`, clears validation UI, and dispatches `vu-clear`.
 */
@customElement("vu-radio")
@withComponentPresets
export class VuRadio extends FormControlBase {
  private static _idCounter = 0;

  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = radioStyles;

  /** Plain-text label; slotted `label` wins when it has assigned content. */
  @property({ type: String }) label = "";
  /** Optional helper text; use `hint` slot for markup. Hidden when empty and no slotted hint. */
  @property({ type: String }) hint = "";
  /** Host id forwarded to the internal input for `for` / `aria-*` wiring. */
  @property({ type: String }) override id = "";
  /** Form submit token when checked. */
  @property(reflectString) value = "";
  /** Token intent for the checked accent; use `default` for a neutral mark. */
  @property({ type: String, reflect: true })
  color: VuRadioColor = "primary";
  /** Neutral idle-ring weight; `variant="soft"` still tints idle from `color`. */
  @property({ type: String, reflect: true })
  tone: VuRadioTone = "normal";
  /** Discrete scale for the ring, gap, label text. */
  @property({ type: String, reflect: true })
  size: VuRadioSize = "md";
  /** Visual treatment of the ring and label chrome. */
  @property({ type: String, reflect: true })
  variant: VuRadioVariant = "default";
  /** Inner input accessible name when no string or slotted label (icon-only). */
  @property({ type: String })
  override ariaLabel = "";
  /** Tighter hint/error margins and row gap for dense UIs. */
  @property({ type: Boolean, reflect: true })
  compact = false;
  /** Target checked state for `reset()` and `<form>.reset()`; reflects as `defaultchecked`. */
  @property({ type: Boolean, reflect: true })
  defaultChecked = false;
  /** When true with `required`, shows `requiredMessage` after first blur if unchecked; reflects as `showerrors`. */
  @property({ type: Boolean, reflect: true })
  showErrors = false;
  /** After first blur with `showerrors`, drives invalid styling and error text. */
  @property({ type: Boolean, reflect: true }) validationActive: boolean = false;
  /** True when the last `validateInput()` run found errors. */
  @property({ type: Boolean, reflect: true }) invalid: boolean = false;
  @state() private _checked = false;
  /** Current validation messages; `vu-form` aggregates this array from registered controls. */
  @state() validationErrors: string[] = [];

  private readonly _validation = new FieldValidationController(this, "vu-rd");
  _inputElement?: HTMLInputElement;
  private _inputId = `vu-rd-${VuRadio._idCounter++}`;

  override willUpdate(changed: PropertyValues<this>): void {
    super.willUpdate(changed);
    if (changed.has("tone")) {
      this.tone = normalizeSurfaceTone(this.tone, this);
    }
  }

  /** Checked state. */
  @property({ type: Boolean, reflect: true })
  get checked() {
    return this._checked;
  }
  set checked(v: boolean) {
    const old = this._checked;
    if (v && !old) uncheckRadioPeers(this);
    this._checked = v;
    this.requestUpdate("checked", old);

    if (this._inputElement) this._inputElement.checked = v;

    updateRadioVisualState(this);
    this.syncFormValue();
    this.syncValidity();
  }

  private get _changeHost(): RadioChangeHost {
    return this as RadioChangeHost;
  }

  uncheckPeers(): void {
    uncheckRadioPeers(this);
  }

  protected override getFormValue(): FormState {
    if (!this.name) return null;
    if (this.disabled) return null;
    if (!this.checked) return null;
    if (this.value && this.value.trim() !== "") return this.value;
    return "on";
  }

  protected override setValueFromFormState(formState: FormState): void {
    if (formState === null) {
      this.checked = false;
      return;
    }
    if (typeof formState === "string") {
      this.checked = formState === this.value || (formState === "on" && this.value === "");
    }
  }

  protected override getValidityAnchor(): HTMLElement | undefined {
    return (this.shadowRoot?.querySelector('input[type="radio"]') as HTMLElement) ?? undefined;
  }

  protected override isEmpty(): boolean {
    return !this.checked;
  }

  protected override getNativeControl(): HTMLElement | null {
    return this.shadowRoot?.querySelector('input[type="radio"]') as HTMLInputElement | null;
  }

  protected override onFormReset(): void {
    this.checked = this.defaultChecked;
    this._validation.clear();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);

    if (!this._inputElement) {
      this._inputElement = this.shadowRoot?.querySelector(
        'input[type="radio"]',
      ) as HTMLInputElement;
    }

    if (this._inputElement) {
      this._inputElement.checked = this.checked;
      this._inputElement.disabled = this.disabled || this.readonly;
    }

    updateRadioVisualState(this);

    if (
      changed.has("checked") ||
      changed.has("name") ||
      changed.has("disabled") ||
      changed.has("readonly") ||
      changed.has("required") ||
      changed.has("value")
    ) {
      this.syncFormValue();
      this.syncValidity();
    }
  }

  private handleChange = (event: Event): void => {
    handleRadioChange(this._changeHost, event);
  };

  /** Runs `required` validation; `vu-form` calls this when aggregating field errors. */
  validateInput(): boolean {
    return this._validation.validate(this._fieldValidators(), {
      syncValidity: () => this.syncValidity(),
    });
  }

  private _fieldValidators() {
    return [requiredFieldValidator(this.required, () => !this.checked, this.requiredMessage)];
  }

  /** Selects this radio option. */
  check(): void {
    if (this.disabled || this.readonly) return;
    this.checked = true;
  }

  /** Focuses the underlying native radio control. */
  focusRadio(): void {
    this._inputElement?.focus();
  }

  /** Resets to `defaultChecked`, clears validation UI, and dispatches `vu-clear`. */
  reset(): void {
    this.onFormReset();
    this.syncFormValue();
    this.syncValidity();

    const clearedDetail: VuRadioValueClearedDetail = {
      value: this.value,
      checked: this.checked,
    };
    this.dispatchEvent(
      new CustomEvent<VuRadioValueClearedDetail>("vu-clear", {
        detail: clearedDetail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private get _hasTextContent(): boolean {
    return slotOrPropVisible(this, "label", this.label);
  }

  private get _inputAriaLabel(): string | typeof nothing {
    if (this._hasTextContent) return nothing;
    const a = this.ariaLabel.trim();
    return a ? a : nothing;
  }

  private get _ariaDescribedBy(): string | typeof nothing {
    const ids = this._validation.ariaDescribedBy();
    return ids ? ids : nothing;
  }

  private handleBlur = (_e: FocusEvent): void => {
    this._validation.validateNow(this._fieldValidators(), {
      syncValidity: () => this.syncValidity(),
    });
    this.syncValidity();
  };

  private _onKeyDown = (e: KeyboardEvent): void => {
    if (this.disabled || this.readonly) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      this._inputElement?.click();
    }
  };

  override render() {
    const hasText = this._hasTextContent;
    const wrapperClasses = classMap({
      "radio-wrapper": true,
      "no-text": !hasText,
    });
    const labelClasses = classMap({
      rdx: true,
      checked: this.checked,
    });
    const ringClasses = classMap({
      ring: true,
      "ring--checked": this.checked,
      "ring--invalid": this._validation.showError,
    });
    const ringPart =
      "ring" +
      (this.checked ? " ring--checked" : "") +
      (this._validation.showError ? " ring--invalid" : "");

    return html`
      <div class="radio-field" part="field">
        <div class=${wrapperClasses} part="wrapper">
          <input
            type="radio"
            id="${this._inputId}"
            class="inp-rdx"
            part="input"
            .checked="${this.checked}"
            .value="${this.value}"
            @blur=${this.handleBlur}
            @keydown=${this._onKeyDown}
            .disabled="${this.disabled || this.readonly}"
            ?required=${this.required}
            @change=${this.handleChange}
            aria-checked=${this.checked ? "true" : "false"}
            aria-invalid="${this._validation.showError ? "true" : "false"}"
            aria-describedby=${this._ariaDescribedBy}
            aria-label=${this._inputAriaLabel}
          />
          <label class=${labelClasses} part="label" for="${this._inputId}">
            <span part=${ringPart} class=${ringClasses}></span>
            <slot name="label">
              ${
                this.label
                  ? html`<span part="text" class="radio-label-text">${this.label}</span>`
                  : nothing
              }
            </slot>
          </label>
        </div>
        ${when(this._validation.showHint, () =>
          renderFieldHint({
            hintId: this._validation.hintId,
            hintText: this.hint,
            hintClass: "radio-hint field-hint",
            hintTag: "div",
            ariaLive: "polite",
          }),
        )}
        ${when(this._validation.showError, () =>
          renderFieldErrors({
            errorId: this._validation.errorId,
            errors: this.validationErrors,
            errorMessageClass: "error-message field-error-message",
            errorLineClass: "radio-error-line field-error-line",
          }),
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-radio": VuRadio;
  }
}
