/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-color-picker",
  load: () => import("../color-picker.js"),
  template: html`<vu-color-picker label="Brand" value="#3b82f6"></vu-color-picker>`,
});
