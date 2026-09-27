/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-carousel-item",
  load: () => import("../carousel-item.js"),
  template: html`<vu-carousel-item label="Slide">Content</vu-carousel-item>`,
});
