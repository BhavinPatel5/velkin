/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuButtonGroup } from "../button-group.js";

tierAPerfSuite({
  id: "vu-button-group",
  tag: "vu-button-group",
  load: () => import("../button-group.js"),
  create: async () =>
    fixture<VuButtonGroup>(html`
      <vu-button-group label="Format" selectionmode="single" value="list">
        <vu-button value="grid">Grid</vu-button>
        <vu-button value="list">List</vu-button>
        <vu-button value="map">Map</vu-button>
      </vu-button-group>
    `),
  mutate: (el, i) => {
    const host = el as VuButtonGroup;
    host.variant = i % 2 === 0 ? "outline" : "solid";
    host.color = i % 3 === 0 ? "primary" : "default";
    host.value = i % 4 === 0 ? "grid" : "list";
    host.disabled = i % 5 === 0;
  },
});
