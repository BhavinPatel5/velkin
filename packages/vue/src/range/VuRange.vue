<script lang="ts">
export type {
  VuRangeChangeDetail,
  VuRangeClearDetail,
  VuRangeInvalidDetail,
  VuRangeRadius,
  VuRangeSize,
  VuRangeTone,
  VuRangeVariant,
} from "@velkin/ui/range";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/range";
import {
  VuRangeChangeDetail,
  VuRangeClearDetail,
  VuRangeInvalidDetail,
  VuRangeRadius,
  VuRangeSize,
  VuRangeTone,
  VuRangeVariant,
} from "@velkin/ui/range";

export interface Props {
  variant?: VuRangeVariant;
  tone?: VuRangeTone;
  size?: VuRangeSize;
  radius?: VuRangeRadius;
  block?: boolean;
  compact?: boolean;
  from?: number;
  to?: number;
  min?: number;
  max?: number;
  step?: number;
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
defineOptions({ name: "Range" });

const vueProps = defineProps<Props>();

const attrs = useAttrs();
const __velkinM0 = defineModel<Props["from"] | undefined>("from", { required: false });
const __velkinM1 = defineModel<Props["to"] | undefined>("to", { required: false });
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
  (e: "vu-change", payload: CustomEvent<VuRangeChangeDetail>): void;
  (e: "vu-invalid", payload: CustomEvent<VuRangeInvalidDetail>): void;
  (e: "vu-clear", payload: CustomEvent<VuRangeClearDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuChange: (event: CustomEvent<VuRangeChangeDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM0.value =
        __d != null && typeof __d === "object" && Object.prototype.hasOwnProperty.call(__d, "from")
          ? ((__d as Record<string, unknown>)["from"] as Props["from"])
          : undefined;
      __velkinM1.value =
        __d != null && typeof __d === "object" && Object.prototype.hasOwnProperty.call(__d, "to")
          ? ((__d as Record<string, unknown>)["to"] as Props["to"])
          : undefined;
      emit("vu-change", event as CustomEvent<VuRangeChangeDetail>);
    },
    onVuInvalid: (event: CustomEvent<VuRangeInvalidDetail>) =>
      emit("vu-invalid", event as CustomEvent<VuRangeInvalidDetail>),
    onVuClear: (event: CustomEvent<VuRangeClearDetail>) =>
      emit("vu-clear", event as CustomEvent<VuRangeClearDetail>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  (props as unknown as Record<string, unknown>)["from"] = __velkinM0.value;
  (props as unknown as Record<string, unknown>)["to"] = __velkinM1.value;

  return h("vu-range", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
