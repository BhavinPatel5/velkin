/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-breadcrumb-item",
  load: () => import("../breadcrumb-item.js"),
  template: html`<vu-breadcrumb-item href="/docs">Documentation</vu-breadcrumb-item>`,
});
