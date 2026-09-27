import { LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, query, queryAll, state } from "lit/decorators.js";
import { PopoverController } from "../internals/controllers/popover-controller.js";
import { FormControlBase, type FormState } from "../internals/form/form-control-base.js";
import { FieldValidationController } from "../internals/form/field-validation-controller.js";
import {
  customFieldValidator,
  requiredFieldValidator,
} from "../internals/form/field-validation.js";
import { unshadowFormControlFields } from "../internals/form/unshadow-fields.js";
import { slotOrPropVisible } from "../internals/utils/slot.js";
import {
  motionDurationMs,
  readMotionDurationMs,
} from "../internals/utils/motion.js";
import { VuIcon } from "../icon/icon.js";
import { VuCheckbox } from "../checkbox/checkbox.js";
import { comboboxStyles } from "./combobox.style.js";
import type {
  VuComboboxAddDetail,
  VuComboboxChangeDetail,
  VuComboboxFilteredRow,
  VuComboboxInputDetail,
  VuComboboxInvalidDetail,
  VuComboboxOption,
  VuComboboxRendererFn,
  VuComboboxSize,
  VuComboboxTone,
  VuComboboxValue,
  VuComboboxVariant,
  VuComboboxRadius
} from "./combobox.types.js";
import { emitComboboxAdd, emitComboboxInput } from "./internals/combobox-events.js";
import { getComboboxFormValue, setValueFromFormState } from "./internals/combobox-form.js";
import {
  commitDropdownEnter,
  focusOnOpen,
  handleComboboxKeydown,
  handleSearchKeydown,
  scrollActiveItemIntoView,
} from "./internals/combobox-keyboard.js";
import {
  canAddOption,
  filterOptions,
  syncSelectedItemsWithValue,
} from "./internals/combobox-options.js";
import { renderCombobox } from "./internals/combobox-render.js";
import { clearSelection, selectOption } from "./internals/combobox-selection.js";
import { getErrorMessages, validateForForm } from "./internals/combobox-validation.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";


export type {
  VuComboboxAddDetail,
  VuComboboxChangeDetail,
  VuComboboxFilteredRow,
  VuComboboxInputDetail,
  VuComboboxInvalidDetail,
  VuComboboxOption,
  VuComboboxRendererContext,
  VuComboboxRendererFn,
  VuComboboxSize,
  VuComboboxTone,
  VuComboboxValue,
  VuComboboxVariant,
  VuComboboxRadius
} from "./combobox.types.js";

