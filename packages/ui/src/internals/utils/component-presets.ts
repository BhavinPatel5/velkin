/**
 * Component prop presets — global defaults + named bundles for vu-* CEs.
 *
 * Precedence (highest wins):
 *   explicit user prop (attribute, framework property, or marked/diverged) →
 *   named `preset` → provider `defaults` → built-in class default
 *
 * A named preset overlays `defaults` unless it sets `$inheritDefaults: false`,
 * in which case it is used standalone (keys it omits fall to the built-in).
 *
 * User-owned detection:
 * - attributes present before Lit's first reflect (and any attrs added later)
 * - props marked via `markUserSetProp`
 * - props the consumer changed after presets applied (divergence)
 * - props a framework set before first apply (current value ≠ constructor
 *   snapshot from `captureBuiltInPropSnapshot` — covers Vue/React CE property
 *   bindings that never create attributes). Overriding *back* to the exact
 *   built-in default still needs an attribute or `markUserSetProp`.
 *
 * @see vu-config-provider
 */

import { createContext } from "@lit/context";

/** Prop bag applied to a single component instance. */
export type ComponentPropBag = Record<string, unknown> & {
  /**
   * Named presets only: set `false` to ignore `defaults[component]` and use
   * this bag standalone. Omitted / `true` keeps the default layering.
   */
  $inheritDefaults?: boolean;
};

/** Reserved bag keys that configure resolution instead of naming a prop. */
const RESERVED_BAG_KEYS = new Set(["$inheritDefaults"]);

/**
 * Config keys are custom element tag names (`vu-button`).
 * Short aliases without the `vu-` prefix (`button`) are also accepted.
 */
export type ComponentPresetKey = string;

export type ComponentPresetsConfig = {
  /** Applied when the instance does not set the prop (no matching attribute). */
  defaults?: Partial<Record<ComponentPresetKey, ComponentPropBag>>;
  /** Named bundles selected via `preset="name"` on the instance. */
  presets?: Partial<
    Record<ComponentPresetKey, Record<string, ComponentPropBag>>
  >;
};

/**
 * Lookup aliases for a component key: tag name and short name.
 * `vu-button` ↔ `button`, `vu-button-group` ↔ `button-group`.
 */
export function presetKeyAliases(key: string): string[] {
  const k = String(key || "").trim();
  if (!k) return [];
  const aliases = new Set<string>([k]);
  if (k.startsWith("vu-")) aliases.add(k.slice(3));
  else aliases.add(`vu-${k}`);
  return [...aliases];
}

/** First matching bag under `defaults` / `presets` for any alias of `key`. */
export function lookupPresetSection<T>(
  section: Partial<Record<string, T>> | null | undefined,
  key: string,
): T | undefined {
  if (!section) return undefined;
  for (const alias of presetKeyAliases(key)) {
    if (Object.prototype.hasOwnProperty.call(section, alias)) {
      return section[alias];
    }
  }
  return undefined;
}

/** Merge all alias bags (short + tag) under a section key. Later aliases win. */
function mergeAliasBags(
  section: Partial<Record<string, ComponentPropBag>> | null | undefined,
  key: string,
): ComponentPropBag {
  if (!section) return {};
  let out: ComponentPropBag = {};
  for (const alias of presetKeyAliases(key)) {
    const bag = section[alias];
    if (bag) out = { ...out, ...bag };
  }
  return out;
}

function mergeAliasNamedMaps(
  section:
    | Partial<Record<string, Record<string, ComponentPropBag>>>
    | null
    | undefined,
  key: string,
): Record<string, ComponentPropBag> {
  if (!section) return {};
  const out: Record<string, ComponentPropBag> = {};
  for (const alias of presetKeyAliases(key)) {
    const named = section[alias];
    if (!named) continue;
    for (const [name, bag] of Object.entries(named)) {
      out[name] = { ...(out[name] ?? {}), ...(bag ?? {}) };
    }
  }
  return out;
}

