/**
 * Iconify/vu-icon helpers: extract icon names from code and fetch icon data for offline use.
 *
 * Usage (browser or Node):
 *   import { extractIconNames, fetchIconsForOffline, registerOfflineIcons } from '~/internals/iconify-offline';
 *   import { VuIcon } from '~/components/icon/icon';
 *
 *   // Extract icon names from a code page string
 *   const names = extractIconNames('<vu-icon icon="ion:home"></vu-icon>'); // ['ion:home']
 *
 *   // Fetch and then register in VuIcon (directly pass generated JSON)
 *   const combined = await fetchIconsForOffline(['ion:home', 'mdi:bell']);
 *   registerOfflineIcons(combined, (prefix, data) => VuIcon.registerLocalSet(prefix, data));
 *
 *   // Or from saved JSON string:
 *   const combined = JSON.parse(savedJson);
 *   registerOfflineIcons(combined, (prefix, data) => VuIcon.registerLocalSet(prefix, data));
 */

import type { IconifySetData } from "../icon/icon.types.js";

const ICONIFY_API_BASE = 'https://api.iconify.design';

/** Matches quoted "prefix:icon-name" (prefix must start with a letter so "1:3" etc. are ignored). */
const QUOTED_ICON_PATTERN = /(["'`])([a-z][a-z0-9-]*:[a-zA-Z0-9_.-]+)\1/g;

/** Fetched set payload — may include `_notFound` names missing from the API response. */
type IconifyOfflineSetData = IconifySetData & {
  prefix?: string;
  _notFound?: string[];
};

/** Combined offline data: prefix -> Iconify set data (ready for VuIcon.registerLocalSet). Skip keys starting with _ when registering. */
export type CombinedOfflineIcons = Record<string, IconifyOfflineSetData>;

export interface FetchIconsForOfflineOptions {
  /** Iconify API base URL (default: https://api.iconify.design) */
  baseUrl?: string;
}

/**
 * Extracts all icon names in "prefix:icon-name" format from a code page string.
 * Looks for icon names inside single, double, or backtick quotes (e.g. in attributes
 * like icon="ion:home", iconL='mdi:bell', or :icon="`ion:person`").
 *
 * @param codePageString - Source code string (HTML, Vue, TS, JS, etc.)
 * @returns Array of unique icon names (e.g. ["ion:home", "mdi:bell"])
 */
export function extractIconNames(codePageString: string): string[] {
  if (!codePageString || typeof codePageString !== 'string') {
    return [];
  }
  const seen = new Set<string>();
  const result: string[] = [];
  let match: RegExpExecArray | null;
  QUOTED_ICON_PATTERN.lastIndex = 0;
  while ((match = QUOTED_ICON_PATTERN.exec(codePageString)) !== null) {
    const full = match[2];
    if (full && full.includes(':') && !seen.has(full)) {
      seen.add(full);
      result.push(full);
    }
  }
  return result;
}

/**
 * Fetches icon data from the Iconify API for the given icon names, groups by prefix,
 * and returns a combined JSON object keyed by prefix for offline use.
 *
 * @param iconNames - List of icon names in "prefix:icon-name" format (e.g. ["ion:home", "mdi:bell"])
 * @param options - Optional baseUrl for the Iconify API
 * @returns Combined object: { "ion": { prefix, icons, width, height }, "mdi": { ... }, ... }
 *          Use with VuIcon.registerLocalSet(prefix, combined[prefix]) for each prefix.
 */
export async function fetchIconsForOffline(
  iconNames: string[],
  options: FetchIconsForOfflineOptions = {}
): Promise<CombinedOfflineIcons> {
  const baseUrl = (options.baseUrl || ICONIFY_API_BASE).replace(/\/$/, '');
  const byPrefix = new Map<string, string[]>();

  for (const full of iconNames) {
    const trimmed = full.trim();
    if (!trimmed || !trimmed.includes(':')) continue;
    const [prefix, name] = trimmed.split(':');
    const iconName = name?.trim();
    if (!prefix || !iconName) continue;
    // Ignore non-icon patterns (e.g. "1:3"); Iconify prefixes start with a letter
    if (!/^[a-z]/.test(prefix)) continue;
    if (!byPrefix.has(prefix)) {
      byPrefix.set(prefix, []);
    }
    const list = byPrefix.get(prefix)!;
    if (!list.includes(iconName)) {
      list.push(iconName);
    }
  }

  const combined: CombinedOfflineIcons = {};

  await Promise.all(
    Array.from(byPrefix.entries()).map(async ([prefix, names]) => {
      const iconsParam = names.join(',');
      const url = `${baseUrl}/${prefix}.json?icons=${encodeURIComponent(iconsParam)}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Iconify API error for ${prefix}: ${res.status} ${res.statusText}`);
      }
      const json = (await res.json()) as IconifyOfflineSetData;
      const returnedIcons = json.icons || {};
      const notFound = names.filter((name) => !returnedIcons[name]);
      const setData: IconifyOfflineSetData = {
        prefix,
        icons: returnedIcons,
        width: json.width,
        height: json.height,
        left: json.left,
        top: json.top,
      };
      if (notFound.length > 0) {
        setData._notFound = notFound;
      }
      combined[prefix] = setData;
    })
  );

  const hasAnyNotFound = Object.values(combined).some((set) => set._notFound && set._notFound.length > 0);
  if (hasAnyNotFound) {
    (combined as Record<string, unknown>)['_comment_notFound'] =
      'Icons listed in _notFound (per set) were not in the API response; add manually if needed.';
  }

  return combined;
}

/** Set data without _notFound / _comment (suitable for VuIcon.registerLocalSet). */
type SetDataForRegister = IconifySetData;

/**
 * Registers the generated offline JSON with VuIcon. Pass the object returned by fetchIconsForOffline
 * (or parsed from saved JSON). Skips top-level keys starting with "_" and strips _notFound from each set.
 *
 * @param combined - The combined object (from fetchIconsForOffline or JSON.parse of saved output)
 * @param register - Callback to register each set, e.g. (prefix, data) => VuIcon.registerLocalSet(prefix, data)
 */
export function registerOfflineIcons(
  combined: CombinedOfflineIcons & Record<string, unknown>,
  register: (prefix: string, data: SetDataForRegister) => void
): void {
  for (const [key, set] of Object.entries(combined)) {
    if (key.startsWith('_')) continue;
    if (!set || typeof set !== 'object' || !('icons' in set)) continue;
    const { _notFound: _unused, ...data } = set as IconifyOfflineSetData;
    register(key, data as SetDataForRegister);
  }
}
