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
  dispatchRangeClear,
  emitRangeChange,
  type RangeCommitHost,
} from "./internals/range-commit.js";
import {
  handleRangeFromChange,
  handleRangeFromInput,
  handleRangeToChange,
  handleRangeToInput,
  type RangeInputHost,
} from "./internals/range-input.js";
import {
  formatRangeEndpoint,
  normalizeRangeSelection,
  parseRangeFormState,
  rangeHighlightPercents,
  serializeRangeFormValue,
} from "./internals/range-value.js";
import { rangeStyles } from "./range.style.js";
import type {
  VuRangeChangeDetail,
  VuRangeClearDetail,
  VuRangeInvalidDetail,
  VuRangeSize,
  VuRangeTone,
  VuRangeVariant,
  VuRangeRadius
} from "./range.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuRangeChangeDetail,
  VuRangeClearDetail,
  VuRangeInvalidDetail,
  VuRangeSize,
  VuRangeTone,
  VuRangeVariant,
  VuRangeRadius
} from "./range.types.js";

/**
 * @element vu-range
 *
 * @summary A range slider component for choosing a min-max interval with validation.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/slider
 *
 * @uiVModel from vu-change detail=from
 * @uiVModel to vu-change detail=to
 *
 * @slot label - Rich label markup; takes precedence over string `label` when assigned.
 * @slot hint - Optional helper copy (HTML); overrides string `hint` when assigned.
 * @slot error - Replaces default validation message list when assigned.
 *
 * @property {string} name - Form field name for submit (`name` attr).
 * @property {string} defaultvalue - Restored on `<form reset>` as `"from,to"` (`defaultvalue` attr).
 * @property {string} formid - External `<form>` id (`formid` attr).
 * @property {boolean} disabled - Non-interactive; blocks thumb dragging (`disabled` attr).
 * @property {boolean} readonly - Focusable but cannot change the range (`readonly` attr).
 * @property {boolean} required - Blocks valid submit when invalid (`required` attr).
 * @property {string} requiredmessage - Custom `valueMissing` message (`requiredmessage` attr).
 * @property {string} label - Plain-text label; slotted `label` wins when assigned.
 * @property {string} hint - Helper text; `hint` slot wins when assigned.
 * @property {string} id - Host id for label `for` / `aria-*` wiring.
 * @property {VuRangeVariant} variant - Field chrome recipe. Default: `"default"`.
 * @property {VuRangeTone} tone - Neutral surface weight. Default: `"normal"`.
 * @property {VuRangeSize} size - Track scale. Default: `"md"`.
 * @property {VuRangeRadius} radius - Corner preset (`none`/`sm`/`md`/`lg`/`full`). Default: `md`.
 * @property {boolean} block - Stretches the control to the container width. Default: `false`.
 * @property {boolean} compact - Tighter label/hint/error spacing. Default: `false`.
 * @property {number} from - Lower bound of the selected range. Default: `20`.
 * @property {number} to - Upper bound of the selected range. Default: `80`.
 * @property {number} min - Minimum selectable value. Default: `0`.
 * @property {number} max - Maximum selectable value. Default: `100`.
 * @property {number} step - Step interval for snapping. Default: `10`.
 * @property {string} prefix - Text before each formatted endpoint.
 * @property {string} suffix - Text after each formatted endpoint.
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
 * @csspart control - Interactive track row (`.range-track`) with variant chrome.
 * @csspart value - Formatted `from`–`to` summary.
 * @csspart affix - Prefix or suffix text in the value summary.
 * @csspart highlight - Selected range segment.
 * @csspart thumb-from - Lower native `<input type="range">`.
 * @csspart thumb-to - Upper native `<input type="range">`.
 * @csspart hint - Neutral helper text under the track.
 * @csspart error-message - Region for `slot="error"` or stacked default validation lines.
 * @csspart error-line - One default validation string when `slot="error"` is empty.
 * @csspart text - String `label` text when the `label` slot is empty.
 *
 * @cssproperty --range-from-pct - Highlight start offset (set by the host).
 * @cssproperty --range-highlight-size - Highlight width (set by the host).
 * @cssproperty --range-track-size - Track thickness per `size`.
 * @cssproperty --range-thumb-size - Thumb diameter per `size`.
 *
 * @method setRange - Sets and normalizes the selected range; emits `vu-change`.
 * @method reset - Restores `defaultValue` and dispatches `vu-clear`.
 * @method validateInput - Runs validators and syncs validity.
 *
 * @fires {CustomEvent<VuRangeChangeDetail>} vu-change - Committed or live range update.
 * @fires {CustomEvent<VuRangeInvalidDetail>} vu-invalid - When validation messages are recomputed.
 * @fires {CustomEvent<VuRangeClearDetail>} vu-clear - After `reset()` syncs from `defaultValue`.
 */