/**
 * Canonical tag form for storage/docs: `button` → `vu-button`.
 * Already-tagged names are unchanged.
 */
export function toPresetTagKey(key: string): string {
  const k = String(key || "").trim();
  if (!k) return k;
  return k.startsWith("vu-") ? k : `vu-${k}`;
}

/** Lit context provided by `<vu-config-provider>`. */
export const configContext = createContext<ComponentPresetsConfig | null>(
  "velkin/component-presets",
);

/** camelCase / PascalCase → kebab-case attribute name. */
export function camelToKebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase();
}

/**
 * Attributes present before Lit's first reflect (captured in `PresetController`).
 * Needed so reflected class defaults (e.g. `variant="solid"`) do not look user-owned.
 */
const initialUserAttrs = new WeakMap<HTMLElement, Set<string>>();

/** Props explicitly marked user-owned (property-only writes / divergence). */
const userOwnedProps = new WeakMap<HTMLElement, Set<string>>();

/** Last values written by `applyPresetLayer` (for divergence detection). */
const lastPresetApplied = new WeakMap<HTMLElement, Map<string, unknown>>();

/**
 * Prop values at CE construction (before Vue/React assign host props).
 * Call from `PresetController` construction so field initializers are visible.
 */
const builtInPropSnapshots = new WeakMap<HTMLElement, Map<string, unknown>>();

const PRESET_SKIP_KEYS = new Set(["preset", ...RESERVED_BAG_KEYS]);

/**
 * Snapshot host attributes once (call from controller `hostConnected`, before first update).
 * Declarative HTML / early `setAttribute` calls are treated as user-owned thereafter.
 */
export function captureInitialUserAttributes(host: HTMLElement): void {
  if (initialUserAttrs.has(host)) return;
  initialUserAttrs.set(host, new Set(host.getAttributeNames()));
}

/**
 * Snapshot Lit `@property` values once during host construction (before frameworks
 * assign props). Later diffs against this map mark framework property bindings as
 * user-owned so presets do not overwrite them.
 *
 * Declare `PresetController` after the host's presettable `@property` fields so
 * those initials are already assigned when this runs. Keys still `undefined` are
 * filled by `finalizeBuiltInPropSnapshot` on connect (constructor-body defaults).
 */
export function captureBuiltInPropSnapshot(host: HTMLElement): void {
  if (builtInPropSnapshots.has(host)) return;
  const snap = new Map<string, unknown>();
  const record = host as HTMLElement & Record<string, unknown>;
  const meta = (
    host.constructor as { elementProperties?: Map<PropertyKey, unknown> }
  ).elementProperties;
  if (meta) {
    for (const prop of meta.keys()) {
      if (typeof prop !== "string" || PRESET_SKIP_KEYS.has(prop)) continue;
      snap.set(prop, record[prop]);
    }
  }
  builtInPropSnapshots.set(host, snap);
}

/**
 * Fill snapshot entries that were still `undefined` when the controller
 * constructed (e.g. defaults assigned in the host `constructor` body after the
 * controller field). Does not overwrite defined snapshot values — those are the
 * true built-ins Vue/React may have already overridden by connect time.
 */
export function finalizeBuiltInPropSnapshot(host: HTMLElement): void {
  if (!builtInPropSnapshots.has(host)) {
    captureBuiltInPropSnapshot(host);
    return;
  }
  const snap = builtInPropSnapshots.get(host)!;
  const record = host as HTMLElement & Record<string, unknown>;
  for (const [key, value] of snap) {
    if (value === undefined && record[key] !== undefined) {
      snap.set(key, record[key]);
    }
  }
}

/**
 * Merge attributes that appeared after connect (late framework bindings)
 * into the user-owned snapshot. Skip Lit reflections of constructor defaults
 * so `variant="solid"` from `@property({ reflect: true })` does not block presets.
 */
