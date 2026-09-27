import type {
  FieldValidationHost,
  FieldValidationInvalidDetail,
  FieldValidationRunResult,
  FieldValidationValidateOptions,
  FieldValidator,
} from "./field-validation.types.js";

let _fieldAriaIdCounter = 0;

/** Stable aria id pair for hint + error regions under a field. */
export function createFieldAriaIds(prefix: string): { hintId: string; errorId: string } {
  const token = ++_fieldAriaIdCounter;
  return {
    hintId: `${prefix}-hint-${token}`,
    errorId: `${prefix}-err-${token}`,
  };
}

/** True when hint string or slotted hint has content; prefer `slotOrPropVisible(host, "hint", hint)` in components. */
export function fieldHintVisible(hintText: string, hintSlotFilled: boolean): boolean {
  return !!hintText.trim() || hintSlotFilled;
}

/** True when validation UI should show error messages. */
export function shouldShowFieldError(host: FieldValidationHost): boolean {
  return host.showErrors && host.validationActive && host.validationErrors.length > 0;
}

/** Join hint/error ids for `aria-describedby`; returns empty string when none apply. */
export function fieldAriaDescribedBy(
  hintId: string,
  errorId: string,
  showHint: boolean,
  showError: boolean,
): string {
  const ids: string[] = [];
  if (showHint) ids.push(hintId);
  if (showError) ids.push(errorId);
  return ids.join(" ");
}

/** Run validators when active; skips work when `active` is false. */
export function runFieldValidation(
  active: boolean,
  validators: FieldValidator[],
): FieldValidationRunResult {
  if (!active) {
    return { errors: [], valid: true };
  }
  const errors: string[] = [];
  for (const validate of validators) {
    const message = validate();
    if (message) errors.push(message);
  }
  return { errors, valid: errors.length === 0 };
}

/** Required rule helper — message when `required` and `isEmpty()` is true. */
export function requiredFieldValidator(
  required: boolean,
  isEmpty: () => boolean,
  message: string,
): FieldValidator {
  return () => (required && isEmpty() ? message : null);
}

/** Subclass `validateForForm()` bridge. */
export function customFieldValidator(getMessage: () => string): FieldValidator {
  return () => {
    const message = getMessage();
    return message || null;
  };
}

/** Apply result to host, dispatch invalid event, optional validity sync. */
export function applyFieldValidationResult(
  host: FieldValidationHost,
  result: FieldValidationRunResult,
  options: FieldValidationValidateOptions = {},
): boolean {
  const eventName = options.invalidEventName ?? "vu-invalid";
  host.validationErrors = [...result.errors];
  host.invalid = !result.valid;

  host.dispatchEvent(
    new CustomEvent<FieldValidationInvalidDetail>(eventName, {
      detail: { errors: [...result.errors] },
      bubbles: true,
      composed: true,
    }),
  );

  options.syncValidity?.();
  options.onAfterValidate?.(result);
  return result.valid;
}

/** Reset validation UI state (e.g. on `reset()` / `onFormReset`). */
export function clearFieldValidation(host: FieldValidationHost): void {
  host.validationErrors = [];
  host.validationActive = false;
  host.invalid = false;
}

/** Blur / submit gate — mark the field as ready to show validation messages. */
export function activateFieldValidation(host: FieldValidationHost): void {
  host.validationActive = true;
}
