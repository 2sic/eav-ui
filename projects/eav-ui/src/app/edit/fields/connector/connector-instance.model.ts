import { Observable } from 'rxjs';
import { Connector } from '../../../../../../edit-types/src/Connector';
import { ConnectorDialog } from '../../../../../../edit-types/src/ConnectorDialog';
import { ConnectorData } from '../../../../../../edit-types/src/ConnectorData';
import { FieldConfig } from '../../../../../../edit-types/src/FieldConfig';
import { ExperimentalProps } from '../../../../../../edit-types/src/ExperimentalProps';
import { loadScripts } from '../../../shared/helpers/load-scripts.helper';
import { FormConfiguration } from '../../form/form-configuration.model';
import { Signal } from '@angular/core';
import { ScriptsLoaderService } from '../../shared/services/scripts-loader.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { EavLogger } from '../../../shared/logging/eav-logger';

const logThis = false;
const nameOfThis = 'ConnectorInstance';

export class ConnectorInstance<T = any> implements Connector<T> {
  data: ConnectorData<T>;
  dialog: ConnectorDialog;
  loadScript: (...args: any[]) => void;

  get field() { return this.fieldConfigSignal(); }

  get field$() { return this.#field$ ??= toObservable(this.fieldConfigSignal, { injector: this._experimental.injector }) }
  #field$: Observable<FieldConfig>;

  log = new EavLogger(nameOfThis, logThis);

  constructor(
    _connectorHost: ConnectorHost<T>,
    value$: Observable<T>,
    private fieldConfigSignal: Signal<FieldConfig>,
    public _experimental: ExperimentalProps,
    formConfig: FormConfiguration,
  ) {
    this.data = new ConnectorDataInstance<T>(_connectorHost, value$);
    this.dialog = new ConnectorDialogInstance<T>(_connectorHost);

    this.loadScript = (
      testOrScripts: string | (() => boolean) | { test: string | (() => boolean); src: string }[],
      srcOrCallback: string | (() => void),
      callback?: () => void,
    ) => {
      // one script (3 parameters: global or test, script url and a callback)
      const isMainSignature = (typeof testOrScripts === 'string' || typeof testOrScripts === 'function')
        && typeof srcOrCallback === 'string'
        && typeof callback === 'function';
      if (isMainSignature) {
        srcOrCallback = ScriptsLoaderService.resolveUrlTokens(srcOrCallback as string, formConfig);
        loadScripts([{ test: testOrScripts, src: srcOrCallback }], callback);
        return;
      }
      // multiple scripts (2 parameters: scripts array and a callback)
      if (Array.isArray(testOrScripts) && typeof srcOrCallback === 'function') {
        for (const script of testOrScripts)
          script.src = ScriptsLoaderService.resolveUrlTokens(script.src, formConfig);
        loadScripts(testOrScripts, srcOrCallback);
        return;
      }
      throw new Error('Unrecognized parameters. Please double check your input');
    };
  }
}

class ConnectorDataInstance<T> implements ConnectorData<T> {
  value: T;
  clientValueChangeListeners: ((newValue: T) => void)[] = [];

  constructor(private _connectorHost: ConnectorHost<T>, public value$: Observable<T>) {
    // Host will complete this observable. Therefore unsubscribe is not required
    this.value$.subscribe(newValue => {
      this.value = newValue;
      this.clientValueChangeListeners.forEach(callback => callback(newValue));
    });
  }

  update(newValue: T) {
    this._connectorHost.update(newValue);
  }

  onValueChange(callback: (newValue: T) => void) {
    this.clientValueChangeListeners.push(callback);
  }
}

class ConnectorDialogInstance<T> implements ConnectorDialog {
  constructor(private _connectorHost: ConnectorHost<T>) { }

  open(componentTag?: string) {
    return this._connectorHost.expand(true, componentTag);
  }

  close() {
    this._connectorHost.expand(false);
  }
}

/** Props and methods available to the connector to communicate with the host */
export interface ConnectorHost<T = any> {
  update: (value: T) => void;
  expand: (expand: boolean, componentTag?: string) => void;
}
