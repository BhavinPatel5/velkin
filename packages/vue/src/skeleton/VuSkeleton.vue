<script lang="ts">
export type { VuSkeletonAnimation, VuSkeletonTone, VuSkeletonVariant } from "@velkin/ui/skeleton";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/skeleton";
import { VuSkeletonAnimation, VuSkeletonTone, VuSkeletonVariant } from "@velkin/ui/skeleton";

export interface Props {
  variant?: VuSkeletonVariant;
  width?: string;
  height?: string;
  radius?: string;
  animation?: VuSkeletonAnimation;
  tone?: VuSkeletonTone;
  inline?: boolean;
}
defineOptions({ name: "Skeleton" });

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

  return h("vu-skeleton", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
