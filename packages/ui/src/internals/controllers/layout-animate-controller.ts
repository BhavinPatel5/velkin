import type { ReactiveController, ReactiveControllerHost } from "lit";
import { AnimateController as LitAnimateController } from "@lit-labs/motion";
import { prefersReducedMotion } from "../utils/motion.js";
import { vuLayoutDefaultOptions, type VuAnimateOptions } from "../utils/lit-animate.js";

const layoutByHost = new WeakMap<object, LayoutAnimateController>();

/** Returns the layout controller registered on a host, if any. */
export function getLayoutAnimateController(host: object): LayoutAnimateController | undefined {
  return layoutByHost.get(host);
}

/** True when the host has layout motion paused for WAAPI exit. */
export function isLayoutMotionSuppressed(host: object): boolean {
  return layoutByHost.get(host)?.isMotionSuppressed() ?? false;
}

/** True when the host coordinates Lit `animate()` directives. */
export function hostHasLayoutAnimateController(host: object): boolean {
  return layoutByHost.has(host);
}

/**
 * Coordinates Lit layout animate() directives on a host with theme motion
 * defaults and live reduced-motion sync. Distinct from WAAPI AnimationController.
 */
export class LayoutAnimateController implements ReactiveController {
  readonly host: ReactiveControllerHost;
  readonly lit: LitAnimateController;
  private extraDisabled = false;

  constructor(host: ReactiveControllerHost, options: VuAnimateOptions = {}) {
    this.host = host;
    layoutByHost.set(host, this);
    const scope = typeof Element !== "undefined" && host instanceof Element ? host : null;
    this.lit = new LitAnimateController(host, {
      defaultOptions: vuLayoutDefaultOptions(scope, options),
    });
    host.addController(this);
    this.syncReducedMotion();
  }

  hostDisconnected(): void {
    layoutByHost.delete(this.host);
  }

  hostUpdated(): void {
    this.syncReducedMotion();
  }

  /** Pauses layout animation (e.g. while WAAPI exit runs on the same surface). */
  setMotionDisabled(disabled: boolean): void {
    this.extraDisabled = disabled;
    this.syncReducedMotion();
  }

  /** True when layout FLIP is paused for WAAPI on the same surface. */
  isMotionSuppressed(): boolean {
    return this.extraDisabled;
  }

  private syncReducedMotion(): void {
    this.lit.disabled = prefersReducedMotion() || this.extraDisabled;
  }
}
