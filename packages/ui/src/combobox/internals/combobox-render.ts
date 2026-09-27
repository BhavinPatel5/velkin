import { html, nothing, type TemplateResult } from "lit";
import { live } from "lit/directives/live.js";
import { when } from "lit/directives/when.js";
import { repeat } from "lit/directives/repeat.js";
import { classMap } from "lit/directives/class-map.js";
import { virtualize } from "../../internals/virtualizer/index.js";
import type { CloseReason } from "../../internals/controllers/popover-controller.js";
import {
  renderFieldErrors,
  renderFieldHint,
} from "../../internals/form/field-validation-render.js";
import { ICONS } from "../../internals/icon.js";
import { nestedFieldTone } from "../../internals/utils/surface-tone.js";
import { renderHighlightedLabel } from "../../internals/utils/filter-highlight.js";
import {
  getFieldInputValue,
  getOptionLabel,
  optionKey,
  type ComboboxOptionsHost,
} from "./combobox-options.js";
import { getErrorMessages } from "./combobox-validation.js";
import {
  isAllFilteredSelected,
  removeChip,
  selectOption,
  toggleSelectAll,
} from "./combobox-selection.js";
import type {
  VuComboboxFilteredRow,
  VuComboboxRendererContext,
  VuComboboxRendererFn,
  VuComboboxTone,
} from "../combobox.types.js";
import type { ComboboxKeyboardHost } from "./combobox-keyboard.js";

/** md overlay row min-block-size (`--vu-space-8`); padding is inside border-box. */
const COMBOBOX_OPTION_ESTIMATE = 32;
const COMBOBOX_OPTION_GAP = 2;
const COMBOBOX_VIRTUAL_OVERSCAN = 8;

function stopEventPropagation(event: Event): void {
  event.stopPropagation();
}

function onActivationKeydown(handler: () => void): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler();
    }
  };
}

function onActivationKeydownEvent(handler: (event: Event) => void): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler(event);
    }
  };
}

export type ComboboxRenderHost = ComboboxOptionsHost &
  ComboboxKeyboardHost & {
    placeholder: string;
    label: string;
    hint: string;
    clearable: boolean;
    loading: boolean;
    disabled: boolean;
    readonly: boolean;
    multiple: boolean;
    addOption: boolean;
    searchable: boolean;
    tone: VuComboboxTone;
    visibleChips: number;
    renderer: VuComboboxRendererFn | null;
    validationErrors: string[];
    open: boolean;
    triggerId: string;
    listboxId: string;
    labelId: string;
    hasLabel: boolean;
    hasFieldInput: boolean;
    ariaLabel: string;
    showHint: boolean;
    showError: boolean;
    hintId: string;
    errorId: string;
    ariaDescribedBy: string | typeof nothing;
    triggerAriaLabel: string | typeof nothing;
    triggerLabelledBy: string | typeof nothing;
    hiddenPopover: {
      onToggle: (e: Event) => void;
      toggle: () => void;
      closePopover: (reason?: CloseReason) => Promise<void>;
    };
    dropdownPopover: {
      onToggle: (e: Event) => void;
      toggle: () => void;
      closePopover: (reason?: CloseReason) => Promise<void>;
    };
    handleInput: (event: InputEvent) => void;
    onSearchKeydown: (e: KeyboardEvent) => void;
    handleFocus: () => void;
    handleBlur: () => void;
    handleFieldInputFocus: () => void;
    handleContainerClick: (event: MouseEvent) => void;
    handleKeydown: (event: KeyboardEvent) => void;
    handleClear: (e: Event) => void;
    toggleHiddenChips: (e: Event) => void;
    toggleDropdown: (event: MouseEvent) => void;
    emitQueryChanged: () => void;
    filterOptions: () => void;
    handleAddOption: (e: MouseEvent) => void;
    onChromeSlotChange: () => void;
  };

