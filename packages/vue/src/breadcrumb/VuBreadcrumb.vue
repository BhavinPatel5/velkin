<script lang="ts">
export type {
  VuBreadcrumbOverflow,
  VuBreadcrumbRevealDetail,
  VuBreadcrumbSize,
} from "@velkin/ui/breadcrumb";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/breadcrumb";
import {
  VuBreadcrumbOverflow,
  VuBreadcrumbRevealDetail,
  VuBreadcrumbSize,
} from "@velkin/ui/breadcrumb";

export interface Props {
  separator?: string;
  size?: VuBreadcrumbSize;
  max?: number;
  itemsBefore?: number;
  itemsAfter?: number;
  responsive?: boolean;
  overflow?: VuBreadcrumbOverflow;
  expanded?: boolean;
  showExpandAction?: boolean;
  expandActionLabel?: string;
  disabled?: boolean;
  label?: string;
}
defineOptions({ name: "Breadcrumb" });

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
  (e: "vu-reveal", payload: CustomEvent<VuBreadcrumbRevealDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuReveal: (event: CustomEvent<VuBreadcrumbRevealDetail>) =>
      emit("vu-reveal", event as CustomEvent<VuBreadcrumbRevealDetail>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  return h("vu-breadcrumb", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
