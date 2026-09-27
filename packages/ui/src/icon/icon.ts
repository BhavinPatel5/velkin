import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { resolveColor } from "../internals/utils/color-resolver.js";
import { isClient } from "../internals/utils/env.js";
import ionLocalSetData from "./ion-local.json";
import { iconStyles } from "./icon.style.js";
import {
  peekLocalIconSvg,
  registerLocalIcon,
  registerLocalSet,
  resolveIconSvg,
} from "./internals/icon-data.js";
import type {
  IconifyIcon,
  IconifySetData,
  VuIconFlip,
  VuIconRotateValue,
  VuIconSizeValue,
} from "./icon.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  IconifyIcon,
  IconifySetData,
  VuIconFlip,
  VuIconRotateValue,
  VuIconSizeValue,
} from "./icon.types.js";

/**
 * @element vu-icon
 *
 * @summary An icon component with offline sets, lazy loading, and SVG fallback.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/icon
 *
 * @slot - Fallback `<svg>` when remote/local icon data is unavailable.
 *
 * @property {string} icon - Icon name in `prefix:icon-name` format.
 * @property {VuIconSizeValue} width - Icon width. Default: `1em` when height is also unset.
 * @property {VuIconSizeValue} height - Icon height. Default: `1em` when width is also unset.
 * @property {string} color - Icon color. Default: `"currentColor"`.
 * @property {boolean} inline - Inline alignment tweak for text contexts. Default: `false`.
 * @property {VuIconFlip} flip - Flip transform descriptor.
 * @property {boolean} hFlip - Horizontal flip shortcut. Default: `false`.
 * @property {boolean} vFlip - Vertical flip shortcut. Default: `false`.
 * @property {VuIconRotateValue} rotate - Rotation descriptor (quarter turns or `deg`).
 * @property {boolean} lazy - Defers loading until visible. Default: `false`.
 *
 * @method registerLocalSet - Registers a local Iconify set for offline/custom usage.
 * @method registerLocalIcon - Registers a single local icon override.
 *
 * @csspart icon - Icon container wrapping the SVG or slot.
 */
@customElement("vu-icon")
@withComponentPresets
export class VuIcon extends LitElement {
  static override styles = iconStyles;

  /** Registers a local Iconify set for offline/custom usage. */
  static registerLocalSet(prefix: string, data: IconifySetData): void {
    registerLocalSet(prefix, data);
  }

  /** Registers a single local icon override at a full `prefix:name` key. */
  static registerLocalIcon(fullName: string, icon: IconifyIcon): void {
    registerLocalIcon(fullName, icon);
  }

  /** Icon name in `prefix:icon-name` format. */
  @property({ type: String })
  icon = "";

  /** Icon width — CSS length or unitless px. */
  @property({ type: String })
  width: VuIconSizeValue = "";

  /** Icon height — CSS length or unitless px. */
  @property({ type: String })
  height: VuIconSizeValue = "";

  /** Icon color. */
  @property({ type: String })
  color = "currentColor";

  /** Inline alignment tweak for text contexts. */
  @property({ type: Boolean })
  inline = false;

  /** Flip transform descriptor. */
  @property({ type: String })
  flip: VuIconFlip = "";

  /** Horizontal flip shortcut. */
  @property({ type: Boolean })
  hFlip = false;

  /** Vertical flip shortcut. */
  @property({ type: Boolean })
  vFlip = false;

  /** Rotation — quarter turns (number), `deg` string, or numeric string. */
  @property({ type: String })
  rotate: VuIconRotateValue = "0";

  /** Defers icon fetch until the host is visible. */
  @property({ type: Boolean })
  lazy = false;

  @state()
  private _svgContent: string | null = null;

  @state()
  private _hasSlottedSvg = false;

