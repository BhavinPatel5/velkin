import { html, LitElement, nothing, type PropertyValues, type TemplateResult } from "lit";
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
  commitSerialValue,
  dispatchSerialClear,
  type SerialCommitHost,
} from "./internals/serial-commit.js";
import {
  clearSerialNativeInputs,
  focusSerialAfterPaste,
  handleSerialCellInput,
  handleSerialCellKeydown,
  handleSerialPaste,
  triggerSerialShake,
  type SerialInputHost,
} from "./internals/serial-input.js";
import {
  canonicalSerialFromRaw,
  ensureSerialDisplayBuffer,
  getSerialRawFromDisplay,
  normalizeSerialRaw,
  serialSeparatorIndices,
  syncSerialDisplayFromValue,
} from "./internals/serial-value.js";
import { serialStyles } from "./serial.style.js";
import type {
  VuSerialChangeDetail,
  VuSerialClearDetail,
  VuSerialInvalidDetail,
  VuSerialSize,
  VuSerialTone,
  VuSerialVariant,
  VuSerialRadius
} from "./serial.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuSerialChangeDetail,
  VuSerialClearDetail,
  VuSerialInvalidDetail,
  VuSerialSize,
  VuSerialTone,
  VuSerialVariant,
  VuSerialRadius
} from "./serial.types.js";
import { reflectString } from "../internals/utils/reflect-string.js";

/**
 * @element vu-serial
 *
 * @summary A serial input component for license keys with group separators.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/serial
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
 * @property {VuSerialVariant} variant - Field chrome recipe. Default: `"default"`.
 * @property {VuSerialTone} tone - Neutral surface weight. Default: `"normal"`.
 * @property {VuSerialSize} size - Cell scale. Default: `"md"`.
 * @property {VuSerialRadius} radius - Corner preset (`none`/`sm`/`md`/`lg`/`full`). Default: `md`.
 * @property {boolean} block - Stretches the cell row to the container width. Default: `false`.
 * @property {boolean} compact - Tighter label/hint/error spacing. Default: `false`.
 * @property {number} length - Total number of character boxes. Default: `10`.
 * @property {string} separator - Separator character between groups. Default: `"-"`.
 * @property {number[]} separatorpositions - Cell indices after which a separator is shown (JS-only).
 * @property {boolean} alphanumeric - Allows letters in addition to digits. Default: `false`.
 * @property {string} value - Canonical serial string (may include separators). Default: `""`.
 * @property {boolean} withseparator - Includes separators in `value` and form submission. Default: `false`.
 * @property {boolean} masked - Masks cell glyphs (`type="password"`). Default: `false`.
 * @property {boolean} showerrors - Shows validation after activation (`showerrors` attr). Default: `false`.
 * @property {boolean} validationactive - Drives invalid styling after activation (`validationactive` attr). Default: `false`.
 * @property {boolean} invalid - True when last validation found errors (`invalid` attr). Default: `false`.
 * @property {string} incompletemessage - Error when some cells are filled but not all; empty uses default.
 * @property {string} arialabel - Names the row when no visible label is present.
 *
 * @csspart field - Column stacking label, cells row, hint, and error.
 * @csspart label - Label element above the serial row.
 * @csspart cells - Flex row wrapping groups and separators (`role="group"`).
 * @csspart group - Tight cluster of cells between separators.
 * @csspart separator - Visual separator glyph between groups.
 * @csspart cell - One serial character input.
 * @csspart hint - Neutral helper text under the row.
 * @csspart error-message - Region for `slot="error"` or stacked default validation lines.
 * @csspart error-line - One default validation string when `slot="error"` is empty.
 * @csspart text - String `label` text when the `label` slot is empty.
 *
 * @cssproperty --serial-radius - Cell corner radius from the `radius` prop.
 * @cssproperty --serial-cell-size - Cell inline/block size per `size`.
 * @cssproperty --serial-gap - Gap between cells inside a group.
 * @cssproperty --serial-group-gap - Gap between groups and separators.
 *
 * @method reset - Clears cells to `defaultValue` and dispatches `vu-clear`.
 * @method focusFirst - Focuses the first serial cell.
 * @method validateInput - Runs validators and syncs validity.
 *
 * @fires {CustomEvent<VuSerialChangeDetail>} vu-change - Committed value change (`detail.value`).
 * @fires {CustomEvent<VuSerialInvalidDetail>} vu-invalid - When validation messages are recomputed.
 * @fires {CustomEvent<VuSerialClearDetail>} vu-clear - After `reset()` syncs from `defaultValue`.
 */
