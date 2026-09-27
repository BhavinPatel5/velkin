/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import { VuIcon } from "../icon.js";

tierAPerfSuite({
  id: "vu-icon",
  tag: "vu-icon",
  load: () => import("../icon.js"),
  prepare: (el) => {
    (el as VuIcon).icon = "mdi:home";
  },
  create: async () => fixture<VuIcon>(html`<vu-icon icon="mdi:home"></vu-icon>`),
  mutate: (el, i) => {
    (el as VuIcon).icon = i % 2 === 0 ? "mdi:home" : "mdi:close";
  },
});
