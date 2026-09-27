<script lang="ts">
export type { VuBreadcrumbItemActivateDetail, VuBreadcrumbSize } from "@velkin/ui/breadcrumb-item";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/breadcrumb-item";
import { VuBreadcrumbItemActivateDetail, VuBreadcrumbSize } from "@velkin/ui/breadcrumb-item";

export interface Props {
  href?: string;
  current?: boolean;
  disabled?: boolean;
  target?: string;
  rel?: string;
  size?: VuBreadcrumbSize;
  first?: boolean;
}
defineOptions({ name: "BreadcrumbItem" });

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
  (e: "vu-activate", payload: CustomEvent<VuBreadcrumbItemActivateDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuActivate: (event: CustomEvent<VuBreadcrumbItemActivateDetail>) =>
      emit("vu-activate", event as CustomEvent<VuBreadcrumbItemActivateDetail>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  return h("vu-breadcrumb-item", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
