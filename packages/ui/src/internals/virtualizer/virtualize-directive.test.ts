import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { fixture, elementUpdated } from "@open-wc/testing";
import { describe, expect, it } from "vitest";
import { virtualize, virtualizeGrid, virtualizerRef } from "./index.js";
import { applyContentSize, laneSliceStyle, resolveScrollElement, virtualRangeKey } from "./directive-host.js";
import type { GridVirtualizer } from "./grid-virtualizer.js";
import type { Virtualizer } from "./virtualizer.js";

@customElement("test-virtualize-list")
class TestVirtualizeList extends LitElement {
  @property({ type: Number })
  count = 100;

  override render() {
    const items = Array.from({ length: this.count }, (_, i) => i);
    return html`
      <div id="viewport" style="height:200px;overflow:auto;width:100%;">
        ${virtualize({
          items,
          estimateSize: () => 40,
          overscan: 0,
          renderItem: (item) => html`<div class="row">Row ${item}</div>`,
        })}
      </div>
    `;
  }
}

@customElement("test-virtualize-grid")
class TestVirtualizeGrid extends LitElement {
  @property({ type: Number })
  rowCount = 200;

  @property({ type: Number })
  columnCount = 100;

  @property({ type: Boolean })
  measureRows = true;

  override render() {
    return html`
      <div id="viewport" style="height:200px;overflow:auto;width:320px;">
        ${virtualizeGrid({
          rowCount: this.rowCount,
          columnCount: this.columnCount,
          estimateRowSize: () => 40,
          estimateColumnSize: () => 80,
          measureRows: this.measureRows,
          rowOverscan: 0,
          columnOverscan: 0,
          renderCell: (row, col) => html`<span>${row},${col}</span>`,
        })}
      </div>
    `;
  }
}

@customElement("test-virtualize-padded")
class TestVirtualizePadded extends LitElement {
  override render() {
    const items = Array.from({ length: 80 }, (_, i) => i);
    return html`
      <div
        id="viewport"
        style="height:200px;width:240px;overflow-x:hidden;overflow-y:auto;padding:16px;box-sizing:border-box;"
      >
        ${virtualize({
          items,
          scroller: true,
          estimateSize: () => 40,
          overscan: 0,
          renderItem: (item) => html`<div class="row">Row ${item}</div>`,
        })}
      </div>
    `;
  }
}

@customElement("test-virtualize-reorder")
class TestVirtualizeReorder extends LitElement {
  @property({ type: Array })
  items: number[] = Array.from({ length: 50 }, (_, i) => i);

  override render() {
    return html`
      <div id="viewport" style="height:200px;overflow:auto;width:100%;">
        ${virtualize({
          items: this.items,
          estimateSize: () => 40,
          overscan: 0,
          keyFunction: (item) => item,
          renderItem: (item) => html`<div class="row">Row ${item}</div>`,
        })}
      </div>
    `;
  }
}

