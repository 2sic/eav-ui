import { DataAdapterBase } from "./data-adapter-base";
import { DeleteEntityProps } from "../models/picker.models";
import { Injectable, Injector, inject } from '@angular/core';
import { DataSourceEmpty } from '../data-sources/data-source-empty';
import { PickerFeatures } from '../picker-features.model';
import { transient } from '../../../../core/transient';
import { signalObj } from '../../../../shared/signals/signal.utilities';
import { classLog } from 'projects/eav-ui/src/app/shared/logging';
import { StateAdapter } from './state-adapter';

@Injectable()
export class DataAdapterEmpty extends DataAdapterBase {

  log = classLog({DataAdapterEmpty}, DataAdapterBase.logSpecs);
  
  public features = signalObj('features', { edit: false, create: false, delete: false, } satisfies Partial<PickerFeatures>);

  protected dataSourceRaw = transient(DataSourceEmpty);

  public override connectState(state: StateAdapter): this {
    this.dataSourceRaw.preSetup("Error: configuration missing");
    return super.connectState(state);
  }

  public setupEmpty(): this {
    const l = this.log.fnIf('setupEmpty');
    this.dataSource.set(this.dataSourceRaw.preSetup("Error: configuration missing"));
    return l.rSilent(this);
  }

  /** should never be needed as we have synchronously all data in settings */
  override initPrefetch(prefetchGuids: string[]): void { }

  /** should never be needed as we can't add new data */
  override forceReloadData(missingData: string[]): void { }

  fetchItems(): void {
    this.log.a('fetchItems');
    this.dataSource().triggerGetAll();
  }

  deleteItem(props: DeleteEntityProps): void {
    throw new Error("Method not implemented.");
  }

  editItem(editParams: { entityGuid: string; entityId: number; }, entityType: string): void {
    throw new Error("Method not implemented.");
  }
}
