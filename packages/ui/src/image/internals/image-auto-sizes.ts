import { canUseRaf, canUseResizeObserver } from "../../internals/utils/env.js";

/** Tracks host width and reports a `sizes` string for responsive `srcset`. */
export class ImageAutoSizes {
  private _ro: ResizeObserver | null = null;
  private _rafId: number | null = null;
  private _value = "";

  constructor(
    private readonly _host: HTMLElement,
    private readonly _onChange: (sizes: string) => void,
  ) {}

  get value(): string {
    return this._value;
  }

  start(): void {
    if (!canUseResizeObserver()) return;
    if (this._ro) return;
    this._ro = new ResizeObserver(() => this._schedule());
    this._ro.observe(this._host);
    this._schedule();
  }

  stop(): void {
    this._ro?.disconnect();
    this._ro = null;
    if (this._rafId != null && canUseRaf()) {
      cancelAnimationFrame(this._rafId);
    }
    this._rafId = null;
  }

  private _schedule(): void {
    if (this._rafId != null) return;
    if (!canUseRaf()) {
      this._publish();
      return;
    }
    this._rafId = requestAnimationFrame(() => {
      this._rafId = null;
      this._publish();
    });
  }

  private _publish(): void {
    const w = Math.ceil(this._host.getBoundingClientRect().width);
    if (w <= 0) return;
    const next = `${w}px`;
    if (next === this._value) return;
    this._value = next;
    this._onChange(next);
  }
}
