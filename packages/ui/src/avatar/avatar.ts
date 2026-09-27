import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { VuIcon } from "../icon/icon.js";
import { ICONS } from "../internals/icon.js";
import { avatarStyles } from "./avatar.style.js";
import type { VuAvatarColor, VuAvatarRadius, VuAvatarSize } from "./avatar.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";


export type { VuAvatarColor, VuAvatarRadius, VuAvatarSize } from "./avatar.types.js";

/** Hoisted default-fallback icon — never re-allocated per render. */
const DEFAULT_FALLBACK_ICON = html`<vu-icon icon=${ICONS.person} aria-hidden="true"></vu-icon>`;

/** Splits a name on whitespace, keeps at most two parts (first + last), uppercases. */
function deriveInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/**
 * @element vu-avatar
 *
 * @summary An avatar component with image, initials, icon, or custom content.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/avatar
 * @dependency vu-icon
 *
 * @slot - Custom fallback when the image is absent or fails.
 *
 * @property {string} src - Image URL.
 * @property {string} name - Derives initials and default `alt`.
 * @property {string} alt - Image accessible name; defaults to `name`.
 * @property {VuAvatarSize} size - Overall dimension. Default: `"md"`.
 * @property {VuAvatarRadius} radius - Corner radius. Default: `"full"`.
 * @property {VuAvatarColor} color - Fallback surface intent. Default: `"default"`.
 * @property {boolean} bordered - Colored ring around the avatar. Default: `false`.
 * @property {boolean} disabled - Dims and disables pointer events. Default: `false`.
 *
 * @csspart avatar - Outer surface.
 * @csspart image - The `<img>` element.
 * @csspart fallback - Slot, initials, or default icon wrapper.
 *
 * @cssproperty --avatar-size - Outer dimension.
 * @cssproperty --avatar-bg - Fallback background.
 * @cssproperty --avatar-fg - Fallback foreground.
 * @cssproperty --avatar-radius - Corner radius.
 * @cssproperty --avatar-ring - Ring color when `bordered`.
 * @cssproperty --avatar-ring-offset - Gap between surface and ring.
 * @cssproperty --avatar-bordered-gap-color - Ring gap fill — must match the parent surface (defaults to page background). Ring paints outside the host box.
 * @cssproperty --avatar-font-size - Initials font size.
 * @cssproperty --avatar-icon-size - Default fallback icon size.
 */
@customElement("vu-avatar")
@withComponentPresets
export class VuAvatar extends LitElement {
  static override styles = avatarStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
  };

  /** Image URL. */
  @property({ type: String })
  src = "";

  /** Derives initials and default `alt`. */
  @property({ type: String })
  name = "";

  /** Image accessible name; defaults to `name`. */
  @property({ type: String })
  alt = "";

  /** Overall dimension. */
  @property({ type: String, reflect: true })
  size: VuAvatarSize = "md";

  /** Corner radius. */
  @property({ type: String, reflect: true })
  radius: VuAvatarRadius = "full";

  /** Fallback surface intent. */
  @property({ type: String, reflect: true })
  color: VuAvatarColor = "default";

  /** Colored ring around the avatar. */
  @property({ type: Boolean, reflect: true })
  bordered = false;

  /** Dims and disables pointer events. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** True after the `<img>` reports a load error; advances the fallback chain. */
  @state()
  private _imageError = false;

  /** True after the `<img>` successfully loads (or is already complete from cache). */
  @state()
  private _imageLoaded = false;

  override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("src")) {
      this._imageError = false;
      this._imageLoaded = false;
    }
    if (changed.has("disabled")) {
      if (this.disabled) {
        this.setAttribute("aria-disabled", "true");
      } else {
        this.removeAttribute("aria-disabled");
      }
    }
  }

  override updated(_changed: PropertyValues<this>): void {
    // Cached images may fire 'load' before the listener attaches — sync from complete.
    if (this._showImage && !this._imageLoaded && !this._imageError) {
      const img = this.renderRoot.querySelector('[part="image"]') as HTMLImageElement | null;
      if (img?.complete && img.naturalHeight > 0) {
        this._imageLoaded = true;
      }
    }
  }

  /** Effective accessible name for the `<img>` (falls back to `name`, then empty / decorative). */
  private get _resolvedAlt(): string {
    return this.alt || this.name || "";
  }

  /** True when the `<img>` should render — `src` is set and hasn't failed. */
  private get _showImage(): boolean {
    return this.src.length > 0 && !this._imageError;
  }

  /** True once the photo is ready to cover the fallback. */
  private get _imageReady(): boolean {
    return this._showImage && this._imageLoaded;
  }

  /** Derived two-letter initials; falls back to the empty string when `name` is empty. */
  private get _initials(): string {
    return deriveInitials(this.name);
  }

  private _onImageError = (): void => {
    this._imageError = true;
    this._imageLoaded = false;
  };

  private _onImageLoad = (): void => {
    this._imageError = false;
    this._imageLoaded = true;
  };

  override render() {
    const showImage = this._showImage;
    const imageReady = this._imageReady;
    const initials = this._initials;
    const accessibleName = this._resolvedAlt;

    return html`
      <div part="avatar">
        ${
          showImage
            ? html`<img
                part="image"
                src=${this.src}
                alt=${accessibleName}
                loading="lazy"
                decoding="async"
                ?hidden=${!imageReady}
                @load=${this._onImageLoad}
                @error=${this._onImageError}
              />`
            : nothing
        }
        <div part="fallback" ?hidden=${imageReady} aria-hidden=${imageReady ? "true" : "false"}>
          <slot>${initials || DEFAULT_FALLBACK_ICON}</slot>
        </div>
      </div>
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "vu-avatar": VuAvatar;
  }
}
