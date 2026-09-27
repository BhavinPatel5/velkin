/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuTab } from "../tab.js";
import "../../icon/icon.js";

tierAPerfSuite({
  id: "vu-tab",
  tag: "vu-tab",
  load: () => Promise.all([import("../tab.js"), import("../../icon/icon.js")]),
  create: async () =>
    fixture<VuTab>(
      html`<vu-tab label="View" .states=${["list", "grid", "board"]} value="list"></vu-tab>`,
    ),
  mutate: (el, i) => {
    const states = ["list", "grid", "board"];
    (el as VuTab).value = states[i % states.length];
  },
});
