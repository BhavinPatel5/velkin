import { describe, expect, it } from "vitest";
import { applyTabIndicatorVars } from "../../internals/tab-thumb.js";

describe("tab thumb helpers", () => {
  it("applyTabIndicatorVars writes geometry to track CSS variables", () => {
    const wrap = document.createElement("div");
    applyTabIndicatorVars(wrap, 4, 8, 40, 20, 1);

    expect(wrap.style.getPropertyValue("--tab-indicator-x")).toBe("4px");
    expect(wrap.style.getPropertyValue("--tab-indicator-y")).toBe("8px");
    expect(wrap.style.getPropertyValue("--tab-indicator-w")).toBe("40px");
    expect(wrap.style.getPropertyValue("--tab-indicator-h")).toBe("20px");
    expect(wrap.style.getPropertyValue("--tab-indicator-opacity")).toBe("1");
  });

  it("applyTabIndicatorVars can hide the indicator", () => {
    const wrap = document.createElement("div");
    applyTabIndicatorVars(wrap, 0, 0, 0, 0, 0);

    expect(wrap.style.getPropertyValue("--tab-indicator-opacity")).toBe("0");
  });
});
