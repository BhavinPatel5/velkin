/**
 * Color resolution utilities for Velkin components.
 * Provides consistent color token mapping across components
 */

import { autoForegroundFor } from "./contrast-foreground.js";

export type ColorToken =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'light'
  | 'dark'
  | 'default'
  | string; // Custom CSS color

export interface ColorResolverConfig {
  /** CSS variable prefix (default: 'nu') */
  prefix?: string;
  /** Whether to use color-mix for hover states */
  useColorMix?: boolean;
}

/**
 * Default color token mapping to CSS variables
 */
export const DEFAULT_COLOR_TOKENS: Record<string, string> = {
  primary: 'var(--vu-color-accent)',
  active: 'var(--vu-color-accent)',
  secondary: 'var(--vu-color-accent)',
  success: 'var(--vu-color-success)',
  danger: 'var(--vu-color-danger)',
  warning: 'var(--vu-color-warning)',
  info: 'var(--vu-color-accent)',
  light: 'var(--vu-snow)',
  dark: 'var(--vu-eclipse)',
  /** Muted line/text; maps to `--vu-color-muted`. */
  muted: 'var(--vu-color-muted)',
  /** Light separator tone; maps to `--vu-color-separator`. */
  'border-light': 'var(--vu-color-separator)',
  default: 'var(--vu-color-default)',
} as const;

/**
 * Resolves a color token to its CSS value
 * @param input - Color token (e.g., 'primary') or custom CSS color
 * @param customMap - Optional custom token mapping (overrides defaults)
 * @returns CSS color value
 */
export function resolveColor(
  input: string,
  customMap: Record<string, string> = {}
): string {
  const map = { ...DEFAULT_COLOR_TOKENS, ...customMap };
  return map[input] || input || map.primary;
}

/** Intent / alias tokens → theme `*-foreground` (authored snow/eclipse pairs from theme-core). */
const TEXT_COLOR_BY_TOKEN: Record<string, string> = {
  primary: "var(--vu-color-accent-foreground)",
  active: "var(--vu-color-accent-foreground)",
  secondary: "var(--vu-color-accent-foreground)",
  info: "var(--vu-color-accent-foreground)",
  success: "var(--vu-color-success-foreground)",
  danger: "var(--vu-color-danger-foreground)",
  warning: "var(--vu-color-warning-foreground)",
  default: "var(--vu-color-default-foreground)",
  /* Primitive fills — no `*-foreground` twin; snow/eclipse are the contrast pair. */
  dark: "var(--vu-snow)",
  light: "var(--vu-eclipse)",
};

/**
 * Determines appropriate text color for a given background color token
 * @param input - Color token (e.g., 'primary'), resolved `var(--vu-color-*)`, or custom CSS color
 * @returns CSS color value for text
 */
export function resolveTextColorForToken(input: string): string {
  const key = input.trim();
  if (!key) return "var(--vu-color-accent-foreground)";

  const fromToken = TEXT_COLOR_BY_TOKEN[key];
  if (fromToken) return fromToken;

  /* `resolveColor("primary")` → `var(--vu-color-accent)` — map fill twin → fg twin. */
  const fillVar = key.match(/^var\(\s*(--vu-color-([a-z0-9-]+))\s*\)$/i);
  if (fillVar) {
    const name = fillVar[2];
    if (!name.endsWith("-foreground") && !name.endsWith("-soft") && !name.endsWith("-hover")) {
      return `var(--vu-color-${name}-foreground)`;
    }
  }

  return autoForegroundFor(key);
}

/**
 * Creates a hover shade using color-mix
 * @param color - Base CSS color
 * @param amount - Percentage of black to mix (0-100)
 * @returns CSS color-mix() value
 */
export function hoverShade(color: string, amount: number = 20): string {
  return `color-mix(in srgb, ${color} ${100 - amount}%, var(--vu-eclipse))`;
}
/**
 * Creates a hover shade using color-mix
 * @param color - Base CSS color
 * @param amount - Percentage of black to mix (0-100)
 * @returns CSS color-mix() value
 */
export function darkShade(color: string, amount: number = 20): string {
  return `color-mix(in srgb, ${color} ${100 - amount}%, var(--vu-eclipse))`;
}
/**
 * Creates a hover shade using color-mix
 * @param color - Base CSS color
 * @param amount - Percentage of black to mix (0-100)
 * @returns CSS color-mix() value
 */
export function lightShade(color: string, amount: number = 20): string {
  return `color-mix(in srgb, ${color} ${100 - amount}%, var(--vu-snow))`;
}


