/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-progress",
  load: () => import("../progress.js"),
  template: html`<vu-progress label="Loading" .value=${40}></vu-progress>`,
});
