import type { IconifyCollection, IconifyIcon, IconifySetData } from "../icon.types.js";

const MAX_ICON_CACHE_SIZE = 100;
const ICONIFY_API_BASE = "https://api.iconify.design";

const iconCache = new Map<string, string>();
const iconPromiseCache = new Map<string, Promise<string>>();
const localSets = new Map<string, IconifySetData>();
const localIcons = new Map<string, IconifyIcon>();

/** Registers an Iconify-compatible local set (offline / custom prefix). */
export function registerLocalSet(prefix: string, data: IconifySetData): void {
  localSets.set(prefix, data);
  for (const key of iconCache.keys()) {
    if (key.startsWith(`${prefix}:`)) iconCache.delete(key);
  }
}

/** Registers a single local icon override at a full `prefix:name` key. */
export function registerLocalIcon(fullName: string, icon: IconifyIcon): void {
  localIcons.set(fullName, icon);
  iconCache.delete(fullName);
}

/** Builds an SVG string from Iconify glyph + collection defaults. */
export function buildIconSvg(icon: IconifyIcon, set: IconifyCollection): string {
  const body = icon.body ?? "";
  const l = icon.left ?? set.left ?? 0;
  const t = icon.top ?? set.top ?? 0;
  const w = icon.width ?? set.width ?? 24;
  const h = icon.height ?? set.height ?? 24;
  const viewBox = icon.viewBox || `${l} ${t} ${w} ${h}`;

  return `
    <svg xmlns="http://www.w3.org/2000/svg"
         viewBox="${viewBox}"
         width="100%"
         height="100%"
         preserveAspectRatio="xMidYMid meet"
         fill="currentColor"
         aria-hidden="true"
         focusable="false">
      ${body}
    </svg>
  `;
}

async function fetchRemoteIcon(full: string): Promise<string> {
  if (typeof fetch === "undefined") {
    throw new Error("Remote icon fetch unavailable");
  }

  const [prefix, iconName] = full.split(":");
  if (!prefix || !iconName) throw new Error("Invalid icon name");

  const url = `${ICONIFY_API_BASE}/${prefix}.json?icons=${encodeURIComponent(iconName)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch icon set");

  const json = (await res.json()) as IconifySetData;
  const data = json.icons?.[iconName];
  if (!data) throw new Error("Icon not found");

  return buildIconSvg(data, json);
}

async function fetchAndBuild(full: string): Promise<string> {
  const singleLocal = localIcons.get(full);
  if (singleLocal) return buildIconSvg(singleLocal, {});

  const [prefix, iconName] = full.split(":");
  if (!prefix || !iconName) throw new Error("Invalid icon name");

  const localSet = localSets.get(prefix);
  if (localSet?.icons?.[iconName]) {
    return buildIconSvg(localSet.icons[iconName], localSet);
  }

  return fetchRemoteIcon(full);
}

/** Sync lookup for registered local sets/overrides — safe for Lit SSR first paint. */
export function peekLocalIconSvg(fullName: string): string | null {
  const name = fullName.trim();
  if (!name) return null;

  /* Skip iconCache: it also stores remote Iconify fetches and would disagree with SSR. */
  const singleLocal = localIcons.get(name);
  if (singleLocal) {
    const svg = buildIconSvg(singleLocal, {});
    iconCache.set(name, svg);
    return svg;
  }

  const [prefix, iconName] = name.split(":");
  if (!prefix || !iconName) return null;
  const localSet = localSets.get(prefix);
  const data = localSet?.icons?.[iconName];
  if (!data || !localSet) return null;

  const svg = buildIconSvg(data, localSet);
  iconCache.set(name, svg);
  return svg;
}

/** Resolves an icon name to SVG markup (local set, override, then Iconify API). */
export async function resolveIconSvg(fullName: string): Promise<string> {
  const name = fullName.trim();
  if (!name) throw new Error("Icon name required");

  const local = peekLocalIconSvg(name);
  if (local) return local;
  const cached = iconCache.get(name);
  if (cached) return cached;

  let promise = iconPromiseCache.get(name);
  if (!promise) {
    promise = fetchAndBuild(name);
    iconPromiseCache.set(name, promise);
  }

  try {
    const svg = await promise;
    if (iconCache.size >= MAX_ICON_CACHE_SIZE) {
      const firstKey = iconCache.keys().next().value;
      if (firstKey != null) iconCache.delete(firstKey);
    }
    iconCache.set(name, svg);
    return svg;
  } finally {
    iconPromiseCache.delete(name);
  }
}
