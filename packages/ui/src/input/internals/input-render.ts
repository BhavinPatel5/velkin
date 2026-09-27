import { html, nothing, type TemplateResult } from "lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";
import { when } from "lit/directives/when.js";
import {
  renderFieldErrors,
  renderFieldHint,
} from "../../internals/form/field-validation-render.js";
import { ICONS } from "../../internals/icon.js";
import { msg } from "../../internals/utils/localize.js";
import type { VuInputType, VuInputValue } from "../input.types.js";

export type InputRenderHost = {
  type: VuInputType;
  value: VuInputValue;
  placeholder: string;
  label: string;
  hint: string;
  loading: boolean;
  disabled: boolean;
  readonly: boolean;
  required: boolean;
  clearable: boolean;
  showNumberButtons: boolean;
  showPasswordToggle: boolean;
  showPassword: boolean;
  rows: number;
  resizable: string;
  accept: string;
  multiple: boolean;
  step: string | null;
  min: string | null;
  max: string | null;
  autocapitalize: string;
  autocomplete: string;
  spellcheck: boolean;
  dir: string;
  inputmode: string | null;
  enterkeyhint: string | null;
  pattern: string | null;
  minlength: number | null;
  maxlength: number | null;
  list: string | null;
  nativeSize: number | null;
  autofocus: boolean;
  capture: boolean;
  ariaLabel: string;
  ariaLabelledby: string | null;
  selectedFileName: string;
  totalFileSize: number;
  selectedFileCount: number;
  validationErrors: string[];
  inputElementId: string;
  hasLabel: boolean;
  startFilled: boolean;
  endFilled: boolean;
  showHint: boolean;
  showError: boolean;
  hintId: string;
  errorId: string;
  ariaDescribedBy: string | typeof nothing;
  inputAriaLabel: string | typeof nothing;
  isInvalid: boolean;
  isFileInput: boolean;
  isTextarea: boolean;
  isPassword: boolean;
  isNumberInput: boolean;
  isPickerType: boolean;
  showFileInfo: boolean;
  showClear: boolean;
  fileSizeLabel: string;
  onContainerClick(event: Event): void;
  onContainerKeydown(event: KeyboardEvent): void;
  onInput(event: Event): void;
  onFocus(event: Event): void;
  onBlur(event: Event): void;
  onFileChange(event: Event): void;
  onFileKeydown(event: KeyboardEvent): void;
  onClear(event: Event): void;
  onTogglePassword(event: Event): void;
  onIncrement(event: Event): void;
  onDecrement(event: Event): void;
  onAffixActivate(side: "start" | "end", event: Event): void;
  onAffixKeydown(side: "start" | "end", event: KeyboardEvent): void;
  onNumberPointerDown(event: Event): void;
};

export function renderInput(host: InputRenderHost): TemplateResult {
  return html`
    <div class="input-field" part="field">
      <label
        class="input-label"
        part="label"
        for=${host.inputElementId}
        aria-hidden=${!host.hasLabel ? "true" : nothing}
      >
        <slot name="label">${host.label}</slot>
      </label>

      <div class="input-control-row">
        <div
          class="container"
          part="container"
          @click=${host.onContainerClick}
          @keydown=${host.onContainerKeydown}
        >
          <span
            part="start"
            class="input-affix"
            ?interactive=${host.isFileInput || host.isPickerType}
            @click=${(event: Event) => host.onAffixActivate("start", event)}
            @keydown=${(event: KeyboardEvent) => host.onAffixKeydown("start", event)}
          >
            <slot name="start"></slot>
          </span>

          ${
            host.isFileInput
              ? renderFileControl(host)
              : host.isTextarea
                ? renderTextareaControl(host)
                : renderTextControl(host)
          }
          ${when(
            host.isNumberInput && host.showNumberButtons,
            () => html`
              <div class="number-stepper" part="number-stepper">
                <button
                  type="button"
                  tabindex="-1"
                  part="button button--decrease"
                  aria-label=${msg("Decrease value", {
                    desc: "Accessible name for the input number decrease control.",
                  })}
                  @pointerdown=${host.onNumberPointerDown}
                  @click=${host.onDecrement}
                >
                  <vu-icon .icon=${ICONS.decrement} aria-hidden="true"></vu-icon>
                </button>
                <button
                  type="button"
                  tabindex="-1"
                  part="button button--increase"
                  aria-label=${msg("Increase value", {
                    desc: "Accessible name for the input number increase control.",
                  })}
                  @pointerdown=${host.onNumberPointerDown}
                  @click=${host.onIncrement}
                >
                  <vu-icon .icon=${ICONS.increment} aria-hidden="true"></vu-icon>
                </button>
              </div>
            `,
          )}

          <div class="input-actions">
            ${when(
              host.isPassword && host.showPasswordToggle,
              () => html`
                <button
                  type="button"
                  class="input-action"
                  part="toggle-password"
                  aria-label=${
                    host.showPassword
                      ? msg("Hide password", {
                          desc: "Accessible name for hiding the password.",
                        })
                      : msg("Show password", {
                          desc: "Accessible name for showing the password.",
                        })
                  }
                  @click=${host.onTogglePassword}
                >
                  <vu-icon
                    .icon=${host.showPassword ? ICONS.visibilityOff : ICONS.visibility}
                    aria-hidden="true"
                  ></vu-icon>
                </button>
              `,
            )}
            ${when(
              host.showClear,
              () => html`
                <button
                  type="button"
                  class="input-action"
                  part="clear-button"
                  aria-label=${msg("Clear", {
                    desc: "Accessible name for clearing the input value.",
                  })}
                  @click=${host.onClear}
                >
                  <vu-icon .icon=${ICONS.close} aria-hidden="true"></vu-icon>
                </button>
              `,
            )}
            ${when(
              host.loading,
              () => html` <span class="loading-indicator" part="loading-indicator"></span> `,
            )}
          </div>

          <span
            part="end"
            class="input-affix"
            ?interactive=${host.isFileInput || host.isPickerType}
            @click=${(event: Event) => host.onAffixActivate("end", event)}
            @keydown=${(event: KeyboardEvent) => host.onAffixKeydown("end", event)}
          >
            <slot name="end"></slot>
          </span>
        </div>
      </div>

      ${when(host.showHint, () =>
        renderFieldHint({
          hintId: host.hintId,
          hintText: host.hint,
          hintClass: "field-hint input-hint",
        }),
      )}
      ${when(host.showError, () =>
        renderFieldErrors({
          errorId: host.errorId,
          errors: host.validationErrors,
          errorMessageClass: "field-error-message input-error-message",
          errorLineClass: "field-error-line input-error-line",
        }),
      )}
      ${when(
        host.showFileInfo,
        () => html`
          <div class="file-info" part="file-info">
            <span>${host.selectedFileCount} file${host.selectedFileCount === 1 ? "" : "s"}</span>
            <span>${host.fileSizeLabel}</span>
          </div>
        `,
      )}
    </div>
  `;
}

