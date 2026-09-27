<script lang="ts">
export type {
  VuCheckboxColor,
  VuCheckboxGroupChangeDetail,
  VuCheckboxGroupOrientation,
  VuCheckboxGroupRadius,
  VuCheckboxGroupValidationErrorDetail,
  VuCheckboxSize,
  VuCheckboxVariant,
  VuSurfaceTone,
} from "@velkin/ui/checkbox-group";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/checkbox-group";
import {
  VuCheckboxColor,
  VuCheckboxGroupChangeDetail,
  VuCheckboxGroupOrientation,
  VuCheckboxGroupRadius,
  VuCheckboxGroupValidationErrorDetail,
  VuCheckboxSize,
  VuCheckboxVariant,
  VuSurfaceTone,
} from "@velkin/ui/checkbox-group";

export interface Props {
  orientation?: VuCheckboxGroupOrientation;
  legend?: string;
  label?: string;
  hint?: string;
  ariaLabel?: string;
  variant?: VuCheckboxVariant;
  color?: VuCheckboxColor;
  tone?: VuSurfaceTone;
  size?: VuCheckboxSize;
  radius?: VuCheckboxGroupRadius;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  requiredMessage?: string;
  compact?: boolean;
  showErrors?: boolean;
  validationActive?: boolean;
  invalid?: boolean;
  values?: string[] | undefined;
}
defineOptions({ name: "CheckboxGroup" });

const vueProps = defineProps<Props>();

const attrs = useAttrs();
const __velkinM0 = defineModel<Props["values"] | undefined>("values", { required: false });
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
  (e: "vu-change", payload: CustomEvent<VuCheckboxGroupChangeDetail>): void;
  (e: "vu-invalid", payload: CustomEvent<VuCheckboxGroupValidationErrorDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuChange: (event: CustomEvent<VuCheckboxGroupChangeDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM0.value =
        __d != null &&
        typeof __d === "object" &&
        Object.prototype.hasOwnProperty.call(__d, "values")
          ? ((__d as Record<string, unknown>)["values"] as Props["values"])
          : undefined;
      emit("vu-change", event as CustomEvent<VuCheckboxGroupChangeDetail>);
    },
    onVuInvalid: (event: CustomEvent<VuCheckboxGroupValidationErrorDetail>) =>
      emit("vu-invalid", event as CustomEvent<VuCheckboxGroupValidationErrorDetail>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  (props as unknown as Record<string, unknown>)["values"] = __velkinM0.value;

  return h("vu-checkbox-group", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
