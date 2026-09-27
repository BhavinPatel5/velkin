import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { VuBreadcrumbSize } from "../breadcrumb/breadcrumb.types.js";
import { breadcrumbItemStyles } from "./breadcrumb-item.style.js";
import type { VuBreadcrumbItemActivateDetail } from "./breadcrumb-item.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";


export type { VuBreadcrumbItemActivateDetail } from "./breadcrumb-item.types.js";

/**
 * @element vu-breadcrumb-item
 *
 * @summary A breadcrumb item component for use inside `<vu-breadcrumb>`.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/breadcrumb
 *
 * @slot - The visible text / label for the segment.
 * @slot start - Optional leading icon or marker (rendered before the text).
 *
 * @property {string} href - When set, the segment renders as an `<a>` link. Empty → renders as `<span>`.
 * @property {boolean} current - Marks this as the current page. Renders as `<span>` with `aria-current="page"` regardless of `href`.
 * @property {boolean} disabled - Non-interactive, visually dimmed. Click events are not dispatched.
 * @property {string} target - Forwarded to the `<a>` (e.g. `"_blank"`).
 * @property {string} rel - Forwarded to the `<a>` (e.g. `"noopener noreferrer"`).
 *
 * @csspart base - Wrapper layout (separator + start icon + text).
 * @csspart separator - The leading separator glyph; auto-hidden when the parent flags this item as `[first]`.
 * @csspart start - Wrapper around the optional leading icon slot.
 * @csspart link - The interactive `<a>` or static `<span>` element.
 * @csspart content - The text wrapper that handles truncation.
 *
 * @cssproperty --breadcrumb-separator - Separator glyph injected via `content`; forwarded by the parent.
 * @cssproperty --breadcrumb-font-size - Font size; size-preset attribute (`sm | md | lg`) sets it.
 * @cssproperty --breadcrumb-item-gap - Gap between separator, start icon, and text.
 *
 * @fires {CustomEvent<VuBreadcrumbItemActivateDetail>} vu-activate - Cancellable; dispatched when an interactive item is activated. `preventDefault()` to take over routing.
 *
 * The parent `<vu-breadcrumb>` mirrors `size`, the `[first]` marker, and `[hidden]` (for collapsed items) onto every child via attribute forwarding — those attributes are reserved and will be reset by the parent on every reactive update. Don't set them yourself.
 */
@customElement("vu-breadcrumb-item")
@withComponentPresets
export class VuBreadcrumbItem extends LitElement {
  static override styles = breadcrumbItemStyles;

  /** Renders as an `<a>` when set; otherwise renders as a `<span>`. */
  @property({ type: String })
  href = "";

  /** Marks this segment as the current page (`aria-current="page"`, never a link). */
  @property({ type: Boolean, reflect: true })
  current = false;

  /** Disables the segment — non-interactive, dimmed. */
  @property({ type: Boolean, reflect: true })
  disabled = false;

  /** Forwarded to the `<a>` element. */
  @property({ type: String })
  target = "";

  /** Forwarded to the `<a>` element. */
  @property({ type: String })
  rel = "";

  /** @internal Size mirrored from the parent `<vu-breadcrumb>`. */
  @property({ type: String, reflect: true })
  size: VuBreadcrumbSize = "md";

  /** @internal Parent sets this on the first visible item to hide the separator. */
  @property({ type: Boolean, reflect: true })
  first = false;

  /** Whether the segment is interactive (renders as an `<a>` and dispatches `vu-activate`). */
  private get _isInteractive(): boolean {
    return !this.current && !this.disabled && this.href.length > 0;
  }

  private _onClick = (event: MouseEvent): void => {
    if (!this._isInteractive) return;
    const detail: VuBreadcrumbItemActivateDetail = {
      href: this.href,
      originalEvent: event,
    };
    const ev = new CustomEvent<VuBreadcrumbItemActivateDetail>("vu-activate", {
      detail,
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    const allowed = this.dispatchEvent(ev);
    if (!allowed) event.preventDefault();
  };

  override render() {
    const interactive = this._isInteractive;
    const body = html`
      <span part="start">
        <slot name="start"></slot>
      </span>
      <span part="content"><slot></slot></span>
    `;

    return html`
      <span part="separator" aria-hidden="true"></span>
      ${interactive
        ? html`<a
            part="link"
            href=${this.href}
            target=${this.target || nothing}
            rel=${this.rel || nothing}
            @click=${this._onClick}
          >
            ${body}
          </a>`
        : html`<span
            part="link"
            aria-current=${this.current ? "page" : nothing}
            aria-disabled=${this.disabled ? "true" : nothing}
          >
            ${body}
          </span>`}
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "vu-breadcrumb-item": VuBreadcrumbItem;
  }
}
