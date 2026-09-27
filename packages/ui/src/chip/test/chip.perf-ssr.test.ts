/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-chip",
  load: () => import("../chip.js"),
  template: html`<vu-chip label="Tag" color="primary" removable></vu-chip>`,
});
