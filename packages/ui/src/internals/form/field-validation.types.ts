/** One validation rule; return a message string when invalid, otherwise null/undefined/"". */
export type FieldValidator = () => string | null | undefined | false;

/** Payload for `vu-invalid` and other field validation events. */
export type FieldValidationInvalidDetail = {
  errors: string[];
};

/** Result of `runFieldValidation`. */
export type FieldValidationRunResult = {
  errors: string[];
  valid: boolean;
};

/** Host surface required by `FieldValidationController` and render helpers. */
export type FieldValidationHost = {
  hint?: string;
  showErrors: boolean;
  validationActive: boolean;
  invalid: boolean;
  validationErrors: string[];
  required: boolean;
  requiredMessage: string;
  runCustomValidations?: () => string;
  dispatchEvent(event: Event): boolean;
};

export type FieldValidationValidateOptions = {
  /** Runs after errors are applied and the invalid event fires. */
  onAfterValidate?: (result: FieldValidationRunResult) => void;
  /** Sync `ElementInternals` validity (form-associated hosts). */
  syncValidity?: () => void;
  /** Custom event name; default `vu-invalid`. */
  invalidEventName?: string;
};
