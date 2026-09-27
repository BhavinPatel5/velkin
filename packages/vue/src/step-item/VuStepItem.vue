<script lang="ts">
export type {
  VuStepsLabelPlacement,
  VuStepsLayout,
  VuStepsSize,
  VuStepStatus,
  VuStepsVariant,
} from "@velkin/ui/step-item";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/step-item";
import {
  VuStepsLabelPlacement,
  VuStepsLayout,
  VuStepsSize,
  VuStepStatus,
  VuStepsVariant,
} from "@velkin/ui/step-item";

export interface Props {
  label?: string;
  subtitle?: string;
  disabled?: boolean;
  optional?: boolean;
  status?: "" | VuStepStatus;
  icon?: string;
  checkedIcon?: string;
  index?: number;
  current?: boolean;
  expandAll?: boolean;
  completed?: boolean;
  showConnector?: boolean;
  connectorActive?: boolean;
  resolvedStatus?: VuStepStatus;
  layout?: VuStepsLayout;
  hideNumbers?: boolean;
  showLabels?: boolean;
  labelPlacement?: VuStepsLabelPlacement;
  readonly?: boolean;
  size?: VuStepsSize;
  variant?: VuStepsVariant;
  stepIconDefault?: string;
  checkedIconDefault?: string;
  errorIconDefault?: string;
}
defineOptions({ name: "StepItem" });

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

  return h("vu-step-item", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
