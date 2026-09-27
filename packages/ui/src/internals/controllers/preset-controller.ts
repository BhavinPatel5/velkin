import type { ReactiveController, ReactiveControllerHost } from "lit";
import { LitElement, type PropertyDeclaration } from "lit";
import { ContextConsumer } from "@lit/context";
import {
  applyPresetLayer,
  captureBuiltInPropSnapshot,
  captureInitialUserAttributes,
  clearAppliedPresetLayer,
  configContext,
  finalizeBuiltInPropSnapshot,
  findNearestPresetsConfig,
  getPresetLayer,
  isVuCompositeInternal,
  type ComponentPresetKey,
  type ComponentPresetsConfig,
} from "../utils/component-presets.js";
import { reflectString } from "../utils/reflect-string.js";

type PresetHost = ReactiveControllerHost &
  HTMLElement & {
    preset?: string;
  };

export type PresetControllerOptions = {
  /**
   * Config key under `defaults` / `presets`.
   * Prefer the custom element tag (`vu-button`). Defaults to `host.localName`.
   * Short aliases (`button`) resolve to the same bag.
   */
  componentKey?: ComponentPresetKey;
  /**
   * When true, clear preset-applied props (e.g. `vu-button` inside a group
   * that owns visual knobs).
   */
  isPaused?: () => boolean;
  /** Called after props are applied / cleared (e.g. mark style cache dirty). */
  onChange?: () => void;
  /** Prop names never written from presets. */
  skipKeys?: string[];
};

/**
 * Consumes nearest `<vu-config-provider>` and **assigns every prop** from the
 * active defaults + named `preset` bag onto the host (unless the user set that
 * attribute). Changing the provider config or `preset="…"` re-applies the bag.
 *
 * Hosts rendered inside another `vu-*` shadow tree (composite internals) skip
 * presets entirely so app defaults do not restyle library chrome. Slotted /
 * light-DOM instances still receive them. See `isVuCompositeInternal`.
 *
 * Timing note (Lit reactive-element ≥2): controller `hostUpdate` runs *after*
 * the host's `willUpdate` and *before* `update`/render. Components that derive
 * paint from props must rebuild in `update()`/`updated()` (not `willUpdate`),
 * or rely on the follow-up `requestUpdate` scheduled when props change.
 */
export class PresetController implements ReactiveController {
  private readonly _consumer: ContextConsumer<
    typeof configContext,
    PresetHost
  >;

  /** Bumps when context / applied props change. */
  revision = 0;

  private _lastPresetName = "";
  private _lastPaused = false;
  private _applyQueued = false;

  constructor(
    private readonly host: PresetHost,
    private readonly options: PresetControllerOptions = {},
  ) {
    this._consumer = new ContextConsumer(this.host, {
      context: configContext,
      subscribe: true,
      callback: () => {
        this._scheduleApply();
      },
    });
    this.host.addController(this);
    // Snapshot @property initials now (before Vue/React assign host props).
    // Keep this field initializer after presettable props on the host class.
    captureBuiltInPropSnapshot(this.host);
  }

  /** Tag name (or explicit override) used to look up config bags. */
  get componentKey(): ComponentPresetKey {
    return this.options.componentKey || this.host.localName || "";
  }

  /** Merged presets from context, or nearest provider via DOM walk. */
  get config(): ComponentPresetsConfig | null {
    const fromCtx = this._consumer.value;
    if (fromCtx && (fromCtx.defaults || fromCtx.presets)) {
      return fromCtx;
    }
    return findNearestPresetsConfig(this.host) ?? fromCtx ?? null;
  }

  hostConnected(): void {
    finalizeBuiltInPropSnapshot(this.host);
    captureInitialUserAttributes(this.host);
    this._scheduleApply();
  }

  hostUpdate(): void {
    const presetName = String(this.host.preset ?? "");
    const paused = this._isPaused();
    if (
      presetName !== this._lastPresetName ||
      paused !== this._lastPaused ||
      this._applyQueued
    ) {
      this._applyNow();
    }
  }

  hostDisconnected(): void {
    // ContextConsumer cleans up with the host.
  }

  /** Force re-apply (e.g. after imperative config tweaks). */
  reapply(): void {
    this._scheduleApply();
  }

  /**
   * Skip applying when `isPaused` says so, or when this host is nu composite
   * chrome (inside another `vu-*` shadow root).
   */
  private _isPaused(): boolean {
    return (
      Boolean(this.options.isPaused?.()) || isVuCompositeInternal(this.host)
    );
  }

  private _scheduleApply(): void {
    this._applyQueued = true;
    this.revision++;
    this.host.requestUpdate();
  }

  private _applyNow(): void {
    this._applyQueued = false;
    const presetName = String(this.host.preset ?? "");
    const paused = this._isPaused();
    this._lastPresetName = presetName;
    this._lastPaused = paused;

    let changed = false;
    if (paused) {
      changed = clearAppliedPresetLayer(this.host);
    } else {
      const layer = getPresetLayer(
        this.config,
        this.componentKey,
        presetName || null,
      );
      changed = applyPresetLayer(this.host, layer, {
        skipKeys: this.options.skipKeys,
      });
    }

    if (changed) {
      this.revision++;
      this.options.onChange?.();
      // Props were written during hostUpdate (after willUpdate). Lit will not
      // enqueue another update while one is pending, and the mid-update writes
      // are wiped from the pending-change map at end of update — so schedule a
      // follow-up pass for hosts that still resolve styles in willUpdate.
      queueMicrotask(() => this.host.requestUpdate());
    }
  }
}

/** Omit blank `preset` from the DOM; named values still reflect for CSS/debug. */
export const presetProperty: PropertyDeclaration = reflectString;

type LitConstructor = new (...args: any[]) => LitElement;

const PRESETS_WRAPPED = Symbol.for("velkin.withComponentPresets");

type PresetSkipCtor = {
  presetSkipKeys?: string[];
  [PRESETS_WRAPPED]?: boolean;
};

/**
 * Innermost class decorator: wrap the host so `PresetController` snapshots
 * *after* the leaf `@property` fields, then `@customElement` registers the wrap.
 *
 * Defaults arrive from `<vu-config-provider>` via `@lit/context` subscribe —
 * no `preset` attribute required. `preset="name"` only selects a named bag and
 * is omitted from the DOM while empty.
 *
 * Skip on provider hosts (`vu-config-provider`, `vu-theme-provider`, …).
 */
export function withComponentPresets<T extends LitConstructor>(Base: T): T {
  const skipCtor = Base as unknown as PresetSkipCtor;
  if (skipCtor[PRESETS_WRAPPED]) return Base;

  class WithComponentPresets extends Base {
    static properties = { preset: presetProperty };

    declare preset: string;

    // Mixin constructors must be `...args: any[]` (TS2545).
    constructor(...args: any[]) {
      super(...args);
      const host = this as unknown as PresetHost;
      if (host.preset == null) host.preset = "";
      new PresetController(host, {
        skipKeys: (this.constructor as PresetSkipCtor).presetSkipKeys,
      });
    }
  }

  (WithComponentPresets as unknown as PresetSkipCtor)[PRESETS_WRAPPED] = true;
  Object.defineProperty(WithComponentPresets, "name", { value: Base.name });
  return WithComponentPresets as T;
}

