<script lang="ts">
export type {
  VuColorAreaChannel,
  VuColorAreaColorSpace,
  VuColorPickerChangeDetail,
  VuColorPickerFormat,
  VuColorPickerPlacement,
  VuColorPickerTrigger,
  VuColorSliderOrientation,
} from "@velkin/ui/color-picker";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/color-picker";
import {
  VuColorAreaChannel,
  VuColorAreaColorSpace,
  VuColorPickerChangeDetail,
  VuColorPickerFormat,
  VuColorPickerPlacement,
  VuColorPickerTrigger,
  VuColorSliderOrientation,
} from "@velkin/ui/color-picker";

export interface Props {
  value?: string;
  format?: VuColorPickerFormat;
  showAlpha?: boolean;
  showFormat?: boolean;
  swatches?: string[];
  label?: string;
  formatLabel?: string;
  swatchesLabel?: string;
  trigger?: VuColorPickerTrigger;
  placement?: VuColorPickerPlacement;
  open?: boolean;
  planeColorSpace?: VuColorAreaColorSpace;
  planeXChannel?: VuColorAreaChannel;
  planeYChannel?: VuColorAreaChannel;
  planeShowDots?: boolean;
  showArea?: boolean;
  showHueSlider?: boolean;
  showInput?: boolean;
  showPreview?: boolean;
  sliderOrientation?: VuColorSliderOrientation;
  showErrors?: boolean;
  validationActive?: boolean;
  invalid?: boolean;
}
defineOptions({ name: "ColorPicker" });

const vueProps = defineProps<Props>();

const attrs = useAttrs();
const __velkinM0 = defineModel<Props["value"] | undefined>("value", { required: false });
const __velkinM1 = defineModel<Props["open"] | undefined>("open", { required: false });
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
  (e: "vu-input", payload: CustomEvent<VuColorPickerChangeDetail>): void;
  (e: "vu-change", payload: CustomEvent<VuColorPickerChangeDetail>): void;
  (e: "vu-open-change", payload: CustomEvent<{ open: boolean }>): void;
  (e: "vu-open", payload: CustomEvent): void;
  (e: "vu-close", payload: CustomEvent): void;
  (e: "vu-invalid", payload: CustomEvent): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuInput: (event: CustomEvent<VuColorPickerChangeDetail>) =>
      emit("vu-input", event as CustomEvent<VuColorPickerChangeDetail>),
    onVuChange: (event: CustomEvent<VuColorPickerChangeDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM0.value =
        __d != null && typeof __d === "object" && Object.prototype.hasOwnProperty.call(__d, "value")
          ? ((__d as Record<string, unknown>)["value"] as Props["value"])
          : undefined;
      emit("vu-change", event as CustomEvent<VuColorPickerChangeDetail>);
    },
    onVuOpenChange: (event: CustomEvent<{ open: boolean }>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM1.value =
        __d != null && typeof __d === "object" && Object.prototype.hasOwnProperty.call(__d, "open")
          ? ((__d as Record<string, unknown>)["open"] as Props["open"])
          : undefined;
      emit("vu-open-change", event as CustomEvent<{ open: boolean }>);
    },
    onVuOpen: (event: CustomEvent) => emit("vu-open", event as CustomEvent),
    onVuClose: (event: CustomEvent) => emit("vu-close", event as CustomEvent),
    onVuInvalid: (event: CustomEvent) => emit("vu-invalid", event as CustomEvent),
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
  (props as unknown as Record<string, unknown>)["open"] = __velkinM1.value;

  return h("vu-color-picker", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
