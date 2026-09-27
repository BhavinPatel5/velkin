/**
 * Perf: tests/PERFORMANCE-BENCHMARKS.md — Tier A
 * @vitest-environment jsdom
 */
import { fixture, html } from "@open-wc/testing";
import { tierAPerfSuite } from "../../../internals/test/performance-suite.js";
import type { VuPagination } from "../pagination.js";

tierAPerfSuite({
  id: "vu-pagination",
  tag: "vu-pagination",
  load: () =>
    Promise.all([
      import("../pagination.js"),
      import("../../icon/icon.js"),
      import("../../spinner/spinner.js"),
    ]),
  create: async () =>
    fixture<VuPagination>(
      html`<vu-pagination .totalPages=${12} .currentPage=${4}></vu-pagination>`,
    ),
  mutate: (el, i) => {
    (el as VuPagination).currentPage = (i % 12) + 1;
  },
});
