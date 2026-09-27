/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-spinner",
  load: () => import("../spinner.js"),
  template: html`<vu-spinner variant="dots"></vu-spinner>`,
});
