/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";

tierASsrPerfSuite({
  id: "vu-video",
  load: () => Promise.all([import("../video.js"), import("../../icon/icon.js")]),
  template: html`<vu-video src="https://example.com/x.mp4" label="Sample"></vu-video>`,
});
