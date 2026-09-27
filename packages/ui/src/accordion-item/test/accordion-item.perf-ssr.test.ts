/**
 * Perf SSR: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-accordion-item",
  load: () => Promise.all([import("../accordion-item.js"), import("../../icon/icon.js")]),
  template: html`
    <vu-accordion-item>
      <span slot="title">Section</span>
      <div slot="body">Content</div>
    </vu-accordion-item>
  `,
});
