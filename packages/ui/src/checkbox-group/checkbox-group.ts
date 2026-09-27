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
import { VuCheckbox } from "../checkbox/checkbox.js";
import {
  checkboxGroupClaimAttribute,
  checkboxGroupClaimBooleanAttribute,
  checkboxGroupReleaseAttribute,
  type CheckboxGroupAttrOwnership,
} from "./internals/checkbox-group-attrs.js";
import { checkboxGroupStyles } from "./checkbox-group.style.js";
import type {
  VuCheckboxColor,
  VuCheckboxSize,
  VuCheckboxTone,
  VuCheckboxVariant,
} from "../checkbox/checkbox.types.js";
import type {
  VuCheckboxGroupChangeDetail,
  VuCheckboxGroupOrientation,
  VuCheckboxGroupRadius,
  VuCheckboxGroupValidationErrorDetail,
} from "./checkbox-group.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuCheckboxGroupChangeDetail,
  VuCheckboxGroupOrientation,
  VuCheckboxGroupRadius,
  VuCheckboxGroupValidationErrorDetail,
} from "./checkbox-group.types.js";

const MEMBER_SELECTOR = "vu-checkbox";
const FORWARDABLE = ["variant", "color", "tone", "size", "radius"] as const;
type Forwardable = (typeof FORWARDABLE)[number];

/**
 * @element vu-checkbox-group
 *
 * @summary A checkbox group component with shared label and validation.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/checkbox-group
 * @dependency vu-checkbox
 *
 * @uiVModel values vu-change detail=values
 *
 * @slot - One or more `<vu-checkbox>` members (other nodes are ignored for forwarding).
 * @slot label - Rich field label; takes precedence over string `label` when assigned.
 * @slot hint - Optional helper copy (HTML); overrides string `hint` when assigned.
 * @slot error - Replaces default validation message list when assigned.
 * @slot legend - Rich legend inside the group; takes precedence over string `legend` when assigned.
 *
 * @property {VuCheckboxGroupOrientation} orientation - `vertical` (default) stacks members; `horizontal` wraps them in a row.
 * @property {string} legend - Plain-text in-group caption (muted vs string label); use slot="legend" for markup.
 * @property {string} label - Plain-text field label above the group; use slot="label" for markup.
 * @property {string} hint - Plain-text helper under the group; use `slot="hint"` for markup.
 * @property {string} ariaLabel - Accessible name when there is no visible label or legend.
 * @property {VuCheckboxVariant} variant - Forwarded to members that omit their own `variant`.
 * @property {VuCheckboxColor} color - Forwarded to members that omit their own `color`.
 * @property {VuCheckboxTone} tone - Forwarded to members that omit their own `tone`.
 * @property {VuCheckboxSize} size - Forwarded to members that omit their own `size`.
 * @property {VuCheckboxGroupRadius} radius - Corner preset (`none`/`sm`/`md`/`lg`/`full`). Default: `md`.
 * @property {string} name - Form field name forwarded to every member. Default: `""`.
 * @property {string} defaultvalue - JSON array restored on `<form reset>` (`defaultvalue` attr).
 * @property {string | null} formid - External `<form>` id (`formid` attr).
 * @property {boolean} disabled - Disables every member while set (releases only attrs this group claimed).
 * @property {boolean} readonly - Forwarded to members; blocks interaction (inherited from `FormControlBase`).
 * @property {boolean} required - When true, `checkValidity` / `reportValidity` fail until at least one member is checked.
 * @property {string} requiredMessage - Message for host `valueMissing` when `required` and nothing is selected.
 * @property {boolean} compact - Tighter hint and error spacing.
 * @property {boolean} showerrors - Shows validation after activation (`showerrors` attr). Default: `false`.
 * @property {boolean} validationactive - Drives invalid styling after activation (`validationactive` attr). Default: `false`.
 * @property {boolean} invalid - True when last validation found errors (`invalid` attr). Default: `false`.
 * @property {string[] | undefined} values - Selected member `value` tokens (`on` for empty member `value`); when set from JS, syncs member `checked`. Omit for uncontrolled usage.
 *
 * @fires {CustomEvent<VuCheckboxGroupChangeDetail>} vu-change - After a member toggles; `detail.values` mirrors `values` when controlled. Fired on the group host (not the member).
 * @fires {CustomEvent<VuCheckboxGroupValidationErrorDetail>} vu-invalid - When validation messages are recomputed while `validationActive`.
 *
 * @method validateInput - Runs validators and syncs validity.
 *
 * @csspart field - Column that stacks label, group, hint, and error.
 * @csspart label - Field label wrapper (string `label` or `label` slot).
 * @csspart text - String `label` when the `label` slot is empty.
 * @csspart base - `role="group"` wrapper (legend + default slot).
 * @csspart legend - In-group caption row; styled quieter than part label.
 * @csspart fields - Flex container around checkboxes.
 * @csspart hint - Helper text region (string `hint` or `hint` slot).
 * @csspart error-message - Region for `slot="error"` or stacked default validation lines.
 * @csspart error-line - One default validation string when `slot="error"` is empty.
 */
