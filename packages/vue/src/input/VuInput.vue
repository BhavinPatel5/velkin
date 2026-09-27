<script lang="ts">
export type {
  VuFieldVariant,
  VuInputChangeDetail,
  VuInputClearDetail,
  VuInputFileDetail,
  VuInputInvalidDetail,
  VuInputRadius,
  VuInputSize,
  VuInputValue,
  VuSurfaceTone,
} from "@velkin/ui/input";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/input";
import {
  VuFieldVariant,
  VuInputChangeDetail,
  VuInputClearDetail,
  VuInputFileDetail,
  VuInputInvalidDetail,
  VuInputRadius,
  VuInputSize,
  VuInputValue,
  VuSurfaceTone,
} from "@velkin/ui/input";

export interface Props {
  variant?: VuFieldVariant;
  tone?: VuSurfaceTone;
  size?: VuInputSize;
  radius?: VuInputRadius;
  block?: boolean;
  value?: VuInputValue;
  placeholder?: string;
  label?: string;
  hint?: string;
  type?: string;
  compact?: boolean;
  loading?: boolean;
  showErrors?: boolean;
  clearable?: boolean;
  showNumberButtons?: boolean;
  showPasswordToggle?: boolean;
  required?: boolean;
  step?: string | null;
  min?: string | null;
  max?: string | null;
  autocapitalize?: string;
  autocomplete?: string;
  spellcheck?: boolean;
  dir?: string;
  rows?: number;
  resizable?: string;
  accept?: string;
  multiple?: boolean;
  inputmode?: string | null;
  enterkeyhint?: string | null;
  pattern?: string | null;
  minlength?: number | null;
  maxlength?: number | null;
  list?: string | null;
  nativeSize?: number | null;
  autofocus?: boolean;
  capture?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string | null;
  id?: string;
  validationActive?: boolean;
  invalid?: boolean;
}
defineOptions({ name: "Input" });

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
  (e: "vu-change", payload: CustomEvent<VuInputChangeDetail>): void;
  (e: "vu-clear", payload: CustomEvent<VuInputClearDetail>): void;
  (e: "vu-invalid", payload: CustomEvent<VuInputInvalidDetail>): void;
  (e: "vu-file", payload: CustomEvent<VuInputFileDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuChange: (event: CustomEvent<VuInputChangeDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM0.value =
        __d != null && typeof __d === "object" && Object.prototype.hasOwnProperty.call(__d, "value")
          ? ((__d as Record<string, unknown>)["value"] as Props["value"])
          : undefined;
      emit("vu-change", event as CustomEvent<VuInputChangeDetail>);
    },
    onVuClear: (event: CustomEvent<VuInputClearDetail>) =>
      emit("vu-clear", event as CustomEvent<VuInputClearDetail>),
    onVuInvalid: (event: CustomEvent<VuInputInvalidDetail>) =>
      emit("vu-invalid", event as CustomEvent<VuInputInvalidDetail>),
    onVuFile: (event: CustomEvent<VuInputFileDetail>) =>
      emit("vu-file", event as CustomEvent<VuInputFileDetail>),
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

  return h("vu-input", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