function renderChips(host: ComboboxRenderHost): TemplateResult {
  if (!host.multiple && host.selectedItems.length) {
    return html`
      <span class="chip" single-select part="single-select-chip">
        ${getOptionLabel(host.selectedItems[0]!)}
      </span>
    `;
  }

  const visible = host.selectedItems.slice(0, host.visibleChips);
  const overflow = host.selectedItems.length - host.visibleChips;

  return html`
    ${repeat(
      visible,
      (item) => optionKey(item),
      (item) => html`
        <span class="chip" part="chip">
          ${getOptionLabel(item)}
          ${when(
            host.multiple,
            () => html`
              <vu-icon
                class="remove-chip"
                part="remove-chip-icon"
                @click=${(e: Event) => {
                  e.stopPropagation();
                  removeChip(host, item);
                }}
                icon=${ICONS.close}
              ></vu-icon>
            `,
          )}
        </span>
      `,
    )}
    ${when(
      overflow > 0,
      () => html`
        <button
          type="button"
          class="chip overflow-chip"
          part="overflow-chip"
          @click=${host.toggleHiddenChips}
          @keydown=${onActivationKeydownEvent(host.toggleHiddenChips)}
        >
          + ${overflow}
        </button>
      `,
    )}
  `;
}

function renderHiddenChipsDropdown(host: ComboboxRenderHost): TemplateResult {
  return html`
    <div
      class="hidden-chips-dropdown"
      part="hidden-chips-dropdown"
      popover="manual"
      @toggle=${host.hiddenPopover.onToggle}
      @click=${stopEventPropagation}
      @keydown=${stopEventPropagation}
      style="
        left: var(--vu-hc-left, var(--vu-space-0));
        top: var(--vu-hc-top, var(--vu-space-0));
        width: var(--vu-hc-width, max-content);
        z-index: var(--vu-combobox-z-index, 11);
      "
    >
      ${repeat(
        host.selectedItems.slice(host.visibleChips),
        (item) => optionKey(item),
        (item) => html`
          <div class="hidden-chip-inner" part="hidden-chip-inner">
            <span part="hidden-chip-label">${getOptionLabel(item)}</span>
            <vu-icon
              part="remove-chip-icon"
              class="remove-chip-inner"
              icon=${ICONS.close}
              @click=${(e: MouseEvent) => {
                e.stopPropagation();
                removeChip(host, item);
              }}
            ></vu-icon>
          </div>
        `,
      )}
    </div>
  `;
}

function renderFieldInput(host: ComboboxRenderHost): TemplateResult {
  const showPlaceholder = !host.multiple || host.selectedItems.length === 0 || host.query !== "";
  return html`
    <input
      id=${host.triggerId}
      class="field-input"
      part="input"
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded=${host.open ? "true" : "false"}
      aria-controls=${host.listboxId}
      aria-autocomplete="list"
      aria-invalid=${host.showError ? "true" : "false"}
      aria-describedby=${host.ariaDescribedBy}
      aria-labelledby=${host.triggerLabelledBy}
      aria-label=${host.triggerAriaLabel}
      aria-busy=${host.loading ? "true" : "false"}
      .value=${live(getFieldInputValue(host))}
      placeholder=${showPlaceholder ? host.placeholder : ""}
      ?readonly=${host.readonly}
      ?disabled=${host.disabled}
      @input=${host.handleInput}
      @keydown=${host.onSearchKeydown}
      @focus=${host.handleFieldInputFocus}
      @blur=${host.handleBlur}
      @click=${(e: MouseEvent) => e.stopPropagation()}
    />
  `;
}

function renderDisplayValue(host: ComboboxRenderHost): TemplateResult {
  return when(
    host.selectedItems.length > 0,
    () =>
      html`<div class="chip-container chip-container--static" part="chip-container">
        ${renderChips(host)}
      </div>`,
    () => html`<span class="placeholder-label" part="placeholder-label">${host.placeholder}</span>`,
  );
}

function renderFieldValue(host: ComboboxRenderHost): TemplateResult {
  if (!host.hasFieldInput) return renderDisplayValue(host);

  const hasChips = host.multiple && host.selectedItems.length > 0;
  return html`
    <div class="value-area" part="value">
      ${when(
        hasChips,
        () => html` <div class="chip-container" part="chip-container">${renderChips(host)}</div> `,
      )}
      ${renderFieldInput(host)}
    </div>
  `;
}