/**
 * Creates a faded/transparent version of a color
 * @param color - Base CSS color
 * @param amount - Percentage of transparency (0-100)
 * @returns CSS color-mix() value with transparency
 */
export function fadeMix(color: string, amount: number = 15): string {
  return `color-mix(in srgb, ${color} ${amount}%, transparent)`;
}

/**
 * Resolves gradient stop tokens to CSS colors
 * @param stop - Gradient stop token (e.g., 'primary 30%')
 * @returns CSS gradient stop value
 */
export function resolveGradientStop(stop: string): string {
  const match = stop.match(/^([^\s]+)(\s+.+)?$/);
  const head = match?.[1] ?? stop;
  const tail = match?.[2] ?? '';

  const resolved = DEFAULT_COLOR_TOKENS[head] || head;
  return `${resolved}${tail}`;
}

/**
 * Parses a gradient specification string
 */
export interface GradientSpec {
  kind: 'linear' | 'radial' | 'conic';
  args: string;
  stops: string[];
}

/**
 * Parses gradient specification string
 * Format: "kind@args: stop1, stop2, stop3"
 * Example: "linear@90deg: primary, secondary 50%, danger"
 * Example: "radial@circle: primary, transparent"
 */
export function parseGradientSpec(input: string): GradientSpec {
  const raw = (input || '').trim();
  const idx = raw.indexOf(':');
  let prefix = '';
  let stopsStr = raw;

  if (idx !== -1) {
    prefix = raw.slice(0, idx).trim();
    stopsStr = raw.slice(idx + 1).trim();
  }

  let kind: 'linear' | 'radial' | 'conic' = 'linear';
  let args = '90deg';

  if (prefix) {
    const [k, a] = prefix.split('@').map(s => s.trim());
    const kLower = (k || '').toLowerCase();
    if (kLower === 'linear' || kLower === 'radial' || kLower === 'conic') {
      kind = kLower;
      args = a || (kind === 'linear'
        ? '90deg'
        : kind === 'radial'
          ? 'circle'
          : 'from 0deg at 50% 50%');
    } else {
      stopsStr = raw;
    }
  }

  const stops = stopsStr
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return { kind, args, stops };
}

/**
 * Creates a CSS gradient from a specification string
 * @param specStr - Gradient specification string
 * @param fallbackColor - Fallback color if no stops provided
 * @returns CSS gradient value
 */
export function createGradient(
  specStr: string,
  fallbackColor: string = 'var(--vu-color-accent)'
): string {
  const spec = parseGradientSpec(specStr);
  const stops = (
    spec.stops.length
      ? spec.stops
      : [fallbackColor, fallbackColor]
  ).map(st => resolveGradientStop(st));

  const { kind, args } = spec;

  switch (kind) {
    case 'linear':
      return `linear-gradient(${args}, ${stops.join(', ')})`;
    case 'radial':
      return `radial-gradient(${args}, ${stops.join(', ')})`;
    case 'conic':
      return `conic-gradient(${args}, ${stops.join(', ')})`;
    default:
      return `linear-gradient(90deg, ${stops.join(', ')})`;
  }
}

/**
 * Color resolver with configuration support
 */
export class ColorResolver {
  private config: Required<ColorResolverConfig>;

  constructor(config: ColorResolverConfig = {}) {
    this.config = {
      prefix: config.prefix || "nu",
      useColorMix: config.useColorMix ?? true,
    };
  }

  /**
   * Resolves a color with prefix-aware variable names
   */
  resolve(input: string): string {
    if (input.startsWith('#')) return input;
    if (input.startsWith('rgb') || input.startsWith('hsl')) return input;
    if (input.startsWith('var(')) return input;

    const customVar = `var(--${this.config.prefix}-${input})`;
    const defaultResolved = DEFAULT_COLOR_TOKENS[input];

    return defaultResolved || customVar || DEFAULT_COLOR_TOKENS.primary;
  }

  /**
   * Gets text color for a background color
   */
  getTextColor(backgroundColor: string): string {
    return resolveTextColorForToken(backgroundColor);
  }

  /**
   * Creates a hover state color
   */
  getHoverColor(baseColor: string, darkenAmount: number = 20): string {
    if (!this.config.useColorMix) {
      // Fallback for browsers without color-mix support
      return baseColor;
    }

    return hoverShade(baseColor, darkenAmount);
  }
}

/**
 * Singleton instance for convenience
 */
export const colorResolver = new ColorResolver();

