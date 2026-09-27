/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuList } from "../list.js";

tierAPerfSuite({
  id: "vu-list",
  tag: "vu-list",
  load: () => Promise.all([import("../list.js"), import("../../list-item/list-item.js")]),
  create: async () =>
    fixture<VuList>(html`
      <vu-list selection="single">
        <vu-listitem value="a" label="Alpha"></vu-listitem>
      </vu-list>
    `),
  mutate: (el, i) => {
    const host = el as VuList;
    host.selection = i % 2 === 0 ? "single" : "multiple";
    host.size = i % 3 === 0 ? "sm" : "md";
    host.dense = i % 4 === 0;
    host.tone = i % 5 === 0 ? "subtle" : "normal";
  },
});
