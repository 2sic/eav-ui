import { Connector } from './Connector';

export class EavCustomInputField<T> extends HTMLElement {
  connector: Connector<T>;
}
