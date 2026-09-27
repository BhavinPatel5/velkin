import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { live } from "lit/directives/live.js";
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
import { slotOrPropVisible } from "../internals/utils/slot.js";
import {
  commitOtpValue,
  dispatchOtpClear,
  type OtpCommitHost,
} from "./internals/otp-commit.js";
import {
  clearOtpNativeInputs,
  ensureOtpDisplayBuffer,
  focusOtpAfterPaste,
  handleOtpCellInput,
  handleOtpCellKeydown,
  handleOtpPaste,
  syncOtpDisplayFromValue,
  triggerOtpShake,
  type OtpInputHost,
} from "./internals/otp-input.js";
import { otpStyles } from "./otp.style.js";
import type {
  VuOtpChangeDetail,
  VuOtpClearDetail,
  VuOtpInvalidDetail,
  VuOtpSize,
  VuOtpTone,
  VuOtpVariant,
  VuOtpRadius
} from "./otp.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuOtpChangeDetail,
  VuOtpClearDetail,
  VuOtpInvalidDetail,
  VuOtpSize,
  VuOtpTone,
  VuOtpVariant,
  VuOtpRadius
} from "./otp.types.js";
import { reflectString } from "../internals/utils/reflect-string.js";

/**
 * @element vu-otp
 *
 * @summary An OTP input component with segmented fields, paste support, and validation.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/otp
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
 * @property {boolean} disabled - Non-interactive; blocks cell entry (`disabled` attr).
 * @property {boolean} readonly - Focusable but cannot change cells (`readonly` attr).
 * @property {boolean} required - Blocks valid submit when incomplete (`required` attr).
 * @property {string} requiredmessage - Custom `valueMissing` message (`requiredmessage` attr).
 * @property {string} label - Plain-text label; slotted `label` wins when assigned.
 * @property {string} hint - Helper text; `hint` slot wins when assigned.
 * @property {string} id - Host id for label `for` / `aria-*` wiring.
 * @property {VuOtpVariant} variant - Field chrome recipe. Default: `"default"`.
 * @property {VuOtpTone} tone - Neutral surface weight. Default: `"normal"`.
 * @property {VuOtpSize} size - Cell scale. Default: `"md"`.
 * @property {VuOtpRadius} radius - Corner preset (`none`/`sm`/`md`/`lg`/`full`). Default: `md`.
 * @property {boolean} block - Stretches the cell row to the container width. Default: `false`.
 * @property {boolean} compact - Tighter label/hint/error spacing. Default: `false`.
 * @property {number} length - Number of OTP characters. Default: `6`.
 * @property {boolean} alphanumeric - Allows letters in addition to digits. Default: `false`.
 * @property {string} value - Canonical OTP string (unmasked). Default: `""`.
 * @property {boolean} masked - Masks cell glyphs (`type="password"`). Default: `false`.
 * @property {boolean} showerrors - Shows validation after activation (`showerrors` attr). Default: `false`.
 * @property {boolean} validationactive - Drives invalid styling after activation (`validationactive` attr). Default: `false`.
 * @property {boolean} invalid - True when last validation found errors (`invalid` attr). Default: `false`.
 * @property {string} incompletemessage - Error when some cells are filled but not all; empty uses default.
 * @property {string} arialabel - Names the row when no visible label is present.
 *
 * @csspart field - Column stacking label, cells row, hint, and error.
 * @csspart label - Label element above the OTP row.
 * @csspart cells - Flex row wrapping all digit cells (`role="group"`).
 * @csspart cell - One OTP character input.
 * @csspart hint - Neutral helper text under the row.
 * @csspart error-message - Region for `slot="error"` or stacked default validation lines.
 * @csspart error-line - One default validation string when `slot="error"` is empty.
 * @csspart text - String `label` text when the `label` slot is empty.
 *
 * @cssproperty --otp-radius - Cell corner radius from the `radius` prop.
 * @cssproperty --otp-cell-size - Cell inline/block size per `size`.
 * @cssproperty --otp-gap - Gap between cells.
 *
 * @method reset - Clears cells to `defaultValue` and dispatches `vu-clear`.
 * @method focusFirst - Focuses the first OTP cell.
 * @method validateInput - Runs validators and syncs validity.
 *
 * @fires {CustomEvent<VuOtpChangeDetail>} vu-change - Committed value change (`detail.value`).
 * @fires {CustomEvent<VuOtpInvalidDetail>} vu-invalid - When validation messages are recomputed.
 * @fires {CustomEvent<VuOtpClearDetail>} vu-clear - After `reset()` syncs from `defaultValue`.
 */
@customElement("vu-otp")
@withComponentPresets
export class VuOtp extends FormControlBase {
  private static _idCounter = 0;

  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = otpStyles;

