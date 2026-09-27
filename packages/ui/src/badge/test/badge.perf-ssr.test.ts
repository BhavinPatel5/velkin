/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-badge",
  load: () => import("../badge.js"),
  template: html`<vu-badge value="3"><span>Inbox</span></vu-badge>`,
});