export function refreshUserAttributes(host: HTMLElement): void {
  const set = initialUserAttrs.get(host) ?? new Set<string>();
  const snap = builtInPropSnapshots.get(host);
  const record = host as HTMLElement & Record<string, unknown>;
  for (const name of host.getAttributeNames()) {
    if (set.has(name)) continue;
    let builtInReflect = false;
    if (snap) {
      for (const [prop, builtIn] of snap) {
        if (camelToKebab(prop) !== name && prop !== name) continue;
        if (record[prop] === builtIn) builtInReflect = true;
        break;
      }
    }
    if (!builtInReflect) set.add(name);
  }
  initialUserAttrs.set(host, set);
}

/**
 * Mark a prop as consumer-owned so presets will not overwrite it.
 * Use for property-only bindings (no attribute) when needed.
 */
export function markUserSetProp(host: HTMLElement, prop: string): void {
  const set = userOwnedProps.get(host) ?? new Set<string>();
  set.add(prop);
  userOwnedProps.set(host, set);
}

/**
 * True when the host had an attribute for this prop before/at apply time,
 * the prop was marked user-owned (explicit mark or post-apply divergence),
 * or a framework assigned a property that differs from the constructor snapshot
 * before presets first wrote that key.
 */
export function isUserSetProp(host: HTMLElement, prop: string): boolean {
  if (userOwnedProps.get(host)?.has(prop)) return true;
  const kebab = camelToKebab(prop);
  const initial = initialUserAttrs.get(host);
  if (initial?.has(kebab) || (kebab !== prop && initial?.has(prop))) {
    return true;
  }
  if (
    !initial &&
    (host.hasAttribute(kebab) || (kebab !== prop && host.hasAttribute(prop)))
  ) {
    return true;
  }
  // Framework CE bindings (Vue/React) set properties, not attributes.
  if (!lastPresetApplied.get(host)?.has(prop)) {
    const snap = builtInPropSnapshots.get(host);
    if (snap?.has(prop)) {
      const record = host as HTMLElement & Record<string, unknown>;
      if (record[prop] !== snap.get(prop)) return true;
    }
  }
  return false;
}

/**
 * Permanently mark props a framework changed before our first write for that key.
 */
function detectPreApplyFrameworkProps(
  host: HTMLElement,
  layer: ComponentPropBag,
): void {
  const snap = builtInPropSnapshots.get(host);
  if (!snap?.size) return;
  const applied = lastPresetApplied.get(host);
  const record = host as HTMLElement & Record<string, unknown>;
  for (const key of Object.keys(layer)) {
    if (PRESET_SKIP_KEYS.has(key) || applied?.has(key)) continue;
    if (userOwnedProps.get(host)?.has(key)) continue;
    if (!snap.has(key)) continue;
    if (record[key] !== snap.get(key)) {
      markUserSetProp(host, key);
    }
  }
}

/**
 * If the consumer changed a prop after we applied a preset value, mark it
 * user-owned so later re-applies leave it alone.
 */
function detectDivergedUserProps(host: HTMLElement): void {
  const applied = lastPresetApplied.get(host);
  if (!applied?.size) return;
  const record = host as HTMLElement & Record<string, unknown>;
  for (const [key, appliedValue] of applied) {
    if (isUserSetProp(host, key)) continue;
    if (record[key] !== appliedValue) {
      markUserSetProp(host, key);
    }
  }
}

/**
 * Deep-merge parent + child preset configs.
 * Inner provider wins per component key, then per prop / named preset.
 */
export function mergePresetsConfig(
  parent: ComponentPresetsConfig | null | undefined,
  child: ComponentPresetsConfig | null | undefined,
): ComponentPresetsConfig {
  const p = parent ?? {};
  const c = child ?? {};

  const defaults: NonNullable<ComponentPresetsConfig["defaults"]> = {};
  for (const source of [p.defaults, c.defaults]) {
    for (const [key, bag] of Object.entries(source ?? {})) {
      const tag = toPresetTagKey(key);
      defaults[tag] = { ...(defaults[tag] ?? {}), ...(bag ?? {}) };
    }
  }

  const presets: NonNullable<ComponentPresetsConfig["presets"]> = {};
  for (const source of [p.presets, c.presets]) {
    for (const [comp, named] of Object.entries(source ?? {})) {
      const tag = toPresetTagKey(comp);
      const mergedNamed: Record<string, ComponentPropBag> = {
        ...(presets[tag] ?? {}),
      };
      for (const [name, bag] of Object.entries(named ?? {})) {
        mergedNamed[name] = { ...(mergedNamed[name] ?? {}), ...(bag ?? {}) };
      }
      presets[tag] = mergedNamed;
    }
  }

  return { defaults, presets };
}

