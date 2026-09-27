import { localized } from "@lit/localize";
import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { FormControlBase, type FormState } from "../internals/form/form-control-base.js";
import { FieldValidationController } from "../internals/form/field-validation-controller.js";
import { requiredFieldValidator } from "../internals/form/field-validation.js";
import type { FieldValidator } from "../internals/form/field-validation.types.js";
import { unshadowFormControlFields } from "../internals/form/unshadow-fields.js";
import { hasLightChildrenInSlot, slotOrPropVisible } from "../internals/utils/slot.js";
import { VuIcon } from "../icon/icon.js";
import {
  emitInputChange,
  emitInputClear,
  emitInputFile,
} from "./internals/input-events.js";
import {
  fileListLabel,
  formatInputFileSize,
  sumFileSizes,
} from "./internals/input-file.js";
import { renderInput, type InputRenderHost } from "./internals/input-render.js";
import { emittedInputValue, stepInputNumber } from "./internals/input-value.js";
import { inputStyles } from "./input.style.js";
import type {
  VuInputChangeDetail,
  VuInputClearDetail,
  VuInputFileDetail,
  VuInputInvalidDetail,
  VuInputSize,
  VuInputTone,
  VuInputType,
  VuInputValidation,
  VuInputValue,
  VuInputVariant,
  VuInputRadius
} from "./input.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuInputChangeDetail,
  VuInputClearDetail,
  VuInputFileDetail,
  VuInputInvalidDetail,
  VuInputSize,
  VuInputTone,
  VuInputType,
  VuInputValidation,
  VuInputValue,
  VuInputVariant,
  VuInputRadius
} from "./input.types.js";