/**
 * @element vu-combobox
 *
 * @summary A combobox component with search, single or multi select, and validation.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/combobox
 * @dependency vu-icon
 * @dependency vu-checkbox
 *
 * @uiVModel value vu-change
 * @uiVModel query vu-input
 *
 * @slot label - Rich label markup; takes precedence over string `label` when assigned.
 * @slot hint - Optional helper copy (HTML); overrides string `hint` when assigned.
 * @slot error - Replaces default validation message list when assigned.
 * @slot start - Leading unit or symbol inside the field container.
 * @slot end - Trailing unit or symbol inside the field container.
 *
 * @property {VuComboboxVariant} variant - Field chrome recipe. Default: `"default"`.
 * @property {VuComboboxTone} tone - Neutral chrome weight. Default: `"normal"`.
 * @property {VuComboboxSize} size - Field scale. Default: `"md"`.
 * @property {VuComboboxRadius} radius - Corner preset (`none`/`sm`/`md`/`lg`/`full`). Default: `md`.
 * @property {boolean} block - Stretches the trigger to the container width. Default: `false`.
 * @property {string} name - Form field name. Default: `""`.
 * @property {string} defaultValue - Uncontrolled initial value; HTML attribute is `value`. Default: `""`.
 * @property {string | null} formId - ID of an external `<form>`; HTML attribute is `formid`. Default: `null`.
 * @property {boolean} disabled - Non-interactive state. Default: `false`.
 * @property {boolean} readonly - Read-only; keeps focus without editing. Default: `false`.
 * @property {boolean} required - Marks the field required for form validation. Default: `false`.
 * @property {string} requiredMessage - Message when `required` fails. Default: `"Selection is required."`.
 * @property {VuComboboxValue} value - Current selection; string or array when `multiple`.
 * @property {string} placeholder - Empty-state hint and filter placeholder when `searchable`.
 * @property {string} label - Plain-text label; slotted `label` wins when assigned.
 * @property {string} hint - Helper text; `hint` slot wins when assigned.
 * @property {VuComboboxOption[]} options - Option list (`string` or `{ label, value }`).
 * @property {VuComboboxRendererFn | null} renderer - Per-row dropdown renderer; omit for default label.
 * @property {boolean} clearable - Shows a clear control when a value is present. Default: `false`.
 * @property {boolean} loading - Shows a loading row in the options panel. Default: `false`.
 * @property {boolean} searchable - Filter-as-you-type in the field. Default: `false`.
 * @property {boolean} multiple - Multi-select chips instead of a single value. Default: `false`.
 * @property {number} visibleChips - Max chips shown inline before +N overflow. Default: `2`.
 * @property {boolean} showErrors - Renders validation errors below the field. Default: `false`.
 * @property {boolean} addOption - Allows creating a new option from the filter query. Default: `false`.
 * @property {string} id - Host id; also prefixes internal control ids when set.
 * @property {string} ariaLabel - Accessible name when no visible label is present.
 * @property {boolean} validationActive - Shows validation affordances after first interaction. Default: `false`.
 * @property {boolean} invalid - Reflects validation failure state. Default: `false`.
 * @property {string} query - Current field filter for controlled filtering.
 *
 * @csspart field - Column stacking label, control row, hint, and error.
 * @csspart label - Label wired to the trigger.
 * @csspart start - Leading affix wrapper.
 * @csspart end - Trailing affix wrapper.
 * @csspart container - Interactive field trigger (chips, placeholder, actions).
 * @csspart value - Chip + filter input row when `searchable` or `addOption`.
 * @csspart placeholder-label - Placeholder when no value is selected.
 * @csspart clear-button - Clear selection control.
 * @csspart dropdown-button - Chevron toggle control.
 * @csspart dropdown-loading - Loading row in the options panel.
 * @csspart dropdown-loading-indicator - Spinner inside the dropdown loading row.
 * @csspart dropdown-loading-label - Loading copy in the dropdown panel.
 * @csspart chip-container - Multi-select chip row.
 * @csspart chip - Individual chip in multi-select mode.
 * @csspart single-select-chip - Single-select value label.
 * @csspart overflow-chip - +N overflow chip.
 * @csspart remove-chip-icon - Remove icon on chips.
 * @csspart hidden-chips-dropdown - Overflow chip popover panel.
 * @csspart hidden-chip-inner - Row inside the overflow panel.
 * @csspart hidden-chip-label - Label in overflow panel rows.
 * @csspart dropdown - Main options popover panel.
 * @csspart input - Field filter text input when `searchable` or `addOption`.
 * @csspart add-option-icon - Add-new-option affordance in the field.
 * @csspart select-all - Select-all row in multi-select mode.
 * @csspart option - One selectable option row.
 * @csspart option-content - Custom or default label region inside an option row.
 * @csspart highlighted-text - Search-highlighted label text.
 * @csspart no-options - Empty filter message row.
 * @csspart dropdown-scroller - Scrollable options region.
 * @csspart hint - Helper text region.
 * @csspart error-message - Validation error region.
 * @csspart error-line - One default validation string.
 *
 * @cssproperty --vu-combobox-panel-max-height - Max height of the options scroller. Default `200px`.
 * @cssproperty --vu-combobox-z-index - Stacking order for overflow-chip popover. Default `11`.
 * @cssproperty --cbx-input-min-inline - Min width of the filter input beside chips. Default `5.5rem`.
 *
 * @fires {CustomEvent<VuComboboxChangeDetail>} vu-change - Fired whenever selection changes.
 * @fires {CustomEvent<VuComboboxInputDetail>} vu-input - Fired when the field filter query changes.
 * @fires {CustomEvent<VuComboboxInvalidDetail>} vu-invalid - Fired when validation messages are recomputed.
 * @fires {CustomEvent<VuComboboxAddDetail>} vu-add - Fired when the user confirms adding a new option.
 *
 * @method openDropdown Opens the options panel.
 * @method closeDropdown Closes the options panel.
 * @method clearSelection Clears current selection if allowed.
 * @method reset Resets combobox state and clears validation UI.
 */
