import { describe, expect, it } from "vitest";
import { CONTROL_RADIUS_VAR_BY_RADIUS, controlRadiusVar } from "./control-radius.js";

describe("controlRadiusVar", () => {
  it("maps known radius presets", () => {
    expect(controlRadiusVar("none")).toBe("0");
    expect(controlRadiusVar("sm")).toBe("var(--vu-control-radius-sm)");
    expect(controlRadiusVar("full")).toBe("var(--vu-radius-full)");
    expect(CONTROL_RADIUS_VAR_BY_RADIUS.md).toBe("var(--vu-control-radius-md)");
  });

  it("falls back to md for unknown values", () => {
    expect(controlRadiusVar("huge")).toBe("var(--vu-control-radius-md)");
  });
});
