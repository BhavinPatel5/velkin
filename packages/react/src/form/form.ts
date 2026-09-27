import * as React from "react";
import { createComponent, EventName } from "@lit/react";
import {
  VuForm as VuFormElement,
  VuFormChangeDetail,
  VuFormFormDataFallbackDetail,
  VuFormInvalidDetail,
  VuFormSubmitDetail,
} from "@velkin/ui/form";

export const VuForm = createComponent({
  displayName: "Form",
  react: React,
  tagName: "vu-form",
  elementClass: VuFormElement,
  events: {
    onVuChange: "vu-change" as EventName<CustomEvent<VuFormChangeDetail>>,
    onVuInvalid: "vu-invalid" as EventName<CustomEvent<VuFormInvalidDetail>>,
    onFormdata: "formdata" as EventName<CustomEvent<VuFormFormDataFallbackDetail> | FormDataEvent>,
    onVuSubmit: "vu-submit" as EventName<CustomEvent<VuFormSubmitDetail>>,
  },
});
export type * from "@velkin/ui/form";
