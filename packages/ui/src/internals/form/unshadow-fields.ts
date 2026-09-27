/**
 * Called from `FormControlBase` constructor — subclasses should not call this.
 * If a subclass uses `override required = false` (plain field), call this again in
 * that subclass constructor after `super()`.
 *
 * Workaround for the Lit `class-field-shadowing` warning that fires when a
 * subclass of `FormControlBase` is registered as a custom element under
 * `useDefineForClassFields: true` (the project's tsconfig setting).
 *
 * Why the warning fires: the base declares reactive properties as plain class
 * fields with initializers (`@property() disabled = false;`). TypeScript
 * compiles those initializers to `Object.defineProperty(this, 'disabled',
 * { value: false })` calls inside the base constructor. Those calls run on
 * every instance — including subclass instances — and create an own-property
 * value descriptor that shadows the prototype accessor `@property` installed
 * on `FormControlBase.prototype`. The shadow:
 *   - bypasses Lit's reactive setter (writes don't schedule updates)
 *   - trips Lit's dev-mode `class-field-shadowing` check at registration
 *
 * Base fix: `FormControlBase` calls this once in its constructor. Subclasses that
 * `override` a form prop with a field initializer must call it again after `super()`.
 *
 * Why composite components hit it visibly: primitive controls render a real
 * native `<input>` and rarely re-render, so even if the warning fires their
 * forwarded `disabled` / `required` keep working through Lit's static
 * `properties` table. Composite controls (color picker, color slider, color
 * swatch picker) propagate `disabled` to several shadow children via
 * `?disabled=${this.disabled}` on every render and depend on the reactive
 * setter firing on every change — the shadowing breaks them and the warning
 * surfaces immediately.
 *
 * The fix: in the subclass constructor, right after `super()`, delete each
 * shadowing own-property and re-assign through the now-unshadowed prototype
 * accessor. After this:
 *   - `Object.getOwnPropertyDescriptor(instance, key)` returns `undefined`
 *     (the value descriptor is gone), so the prototype accessor wins on every
 *     read/write
 *   - Lit's reactive setter receives the re-assignment and stores the value
 *     in its own internal slot, scheduling an update if needed
 *   - Lit's dev-mode check passes on next finalization
 */
const FORM_BASE_FIELDS = [
  "name",
  "defaultValue",
  "formId",
  "disabled",
  "readonly",
  "required",
  "requiredMessage",
  "validations",
] as const;

export function unshadowFormControlFields(instance: object): void {
  for (const key of FORM_BASE_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(instance, key)) continue;
    const value = (instance as Record<string, unknown>)[key];
    delete (instance as Record<string, unknown>)[key];
    (instance as Record<string, unknown>)[key] = value;
  }
}
