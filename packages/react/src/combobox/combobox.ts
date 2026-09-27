import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuCombobox as VuComboboxElement,
  VuComboboxAddDetail,
  VuComboboxChangeDetail,
  VuComboboxInputDetail,
  VuComboboxInvalidDetail,
} from "@velkin/ui/combobox";

export const VuCombobox = createComponent({
  displayName: "Combobox",
  react: React,
  tagName: "vu-combobox",
  elementClass: VuComboboxElement,
  events: {
    onVuChange: "vu-change" as EventName<CustomEvent<VuComboboxChangeDetail>>,
    onVuInput: "vu-input" as EventName<CustomEvent<VuComboboxInputDetail>>,
    onVuInvalid: "vu-invalid" as EventName<CustomEvent<VuComboboxInvalidDetail>>,
    onVuAdd: "vu-add" as EventName<CustomEvent<VuComboboxAddDetail>>,
  },
});
export type * from "@velkin/ui/combobox";
