<script lang="ts">
export type {
  VuSliderChangeDetail,
  VuSliderClearDetail,
  VuSliderInvalidDetail,
  VuSliderRadius,
  VuSliderSize,
  VuSliderTone,
  VuSliderVariant,
} from "@velkin/ui/slider";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/slider";
import {
  VuSliderChangeDetail,
  VuSliderClearDetail,
  VuSliderInvalidDetail,
  VuSliderRadius,
  VuSliderSize,
  VuSliderTone,
  VuSliderVariant,
} from "@velkin/ui/slider";

export interface Props {
  variant?: VuSliderVariant;
  tone?: VuSliderTone;
  size?: VuSliderSize;
  radius?: VuSliderRadius;
  block?: boolean;
  compact?: boolean;
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  displayValue?: number;
  label?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  showValue?: boolean;
  commitOnly?: boolean;
  ariaLabel?: string;
  id?: string;
  showErrors?: boolean;
  validationActive?: boolean;
  invalid?: boolean;
}
defineOptions({ name: "Slider" });

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
  (e: "vu-change", payload: CustomEvent<VuSliderChangeDetail>): void;
  (e: "vu-invalid", payload: CustomEvent<VuSliderInvalidDetail>): void;
  (e: "vu-clear", payload: CustomEvent<VuSliderClearDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuChange: (event: CustomEvent<VuSliderChangeDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM0.value =
        __d != null && typeof __d === "object" && Object.prototype.hasOwnProperty.call(__d, "value")
          ? ((__d as Record<string, unknown>)["value"] as Props["value"])
          : undefined;
      emit("vu-change", event as CustomEvent<VuSliderChangeDetail>);
    },
    onVuInvalid: (event: CustomEvent<VuSliderInvalidDetail>) =>
      emit("vu-invalid", event as CustomEvent<VuSliderInvalidDetail>),
    onVuClear: (event: CustomEvent<VuSliderClearDetail>) =>
      emit("vu-clear", event as CustomEvent<VuSliderClearDetail>),
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

  return h("vu-slider", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
