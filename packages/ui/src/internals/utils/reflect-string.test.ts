import { describe, expect, it } from "vitest";
import { omitEmptyString } from "./reflect-string.js";

describe("omitEmptyString", () => {
  it("omits blank, null, and undefined from attributes", () => {
    expect(omitEmptyString.toAttribute?.("")).toBeNull();
    expect(omitEmptyString.toAttribute?.("  ")).toBeNull();
    expect(omitEmptyString.toAttribute?.(null as unknown as string)).toBeNull();
    expect(omitEmptyString.toAttribute?.(undefined as unknown as string)).toBeNull();
  });

  it("keeps named values", () => {
    expect(omitEmptyString.toAttribute?.("save")).toBe("save");
    expect(omitEmptyString.toAttribute?.(" owned-form ")).toBe("owned-form");
  });

  it("reads missing attributes as empty string", () => {
    expect(omitEmptyString.fromAttribute?.(null)).toBe("");
    expect(omitEmptyString.fromAttribute?.("email")).toBe("email");
  });
});
