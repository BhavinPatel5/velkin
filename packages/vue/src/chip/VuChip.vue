<script lang="ts">
export type {
  VuChipChangeDetail,
  VuChipCloseDetail,
  VuChipColor,
  VuChipRadius,
  VuChipSize,
  VuChipVariant,
} from "@velkin/ui/chip";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/chip";
import {
  VuChipChangeDetail,
  VuChipCloseDetail,
  VuChipColor,
  VuChipRadius,
  VuChipSize,
  VuChipVariant,
} from "@velkin/ui/chip";

export interface Props {
  label?: string;
  value?: string;
  removable?: boolean;
  color?: VuChipColor;
  radius?: VuChipRadius;
  size?: VuChipSize;
  iconStart?: string;
  iconEnd?: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: VuChipVariant;
  selected?: boolean;
  interactive?: boolean;
  iconOnly?: boolean;
  href?: string;
  target?: string;
  rel?: string;
  closeLabel?: string;
  ariaLabel?: string;
}
defineOptions({ name: "Chip" });

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
  (e: "vu-close", payload: CustomEvent<VuChipCloseDetail>): void;
  (e: "vu-change", payload: CustomEvent<VuChipChangeDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuClose: (event: CustomEvent<VuChipCloseDetail>) =>
      emit("vu-close", event as CustomEvent<VuChipCloseDetail>),
    onVuChange: (event: CustomEvent<VuChipChangeDetail>) =>
      emit("vu-change", event as CustomEvent<VuChipChangeDetail>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  return h("vu-chip", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
