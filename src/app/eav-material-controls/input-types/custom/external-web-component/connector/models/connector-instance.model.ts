import { Observable } from 'rxjs';
import { ConnectorObservable, ConnectorDataObservable } from '../../../../../../../../projects/shared/connector';
import { FieldConfig } from '../../../../../../../../projects/shared/field-config';

export class ConnectorInstance<T> implements ConnectorObservable<T> {
  field$: Observable<FieldConfig>;
  field: FieldConfig;
  data: ConnectorDataObservable<T>;

  constructor(
    connectorHost: ConnectorHost<T>,
    value$: Observable<T>,
    field: FieldConfig,
  ) {
    this.field = field;
    this.data = new ConnectorDataInstance<T>(connectorHost, value$);
  }
}

export class ConnectorDataInstance<T> implements ConnectorDataObservable<T> {
  value$: Observable<T>;
  forceConnectorSave$: Observable<null>;
  value: T;
  clientValueChangeListeners: ((newValue: T) => void)[] = [];

  constructor(
    private connectorHost: ConnectorHost<T>,
    value$: Observable<T>
  ) {
    this.value$ = value$;
    this.forceConnectorSave$ = connectorHost.forceConnectorSave$;
    // Host will complete this observable. Therefore unsubscribe is not required
    this.value$.subscribe(newValue => {
      this.value = newValue;
      this.clientValueChangeListeners.forEach(clientListener => clientListener(newValue));
    });
  }

  update(newValue: T) {
    this.connectorHost.update(newValue);
  }

  onValueChange(callback: (newValue: T) => void) {
    this.clientValueChangeListeners.push(callback);
  }
}

/** Props and methods available to the connector to communicate with the host */
export class ConnectorHost<T> {
  update: (value: T) => void;
  forceConnectorSave$: Observable<null>;
}
