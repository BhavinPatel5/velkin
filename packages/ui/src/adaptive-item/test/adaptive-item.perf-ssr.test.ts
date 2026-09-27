/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-adaptive-item",
  load: () => import("../adaptive-item.js"),
  template: html` <vu-adaptive-item><a href="#">Home</a></vu-adaptive-item> `,
});
