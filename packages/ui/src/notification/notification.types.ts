import type { TemplateResult } from "lit";

/** Screen corner/center where the toast region anchors. */
export type VuNotificationPosition =
  | "top-start"
  | "top-center"
  | "top-end"
  | "bottom-start"
  | "bottom-center"
  | "bottom-end";

/** `list` stacks vertically; `stack` fans cards with peek on hover. */
export type VuNotificationLayout = "list" | "stack";

/** Intent palette — token keys only. */
export type VuNotificationColor = "default" | "primary" | "success" | "warning" | "danger";

/** Status surface recipe — not overlay `elevated`|`outline`|`soft`. */
export type VuNotificationVariant = "flat" | "soft" | "solid" | "bordered";

/** Message alignment inside a toast item. */
export type VuNotificationTextAlign = "start" | "center" | "end";

/** Transient loading state for promise toasts. */
export type VuNotificationState = "idle" | "loading";

/** Optional action button on a toast. */
export type VuNotificationAction = {
  label: string;
  onPress?: () => void;
};

/** Context passed to custom toast renderers. */
export type VuNotificationContentContext = {
  id: number;
  dismiss: () => void;
};

/** Lit template factory for fully custom toast bodies. */
export type VuNotificationContentFn = (
  ctx: VuNotificationContentContext,
) => TemplateResult;

/** Input for `addNotification()` / `notify()`. */
export type VuNotificationAddInput = {
  title?: string;
  message?: string;
  color?: VuNotificationColor;
  variant?: VuNotificationVariant;
  /** Ms until auto-dismiss; omit for provider `defaultDuration`; `0` keeps the toast open. */
  duration?: number | null;
  image?: string;
  imageAlt?: string;
  icon?: string | null;
  textAlign?: VuNotificationTextAlign;
  state?: VuNotificationState;
  action?: VuNotificationAction;
  onClose?: () => void;
  /** Per-toast dismiss control; defaults to host `removable`. */
  removable?: boolean;
  /** Custom body; skips the preset title/message layout when set. */
  content?: TemplateResult | VuNotificationContentFn;
  /** Routes to `<vu-notification-provider providerid="…">`; uses the default provider when omitted. */
  toasterId?: string;
  /** Extra class names merged onto `[part="item"]`. */
  itemClass?: string;
  /** Extra inline styles merged onto `[part="item"]`. */
  itemStyle?: Record<string, string>;
};

/** Partial patch for `updateNotification()` / `notify.update()`. */
export type VuNotificationUpdateInput = Partial<VuNotificationAddInput>;

/** Rendered notification item. */
export type VuNotificationItem = {
  id: number;
  title: string;
  message: string;
  color: VuNotificationColor;
  variant: VuNotificationVariant;
  textAlign: VuNotificationTextAlign;
  state: VuNotificationState;
  removing: boolean;
  count: number;
  custom: boolean;
  duration?: number | null;
  image?: string;
  imageAlt?: string;
  icon?: string | null;
  actionLabel?: string;
  removable: boolean;
  itemClass?: string;
  itemStyle?: Record<string, string>;
  /** Resolved auto-dismiss ms used for the progress bar; `null` when persistent. */
  durationMs: number | null;
};

/** `vu-queue` when a notification is queued. */
export type VuNotificationQueueDetail = { item: VuNotificationItem };

/** `vu-remove` after exit animation completes. */
export type VuNotificationRemoveDetail = { id: number };

/** `vu-clear-all` after all items are dismissed. */
export type VuNotificationClearAllDetail = Record<string, never>;

/** Messages for `notify.promise()`. */
export type VuNotificationPromiseMessages<T> = {
  loading: string | VuNotificationAddInput;
  success: string | ((value: T) => string | VuNotificationAddInput);
  error: string | ((reason: unknown) => string | VuNotificationAddInput);
};
