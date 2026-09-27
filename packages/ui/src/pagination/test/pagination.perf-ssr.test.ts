/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-pagination",
  load: () => import("../pagination.js"),
  template: html`<vu-pagination .totalPages=${10} .currentPage=${3}></vu-pagination>`,
});
