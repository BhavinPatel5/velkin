import { html, nothing, type TemplateResult } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { repeat } from "lit/directives/repeat.js";
import { when } from "lit/directives/when.js";
import { styleMap } from "lit/directives/style-map.js";
import { ICONS } from "../../internals/icon.js";
import { msg } from "../../internals/utils/localize.js";
import type { PopoverController } from "../../internals/controllers/popover-controller.js";
import { resolveNotificationContent } from "./notification-content.js";
import { notificationItemDomId } from "./notification-dom.js";
import type { VuNotificationItem } from "../notification.types.js";
import type { VuNotification } from "../notification.js";

/** Host surface for notification shadow markup. */
export type NotificationRenderHost = Pick<
  VuNotification,
  | "layout"
  | "mergeDuplicates"
  | "notifications"
  | "closeLabel"
  | "withProgress"
  | "withOverflowCount"
  | "withSwipeDismiss"
  | "paused"
> & {
  readonly _displayItems: VuNotificationItem[];
  readonly _overflowCount: number;
  readonly _allowsSwipe: boolean;
  _closeLabelText(): string;
  _resolveIcon(item: VuNotificationItem): string | null;
  _showClose(item: VuNotificationItem): boolean;
  _onDismiss(id: number): void;
  _onAction(id: number): void;
  _onListPointerEnter(): void;
  _onListPointerLeave(): void;
  _onItemPointerDown(id: number, event: PointerEvent): void;
  _onItemPointerMove(id: number, event: PointerEvent): void;
  _onItemPointerUp(id: number, event: PointerEvent): void;
  _onItemPointerCancel(): void;
  readonly _popover: PopoverController;
};

function renderClose(host: NotificationRenderHost, item: VuNotificationItem) {
  return when(
    host._showClose(item),
    () => html`
      <button
        type="button"
        part="close"
        aria-label=${host._closeLabelText()}
        @click=${() => host._onDismiss(item.id)}
      >
        <vu-icon .icon=${ICONS.close} aria-hidden="true"></vu-icon>
      </button>
    `,
  );
}

function renderProgress(host: NotificationRenderHost, item: VuNotificationItem) {
  return when(
    host.withProgress && item.durationMs && item.durationMs > 0 && !item.removing,
    () => html`
      <div
        part="progress"
        style=${styleMap({ "--nt-item-duration-ms": `${item.durationMs}ms` })}
      ></div>
    `,
  );
}

function renderPresetBody(host: NotificationRenderHost, item: VuNotificationItem) {
  const icon = host._resolveIcon(item);
  return html`
    ${when(
      item.image,
      () => html` <img part="media" src=${item.image!} alt=${item.imageAlt?.trim() || ""} /> `,
    )}
    <div part="row">
      ${when(
        item.state === "loading",
        () => html`<vu-spinner part="spinner" .size=${"sm"} aria-hidden="true"></vu-spinner>`,
        () =>
          when(
            icon,
            () => html` <vu-icon part="icon" .icon=${icon!} aria-hidden="true"></vu-icon> `,
          ),
      )}
      <div part="copy">
        ${when(
          item.title,
          () => html`
            <div part="title">
              ${item.title}
              ${when(
                host.mergeDuplicates && item.count > 1,
                () => html` <span part="count">+ ${item.count}</span> `,
              )}
            </div>
          `,
        )}
        ${when(
          item.message,
          () => html`
            <div part="message" style=${styleMap({ textAlign: item.textAlign })}>
              ${item.message}
            </div>
          `,
        )}
      </div>
    </div>
    ${when(
      item.actionLabel,
      () => html`
        <vu-button
          part="action"
          .size=${"sm"}
          .variant=${"ghost"}
          @click=${() => host._onAction(item.id)}
        >
          ${item.actionLabel}
        </vu-button>
      `,
    )}
  `;
}

function itemAriaLive(item: VuNotificationItem): "polite" | "assertive" {
  return item.color === "danger" ? "assertive" : "polite";
}

function itemClassMap(item: VuNotificationItem) {
  const extra = item.itemClass?.trim().split(/\s+/).filter(Boolean) ?? [];
  return classMap({
    "is-removing": item.removing,
    "is-loading": item.state === "loading",
    "is-custom": item.custom,
    ...Object.fromEntries(extra.map((name) => [name, true])),
  });
}

function renderItem(host: NotificationRenderHost, item: VuNotificationItem, idx: number) {
  const customContent = item.custom
    ? resolveNotificationContent(item.id, () => host._onDismiss(item.id))
    : undefined;

  return html`
    <div
      part="item"
      id=${notificationItemDomId(item.id)}
      color=${item.color}
      variant=${item.variant}
      class=${itemClassMap(item)}
      style=${styleMap({
        ...(host.layout === "stack" ? { "--nt-stack-index": String(idx) } : {}),
        ...(item.itemStyle ?? {}),
      })}
      role="status"
      aria-live=${itemAriaLive(item)}
      aria-busy=${item.state === "loading" ? "true" : nothing}
      @pointerdown=${
        host._allowsSwipe
          ? (event: PointerEvent) => host._onItemPointerDown(item.id, event)
          : nothing
      }
      @pointermove=${
        host._allowsSwipe
          ? (event: PointerEvent) => host._onItemPointerMove(item.id, event)
          : nothing
      }
      @pointerup=${
        host._allowsSwipe ? (event: PointerEvent) => host._onItemPointerUp(item.id, event) : nothing
      }
      @pointercancel=${host._allowsSwipe ? () => host._onItemPointerCancel() : nothing}
    >
      ${item.custom ? html`<div part="body">${customContent}</div>` : renderPresetBody(host, item)}
      ${renderClose(host, item)} ${renderProgress(host, item)}
    </div>
  `;
}

/** Full shadow tree for `<vu-notification>`. */
export function renderNotification(host: NotificationRenderHost): TemplateResult {
  return html`
    <div part="base">
      <div part="anchor" aria-hidden="true"></div>
      <div
        part="panel"
        popover="manual"
        role="region"
        aria-label=${msg("Notifications", { desc: "Accessible name for the notification region." })}
        @toggle=${host._popover.onToggle}
      >
        <div
          part="list"
          class=${classMap({ "is-paused": host.paused })}
          @pointerenter=${() => host._onListPointerEnter()}
          @pointerleave=${() => host._onListPointerLeave()}
        >
          ${when(
            host.withOverflowCount && host._overflowCount > 0,
            () => html`
              <div part="overflow" aria-live="polite">
                +${host._overflowCount}
                ${msg("more", { desc: "Overflow count suffix for hidden toasts." })}
              </div>
            `,
          )}
          ${repeat(
            host._displayItems,
            (item) => String(item.id),
            (item, idx) => renderItem(host, item, idx),
          )}
        </div>
      </div>
    </div>
  `;
}
