import { Injectable } from '@angular/core';
import { transient } from '../../../../../../../core/transient';
import { classLog } from '../../../../shared/logging/logging';
import { signalObj } from '../../../../shared/signals/signal.utilities';
import { DataSourceEmpty } from '../data-sources/data-source-empty';
import { DeleteEntityProps } from "../models/picker.models";
import { PickerFeatures } from '../picker-features.model';
import { DataAdapterBase } from "./data-adapter-base";
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

  override syncParams(): void { };

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
