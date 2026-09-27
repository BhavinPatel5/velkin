/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuSkeletonLoader } from "../skeleton-loader.js";

tierAPerfSuite({
  id: "vu-skeleton-loader",
  tag: "vu-skeleton-loader",
  load: () => import("../skeleton-loader.js"),
  create: async () => fixture<VuSkeletonLoader>(html`<vu-skeleton-loader></vu-skeleton-loader>`),
  mutate: (el, i) => {
    (el as VuSkeletonLoader).loading = i % 2 === 0;
  },
});
