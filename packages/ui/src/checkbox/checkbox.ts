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
  handleCheckboxChange,
  updateCheckboxVisualState,
  type CheckboxChangeHost,
} from "./internals/checkbox-change.js";
import { checkboxStyles } from "./checkbox.style.js";
import type {
  VuCheckboxChangeDetail,
  VuCheckboxColor,
  VuCheckboxIndeterminateClick,
  VuCheckboxSize,
  VuCheckboxTone,
  VuCheckboxValidationErrorDetail,
  VuCheckboxValueClearedDetail,
  VuCheckboxVariant,
  VuCheckboxRadius
} from "./checkbox.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuCheckboxChangeDetail,
  VuCheckboxColor,
  VuCheckboxIndeterminateClick,
  VuCheckboxSize,
  VuCheckboxTone,
  VuCheckboxValidationErrorDetail,
  VuCheckboxValueClearedDetail,
  VuCheckboxVariant,
  VuCheckboxRadius
} from "./checkbox.types.js";
import { reflectString } from "../internals/utils/reflect-string.js";

/**
 * @element vu-checkbox
 *
 * @summary A checkbox component with label, hint, and validation.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/checkbox
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
 * @property {boolean} disabled - Non-interactive; blocks toggle (`disabled` attr).
 * @property {boolean} readonly - Focusable but cannot change checked state (`readonly` attr).
 * @property {boolean} required - Blocks valid submit when unchecked (`required` attr).
 * @property {string} requiredmessage - Custom `valueMissing` message (`requiredmessage` attr).
 * @property {string} label - Plain-text label; slotted `label` wins when assigned.
 * @property {string} hint - Helper text; `hint` slot wins when assigned.
 * @property {string} id - Host id forwarded to the internal input.
 * @property {string} value - Form submit token when checked (`value` attr).
 * @property {VuCheckboxColor} color - Intent palette token for the checked accent. Default: `"primary"`.
 * @property {VuCheckboxTone} tone - Neutral idle-box weight (`subtle`/`normal`/`strong`). Default: `"normal"`.
 * @property {VuCheckboxSize} size - Box, gap, and label scale (`sm`/`md`/`lg`). Default: `"md"`.
 * @property {VuCheckboxRadius} radius - Corner preset (`none`/`sm`/`md`/`lg`/`full`). Default: `md`. Uses `--vu-radius-*` (not control-radius) so the small box stays square-ish.
 * @property {VuCheckboxVariant} variant - Box paint recipe. Default: `"default"`.
 * @property {VuCheckboxIndeterminateClick} indeterminateclick - First click from indeterminate (`indeterminateclick` attr). Default: `"check"`.
 * @property {string} arialabel - Accessible name when no visible label.
 * @property {boolean} compact - Tighter hint/error spacing (`compact` attr). Default: `false`.
 * @property {boolean} defaultchecked - Restored by `reset()` / form reset (`defaultchecked` attr). Default: `false`.
 * @property {boolean} showerrors - Shows validation after first blur when `required` (`showerrors` attr). Default: `false`.
 * @property {boolean} validationactive - Drives invalid styling after activation (`validationactive` attr). Default: `false`.
 * @property {boolean} invalid - True when last validation found errors (`invalid` attr). Default: `false`.
 * @property {boolean} checked - Checked state (`checked` attr). Default: `false`.
 * @property {boolean} indeterminate - Mixed/indeterminate state (`indeterminate` attr). Default: `false`.
 *
 * @csspart field - Column that stacks the control row, optional hint, and optional error.
 * @csspart wrapper - The wrapper element for the checkbox.
 * @csspart input - The native input element used for the checkbox.
 * @csspart label - The label element for the checkbox, used for styling.
 * @csspart box - The visual box for the checkbox, which includes the checkmark and indeterminate state.
 * @csspart checkmark - The checkmark icon that appears when the checkbox is checked.
 * @csspart indeterminate-line - The line representing the indeterminate state of the checkbox.
 * @csspart hint - Neutral helper text under the label (string `hint` or `hint` slot).
 * @csspart error-message - Region for `slot="error"` or stacked default validation lines.
 * @csspart error-line - One default validation string when `slot="error"` is empty.
 * @csspart text - String `label` text when the `label` slot is empty.
 *
 * @cssproperty --cb-strong - Filled checked / indeterminate surface (pinned by `color`).
 * @cssproperty --cb-strong-fg - Mark and bar on filled surface.
 * @cssproperty --cb-strong-hover - Hover fill when checked.
 * @cssproperty --cb-soft - Intent-tinted idle fill for variant soft (and outline unchecked hover).
 * @cssproperty --cb-soft-hover - Intent-tinted idle hover for variant soft.
 * @cssproperty --cb-edge - Unchecked border / outline-variant edge.
 * @cssproperty --cb-idle-box-bg - Unchecked box fill (`tone` surface stack; intent-tint when `variant="soft"`).
 * @cssproperty --checkbox-radius - Box `border-radius` from the `radius` prop (small-box scale).
 *
 * @fires {CustomEvent<VuCheckboxChangeDetail>} vu-change - User toggle; `detail.checked` boolean; `detail.value` submit token or boolean.
 * @fires {CustomEvent<VuCheckboxValidationErrorDetail>} vu-invalid - When validation messages are recomputed while `validationActive`.
 * @fires {CustomEvent<VuCheckboxValueClearedDetail>} vu-clear - After `reset()` syncs state from `defaultChecked`.
 */