/**
 * @element vu-input
 *
 * @summary A text field component with label, hint, and validation.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/input
 * @dependency vu-icon
 *
 * @uiVModel value vu-change
 *
 * @slot label - Rich label markup; takes precedence over string `label` when assigned.
 * @slot hint - Optional helper copy (HTML); overrides string `hint` when assigned.
 * @slot error - Replaces default validation message list when assigned.
 * @slot start - Leading icon or affix inside the field container.
 * @slot end - Trailing icon or affix inside the field container.
 *
 * @property {VuInputVariant} variant - Field chrome recipe. Default: `"default"`.
 * @property {VuInputTone} tone - Neutral chrome weight. Default: `"normal"`.
 * @property {VuInputSize} size - Field scale. Default: `"md"`.
 * @property {VuInputRadius} radius - Corner preset (`none`/`sm`/`md`/`lg`/`full`). Default: `md`.
 * @property {boolean} block - Stretches the field to the container width. Default: `false`.
 * @property {string} name - Form field name. Default: `""`.
 * @property {string} defaultValue - Uncontrolled initial value; HTML attribute is `value`. Default: `""`.
 * @property {string | null} formId - ID of an external `<form>`; HTML attribute is `formid`. Default: `null`.
 * @property {boolean} disabled - Non-interactive state. Default: `false`.
 * @property {boolean} readonly - Read-only; keeps focus without editing. Default: `false`.
 * @property {boolean} required - Marks the field required for form validation. Default: `false`.
 * @property {string} requiredMessage - Message when `required` fails. Default: `"This field is required."`.
 * @property {VuInputValue} value - Current value; `number` when `type="number"`.
 * @property {string} placeholder - Placeholder or file-input fallback label.
 * @property {string} label - Plain-text label; slotted `label` wins when assigned.
 * @property {string} hint - Helper text; `hint` slot wins when assigned.
 * @property {VuInputType} type - Native type, or `textarea` / `file`. Default: `"text"`.
 * @property {VuInputValidation[]} validations - Custom validators returning `true` or an error string.
 * @property {boolean} compact - Tighter vertical spacing. Default: `false`.
 * @property {boolean} loading - Shows a trailing spinner. Default: `false`.
 * @property {boolean} showErrors - Shows validation messages after `validationActive`. Default: `false`.
 * @property {boolean} clearable - Shows a clear button when the field has a value. Default: `false`.
 * @property {boolean} showNumberButtons - Shows +/- controls for `type="number"`. Default: `false`.
 * @property {boolean} showPasswordToggle - Shows a password visibility toggle. Default: `true`.
 * @property {string | null} step - Native `step` for number inputs.
 * @property {string | null} min - Native `min` constraint.
 * @property {string | null} max - Native `max` constraint.
 * @property {string} autocapitalize - Native `autocapitalize`. Default: `"off"`.
 * @property {string} autocomplete - Native `autocomplete`. Default: `"off"`.
 * @property {boolean} spellcheck - Native `spellcheck`. Default: `false`.
 * @property {string} dir - Text direction. Default: `"ltr"`.
 * @property {number} rows - Textarea row count. Default: `6`.
 * @property {string} resizable - Textarea resize mode. Default: `"none"`.
 * @property {string} accept - File input accept filter.
 * @property {boolean} multiple - Allows multiple files when `type="file"`. Default: `false`.
 * @property {string | null} inputmode - Native `inputmode` hint.
 * @property {string | null} enterkeyhint - Native `enterkeyhint` for virtual keyboards.
 * @property {string | null} pattern - Native `pattern` validation regex.
 * @property {number | null} minlength - Native minimum string length.
 * @property {number | null} maxlength - Native maximum string length.
 * @property {string | null} list - ID of a `<datalist>` to associate.
 * @property {number | null} nativeSize - Native `size` attribute (character width).
 * @property {boolean} autofocus - Focuses the control on connect. Default: `false`.
 * @property {boolean} capture - Enables capture on file inputs. Default: `false`.
 * @property {string} ariaLabel - Accessible name when no visible label is present.
 * @property {string | null} ariaLabelledby - IDs of elements that label the control.
 * @property {string} id - Host id; also prefixes internal control ids when set.
 * @property {boolean} validationActive - Shows validation affordances after interaction. Default: `false`.
 * @property {boolean} invalid - Reflects validation failure state. Default: `false`.
 *
 * @csspart field - Column stacking label, control row, hint, and error.
 * @csspart label - Label wired to the native control.
 * @csspart start - Leading affix wrapper.
 * @csspart end - Trailing affix wrapper.
 * @csspart container - Field chrome wrapping the native control and actions.
 * @csspart input - Native `<input>` or `<textarea>`.
 * @csspart toggle-password - Password visibility toggle.
 * @csspart clear-button - Clear value control.
 * @csspart loading-indicator - Loading spinner on the trailing edge.
 * @csspart number-stepper - Increment/decrement button group for `type="number"`.
 * @csspart button - Shared part on stepper buttons.
 * @csspart button--decrease - Decrease button.
 * @csspart button--increase - Increase button.
 * @csspart hint - Helper text region.
 * @csspart error-message - Validation error region.
 * @csspart error-line - One default validation string.
 * @csspart file-info - Selected file count and size readout.
 * @csspart file-label - Visible label for file inputs.
 *
 * @fires {CustomEvent<VuInputChangeDetail>} vu-change - When the value updates.
 * @fires {CustomEvent<VuInputClearDetail>} vu-clear - After the value is cleared.
 * @fires {CustomEvent<VuInputInvalidDetail>} vu-invalid - When validation messages are recomputed.
 * @fires {CustomEvent<VuInputFileDetail>} vu-file - After file selection changes.
 *
 * @method validateInput - Recomputes validation messages and returns whether the field is valid.
 * @method clear - Clears the value and emits `vu-clear`.
 * @method focus - Focuses the native control.
 */
