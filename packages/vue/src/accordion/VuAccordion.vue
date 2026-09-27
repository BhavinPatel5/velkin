<script lang="ts">
export type {
  VuAccordionItemOpenChangeDetail,
  VuAccordionSize,
  VuAccordionTone,
  VuAccordionVariant,
} from "@velkin/ui/accordion";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/accordion";
import {
  VuAccordionItemOpenChangeDetail,
  VuAccordionSize,
  VuAccordionTone,
  VuAccordionVariant,
} from "@velkin/ui/accordion";

export interface Props {
  multiple?: boolean;
  collapsible?: boolean;
  variant?: VuAccordionVariant;
  tone?: VuSurfaceTone;
  size?: VuAccordionSize;
  disabled?: boolean;
  flush?: boolean;
}
defineOptions({ name: "Accordion" });

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
  (e: "vu-open-change", payload: CustomEvent<VuAccordionItemOpenChangeDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuOpenChange: (event: CustomEvent<VuAccordionItemOpenChangeDetail>) =>
      emit("vu-open-change", event as CustomEvent<VuAccordionItemOpenChangeDetail>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  return h("vu-accordion", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
