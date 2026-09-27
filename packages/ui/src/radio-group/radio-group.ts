import { html, nothing, type PropertyValues } from "lit";
import { customElement, property, queryAssignedElements, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { FormControlBase, type FormState } from "../internals/form/form-control-base.js";
import { FieldValidationController } from "../internals/form/field-validation-controller.js";
import { requiredFieldValidator } from "../internals/form/field-validation.js";
import {
  renderFieldErrors,
  renderFieldHint,
} from "../internals/form/field-validation-render.js";
import { unshadowFormControlFields } from "../internals/form/unshadow-fields.js";
import { slotOrPropVisible } from "../internals/utils/slot.js";
import { VuRadio } from "../radio/radio.js";
import type { VuRadioColor, VuRadioSize, VuRadioTone, VuRadioVariant } from "../radio/radio.types.js";
import {
  radioGroupClaimAttribute,
  radioGroupClaimBooleanAttribute,
  radioGroupReleaseAttribute,
  type RadioGroupAttrOwnership,
} from "./internals/radio-group-attrs.js";
import { radioGroupStyles } from "./radio-group.style.js";
import type {
  VuRadioGroupChangeDetail,
  VuRadioGroupOrientation,
  VuRadioGroupValidationErrorDetail,
} from "./radio-group.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuRadioGroupChangeDetail,
  VuRadioGroupOrientation,
  VuRadioGroupValidationErrorDetail,
} from "./radio-group.types.js";

const MEMBER_SELECTOR = "vu-radio";
const FORWARDABLE = ["variant", "color", "tone", "size"] as const;

/**
 * @element vu-radio-group
 *
 * @summary A radio group component with shared label and validation.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/radio
 * @dependency vu-radio
 *
 * @uiVModel value vu-change detail=value
 *
 * @slot - One or more `<vu-radio>` members (other nodes are ignored for forwarding).
 * @slot label - Rich field label; takes precedence over string `label` when assigned.
 * @slot hint - Optional helper copy (HTML); overrides string `hint` when assigned.
 * @slot error - Replaces default validation message list when assigned.
 * @slot legend - Rich legend inside the group; takes precedence over string `legend` when assigned.
 *
 * @property {VuRadioGroupOrientation} orientation - `horizontal` (default) wraps members; `vertical` stacks them.
 * @property {string} legend - Plain-text in-group caption (muted vs string label); use slot="legend" for markup.
 * @property {string} label - Plain-text field label above the group; use slot="label" for markup.
 * @property {string} hint - Plain-text helper under the group; use `slot="hint"` for markup.
 * @property {string} ariaLabel - Accessible name when there is no visible label or legend.
 * @property {VuRadioVariant} variant - Forwarded to members that omit their own `variant`.
 * @property {VuRadioColor} color - Forwarded to members that omit their own `color`.
 * @property {VuRadioTone} tone - Forwarded to members that omit their own `tone`.
 * @property {VuRadioSize} size - Forwarded to members that omit their own `size`.
 * @property {string} name - Form field name forwarded to every member. Default: `""`.
 * @property {string} defaultvalue - Value restored on `<form reset>` (`defaultvalue` attr).
 * @property {string | null} formid - External `<form>` id (`formid` attr).
 * @property {boolean} disabled - Disables every member while set (releases only attrs this group claimed).
 * @property {boolean} readonly - Forwarded to members; blocks selection (inherited from `FormControlBase`).
 * @property {boolean} required - When true, `checkValidity` / `reportValidity` fail until one member is selected.
 * @property {string} requiredMessage - Message for host `valueMissing` when `required` and nothing is selected.
 * @property {boolean} compact - Tighter hint and error spacing.
 * @property {boolean} showerrors - Shows validation after activation (`showerrors` attr). Default: `false`.
 * @property {boolean} validationactive - Drives invalid styling after activation (`validationactive` attr). Default: `false`.
 * @property {boolean} invalid - True when last validation found errors (`invalid` attr). Default: `false`.
 * @property {string | undefined} value - Selected member `value`; set from JS to control selection. Omit to stay uncontrolled.
 *
 * @fires {CustomEvent<VuRadioGroupChangeDetail>} vu-change - After a member is selected; `detail.value` mirrors `value` when controlled. Fired on the group host (not the member).
 * @fires {CustomEvent<VuRadioGroupValidationErrorDetail>} vu-invalid - When validation messages are recomputed while `validationActive`.
 *
 * @method validateInput - Runs validators and syncs validity.
 *
 * @csspart field - Column that stacks label, group, hint, and error.
 * @csspart label - Field label wrapper (string `label` or `label` slot).
 * @csspart text - String `label` when the `label` slot is empty.
 * @csspart base - `role="radiogroup"` wrapper (legend + default slot).
 * @csspart legend - In-group caption row; styled quieter than part label.
 * @csspart fields - Flex container around radios.
 * @csspart hint - Helper text region (string `hint` or `hint` slot).
 * @csspart error-message - Region for `slot="error"` or stacked default validation lines.
 * @csspart error-line - One default validation string when `slot="error"` is empty.
 */