@customElement("vu-combobox")
@withComponentPresets
export class VuCombobox extends FormControlBase {
  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
    "vu-checkbox": VuCheckbox,
  };

  static override styles = comboboxStyles;

  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /** Field chrome recipe; mirrors `vu-counter`. */
  @property({ type: String, reflect: true }) variant: VuComboboxVariant = "default";
  /** Neutral surface weight for the trigger chrome. */
  @property({ type: String, reflect: true }) tone: VuComboboxTone = "normal";
  /** Field scale; mirrors `vu-counter`. */
  @property({ type: String, reflect: true }) size: VuComboboxSize = "md";
  /** Capsule trigger ends. */
  @property({ type: String, reflect: true }) radius: VuComboboxRadius = "md";
  /** Stretches the trigger to the container width. */
  @property({ type: Boolean, reflect: true }) block = false;

  /** Current value; string in single mode or array when `multiple`. */
  @property({ attribute: false }) value: VuComboboxValue = "";
  /** Empty-state hint; also the filter input placeholder when `searchable`. */
  @property({ type: String }) placeholder = "Select An Option";
  /** Plain-text label; slotted `label` wins when assigned. */
  @property({ type: String }) label = "";
  /** Helper text; `hint` slot wins when assigned. */
  @property({ type: String }) hint = "";
  /** Option list (`string` or `{ label, value }`). */
  @property({ type: Array }) options: VuComboboxOption[] = [];
  /** Per-row dropdown renderer; omit for default highlighted label. */
  @property({ attribute: false }) renderer: VuComboboxRendererFn | null = null;
  /** Shows a clear control when a value is present. */
  @property({ type: Boolean, reflect: true }) clearable = false;
  /** Shows a loading row in the options panel. */
  @property({ type: Boolean, reflect: true }) loading = false;
  /** Non-interactive state. */
  @property({ type: Boolean, reflect: true }) override disabled = false;
  /** Filter-as-you-type in the field. */
  @property({ type: Boolean, reflect: true }) searchable = false;
  /** Enables multi-select chips instead of a single value. */
  @property({ type: Boolean, reflect: true }) multiple = false;
  /** Max chips shown inline before +N overflow; full labels, no truncation. */
  @property({ type: Number }) visibleChips = 2;
  /** Renders validation errors below the field. */
  @property({ type: Boolean, reflect: true }) showErrors = false;
  /** Marks the field required for form validation. */
  @property({ type: Boolean, reflect: true }) override required = false;
  /** Allows creating a new option from the filter query. */
  @property({ type: Boolean }) addOption = false;
  /** Message when `required` fails. */
  @property({ type: String }) override requiredMessage = "Selection is required.";
  /** Host id; also prefixes internal control ids when set. */
  @property({ type: String }) override id = "";
  /** Accessible name when no visible label is present. */
  @property({ type: String }) override ariaLabel = "";
  /** Read-only; keeps focus without editing. */
  @property({ type: Boolean, reflect: true }) override readonly = false;
  /** Shows validation affordances after first interaction. */
  @property({ type: Boolean, reflect: true }) validationActive = false;
  /** Reflects validation failure state. */
  @property({ type: Boolean, reflect: true }) invalid = false;
  /** Current field filter; bind for controlled filtering. */
  @property({ type: String, attribute: false }) query = "";

  @state() filteredOptions: VuComboboxFilteredRow[] = [];
  @state() open = false;
  @state() selectedItems: VuComboboxOption[] = [];
  @state() hiddenChipsOpen = false;
  @state() activeIndex = -1;
  @state() validationErrors: string[] = [];

  readonly _validation = new FieldValidationController(this, "vu-cbx");
  private static _idCounter = 0;
  private _triggerId = `vu-cbx-${VuCombobox._idCounter++}`;

  @query(".container") private triggerEl!: HTMLElement;
  @query(".dropdown") private dropdownEl!: HTMLElement;
  @query(".hidden-chips-dropdown") private hiddenDropdownEl!: HTMLElement;
  @query(".field-input") searchInputEl!: HTMLInputElement;
  @query(".overflow-chip") private overflowChipEl!: HTMLElement;
  @queryAll("[data-row-index]") rowEls!: NodeListOf<HTMLElement>;

  private _searchDebounceId: ReturnType<typeof setTimeout> | null = null;
  private static readonly _SEARCH_DEBOUNCE_MS = 150;
  private static readonly _SEARCH_DEBOUNCE_OPTIONS_THRESHOLD = 100;

  dropdownPopover = new PopoverController(this, {
    getAnchor: () => this.triggerEl,
    getPopover: () => this.dropdownEl,
    cssVarLeft: "--vu-dd-left",
    cssVarTop: "--vu-dd-top",
    cssVarWidth: "--vu-dd-width",
    getPlacement: () => "bottom" as const,
    getAlign: () => "start",
    getGap: () => 6,
    getPadding: () => 8,
    getMatchAnchorWidth: () => true,
    getMaxWidthToViewport: () => true,
    getMaxWidthMode: () => "cap",
    getFlip: () => true,
    getFlipOrder: () => [],
    getAnimateReposition: () => true,
    getRepositionMs: () => motionDurationMs(readMotionDurationMs(this, "normal")),
    getCloseOnEscape: () => true,
    getCloseOnOutside: () => true,
    getRestoreFocusOnClose: () => true,
    onOpenChange: (open) => {
      this.open = open;
      if (open) {
        this.validationActive = true;
        this.filterOptions();
        requestAnimationFrame(() => focusOnOpen(this));
      } else {
        this.activeIndex = -1;
        this.query = "";
        this.emitQueryChanged();
        this.filterOptions();
        this.hiddenChipsOpen = false;
        this.hiddenPopover.closePopover("api");
      }
    },
  });

  hiddenPopover = new PopoverController(this, {
    getAnchor: () => this.overflowChipEl,
    getPopover: () => this.hiddenDropdownEl,
    cssVarLeft: "--vu-hc-left",
    cssVarTop: "--vu-hc-top",
    cssVarWidth: "--vu-hc-width",
    getPlacement: () => "bottom",
    getAlign: () => "center",
    getGap: () => 4,
    getPadding: () => 8,
    getMatchAnchorWidth: () => false,
    getMaxWidthToViewport: () => true,
    getMaxWidthMode: () => "cap",
    getFlip: () => true,
    getFlipOrder: () => [],
    getAnimateReposition: () => true,
    getRepositionMs: () => motionDurationMs(readMotionDurationMs(this, "fast")),
    getCloseOnEscape: () => true,
    getCloseOnOutside: () => true,
    getRestoreFocusOnClose: () => false,
    onOpenChange: (open) => {
      this.hiddenChipsOpen = open;
      if (open && this.open) this.dropdownPopover.closePopover("api");
    },
  });

  constructor() {
    super();
    unshadowFormControlFields(this);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute("tabindex")) this.tabIndex = this.disabled ? -1 : 0;
    if (this.id.trim()) this._triggerId = `${this.id.trim()}-trigger`;
    const defaultCapture = this.multiple
      ? JSON.stringify(Array.isArray(this.value) ? this.value : [])
      : String(this.value ?? "");
    this.captureDefaultValue(defaultCapture);
  }

  onChromeSlotChange = (): void => {
    this.requestUpdate();
  };

  private get _hasLabel(): boolean {
    return slotOrPropVisible(this, "label", this.label);
  }

  private get _triggerAriaLabel(): string | typeof nothing {
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
      customFieldValidator(() => validateForForm(this)),
      requiredFieldValidator(
        this.required,
        () => this.isEmpty(),
        this.requiredMessage || "Selection is required.",
      ),
    ];
  }

  /** Recomputes validation messages; returns true when valid. */
  validateInput(): boolean {
    return this._validation.validate(this._fieldValidators(), {
      syncValidity: () => this.runSyncValidity(),
    });
  }

  override firstUpdated(): void {
    this.dropdownPopover.refreshTargets();
    this.hiddenPopover.refreshTargets();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._searchDebounceId != null) {
      clearTimeout(this._searchDebounceId);
      this._searchDebounceId = null;
    }
  }

  /** Number of non-option rows before the first option (select-all). */
  get headerRows(): number {
    return this.multiple && this.filteredOptions.length > 0 ? 1 : 0;
  }

  /** Opens the options panel. */
  openDropdown(): void {
    if (this.disabled || this.readonly) return;
    this.dropdownPopover.openPopover();
  }

  /** Closes the options panel. */
  closeDropdown(): void {
    this.dropdownPopover.closePopover("api");
  }

  /** Used by validation helpers (wraps protected `isEmpty`). */
  checkEmpty = (): boolean => this.isEmpty();

  /** Used by validation helpers (wraps protected `syncValidity`). */
  runSyncValidity = (): void => {
    this.syncValidity();
  };

  /** Used by selection helpers (wraps protected `syncFormValue`). */
  runSyncFormValue = (): void => {
    this.syncFormValue();
  };

  /** Clears current selection when allowed by component settings. */
  clearSelection(): void {
    clearSelection(this);
  }

  /** Resets combobox state and clears validation UI. */
  reset(): void {
    this.value = this.multiple ? [] : "";
    this.selectedItems = [];
    this.query = "";
    this.emitQueryChanged();
    this.filterOptions();
    this._validation.clear();
    this.open = false;
    this.syncFormValue();
    this.syncValidity();
    this.requestUpdate();
  }

  override focus(options?: FocusOptions): void {
    super.focus(options);
    if (this.searchInputEl) this.searchInputEl.focus(options);
    else this.triggerEl?.focus(options);
  }

  override blur(): void {
    if (this.open) this.dropdownPopover.closePopover("light-dismiss");
    super.blur();
  }

  selectOption(option: VuComboboxOption): void {
    selectOption(this, option);
  }

  protected override getFormValue(): FormState {
    return getComboboxFormValue(this);
  }

  protected override setValueFromFormState(state: FormState): void {
    setValueFromFormState(this, state);
  }

  protected override syncFormValue(): void {
    if (!this.name || this.disabled) {
      this.internals.setFormValue(null);
      return;
    }
    const v = this.getFormValue();
    if (v === null) {
      this.internals.setFormValue(null);
      return;
    }
    if (this.multiple && v instanceof FormData) {
      this.internals.setFormValue(v);
      return;
    }
      this.internals.setFormValue(v as string | File | null);
    }

  protected override getValidityAnchor(): HTMLElement | undefined {
    return this.getNativeControl() ?? undefined;
  }

  protected override isEmpty(): boolean {
    if (this.multiple) return this.selectedItems.length === 0;
      return this.selectedItems.length === 0 || !this.value;
  }

  protected override getNativeControl(): HTMLElement | null {
    if (this.hasFieldInput) return this.searchInputEl ?? null;
    return this.triggerEl ?? null;
  }

  protected override getCustomErrorMessage(): string {
    return this.validationErrors[0] ?? "";
  }

  protected override validateForForm(): string {
    return validateForForm(this);
  }

  protected override onFormReset(): void {
    super.onFormReset();
    this.query = "";
    this.emitQueryChanged();
    this.open = false;
    this._validation.clear();
  }

  protected override onFormDisabled(disabled: boolean): void {
    this.disabled = disabled;
  }

  protected override onFormStateRestore(state: FormState): void {
    this.setValueFromFormState(state);
  }

  filterOptions = (): void => {
    filterOptions(this);
  };

  syncSelectedItemsWithValue = (): void => {
    syncSelectedItemsWithValue(this);
  };

  emitQueryChanged = (): void => {
    emitComboboxInput(this, this.query);
  };

  commitDropdownEnter = (): void => {
    commitDropdownEnter(this);
  };

  handleClear = (e: Event): void => {
    e.stopPropagation();
    clearSelection(this);
  };

  handleKeydown = (event: KeyboardEvent): void => {
    handleComboboxKeydown(this, event);
  };

  onSearchKeydown = (e: KeyboardEvent): void => {
    handleSearchKeydown(this, e);
  };

  scrollActiveItemIntoView = (): void => {
    scrollActiveItemIntoView(this);
  };

  handleFocus = (): void => {
    this._validation.activate();
  };

  handleBlur = (): void => {
    if (this.validationActive) this.validateInput();
  };

  handleInput = (event: InputEvent): void => {
    if (this.disabled || this.readonly) return;
    if (!this.open) this.openDropdown();
    this.query = (event.target as HTMLInputElement).value;
    const optionsLength = this.options.length;
    const shouldDebounce =
      this.searchable && optionsLength > VuCombobox._SEARCH_DEBOUNCE_OPTIONS_THRESHOLD;
    const applyFilter = () => {
      this.filterOptions();
      this.emitQueryChanged();
    };
    if (shouldDebounce) {
      if (this._searchDebounceId != null) clearTimeout(this._searchDebounceId);
      this._searchDebounceId = setTimeout(() => {
        this._searchDebounceId = null;
        applyFilter();
      }, VuCombobox._SEARCH_DEBOUNCE_MS);
    } else {
      applyFilter();
    }
  };

  handleAddOption = (e: MouseEvent): void => {
    e.stopPropagation();
    if (this.disabled || this.readonly || !canAddOption(this)) return;
    emitComboboxAdd(this, this.query.trim());
    this.query = "";
    this.emitQueryChanged();
    this.filterOptions();
  };

  toggleHiddenChips = (e: Event): void => {
    e.stopPropagation();
    e.preventDefault();
    if (this.disabled || this.readonly) return;
    if (this.open) this.dropdownPopover.closePopover("api");
    this.hiddenPopover.toggle();
  };

  handleFieldInputFocus = (): void => {
    this.handleFocus();
    if (this.disabled || this.readonly) return;
    if (!this.open) {
      this.validationActive = true;
      this.dropdownPopover.openPopover();
    }
    if (!this.multiple && this.selectedItems.length > 0 && !this.query) {
      requestAnimationFrame(() => this.searchInputEl?.select());
    }
  };

  handleContainerClick = (_event: MouseEvent): void => {
    if (this.disabled || this.readonly) return;
    if (this.hasFieldInput) {
      if (!this.open) {
        this.validationActive = true;
      this.dropdownPopover.openPopover();
      }
      this.searchInputEl?.focus();
      return;
    }
    if (this.hiddenChipsOpen) this.hiddenPopover.closePopover("api");
    this.validationActive = true;
    this.dropdownPopover.toggle();
  };

  toggleDropdown = (event: MouseEvent): void => {
      event.stopPropagation();
    if (this.disabled || this.readonly) return;
    if (this.hiddenChipsOpen) this.hiddenPopover.closePopover("api");
    this.validationActive = true;
    this.dropdownPopover.toggle();
  };

  get triggerId(): string {
    return this.id.trim() ? `${this.id.trim()}-trigger` : this._triggerId;
  }

  get listboxId(): string {
    return `${this.triggerId}-listbox`;
  }

  get hasFieldInput(): boolean {
    return this.searchable || this.addOption;
  }

  get labelId(): string {
    return `${this.triggerId}-label`;
  }

  get triggerLabelledBy(): string | typeof nothing {
    return this._hasLabel ? this.labelId : nothing;
  }

  get hasLabel(): boolean {
    return this._hasLabel;
  }

  get showHint(): boolean {
    return this._validation.showHint;
  }

  get showError(): boolean {
    return this._validation.showError;
  }

  get hintId(): string {
    return this._validation.hintId;
  }

  get errorId(): string {
    return this._validation.errorId;
  }

  get ariaDescribedBy(): string | typeof nothing {
    return this._ariaDescribedBy;
  }

  get triggerAriaLabel(): string | typeof nothing {
    return this._triggerAriaLabel;
  }

  override willUpdate(changed: PropertyValues): void {
    if (changed.has("id") && this.id.trim()) {
      this._triggerId = `${this.id.trim()}-trigger`;
    }
    if (changed.has("disabled")) {
      if (this.disabled) {
        this.setAttribute("aria-disabled", "true");
        this.tabIndex = -1;
      } else {
        this.removeAttribute("aria-disabled");
        if (!this.hasAttribute("tabindex")) this.tabIndex = 0;
      }
    }
    if (changed.has("value")) {
      this.syncSelectedItemsWithValue();
      this.syncFormValue();
      this.syncValidity();
    }
    if (changed.has("options")) {
      if (!Array.isArray(this.options)) this.options = [];
      this.syncSelectedItemsWithValue();
      this.filterOptions();
      this.syncFormValue();
      this.syncValidity();
    }
    if (changed.has("searchable") || changed.has("query")) {
      this.filterOptions();
    }
    if (changed.has("validationErrors")) this.requestUpdate();
  }

  override render() {
    return renderCombobox(this);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-combobox": VuCombobox;
  }
}
