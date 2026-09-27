/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-color-slider",
  load: () => import("../color-slider.js"),
  template: html`<vu-color-slider channel="hue" value="hsl(200 80% 50%)"></vu-color-slider>`,
});
