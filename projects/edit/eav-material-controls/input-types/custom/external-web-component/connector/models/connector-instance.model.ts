import { Observable } from 'rxjs';
import { Connector, ConnectorData, FieldConfig, ExperimentalProps } from '../../../../../../../edit-types';
import { ConnectorDialog } from '../../../../../../../edit-types/src/ConnectorDialog';

export class ConnectorInstance<T> implements Connector<T> {
  field$: Observable<FieldConfig>;
  data: ConnectorData<T>;
  dialog: ConnectorDialog<T>;

  constructor(
    _connectorHost: ConnectorHost<T>,
    value$: Observable<T>,
    public field: FieldConfig,
    public _experimental: ExperimentalProps,
  ) {
    this.data = new ConnectorDataInstance<T>(_connectorHost, value$);
    this.dialog = new ConnectorDialogInstance<T>(_connectorHost);
  }

  loadScript(globalObject: string, src: string, callback: (...args: any[]) => any) {
    if (!!(window as any)[globalObject]) {
      callback();
      return;
    }

    const scriptElement: HTMLScriptElement = document.querySelector('script[src="' + src + '"]');
    if (scriptElement) {
      scriptElement.addEventListener('load', callback, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }
}

export class ConnectorDataInstance<T> implements ConnectorData<T> {
  value$: Observable<T>;
  forceConnectorSave$: Observable<null>;
  value: T;
  clientValueChangeListeners: ((newValue: T) => void)[] = [];

  constructor(
    private _connectorHost: ConnectorHost<T>,
    value$: Observable<T>
  ) {
    this.value$ = value$;
    this.forceConnectorSave$ = _connectorHost.forceConnectorSave$;
    // Host will complete this observable. Therefore unsubscribe is not required
    this.value$.subscribe(newValue => {
      this.value = newValue;
      this.clientValueChangeListeners.forEach(clientListener => clientListener(newValue));
    });
  }

  update(newValue: T) {
    this._connectorHost.update(newValue);
  }

  onValueChange(callback: (newValue: T) => void) {
    this.clientValueChangeListeners.push(callback);
  }
}

export class ConnectorDialogInstance<T> implements ConnectorDialog<T> {
  open: (componentTag?: string) => void;
  close: () => void;

  constructor(_connectorHost: ConnectorHost<T>) {
    this.open = (componentTag?) => _connectorHost.expand(true, componentTag);
    this.close = () => _connectorHost.expand(false);
  }
}

/** Props and methods available to the connector to communicate with the host */
export class ConnectorHost<T> {
  update: (value: T) => void;
  expand: (expand: boolean, componentTag?: string) => void;
  forceConnectorSave$: Observable<null>;
}
