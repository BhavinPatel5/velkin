/** Dev-only console warnings — stripped in production builds (`import.meta.env.DEV`). */

const globalKeys = new Set<string>();
let hostKeys = new WeakMap<object, Set<string>>();

/** True when the bundle is a Vite dev / vitest run. Safe when `import.meta.env` is absent (e.g. Webpack). */
export function isDevEnvironment(): boolean {
  try {
    return import.meta.env?.DEV === true;
  } catch {
    return false;
  }
}

/** Formats a custom element host as `<vu-foo>`. */
export function devTag(host: Element): string {
  return `<${host.tagName.toLowerCase()}>`;
}

/** Logs every call in dev; no-op in production. */
export function devWarn(source: string, message: string): void {
  if (!isDevEnvironment()) return;
  console.warn(formatMessage(source, message));
}

/** Logs once per process in dev; no-op in production. */
export function devWarnOnce(key: string, source: string, message: string): void {
  if (!isDevEnvironment() || globalKeys.has(key)) return;
  globalKeys.add(key);
  console.warn(formatMessage(source, message));
}

/** Logs once per host instance in dev; no-op in production. */
export function devWarnOnceForHost(
  host: object,
  key: string,
  message: string,
): void {
  if (!isDevEnvironment()) return;
  let keys = hostKeys.get(host);
  if (!keys) {
    keys = new Set();
    hostKeys.set(host, keys);
  }
  if (keys.has(key)) return;
  keys.add(key);
  console.warn(message);
}

/** Warns when an overlay opens without `aria-label` or a labelled header slot. */
export function devWarnMissingAccessibleName(
  host: Element,
  when: boolean,
  hint: string,
): void {
  if (!when) return;
  devWarnOnceForHost(
    host,
    "missing-accessible-name",
    `${devTag(host)} is missing an accessible name. ${hint}`,
  );
}

/** Warns when an attribute/property value was coerced to a fallback. */
export function devWarnInvalidPropValue(
  host: Element,
  prop: string,
  value: string,
  allowed: readonly string[],
  fallback: string,
): void {
  if (!value || value === fallback) return;
  devWarnOnceForHost(
    host,
    `invalid-${prop}:${value}`,
    `${devTag(host)} received invalid \`${prop}="${value}"\`; using "${fallback}". Allowed: ${allowed.join(", ")}.`,
  );
}

const DEFAULT_WAAPI_PROPS = ["transform", "opacity"] as const;

/** Warns when CSS transitions on the same node may fight WAAPI keyframes. */
export function devWarnWaapiCssConflict(
  source: Element,
  target: Element,
  properties: readonly string[] = DEFAULT_WAAPI_PROPS,
): void {
  if (!isDevEnvironment()) return;
  const style = getComputedStyle(target);
  const transitionProps = style.transitionProperty.split(",").map((p) => p.trim());
  const conflicts = properties.filter((prop) =>
    transitionProps.some(
      (tp) =>
        tp === "all" ||
        tp === prop ||
        (prop === "transform" && tp.startsWith("transform")),
    ),
  );
  if (conflicts.length === 0) return;
  devWarnOnce(
    `waapi-css:${source.tagName}:${conflicts.join("+")}`,
    devTag(source),
    `CSS transitions on ${conflicts.map((p) => `'${p}'`).join(" and ")} may conflict with WAAPI on the same node. Prefer theme tokens on non-animated properties or pause layout motion during exit.`,
  );
}

/** Warns when Lit layout motion and WAAPI presets run on the same host without pausing FLIP. */
export function devWarnLayoutWaapiStack(host: Element): void {
  devWarnOnceForHost(
    host,
    "layout-waapi-stack",
    `${devTag(host)} runs WAAPI enter/exit while Lit \`animate()\` is active. Call \`_layoutAnim.setMotionDisabled(true)\` before the WAAPI exit (see vu-alert / vu-chip).`,
  );
}

/** @internal Resets warn-once caches — for unit tests only. */
export function resetDevWarningsForTests(): void {
  globalKeys.clear();
  hostKeys = new WeakMap();
}

function formatMessage(source: string, message: string): string {
  const tag = source.startsWith("<") ? source : `<${source}>`;
  return `${tag} ${message}`;
}
