/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuProgress } from "../progress.js";

tierAPerfSuite({
  id: "vu-progress",
  tag: "vu-progress",
  load: () => import("../progress.js"),
  create: async () =>
    fixture<VuProgress>(html`<vu-progress label="Loading" .value=${45}></vu-progress>`),
  mutate: (el, i) => {
    (el as VuProgress).value = i % 2 === 0 ? 30 : 70;
  },
});
