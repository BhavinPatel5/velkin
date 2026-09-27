/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuNavPanel } from "../nav-panel.js";
import type { VuNavPanelItem } from "../nav-panel.types.js";

const items: VuNavPanelItem[] = [
  { label: "Home", value: "home" },
  { label: "Settings", value: "settings", category: "App" },
  { label: "Profile", value: "profile", category: "App" },
];

tierAPerfSuite({
  id: "vu-nav-panel",
  tag: "vu-nav-panel",
  load: () => import("../nav-panel.js"),
  create: async () =>
    fixture<VuNavPanel>(html`<vu-nav-panel .items=${items} value="home"></vu-nav-panel>`),
  mutate: (el, i) => {
    (el as VuNavPanel).value = i % 2 === 0 ? "home" : "settings";
  },
});