@customElement("vu-range")
@withComponentPresets
export class VuRange extends FormControlBase {
  private static _idCounter = 0;

  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static override styles = rangeStyles;

  /** Field chrome recipe. Default: `"default"`. */
  @property({ type: String, reflect: true }) variant: VuRangeVariant = "default";
  /** Neutral surface weight. Default: `"normal"`. */
  @property({ type: String, reflect: true }) tone: VuRangeTone = "normal";
  /** Track scale. Default: `"md"`. */
  @property({ type: String, reflect: true }) size: VuRangeSize = "md";

  /** Explicit corner preset; `full` is capsule ends, `none` is square. */
  @property({ type: String, reflect: true })
  radius: VuRangeRadius = "md";
  /** Stretches the control to the container width. */
  @property({ type: Boolean, reflect: true }) block = false;
  /** Tighter label/hint/error spacing. */
  @property({ type: Boolean, reflect: true }) compact = false;

  /** Lower bound of the selected range. */
  @property({ type: Number }) from = 20;
  /** Upper bound of the selected range. */
  @property({ type: Number }) to = 80;
  /** Minimum selectable value. */
  @property({ type: Number }) min = 0;
  /** Maximum selectable value. */
  @property({ type: Number }) max = 100;
  /** Step interval for snapping. */
  @property({ type: Number }) step = 10;

  /** Plain-text label; slotted `label` wins when assigned. */
  @property({ type: String }) label = "";
  /** Helper text; `hint` slot wins when assigned. */
  @property({ type: String }) hint = "";
  /** Text before each formatted endpoint. */
  @property({ type: String }) override prefix = "";
  /** Text after each formatted endpoint. */
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

  private readonly _validation = new FieldValidationController(this, "vu-range");
  private readonly _idBase = VuRange._idCounter++;
  private readonly _labelId = `vu-range-label-${this._idBase}`;
  private readonly _groupId = `vu-range-group-${this._idBase}`;

  /** @internal Last `from` emitted by `vu-change`. */
  _lastCommittedFrom = 20;
  /** @internal Last `to` emitted by `vu-change`. */
  _lastCommittedTo = 80;

  private get _inputHost(): RangeInputHost {
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
      get from() {
        return host.from;
      },
      set from(v: number) {
        host.from = v;
      },
      get to() {
        return host.to;
      },
      set to(v: number) {
        host.to = v;
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
      onRangeChange: () => host._onRangeChange(),
    };
  }

  private get _commitHost(): RangeCommitHost {
    const host = this;
    return {
      get from() {
        return host.from;
      },
      get to() {
        return host.to;
      },
      get _lastCommittedFrom() {
        return host._lastCommittedFrom;
      },
      set _lastCommittedFrom(v: number) {
        host._lastCommittedFrom = v;
      },
      get _lastCommittedTo() {
        return host._lastCommittedTo;
      },
      set _lastCommittedTo(v: number) {
        host._lastCommittedTo = v;
      },
      dispatchEvent: (event) => host.dispatchEvent(event),
    };
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.captureDefaultValue(serializeRangeFormValue(this.from, this.to));
    if (!this.hasAttribute("tabindex")) this.tabIndex = -1;
    this._syncGeometryVars();
  }