function renderTextControl(host: InputRenderHost): TemplateResult {
  return html`
    <input
      part="input"
      id=${host.inputElementId}
      .type=${host.isPassword && host.showPassword ? "text" : host.type}
      .value=${live(host.value ?? "")}
      placeholder=${host.placeholder || nothing}
      ?disabled=${host.disabled}
      ?readonly=${host.readonly}
      ?required=${host.required}
      .autocomplete=${host.autocomplete}
      .autocapitalize=${host.autocapitalize}
      ?spellcheck=${host.spellcheck}
      .dir=${host.dir}
      inputmode=${ifDefined(host.inputmode ?? undefined)}
      enterkeyhint=${ifDefined(host.enterkeyhint ?? undefined)}
      list=${ifDefined(host.list ?? undefined)}
      pattern=${ifDefined(host.pattern ?? undefined)}
      minlength=${ifDefined(host.minlength ?? undefined)}
      maxlength=${ifDefined(host.maxlength ?? undefined)}
      size=${ifDefined(host.nativeSize ?? undefined)}
      step=${ifDefined(host.step ?? undefined)}
      min=${ifDefined(host.min ?? undefined)}
      max=${ifDefined(host.max ?? undefined)}
      ?autofocus=${host.autofocus}
      @input=${host.onInput}
      @focus=${host.onFocus}
      @blur=${host.onBlur}
      aria-invalid=${host.isInvalid ? "true" : "false"}
      aria-required=${host.required ? "true" : "false"}
      aria-describedby=${host.ariaDescribedBy}
      aria-label=${host.inputAriaLabel}
      aria-labelledby=${ifDefined(host.ariaLabelledby ?? undefined)}
    />
  `;
}

function renderTextareaControl(host: InputRenderHost): TemplateResult {
  return html`
    <textarea
      part="input"
      id=${host.inputElementId}
      .value=${live(host.value ?? "")}
      placeholder=${host.placeholder || nothing}
      ?disabled=${host.disabled}
      ?readonly=${host.readonly}
      ?required=${host.required}
      rows=${host.rows}
      resize=${host.resizable || "none"}
      .autocomplete=${host.autocomplete}
      .autocapitalize=${host.autocapitalize}
      ?spellcheck=${host.spellcheck}
      inputmode=${ifDefined(host.inputmode ?? undefined)}
      enterkeyhint=${ifDefined(host.enterkeyhint ?? undefined)}
      minlength=${ifDefined(host.minlength ?? undefined)}
      maxlength=${ifDefined(host.maxlength ?? undefined)}
      ?autofocus=${host.autofocus}
      @input=${host.onInput}
      @focus=${host.onFocus}
      @blur=${host.onBlur}
      aria-invalid=${host.isInvalid ? "true" : "false"}
      aria-required=${host.required ? "true" : "false"}
      aria-describedby=${host.ariaDescribedBy}
      aria-label=${host.inputAriaLabel}
      aria-labelledby=${ifDefined(host.ariaLabelledby ?? undefined)}
    ></textarea>
  `;
}

function renderFileControl(host: InputRenderHost): TemplateResult {
  return html`
    <label class="file-label" part="file-label" for=${host.inputElementId}>
      ${host.selectedFileName || host.placeholder}
    </label>
    <input
      part="input"
      id=${host.inputElementId}
      type="file"
      ?disabled=${host.disabled}
      ?required=${host.required}
      accept=${host.accept || nothing}
      ?multiple=${host.multiple}
      ?autofocus=${host.autofocus}
      capture=${ifDefined(host.capture ? "environment" : undefined)}
      @change=${host.onFileChange}
      @keydown=${host.onFileKeydown}
      aria-invalid=${host.isInvalid ? "true" : "false"}
      aria-required=${host.required ? "true" : "false"}
      aria-describedby=${host.ariaDescribedBy}
      aria-label=${host.inputAriaLabel}
      aria-labelledby=${ifDefined(host.ariaLabelledby ?? undefined)}
    />
  `;
}
