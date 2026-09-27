/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-radio",
  load: () => import("../radio.js"),
  template: html`<vu-radio label="Option" value="a"></vu-radio>`,
});
