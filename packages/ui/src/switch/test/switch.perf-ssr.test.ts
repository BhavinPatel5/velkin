/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-switch",
  load: () => import("../switch.js"),
  template: html`<vu-switch label="Alerts"></vu-switch>`,
});
