import { describe, expect, it } from "vitest";
import { controlSizeMetricsTokens } from "../styles/control-size-metrics.css.js";
import {
  CONTROL_SIZE_METRICS_ACTION,
  CONTROL_SIZE_METRICS_CHROME,
  CONTROL_SIZE_METRICS_DISMISS,
  CONTROL_SIZE_METRICS_FIELD,
} from "./control-size-metrics.js";

describe("controlSizeMetricsTokens", () => {
  it("defines action, field, chrome, and dismiss token defaults", () => {
    const css = String(controlSizeMetricsTokens);
    expect(css).toContain(CONTROL_SIZE_METRICS_ACTION.py);
    expect(css).toContain(CONTROL_SIZE_METRICS_FIELD.fontSize);
    expect(css).toContain(CONTROL_SIZE_METRICS_CHROME.minBlockSize);
    expect(css).toContain(CONTROL_SIZE_METRICS_DISMISS.size);
    expect(css).toContain(':host([size="sm"])');
    expect(css).toContain(':host([size="lg"])');
  });

  it("maps sm/lg to control-height and chrome-height tokens", () => {
    const css = String(controlSizeMetricsTokens);
    expect(css).toContain("var(--vu-control-height-sm)");
    expect(css).toContain("var(--vu-control-height-lg)");
    expect(css).toContain("var(--vu-chrome-height-sm)");
    expect(css).toContain("var(--vu-chrome-height-lg)");
    expect(css).toContain("var(--vu-space-7)");
  });
});
