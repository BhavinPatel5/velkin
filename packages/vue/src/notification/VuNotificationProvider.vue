<script lang="ts">
export type {
  VuNotificationLayout,
  VuNotificationPosition,
  VuNotificationVariant,
} from "@velkin/ui/notification";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/notification";
import {
  VuNotificationLayout,
  VuNotificationPosition,
  VuNotificationVariant,
} from "@velkin/ui/notification";

export interface Props {
  providerId?: string;
  position?: VuNotificationPosition;
  layout?: VuNotificationLayout;
  variant?: VuNotificationVariant;
  defaultDuration?: number;
  maxVisible?: number;
  visibleToasts?: number;
  removable?: boolean;
  mergeDuplicates?: boolean;
  offset?: string;
  gap?: string;
  withProgress?: boolean;
  withPauseOnHover?: boolean;
  withPauseWhenHidden?: boolean;
  withExpandOnClick?: boolean;
  withOverflowCount?: boolean;
  withSwipeDismiss?: boolean;
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

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {};
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  return h("vu-notification-provider", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