  override firstUpdated(): void {
    this._normalizeSelection();
    this._lastCommittedFrom = this.from;
    this._lastCommittedTo = this.to;
    this.syncFormValue();
    this.syncValidity();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    super.willUpdate(changed);
    if (
      changed.has("from") ||
      changed.has("to") ||
      changed.has("min") ||
      changed.has("max") ||
      changed.has("step")
    ) {
      this._normalizeSelection();
      this._syncGeometryVars();
    }
  }

  protected override getFormValue(): FormState {
    if (!this.name || this.disabled) return null;
    return serializeRangeFormValue(this.from, this.to);
  }

  protected override setValueFromFormState(state: FormState): void {
    const s = typeof state === "string" ? state : "";
    const parsed = parseRangeFormState(s, this);
    if (!parsed) return;
    this.from = parsed.from;
    this.to = parsed.to;
    this._lastCommittedFrom = this.from;
    this._lastCommittedTo = this.to;
    this._syncGeometryVars();
  }

  protected override getValidityAnchor(): HTMLElement | undefined {
    return this.shadowRoot?.querySelector<HTMLInputElement>('[part="thumb-from"]') ?? undefined;
  }

  protected override isEmpty(): boolean {
    return false;
  }

  protected override getNativeControl(): HTMLElement | null {
    return this.shadowRoot?.querySelector('[part="thumb-from"]') ?? null;
  }

  protected override validateForForm(): string {
    if (this.from >= this.to) return "Lower bound must be less than upper bound.";
    return "";
  }

  protected override onFormReset(): void {
    const parsed =
      parseRangeFormState(this.defaultValue, this) ??
      normalizeRangeSelection(this, this.from, this.to);
    if (parsed) {
      this.from = parsed.from;
      this.to = parsed.to;
    }
    this._lastCommittedFrom = this.from;
    this._lastCommittedTo = this.to;
    this._validation.clear();
    this._syncGeometryVars();
  }

  private _normalizeSelection(): void {
    const normalized = normalizeRangeSelection(this, this.from, this.to);
    if (!normalized) return;
    if (this.from !== normalized.from) this.from = normalized.from;
    if (this.to !== normalized.to) this.to = normalized.to;
  }

