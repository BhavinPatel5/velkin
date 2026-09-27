/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-radio-group",
  load: () => Promise.all([import("../radio-group.js"), import("../../radio/radio.js")]),
  template: html`
    <vu-radio-group label="Pick" name="g">
      <vu-radio label="A" value="a"></vu-radio>
    </vu-radio-group>
  `,
});
