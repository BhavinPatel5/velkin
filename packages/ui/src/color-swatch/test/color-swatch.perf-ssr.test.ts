/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-color-swatch",
  load: () => import("../color-swatch.js"),
  template: html`<vu-color-swatch color="#3b82f6" selectable></vu-color-swatch>`,
});