@customElement("vu-checkbox")
@withComponentPresets
export class VuCheckbox extends FormControlBase {
  private static _idCounter = 0;

  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = checkboxStyles;

  /** Plain-text label; slotted `label` wins when it has assigned content. */
  @property({ type: String }) label = "";
  /** Optional helper text; use `hint` slot for markup. Hidden when empty and no slotted hint. */
  @property({ type: String }) hint = "";
  /** Host id forwarded to the internal input for `for` / `aria-*` wiring. */
  @property({ type: String }) override id = "";
  /** Form submit token when checked; empty string yields native `on` in FormData. */
  @property(reflectString) value = "";
  /** Token intent for the checked accent; use `default` for a neutral mark. */
  @property({ type: String, reflect: true })
  color: VuCheckboxColor = "primary";
  /** Neutral idle-box weight; `variant="soft"` still tints idle from `color`. */
  @property({ type: String, reflect: true })
  tone: VuCheckboxTone = "normal";
  /** Discrete scale for the box, gap, label text, and default corner radius. */
  @property({ type: String, reflect: true })
  size: VuCheckboxSize = "md";
  /** Explicit corner preset; `full` is capsule ends, `none` is square. */
  @property({ type: String, reflect: true })
  radius: VuCheckboxRadius = "md";
  /** default: filled idle uses neutral surface; soft: prior filled look (intent-tinted idle); outline: hollow border. */
  @property({ type: String, reflect: true })
  variant: VuCheckboxVariant = "default";
  /** First click from `indeterminate`: `check` (native) or `uncheck`. */
  @property({ type: String, reflect: true })
  indeterminateClick: VuCheckboxIndeterminateClick = "check";
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
  @state() private _indeterminate = false;
  /** Current validation messages; `vu-form` aggregates this array from registered controls. */
  @state() validationErrors: string[] = [];

