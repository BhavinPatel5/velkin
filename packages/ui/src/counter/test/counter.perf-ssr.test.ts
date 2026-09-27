/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-counter",
  load: () => Promise.all([import("../counter.js"), import("../../icon/icon.js")]),
  template: html`<vu-counter label="Qty" value="1"></vu-counter>`,
});