@customElement("vu-serial")
@withComponentPresets
export class VuSerial extends FormControlBase {
  private static _idCounter = 0;

  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = serialStyles;

  /** Field chrome recipe. Default: `"default"`. */
  @property({ type: String, reflect: true }) variant: VuSerialVariant = "default";
  /** Neutral surface weight. Default: `"normal"`. */
  @property({ type: String, reflect: true }) tone: VuSerialTone = "normal";
  /** Cell scale. Default: `"md"`. */
  @property({ type: String, reflect: true }) size: VuSerialSize = "md";
  /** Capsule cell corners. */
  @property({ type: String, reflect: true }) radius: VuSerialRadius = "md";
  /** Stretches the cell row to the container width. */
  @property({ type: Boolean, reflect: true }) block = false;
  /** Tighter label/hint/error spacing. */
  @property({ type: Boolean, reflect: true }) compact = false;

  /** Total number of character boxes. */
  @property({ type: Number, reflect: true }) length = 10;
  /** Separator character between groups. */
  @property({ type: String, reflect: true }) separator = "-";
  /** Cell indices after which a separator is inserted (e.g. `[3, 6]`). */
  @property({ attribute: false }) separatorPositions: number[] = [3];
  /** Allows letters in addition to digits. */
  @property({ type: Boolean, reflect: true }) alphanumeric = false;
  /** Canonical serial string (may include separators). */
  @property(reflectString) value = "";
  /** Includes separators in `value` and form submission. */
  @property({ type: Boolean, reflect: true }) withSeparator = false;
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

  private readonly _validation = new FieldValidationController(this, "vu-serial");
  private readonly _idBase = VuSerial._idCounter++;
  private readonly _labelId = `vu-serial-label-${this._idBase}`;
  private readonly _groupId = `vu-serial-group-${this._idBase}`;

  /** @internal Non-reactive display buffer (prevents Lit change-in-update warnings). */
  displayValues: string[] = [];
  /** @internal Last value emitted by `vu-change`. */
  _lastCommitted = "";

  private get _inputHost(): SerialInputHost {
    return this as SerialInputHost;
  }

  private get _commitHost(): SerialCommitHost & { _lastCommitted: string } {
    const host = this;
    return {
      get disabled() {
        return host.disabled;
      },
      get value() {
        return host.value;
      },
      get _lastCommitted() {
        return host._lastCommitted;
      },
      set _lastCommitted(v: string) {
        host._lastCommitted = v;
      },
      _activateAndValidate: () => host._activateAndValidate(),
      dispatchEvent: (event) => host.dispatchEvent(event),
    };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.captureDefaultValue(this.value ?? "");
    if (!this.hasAttribute("tabindex")) this.tabIndex = -1;
    ensureSerialDisplayBuffer(this._inputHost);
    this.addEventListener("focusout", this._onFocusOut);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener("focusout", this._onFocusOut);
  }

  override firstUpdated(): void {
    this._normalizeValueAndDisplay();
    this._lastCommitted = this.value ?? "";
    this.syncFormValue();
    this.syncValidity();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    super.willUpdate(changed);

    if (
      changed.has("length") ||
      changed.has("separator") ||
      changed.has("separatorPositions") ||
      changed.has("alphanumeric") ||
      changed.has("withSeparator") ||
      changed.has("value")
    ) {
      this._normalizeValueAndDisplay();
    }
  }

  protected override getFormValue(): FormState {
    if (!this.name || this.disabled) return null;
    const raw = getSerialRawFromDisplay(this);
    return canonicalSerialFromRaw(this, raw);
  }

  protected override setValueFromFormState(state: FormState): void {
    const s = typeof state === "string" ? state : "";
    const raw = normalizeSerialRaw(this, s);
    this.value = canonicalSerialFromRaw(this, raw);
    syncSerialDisplayFromValue(this);
    this._lastCommitted = this.value;
  }

  protected override getValidityAnchor(): HTMLElement | undefined {
    return this.shadowRoot?.querySelector(".serial-cell") ?? undefined;
  }

  protected override isEmpty(): boolean {
    const raw = getSerialRawFromDisplay(this);
    return raw.trim().length < this.length;
  }

  protected override getNativeControl(): HTMLElement | null {
    return this.shadowRoot?.querySelector(".serial-cell") ?? null;
  }

  protected override validateForForm(): string {
    const raw = getSerialRawFromDisplay(this);
    if (raw.length > 0 && raw.length < this.length) {
      const custom = this.incompleteMessage.trim();
      return custom || `Enter all ${this.length} characters.`;
    }
    return "";
  }

