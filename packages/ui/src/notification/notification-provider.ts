import { css, html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { provide } from "@lit/context";
import {
  createNotificationApi,
  registerNotificationProvider,
  unregisterNotificationProvider,
} from "./internals/notification-api.js";
import {
  notificationContext,
  type NotificationContextValue,
} from "./internals/notification-context.js";
import "./notification.js";
import type { VuNotification } from "./notification.js";
import type {
  VuNotificationLayout,
  VuNotificationPosition,
  VuNotificationVariant,
} from "./notification.types.js";

export type { NotificationApi } from "./internals/notification-api.js";
export {
  notificationContext,
  type NotificationContextValue,
} from "./internals/notification-context.js";
export {
  notify,
  registerNotificationProvider,
  unregisterNotificationProvider,
} from "./internals/notification-api.js";
import { reflectString } from "../internals/utils/reflect-string.js";

type ProviderRegistration = {
  api: ReturnType<typeof createNotificationApi>;
  getHost: () => VuNotification | null;
};

/**
 * @element vu-notification-provider
 *
 * @summary A notification provider component with global toast API.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/notification
 * @dependency vu-notification
 *
 * @slot - Application content rendered above the toast host.
 *
 * @property {string} providerId - Routes `notify({ toasterId })` to this viewport; empty is the default provider. Default: `""`.
 * @property {VuNotificationPosition} position - Screen corner or center for the toast region. Default: `"bottom-end"`.
 * @property {VuNotificationLayout} layout - List or stack presentation. Default: `"list"`.
 * @property {VuNotificationVariant} variant - Default surface recipe for preset toasts. Default: `"flat"`.
 * @property {number} defaultDuration - Auto-dismiss ms when toast duration is omitted; `0` disables. Default: `4000`.
 * @property {number} maxVisible - Max simultaneous toasts before oldest are dropped. Default: `5`.
 * @property {number} visibleToasts - Collapsed stack layers shown before overflow. Default: `3`.
 * @property {boolean} removable - Shows per-toast dismiss controls. Default: `true`.
 * @property {boolean} mergeDuplicates - Merges duplicate toasts and increments count. Default: `false`.
 * @property {string} offset - Viewport inset override (CSS length). Default: `""`.
 * @property {string} gap - List gap override (CSS length). Default: `""`.
 * @property {boolean} withProgress - Shows auto-dismiss countdown bar on timed toasts. Default: `false`.
 * @property {boolean} withPauseOnHover - Pauses auto-dismiss while the list is hovered. Default: `false`.
 * @property {boolean} withPauseWhenHidden - Pauses auto-dismiss while the document is hidden. Default: `true`.
 * @property {boolean} withExpandOnClick - Pins stack expansion after clicking the pile. Default: `false`.
 * @property {boolean} withOverflowCount - Shows overflow count badge in stack layout. Default: `false`.
 * @property {boolean} withSwipeDismiss - Enables swipe-to-dismiss on each toast. Default: `false`.
 */
@customElement("vu-notification-provider")
export class VuNotificationProvider extends LitElement {
  static override styles = css`
    :host {
      display: block;
      position: relative;
    }
  `;

  /** Routes `notify({ toasterId })` to this viewport; empty is the default provider. */
  @property(reflectString) providerId = "";
  /** Screen corner or center for the toast region. */
  @property({ type: String, reflect: true }) position: VuNotificationPosition = "bottom-end";
  /** List or stack presentation. */
  @property({ type: String, reflect: true }) layout: VuNotificationLayout = "list";
  /** Default surface recipe for preset toasts. */
  @property({ type: String, reflect: true }) variant: VuNotificationVariant = "flat";
  /** Auto-dismiss ms when toast duration is omitted; `0` disables. */
  @property({ type: Number }) defaultDuration = 4000;
  /** Max simultaneous toasts before oldest are dropped. */
  @property({ type: Number }) maxVisible = 5;
  /** Collapsed stack layers shown before overflow. */
  @property({ type: Number }) visibleToasts = 3;
  /** Shows per-toast dismiss controls. */
  @property({ type: Boolean, reflect: true }) removable = true;
  /** Merges duplicate toasts and increments count. */
  @property({ type: Boolean, reflect: true }) mergeDuplicates = false;
  /** Viewport inset override (CSS length). */
  @property({ type: String }) offset = "";
  /** List gap override (CSS length). */
  @property({ type: String }) gap = "";
  /** Shows auto-dismiss countdown bar on timed toasts. */
  @property({ type: Boolean, reflect: true }) withProgress = false;
  /** Pauses auto-dismiss while the list is hovered. */
  @property({ type: Boolean, reflect: true }) withPauseOnHover = false;
  /** Pauses auto-dismiss while the document is hidden. */
  @property({ type: Boolean, reflect: true }) withPauseWhenHidden = true;
  /** Pins stack expansion after clicking the pile. */
  @property({ type: Boolean, reflect: true }) withExpandOnClick = false;
  /** Shows overflow count badge in stack layout. */
  @property({ type: Boolean, reflect: true }) withOverflowCount = false;
  /** Enables swipe-to-dismiss on each toast. */
  @property({ type: Boolean, reflect: true }) withSwipeDismiss = false;

  @query("vu-notification")
  private _host?: VuNotification;

  @provide({ context: notificationContext })
  private _ctx!: NotificationContextValue;

  private _registration: ProviderRegistration = {
    api: createNotificationApi(() => null),
    getHost: () => null,
  };

  override connectedCallback(): void {
    super.connectedCallback();
    this._bindApi();
  }

  override updated(): void {
    this._bindApi();
  }

  override disconnectedCallback(): void {
    unregisterNotificationProvider(this.providerId.trim(), this._registration);
    super.disconnectedCallback();
  }

  private _bindApi(): void {
    const api = createNotificationApi(() => this._host ?? null);
    this._registration = {
      api,
      getHost: () => this._host ?? null,
    };
    this._ctx = { notify: api, host: this._host ?? null };
    registerNotificationProvider(this.providerId.trim(), this._registration);
  }

  override render() {
    return html`
      <slot></slot>
      <vu-notification
        .position=${this.position}
        .layout=${this.layout}
        .variant=${this.variant}
        .defaultDuration=${this.defaultDuration}
        .maxVisible=${this.maxVisible}
        .visibleToasts=${this.visibleToasts}
        .removable=${this.removable}
        .mergeDuplicates=${this.mergeDuplicates}
        .offset=${this.offset}
        .gap=${this.gap}
        .withProgress=${this.withProgress}
        .withPauseOnHover=${this.withPauseOnHover}
        .withPauseWhenHidden=${this.withPauseWhenHidden}
        .withExpandOnClick=${this.withExpandOnClick}
        .withOverflowCount=${this.withOverflowCount}
        .withSwipeDismiss=${this.withSwipeDismiss}
      ></vu-notification>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-notification-provider": VuNotificationProvider;
  }
}