  /** Field chrome recipe. Default: `"default"`. */
  @property({ type: String, reflect: true }) variant: VuOtpVariant = "default";
  /** Neutral surface weight. Default: `"normal"`. */
  @property({ type: String, reflect: true }) tone: VuOtpTone = "normal";
  /** Cell scale. Default: `"md"`. */
  @property({ type: String, reflect: true }) size: VuOtpSize = "md";
  /** Capsule cell corners. */
  @property({ type: String, reflect: true }) radius: VuOtpRadius = "md";
  /** Stretches the cell row to the container width. */
  @property({ type: Boolean, reflect: true }) block = false;
  /** Tighter label/hint/error spacing. */
  @property({ type: Boolean, reflect: true }) compact = false;

  /** Number of OTP characters. */
  @property({ type: Number, reflect: true }) length = 6;
  /** Allows letters in addition to digits. */
  @property({ type: Boolean, reflect: true }) alphanumeric = false;
  /** Canonical OTP string (unmasked). */
  @property(reflectString) value = "";
  /** Masks cell glyphs (`type="password"`). */
  @property({ type: Boolean, reflect: true }) masked = false;

  /** Plain-text label; slotted `label` wins when assigned. */
  @property({ type: String }) label = "";
  /** Helper text; `hint` slot wins when assigned. */
  @property({ type: String }) hint = "";
  /** Error when some cells are filled but not all; empty uses a default. */
  @property({ type: String }) incompleteMessage = "";
  /** Names the row when no visible label is present. */
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

  private readonly _validation = new FieldValidationController(this, "vu-otp");
  private readonly _idBase = VuOtp._idCounter++;
  private readonly _labelId = `vu-otp-label-${this._idBase}`;
  private readonly _groupId = `vu-otp-group-${this._idBase}`;

  /** @internal Non-reactive display buffer (prevents Lit change-in-update warnings). */
  displayValues: string[] = [];
  /** @internal Last value emitted by `vu-change`. */
  _lastCommitted = "";

  private get _inputHost(): OtpInputHost {
    return this as OtpInputHost;
  }

  private get _commitHost(): OtpCommitHost {
    const host = this;
    return {
      get disabled() {
        return host.disabled;
      },
      get value() {
        return host.value;
      },
      get length() {
        return host.length;
      },
      get _lastCommitted() {
        return host._lastCommitted;
      },
      set _lastCommitted(v: string) {
        host._lastCommitted = v;
      },
      _activateAndValidate: () => host._activateAndValidate(),
      dispatchEvent: (event) => host.dispatchEvent(event),
    } as OtpCommitHost & { _lastCommitted: string };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.captureDefaultValue(this.value ?? "");
    if (!this.hasAttribute("tabindex")) this.tabIndex = -1;
    ensureOtpDisplayBuffer(this._inputHost);
    this.addEventListener("focusout", this._onFocusOut);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("focusout", this._onFocusOut);
  }

  override firstUpdated(): void {
    syncOtpDisplayFromValue(this._inputHost);
    this._lastCommitted = (this.value ?? "").slice(0, this.length);
    this.syncFormValue();
    this.syncValidity();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    super.willUpdate(changed);

    if (changed.has("length")) {
      ensureOtpDisplayBuffer(this._inputHost);
      this.value = (this.value ?? "").slice(0, this.length);
      syncOtpDisplayFromValue(this._inputHost);
    }

    if (changed.has("value")) {
      this.value = (this.value ?? "").slice(0, this.length);
      syncOtpDisplayFromValue(this._inputHost);
    }
  }

  protected override getFormValue(): FormState {
    if (!this.name || this.disabled) return null;
    return (this.value ?? "").slice(0, this.length);
  }

  protected override setValueFromFormState(state: FormState): void {
    const s = typeof state === "string" ? state : "";
    this.value = s.slice(0, this.length);
    syncOtpDisplayFromValue(this._inputHost);
    this._lastCommitted = this.value;
  }

  protected override getValidityAnchor(): HTMLElement | undefined {
    return this.shadowRoot?.querySelector(".otp-cell") ?? undefined;
  }

  protected override isEmpty(): boolean {
    return (this.value ?? "").trim().length < this.length;
  }

  protected override getNativeControl(): HTMLElement | null {
    return this.shadowRoot?.querySelector(".otp-cell") ?? null;
  }

  protected override validateForForm(): string {
    const v = (this.value ?? "").slice(0, this.length);
    if (v.length > 0 && v.length < this.length) {
      const custom = this.incompleteMessage.trim();
      return custom || `Enter all ${this.length} characters.`;
    }
    return "";
  }

  protected override onFormReset(): void {
    this.value = (this.defaultValue ?? "").slice(0, this.length);
    syncOtpDisplayFromValue(this._inputHost);
    this._lastCommitted = this.value;
    this._validation.clear();
    queueMicrotask(() => clearOtpNativeInputs(this._inputHost));
  }

