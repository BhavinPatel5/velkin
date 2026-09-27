import { localized } from "@lit/localize";
import { LitElement, type PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { PopoverController } from "../internals/controllers/popover-controller.js";
import {
  registerDismissible,
  unregisterDismissible,
  isTopDismissible,
} from "../internals/utils/dismissible-stack.js";
import {
  canUseDocument,
  canUseRaf,
} from "../internals/utils/env.js";
import { ICONS } from "../internals/icon.js";
import { msg } from "../internals/utils/localize.js";
import {
  motionDurationMs,
  readMotionDurationMs,
} from "../internals/utils/motion.js";
import { VuButton } from "../button/button.js";
import { VuIcon } from "../icon/icon.js";
import { VuSpinner } from "../spinner/spinner.js";
import { syncNotificationAnchor } from "./internals/notification-anchor.js";
import { toPopoverAlign, toPopoverPlacement, normalizeNotificationPosition } from "./internals/notification-placement.js";
import {
  clearNotificationCallbacks,
  clearAllNotificationCallbacks,
  getNotificationCallbacks,
  setNotificationCallbacks,
} from "./internals/notification-callbacks.js";
import {
  clearNotificationContent,
  clearAllNotificationContent,
  setNotificationContent,
} from "./internals/notification-content.js";
import {
  renderNotification,
  type NotificationRenderHost,
} from "./internals/notification.render.js";
import {
  clearNotificationTimeouts,
  createNotificationItem,
  NOTIFICATION_CLEAR_STAGGER_MS,
  NOTIFICATION_REMOVAL_MS,
  notificationMatchesDuplicate,
} from "./internals/notification-store.js";
import { NotificationSwipeDismiss } from "./internals/notification-swipe.js";
import { NotificationDurationController } from "./internals/notification-duration.js";
import { queryNotificationItem } from "./internals/notification-dom.js";
import { NotificationListMotion } from "./internals/notification-list-motion.js";
import {
  animateNotificationExit,
  readNotificationMotionMs,
} from "./internals/notification-motion.js";
import { NotificationStackLayout } from "./internals/notification-stack.js";
import { notificationStyles } from "./notification.style.js";
import type {
  VuNotificationQueueDetail,
  VuNotificationAddInput,
  VuNotificationClearAllDetail,
  VuNotificationColor,
  VuNotificationItem,
  VuNotificationLayout,
  VuNotificationPosition,
  VuNotificationRemoveDetail,
  VuNotificationUpdateInput,
  VuNotificationVariant,
} from "./notification.types.js";
import { withComponentPresets } from "../internals/controllers/preset-controller.js";

export type {
  VuNotificationAction,
  VuNotificationQueueDetail,
  VuNotificationAddInput,
  VuNotificationClearAllDetail,
  VuNotificationColor,
  VuNotificationItem,
  VuNotificationLayout,
  VuNotificationPosition,
  VuNotificationPromiseMessages,
  VuNotificationRemoveDetail,
  VuNotificationState,
  VuNotificationTextAlign,
  VuNotificationUpdateInput,
  VuNotificationVariant,
  VuNotificationContentContext,
  VuNotificationContentFn,
} from "./notification.types.js";

const DEFAULT_INTENT_ICON: Record<VuNotificationColor, string | null> = {
  default: null,
  primary: ICONS.intentInfo,
  success: ICONS.intentSuccess,
  warning: ICONS.intentWarning,
  danger: ICONS.intentDanger,
};

type NotificationItemInternal = VuNotificationItem & {
  _timeout?: number;
  _expiresAt?: number;
  _remainingMs?: number;
};

/**
 * @element vu-notification
 *
 * @summary A notification component that renders the toast viewport.
 *
 * @status stable
 * @since 0.1.0
 *
 * @documentation https://velkinui.com/docs/components/notification
 * @dependency vu-icon
 * @dependency vu-button
 * @dependency vu-spinner
 *
 * @csspart base - Root wrapper.
 * @csspart anchor - Invisible viewport anchor for popover positioning.
 * @csspart panel - Popover panel listing toasts.
 * @csspart list - Vertical list or stack grid of toast items.
 * @csspart item - Individual toast surface.
 * @csspart media - Optional leading image.
 * @csspart row - Icon + text row.
 * @csspart icon - Leading status icon.
 * @csspart spinner - Loading indicator for promise toasts.
 * @csspart copy - Title and message column.
 * @csspart title - Toast title.
 * @csspart message - Toast body copy.
 * @csspart count - Duplicate merge badge.
 * @csspart action - Optional action button.
 * @csspart body - Custom toast body when `content` is provided.
 * @csspart close - Per-toast dismiss control.
 * @csspart progress - Auto-dismiss countdown bar.
 * @csspart overflow - Hidden-toast count badge in stack layout.
 *
 * @cssproperty --nt-item-width - Toast inline size.
 * @cssproperty --nt-viewport-offset - Fixed inset from the viewport edge.
 * @cssproperty --nt-list-gap - Gap between toasts in list layout.
 * @cssproperty --nt-close-size - Dismiss control hit box.
 * @cssproperty --nt-stack-hover-gap - Expanded stack gap between items.
 * @cssproperty --nt-stack-fan-limit - Max peeking layers in collapsed stack.
 * @cssproperty --nt-stack-peek - Peek offset per collapsed stack layer.
 * @cssproperty --nt-stack-scale-step - Scale reduction per collapsed stack layer.
 * @cssproperty --nt-motion-ms - List enter/exit transition duration.
 * @cssproperty --nt-stack-transition-ms - Stack expand/collapse transition duration.
 *
 * @property {VuNotificationPosition} position - Screen corner or center for the toast region. Default: `"bottom-end"`.
 * @property {VuNotificationLayout} layout - List or stack presentation. Default: `"list"`.
 * @property {VuNotificationVariant} variant - Status surface recipe (`flat`|`soft`|`solid`|`bordered`). Default: `"flat"`.
 * @property {VuNotificationItem[]} notifications - Current toast items. Default: `[]`.
 * @property {number} defaultDuration - Auto-dismiss ms when item duration is omitted; `0` disables. Default: `4000`.
 * @property {number} visibleToasts - Collapsed stack layers shown before overflow. Default: `3`.
 * @property {number} maxVisible - Max simultaneous toasts before oldest are dropped. Default: `5`.
 * @property {boolean} removable - Shows per-toast dismiss controls. Default: `true`.
 * @property {boolean} mergeDuplicates - Merges duplicate toasts and increments count. Default: `false`.
 * @property {string} closeLabel - Accessible name for dismiss; empty uses locale catalog. Default: `""`.
 * @property {string} offset - Viewport inset override (CSS length). Default: `""`.
 * @property {string} gap - List gap override (CSS length). Default: `""`.
 * @property {boolean} withProgress - Shows auto-dismiss countdown bar on timed toasts. Default: `false`.
 * @property {boolean} withPauseOnHover - Pauses auto-dismiss while the list is hovered. Default: `false`.
 * @property {boolean} withPauseWhenHidden - Pauses auto-dismiss while the document is hidden. Default: `true`.
 * @property {boolean} withExpandOnClick - Pins stack expansion after clicking the pile. Default: `false`.
 * @property {boolean} withOverflowCount - Shows overflow count badge in stack layout. Default: `false`.
 * @property {boolean} withSwipeDismiss - Enables swipe-to-dismiss on each toast. Default: `false`.
 * @property {boolean} paused - Reflects when auto-dismiss timers are paused. Default: `false`.
 *
 * @method addNotification - Queues a toast; returns its id.
 * @method updateNotification - Patches an existing toast (promise flow).
 * @method removeNotification - Dismisses a toast by id.
 * @method clearNotifications - Dismisses every toast.
 * @method show - Opens the popover when items exist.
 * @method hide - Closes the popover.
 *
 * @fires {CustomEvent<VuNotificationQueueDetail>} vu-queue - When a toast is queued.
 * @fires {CustomEvent<VuNotificationRemoveDetail>} vu-remove - When a toast is removed.
 * @fires {CustomEvent<VuNotificationClearAllDetail>} vu-clear-all - When all toasts are cleared.
 */
@localized()
@customElement("vu-notification")
@withComponentPresets
export class VuNotification extends LitElement {
  static override styles = notificationStyles;

  static dependencies: Record<string, CustomElementConstructor> = {
    "vu-icon": VuIcon,
    "vu-button": VuButton,
    "vu-spinner": VuSpinner,
  };

  /** Screen corner or center for the toast region. */
  @property({ type: String, reflect: true }) position: VuNotificationPosition = "bottom-end";
  /** List or stack presentation. */
  @property({ type: String, reflect: true }) layout: VuNotificationLayout = "list";
  /** Status surface recipe for preset toasts. */
  @property({ type: String, reflect: true }) variant: VuNotificationVariant = "flat";
  /** Current toast items. */
  @property({ type: Array, attribute: false }) notifications: NotificationItemInternal[] = [];
  /** Auto-dismiss ms when item duration is omitted; `0` disables. */
  @property({ type: Number }) defaultDuration = 4000;
  /** Max simultaneous toasts before oldest are dropped. */
  @property({ type: Number }) maxVisible = 5;
  /** Collapsed stack layers shown before overflow. */
  @property({ type: Number }) visibleToasts = 3;
  /** Shows per-toast dismiss controls. */
  @property({ type: Boolean, reflect: true }) removable = true;
  /** Merges duplicate toasts and increments count. */
  @property({ type: Boolean, reflect: true }) mergeDuplicates = false;
  /** Accessible name for dismiss; empty uses locale catalog. */
  @property({ type: String }) closeLabel = "";
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
  /** Reflects when auto-dismiss timers are paused. */
  @property({ type: Boolean, reflect: true }) paused = false;

  @query('[part="anchor"]')
  private _anchor?: HTMLElement;

  @query('[part="panel"]')
  private _panel?: HTMLElement;

  private _counter = 0;

  private readonly _popover = new PopoverController(this, {
    getAnchor: () => this._anchor ?? null,
    getPopover: () => this._panel ?? null,
    getPlacement: () => toPopoverPlacement(this.position),
    getAlign: () => toPopoverAlign(this.position),
    getGap: () => 8,
    getPadding: () => 0,
    getMatchAnchorWidth: () => false,
    getMaxWidthToViewport: () => true,
    getMaxWidthMode: () => "cap",
    getFlip: () => false,
    getPreset: () => "none",
    getDuration: () => motionDurationMs(readMotionDurationMs(this, "normal")),
    getCloseDuration: () => motionDurationMs(readMotionDurationMs(this, "fast")),
    getAnimateReposition: () => true,
    getRepositionMs: () => motionDurationMs(readMotionDurationMs(this, "fast")),
    getCloseOnEscape: () => false,
    getCloseOnOutside: () => false,
    getRestoreFocusOnClose: () => false,
    focusOnOpen: () => undefined,
  });

  private readonly _stack = new NotificationStackLayout(
    () => this.shadowRoot,
    () => this.layout,
    () => this.position,
    () => this,
    () => {
      if (this._popover.open) this._popover.position?.();
    },
    () => this.withExpandOnClick,
  );

  private readonly _listMotion = new NotificationListMotion();

  private readonly _swipe = new NotificationSwipeDismiss(
    () => this.position,
    (id) => queryNotificationItem(this.shadowRoot, id),
    () => this,
    (id) => this.removeNotification(id),
  );

  private readonly _duration = new NotificationDurationController();

  private readonly _exitStarted = new Set<number>();

  private _listHoverDepth = 0;
  private _hiddenPaused = false;
  private readonly _onVisibilityChange = (): void => {
    if (!this.withPauseWhenHidden) return;
    if (document.hidden) {
      this._hiddenPaused = true;
      this._duration.pauseAll(this.notifications);
      this.paused = true;
      return;
    }
    this._hiddenPaused = false;
    if (this._listHoverDepth === 0) {
      this._duration.resumeAll(this.notifications, (id) => this.removeNotification(id));
      this.paused = false;
    }
  };

  private get _renderHost(): NotificationRenderHost {
    return this as unknown as NotificationRenderHost;
  }

  private get _displayItems(): VuNotificationItem[] {
    const items =
      this.layout === "stack"
        ? [...this.notifications].reverse()
        : this.notifications;
    if (this.maxVisible > 0 && items.length > this.maxVisible) {
      return items.slice(-this.maxVisible);
    }
    return items;
  }

  get _overflowCount(): number {
    const active = this.notifications.filter((item) => !item.removing).length;
    if (this.layout === "stack" && active > 0) {
      const fanLimit = this._readStackFanLimit();
      return Math.max(0, active - fanLimit);
    }
    const displayed = this._displayItems.filter((item) => !item.removing).length;
    return Math.max(0, active - displayed);
  }

  get _allowsSwipe(): boolean {
    return this.withSwipeDismiss;
  }

  override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("position")) {
      this.position = normalizeNotificationPosition(this.position);
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (canUseDocument() && (document.documentElement.dir === "rtl" || this.closest("[dir='rtl']"))) {
      this.setAttribute("dir", "rtl");
    }
    if (canUseDocument()) {
      document.addEventListener("visibilitychange", this._onVisibilityChange);
    }
  }

  override firstUpdated(): void {
    this._syncViewportTokens();
    this._syncAnchor();
    this._popover.refreshTargets();
    if (this.notifications.length > 0) this._openPopover();
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has("offset") || changed.has("gap") || changed.has("visibleToasts")) {
      this._syncViewportTokens();
    }

    if (changed.has("position")) {
      this._syncAnchor();
      if (this._popover.open) this._popover.position?.();
    }

    if (changed.has("notifications")) {
      if (this.notifications.length > 0) this._openPopover();
      else this._closePopover();
    }

    if (
      changed.has("notifications") ||
      changed.has("layout") ||
      changed.has("position")
    ) {
      if (this.layout === "stack") {
        if (changed.has("layout")) {
          this.shadowRoot?.querySelectorAll<HTMLElement>('[part="item"]').forEach((el) => {
            el.classList.remove("is-list-mounted");
          });
        }
        this._stack.retainExpandedOnUpdate();
        const deferStack =
          changed.has("notifications") && this.notifications.some((item) => item.removing);
        if (!deferStack) {
          this._stack.schedule();
        }
      } else {
        if (changed.has("layout")) {
          this._listMotion.resetStackInlineStyles(this.shadowRoot);
        }
        this._listMotion.schedule(this.shadowRoot, this.position);
      }
    }

    if (changed.has("notifications") && canUseRaf()) {
      requestAnimationFrame(() => {
        this._runExitAnimations();
        if (this.layout === "stack" && this.notifications.some((item) => item.removing)) {
          this._stack.schedule();
        }
      });
    }
  }

  override disconnectedCallback(): void {
    unregisterDismissible(this);
    if (canUseDocument()) {
      document.removeEventListener("visibilitychange", this._onVisibilityChange);
    }
    this._stack.disconnect();
    this._listMotion.disconnect();
    clearNotificationTimeouts(this.notifications);
    clearAllNotificationCallbacks();
    clearAllNotificationContent();
    this.notifications = [];
    super.disconnectedCallback();
  }

  /** Queues a toast; returns its id. */
  addNotification(input: VuNotificationAddInput): number {
    if (this.mergeDuplicates) {
      const index = this.notifications.findIndex((item) =>
        notificationMatchesDuplicate(item, input),
      );
      if (index !== -1) {
        const existing = { ...this.notifications[index] };
        existing.count = (existing.count || 1) + 1;
        this._applyDuration(existing, input.duration);
        this._registerCallbacks(existing.id, input);
        this.notifications = [
          ...this.notifications.slice(0, index),
          existing,
          ...this.notifications.slice(index + 1),
        ];
        return existing.id;
      }
    }

    this._trimOverflow();
    const item = createNotificationItem(++this._counter, input, {
      removable: this.removable,
      variant: this.variant,
    }) as NotificationItemInternal;
    this._registerContent(item.id, input);
    this._applyDuration(item, input.duration);
    this._registerCallbacks(item.id, input);
    this.notifications = [...this.notifications, item];
    this.dispatchEvent(
      new CustomEvent<VuNotificationQueueDetail>("vu-queue", {
        detail: { item },
        bubbles: true,
        composed: true,
      }),
    );
    return item.id;
  }

  /** Patches an existing toast (promise flow). */
  updateNotification(id: number, patch: VuNotificationUpdateInput): void {
    const index = this.notifications.findIndex((item) => item.id === id);
    if (index === -1) return;
    const current = this.notifications[index];
    const merged: VuNotificationAddInput = {
      title: patch.title ?? current.title,
      message: patch.message ?? current.message,
      color: patch.color ?? current.color,
      variant: patch.variant ?? current.variant,
      duration: patch.duration !== undefined ? patch.duration : current.duration,
      image: patch.image ?? current.image,
      imageAlt: patch.imageAlt ?? current.imageAlt,
      icon: patch.icon !== undefined ? patch.icon : current.icon,
      textAlign: patch.textAlign ?? current.textAlign,
      state: patch.state ?? current.state,
      action: patch.action ?? (current.actionLabel ? { label: current.actionLabel } : undefined),
      removable: patch.removable ?? current.removable,
      itemClass: patch.itemClass ?? current.itemClass,
      itemStyle: patch.itemStyle ?? current.itemStyle,
    };
    const updated = {
      ...createNotificationItem(id, merged, {
        removable: this.removable,
        variant: this.variant,
      }),
      count: current.count,
      removing: false,
      _timeout: current._timeout,
    } as NotificationItemInternal;
    this._registerContent(id, patch);
    this._applyDuration(updated, merged.duration);
    this._registerCallbacks(id, patch);
    this.notifications = [
      ...this.notifications.slice(0, index),
      updated,
      ...this.notifications.slice(index + 1),
    ];
  }

  /** Dismisses a toast by id. */
  removeNotification(id: number): void {
    const index = this.notifications.findIndex((item) => item.id === id);
    if (index === -1) return;
    const item = { ...this.notifications[index] };
    if (item._timeout) clearTimeout(item._timeout);
    item.removing = true;
    this.notifications = [
      ...this.notifications.slice(0, index),
      item,
      ...this.notifications.slice(index + 1),
    ];
    window.setTimeout(() => {
      this.notifications = this.notifications.filter((entry) => entry.id !== id);
      getNotificationCallbacks(id)?.onClose?.();
      clearNotificationCallbacks(id);
      clearNotificationContent(id);
      this.dispatchEvent(
        new CustomEvent<VuNotificationRemoveDetail>("vu-remove", {
          detail: { id },
          bubbles: true,
          composed: true,
        }),
      );
    }, NOTIFICATION_REMOVAL_MS);
  }

  /** Dismisses every toast. */
  clearNotifications(): void {
    const ids = this.notifications.map((item) => item.id);
    if (!ids.length) return;
    clearNotificationTimeouts(this.notifications);
    ids.forEach((id, index) => {
      window.setTimeout(() => this.removeNotification(id), index * NOTIFICATION_CLEAR_STAGGER_MS);
    });
    const endMs = (ids.length - 1) * NOTIFICATION_CLEAR_STAGGER_MS + NOTIFICATION_REMOVAL_MS;
    window.setTimeout(() => {
      if (this.notifications.length === 0) {
        this.dispatchEvent(
          new CustomEvent<VuNotificationClearAllDetail>("vu-clear-all", {
            detail: {},
            bubbles: true,
            composed: true,
          }),
        );
      }
    }, endMs);
  }

  /** Opens the popover when items exist. */
  show(): void {
    this._openPopover();
  }

  /** Closes the popover. */
  hide(): void {
    this._closePopover();
  }

  _closeLabelText(): string {
    return (
      this.closeLabel.trim() ||
      String(msg("Dismiss notification", { desc: "Accessible name for toast dismiss control." }))
    );
  }

  _resolveIcon(item: VuNotificationItem): string | null {
    if (item.state === "loading") return null;
    if (item.icon === "") return null;
    if (item.icon) return item.icon;
    return DEFAULT_INTENT_ICON[item.color];
  }

  _showClose(item: VuNotificationItem): boolean {
    return item.removable && this.removable;
  }

  _onDismiss(id: number): void {
    this.removeNotification(id);
  }

  _onAction(id: number): void {
    getNotificationCallbacks(id)?.onAction?.();
  }

  _onListPointerEnter(): void {
    if (!this.withPauseOnHover) return;
    this._listHoverDepth += 1;
    if (this._listHoverDepth === 1) {
      this._duration.pauseAll(this.notifications);
      this.paused = true;
    }
  }

  _onListPointerLeave(): void {
    if (!this.withPauseOnHover) return;
    this._listHoverDepth = Math.max(0, this._listHoverDepth - 1);
    if (this._listHoverDepth === 0 && !this._hiddenPaused) {
      this._duration.resumeAll(this.notifications, (id) => this.removeNotification(id));
      this.paused = false;
    }
  }

  _onItemPointerDown(id: number, event: PointerEvent): void {
    this._swipe.onPointerDown(id, event);
  }

  _onItemPointerMove(id: number, event: PointerEvent): void {
    this._swipe.onPointerMove(id, event);
  }

  _onItemPointerUp(id: number, event: PointerEvent): void {
    this._swipe.onPointerUp(id, event);
  }

  _onItemPointerCancel(): void {
    this._swipe.onPointerCancel();
  }

  private _registerCallbacks(id: number, input: VuNotificationAddInput): void {
    if (!input.onClose && !input.action?.onPress) return;
    setNotificationCallbacks(id, {
      onClose: input.onClose,
      onAction: input.action?.onPress,
    });
  }

  private _registerContent(id: number, input: VuNotificationAddInput): void {
    if (!input.content) return;
    setNotificationContent(id, input.content);
  }

  private _applyDuration(item: NotificationItemInternal, duration?: number | null): void {
    this._duration.apply(item, duration, this.defaultDuration, (id) => this.removeNotification(id));
  }

  private _readStackFanLimit(): number {
    const style = getComputedStyle(this);
    return Number.parseInt(style.getPropertyValue("--nt-stack-fan-limit"), 10) || 3;
  }

  private _syncViewportTokens(): void {
    if (this.offset.trim()) this.style.setProperty("--nt-viewport-offset", this.offset.trim());
    else this.style.removeProperty("--nt-viewport-offset");
    if (this.gap.trim()) this.style.setProperty("--nt-list-gap", this.gap.trim());
    else this.style.removeProperty("--nt-list-gap");
    this.style.setProperty("--nt-stack-fan-limit", String(Math.max(1, this.visibleToasts)));
  }

  private _trimOverflow(): void {
    if (this.maxVisible <= 0) return;
    while (this.notifications.filter((item) => !item.removing).length >= this.maxVisible) {
      const oldest = this.notifications.find((item) => !item.removing);
      if (!oldest) break;
      if (oldest._timeout) clearTimeout(oldest._timeout);
      clearNotificationCallbacks(oldest.id);
      clearNotificationContent(oldest.id);
      this.notifications = this.notifications.filter((item) => item.id !== oldest.id);
    }
  }

  private _syncAnchor(): void {
    if (!this._anchor) return;
    syncNotificationAnchor(this._anchor, this.position);
  }

  private _openPopover(): void {
    if (!this._popover.open && this.notifications.length > 0) {
      this._popover.openPopover();
      this._registerDismissible();
    }
  }

  private _closePopover(): void {
    if (this._popover.open) {
      this._popover.closePopover("api");
      unregisterDismissible(this);
    }
  }

  private _registerDismissible(): void {
    registerDismissible({
      host: this,
      onDismiss: () => {
        if (!isTopDismissible(this)) return;
        this._dismissFrontToast();
      },
      canDismiss: () =>
        this._popover.open &&
        this.notifications.some((item) => !item.removing),
    });
  }

  private _dismissFrontToast(): void {
    const front = [...this.notifications].reverse().find((item) => !item.removing);
    if (front) this.removeNotification(front.id);
  }

  private _runExitAnimations(): void {
    const ms = readNotificationMotionMs(this, this.layout);
    const activeIds = new Set(this.notifications.map((item) => item.id));

    for (const id of this._exitStarted) {
      if (!activeIds.has(id)) this._exitStarted.delete(id);
    }

    for (const item of this._displayItems) {
      if (!item.removing || this._exitStarted.has(item.id)) continue;
      const el = queryNotificationItem(this.shadowRoot, item.id);
      if (!el) continue;
      this._exitStarted.add(item.id);
      animateNotificationExit(el, this.position, this.layout, ms);
    }
  }

  override render() {
    return renderNotification(this._renderHost);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "vu-notification": VuNotification;
  }
}
