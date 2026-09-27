/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuInput } from "../input.js";

tierAPerfSuite({
  id: "vu-input",
  tag: "vu-input",
  load: () => Promise.all([import("../input.js"), import("../../icon/icon.js")]),
  create: async () =>
    fixture<VuInput>(
      html`<vu-input label="Name" placeholder="Enter name" .value=${"a"}></vu-input>`,
    ),
  mutate: (el, i) => {
    (el as VuInput).value = `v${i}`;
  },
});
