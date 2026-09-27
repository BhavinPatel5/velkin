/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuCounter } from "../counter.js";

tierAPerfSuite({
  id: "vu-counter",
  tag: "vu-counter",
  load: () => Promise.all([import("../counter.js"), import("../../icon/icon.js")]),
  create: async () => fixture<VuCounter>(html`<vu-counter label="Qty" .value=${1}></vu-counter>`),
  mutate: (el, i) => {
    (el as VuCounter).value = i % 10;
  },
});
