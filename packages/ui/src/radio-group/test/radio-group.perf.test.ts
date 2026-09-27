/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuRadioGroup } from "../radio-group.js";

tierAPerfSuite({
  id: "vu-radio-group",
  tag: "vu-radio-group",
  load: () => Promise.all([import("../radio-group.js"), import("../../radio/radio.js")]),
  create: async () =>
    fixture<VuRadioGroup>(html`
      <vu-radio-group label="Pick" name="g">
        <vu-radio label="A" value="a"></vu-radio>
        <vu-radio label="B" value="b"></vu-radio>
      </vu-radio-group>
    `),
  mutate: (el, i) => {
    (el as VuRadioGroup).value = i % 2 === 0 ? "a" : "b";
  },
});
