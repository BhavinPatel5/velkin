/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuSkeleton } from "../skeleton.js";

tierAPerfSuite({
  id: "vu-skeleton",
  tag: "vu-skeleton",
  load: () => import("../skeleton.js"),
  create: async () => fixture<VuSkeleton>(html`<vu-skeleton></vu-skeleton>`),
  mutate: (el, i) => {
    (el as VuSkeleton).variant = i % 2 === 0 ? "text" : "rectangular";
  },
});
