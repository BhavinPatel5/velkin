/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-skeleton",
  load: () => import("../skeleton.js"),
  template: html`<vu-skeleton variant="text" width="80%"></vu-skeleton>`,
});
