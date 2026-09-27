import { emitComboboxInvalid } from "./combobox-events.js";

export type ComboboxValidationHost = {
  validationActive: boolean;
  required: boolean;
  requiredMessage: string;
  invalid: boolean;
  validationErrors: string[];
  disabled: boolean;
  checkEmpty: () => boolean;
  runSyncValidity: () => void;
  requestUpdate: () => void;
  dispatchEvent: (event: Event) => boolean;
};

/** Recomputes `validationErrors` and emits `vu-invalid` when active. */
export function validateInput(host: ComboboxValidationHost): void {
  if (!host.validationActive) return;
  host.validationErrors = [];

  if (host.required && host.checkEmpty()) {
    host.validationErrors.push(host.requiredMessage || "Selection is required.");
  }

  host.invalid = host.validationErrors.length > 0;
  emitComboboxInvalid(host, host.validationErrors);
  host.runSyncValidity();
  host.requestUpdate();
}

/** Returns the first blocking validation message for form submit. */
export function validateForForm(host: ComboboxValidationHost): string {
  if (host.disabled) return "";
  if (host.required && host.checkEmpty()) {
    return host.requiredMessage || "Selection is required.";
  }
  return "";
}

/** Returns validation strings for the error region. */
export function getErrorMessages(host: { validationErrors: string[] }): string[] {
  return Array.isArray(host.validationErrors) ? host.validationErrors : [];
}
