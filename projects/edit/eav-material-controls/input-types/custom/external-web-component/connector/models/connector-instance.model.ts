import { Observable } from 'rxjs';
import { Connector, ConnectorData, ExperimentalProps, FieldConfig } from '../../../../../../../edit-types';
import { ConnectorDialog } from '../../../../../../../edit-types/src/ConnectorDialog';
import { loadScripts } from '../../../../../../../ng-dialogs/src/app/shared/helpers/load-scripts.helper';
import { EavWindow } from '../../../../../../../ng-dialogs/src/app/shared/models/eav-window.model';
import { UrlHelpers } from '../../../../../../shared/helpers';
import { EavConfig } from '../../../../../../shared/models';

declare const window: EavWindow;

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
    eavConfig: EavConfig,
  ) {
    this.data = new ConnectorDataInstance<T>(_connectorHost, value$);
    this.dialog = new ConnectorDialogInstance<T>(_connectorHost);

    this.loadScript = (
      testOrScripts: string | (() => any) | { test: string | (() => any); src: string }[],
      srcOrCallback: string | (() => any),
      callback?: () => any,
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

  resolveTokens(src: string, eavConfig: EavConfig) {
    src = src.replace(/\[System:Path\]/i, UrlHelpers.getUrlPrefix('system', eavConfig))
      .replace(/\[Zone:Path\]/i, UrlHelpers.getUrlPrefix('zone', eavConfig))
      .replace(/\[App:Path\]/i, UrlHelpers.getUrlPrefix('app', eavConfig));
    if (!src.includes('?')) {
      src = `${src}?sxcver=${window.sxcVersion}`;
    }
    return src;
  }
}

export class ConnectorDataInstance<T> implements ConnectorData<T> {
  value$: Observable<T>;
  value: T;
  clientValueChangeListeners: ((newValue: T) => void)[] = [];

  constructor(
    private _connectorHost: ConnectorHost<T>,
    value$: Observable<T>
  ) {
    this.value$ = value$;
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
export interface ConnectorHost<T> {
  update: (value: T) => void;
  expand: (expand: boolean, componentTag?: string) => void;
}
