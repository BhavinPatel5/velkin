/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-speeddial",
  load: () => import("../speeddial.js"),
  template: html`<vu-speeddial label="Actions"></vu-speeddial>`,
});
