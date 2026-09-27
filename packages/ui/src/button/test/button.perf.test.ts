/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuButton } from "../button.js";

tierAPerfSuite({
  id: "vu-button",
  tag: "vu-button",
  load: () => Promise.all([import("../button.js"), import("../../icon/icon.js")]),
  prepare: (el) => {
    el.textContent = "Save";
  },
  create: async () => fixture<VuButton>(html`<vu-button>Save</vu-button>`),
  mutate: (el, i) => {
    (el as VuButton).disabled = i % 2 === 0;
  },
});