@customElement("vu-checkbox-group")
@withComponentPresets
export class VuCheckboxGroup extends FormControlBase {
  private static _idCounter = 0;

  static override styles = checkboxGroupStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-checkbox": VuCheckbox,
  };

  constructor() {
    super();
    /* Re-shadows disabled/required/etc. after `override` field initializers above. */
    unshadowFormControlFields(this);
  }

  /** Stacks members by default; `horizontal` lays them out in a wrapping row. */
  @property({ type: String, reflect: true })
  orientation: VuCheckboxGroupOrientation = "vertical";

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
  variant: VuCheckboxVariant = "default";

  /** Intent forwarded to members that have not set `color`. */
  @property({ type: String, reflect: true })
  color: VuCheckboxColor = "primary";

  /** Idle-box weight forwarded to members that have not set `tone`. */
  @property({ type: String, reflect: true })
  tone: VuCheckboxTone = "normal";

  /** Scale forwarded to members that have not set `size`. */
  @property({ type: String, reflect: true })
  size: VuCheckboxSize = "md";

  /** Explicit corner preset; `full` is capsule ends, `none` is square. */
  @property({ type: String, reflect: true })
  radius: VuCheckboxGroupRadius = "md";

  /** Disables all members while true; per-checkbox attrs this group set are released when cleared. */
  @property({ type: Boolean, reflect: true })
  override disabled = false;

  /** Blocks toggling while keeping focusable chrome on members. */
  @property({ type: Boolean, reflect: true })
  override readonly = false;

  /** Host-level required: at least one member must be checked for validity. */
  @property({ type: Boolean, reflect: true })
  override required = false;

  /** Message shown when `required` and no member is checked. */
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

  /** Checked member tokens; set from JS to control selection (`on` matches member `value=\"\"`). Omit to stay uncontrolled. */
  @property({ type: Array, attribute: false })
  values: string[] | undefined = undefined;

  @state() validationErrors: string[] = [];

  @queryAssignedElements({ flatten: true, selector: MEMBER_SELECTOR })
  private _members!: VuCheckbox[];

  private readonly _idBase = VuCheckboxGroup._idCounter++;
  private readonly _labelId = `vu-cbg-lbl-${this._idBase}`;
  private readonly _legendId = `vu-cbg-legend-${this._idBase}`;
  private readonly _validation = new FieldValidationController(this, "vu-cbg");

  private readonly _ownedAttrs: CheckboxGroupAttrOwnership = new WeakMap();
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
      changed.has("radius") ||
      changed.has("disabled") ||
      changed.has("name") ||
      changed.has("readonly")
    ) {
      this._syncMembers();
    }
    if (changed.has("values") && this.values !== undefined) {
      this._applyValuesToMembers();
    }
    if (
      changed.has("values") ||
      changed.has("disabled") ||
      changed.has("required") ||
      changed.has("name") ||
      changed.has("readonly")
    ) {
      this.syncFormValue();
      this.syncValidity();
    }
  }

  /** Returns selected tokens; when `values` is set, returns a copy of that array (controlled), else reads members in DOM order. */
  getSelectedValues(): string[] {
    if (this.values !== undefined) {
      return [...this.values];
    }
    return this._readValuesFromMembers();
  }

  private _memberValueToken(el: VuCheckbox): string {
    return el.value === "" ? "on" : el.value;
  }

  private _readValuesFromMembers(): string[] {
    const out: string[] = [];
    for (const el of this._members ?? []) {
      if (!(el instanceof VuCheckbox) || !el.checked) continue;
      out.push(this._memberValueToken(el));
    }
    return out;
  }

  private _applyValuesToMembers(): void {
    if (this.values === undefined) return;
    const set = new Set(this.values);
    for (const el of this._members ?? []) {
      if (!(el instanceof VuCheckbox)) continue;
      el.checked = set.has(this._memberValueToken(el));
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
    if (!(t instanceof VuCheckbox) || !this.contains(t)) return;
    /* Member vu-change stops here — listeners on the group must only see the group-shaped detail. */
    e.stopImmediatePropagation();
    if (this.disabled || this.readonly) return;
    const next = this._readValuesFromMembers();
    if (this.values !== undefined) {
      this.values = [...next];
    }
    this.dispatchEvent(
      new CustomEvent<VuCheckboxGroupChangeDetail>("vu-change", {
        detail: { values: next, source: t },
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
  };

  private _syncMembers(): void {
    const members = this._members ?? [];
    for (const el of members) {
      if (!(el instanceof VuCheckbox)) continue;
      if (this.name) {
        el.name = this.name;
      }
      el.readonly = this.readonly;
      for (const attr of FORWARDABLE) {
        checkboxGroupClaimAttribute(this._ownedAttrs, el, attr, this[attr] as string);
      }
      if (this.disabled) {
        checkboxGroupClaimBooleanAttribute(this._ownedAttrs, el, "disabled", true);
      } else {
        checkboxGroupReleaseAttribute(this._ownedAttrs, el, "disabled");
      }
    }
    if (this.values !== undefined) {
      this._applyValuesToMembers();
    }
  }

  /** Snapshot selection once slotted members and their `checked` attrs have settled. */
  private _captureFormDefaultIfReady(): void {
    const members = this._members ?? [];
    if (this._formDefaultCaptured || members.length === 0) return;
    this._formDefaultCaptured = true;
    this.captureDefaultValue(JSON.stringify(this._readInitialValuesFromMembers()));
    this.requestUpdate();
  }

  private _readInitialValuesFromMembers(): string[] {
    const out: string[] = [];
    for (const el of this._members ?? []) {
      if (!(el instanceof VuCheckbox)) continue;
      const on = el.checked || el.hasAttribute("checked") || el.defaultChecked;
      if (on) out.push(this._memberValueToken(el));
    }
    return out;
  }

  /** Members submit under `name`; host skips `setFormValue` so entries are not duplicated. */
  protected override getFormValue(): FormState {
    return null;
  }

  protected override setValueFromFormState(state: FormState): void {
    const tokens = this._tokensFromFormState(state);
    if (this.values !== undefined) {
      this.values = [...tokens];
    } else {
      const set = new Set(tokens);
      for (const el of this._members ?? []) {
        if (!(el instanceof VuCheckbox)) continue;
        el.checked = set.has(this._memberValueToken(el));
      }
    }
  }

  private _tokensFromFormState(state: FormState): string[] {
    if (state === null) {
      return [];
    }
    if (typeof state === "string") {
      const s = state.trim();
      if (!s) {
        return [];
      }
      try {
        const parsed = JSON.parse(s) as unknown;
        return Array.isArray(parsed) ? parsed.map(String) : [];
      } catch {
        return [];
      }
    }
    if (state instanceof FormData && this.name) {
      return state.getAll(this.name).map((v) => (typeof v === "string" ? v : String(v)));
    }
    return [];
  }

  protected override getValidityAnchor(): HTMLElement | undefined {
    for (const el of this._members ?? []) {
      if (!(el instanceof VuCheckbox)) continue;
      const input = el.shadowRoot?.querySelector('input[type="checkbox"]') as HTMLElement | null;
      if (input) {
        return input;
      }
    }
    return undefined;
  }

  protected override getValidationValue(): string | File[] {
    return this.getSelectedValues().join(",");
  }

  protected override isEmpty(): boolean {
    return this.getSelectedValues().length === 0;
  }

  protected override onFormReset(): void {
    super.onFormReset();
    this._validation.clear();
  }

  protected override getNativeControl(): HTMLElement | null {
    for (const el of this._members ?? []) {
      if (!(el instanceof VuCheckbox)) continue;
      const input = el.shadowRoot?.querySelector('input[type="checkbox"]') as HTMLElement | null;
      if (input) {
        return input;
      }
    }
    return null;
  }

  override render() {
    const showLegend = this._showLegend();
    const hasLabel = this._hasLabelRow;
    return html`
      <div class="checkbox-field" part="field">
        <div
          class="cbg-label"
          part="label"
          id=${this._labelId}
          aria-hidden=${!hasLabel ? "true" : nothing}
        >
          <slot name="label" @slotchange=${this._onChromeSlotChange}>
            ${this.label.trim()
              ? html`<span part="text" class="cbg-label-text">${this.label}</span>`
              : nothing}
          </slot>
        </div>
        <div
          part="base"
          role="group"
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
            errorLineClass: "cbg-error-line field-error-line",
          }),
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-checkbox-group": VuCheckboxGroup;
  }
}
