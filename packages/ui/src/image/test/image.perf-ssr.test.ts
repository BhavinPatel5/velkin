/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-image",
  load: () => import("../image.js"),
  template: html`<vu-image src="https://example.com/a.png" alt="Photo"></vu-image>`,
});
