/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-card",
  load: () => import("../card.js"),
  template: html`
    <vu-card>
      <h3 slot="header">Title</h3>
      <p>Body</p>
    </vu-card>
  `,
});
