/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-checkbox",
  load: () => import("../checkbox.js"),
  template: html`<vu-checkbox label="Agree">Label</vu-checkbox>`,
});
