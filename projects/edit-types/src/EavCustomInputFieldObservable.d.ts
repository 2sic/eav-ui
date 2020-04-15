import { EavCustomInputField } from './EavCustomInputField';
import { ConnectorObservable } from './ConnectorObservable';

export class EavCustomInputFieldObservable<T> extends EavCustomInputField<T> {
  connector: ConnectorObservable<T>;
}
