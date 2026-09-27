<script lang="ts">
export type {
  VuFormAutocomplete,
  VuFormChangeDetail,
  VuFormEnctype,
  VuFormFormDataFallbackDetail,
  VuFormInvalidDetail,
  VuFormMethod,
  VuFormMode,
  VuFormSubmitDetail,
} from "@velkin/ui/form";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/form";
import {
  VuFormAutocomplete,
  VuFormChangeDetail,
  VuFormEnctype,
  VuFormFormDataFallbackDetail,
  VuFormInvalidDetail,
  VuFormMethod,
  VuFormMode,
  VuFormSubmitDetail,
} from "@velkin/ui/form";

export interface Props {
  liveValidation?: boolean;
  showErrors?: boolean;
  mode?: VuFormMode;
  method?: VuFormMethod | undefined;
  action?: string | undefined;
  target?: string | undefined;
  enctype?: VuFormEnctype | undefined;
  autocomplete?: VuFormAutocomplete | undefined;
  noValidate?: boolean;
  enterSubmit?: boolean;
  resetOnSubmit?: boolean;
  csrfToken?: string | null;
}
defineOptions({ name: "Form" });

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
  (e: "vu-change", payload: CustomEvent<VuFormChangeDetail>): void;
  (e: "vu-invalid", payload: CustomEvent<VuFormInvalidDetail>): void;
  (e: "formdata", payload: CustomEvent<VuFormFormDataFallbackDetail> | FormDataEvent): void;
  (e: "vu-submit", payload: CustomEvent<VuFormSubmitDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuChange: (event: CustomEvent<VuFormChangeDetail>) =>
      emit("vu-change", event as CustomEvent<VuFormChangeDetail>),
    onVuInvalid: (event: CustomEvent<VuFormInvalidDetail>) =>
      emit("vu-invalid", event as CustomEvent<VuFormInvalidDetail>),
    onFormdata: (event: CustomEvent<VuFormFormDataFallbackDetail> | FormDataEvent) =>
      emit("formdata", event as CustomEvent<VuFormFormDataFallbackDetail> | FormDataEvent),
    onVuSubmit: (event: CustomEvent<VuFormSubmitDetail>) =>
      emit("vu-submit", event as CustomEvent<VuFormSubmitDetail>),
  };
  const props = eventProps as typeof eventProps & Props;

  for (const p in vueProps) {
    const v = vueProps[p as keyof Props];
    if (v !== undefined || hasRendered) {
      (props[p as keyof Props] as unknown) = v ?? defaults[p as keyof Props];
    }
  }

  hasRendered = true;

  return h("vu-form", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
