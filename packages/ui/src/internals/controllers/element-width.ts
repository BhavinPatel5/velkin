import type { ReactiveController, ReactiveControllerHost } from "lit";
import { canUseResizeObserver } from "../utils/env.js";

/** Observes a composite host's content width without coupling responsiveness to the window. */
export class ElementWidthController implements ReactiveController {
  private observer: ResizeObserver | null = null;
  constructor(private host: ReactiveControllerHost & Element, private onWidth: (width: number) => void) {
    host.addController(this);
  }
  hostConnected(): void {
    if (!canUseResizeObserver()) return;
    this.observer = new ResizeObserver((entries) => {
      const entry = entries.find((item) => item.target === this.host);
      if (entry) this.onWidth(entry.contentRect.width);
    });
    this.observer.observe(this.host);
  }
  hostDisconnected(): void {
    this.observer?.disconnect();
    this.observer = null;
  }
}