@localized()
@customElement("vu-input")
@withComponentPresets
export class VuInput extends FormControlBase {
  static override styles = inputStyles;

  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
  };

  /** Field chrome recipe; mirrors `vu-counter`. */
  @property({ type: String, reflect: true }) variant: VuInputVariant = "default";
  /** Neutral surface weight for the field chrome. */
  @property({ type: String, reflect: true }) tone: VuInputTone = "normal";
  /** Field scale; mirrors `vu-counter`. */
  @property({ type: String, reflect: true }) size: VuInputSize = "md";
  /** Capsule field ends. */
  @property({ type: String, reflect: true }) radius: VuInputRadius = "md";
  /** Stretches the field to the container width. */
  @property({ type: Boolean, reflect: true }) block = false;

  /** Current value; bind for controlled usage and listen on `vu-change`. */
  @property({ attribute: false }) value: VuInputValue = "";
  /** Placeholder for text modes; fallback label for file mode. */
  @property({ type: String }) placeholder = "";
  /** Plain-text label; slotted `label` wins when assigned. */
  @property({ type: String }) label = "";
  /** Helper text; `hint` slot wins when assigned. */
  @property({ type: String }) hint = "";
  /** Native input type, or `textarea` / `file`. */
  @property({ type: String, reflect: true }) type: VuInputType = "text";
  /** Tighter label/hint/error spacing. */
  @property({ type: Boolean, reflect: true }) compact = false;
  /** Shows a trailing spinner. */
  @property({ type: Boolean, reflect: true }) loading = false;
  /** Shows validation messages after interaction. */
  @property({ type: Boolean, reflect: true }) showErrors = false;
  /** Shows a clear affordance when the field has content. */
  @property({ type: Boolean, reflect: true }) clearable = false;
  /** Shows increment/decrement buttons for number fields. */
  @property({ type: Boolean }) showNumberButtons = false;
  /** Shows a password visibility toggle. */
  @property({ type: Boolean }) showPasswordToggle = true;

  /** Marks the field required for form validation. */
  @property({ type: Boolean, reflect: true }) override required = false;
  /** Native `step` for number inputs. */
  @property({ type: String }) step: string | null = null;
  /** Native `min` constraint. */
  @property({ type: String }) min: string | null = null;
  /** Native `max` constraint. */
  @property({ type: String }) max: string | null = null;
  /** Native `autocapitalize`. */
  @property({ type: String }) override autocapitalize = "off";
  /** Native `autocomplete`. */
  @property({ type: String }) autocomplete = "off";
  /** Native `spellcheck`. */
  @property({ type: Boolean }) override spellcheck = false;
  /** Text direction. */
  @property({ type: String }) override dir = "ltr";
  /** Textarea row count. */
  @property({ type: Number }) rows = 6;
  /** Textarea resize mode. */
  @property({ type: String }) resizable = "none";
  /** File input accept filter. */
  @property({ type: String }) accept = "";
  /** Allows multiple files when `type="file"`. */
  @property({ type: Boolean }) multiple = false;
  /** Native `inputmode` hint. */
  @property({ type: String }) inputmode: string | null = null;
  /** Native `enterkeyhint` for virtual keyboards. */
  @property({ type: String }) enterkeyhint: string | null = null;
  /** Native `pattern` validation regex. */
  @property({ type: String }) pattern: string | null = null;
  /** Native minimum string length. */
  @property({ type: Number }) minlength: number | null = null;
  /** Native maximum string length. */
  @property({ type: Number }) maxlength: number | null = null;
  /** ID of a `<datalist>` to associate. */
  @property({ type: String }) list: string | null = null;
  /** Native `size` attribute (character width) for text inputs. */
  @property({ type: Number }) nativeSize: number | null = null;
  /** Focuses the control on connect. */
  @property({ type: Boolean }) override autofocus = false;
  /** Enables capture on file inputs. */
  @property({ type: Boolean }) capture = false;
  /** Accessible name when no visible label is present. */
  @property({ type: String }) override ariaLabel = "";
  /** IDs of elements that label the control. */
  @property({ type: String }) ariaLabelledby: string | null = null;
  /** Host id; also prefixes internal control ids when set. */
  @property({ type: String }) override id = "";
  /** Shows validation affordances after interaction. */
  @property({ type: Boolean, reflect: true }) validationActive = false;
  /** Reflects validation failure state. */
  @property({ type: Boolean, reflect: true }) invalid = false;

  @state() private _selectedFileName = "";
  @state() private _selectedFiles: File[] = [];
  @state() private _selectedFileCount = 0;
  @state() private _totalFileSize = 0;
  @state() private _showPassword = false;
  @state() validationErrors: string[] = [];

  @query("input, textarea") private _nativeControl?: HTMLInputElement | HTMLTextAreaElement;

  readonly _validation = new FieldValidationController(this, "vu-inp");
  private static _idCounter = 0;
  private _inputId = `vu-inp-${VuInput._idCounter++}`;

  constructor() {
    super();
    unshadowFormControlFields(this);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.captureDefaultValue(String(this.value ?? ""));
    if (this.id.trim()) this._inputId = `${this.id.trim()}-input`;
  }

  override firstUpdated(_changed: PropertyValues<this>): void {
    super.firstUpdated(_changed);
    this.syncFormValue();
    this.syncValidity();
  }

  override willUpdate(changed: PropertyValues<this>): void {
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
    if (changed.has("value") && this.type === "file") {
      if (this.value == null || String(this.value).trim() === "") {
        this._resetFileState();
      } else if (!this._selectedFileName) {
        this._selectedFileName = String(this.value);
      }
    }
  }

  override updated(changed: PropertyValues<this>): void {
    super.updated(changed);
    const flags = changed as Map<PropertyKey, unknown>;
    if (
      flags.has("value") ||
      flags.has("_selectedFiles") ||
      flags.has("_selectedFileName") ||
      flags.has("type") ||
      flags.has("multiple") ||
      flags.has("name") ||
      flags.has("disabled")
    ) {
      this.syncFormValue();
    }
    if (
      flags.has("value") ||
      flags.has("_selectedFiles") ||
      flags.has("validationErrors") ||
      flags.has("required") ||
      flags.has("disabled") ||
      flags.has("readonly")
    ) {
      this.syncValidity();
    }
  }

  /** Recomputes validation messages; returns true when valid. */
  validateInput(): boolean {
    return this._validation.validate(this._fieldValidators(), {
      syncValidity: () => this.syncValidity(),
    });
  }

  /** Clears the value and emits `vu-clear`. */
  clear(): void {
    if (this.disabled || this.readonly) return;
    const previous = emittedInputValue(this.type, this.value);
    this._resetValueState();
    this._validation.activate();
    this.validateInput();
    this.syncFormValue();
    this.syncValidity();
    const next = emittedInputValue(this.type, this.value);
    emitInputChange(this, { value: next, previous });
    emitInputClear(this, { value: next });
  }

  override focus(options?: FocusOptions): void {
    this._nativeControl?.focus(options);
  }

  protected override getFormValue(): string | File | FormData | null {
    if (!this.name) return null;
    if (this.type === "file") {
      if (!this._selectedFiles.length) return null;
      if (this.multiple) {
        const fd = new FormData();
        for (const file of this._selectedFiles) fd.append(this.name, file);
        return fd;
      }
      return this._selectedFiles[0] ?? null;
    }
    return this.value == null ? "" : String(this.value);
  }

  protected override setValueFromFormState(state: FormState): void {
    if (typeof state === "string") {
      this.value = state;
      return;
    }
    this._resetFileState();
    this.value = "";
  }

  protected override getValidityAnchor(): HTMLElement | undefined {
    return this._nativeControl;
  }

  protected override isEmpty(): boolean {
    if (this.type === "file") return this._selectedFiles.length === 0;
    return this.value == null || String(this.value).trim() === "";
  }

  protected override getCustomErrorMessage(): string {
    return this.validationErrors[0] ?? "";
  }

  protected override getNativeControl(): HTMLElement | null {
    return this._nativeControl ?? null;
  }

  protected override onNativeValueMutated(
    native: HTMLInputElement | HTMLTextAreaElement | null,
  ): void {
    if (this.type !== "file") {
      this.value = native?.value ?? "";
    }
    this.validateInput();
  }

  protected override getValidationValue(): string | File[] {
    if (this.type === "file") return this._selectedFiles;
    return String(this.value ?? "");
  }

  protected override onFormReset(): void {
    this.setValueFromFormState(this.defaultValue);
    this._validation.clear();
    this._showPassword = false;
    if (this.type === "file") this._resetFileState();
  }

  private get _inputElementId(): string {
    return this.id.trim() ? `${this.id.trim()}-input` : this._inputId;
  }

  private get _hasLabel(): boolean {
    return slotOrPropVisible(this, "label", this.label);
  }

  private get _startFilled(): boolean {
    return hasLightChildrenInSlot(this, "start");
  }

  private get _endFilled(): boolean {
    return hasLightChildrenInSlot(this, "end");
  }

  private get _inputAriaLabel(): string | typeof nothing {
    if (this._hasLabel) return nothing;
    const label = this.ariaLabel.trim();
    return label ? label : nothing;
  }

  private get _ariaDescribedBy(): string | typeof nothing {
    const ids = this._validation.ariaDescribedBy();
    return ids ? ids : nothing;
  }

  private get _isInvalid(): boolean {
    return this._validation.showError || (this.validationActive && this.invalid);
  }

  private get _showClear(): boolean {
    return (
      this.clearable &&
      !this.disabled &&
      !this.readonly &&
      (Boolean(this.value && String(this.value).length) ||
        Boolean(this._selectedFileName) ||
        this._selectedFileCount > 0)
    );
  }

  private _fieldValidators(): FieldValidator[] {
    return [
      requiredFieldValidator(
        this.required,
        () => this.isEmpty(),
        this.requiredMessage || "This field is required.",
      ),
    ];
  }

  private _resetFileState(): void {
    this._selectedFileName = "";
    this._selectedFiles = [];
    this._selectedFileCount = 0;
    this._totalFileSize = 0;
  }

  private _resetValueState(): void {
    this.value = "";
    this._resetFileState();
    this._showPassword = false;
  }

  private _emitValueChange(previous: string | number): void {
    const next = emittedInputValue(this.type, this.value);
    if (next === previous) return;
    emitInputChange(this, { value: next, previous });
  }

  private _commitInput = (event: Event): void => {
    if (this.disabled || this.readonly) {
      event.preventDefault();
      return;
    }
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const previous = emittedInputValue(this.type, this.value);
    this.value = target.value;
    this.syncFormValue();
    this.validateInput();
    this.reemitNativeEvent("input", event);
    this._emitValueChange(previous);
  };

  private _onFocus = (event: Event): void => {
    event.stopPropagation();
    this.reemitNativeEvent("focus", event);
  };

  private _onBlur = (event: Event): void => {
    event.stopPropagation();
    this._validation.activate();
    this.validateInput();
    this.reemitNativeEvent("blur", event);
  };

  private _onFileChange = (event: Event): void => {
    if (this.disabled || this.readonly) return;
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    if (!files.length) {
      this.value = "";
      this._resetFileState();
      this.validateInput();
      return;
    }
    this._selectedFiles = files;
    this._selectedFileName = fileListLabel(files);
    this._selectedFileCount = files.length;
    this._totalFileSize = sumFileSizes(files);
    this.value = this._selectedFileName;
    this.syncFormValue();
    this.validateInput();
    this.reemitNativeEvent("change", event);
    emitInputFile(this, {
      files,
      fileName: this._selectedFileName,
      totalSize: this._totalFileSize,
      fileCount: this._selectedFileCount,
    });
  };

  private _onFileKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Enter" && this.type === "file") {
      event.preventDefault();
      this._nativeControl?.click();
    }
  };

  private _onClear = (event: Event): void => {
    event.stopPropagation();
    this.clear();
  };

  private _onTogglePassword = (event: Event): void => {
    event.stopPropagation();
    this._showPassword = !this._showPassword;
  };

  private _onIncrement = (event: Event): void => {
    event.stopPropagation();
    this._stepNumber(1);
  };

  private _onDecrement = (event: Event): void => {
    event.stopPropagation();
    this._stepNumber(-1);
  };

  private _stepNumber(direction: 1 | -1): void {
    if (this.disabled || this.readonly) return;
    const previous = emittedInputValue(this.type, this.value);
    const next = stepInputNumber(
      this.value,
      this.step,
      this.min,
      this.max,
      direction,
    );
    if (next == null) return;
    this.value = next;
    this.validateInput();
    this.syncFormValue();
    this._emitValueChange(previous);
    this._nativeControl?.focus({ preventScroll: true });
  }

  private _onNumberPointerDown = (event: Event): void => {
    event.preventDefault();
    event.stopPropagation();
    this._nativeControl?.focus({ preventScroll: true });
  };

  private get _opensNativePicker(): boolean {
    return (
      this.type === "date" ||
      this.type === "time" ||
      this.type === "week" ||
      this.type === "month" ||
      this.type === "datetime-local"
    );
  }

  private _onContainerClick = (event: Event): void => {
    if (this.disabled) return;
    const target = event.target as HTMLElement;
    if (target.closest(".input-action, .number-stepper, .input-affix[interactive]")) {
      return;
    }
    this._nativeControl?.focus();
    if (this._opensNativePicker && !this.readonly) {
      this.showPicker();
    }
  };

  private _onContainerKeydown = (event: KeyboardEvent): void => {
    if (this.disabled || (event.key !== "Enter" && event.key !== " ")) return;
    const target = event.target as HTMLElement;
    if (
      target === this._nativeControl ||
      target.closest(".input-action, .number-stepper, .input-affix[interactive]")
    ) {
      return;
    }
    event.preventDefault();
    this._onContainerClick(event);
  };

  private _onAffixActivate = (_side: "start" | "end", event: Event): void => {
    event.stopPropagation();
    if (this.type === "file") {
      this._nativeControl?.click();
      return;
    }
    if (this._opensNativePicker) {
      this.showPicker();
    }
  };

  private _onAffixKeydown = (side: "start" | "end", event: KeyboardEvent): void => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    this._onAffixActivate(side, event);
  };

  private get _renderHost(): InputRenderHost {
    return {
      type: this.type,
      value: this.value,
      placeholder: this.placeholder,
      label: this.label,
      hint: this.hint,
      loading: this.loading,
      disabled: this.disabled,
      readonly: this.readonly,
      required: this.required,
      clearable: this.clearable,
      showNumberButtons: this.showNumberButtons,
      showPasswordToggle: this.showPasswordToggle,
      showPassword: this._showPassword,
      rows: this.rows,
      resizable: this.resizable,
      accept: this.accept,
      multiple: this.multiple,
      step: this.step,
      min: this.min,
      max: this.max,
      autocapitalize: this.autocapitalize,
      autocomplete: this.autocomplete,
      spellcheck: this.spellcheck,
      dir: this.dir,
      inputmode: this.inputmode,
      enterkeyhint: this.enterkeyhint,
      pattern: this.pattern,
      minlength: this.minlength,
      maxlength: this.maxlength,
      list: this.list,
      nativeSize: this.nativeSize,
      autofocus: this.autofocus,
      capture: this.capture,
      ariaLabel: this.ariaLabel,
      ariaLabelledby: this.ariaLabelledby,
      selectedFileName: this._selectedFileName,
      totalFileSize: this._totalFileSize,
      selectedFileCount: this._selectedFileCount,
      validationErrors: this.validationErrors,
      inputElementId: this._inputElementId,
      hasLabel: this._hasLabel,
      startFilled: this._startFilled,
      endFilled: this._endFilled,
      showHint: this._validation.showHint,
      showError: this._validation.showError,
      hintId: this._validation.hintId,
      errorId: this._validation.errorId,
      ariaDescribedBy: this._ariaDescribedBy,
      inputAriaLabel: this._inputAriaLabel,
      isInvalid: this._isInvalid,
      isFileInput: this.type === "file",
      isTextarea: this.type === "textarea",
      isPassword: this.type === "password",
      isNumberInput: this.type === "number",
      isPickerType: this._opensNativePicker,
      showFileInfo: this.type === "file" && this._totalFileSize > 0,
      showClear: this._showClear,
      fileSizeLabel: formatInputFileSize(this._totalFileSize),
      onContainerClick: this._onContainerClick,
      onContainerKeydown: this._onContainerKeydown,
      onInput: this._commitInput,
      onFocus: this._onFocus,
      onBlur: this._onBlur,
      onFileChange: this._onFileChange,
      onFileKeydown: this._onFileKeydown,
      onClear: this._onClear,
      onTogglePassword: this._onTogglePassword,
      onIncrement: this._onIncrement,
      onDecrement: this._onDecrement,
      onAffixActivate: this._onAffixActivate,
      onAffixKeydown: this._onAffixKeydown,
      onNumberPointerDown: this._onNumberPointerDown,
    };
  }

  override render() {
    return html`${renderInput(this._renderHost)}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-input": VuInput;
  }
}
