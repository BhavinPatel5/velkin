<script lang="ts">
export type { VuAdaptiveItemSize, VuAdaptiveItemSizeDetail } from "@velkin/ui/adaptive-item";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/adaptive-item";
import { VuAdaptiveItemSize, VuAdaptiveItemSizeDetail } from "@velkin/ui/adaptive-item";

export interface Props {
  size?: VuAdaptiveItemSize;
  disabled?: boolean;
}
defineOptions({ name: "AdaptiveItem" });

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
  (e: "vu-resize", payload: CustomEvent<VuAdaptiveItemSizeDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuResize: (event: CustomEvent<VuAdaptiveItemSizeDetail>) =>
      emit("vu-resize", event as CustomEvent<VuAdaptiveItemSizeDetail>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  return h("vu-adaptive-item", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