export type ResolveComponentPropsOptions<T extends Record<string, unknown>> = {
  host: HTMLElement;
  componentKey: ComponentPresetKey;
  /** Value of the instance `preset` attribute/prop. */
  presetName?: string | null;
  config?: ComponentPresetsConfig | null;
  /** Current instance values (class built-ins already applied). */
  values: T;
  /**
   * Keys eligible for preset / default substitution.
   * Omit to apply every key present in the preset layer.
   */
  keys?: Array<keyof T & string>;
};

/**
 * True when `host` is rendered inside another `vu-*` component's shadow tree
 * (library chrome), not as slotted / light-DOM content.
 *
 * Slotted children keep `getRootNode() === document` (or an outer root), so
 * provider defaults still apply. Internals like `vu-button` inside `vu-data-table`
 * must not pick up app-level `defaults['vu-button']`.
 */
export function isVuCompositeInternal(host: HTMLElement): boolean {
  if (typeof ShadowRoot === "undefined") return false;
  const root = host.getRootNode();
  if (!(root instanceof ShadowRoot)) return false;
  const tag = root.host?.localName ?? "";
  // Config/theme providers are not composites that own chrome children.
  if (tag === "vu-config-provider" || tag === "vu-theme-provider") {
    return false;
  }
  return tag.startsWith("vu-");
}

/**
 * Walk ancestors for `<vu-config-provider>` and deep-merge outer → inner.
 * Used when Lit context has not delivered a value yet (or as a reliable fallback).
 */
export function findNearestPresetsConfig(
  host: HTMLElement,
): ComponentPresetsConfig | null {
  const layers: ComponentPresetsConfig[] = [];
  let el: HTMLElement | null = host.parentElement;
  while (el) {
    if (el.localName === "vu-config-provider") {
      const provider = el as HTMLElement & {
        presets?: ComponentPresetsConfig;
        mergedConfig?: ComponentPresetsConfig;
      };
      // Prefer live `presets` so we do not depend on context publish timing.
      if (provider.mergedConfig) {
        // Nearest provider already merged its ancestors — use it and stop.
        return provider.mergedConfig;
      }
      if (provider.presets) layers.push(provider.presets);
    }
    el = el.parentElement;
  }
  if (!layers.length) return null;
  // layers collected inner→outer while walking up; merge outer first, inner last.
  return layers.reduceRight(
    (acc, layer) => mergePresetsConfig(acc, layer),
    {} as ComponentPresetsConfig,
  );
}

/**
 * Resolve the active prop bag for a component: `defaults[key]` ← `presets[key][name]`.
 * Any prop key present in that bag can be applied to the instance.
 *
 * A named preset with `$inheritDefaults: false` is used standalone, so keys it
 * omits fall through to the component built-in instead of `defaults`.
 */
export function getPresetLayer(
  config: ComponentPresetsConfig | null | undefined,
  componentKey: ComponentPresetKey,
  presetName?: string | null,
): ComponentPropBag {
  const defaults = mergeAliasBags(config?.defaults, componentKey);
  const namedMap = mergeAliasNamedMaps(config?.presets, componentKey);
  const named =
    presetName && namedMap[presetName] ? namedMap[presetName]! : null;

  const merged =
    named && named.$inheritDefaults === false
      ? { ...named }
      : { ...defaults, ...(named ?? {}) };

  for (const key of RESERVED_BAG_KEYS) delete merged[key];
  return merged;
}

