import { describe, expect, it } from "vitest";
import { collapseWhenSlotMissing } from "./slot-collapse.css.js";

describe("collapseWhenSlotMissing", () => {
  it("emits a separate fail-open :has hide rule", () => {
    const cssText = String(collapseWhenSlotMissing("header", '[part="header"]'));
    expect(cssText).toContain(':host:not(:has([slot="header"]))');
    expect(cssText).toContain('[part="header"]');
    expect(cssText).toContain("display: none");
  });
});
