import { Injectable } from '@angular/core';
import { transient } from '../../../../../../../core/transient';
import { classLog } from '../../../../shared/logging/logging';
import { signalObj } from '../../../../shared/signals/signal.utilities';
import { DataSourceString } from "../data-sources/data-source-string";
import { DeleteEntityProps } from "../models/picker.models";
import { PickerFeatures } from '../picker-features.model';
import { DataAdapterBase } from "./data-adapter-base";

@Injectable()
export class DataAdapterString extends DataAdapterBase {

  log = classLog({DataAdapterString}, DataAdapterBase.logSpecs);

  public features = signalObj('features', { edit: false, create: false, delete: false, } satisfies Partial<PickerFeatures>);

  protected dataSourceRaw = transient(DataSourceString);

  /** should never be needed as we have synchronously all data in settings */
  override initPrefetch(prefetchGuids: string[]): void { }

  /** should never be needed as we can't add new data */
  override forceReloadData(missingData: string[]): void { }

  override syncParams(): void { };

  fetchItems(): void {
    this.log.fnIf('fetchItems');
    this.dataSource().triggerGetAll();
  }

  deleteItem(props: DeleteEntityProps): void {
    throw new Error("Method not implemented.");
  }

  editItem(editParams: { entityGuid: string; entityId: number; }, entityType: string): void {
    throw new Error("Method not implemented.");
  }
}
