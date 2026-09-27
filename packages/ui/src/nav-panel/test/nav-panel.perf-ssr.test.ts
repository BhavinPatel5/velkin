/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A SSR
 * @vitest-environment node
 */
import { html } from "lit";
import { tierASsrPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuNavPanelItem } from "../nav-panel.types.js";

const items: VuNavPanelItem[] = [
  { label: "Home", value: "home" },
  { label: "Settings", value: "settings" },
];

tierASsrPerfSuite({
  id: "vu-nav-panel",
  load: () => import("../nav-panel.js"),
  template: html`<vu-nav-panel .items=${items} value="home"></vu-nav-panel>`,
});
