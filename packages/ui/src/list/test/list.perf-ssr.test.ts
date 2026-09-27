/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-list",
  load: () => Promise.all([import("../list.js"), import("../../list-item/list-item.js")]),
  template: html`
    <vu-list selection="single">
      <vu-listitem value="a" label="Alpha"></vu-listitem>
    </vu-list>
  `,
});
