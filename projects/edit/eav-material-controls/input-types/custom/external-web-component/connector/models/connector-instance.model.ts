import { Observable } from 'rxjs';

import { Connector, ConnectorData, FieldConfig, ExperimentalProps } from '../../../../../../../edit-types';
import { ConnectorDialog } from '../../../../../../../edit-types/src/ConnectorDialog';
import { UrlHelper } from '../../../../../../shared/helpers/url-helper';
import { EavConfiguration } from '../../../../../../shared/models/eav-configuration';
import { loadScripts } from '../../../../../../../ng-dialogs/src/app/shared/helpers/load-scripts.helper';
declare const sxcVersion: string;

export class ConnectorInstance<T> implements Connector<T> {
  field$: Observable<FieldConfig>;
  data: ConnectorData<T>;
  dialog: ConnectorDialog<T>;
  loadScript: (...args: any[]) => void;

  constructor(
    _connectorHost: ConnectorHost<T>,
    value$: Observable<T>,
    public field: FieldConfig,
    public _experimental: ExperimentalProps,
    eavConfig: EavConfiguration,
  ) {
    this.data = new ConnectorDataInstance<T>(_connectorHost, value$);
    this.dialog = new ConnectorDialogInstance<T>(_connectorHost);

    this.loadScript = (
      testOrScripts: string | (() => any) | { test: string | (() => any); src: string }[],
      srcOrCallback: string | (() => any),
      callback?: () => any
    ) => {
      // one script (3 parameters: global or test, script url and a callback)
      if (
        (typeof testOrScripts === 'string' || typeof testOrScripts === 'function')
        && typeof srcOrCallback === 'string'
        && typeof callback === 'function'
      ) {
        srcOrCallback = this.resolveTokens(srcOrCallback, eavConfig);
        loadScripts([{ test: testOrScripts, src: srcOrCallback }], callback);
        return;
      }
      // multiple scripts (2 parameters: scripts array and a callback)
      if (Array.isArray(testOrScripts) && typeof srcOrCallback === 'function') {
        for (const script of testOrScripts) {
          script.src = this.resolveTokens(script.src, eavConfig);
        }
        loadScripts(testOrScripts, srcOrCallback);
        return;
      }
      throw new Error('Unrecognized parameters. Please double check your input');
    };
  }

  resolveTokens(src: string, eavConfig: EavConfiguration) {
    src = src.replace(/\[System:Path\]/i, UrlHelper.getUrlPrefix('system', eavConfig))
      .replace(/\[Zone:Path\]/i, UrlHelper.getUrlPrefix('zone', eavConfig))
      .replace(/\[App:Path\]/i, UrlHelper.getUrlPrefix('app', eavConfig));
    if (!src.includes('?')) {
      src = `${src}?sxcver=${sxcVersion}`;
    }
    return src;
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
