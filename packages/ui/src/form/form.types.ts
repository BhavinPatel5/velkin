/** Client-side JS handling vs native navigation. */
export type VuFormMode = "client" | "server";

/** Native `<form method>` values supported in server mode. */
export type VuFormMethod = "get" | "post";

/** Native `<form enctype>` values. */
export type VuFormEnctype =
  "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain";

/** Native `<form autocomplete>` values. */
export type VuFormAutocomplete = "on" | "off";

/** JSON snapshot of `FormData` entries (duplicate keys become arrays). */
export type VuFormValues = Record<string, FormDataEntryValue | FormDataEntryValue[]>;

/** `vu-change` detail when `liveValidation` is on. */
export type VuFormChangeDetail = {
  values: VuFormValues;
  formData: FormData;
  success: boolean;
};

/** `vu-invalid` detail when aggregated field errors change. */
export type VuFormInvalidDetail = { errors: string[] };

/** `vu-submit` detail after a successful client-mode submit. */
export type VuFormSubmitDetail = {
  values: VuFormValues;
  formData: FormData;
  success: boolean;
};

/** Fallback `formdata` detail when `FormDataEvent` is unavailable. */
export type VuFormFormDataFallbackDetail = { formData: FormData };
