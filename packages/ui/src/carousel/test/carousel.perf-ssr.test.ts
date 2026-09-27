/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-carousel",
  load: () =>
    Promise.all([import("../carousel.js"), import("../../carousel-item/carousel-item.js")]),
  template: html`
    <vu-carousel label="Featured">
      <vu-carousel-item>Slide 1</vu-carousel-item>
      <vu-carousel-item>Slide 2</vu-carousel-item>
    </vu-carousel>
  `,
});
