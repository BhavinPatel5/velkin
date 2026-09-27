/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuPopover } from "../popover.js";

tierAPerfSuite({
  id: "vu-popover",
  tag: "vu-popover",
  load: () => import("../popover.js"),
  create: async () => fixture<VuPopover>(html`<vu-popover></vu-popover>`),
  mutate: (el, i) => {
    (el as VuPopover).open = i % 2 === 0;
  },
});