@customElement("vu-radio-group")
@withComponentPresets
export class VuRadioGroup extends FormControlBase {
  private static _idCounter = 0;

  static override styles = radioGroupStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-radio": VuRadio,
  };

  constructor() {
    super();

    unshadowFormControlFields(this);
  }

  /** `horizontal` wraps members; `vertical` stacks them. */
  @property({ type: String, reflect: true })
  orientation: VuRadioGroupOrientation = "horizontal";

  /** Plain legend inside the group; slotted `legend` wins when it has assigned content. */
  @property({ type: String }) legend = "";

  /** Plain field label above the group; slotted `label` wins when it has assigned content. */
  @property({ type: String }) label = "";

  /** Plain helper under the group; slotted `hint` wins when it has assigned content. */
  @property({ type: String }) hint = "";

  /** Accessible name when no visible label row and no legend. */
  @property({ type: String })
  override ariaLabel = "";

  /** Visual treatment forwarded to members that have not set `variant`. */
  @property({ type: String, reflect: true })
  variant: VuRadioVariant = "default";

  /** Intent forwarded to members that have not set `color`. */
  @property({ type: String, reflect: true })
  color: VuRadioColor = "primary";

  /** Idle-ring weight forwarded to members that have not set `tone`. */
  @property({ type: String, reflect: true })
  tone: VuRadioTone = "normal";

  /** Scale forwarded to members that have not set `size`. */
  @property({ type: String, reflect: true })
  size: VuRadioSize = "md";

  /** Disables all members while true; per-radio attrs this group set are released when cleared. */
  @property({ type: Boolean, reflect: true })
  override disabled = false;

  /** Blocks selection while keeping focusable chrome on members. */
  @property({ type: Boolean, reflect: true })
  override readonly = false;

  /** Host-level required: one member must be selected for validity. */
  @property({ type: Boolean, reflect: true })
  override required = false;

  /** Message shown when `required` and nothing is selected. */
  @property({ type: String })
  override requiredMessage = "This field is required.";

  /** Tighter hint and error spacing. */
  @property({ type: Boolean, reflect: true })
  compact = false;

  /** Shows validation after activation. */
  @property({ type: Boolean, reflect: true })
  showErrors = false;

  /** Drives invalid styling after activation. */
  @property({ type: Boolean, reflect: true })
  validationActive = false;

  /** True when the last validation run found errors. */
  @property({ type: Boolean, reflect: true })
  invalid = false;

  /** Selected member `value`; set from JS to control selection. Omit to stay uncontrolled. */
  @property({ type: String, attribute: false })
  value: string | undefined = undefined;

  @queryAssignedElements({ flatten: true, selector: MEMBER_SELECTOR })
  private _members!: VuRadio[];

  @state() validationErrors: string[] = [];

  private readonly _idBase = VuRadioGroup._idCounter++;
  private readonly _labelId = `vu-rbg-lbl-${this._idBase}`;
  private readonly _legendId = `vu-rbg-legend-${this._idBase}`;
  private readonly _validation = new FieldValidationController(this, "vu-rbg");
  private readonly _ownedAttrs: RadioGroupAttrOwnership = new WeakMap();
  private _formDefaultCaptured = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("vu-change", this._onChildNuChange);
    queueMicrotask(() => this._syncMembers());
  }

  override disconnectedCallback(): void {
    this.removeEventListener("vu-change", this._onChildNuChange);
    super.disconnectedCallback();
  }

  override async firstUpdated(_changed: PropertyValues<this>): Promise<void> {
    await this.updateComplete;
    this._captureFormDefaultIfReady();
  }

  override updated(changed: PropertyValues<this>): void {
    if (
      changed.has("variant") ||
      changed.has("color") ||
      changed.has("tone") ||
      changed.has("size") ||
      changed.has("disabled") ||
      changed.has("name") ||
      changed.has("readonly")
    ) {
      this._syncMembers();
    }
    if (changed.has("value") && this.value !== undefined) {
      this._applyValueToMembers();
    }
    if (
      changed.has("value") ||
      changed.has("disabled") ||
      changed.has("required") ||
      changed.has("name") ||
      changed.has("readonly")
    ) {
      this.syncFormValue();
      this.syncValidity();
    }
  }

  /** Returns selected value; when `value` is set, returns it (controlled), else reads the checked member. */
  getSelectedValue(): string {
    if (this.value !== undefined) {
      return this.value;
    }
    return this._readValueFromMembers();
  }

  override focus(options?: FocusOptions): void {
    const checked = this._members?.find((el) => el instanceof VuRadio && el.checked);
    const target = checked ?? this._members?.[0];
    if (target instanceof VuRadio) {
      target.focusRadio();
      return;
    }
    super.focus(options);
  }

  private _readValueFromMembers(): string {
    for (const el of this._members ?? []) {
      if (el instanceof VuRadio && el.checked) return el.value;
    }
    return "";
  }

  private _applyValueToMembers(): void {
    if (this.value === undefined) return;
    for (const el of this._members ?? []) {
      if (!(el instanceof VuRadio)) continue;
      el.checked = !!this.value && el.value === this.value;
    }
  }

  private get _hasLabelRow(): boolean {
    return slotOrPropVisible(this, "label", this.label);
  }

  private _showLegend(): boolean {
    return slotOrPropVisible(this, "legend", this.legend);
  }

  private get _ariaLabelledBy(): string | typeof nothing {
    const ids: string[] = [];
    if (this._hasLabelRow) ids.push(this._labelId);
    if (this._showLegend()) ids.push(this._legendId);
    return ids.length > 0 ? ids.join(" ") : nothing;
  }

  private get _ariaLabel(): string | typeof nothing {
    if (this._hasLabelRow || this._showLegend()) return nothing;
    const a = this.ariaLabel.trim();
    return a ? a : nothing;
  }

  private get _ariaDescribedBy(): string | typeof nothing {
    const ids = this._validation.ariaDescribedBy();
    return ids ? ids : nothing;
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

  private _onChildNuChange = (e: Event): void => {
    if (!(e instanceof CustomEvent)) return;
    const t = e.target;
    if (!(t instanceof VuRadio) || !this.contains(t)) return;

    e.stopImmediatePropagation();
    if (this.disabled || this.readonly) return;
    const next = this._readValueFromMembers();
    if (this.value !== undefined) {
      this.value = next;
    }
    this.dispatchEvent(
      new CustomEvent<VuRadioGroupChangeDetail>("vu-change", {
        detail: { value: next, source: t },
        bubbles: true,
        composed: true,
      }),
    );
    this.syncFormValue();
    this.syncValidity();
    this._validation.validateNow(this._fieldValidators(), {
      syncValidity: () => this.syncValidity(),
    });
  };

  private _onChromeSlotChange = (): void => {
    this.requestUpdate();
  };

  private _onDefaultSlotChange = (): void => {
    void this._onDefaultSlotChangeAsync();
  };

  private async _onDefaultSlotChangeAsync(): Promise<void> {
    this._syncMembers();
    await this.updateComplete;
    this._captureFormDefaultIfReady();
  }

  private _syncMembers(): void {
    for (const el of this._members ?? []) {
      if (!(el instanceof VuRadio)) continue;
      if (this.name) el.name = this.name;
      el.readonly = this.readonly;
      for (const attr of FORWARDABLE) {
        radioGroupClaimAttribute(this._ownedAttrs, el, attr, this[attr] as string);
      }
      if (this.disabled) {
        radioGroupClaimBooleanAttribute(this._ownedAttrs, el, "disabled", true);
      } else {
        radioGroupReleaseAttribute(this._ownedAttrs, el, "disabled");
      }
    }
    if (this.value !== undefined) {
      this._applyValueToMembers();
    }
  }

  /** Snapshot selection once slotted members and their `checked` attrs have settled. */
  private _captureFormDefaultIfReady(): void {
    const members = this._members ?? [];
    if (this._formDefaultCaptured || members.length === 0) return;
    this._formDefaultCaptured = true;
    let initial = "";
    for (const el of members) {
      if (!(el instanceof VuRadio)) continue;
      if (el.checked || el.hasAttribute("checked") || el.defaultChecked) {
        initial = el.value;
        break;
      }
    }
    this.captureDefaultValue(initial);
    this.requestUpdate();
  }

  /** Members submit under `name`; host skips `setFormValue` so entries are not duplicated. */
  protected override getFormValue(): FormState {
    return null;
  }

  protected override setValueFromFormState(formState: FormState): void {
    const token = this._tokenFromFormState(formState);
    if (this.value !== undefined) {
      this.value = token;
    } else {
      for (const el of this._members ?? []) {
        if (!(el instanceof VuRadio)) continue;
        el.checked = !!token && el.value === token;
      }
    }
  }

  private _tokenFromFormState(formState: FormState): string {
    if (formState === null) return "";
    if (typeof formState === "string") return formState;
    if (formState instanceof FormData && this.name) {
      const v = formState.get(this.name);
      return typeof v === "string" ? v : "";
    }
    return "";
  }

  protected override getValidityAnchor(): HTMLElement | undefined {
    for (const el of this._members ?? []) {
      if (!(el instanceof VuRadio)) continue;
      const input = el.shadowRoot?.querySelector('input[type="radio"]') as HTMLElement | null;
      if (input) return input;
    }
    return undefined;
  }

  protected override getValidationValue(): string | File[] {
    return this.getSelectedValue();
  }

  protected override isEmpty(): boolean {
    return this.getSelectedValue() === "";
  }

  protected override getNativeControl(): HTMLElement | null {
    for (const el of this._members ?? []) {
      if (!(el instanceof VuRadio)) continue;
      const input = el.shadowRoot?.querySelector('input[type="radio"]') as HTMLElement | null;
      if (input) return input;
    }
    return null;
  }

  protected override onFormReset(): void {
    const raw = this.defaultValue;
    const initial = typeof raw === "string" ? raw : "";
    if (this.value !== undefined) {
      this.value = initial;
    } else {
      for (const el of this._members ?? []) {
        if (!(el instanceof VuRadio)) continue;
        el.checked = !!initial && el.value === initial;
      }
    }
    this._validation.clear();
  }

  override render() {
    const showLegend = this._showLegend();
    const hasLabel = this._hasLabelRow;
    return html`
      <div class="radio-field" part="field">
        <div
          class="rbg-label"
          part="label"
          id=${this._labelId}
          aria-hidden=${!hasLabel ? "true" : nothing}
        >
          <slot name="label" @slotchange=${this._onChromeSlotChange}>
            ${
              this.label.trim()
                ? html`<span part="text" class="rbg-label-text">${this.label}</span>`
                : nothing
            }
          </slot>
        </div>
        <div
          part="base"
          role="radiogroup"
          aria-labelledby=${this._ariaLabelledBy}
          aria-label=${this._ariaLabel}
          aria-describedby=${this._ariaDescribedBy}
          aria-disabled=${this.disabled ? "true" : nothing}
          aria-invalid=${this._validation.showError ? "true" : "false"}
        >
          <div part="legend" id=${this._legendId} aria-hidden=${!showLegend ? "true" : nothing}>
            <slot name="legend" @slotchange=${this._onChromeSlotChange}>${this.legend}</slot>
          </div>
          <div part="fields">
            <slot @slotchange=${this._onDefaultSlotChange}></slot>
          </div>
        </div>
        ${when(
          this._validation.showHint,
          () =>
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
            errorLineClass: "rbg-error-line field-error-line",
          }),
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-radio-group": VuRadioGroup;
  }
}
