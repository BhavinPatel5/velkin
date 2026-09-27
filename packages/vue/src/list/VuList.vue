<script lang="ts">
export type {
  VuListChangeDetail,
  VuListSelectionMode,
  VuListSize,
  VuListTone,
} from "@velkin/ui/list";
</script>
<script setup lang="ts">
import { h, useSlots, reactive, useAttrs } from "vue";
import { assignSlotNodes, Slots } from "@lit-labs/vue-utils/wrapper-utils.js";
import "@velkin/ui/list";
import { VuListChangeDetail, VuListSelectionMode, VuListSize, VuListTone } from "@velkin/ui/list";

export interface Props {
  selection?: VuListSelectionMode;
  selectedValues?: string[] | undefined;
  defaultSelectedValues?: string[];
  size?: VuListSize;
  tone?: VuSurfaceTone;
  dense?: boolean;
  autofocus?: boolean;
  ariaLabel?: string;
}
defineOptions({ name: "List" });

const vueProps = defineProps<Props>();

const attrs = useAttrs();
const __velkinM0 = defineModel<Props["selectedValues"] | undefined>("selectedValues", {
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
  (e: "vu-change", payload: CustomEvent<VuListChangeDetail>): void;
}>();

const slots = useSlots() as Slots;

const render = () => {
  const eventProps = {
    onVuChange: (event: CustomEvent<VuListChangeDetail>) => {
      const __d = (event as CustomEvent<Record<string, unknown>>).detail;
      __velkinM0.value =
        __d != null &&
        typeof __d === "object" &&
        Object.prototype.hasOwnProperty.call(__d, "selectedValues")
          ? ((__d as Record<string, unknown>)["selectedValues"] as Props["selectedValues"])
          : undefined;
      emit("vu-change", event as CustomEvent<VuListChangeDetail>);
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

  (props as unknown as Record<string, unknown>)["selectedValues"] = __velkinM0.value;

  return h("vu-list", { ...attrs, ...props }, assignSlotNodes(slots));
};
</script>
<template><render v-defaults /></template>
