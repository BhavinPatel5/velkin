import type { ReactiveController, ReactiveControllerHost } from "lit";

/** Measures natural cell content without constraining it to the virtual row's current height. */
export class TableRowHeightController implements ReactiveController {
  private observer: ResizeObserver | null = null;
  private cells = new Map<Element, number>();
  private heights = new Map<string, number>();

  constructor(private host: ReactiveControllerHost, private changed: () => void) {
    host.addController(this);
  }

  readonly observe = (element: Element | undefined): void => {
    if (!element || typeof ResizeObserver === "undefined") return;
    this.observer ??= new ResizeObserver((entries) => {
      for (const node of this.cells.keys()) {
        if (!node.isConnected) {
          this.observer?.unobserve(node);
          this.cells.delete(node);
        }
      }
      for (const entry of entries) {
        if (entry.target.isConnected) this.cells.set(entry.target, Math.ceil(entry.contentRect.height) + 1);
      }
      const next = new Map<string, number>();
      for (const [node, height] of this.cells) {
        const id = node.getAttribute("data-height-row");
        if (id !== null) next.set(id, Math.max(next.get(id) ?? 0, height));
      }
      let changed = false;
      for (const [id, height] of next) {
        if (this.heights.get(id) !== height) changed = true;
        this.heights.set(id, height);
      }
      if (changed) {
        this.changed();
        this.host.requestUpdate();
      }
    });
    this.observer.observe(element);
  };

  size(id: string, minimum: number): number {
    return Math.max(minimum, this.heights.get(id) ?? 0);
  }

  clear(): void {
    this.heights.clear();
    for (const node of this.cells.keys()) {
      this.observer?.unobserve(node);
      this.observer?.observe(node);
    }
  }

  hostDisconnected(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.cells.clear();
    this.heights.clear();
  }
}
