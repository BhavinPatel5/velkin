import { describe, expect, it } from "vitest";
import {
  ensureTabValue,
  seedTabInternalValue,
  tabSelectedValue,
} from "../../internals/tab-value.js";

describe("tab value helpers", () => {
  const items = [
    { value: "a", label: "A" },
    { value: "b", label: "B" },
  ];

  it("tabSelectedValue prefers controlled value", () => {
    expect(
      tabSelectedValue({
        defaultValue: "a",
        value: "b",
        internalValue: "a",
        controlled: true,
      }),
    ).toBe("b");
  });

  it("tabSelectedValue uses internal value when uncontrolled", () => {
    expect(
      tabSelectedValue({
        defaultValue: "a",
        value: undefined,
        internalValue: "b",
        controlled: false,
      }),
    ).toBe("b");
  });

  it("seedTabInternalValue falls back to first segment", () => {
    expect(seedTabInternalValue(items, "")).toBe("a");
    expect(seedTabInternalValue(items, "b")).toBe("b");
  });

  it("ensureTabValue clamps invalid selections", () => {
    expect(ensureTabValue(items, "missing")).toBe("a");
  });
});
