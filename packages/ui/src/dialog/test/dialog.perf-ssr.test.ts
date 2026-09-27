/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-dialog",
  load: () => import("../dialog.js"),
  template: html`
    <vu-dialog arialabel="Confirm">
      <p slot="body">Proceed?</p>
    </vu-dialog>
  `,
});
