import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuSerial as VuSerialElement,
  VuSerialChangeDetail,
  VuSerialClearDetail,
  VuSerialInvalidDetail,
} from "@velkin/ui/serial";

export const VuSerial = createComponent({
  displayName: "Serial",
  react: React,
  tagName: "vu-serial",
  elementClass: VuSerialElement,
  events: {
    onVuChange: "vu-change" as EventName<CustomEvent<VuSerialChangeDetail>>,
    onVuInvalid: "vu-invalid" as EventName<CustomEvent<VuSerialInvalidDetail>>,
    onVuClear: "vu-clear" as EventName<CustomEvent<VuSerialClearDetail>>,
  },
});
export type * from "@velkin/ui/serial";
