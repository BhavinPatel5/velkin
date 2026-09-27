/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-overlay",
  load: () => import("../overlay.js"),
  template: html`<vu-overlay arialabel="Loading"></vu-overlay>`,
});
