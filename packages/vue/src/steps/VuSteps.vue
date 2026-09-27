<script lang="ts">
export type {
  VuStepsChangeDetail,
  VuStepsLabelPlacement,
  VuStepsLayout,
  VuStepsSize,
  VuStepStateItem,
  VuStepsVariant,
} from "@velkin/ui/steps";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/steps";
import {
  VuStepsChangeDetail,
  VuStepsLabelPlacement,
  VuStepsLayout,
  VuStepsSize,
  VuStepStateItem,
  VuStepsVariant,
} from "@velkin/ui/steps";

export interface Props {
  steps?: VuStepStateItem[];
  currentStep?: number;
  defaultCurrentStep?: number;
  lastCompletedStep?: number;
  layout?: VuStepsLayout;
  labelPlacement?: VuStepsLabelPlacement;
  size?: VuStepsSize;
  variant?: VuStepsVariant;
  allowStepJump?: boolean;
  hideNumbers?: boolean;
  showLabels?: boolean;
  compact?: boolean;
  readonly?: boolean;
  expandAll?: boolean;
  label?: string;
  completedSteps?: number[] | null;
  stepIcon?: string;
  checkedIcon?: string;
  errorIcon?: string;
}
defineOptions({ name: "Steps" });

const vueProps = defineProps<Props>();

const attrs = useAttrs();
const __velkinM0 = defineModel<Props["currentStep"] | undefined>("currentStep", {
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
  (e: "vu-change", payload: CustomEvent<VuStepsChangeDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuChange: (event: CustomEvent<VuStepsChangeDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM0.value =
        __d != null && typeof __d === "object" && Object.prototype.hasOwnProperty.call(__d, "step")
          ? ((__d as Record<string, unknown>)["step"] as Props["currentStep"])
          : undefined;
      emit("vu-change", event as CustomEvent<VuStepsChangeDetail>);
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

  (props as unknown as Record<string, unknown>)["currentStep"] = __velkinM0.value;

  return h("vu-steps", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
