<script lang="ts">
export type {
  VuAlertCloseDetail,
  VuAlertColor,
  VuAlertSize,
  VuAlertVariant,
} from "@velkin/ui/alert";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/alert";
import { VuAlertCloseDetail, VuAlertColor, VuAlertSize, VuAlertVariant } from "@velkin/ui/alert";

export interface Props {
  color?: VuAlertColor;
  variant?: VuAlertVariant;
  size?: VuAlertSize;
  heading?: string;
  message?: string;
  icon?: string | null;
  removable?: boolean;
  closeLabel?: string;
}
defineOptions({ name: "Alert" });

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
  (e: "vu-close", payload: CustomEvent<VuAlertCloseDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuClose: (event: CustomEvent<VuAlertCloseDetail>) =>
      emit("vu-close", event as CustomEvent<VuAlertCloseDetail>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  return h("vu-alert", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
