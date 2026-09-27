import { describe, expect, it, vi } from "vitest";
import {
  clearFieldValidation,
  createFieldAriaIds,
  fieldAriaDescribedBy,
  requiredFieldValidator,
  runFieldValidation,
  shouldShowFieldError,
} from "./field-validation.js";
import type { FieldValidationHost } from "./field-validation.types.js";

function mockHost(overrides: Partial<FieldValidationHost> = {}): FieldValidationHost {
  return {
    hint: "",
    showErrors: true,
    validationActive: true,
    invalid: false,
    validationErrors: [],
    required: false,
    requiredMessage: "Required",
    dispatchEvent: vi.fn(() => true),
    ...overrides,
  };
}

describe("field-validation", () => {
  it("runFieldValidation skips when inactive", () => {
    const result = runFieldValidation(false, [() => "fail"]);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("requiredFieldValidator pushes message when empty", () => {
    const result = runFieldValidation(true, [requiredFieldValidator(true, () => true, "Pick one")]);
    expect(result.errors).toEqual(["Pick one"]);
    expect(result.valid).toBe(false);
  });

  it("shouldShowFieldError gates on showErrors, validationActive, and errors", () => {
    const host = mockHost({ validationErrors: ["x"] });
    expect(shouldShowFieldError(host)).toBe(true);
    expect(shouldShowFieldError(mockHost({ showErrors: false }))).toBe(false);
    expect(shouldShowFieldError(mockHost({ validationActive: false }))).toBe(false);
  });

  it("fieldAriaDescribedBy joins hint and error ids", () => {
    expect(fieldAriaDescribedBy("h1", "e1", true, true)).toBe("h1 e1");
    expect(fieldAriaDescribedBy("h1", "e1", false, true)).toBe("e1");
    expect(fieldAriaDescribedBy("h1", "e1", false, false)).toBe("");
  });

  it("createFieldAriaIds uses a stable counter", () => {
    const a = createFieldAriaIds("vu-inp");
    const b = createFieldAriaIds("vu-inp");
    expect(a.hintId).toMatch(/^vu-inp-hint-\d+$/);
    expect(a.errorId).toMatch(/^vu-inp-err-\d+$/);
    expect(a.hintId).not.toBe(b.hintId);
    expect(a.errorId).not.toBe(b.errorId);
  });

  it("clearFieldValidation resets host flags", () => {
    const host = mockHost({
      validationErrors: ["a"],
      validationActive: true,
      invalid: true,
    });
    clearFieldValidation(host);
    expect(host.validationErrors).toEqual([]);
    expect(host.validationActive).toBe(false);
    expect(host.invalid).toBe(false);
  });
});
