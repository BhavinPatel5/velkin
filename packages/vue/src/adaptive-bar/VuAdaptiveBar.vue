<script lang="ts">
export type {
  PopoverSide,
  VuAdaptiveBarJustify,
  VuAdaptiveBarOpenChangeDetail,
  VuAdaptiveBarSize,
  VuAdaptiveBarVariant,
  VuAdaptiveItemSize,
  VuSurfaceTone,
} from "@velkin/ui/adaptive-bar";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/adaptive-bar";
import {
  PopoverSide,
  VuAdaptiveBarJustify,
  VuAdaptiveBarOpenChangeDetail,
  VuAdaptiveBarSize,
  VuAdaptiveBarVariant,
  VuAdaptiveItemSize,
  VuSurfaceTone,
} from "@velkin/ui/adaptive-bar";

export interface Props {
  variant?: VuAdaptiveBarVariant;
  tone?: VuSurfaceTone;
  size?: VuAdaptiveBarSize;
  justify?: VuAdaptiveBarJustify;
  itemSize?: VuAdaptiveItemSize;
  menuOpen?: boolean;
  gapThreshold?: number;
  moreLabel?: string;
  placement?: PopoverSide;
}
defineOptions({ name: "AdaptiveBar" });

const vueProps = defineProps<Props>();

const attrs = useAttrs();
const __velkinM0 = defineModel<Props["menuOpen"] | undefined>("menuOpen", { required: false });
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
  (e: "vu-open-change", payload: CustomEvent<VuAdaptiveBarOpenChangeDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuOpenChange: (event: CustomEvent<VuAdaptiveBarOpenChangeDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM0.value =
        __d != null && typeof __d === "object" && Object.prototype.hasOwnProperty.call(__d, "open")
          ? ((__d as Record<string, unknown>)["open"] as Props["menuOpen"])
          : undefined;
      emit("vu-open-change", event as CustomEvent<VuAdaptiveBarOpenChangeDetail>);
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

  (props as unknown as Record<string, unknown>)["menuOpen"] = __velkinM0.value;

  return h("vu-adaptive-bar", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
