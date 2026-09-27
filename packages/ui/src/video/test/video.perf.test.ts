/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuVideo } from "../video.js";

tierAPerfSuite({
  id: "vu-video",
  tag: "vu-video",
  load: () => Promise.all([import("../video.js"), import("../../icon/icon.js")]),
  create: async () => fixture<VuVideo>(html`<vu-video label="Clip" controls></vu-video>`),
  mutate: (el, i) => {
    (el as VuVideo).muted = i % 2 === 0;
  },
});
