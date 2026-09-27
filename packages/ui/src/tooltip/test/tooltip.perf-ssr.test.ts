/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-tooltip",
  load: () => import("../tooltip.js"),
  template: html`<vu-tooltip label="Hint"></vu-tooltip>`,
});
