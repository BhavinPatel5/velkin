/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuDivider } from "../divider.js";

tierAPerfSuite({
  id: "vu-divider",
  tag: "vu-divider",
  load: () => import("../divider.js"),
  create: async () => fixture<VuDivider>(html`<vu-divider></vu-divider>`),
  mutate: (el, i) => {
    const host = el as VuDivider;
    host.direction = i % 2 === 0 ? "vertical" : "horizontal";
    host.inset = i % 3 === 0;
    host.size = i % 4 === 0 ? "lg" : i % 4 === 1 ? "sm" : "md";
  },
});