/** Per-host map of prop → value before presets overwrote it (for revert). */
const presetRestoreValues = new WeakMap<HTMLElement, Map<string, unknown>>();

export type ApplyPresetLayerOptions = {
  /** Extra keys never written from presets. */
  skipKeys?: string[];
};

/**
 * Write every key from the preset layer onto the host (any component prop).
 * Skips user-owned attributes / props. Remembers prior values so removing a
 * key from the provider config restores the built-in / prior value.
 *
 * Before writing, detects divergence: if the host value no longer matches the
 * last preset-applied value, that prop is marked user-owned (property-only
 * overrides after first apply). Also locks in framework property bindings that
 * differ from the constructor snapshot before the first write for that key.
 *
 * @returns true if any host property changed
 */
export function applyPresetLayer(
  host: HTMLElement,
  layer: ComponentPropBag,
  options?: ApplyPresetLayerOptions,
): boolean {
  refreshUserAttributes(host);
  detectPreApplyFrameworkProps(host, layer);
  detectDivergedUserProps(host);

  const skip = new Set([
    ...PRESET_SKIP_KEYS,
    ...(options?.skipKeys ?? []),
  ]);
  const restore = presetRestoreValues.get(host) ?? new Map<string, unknown>();
  const applied = lastPresetApplied.get(host) ?? new Map<string, unknown>();
  let changed = false;
  const record = host as HTMLElement & Record<string, unknown>;

  // Drop / revert keys no longer provided by the layer.
  for (const key of [...restore.keys()]) {
    if (
      Object.prototype.hasOwnProperty.call(layer, key) &&
      layer[key] !== undefined
    ) {
      continue;
    }
    if (!isUserSetProp(host, key) && restore.has(key)) {
      const prev = restore.get(key);
      if (record[key] !== prev) {
        record[key] = prev;
        changed = true;
      }
    }
    restore.delete(key);
    applied.delete(key);
  }

  // Apply all keys in the layer (full prop surface — not a whitelist).
  for (const [key, value] of Object.entries(layer)) {
    if (skip.has(key) || value === undefined) continue;
    if (isUserSetProp(host, key)) {
      applied.delete(key);
      continue;
    }
    if (!restore.has(key)) {
      restore.set(key, record[key]);
    }
    if (record[key] !== value) {
      record[key] = value;
      changed = true;
    }
    applied.set(key, value);
  }

  presetRestoreValues.set(host, restore);
  lastPresetApplied.set(host, applied);
  return changed;
}

/**
 * Clear preset-applied props and restore saved built-ins (e.g. when paused in a group).
 */
export function clearAppliedPresetLayer(host: HTMLElement): boolean {
  const restore = presetRestoreValues.get(host);
  if (!restore?.size) return false;
  const record = host as HTMLElement & Record<string, unknown>;
  let changed = false;
  for (const [key, prev] of restore) {
    if (isUserSetProp(host, key)) continue;
    if (record[key] !== prev) {
      record[key] = prev;
      changed = true;
    }
  }
  restore.clear();
  lastPresetApplied.get(host)?.clear();
  return changed;
}

/**
 * Resolve effective props for styling / behavior without mutating the host.
 * When `keys` is omitted, every key in the preset layer is considered.
 * Skips keys the user set via attributes.
 */
export function resolveComponentProps<T extends Record<string, unknown>>(
  options: ResolveComponentPropsOptions<T>,
): T {
  const { host, componentKey, presetName, config, values, keys } = options;
  const layer = getPresetLayer(config, componentKey, presetName);
  const keysToApply =
    keys ?? (Object.keys(layer) as Array<keyof T & string>);

  const out = { ...values };
  for (const key of keysToApply) {
    const k = key as string;
    if (isUserSetProp(host, k)) continue;
    if (Object.prototype.hasOwnProperty.call(layer, k) && layer[k] !== undefined) {
      (out as Record<string, unknown>)[k] = layer[k];
    }
  }
  return out;
}
