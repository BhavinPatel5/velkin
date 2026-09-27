/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-avatar",
  load: () => import("../avatar.js"),
  template: html`<vu-avatar name="Jane Doe" color="primary"></vu-avatar>`,
});
