/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-divider",
  load: () => import("../divider.js"),
  template: html`<vu-divider direction="vertical" inset size="lg"></vu-divider>`,
});