  private _observer: IntersectionObserver | null = null;
  private _visible = false;

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.lazy) {
      this._startObserver();
      return;
    }
    this._visible = true;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._stopObserver();
  }

  protected override firstUpdated(): void {
    this._paintSvg();
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has("lazy")) {
      if (this.lazy) {
        this._startObserver();
      } else {
        this._stopObserver();
        this._visible = true;
        if (this.icon && !this._hasSlottedSvg) void this._loadIcon();
      }
    }

    if (changed.has("icon")) {
      if (this._hasSlottedSvg) {
        this._setSvgContent(null);
      } else if (!this.lazy || this._visible) {
        void this._loadIcon();
      } else {
        this._setSvgContent(null);
      }
    }
    this._paintSvg();
  }

  private _onSlotChange(e: Event): void {
    const slot = e.target as HTMLSlotElement;
    const nodes = slot.assignedNodes({ flatten: true });
    const hasSvg = nodes.some(
      (n) => n.nodeType === Node.ELEMENT_NODE && (n as Element).tagName.toUpperCase() === "SVG",
    );
    if (this._hasSlottedSvg === hasSvg) return;

    this._hasSlottedSvg = hasSvg;
    if (hasSvg && this.icon) {
      this._setSvgContent(null);
      return;
    }
    if (!hasSvg && this.icon && (this._visible || !this.lazy)) {
      void this._loadIcon();
    }
  }

  private _startObserver(): void {
    if (!isClient()) return;
    if (this._observer || !("IntersectionObserver" in window)) return;

    this._observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      this._visible = true;
      if (!this._hasSlottedSvg && this.icon) void this._loadIcon();
      this._stopObserver();
    });
    this._observer.observe(this);
  }

  private _stopObserver(): void {
    this._observer?.disconnect();
    this._observer = null;
  }

  private _paintSvg(): void {
    if (!isClient()) return;
    const span = this.renderRoot.querySelector(".iconify");
    if (!(span instanceof HTMLElement)) return;
    const name = this.icon.trim();
    const svg = this._hasSlottedSvg ? null : (this._svgContent ?? peekLocalIconSvg(name));
    const next = svg ?? "";
    if (span.innerHTML !== next) span.innerHTML = next;
  }

  private _setSvgContent(svg: string | null): void {
    if (this._svgContent === svg) return;
    queueMicrotask(() => {
      this._svgContent = svg;
    });
  }

  private async _loadIcon(): Promise<void> {
    const name = this.icon.trim();
    if (!name) {
      this._setSvgContent(null);
      return;
    }

    try {
      const svg = await resolveIconSvg(name);
      this._setSvgContent(svg);
    } catch {
      this._setSvgContent(null);
    }
  }

  private _normalize(v: string | number): string {
    if (typeof v === "number") return `${v}px`;
    if (/^\d+$/.test(v)) return `${v}px`;
    return v;
  }

  private _rotationDeg(): number {
    const v = this.rotate;
    if (typeof v === "number") return v * 90;
    if (typeof v === "string") {
      if (v.endsWith("deg")) return parseFloat(v);
      const n = parseInt(v, 10);
      return Number.isFinite(n) ? n * 90 : 0;
    }
    return 0;
  }

  private _flipHas(val: "horizontal" | "vertical"): boolean {
    return this.flip
      .split(",")
      .map((part) => part.trim().toLowerCase())
      .includes(val);
  }

  private _transform(): string {
    const deg = this._rotationDeg();
    const h = this.hFlip || this._flipHas("horizontal");
    const v = this.vFlip || this._flipHas("vertical");
    const parts: string[] = [];
    if (deg) parts.push(`rotate(${deg}deg)`);
    if (h || v) parts.push(`scale(${h ? -1 : 1}, ${v ? -1 : 1})`);
    return parts.join(" ");
  }

  private _baseStyle(): Record<string, string> {
    const style: Record<string, string> = { color: resolveColor(this.color) };
    if (this.width) style.width = this._normalize(this.width);
    if (this.height) style.height = this._normalize(this.height);
    if (!this.width && !this.height) {
      style.width = "1em";
      style.height = "1em";
    }
    if (this.inline) style.verticalAlign = "-0.125em";
    return style;
  }

  override render() {
    const style = this._baseStyle();
    const transform = this._transform();
    if (transform) style.transform = transform;

    const name = this.icon.trim();
    const showIconify = !this._hasSlottedSvg && !!name;

    return html`
      <div part="icon" style=${styleMap(style)}>
        <span class="iconify" aria-hidden="true" ?hidden=${!showIconify}></span>
        <slot @slotchange=${this._onSlotChange} ?hidden=${showIconify}></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-icon": VuIcon;
  }
}

const defaultSet = ionLocalSetData as IconifySetData;
if (defaultSet?.icons) {
  registerLocalSet("ion", defaultSet);
}
