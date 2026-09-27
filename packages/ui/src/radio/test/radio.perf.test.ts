/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuRadio } from "../radio.js";

tierAPerfSuite({
  id: "vu-radio",
  tag: "vu-radio",
  load: () => import("../radio.js"),
  create: async () => fixture<VuRadio>(html`<vu-radio label="Option" value="a"></vu-radio>`),
  mutate: (el, i) => {
    (el as VuRadio).checked = i % 2 === 0;
  },
});