  private _syncGeometryVars(): void {
    if (!isClient() || typeof this.style?.setProperty !== "function") return;
    const { fromPct, toPct, widthPct } = rangeHighlightPercents(this);
    this.style.setProperty("--range-from-pct", `${fromPct}%`);
    this.style.setProperty("--range-to-pct", `${toPct}%`);
    this.style.setProperty("--range-highlight-size", `${widthPct}%`);
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

  private _onRangeChange(): void {
    this._validation.validateNow(this._fieldValidators(), {
      syncValidity: () => this.syncValidity(),
    });
    emitRangeChange(this._commitHost);
    this.syncFormValue();
    this.syncValidity();
  }

  /** Sets and normalizes the selected range; emits `vu-change`. */
  setRange(from: number, to: number): void {
    const normalized = normalizeRangeSelection(this, from, to);
    if (!normalized) return;
    this.from = normalized.from;
    this.to = normalized.to;
    this._syncGeometryVars();
    this._onRangeChange();
  }

  /** Restores `defaultValue` and dispatches `vu-clear`. */
  reset(): void {
    this.onFormReset();
    this.syncFormValue();
    this.syncValidity();
    dispatchRangeClear(this._commitHost);
  }

  private get _hasLabel(): boolean {
    return slotOrPropVisible(this, "label", this.label);
  }

  private get _groupAriaLabel(): string | typeof nothing {
    if (this._hasLabel) return nothing;
    const a = this.ariaLabel.trim();
    return a ? a : "Range";
  }

  private get _ariaDescribedBy(): string | undefined {
    const ids = this._validation.ariaDescribedBy();
    return ids || undefined;
  }

  private get _showHeader(): boolean {
    return this.showValue || this._hasLabel;
  }

  private _formatEndpoint(value: number): string {
    return formatRangeEndpoint(value, this.step);
  }

  override render() {
    const hasLabel = this._hasLabel;
    const describedBy = this._ariaDescribedBy;
    const fromLabel = hasLabel ? `${this.label} from` : "From";
    const toLabel = hasLabel ? `${this.label} to` : "To";
    const cellsInvalid = this.invalid || this._validation.showError;

    return html`
      <div class="range-field" part="field">
        <div class="range-header" part="header">
            <label
              id=${this._labelId}
              class="range-label"
              part="label"
            >
              <slot name="label">
                ${this.label
                  ? html`<span part="text">${this.label}</span>`
                  : nothing}
              </slot>
            </label>
            ${when(this.showValue, () => html`
              <div class="range-value" part="value" aria-live="polite">
                ${when(this.prefix, () => html`
                  <span class="range-affix" part="affix">${this.prefix}</span>
                `)}
                ${this._formatEndpoint(this.from)}
                ${when(this.suffix, () => html`
                  <span class="range-affix" part="affix">${this.suffix}</span>
                `)}
                –
                ${when(this.prefix, () => html`
                  <span class="range-affix" part="affix">${this.prefix}</span>
                `)}
                ${this._formatEndpoint(this.to)}
                ${when(this.suffix, () => html`
                  <span class="range-affix" part="affix">${this.suffix}</span>
                `)}
              </div>
            `)}
          </div>

        <div
          id=${this._groupId}
          class="range-track"
          part="control"
          role="group"
          aria-labelledby=${hasLabel ? this._labelId : nothing}
          aria-label=${this._groupAriaLabel as string | typeof nothing}
          aria-describedby=${ifDefined(describedBy)}
        >
          <div class="range-highlight" part="highlight">
            <div
              class="range-thumb-visual range-thumb-visual--from"
              part="thumb-from-visual"
              aria-hidden="true"
            ></div>
            <div
              class="range-thumb-visual range-thumb-visual--to"
              part="thumb-to-visual"
              aria-hidden="true"
            ></div>
          </div>

          <input
            class="range-thumb-input range-thumb-input--from"
            part="thumb-from"
            type="range"
            min=${this.min}
            max=${this.max}
            step=${this.step}
            .value=${String(this.from)}
            ?disabled=${this.disabled || this.readonly}
            aria-label=${fromLabel}
            aria-invalid=${cellsInvalid ? "true" : "false"}
            @input=${(e: Event) => handleRangeFromInput(this._inputHost, e)}
            @change=${(e: Event) => handleRangeFromChange(this._inputHost, e)}
          />

          <input
            class="range-thumb-input range-thumb-input--to"
            part="thumb-to"
            type="range"
            min=${this.min}
            max=${this.max}
            step=${this.step}
            .value=${String(this.to)}
            ?disabled=${this.disabled || this.readonly}
            aria-label=${toLabel}
            aria-invalid=${cellsInvalid ? "true" : "false"}
            @input=${(e: Event) => handleRangeToInput(this._inputHost, e)}
            @change=${(e: Event) => handleRangeToChange(this._inputHost, e)}
          />
        </div>

        ${when(this._validation.showHint, () =>
          renderFieldHint({
            hintId: this._validation.hintId,
            hintText: this.hint,
            hintClass: "range-hint field-hint",
            hintTag: "div",
            ariaLive: "polite",
          }),
        )}
        ${when(this._validation.showError, () =>
          renderFieldErrors({
            errorId: this._validation.errorId,
            errors: this.validationErrors,
            errorMessageClass: "error-message field-error-message",
            errorLineClass: "range-error-line field-error-line",
          }),
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-range": VuRange;
  }
}
