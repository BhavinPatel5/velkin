/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuStepItem } from "../step-item.js";
import "../../icon/icon.js";

tierAPerfSuite({
  id: "vu-step-item",
  tag: "vu-step-item",
  load: () => Promise.all([import("../step-item.js"), import("../../icon/icon.js")]),
  create: async () => fixture<VuStepItem>(html`<vu-step-item label="Account">Panel</vu-step-item>`),
  mutate: (el, i) => {
    (el as VuStepItem).label = `Step ${i % 4}`;
    (el as VuStepItem).disabled = i % 5 === 0;
  },
});
