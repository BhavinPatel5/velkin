<script lang="ts">
export type {
  VuCardActivateDetail,
  VuCardDivider,
  VuCardOrientation,
  VuCardRadius,
  VuCardSize,
  VuCardTone,
  VuCardVariant,
} from "@velkin/ui/card";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/card";
import {
  VuCardActivateDetail,
  VuCardDivider,
  VuCardOrientation,
  VuCardRadius,
  VuCardSize,
  VuCardTone,
  VuCardVariant,
} from "@velkin/ui/card";

export interface Props {
  variant?: VuCardVariant;
  tone?: VuSurfaceTone;
  size?: VuCardSize;
  radius?: VuCardRadius;
  orientation?: VuCardOrientation;
  divider?: VuCardDivider;
  flush?: boolean;
  interactive?: boolean;
  selected?: boolean;
  disabled?: boolean;
  label?: string;
}
defineOptions({ name: "Card" });

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
  (e: "vu-activate", payload: CustomEvent<VuCardActivateDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuActivate: (event: CustomEvent<VuCardActivateDetail>) =>
      emit("vu-activate", event as CustomEvent<VuCardActivateDetail>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  return h("vu-card", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
