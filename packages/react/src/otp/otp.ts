import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuOtp as VuOtpElement,
  VuOtpChangeDetail,
  VuOtpClearDetail,
  VuOtpInvalidDetail,
} from "@velkin/ui/otp";

export const VuOtp = createComponent({
  displayName: "Otp",
  react: React,
  tagName: "vu-otp",
  elementClass: VuOtpElement,
  events: {
    onVuChange: "vu-change" as EventName<CustomEvent<VuOtpChangeDetail>>,
    onVuInvalid: "vu-invalid" as EventName<CustomEvent<VuOtpInvalidDetail>>,
    onVuClear: "vu-clear" as EventName<CustomEvent<VuOtpClearDetail>>,
  },
});
export type * from "@velkin/ui/otp";
