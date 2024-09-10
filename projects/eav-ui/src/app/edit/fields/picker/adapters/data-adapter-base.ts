import { DeleteEntityProps } from '../models/picker.models';
import { Signal } from '@angular/core';
import { PickerFeatures } from '../picker-features.model';
import { DataSourceBase } from '../data-sources/data-source-base';
import { EavLogger } from '../../../../shared/logging/eav-logger';
import { computedObj, signalObj } from '../../../../shared/signals/signal.utilities';
import { StateAdapter } from './state-adapter';

export abstract class DataAdapterBase {

  /** Picker Features of this DataAdapter - must be implemented by every data source to communicate it's features */
  public abstract features: Signal<Partial<PickerFeatures>>;

  /** a signal for data-sources - may not need a signal, if it's unchanging... */
  public dataSource = signalObj<DataSourceBase>('dataSource', null satisfies DataSourceBase);

  /**
   * The options to show.
   * Can be different from the underlying data, since it may have error or loading-entries.
   * This is a signal, so it can be used in the template. it will _never_ be null.
   */
  public optionsOrHints = computedObj('optionsOrHints', () => (this.dataSource().data()) ?? []);

  public deleteCallback: (props: DeleteEntityProps) => void;

  log: EavLogger;
  constructor(logSpecs: EavLogger) {
    this.log = logSpecs;
  }

  //#region Setup

  protected abstract dataSourceRaw: DataSourceBase;

  public connectState(state: StateAdapter): this {
    const l = this.log.fn('connectState');

    this.dataSource.set(this.dataSourceRaw.setup());

    this.setup(p => state.doAfterDelete(p));
    return l.rSilent(this);
  }


  protected setup(deleteCallback: (props: DeleteEntityProps) => void): void {
    this.deleteCallback = deleteCallback;
  }

  //#endregion

  init(callerName: string) { }

  onAfterViewInit(): void { }

  abstract initPrefetch(prefetchGuids: string[]): void;

  abstract forceReloadData(missingData: string[]): void;

  abstract deleteItem(props: DeleteEntityProps): void;

  abstract editItem(editParams: { entityGuid: string, entityId: number }, entityType: string): void;

  abstract fetchItems(): void;
}
