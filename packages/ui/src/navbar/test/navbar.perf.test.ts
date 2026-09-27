/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuNavbar } from "../navbar.js";

const sampleItems = [
  { id: "home", label: "Home", route: "/" },
  {
    id: "products",
    label: "Products",
    submenu: [
      { id: "catalog", label: "Catalog", route: "/products" },
      { id: "pricing", label: "Pricing", route: "/pricing" },
    ],
  },
  { id: "about", label: "About", route: "/about" },
];

tierAPerfSuite({
  id: "vu-navbar",
  tag: "vu-navbar",
  load: () =>
    Promise.all([
      import("../navbar.js"),
      import("../../icon/icon.js"),
      import("../../nav-panel/nav-panel.js"),
      import("../../drawer/drawer.js"),
    ]),
  create: async () => fixture<VuNavbar>(html`<vu-navbar .items=${sampleItems}></vu-navbar>`),
  mutate: (el, i) => {
    const host = el as VuNavbar;
    host.size = i % 2 === 0 ? "sm" : "md";
    host.tone = i % 3 === 0 ? "subtle" : "normal";
    host.indicator = i % 4 === 0 ? "pill" : "underline";
    host.sticky = i % 5 === 0;
  },
});
