/** Pure helpers for converting between HSV, HSL, RGB, and hex.
 *
 * The library uses HSV internally for color picking (saturation × value pad,
 * hue ring, alpha channel) because HSV is the model that matches user mental
 * models of "pick a hue, then pick how dark / how vivid". HSL conversion is
 * provided so we can emit `hsl()` strings (better browser color-mix support
 * than `hsv()`, which doesn't exist in CSS), and hex / rgb for inputs and
 * eyedropper-style integrations.
 *
 * All functions are pure, allocation-free except for their return values, and
 * never throw — out-of-range inputs are clamped at the boundary instead. */

export type RGB = { r: number; g: number; b: number };
export type HSV = { h: number; s: number; v: number };
export type HSL = { h: number; s: number; l: number };

/** Clamp a number to the inclusive `[lo, hi]` range — used at every public boundary so consumers can't smuggle NaN / Infinity into the math. */
export const clamp = (value: number, lo: number, hi: number): number =>
  value < lo ? lo : value > hi ? hi : value;

/** Round to N decimal places without `toFixed` parsing. Used to keep emitted colors stable across renders (avoids `0.7000000001`). */
const round = (value: number, decimals = 0): number => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/** Convert HSV (h: 0–360, s/v: 0–100) to RGB (each: 0–255). */
export function hsvToRgb(h: number, s: number, v: number): RGB {
  const hh = ((clamp(h, 0, 360) % 360) + 360) % 360;
  const ss = clamp(s, 0, 100) / 100;
  const vv = clamp(v, 0, 100) / 100;

  const c = vv * ss;
  const segment = hh / 60;
  const x = c * (1 - Math.abs((segment % 2) - 1));
  const m = vv - c;

  let r: number;
  let g: number;
  let b: number;
  if (segment < 1) [r, g, b] = [c, x, 0];
  else if (segment < 2) [r, g, b] = [x, c, 0];
  else if (segment < 3) [r, g, b] = [0, c, x];
  else if (segment < 4) [r, g, b] = [0, x, c];
  else if (segment < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/** Convert RGB to HSL (h: 0–360, s/l: 0–100) via the library's HSV intermediate. */
export function rgbToHsl(rgb: RGB): HSL {
  const { h, s, v } = rgbToHsv(rgb);
  return hsvToHsl(h, s, v);
}

/** Convert HSL (h: 0–360, s/l: 0–100) to HSV (h: 0–360, s/v: 0–100). */
export function hslToHsv(h: number, s: number, l: number): HSV {
  return rgbToHsv(hslToRgb(h, s, l));
}

/** Convert HSV (h: 0–360, s/v: 0–100) to HSL (h: 0–360, s/l: 0–100). */
export function hsvToHsl(h: number, s: number, v: number): HSL {
  const hh = ((clamp(h, 0, 360) % 360) + 360) % 360;
  const ss = clamp(s, 0, 100) / 100;
  const vv = clamp(v, 0, 100) / 100;

  const l = vv * (1 - ss / 2);
  const slDenom = Math.min(l, 1 - l);
  const sl = slDenom === 0 ? 0 : (vv - l) / slDenom;

  return { h: round(hh, 2), s: round(sl * 100, 2), l: round(l * 100, 2) };
}

/** Convert RGB (each: 0–255) to a 6-digit hex string with leading `#`. */
export function rgbToHex({ r, g, b }: RGB): string {
  const hex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}

/** Convert RGB (each: 0–255) to HSV (h: 0–360, s/v: 0–100). */
export function rgbToHsv({ r, g, b }: RGB): HSV {
  const rr = clamp(r, 0, 255) / 255;
  const gg = clamp(g, 0, 255) / 255;
  const bb = clamp(b, 0, 255) / 255;

  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rr) h = 60 * (((gg - bb) / delta) % 6);
    else if (max === gg) h = 60 * ((bb - rr) / delta + 2);
    else h = 60 * ((rr - gg) / delta + 4);
  }
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : delta / max;
  return { h: round(h, 2), s: round(s * 100, 2), v: round(max * 100, 2) };
}

/** Parse a 3-, 4-, 6-, or 8-digit hex string into RGB. Returns `null` for invalid input — callers decide whether to fall back. */
export function hexToRgb(hex: string): RGB | null {
  const trimmed = hex.trim().replace(/^#/, "");
  let normalized: string | null = null;
  if (/^[0-9a-fA-F]{3}$/.test(trimmed)) {
    normalized = trimmed
      .split("")
      .map((c) => c + c)
      .join("");
  } else if (/^[0-9a-fA-F]{4}$/.test(trimmed)) {
    normalized = trimmed
      .slice(0, 3)
      .split("")
      .map((c) => c + c)
      .join("");
  } else if (/^[0-9a-fA-F]{6}$/.test(trimmed)) {
    normalized = trimmed;
  } else if (/^[0-9a-fA-F]{8}$/.test(trimmed)) {
    normalized = trimmed.slice(0, 6);
  }
  if (!normalized) return null;
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
  };
}