  private readonly _validation = new FieldValidationController(this, "vu-cb");
  _inputElement?: HTMLInputElement;
  private _inputId = `vu-cb-${VuCheckbox._idCounter++}`;

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.id.trim()) this._inputId = `${this.id.trim()}-input`;
  }

  override willUpdate(changed: PropertyValues<this>): void {
    super.willUpdate(changed);
    if (changed.has("id") && this.id.trim()) {
      this._inputId = `${this.id.trim()}-input`;
    }
    if (changed.has("tone")) {
      this.tone = normalizeSurfaceTone(this.tone, this);
    }
  }

  /** Checked state; assigning true clears `indeterminate`. */
  @property({ type: Boolean, reflect: true })
  get checked() {
    return this._checked;
  }
  set checked(v: boolean) {
    const old = this._checked;
    this._checked = v;

    if (v && this.indeterminate) {
      this.indeterminate = false;
      if (this._inputElement) this._inputElement.indeterminate = false;
    }

    this.requestUpdate("checked", old);

    if (this._inputElement) {
      this._inputElement.checked = v;
      this._inputElement.indeterminate = this.indeterminate;
    }

    updateCheckboxVisualState(this);

    this.syncFormValue();
    this.syncValidity();
  }

  /** Indeterminate (mixed) state; assigning true clears `checked`. */
  @property({ type: Boolean, reflect: true })
  get indeterminate() {
    return this._indeterminate;
  }
  set indeterminate(v: boolean) {
    const old = this._indeterminate;
    this._indeterminate = v;

    if (v && this.checked) this.checked = false;

    this.requestUpdate("indeterminate", old);

    if (this._inputElement) this._inputElement.indeterminate = v;

    updateCheckboxVisualState(this);

    this.syncValidity();
  }

  private get _changeHost(): CheckboxChangeHost {
    return this as CheckboxChangeHost;
  }

  protected override getFormValue(): FormState {
    if (!this.name) return null;
    if (this.disabled) return null;

    if (!this.checked) return null;

    if (this.value && this.value.trim() !== "") return this.value;

    return "on";
  }

  protected override setValueFromFormState(state: FormState): void {
    if (state === null) {
      this.checked = false;
      this.indeterminate = false;
      return;
    }

    if (typeof state === "string") {
      if (this.value && this.value.trim() !== "") {
        this.checked = state === this.value;
      } else {
        this.checked = state === "on" || state === "true" || state === "1";
      }
      this.indeterminate = false;
    }
  }

  protected override getValidityAnchor(): HTMLElement | undefined {
    return (this.shadowRoot?.querySelector('input[type="checkbox"]') as HTMLElement) ?? undefined;
  }

  protected override isEmpty(): boolean {
    return !this.checked;
  }

  protected override getNativeControl(): HTMLElement | null {
    return this.shadowRoot?.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
  }

  protected override onFormReset(): void {
    this.checked = this.defaultChecked;
    this.indeterminate = false;
    this._validation.clear();
  }

  override updated(changed: Map<string, unknown>): void {
    super.updated(changed);

    if (!this._inputElement) {
      this._inputElement = this.shadowRoot?.querySelector(
        'input[type="checkbox"]',
      ) as HTMLInputElement;
    }

    if (this._inputElement) {
      this._inputElement.checked = this.checked;
      this._inputElement.indeterminate = this.indeterminate;
      this._inputElement.disabled = this.disabled || this.readonly;
    }

    updateCheckboxVisualState(this);

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
    handleCheckboxChange(this._changeHost, event);
  };

  /** Runs `required` validation; `vu-form` calls this when aggregating field errors. */
  validateInput(): boolean {
    return this._validation.validate(this._fieldValidators(), {
      syncValidity: () => this.syncValidity(),
    });
  }

  private _fieldValidators() {
    return [
      requiredFieldValidator(
        this.required,
        () => !this.checked,
        this.requiredMessage,
      ),
    ];
  }

  /** Sets checked to true and clears indeterminate. */
  check(): void {
    if (this.disabled || this.readonly) return;
    this.checked = true;
    this.indeterminate = false;
  }

  /** Sets checked to false and clears indeterminate. */
  uncheck(): void {
    if (this.disabled || this.readonly) return;
    this.checked = false;
    this.indeterminate = false;
  }

  /** Toggles checked and clears indeterminate. */
  toggle(): void {
    if (this.disabled || this.readonly) return;
    this.checked = !this.checked;
    this.indeterminate = false;
  }

  /** Resets to `defaultChecked`, clears validation UI, and dispatches `vu-clear`. */
  reset(): void {
    this.onFormReset();
    this.syncFormValue();
    this.syncValidity();

    const clearedDetail: VuCheckboxValueClearedDetail = {
      value: this.value,
      checked: this.checked,
    };
    this.dispatchEvent(
      new CustomEvent<VuCheckboxValueClearedDetail>("vu-clear", {
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

    const cbx = this.shadowRoot?.querySelector(".cbx");
    cbx?.classList.remove("active");

    this.syncValidity();
  };

  private _onKeyDown = (e: KeyboardEvent): void => {
    if (this.disabled || this.readonly) return;

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      this._inputElement?.click();
    }
  };

  private _onLabelSlotChange = (): void => {
    this.requestUpdate();
  };

  override render() {
    const hasText = this._hasTextContent;
    const wrapperClasses = classMap({
      "checkbox-wrapper": true,
      "no-text": !hasText,
    });
    const labelClasses = classMap({
      cbx: true,
      checked: this.checked,
      indeterminate: this.indeterminate,
    });
    const boxClasses = classMap({
      box: true,
      "box--checked": this.checked,
      "box--indeterminate": this.indeterminate,
      "box--invalid": this._validation.showError,
    });
    const boxPart =
      "box" +
      (this.checked ? " box--checked" : "") +
      (this.indeterminate ? " box--indeterminate" : "") +
      (this._validation.showError ? " box--invalid" : "");

    return html`
      <div class="checkbox-field" part="field">
        <div class=${wrapperClasses} part="wrapper">
          <input
            type="checkbox"
            id="${this._inputId}"
            class="inp-cbx"
            part="input"
            .checked="${this.checked}"
            @blur=${this.handleBlur}
            @keydown=${this._onKeyDown}
            .disabled="${this.disabled || this.readonly}"
            .value="${this.value}"
            @change=${this.handleChange}
            aria-checked=${this.indeterminate ? "mixed" : this.checked}
            aria-invalid="${this._validation.showError ? "true" : "false"}"
            aria-readonly="${this.readonly}"
            aria-describedby=${this._ariaDescribedBy}
            aria-label=${this._inputAriaLabel}
          />
          <label class=${labelClasses} part="label" for="${this._inputId}">
            <span part=${boxPart} class=${boxClasses}>
              <svg viewBox="0 0 12 10" class="checkmark" part="checkmark">
                <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
              </svg>
              <div class="indeterminate-line" part="indeterminate-line"></div>
            </span>
            <slot name="label" @slotchange=${this._onLabelSlotChange}>
              ${this.label
                ? html`<span part="text" class="checkbox-label-text">${this.label}</span>`
                : nothing}
            </slot>
          </label>
        </div>
        ${when(this._validation.showHint, () =>
          renderFieldHint({
            hintId: this._validation.hintId,
            hintText: this.hint,
            hintClass: "checkbox-hint field-hint",
            hintTag: "div",
            ariaLive: "polite",
          }),
        )}
        ${when(this._validation.showError, () =>
          renderFieldErrors({
            errorId: this._validation.errorId,
            errors: this.validationErrors,
            errorMessageClass: "error-message field-error-message",
            errorLineClass: "checkbox-error-line field-error-line",
          }),
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-checkbox": VuCheckbox;
  }
}
