/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuCarousel } from "../carousel.js";

tierAPerfSuite({
  id: "vu-carousel",
  tag: "vu-carousel",
  load: () =>
    Promise.all([import("../carousel.js"), import("../../carousel-item/carousel-item.js")]),
  create: async () =>
    fixture<VuCarousel>(html`
      <vu-carousel label="Featured" controls="both">
        <vu-carousel-item>Slide 1</vu-carousel-item>
        <vu-carousel-item>Slide 2</vu-carousel-item>
        <vu-carousel-item>Slide 3</vu-carousel-item>
        <vu-carousel-item>Slide 4</vu-carousel-item>
      </vu-carousel>
    `),
  mutate: (el, i) => {
    const host = el as VuCarousel;
    host.index = i % 3;
    host.loop = i % 2 === 0;
    host.gap = i % 3 === 0 ? "md" : "none";
    host.loading = i % 4 === 0;
  },
});
