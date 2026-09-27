/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuCheckboxGroup } from "../checkbox-group.js";

tierAPerfSuite({
  id: "vu-checkbox-group",
  tag: "vu-checkbox-group",
  load: () => import("../checkbox-group.js"),
  create: async () =>
    fixture<VuCheckboxGroup>(html`
      <vu-checkbox-group label="Channels" legend="Pick any">
        <vu-checkbox value="a" label="Email"></vu-checkbox>
        <vu-checkbox value="b" label="SMS"></vu-checkbox>
        <vu-checkbox value="c" label="Push"></vu-checkbox>
      </vu-checkbox-group>
    `),
  mutate: (el, i) => {
    const host = el as VuCheckboxGroup;
    host.variant = i % 2 === 0 ? "outline" : "default";
    host.color = i % 3 === 0 ? "success" : "primary";
    host.disabled = i % 5 === 0;
    host.values = i % 4 === 0 ? ["a"] : ["a", "b"];
  },
});
