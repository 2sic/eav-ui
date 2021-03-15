import { Connector } from './Connector';

export class EavCustomInputField<T = any> extends HTMLElement {
  /**
   * Prevents connectedCallback from being called more than once:
   * https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-conformance
   */
  fieldInitialized: boolean;
  connector: Connector<T>;
}