/** Format an HSL triple as a CSS `hsl()` string with rounded components — safe to use everywhere CSS accepts a color. */
export function hslToCss({ h, s, l }: HSL): string {
  return `hsl(${round(h)} ${round(s)}% ${round(l)}%)`;
}

/** Format an HSL triple with alpha as a CSS `hsl()` string. Alpha is clamped to `[0, 1]`. */
export function hslaToCss({ h, s, l }: HSL, alpha: number): string {
  return `hsl(${round(h)} ${round(s)}% ${round(l)}% / ${round(clamp(alpha, 0, 1), 3)})`;
}

/** Format an RGB triple (with optional alpha) as a CSS `rgb()` string using the modern slash-separated syntax. */
export function rgbToCss({ r, g, b }: RGB, alpha = 1): string {
  const hasAlpha = alpha < 1;
  if (hasAlpha) {
    return `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)} / ${round(clamp(alpha, 0, 1), 3)})`;
  }
  return `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`;
}

/** Format an 8-digit hex string `#rrggbbaa` when alpha < 1, otherwise the 6-digit form. */
export function rgbToHexA(rgb: RGB, alpha = 1): string {
  const a = clamp(alpha, 0, 1);
  if (a >= 1) return rgbToHex(rgb);
  const aa = Math.round(a * 255)
    .toString(16)
    .padStart(2, "0");
  return `${rgbToHex(rgb)}${aa}`;
}

/** Parsed CSS color result: RGB plus optional alpha. */
export type ParsedColor = { rgb: RGB; alpha: number };

