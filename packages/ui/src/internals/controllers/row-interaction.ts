import type { ReactiveController, ReactiveControllerHost } from "lit";

/** Shares pointer and focus highlights between virtualized fragments with the same row id. */
export class RowInteractionController implements ReactiveController {
  private root: HTMLElement | null = null;
  private observer: MutationObserver | null = null;
  private hovered: string | null = null;
  private focused: string | null = null;

  constructor(host: ReactiveControllerHost) { host.addController(this); }

  bind(root: HTMLElement | null): void {
    if (root === this.root) return;
    this.hostDisconnected();
    this.root = root;
    if (!root) return;
    root.addEventListener("pointerover", this.onPointerOver);
    root.addEventListener("pointerout", this.onPointerOut);
    root.addEventListener("focusin", this.onFocusIn);
    root.addEventListener("focusout", this.onFocusOut);
    root.addEventListener("scroll", this.onScroll, { passive: true });
    if (typeof MutationObserver !== "undefined") {
      this.observer = new MutationObserver(() => this.sync());
      this.observer.observe(root, { childList: true, subtree: true });
    }
  }

  private row(target: EventTarget | null): string | null {
    if (!(target instanceof Element)) return null;
    const cell = target.closest("[data-row-id]");
    return cell && this.root?.contains(cell) ? cell.getAttribute("data-row-id") : null;
  }

  private eventRow(event: Event): string | null {
    for (const target of event.composedPath()) {
      const row = this.row(target);
      if (row !== null) return row;
    }
    return null;
  }

  private onPointerOver = (event: PointerEvent): void => {
    if (event.pointerType === "touch") return;
    const row = this.eventRow(event);
    if (row === this.hovered) return;
    this.hovered = row;
    this.sync();
  };

  private onPointerOut = (event: PointerEvent): void => {
    const row = this.row(event.relatedTarget);
    if (row === this.hovered) return;
    this.hovered = row;
    this.sync();
  };

  private onFocusIn = (event: FocusEvent): void => {
    this.focused = this.eventRow(event);
    this.sync();
  };

  private onFocusOut = (event: FocusEvent): void => {
    this.focused = this.row(event.relatedTarget);
    this.sync();
  };

  private onScroll = (): void => {
    if (this.hovered === null) return;
    this.hovered = null;
    this.sync();
  };

  private sync(): void {
    const active = this.root?.querySelector<HTMLElement>(".cell--active[id]");
    if (active) this.root?.setAttribute("aria-activedescendant", active.id);
    else this.root?.removeAttribute("aria-activedescendant");
    for (const cell of this.root?.querySelectorAll<HTMLElement>("[data-row-id]") ?? []) {
      const row = cell.getAttribute("data-row-id");
      cell.toggleAttribute("data-row-hover", this.hovered !== null && row === this.hovered);
      cell.toggleAttribute("data-row-focus", this.focused !== null && row === this.focused);
    }
  }

  hostDisconnected(): void {
    this.observer?.disconnect();
    this.observer = null;
    const root = this.root;
    root?.removeEventListener("pointerover", this.onPointerOver);
    root?.removeEventListener("pointerout", this.onPointerOut);
    root?.removeEventListener("focusin", this.onFocusIn);
    root?.removeEventListener("focusout", this.onFocusOut);
    root?.removeEventListener("scroll", this.onScroll);
    this.hovered = this.focused = null;
    this.sync();
    this.root = null;
  }
}
