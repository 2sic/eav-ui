import { FormGroup } from "@angular/forms";
import { FieldSettings, PickerItem } from "projects/edit-types";
import { BehaviorSubject, Observable } from "rxjs";
import { FieldConfigSet } from "../../../builder/fields-builder/field-config-set.model";
import { DataAdapterBase } from "./data-adapter-base";
import { DeleteEntityProps } from "../models/picker.models";
import { DataSourceString } from "../data-sources/data-source-string";
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable, Signal, inject, signal } from '@angular/core';
import { DataSourceBase } from '../data-sources/data-source-base';
import { DataSourceEmpty } from '../data-sources/data-source-empty';
import { PickerFeatures } from '../picker-features.model';
import { FieldState } from '../../../builder/fields-builder/field-state';

const logThis = false;
const nameOfThis = 'DataAdapterString';

@Injectable()
export class DataAdapterString extends DataAdapterBase {

  public features = signal( { edit: false, create: false, delete: false, } satisfies Partial<PickerFeatures>);

  private dataSource: DataSourceBase;

  private stringFieldDataSource = inject(DataSourceString);
  private pickerDataSourceEmpty = inject(DataSourceEmpty);

  private fieldState = inject(FieldState);

  constructor() {
    super(new EavLogger(nameOfThis, logThis));
  }

  public setupString(
    deleteCallback: (props: DeleteEntityProps) => void,
    useEmpty: boolean,
  ): this {
    this.log.a(`setupString - useEmpty ${useEmpty}`);
    this.setup(deleteCallback);

    this.dataSource = useEmpty
      ? this.pickerDataSourceEmpty.setup(this.fieldState.settings)
      : this.stringFieldDataSource.setup(this.fieldState.settings);

    return this;
  }

  init(callerName: string): void {
    super.init(callerName);

    const l = this.log.rxTap('data$');
    this.subscriptions.add(
      this.dataSource.data$.pipe(l.pipe()).subscribe(this.optionsOrHints$)
    );
  }

  destroy(): void {
    this.dataSource.destroy();
    super.destroy();
  }

  getDataFromSource(): Observable<PickerItem[]> {
    return this.dataSource.data$;
  }

  initPrefetch(prefetchGuids: string[]): void {
    // should never be needed as we have synchronously all data in settings
  }

  forceReloadData(missingData: string[]): void {
    // should never be needed as we can't add new data
  }

  fetchItems(): void {
    this.dataSource.triggerGetAll();
    this.subscriptions.add(this.dataSource.data$.subscribe(this.optionsOrHints$));
  }

  deleteItem(props: DeleteEntityProps): void {
    throw new Error("Method not implemented.");
  }

  editItem(editParams: { entityGuid: string; entityId: number; }, entityType: string): void {
    throw new Error("Method not implemented.");
  }
}