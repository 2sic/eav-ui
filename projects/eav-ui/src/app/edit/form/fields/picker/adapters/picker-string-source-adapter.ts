import { FormGroup } from "@angular/forms";
import { FieldSettings, PickerItem } from "projects/edit-types";
import { BehaviorSubject, Observable } from "rxjs";
import { FieldConfigSet } from "../../../builder/fields-builder/field-config-set.model";
import { PickerSourceAdapterBase } from "./picker-source-adapter-base";
import { DeleteEntityProps } from "../picker.models";
import { DataSourceString } from "../data-sources/data-source-string";
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable } from '@angular/core';
import { DataSourceBase } from '../data-sources/data-source-base';
import { DataSourceEmpty } from '../data-sources/data-source-empty';

const logThis = false;

@Injectable()
export class PickerStringSourceAdapter extends PickerSourceAdapterBase {
  private dataSource: DataSourceBase;

  constructor(
    private stringFieldDataSource: DataSourceString,
    private pickerDataSourceEmpty: DataSourceEmpty,
  ) {
    super(new EavLogger('PickerStringSourceAdapter', logThis));
  }

  disableAddNew$: BehaviorSubject<boolean>;
  protected config: FieldConfigSet;
  protected group: FormGroup;

  public setupString(
    settings$: BehaviorSubject<FieldSettings>,
    disableAddNew$: BehaviorSubject<boolean>,
    config: FieldConfigSet,
    group: FormGroup,
    deleteCallback: (props: DeleteEntityProps) => void,
    useEmpty?: boolean,
  ): this {
    this.log.add('setupString', 'useEmpty', useEmpty);
    // this.settings$ = settings$;
    this.disableAddNew$ = disableAddNew$;
    this.config = config;
    this.group = group;
    this.setup(deleteCallback);

    this.dataSource = useEmpty
      ? this.pickerDataSourceEmpty.setup(settings$)
      : this.stringFieldDataSource.setup(settings$);

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
    this.dataSource.getAll();
    this.subscriptions.add(this.dataSource.data$.subscribe(this.optionsOrHints$));
  }

  deleteItem(props: DeleteEntityProps): void {
    throw new Error("Method not implemented.");
  }

  editItem(editParams: { entityGuid: string; entityId: number; }, entityType: string): void {
    throw new Error("Method not implemented.");
  }
}