function renderItemContent(
  host: ComboboxRenderHost,
  row: VuComboboxFilteredRow,
  rowIndex: number,
  isSelected: boolean,
): TemplateResult {
  const ctx: VuComboboxRendererContext = {
    option: row.original,
    index: row._idx,
    label: row.label,
    highlighted: row.highlighted,
    selected: isSelected,
    active: rowIndex === host.activeIndex,
  };
  const custom = host.renderer?.(ctx);
  if (custom != null) {
    if (typeof custom === "string") {
      return html`<span class="option-content" part="option-content">${custom}</span>`;
    }
    return html`<div class="option-content" part="option-content">${custom}</div>`;
  }
  return renderHighlightedLabel(row.label, host.searchable ? host.query : "", {
    className: "highlighted-text option-content",
    part: "option-content highlighted-text",
  });
}

function renderDropdownOption(
  host: ComboboxRenderHost,
  row: VuComboboxFilteredRow,
  index: number,
): TemplateResult {
  const { original } = row;
  const isSelected = host.selectedItems.some(
    (item) => optionKey(item) === optionKey(original),
  );
  const rowIndex = host.headerRows + index;
  const itemClasses = classMap({
    "dropdown-item": true,
    active: rowIndex === host.activeIndex,
    selected: isSelected,
  });
  return html`
    <div
      class=${itemClasses}
      data-row-index=${rowIndex}
      role="option"
      aria-selected=${isSelected ? "true" : "false"}
      part="option"
      @click=${() => selectOption(host, original)}
      @keydown=${onActivationKeydown(() => selectOption(host, original))}
    >
      ${when(
        host.multiple,
        () => html`<vu-checkbox
          tone=${nestedFieldTone(host.tone)}
          .checked=${isSelected}
          readonly
        ></vu-checkbox>`,
      )}
      ${renderItemContent(host, row, rowIndex, isSelected)}
    </div>
  `;
}

function renderDropdown(host: ComboboxRenderHost): TemplateResult {
  return html`
    <div
      class="dropdown"
      part="dropdown"
      popover="manual"
      @toggle=${host.dropdownPopover.onToggle}
      @click=${stopEventPropagation}
      @keydown=${stopEventPropagation}
      style="
        left: var(--vu-dd-left, var(--vu-space-0));
        top: var(--vu-dd-top, var(--vu-space-0));
        min-width: var(--vu-dd-width, 100%);
      "
    >
      <div
        class="dropdown-scroller"
        part="dropdown-scroller"
        id=${host.listboxId}
        role="listbox"
        aria-busy=${host.loading ? "true" : "false"}
        aria-label=${host.placeholder}
      >
        ${when(host.multiple && !host.loading && host.filteredOptions.length, () => {
          const selectAllClasses = classMap({
            "dropdown-item": true,
            active: host.activeIndex === 0,
            selected: isAllFilteredSelected(host),
          });
          return html`
            <div
              class=${selectAllClasses}
              data-row-index="0"
              role="option"
              aria-selected=${isAllFilteredSelected(host) ? "true" : "false"}
              part="select-all"
              @click=${() => toggleSelectAll(host)}
              @keydown=${onActivationKeydown(() => toggleSelectAll(host))}
            >
              <vu-checkbox
                tone=${nestedFieldTone(host.tone)}
                .checked=${isAllFilteredSelected(host)}
                readonly
              ></vu-checkbox>
              Select All
            </div>
          `;
        })}
        ${when(
          host.loading,
          () => html`
            <div class="dropdown-loading" part="dropdown-loading" role="status" aria-live="polite">
              <div class="loading-indicator" part="dropdown-loading-indicator"></div>
              <span part="dropdown-loading-label">Loading…</span>
            </div>
          `,
          () =>
            when(
              host.filteredOptions.length > 0,
              () =>
                virtualize({
                  items: host.filteredOptions,
                  scroller: true,
                  estimateSize: () => COMBOBOX_OPTION_ESTIMATE,
                  gap: COMBOBOX_OPTION_GAP,
                  overscan: COMBOBOX_VIRTUAL_OVERSCAN,
                  scrollMargin:
                    host.headerRows > 0 ? COMBOBOX_OPTION_ESTIMATE + COMBOBOX_OPTION_GAP : 0,
                  scrollPaddingStart: host.headerRows > 0 ? COMBOBOX_OPTION_ESTIMATE : 0,
                  keyFunction: (item) => {
                    const row = item as VuComboboxFilteredRow;
                    return `${row._idx}-${optionKey(row.original)}`;
                  },
                  renderItem: (item, index) =>
                    renderDropdownOption(host, item as VuComboboxFilteredRow, index),
                }),
              () => html`
                <div
                  class="dropdown-item"
                  part="no-options"
                  data-row-index=${host.headerRows}
                  role="option"
                  aria-selected="false"
                  aria-disabled="true"
                >
                  No options found
                </div>
              `,
            ),
        )}
      </div>
    </div>
  `;
}

