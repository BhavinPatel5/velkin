/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-tab-item",
  load: () => Promise.all([import("../tab-item.js"), import("../../icon/icon.js")]),
  template: html`<vu-tab-item label="Tab" value="a"></vu-tab-item>`,
});
