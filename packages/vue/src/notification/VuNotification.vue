<script lang="ts">
export type {
  NotificationItemInternal,
  VuNotificationClearAllDetail,
  VuNotificationLayout,
  VuNotificationPosition,
  VuNotificationQueueDetail,
  VuNotificationRemoveDetail,
  VuNotificationVariant,
} from "@velkin/ui/notification";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/notification";
import {
  NotificationItemInternal,
  VuNotificationClearAllDetail,
  VuNotificationLayout,
  VuNotificationPosition,
  VuNotificationQueueDetail,
  VuNotificationRemoveDetail,
  VuNotificationVariant,
} from "@velkin/ui/notification";

export interface Props {
  position?: VuNotificationPosition;
  layout?: VuNotificationLayout;
  variant?: VuNotificationVariant;
  notifications?: NotificationItemInternal[];
  defaultDuration?: number;
  maxVisible?: number;
  visibleToasts?: number;
  removable?: boolean;
  mergeDuplicates?: boolean;
  closeLabel?: string;
  offset?: string;
  gap?: string;
  withProgress?: boolean;
  withPauseOnHover?: boolean;
  withPauseWhenHidden?: boolean;
  withExpandOnClick?: boolean;
  withOverflowCount?: boolean;
  withSwipeDismiss?: boolean;
  paused?: boolean;
}
defineOptions({ name: "Notification" });

const vueProps = defineProps<Props>();

const attrs = useAttrs();
const defaults = reactive({} as Props);
const vDefaults = {
  created(el: any) {
    for (const p in vueProps) {
      defaults[p as keyof Props] = el[p];
    }
  },
};

let hasRendered = false;

const emit = defineEmits<{
  (e: "vu-queue", payload: CustomEvent<VuNotificationQueueDetail>): void;
  (e: "vu-remove", payload: CustomEvent<VuNotificationRemoveDetail>): void;
  (e: "vu-clear-all", payload: CustomEvent<VuNotificationClearAllDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuQueue: (event: CustomEvent<VuNotificationQueueDetail>) =>
      emit("vu-queue", event as CustomEvent<VuNotificationQueueDetail>),
    onVuRemove: (event: CustomEvent<VuNotificationRemoveDetail>) =>
      emit("vu-remove", event as CustomEvent<VuNotificationRemoveDetail>),
    onVuClearAll: (event: CustomEvent<VuNotificationClearAllDetail>) =>
      emit("vu-clear-all", event as CustomEvent<VuNotificationClearAllDetail>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  return h("vu-notification", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
