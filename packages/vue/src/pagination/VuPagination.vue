<script lang="ts">
export type {
  VuPaginationChangeDetail,
  VuPaginationLayout,
  VuPaginationRadius,
  VuPaginationSize,
} from "@velkin/ui/pagination";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/pagination";
import {
  VuPaginationChangeDetail,
  VuPaginationLayout,
  VuPaginationRadius,
  VuPaginationSize,
} from "@velkin/ui/pagination";

export interface Props {
  totalPages?: number;
  currentPage?: number;
  disabledPages?: number[];
  loading?: boolean;
  progress?: boolean;
  layout?: VuPaginationLayout;
  size?: VuPaginationSize;
  radius?: VuPaginationRadius;
  maxVisiblePages?: number;
  jump?: boolean;
  label?: string;
  prevLabel?: string;
  nextLabel?: string;
  jumpLabel?: string;
  jumpGoLabel?: string;
}
defineOptions({ name: "Pagination" });

const vueProps = defineProps<Props>();

const attrs = useAttrs();
const __velkinM0 = defineModel<Props["currentPage"] | undefined>("currentPage", {
  required: false,
});
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
  (e: "vu-change", payload: CustomEvent<VuPaginationChangeDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuChange: (event: CustomEvent<VuPaginationChangeDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM0.value =
        __d != null &&
        typeof __d === "object" &&
        Object.prototype.hasOwnProperty.call(__d, "currentPage")
          ? ((__d as Record<string, unknown>)["currentPage"] as Props["currentPage"])
          : undefined;
      emit("vu-change", event as CustomEvent<VuPaginationChangeDetail>);
    },
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  (props as unknown as Record<string, unknown>)["currentPage"] = __velkinM0.value;

  return h("vu-pagination", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
