import { Signal } from '@angular/core';
import { ClassLogger } from '../../../../shared/logging';
import { computedObj, signalObj } from '../../../../shared/signals/signal.utilities';
import { DebugFields } from '../../../edit-debug';
import { DataSourceBase } from '../data-sources/data-source-base';
import { PickerItem } from '../models/picker-item.model';
import { DeleteEntityProps } from '../models/picker.models';
import { PickerFeatures } from '../picker-features.model';
import { StateAdapter } from './state-adapter';

export abstract class DataAdapterBase {

  /** Log Specs to be used as a basis for all inheriting classes */
  static logSpecs = {
    all: false,
    setupEmpty: false,
    connectState: false,
    initPrefetch: true,
    fetchItems: false,
    constructor: false,
    fields: [...DebugFields, 'Categories'],
  };

  log: ClassLogger<typeof DataAdapterBase.logSpecs>;

  constructor() { }

  /** Picker Features of this DataAdapter - must be implemented by every data source to communicate it's features */
  public abstract myFeatures: Signal<Partial<PickerFeatures>>;

  /** a signal for data-sources - may not need a signal, if it's unchanging... */
  public dataSource = signalObj<DataSourceBase>('dataSource', null satisfies DataSourceBase);

  /**
   * The options to show.
   * Can be different from the underlying data, since it may have error or loading-entries.
   * This is a signal, so it can be used in the template. it will _never_ be null.
   */
  public optionsOrHints: Signal<PickerItem[]> = computedObj('optionsOrHints', () => this.dataSource().data() ?? []);

  public deleteCallback: (props: DeleteEntityProps) => void;

  //#region Setup & Init

  protected abstract dataSourceRaw: DataSourceBase;

  public connectState(state: StateAdapter): this {
    const l = this.log.fnIf('connectState');

    this.dataSource.set(this.dataSourceRaw.setup());

    this.deleteCallback = p => state.doAfterDelete(p);
    return l.rSilent(this);
  }

  //#endregion

  abstract deleteItem(props: DeleteEntityProps): void;

  abstract editItem(editParams: { entityGuid: string, entityId: number }, entityType: string): void;

  abstract fetchItems(): void;
}
