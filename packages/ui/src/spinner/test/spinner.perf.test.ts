/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuSpinner } from "../spinner.js";

tierAPerfSuite({
  id: "vu-spinner",
  tag: "vu-spinner",
  load: () => import("../spinner.js"),
  create: async () => fixture<VuSpinner>(html`<vu-spinner></vu-spinner>`),
  mutate: (el, i) => {
    (el as VuSpinner).variant = i % 2 === 0 ? "solid" : "dots";
  },
});
