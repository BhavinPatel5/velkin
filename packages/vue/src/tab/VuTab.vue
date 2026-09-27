<script lang="ts">
export type {
  VuTabChangeDetail,
  VuTabColor,
  VuTabOrientation,
  VuTabRadius,
  VuTabSize,
  VuTabStateItem,
} from "@velkin/ui/tab";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/tab";
import {
  VuTabChangeDetail,
  VuTabColor,
  VuTabOrientation,
  VuTabRadius,
  VuTabSize,
  VuTabStateItem,
} from "@velkin/ui/tab";

export interface Props {
  states?: VuTabStateItem[];
  value?: string | undefined;
  defaultValue?: string;
  disabled?: boolean;
  label?: string;
  size?: VuTabSize;
  orientation?: VuTabOrientation;
  stretch?: boolean;
  gap?: string;
  radius?: VuTabRadius;
  showCurrentLabelOnly?: boolean;
  iconOnly?: boolean;
  color?: VuTabColor;
}
defineOptions({ name: "Tab" });

const vueProps = defineProps<Props>();

const attrs = useAttrs();
const __velkinM0 = defineModel<Props["value"] | undefined>("value", { required: false });
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
  (e: "vu-change", payload: CustomEvent<VuTabChangeDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuChange: (event: CustomEvent<VuTabChangeDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM0.value =
        __d != null && typeof __d === "object" && Object.prototype.hasOwnProperty.call(__d, "value")
          ? ((__d as Record<string, unknown>)["value"] as Props["value"])
          : undefined;
      emit("vu-change", event as CustomEvent<VuTabChangeDetail>);
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

  (props as unknown as Record<string, unknown>)["value"] = __velkinM0.value;

  return h("vu-tab", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
