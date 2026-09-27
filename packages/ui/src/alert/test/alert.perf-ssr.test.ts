/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-alert",
  load: () => Promise.all([import("../alert.js"), import("../../icon/icon.js")]),
  template: html` <vu-alert heading="Notice" message="Something happened."></vu-alert> `,
});
