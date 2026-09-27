/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuImage } from "../image.js";

tierAPerfSuite({
  id: "vu-image",
  tag: "vu-image",
  load: () => import("../image.js"),
  create: async () =>
    fixture<VuImage>(
      html`<vu-image src="https://example.com/a.png" alt="Photo" fit="cover"></vu-image>`,
    ),
  mutate: (el, i) => {
    const host = el as VuImage;
    host.fit = i % 2 === 0 ? "contain" : "cover";
    host.loading = i % 3 === 0 ? "eager" : "lazy";
    host.decoding = i % 4 === 0 ? "sync" : "async";
    host.alt = i % 5 === 0 ? "Photo" : `Photo ${i}`;
  },
});
