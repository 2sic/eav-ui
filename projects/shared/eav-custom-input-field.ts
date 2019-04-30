import { Connector, ConnectorObservable } from './connector';

export class EavCustomInputField<T> extends HTMLElement {
  connector: Connector<T>;
}

export class EavCustomInputFieldObservable<T> extends EavCustomInputField<T> {
  connector: ConnectorObservable<T>;
}