  protected override onFormReset(): void {
    const raw = normalizeSerialRaw(this, this.defaultValue ?? "");
    this.value = canonicalSerialFromRaw(this, raw);
    syncSerialDisplayFromValue(this);
    this._lastCommitted = this.value;
    this._validation.clear();
    queueMicrotask(() => clearSerialNativeInputs(this._inputHost));
  }

  private _normalizeValueAndDisplay(): void {
    ensureSerialDisplayBuffer(this);
    const raw = normalizeSerialRaw(this, this.value ?? "");
    const canonical = canonicalSerialFromRaw(this, raw);
    if ((this.value ?? "") !== canonical) this.value = canonical;
    syncSerialDisplayFromValue(this);
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
    dispatchSerialClear(this._commitHost, this.value);
  }

  /** Focuses the first serial cell. */
  focusFirst(): void {
    this.shadowRoot?.querySelector<HTMLInputElement>(".serial-cell")?.focus();
  }

  override focus(): void {
    const first = this.shadowRoot?.querySelector<HTMLInputElement>(".serial-cell");
    if (first) {
      first.focus();
      triggerSerialShake(this._inputHost);
    }
  }

  private get _hasLabel(): boolean {
    return slotOrPropVisible(this, "label", this.label);
  }

  private get _groupAriaLabel(): string | typeof nothing {
    if (this._hasLabel) return nothing;
    const a = this.ariaLabel.trim();
    return a ? a : "Serial input";
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
    if (!stillInside) commitSerialValue(this._commitHost);
  };

  private _onCellBlur = (): void => {
    this._validation.validateNow(this._fieldValidators(), {
      syncValidity: () => this.syncValidity(),
    });
    this.syncValidity();
  };

  private _onCellChange = (): void => {
    commitSerialValue(this._commitHost);
  };

  private _onCellKeydown = (event: KeyboardEvent, index: number): void => {
    handleSerialCellKeydown(this._inputHost, event, index);
    if (event.key === "Enter") {
      event.preventDefault();
      commitSerialValue(this._commitHost);
    }
  };

  private _onCellPaste = (event: ClipboardEvent): void => {
    handleSerialPaste(this._inputHost, event);
    focusSerialAfterPaste(this._inputHost);
    commitSerialValue(this._commitHost);
  };

  private _renderCell(index: number): TemplateResult {
    return html`
      <input
        class="serial-cell"
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
        @input=${(e: Event) => handleSerialCellInput(this._inputHost, e, index)}
        @keydown=${(e: KeyboardEvent) => this._onCellKeydown(e, index)}
        @paste=${this._onCellPaste}
        @blur=${this._onCellBlur}
        @change=${this._onCellChange}
      />
    `;
  }

  private _renderGroups(): TemplateResult[] {
    const fields: TemplateResult[] = [];
    const positions = serialSeparatorIndices(this.separatorPositions);
    let separatorIndex = 0;
    let group: TemplateResult[] = [];

    for (let i = 0; i < this.length; i++) {
      if (positions[separatorIndex] === i) {
        fields.push(html`<div class="serial-group" part="group">${group}</div>`);
        fields.push(
          html`<span class="serial-separator" part="separator">${this.separator}</span>`,
        );
        group = [];
        separatorIndex++;
      }
      group.push(this._renderCell(i));
    }

    if (group.length) {
      fields.push(html`<div class="serial-group" part="group">${group}</div>`);
    }
    return fields;
  }

  override render() {
    const hasLabel = this._hasLabel;
    const describedBy = this._ariaDescribedBy;

    return html`
      <div class="serial-field" part="field">
        <label
          id=${this._labelId}
          class="serial-label"
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
          class="serial-cells"
          part="cells"
          role="group"
          aria-labelledby=${hasLabel ? this._labelId : nothing}
          aria-label=${this._groupAriaLabel as string | typeof nothing}
          aria-describedby=${ifDefined(describedBy)}
        >
          ${this._renderGroups()}
        </div>

        ${when(this._validation.showHint, () =>
          renderFieldHint({
            hintId: this._validation.hintId,
            hintText: this.hint,
            hintClass: "serial-hint field-hint",
            hintTag: "div",
            ariaLive: "polite",
          }),
        )}
        ${when(this._validation.showError, () =>
          renderFieldErrors({
            errorId: this._validation.errorId,
            errors: this.validationErrors,
            errorMessageClass: "error-message field-error-message",
            errorLineClass: "serial-error-line field-error-line",
          }),
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-serial": VuSerial;
  }
}
