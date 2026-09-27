/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-step-item",
  load: () => Promise.all([import("../step-item.js"), import("../../icon/icon.js")]),
  template: html`<vu-step-item label="Account">Panel</vu-step-item>`,
});
