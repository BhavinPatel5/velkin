/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-dropdown-item",
  load: () => import("../dropdown-item.js"),
  template: html`<vu-dropdown-item label="Option" color="primary" size="sm"></vu-dropdown-item>`,
});
