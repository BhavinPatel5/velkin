<script lang="ts">
export type {
  VuRadioColor,
  VuRadioGroupChangeDetail,
  VuRadioGroupOrientation,
  VuRadioGroupValidationErrorDetail,
  VuRadioSize,
  VuRadioVariant,
  VuSurfaceTone,
} from "@velkin/ui/radio-group";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/radio-group";
import {
  VuRadioColor,
  VuRadioGroupChangeDetail,
  VuRadioGroupOrientation,
  VuRadioGroupValidationErrorDetail,
  VuRadioSize,
  VuRadioVariant,
  VuSurfaceTone,
} from "@velkin/ui/radio-group";

export interface Props {
  orientation?: VuRadioGroupOrientation;
  legend?: string;
  label?: string;
  hint?: string;
  ariaLabel?: string;
  variant?: VuRadioVariant;
  color?: VuRadioColor;
  tone?: VuSurfaceTone;
  size?: VuRadioSize;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  requiredMessage?: string;
  compact?: boolean;
  showErrors?: boolean;
  validationActive?: boolean;
  invalid?: boolean;
  value?: string | undefined;
}
defineOptions({ name: "RadioGroup" });

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
  (e: "vu-change", payload: CustomEvent<VuRadioGroupChangeDetail>): void;
  (e: "vu-invalid", payload: CustomEvent<VuRadioGroupValidationErrorDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuChange: (event: CustomEvent<VuRadioGroupChangeDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM0.value =
        __d != null && typeof __d === "object" && Object.prototype.hasOwnProperty.call(__d, "value")
          ? ((__d as Record<string, unknown>)["value"] as Props["value"])
          : undefined;
      emit("vu-change", event as CustomEvent<VuRadioGroupChangeDetail>);
    },
    onVuInvalid: (event: CustomEvent<VuRadioGroupValidationErrorDetail>) =>
      emit("vu-invalid", event as CustomEvent<VuRadioGroupValidationErrorDetail>),
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

  return h("vu-radio-group", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
