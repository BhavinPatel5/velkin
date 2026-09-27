/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-breadcrumb",
  load: () => import("../breadcrumb.js"),
  template: html`
    <vu-breadcrumb>
      <vu-breadcrumb-item href="/">Home</vu-breadcrumb-item>
      <vu-breadcrumb-item current>Current</vu-breadcrumb-item>
    </vu-breadcrumb>
  `,
});
