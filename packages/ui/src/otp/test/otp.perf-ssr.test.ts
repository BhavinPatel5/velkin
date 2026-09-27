/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-otp",
  load: () => import("../otp.js"),
  template: html`<vu-otp label="Code"></vu-otp>`,
});
