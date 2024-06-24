import { DataAdapterBase } from "./data-adapter-base";
import { DeleteEntityProps } from "../models/picker.models";
import { DataSourceString } from "../data-sources/data-source-string";
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable, inject, signal } from '@angular/core';
import { DataSourceEmpty } from '../data-sources/data-source-empty';
import { PickerFeatures } from '../picker-features.model';

const logThis = false;
const nameOfThis = 'DataAdapterString';

@Injectable()
export class DataAdapterString extends DataAdapterBase {

  public features = signal( { edit: false, create: false, delete: false, } satisfies Partial<PickerFeatures>);

  private stringFieldDataSource = inject(DataSourceString);
  private pickerDataSourceEmpty = inject(DataSourceEmpty);

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
  }

  public setupString(
    deleteCallback: (props: DeleteEntityProps) => void,
    useEmpty: boolean,
  ): this {
    this.log.a(`setupString - useEmpty ${useEmpty}`);
    this.setup(deleteCallback);

    this.dataSource.set(useEmpty
      ? this.pickerDataSourceEmpty.preSetup("Error: configuration missing")
      : this.stringFieldDataSource
    );

    this.useDataSourceStream.set(true);

    return this;
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