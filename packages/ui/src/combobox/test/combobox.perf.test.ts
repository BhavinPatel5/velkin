/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuCombobox } from "../combobox.js";

tierAPerfSuite({
  id: "vu-combobox",
  tag: "vu-combobox",
  load: () =>
    Promise.all([
      import("../combobox.js"),
      import("../../icon/icon.js"),
      import("../../checkbox/checkbox.js"),
    ]),
  create: async () =>
    fixture<VuCombobox>(
      html`<vu-combobox label="Fruit" .options=${["Apple", "Banana", "Cherry"]}></vu-combobox>`,
    ),
  mutate: (el, i) => {
    const c = el as VuCombobox;
    c.value = i % 2 === 0 ? "Apple" : "Banana";
  },
});
