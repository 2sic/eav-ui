
export function registerCustomElement(tag: string, constructor: CustomElementConstructor) {
  if (customElements.get(tag))
    return;
  customElements.define(tag, constructor);
}
