/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-color-swatch-picker",
  load: () => import("../color-swatch-picker.js"),
  template: html`<vu-color-swatch-picker
    label="Theme"
    .colors=${["#f00", "#0f0", "#00f"]}
  ></vu-color-swatch-picker>`,
});
