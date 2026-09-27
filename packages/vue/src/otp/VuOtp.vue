<script lang="ts">
export type {
  VuOtpChangeDetail,
  VuOtpClearDetail,
  VuOtpInvalidDetail,
  VuOtpRadius,
  VuOtpSize,
  VuOtpTone,
  VuOtpVariant,
} from "@velkin/ui/otp";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/otp";
import {
  VuOtpChangeDetail,
  VuOtpClearDetail,
  VuOtpInvalidDetail,
  VuOtpRadius,
  VuOtpSize,
  VuOtpTone,
  VuOtpVariant,
} from "@velkin/ui/otp";

export interface Props {
  variant?: VuOtpVariant;
  tone?: VuOtpTone;
  size?: VuOtpSize;
  radius?: VuOtpRadius;
  block?: boolean;
  compact?: boolean;
  length?: number;
  alphanumeric?: boolean;
  value?: string;
  masked?: boolean;
  label?: string;
  hint?: string;
  incompleteMessage?: string;
  ariaLabel?: string;
  id?: string;
  showErrors?: boolean;
  validationActive?: boolean;
  invalid?: boolean;
}
defineOptions({ name: "Otp" });

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
  (e: "vu-change", payload: CustomEvent<VuOtpChangeDetail>): void;
  (e: "vu-invalid", payload: CustomEvent<VuOtpInvalidDetail>): void;
  (e: "vu-clear", payload: CustomEvent<VuOtpClearDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuChange: (event: CustomEvent<VuOtpChangeDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM0.value =
        __d != null && typeof __d === "object" && Object.prototype.hasOwnProperty.call(__d, "value")
          ? ((__d as Record<string, unknown>)["value"] as Props["value"])
          : undefined;
      emit("vu-change", event as CustomEvent<VuOtpChangeDetail>);
    },
    onVuInvalid: (event: CustomEvent<VuOtpInvalidDetail>) =>
      emit("vu-invalid", event as CustomEvent<VuOtpInvalidDetail>),
    onVuClear: (event: CustomEvent<VuOtpClearDetail>) =>
      emit("vu-clear", event as CustomEvent<VuOtpClearDetail>),
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

  return h("vu-otp", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
