/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-tab",
  load: () => Promise.all([import("../tab.js"), import("../../icon/icon.js")]),
  template: html`<vu-tab label="View" .states=${["a", "b"]} defaultValue="a"></vu-tab>`,
});