describe("virtualize directives", () => {
  it("virtualize() renders a bounded slice of rows", async () => {
    const el = await fixture<TestVirtualizeList>(
      html`<test-virtualize-list count="500"></test-virtualize-list>`,
    );
    await elementUpdated(el);
    await el.updateComplete;

    const root = el.shadowRoot!;
    const content = root.querySelector("[data-virtualize-content]") as HTMLElement;
    expect(content).toBeTruthy();

    const engine = content[virtualizerRef] as Virtualizer | undefined;
    expect(engine?.getVirtualItems().length).toBeGreaterThan(0);

    const rows = root.querySelectorAll(".row");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThan(50);
  });

  it("virtualizeGrid() exposes engine on content host", async () => {
    const el = await fixture<TestVirtualizeGrid>(
      html`<test-virtualize-grid></test-virtualize-grid>`,
    );
    await elementUpdated(el);
    await el.updateComplete;

    const content = el.shadowRoot!.querySelector("[data-virtualize-content]") as HTMLElement;
    expect(content).toBeTruthy();
    const engine = content[virtualizerRef] as GridVirtualizer | undefined;
    expect(engine?.getTotalSize().height).toBe(8000);
  });

  it("virtualizeGrid() can skip row DOM measurement for fixed-height grids", async () => {
    const el = await fixture<TestVirtualizeGrid>(
      html`<test-virtualize-grid .measureRows=${false}></test-virtualize-grid>`,
    );
    await elementUpdated(el);
    await el.updateComplete;

    const content = el.shadowRoot!.querySelector("[data-virtualize-content]") as HTMLElement;
    const engine = content[virtualizerRef] as GridVirtualizer;
    let rowMeasurements = 0;
    const originalMeasure = engine.rows.measureElement.bind(engine.rows);
    engine.rows.measureElement = (node: Element | null) => {
      rowMeasurements += 1;
      originalMeasure(node);
    };

    el.columnCount = 101;
    await elementUpdated(el);
    await el.updateComplete;

    expect(rowMeasurements).toBe(0);
    expect(engine.getTotalSize().height).toBe(8000);
  });

  it("virtualize() attaches Virtualizer on content host", async () => {
    const el = await fixture<TestVirtualizeList>(
      html`<test-virtualize-list count="20"></test-virtualize-list>`,
    );
    await elementUpdated(el);

    const content = el.shadowRoot!.querySelector("[data-virtualize-content]") as HTMLElement;
    const engine = content[virtualizerRef] as Virtualizer | undefined;
    expect(engine?.getTotalSize()).toBe(800);
  });

  it("virtualize() survives parent re-render without ChildPart errors", async () => {
    const el = await fixture<TestVirtualizeList>(
      html`<test-virtualize-list count="100"></test-virtualize-list>`,
    );
    await elementUpdated(el);

    el.count = 200;
    await elementUpdated(el);

    expect(el.shadowRoot!.querySelectorAll(".row").length).toBeGreaterThan(0);
  });

  it("virtualize() survives item reorder with keyFunction", async () => {
    const el = await fixture<TestVirtualizeReorder>(
      html`<test-virtualize-reorder></test-virtualize-reorder>`,
    );
    await elementUpdated(el);

    el.items = [...el.items].reverse();
    await elementUpdated(el);

    expect(el.shadowRoot!.querySelectorAll(".row").length).toBeGreaterThan(0);
  });
});

describe("1D virtualize cross-axis sizing", () => {
  it("fills the content host instead of locking to clientWidth", () => {
    const host = document.createElement("div");
    applyContentSize(host, 999, 4000, { fillCross: "inline" });
    expect(host.style.width).toBe("100%");
    expect(host.style.height).toBe("4000px");
  });

  it("virtualRangeKey changes when measured starts change", () => {
    const estimated = [
      { index: 0, start: 0, size: 44 },
      { index: 1, start: 46, size: 44 },
    ];
    const measured = [
      { index: 0, start: 0, size: 32 },
      { index: 1, start: 34, size: 32 },
    ];
    expect(virtualRangeKey(estimated)).not.toBe(virtualRangeKey(measured));
  });

  it("laneSliceStyle uses 100% width for a single vertical lane", () => {
    const style = laneSliceStyle({
      item: { start: 0, size: 40, lane: 0 },
      laneCount: 1,
      crossSize: 280,
      horizontal: false,
    });
    expect(style).toContain("width:100%");
    expect(style).toContain("box-sizing:border-box");
    expect(style).not.toContain("width:280px");
  });

  it("does not overwrite overflow-x:hidden when enabling the scroller", () => {
    const el = document.createElement("div");
    el.style.overflowX = "hidden";
    el.style.overflowY = "visible";
    document.body.append(el);
    resolveScrollElement(el, true);
    expect(el.style.overflow).toBe("");
    expect(el.style.overflowY).toBe("auto");
    expect(getComputedStyle(el).overflowX).toBe("hidden");
    el.remove();
  });

  it("does not size slices to the padded scroller clientWidth", async () => {
    const el = await fixture<TestVirtualizePadded>(
      html`<test-virtualize-padded></test-virtualize-padded>`,
    );
    await elementUpdated(el);

    const content = el.shadowRoot!.querySelector("[data-virtualize-content]") as HTMLElement;
    const slice = content.querySelector("[data-index]") as HTMLElement;
    expect(content.style.width).toBe("100%");
    expect(slice.style.width).toBe("100%");
  });
});
