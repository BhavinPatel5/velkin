/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-color-area",
  load: () => import("../color-area.js"),
  template: html`<vu-color-area hue="120" saturation="75" brightness="80"></vu-color-area>`,
});
