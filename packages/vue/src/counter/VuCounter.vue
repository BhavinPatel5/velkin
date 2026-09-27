<script lang="ts">
export type {
  VuCounterChangeDetail,
  VuCounterClearDetail,
  VuCounterInvalidDetail,
  VuCounterRadius,
  VuCounterSize,
  VuCounterTone,
  VuCounterVariant,
} from "@velkin/ui/counter";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/counter";
import {
  VuCounterChangeDetail,
  VuCounterClearDetail,
  VuCounterInvalidDetail,
  VuCounterRadius,
  VuCounterSize,
  VuCounterTone,
  VuCounterVariant,
} from "@velkin/ui/counter";

export interface Props {
  variant?: VuFieldVariant;
  tone?: VuSurfaceTone;
  size?: VuCounterSize;
  radius?: VuCounterRadius;
  block?: boolean;
  compact?: boolean;
  value?: number;
  min?: number;
  max?: number | undefined;
  step?: number;
  allowTyping?: boolean;
  allowEmpty?: boolean;
  wrap?: boolean;
  commitOnly?: boolean;
  precision?: number;
  placeholder?: string;
  label?: string;
  hint?: string;
  showErrors?: boolean;
  iconDecrease?: string;
  iconIncrease?: string;
  defaultNumber?: number;
  decreaseLabel?: string;
  increaseLabel?: string;
  ariaLabel?: string;
  holdDelay?: number;
  holdInterval?: number;
  holdAccelerate?: boolean;
  id?: string;
  invalid?: boolean;
  validationActive?: boolean;
}
defineOptions({ name: "Counter" });

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
  (e: "vu-change", payload: CustomEvent<VuCounterChangeDetail>): void;
  (e: "vu-clear", payload: CustomEvent<VuCounterClearDetail>): void;
  (e: "vu-invalid", payload: CustomEvent<VuCounterInvalidDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuChange: (event: CustomEvent<VuCounterChangeDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM0.value =
        __d != null && typeof __d === "object" && Object.prototype.hasOwnProperty.call(__d, "value")
          ? ((__d as Record<string, unknown>)["value"] as Props["value"])
          : undefined;
      emit("vu-change", event as CustomEvent<VuCounterChangeDetail>);
    },
    onVuClear: (event: CustomEvent<VuCounterClearDetail>) =>
      emit("vu-clear", event as CustomEvent<VuCounterClearDetail>),
    onVuInvalid: (event: CustomEvent<VuCounterInvalidDetail>) =>
      emit("vu-invalid", event as CustomEvent<VuCounterInvalidDetail>),
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

  return h("vu-counter", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