/** Parse the most common CSS color forms — hex (3/4/6/8), rgb()/rgba(), hsl()/hsla(), and the named colors via a one-off canvas measurement. Returns `null` for unparseable input so the caller can fall back. */
export function parseCssColor(input: string): ParsedColor | null {
  const raw = input.trim().toLowerCase();
  if (!raw) return null;

  if (raw.startsWith("#")) {
    const trimmed = raw.replace(/^#/, "");
    if (/^[0-9a-f]{4}$/.test(trimmed)) {
      const expanded = trimmed
        .split("")
        .map((c) => c + c)
        .join("");
      return {
        rgb: {
          r: parseInt(expanded.slice(0, 2), 16),
          g: parseInt(expanded.slice(2, 4), 16),
          b: parseInt(expanded.slice(4, 6), 16),
        },
        alpha: parseInt(expanded.slice(6, 8), 16) / 255,
      };
    }
    if (/^[0-9a-f]{8}$/.test(trimmed)) {
      return {
        rgb: {
          r: parseInt(trimmed.slice(0, 2), 16),
          g: parseInt(trimmed.slice(2, 4), 16),
          b: parseInt(trimmed.slice(4, 6), 16),
        },
        alpha: parseInt(trimmed.slice(6, 8), 16) / 255,
      };
    }
    const rgb = hexToRgb(raw);
    return rgb ? { rgb, alpha: 1 } : null;
  }

  /* Functional notation — accept both modern (space-separated) and legacy
     (comma-separated) syntax for rgb / rgba / hsl / hsla. */
  const fn = raw.match(/^(rgba?|hsla?)\s*\(([^)]+)\)$/);
  if (fn) {
    const [, name, body] = fn;
    const parts = body
      .replace(/\//g, ",")
      .split(/[,\s]+/)
      .filter(Boolean);
    if (name.startsWith("rgb")) {
      if (parts.length < 3) return null;
      const r = parseColorComponent(parts[0], 255);
      const g = parseColorComponent(parts[1], 255);
      const b = parseColorComponent(parts[2], 255);
      const a = parts[3] !== undefined ? parseAlpha(parts[3]) : 1;
      return r === null || g === null || b === null || a === null
        ? null
        : { rgb: { r, g, b }, alpha: a };
    }
    if (name.startsWith("hsl")) {
      if (parts.length < 3) return null;
      const h = parseHueComponent(parts[0]);
      const s = parsePercentComponent(parts[1]);
      const l = parsePercentComponent(parts[2]);
      const a = parts[3] !== undefined ? parseAlpha(parts[3]) : 1;
      if (h === null || s === null || l === null || a === null) return null;
      return { rgb: hslToRgb(h, s, l), alpha: a };
    }
  }

  /* Named colors / `transparent` / anything else CSS understands — bounce off
     a hidden canvas and read the parsed pixel back. Cheap, runs once per
     unrecognized input, and falls back gracefully when no canvas is available
     (e.g. SSR). */
  const fromCanvas = parseViaCanvas(raw);
  if (fromCanvas) return fromCanvas;

  return null;
}

/** Parse CSS colors the canvas path misses (oklch, color-mix) via computed-style probe. */
export function resolveCssColor(input: string, probeRoot?: ParentNode | null): ParsedColor | null {
  const direct = parseCssColor(input);
  if (direct) return direct;
  if (typeof document === "undefined") return null;

  const trimmed = input.trim();
  if (!trimmed || trimmed === "transparent") return null;

  const probe = document.createElement("div");
  if (!probe.style) return null;
  probe.style.cssText = "position:fixed;left:-9999px;top:0;background:" + trimmed;
  const mount = probeRoot ?? (typeof document !== "undefined" ? document.body : null);
  if (!mount) return null;
  mount.appendChild(probe);
  const resolved = getComputedStyle(probe).backgroundColor;
  probe.remove();
  if (!resolved || resolved === "rgba(0, 0, 0, 0)") return null;
  return parseCssColor(resolved);
}

/** Convert HSL (h: 0–360, s/l: 0–100) to RGB (each: 0–255). Used inside `parseCssColor`; exposed for symmetry with the HSV helpers. */
export function hslToRgb(h: number, s: number, l: number): RGB {
  const hh = ((clamp(h, 0, 360) % 360) + 360) % 360;
  const ss = clamp(s, 0, 100) / 100;
  const ll = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const segment = hh / 60;
  const x = c * (1 - Math.abs((segment % 2) - 1));
  const m = ll - c / 2;
  let r: number;
  let g: number;
  let b: number;
  if (segment < 1) [r, g, b] = [c, x, 0];
  else if (segment < 2) [r, g, b] = [x, c, 0];
  else if (segment < 3) [r, g, b] = [0, c, x];
  else if (segment < 4) [r, g, b] = [0, x, c];
  else if (segment < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/** CSS background image for the classic transparency checkerboard. Used behind alpha-aware swatches and the alpha slider so transparency reads visually instead of disappearing into the surface. */
export const CHECKERBOARD_BACKGROUND =
  "linear-gradient(45deg, color-mix(in oklab, currentColor 14%, transparent) 25%, transparent 25%, transparent 75%, color-mix(in oklab, currentColor 14%, transparent) 75%), " +
  "linear-gradient(45deg, color-mix(in oklab, currentColor 14%, transparent) 25%, transparent 25%, transparent 75%, color-mix(in oklab, currentColor 14%, transparent) 75%)";

/** Background-position pair that pairs with `CHECKERBOARD_BACKGROUND` to produce the diagonal-shifted offset that makes the squares look correct. */
export const CHECKERBOARD_POSITION = "0 0, 5px 5px";

/** Background-size pair to use with `CHECKERBOARD_BACKGROUND`. 10px squares are the de-facto convention from Photoshop / Figma. */
export const CHECKERBOARD_SIZE = "10px 10px";

/* ---------- internal parsing helpers ---------- */

function parseColorComponent(input: string, scale: number): number | null {
  if (input.endsWith("%")) {
    const n = Number(input.slice(0, -1));
    if (!Number.isFinite(n)) return null;
    return Math.round(clamp(n, 0, 100) * (scale / 100));
  }
  const n = Number(input);
  if (!Number.isFinite(n)) return null;
  return Math.round(clamp(n, 0, scale));
}

function parseHueComponent(input: string): number | null {
  const stripped = input.replace(/(deg|rad|grad|turn)$/, "");
  const n = Number(stripped);
  if (!Number.isFinite(n)) return null;
  if (input.endsWith("rad")) return ((n * 180) / Math.PI) % 360;
  if (input.endsWith("grad")) return (n * 0.9) % 360;
  if (input.endsWith("turn")) return (n * 360) % 360;
  return ((n % 360) + 360) % 360;
}

function parsePercentComponent(input: string): number | null {
  const stripped = input.endsWith("%") ? input.slice(0, -1) : input;
  const n = Number(stripped);
  if (!Number.isFinite(n)) return null;
  return clamp(n, 0, 100);
}

function parseAlpha(input: string): number | null {
  if (input.endsWith("%")) {
    const n = Number(input.slice(0, -1));
    if (!Number.isFinite(n)) return null;
    return clamp(n / 100, 0, 1);
  }
  const n = Number(input);
  if (!Number.isFinite(n)) return null;
  return clamp(n, 0, 1);
}

function parseViaCanvas(input: string): ParsedColor | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  if (typeof canvas.getContext !== "function") return null;
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#000";
  ctx.fillStyle = input;
  /* The browser silently keeps the previous fillStyle when input is invalid,
     so a "did the assignment stick?" check via re-read filters bad inputs. */
  if (ctx.fillStyle === "#000000" && input.replace(/\s/g, "") !== "#000000") {
    ctx.fillStyle = "#fff";
    ctx.fillStyle = input;
    if (ctx.fillStyle === "#ffffff" && input.replace(/\s/g, "") !== "#ffffff") {
      return null;
    }
  }
  ctx.fillRect(0, 0, 1, 1);
  const data = ctx.getImageData(0, 0, 1, 1).data;
  return {
    rgb: { r: data[0], g: data[1], b: data[2] },
    alpha: data[3] / 255,
  };
}