  private _fieldValidators() {
    return [
      customFieldValidator(() => this.validateForForm()),
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

  private _activateAndValidate(): void {
    this._validation.validateNow(this._fieldValidators(), {
      syncValidity: () => this.syncValidity(),
    });
  }

  /** Clears cells to `defaultValue` and dispatches `vu-clear`. */
  reset(): void {
    this.onFormReset();
    this.syncFormValue();
    this.syncValidity();
    dispatchOtpClear(this._commitHost, this.value);
  }

  /** Focuses the first OTP cell. */
  focusFirst(): void {
    this.shadowRoot?.querySelector<HTMLInputElement>(".otp-cell")?.focus();
  }

  override focus(): void {
    const first = this.shadowRoot?.querySelector<HTMLInputElement>(".otp-cell");
    if (first) {
      first.focus();
      triggerOtpShake(this._inputHost);
    }
  }

  private get _hasLabel(): boolean {
    return slotOrPropVisible(this, "label", this.label);
  }

  private get _groupAriaLabel(): string | typeof nothing {
    if (this._hasLabel) return nothing;
    const a = this.ariaLabel.trim();
    return a ? a : "OTP input";
  }

  private get _ariaDescribedBy(): string | undefined {
    const ids = this._validation.ariaDescribedBy();
    return ids || undefined;
  }

  private get _cellsInvalid(): boolean {
    return this.invalid || this._validation.showError;
  }

  private _onFocusOut = (event: FocusEvent): void => {
    if (!this.shadowRoot) return;
    const related = event.relatedTarget as Node | null;
    const stillInside = !!related && this.shadowRoot.contains(related);
    if (!stillInside) commitOtpValue(this._commitHost);
  };

  private _onCellBlur = (): void => {
    this._validation.validateNow(this._fieldValidators(), {
      syncValidity: () => this.syncValidity(),
    });
    this.syncValidity();
  };

  private _onCellChange = (): void => {
    commitOtpValue(this._commitHost);
  };

  private _onCellKeydown = (event: KeyboardEvent, index: number): void => {
    handleOtpCellKeydown(this._inputHost, event, index);
    if (event.key === "Enter") {
      event.preventDefault();
      commitOtpValue(this._commitHost);
    }
  };

  private _onCellPaste = (event: ClipboardEvent): void => {
    handleOtpPaste(this._inputHost, event);
    focusOtpAfterPaste(this._inputHost);
    commitOtpValue(this._commitHost);
  };

  override render() {
    const hasLabel = this._hasLabel;
    const describedBy = this._ariaDescribedBy;

    return html`
      <div class="otp-field" part="field">
        <label
          id=${this._labelId}
          class="otp-label"
          part="label"
        >
          <slot name="label">
            ${this.label
              ? html`<span part="text">${this.label}</span>`
              : nothing}
          </slot>
        </label>

        <div
          id=${this._groupId}
          class="otp-cells"
          part="cells"
          role="group"
          aria-labelledby=${hasLabel ? this._labelId : nothing}
          aria-label=${this._groupAriaLabel as string | typeof nothing}
          aria-describedby=${ifDefined(describedBy)}
        >
          ${Array.from({ length: this.length }).map((_, index) => html`
            <input
              class="otp-cell"
              part="cell"
              .type=${this.masked ? "password" : "text"}
              maxlength="1"
              inputmode=${this.alphanumeric ? "text" : "numeric"}
              autocomplete=${index === 0 ? "one-time-code" : "off"}
              .value=${live(this.displayValues[index] ?? "")}
              ?disabled=${this.disabled}
              .readOnly=${this.readonly}
              aria-label=${`Character ${index + 1} of ${this.length}`}
              aria-invalid=${this._cellsInvalid ? "true" : "false"}
              @input=${(e: Event) => handleOtpCellInput(this._inputHost, e, index)}
              @keydown=${(e: KeyboardEvent) => this._onCellKeydown(e, index)}
              @paste=${this._onCellPaste}
              @blur=${this._onCellBlur}
              @change=${this._onCellChange}
            />
          `)}
        </div>

        ${when(this._validation.showHint, () =>
          renderFieldHint({
            hintId: this._validation.hintId,
            hintText: this.hint,
            hintClass: "otp-hint field-hint",
            hintTag: "div",
            ariaLive: "polite",
          }),
        )}
        ${when(this._validation.showError, () =>
          renderFieldErrors({
            errorId: this._validation.errorId,
            errors: this.validationErrors,
            errorMessageClass: "error-message field-error-message",
            errorLineClass: "otp-error-line field-error-line",
          }),
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-otp": VuOtp;
  }
}
