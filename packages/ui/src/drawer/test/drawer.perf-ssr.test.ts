/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-drawer",
  load: () => import("../drawer.js"),
  template: html`
    <vu-drawer arialabel="Navigation" side="right">
      <p slot="body">Links</p>
    </vu-drawer>
  `,
});
