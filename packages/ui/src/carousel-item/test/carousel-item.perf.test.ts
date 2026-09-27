/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuCarouselItem } from "../carousel-item.js";

tierAPerfSuite({
  id: "vu-carousel-item",
  tag: "vu-carousel-item",
  load: () => import("../carousel-item.js"),
  create: async () =>
    fixture<VuCarouselItem>(html`<vu-carousel-item label="Slide">Content</vu-carousel-item>`),
  mutate: (el, i) => {
    const host = el as VuCarouselItem;
    host.label = i % 2 === 0 ? "A" : "B";
    host.inView = i % 3 === 0;
    host.positionLabel = `${(i % 5) + 1} of 5`;
    host.orientation = i % 2 === 0 ? "horizontal" : "vertical";
  },
});
