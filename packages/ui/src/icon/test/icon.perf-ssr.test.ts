/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-icon",
  load: () => import("../icon.js"),
  template: html`<vu-icon icon="mdi:home"></vu-icon>`,
});
