import type { ReactiveController, ReactiveControllerHost } from "lit";
import { slotOrPropVisible } from "../utils/slot.js";
import {
  activateFieldValidation,
  applyFieldValidationResult,
  clearFieldValidation,
  createFieldAriaIds,
  fieldAriaDescribedBy,
  runFieldValidation,
  shouldShowFieldError,
} from "./field-validation.js";
import type {
  FieldValidationHost,
  FieldValidationValidateOptions,
  FieldValidator,
} from "./field-validation.types.js";

/** Shared validation state, aria ids, and helpers for label/hint/error field layouts. */
export class FieldValidationController implements ReactiveController {
  readonly hintId: string;
  readonly errorId: string;

  constructor(
    private readonly host: FieldValidationHost & ReactiveControllerHost & Element,
    idPrefix: string,
  ) {
    const ids = createFieldAriaIds(idPrefix);
    this.hintId = ids.hintId;
    this.errorId = ids.errorId;
    host.addController(this);
  }

  hostConnected(): void {}

  get hintText(): string {
    return this.host.hint ?? "";
  }

  get showHint(): boolean {
    return slotOrPropVisible(this.host, "hint", this.hintText);
  }

  get showError(): boolean {
    return shouldShowFieldError(this.host);
  }

  ariaDescribedBy(): string {
    return fieldAriaDescribedBy(this.hintId, this.errorId, this.showHint, this.showError);
  }

  activate(): void {
    activateFieldValidation(this.host);
  }

  clear(): void {
    clearFieldValidation(this.host);
  }

  validate(validators: FieldValidator[], options?: FieldValidationValidateOptions): boolean {
    if (!this.host.validationActive) return true;
    const extra = this.host.runCustomValidations;
    const all =
      typeof extra === "function" ? [...validators, () => extra.call(this.host) || null] : validators;
    const result = runFieldValidation(true, all);
    return applyFieldValidationResult(this.host, result, options);
  }

  /** Re-run validators after `validationActive` was set (typical blur handler). */
  validateNow(validators: FieldValidator[], options?: FieldValidationValidateOptions): boolean {
    this.activate();
    return this.validate(validators, options);
  }
}
