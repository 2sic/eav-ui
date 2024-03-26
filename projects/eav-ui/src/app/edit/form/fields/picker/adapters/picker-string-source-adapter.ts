import { FormGroup } from "@angular/forms";
import { FieldSettings, PickerItem } from "projects/edit-types";
import { BehaviorSubject, Observable } from "rxjs";
import { FieldConfigSet } from "../../../builder/fields-builder/field-config-set.model";
import { PickerSourceAdapterBase } from "./picker-source-adapter-base";
import { DeleteEntityProps } from "../picker.models";
import { FieldDataSourceFactoryService } from "../factories/field-data-source-factory.service";
import { StringFieldDataSource } from "../data-sources/string-field-data-source";
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';
import { Injectable } from '@angular/core';

const logThis = true;

@Injectable()
export class PickerStringSourceAdapter extends PickerSourceAdapterBase {
  private stringFieldDataSource: StringFieldDataSource;

  constructor(private fieldDataSourceFactoryService: FieldDataSourceFactoryService) {
    super(new EavLogger('PickerStringSourceAdapter', logThis));
  }

  public settings$: BehaviorSubject<FieldSettings>;
  disableAddNew$: BehaviorSubject<boolean>;
  protected config: FieldConfigSet;
  protected group: FormGroup;

  public setupString(
    settings$: BehaviorSubject<FieldSettings>,
    disableAddNew$: BehaviorSubject<boolean>,
    config: FieldConfigSet,
    group: FormGroup,
    deleteCallback: (props: DeleteEntityProps) => void
  ): this {
    this.log.add('setupString');
    this.settings$ = settings$;
    this.disableAddNew$ = disableAddNew$;
    this.config = config;
    this.group = group;
    this.setup(deleteCallback);

    return this;
  }

  init(callerName: string): void {
    super.init(callerName);

    this.stringFieldDataSource = this.fieldDataSourceFactoryService.createStringFieldDataSource(this.settings$);
    this.subscriptions.add(
      this.stringFieldDataSource.data$.subscribe(this.availableItems$)
    );
  }

  destroy(): void {
    this.stringFieldDataSource.destroy();

    super.destroy();
  }

  getDataFromSource(): Observable<PickerItem[]> {
    return this.stringFieldDataSource.data$;
  }

  setPrefetchData(missingData: string[]): void {
    // should never be needed as we have synchronously all data in settings
  }

  forceReloadData(missingData: string[]): void {
    // should never be needed as we can't add new data
  }

  fetchItems(): void {
    this.stringFieldDataSource.getAll();
    this.subscriptions.add(this.stringFieldDataSource.data$.subscribe(this.availableItems$));
  }

  deleteItem(props: DeleteEntityProps): void {
    throw new Error("Method not implemented.");
  }

  editItem(editParams: { entityGuid: string; entityId: number; }, entityType: string): void {
    throw new Error("Method not implemented.");
  }
}