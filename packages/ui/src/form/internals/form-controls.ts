/** Custom + native controls that participate in form ownership and validation aggregation. */
export const FORM_ASSOCIATED_SELECTOR = [
  "input",
  "select",
  "textarea",
  "button",
  "vu-button",
  "vu-input",
  "vu-combobox",
  "vu-date-picker",
  "vu-date-field",
  "vu-checkbox",
  "vu-checkbox-group",
  "vu-radio",
  "vu-radio-group",
  "vu-otp",
  "vu-serial",
  "vu-range",
  "vu-slider",
  "vu-counter",
  "vu-switch",
  "vu-file-picker",
  "vu-color-picker",
  "vu-color-slider",
  "vu-color-area",
  "vu-color-swatch-picker",
].join(",");

/** Field hosts that may emit live value updates. */
export const FORM_FIELD_SELECTOR = [
  "input",
  "select",
  "textarea",
  "vu-input",
  "vu-combobox",
  "vu-date-picker",
  "vu-date-field",
  "vu-checkbox",
  "vu-checkbox-group",
  "vu-radio",
  "vu-radio-group",
  "vu-otp",
  "vu-serial",
  "vu-range",
  "vu-slider",
  "vu-counter",
  "vu-switch",
  "vu-file-picker",
  "vu-color-picker",
  "vu-color-slider",
  "vu-color-area",
  "vu-color-swatch-picker",
].join(",");

/** Custom elements aggregated for `validationErrors` / `validateInput`. */
export const VU_FIELD_SELECTOR = [
  "vu-input",
  "vu-combobox",
  "vu-date-picker",
  "vu-date-field",
  "vu-checkbox",
  "vu-checkbox-group",
  "vu-radio",
  "vu-radio-group",
  "vu-otp",
  "vu-serial",
  "vu-range",
  "vu-slider",
  "vu-counter",
  "vu-switch",
  "vu-file-picker",
  "vu-color-picker",
  "vu-color-slider",
  "vu-color-area",
  "vu-color-swatch-picker",
].join(",");

/** Subset of form-associated custom elements with optional validation surface. */
export type FormFieldHost = HTMLElement & {
  form?: HTMLFormElement | null;
  formResetCallback?: () => void;
  checkValidity?: () => boolean;
  validateInput?: () => boolean;
  validateForForm?: () => string;
  runCustomValidations?: () => string;
  validations?: Array<(value: string | File[]) => true | string>;
  validationErrors?: string[];
  validationActive?: boolean;
  showErrors?: boolean;
  invalid?: boolean;
  willValidate?: boolean;
  validity?: ValidityState;
  validationMessage?: string;
  name?: string;
  id?: string;
};