/** Root shadow template for `<vu-combobox>`. */
export function renderCombobox(host: ComboboxRenderHost): TemplateResult {
  return html`
    <div class="combobox-field" part="field">
      <label
        class="combobox-label"
        part="label"
        id=${host.labelId}
        for=${host.triggerId}
        aria-hidden=${!host.hasLabel ? "true" : nothing}
      >
        <slot name="label" @slotchange=${host.onChromeSlotChange}>${host.label}</slot>
      </label>

      <div class="combobox-control-row">
        <div
          class="container"
          part="container"
          id=${host.hasFieldInput ? nothing : host.triggerId}
          tabindex=${host.hasFieldInput ? nothing : "0"}
          role=${host.hasFieldInput ? nothing : "combobox"}
          aria-haspopup=${host.hasFieldInput ? nothing : "listbox"}
          aria-expanded=${host.hasFieldInput ? nothing : host.open ? "true" : "false"}
          aria-controls=${host.hasFieldInput ? nothing : host.listboxId}
          aria-invalid=${host.hasFieldInput ? nothing : host.showError ? "true" : "false"}
          aria-describedby=${host.hasFieldInput ? nothing : host.ariaDescribedBy}
          aria-labelledby=${host.hasFieldInput ? nothing : host.triggerLabelledBy}
          aria-label=${host.hasFieldInput ? nothing : host.triggerAriaLabel}
          aria-busy=${host.loading ? "true" : "false"}
          ?open=${host.open}
          @click=${host.handleContainerClick}
          @keydown=${host.hasFieldInput ? nothing : host.handleKeydown}
        >
          <span
            part="start"
            class="combobox-affix"
            @click=${stopEventPropagation}
            @keydown=${stopEventPropagation}
          >
            <slot name="start"></slot>
          </span>

          ${renderFieldValue(host)}

          <span
            part="end"
            class="combobox-affix"
            @click=${stopEventPropagation}
            @keydown=${stopEventPropagation}
          >
            <slot name="end"></slot>
          </span>
          ${when(
            host.addOption,
            () => html`
              <vu-icon
                class="new-option-btn"
                icon=${ICONS.increment}
                part="add-option-icon"
                title="Add as new option"
                aria-label="Add as new option"
                @click=${host.handleAddOption}
              ></vu-icon>
            `,
          )}
          ${when(
            host.clearable && (host.value || host.selectedItems.length),
            () => html`
              <vu-icon
                class="clear-button"
                part="clear-button"
                icon=${ICONS.close}
                @click=${host.handleClear}
              ></vu-icon>
            `,
          )}
          <vu-icon
            class="dropdown-button"
            part="dropdown-button"
            icon=${host.open ? ICONS.chevronUp : ICONS.chevronDown}
            @click=${(e: MouseEvent) => {
              e.stopPropagation();
              if (!host.disabled && !host.readonly) host.toggleDropdown(e);
            }}
          ></vu-icon>
        </div>
      </div>

      ${when(host.showHint, () =>
        renderFieldHint({
          hintId: host.hintId,
          hintText: host.hint,
        }),
      )}
      ${when(host.showError, () =>
        renderFieldErrors({
          errorId: host.errorId,
          errors: getErrorMessages(host),
        }),
      )}
      ${renderHiddenChipsDropdown(host)} ${renderDropdown(host)}
    </div>
  `;
}
