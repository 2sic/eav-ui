import { FormGroup, AbstractControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
import { FieldSettings, PickerItem } from "projects/edit-types";
import { BehaviorSubject, Observable } from "rxjs";
import { EntityService, EavService, EditRoutingService, FieldsSettingsService } from "../../../../shared/services";
import { EntityCacheService } from "../../../../shared/store/ngrx-data";
import { FieldConfigSet } from "../../../builder/fields-builder/field-config-set.model";
import { PickerSourceAdapterBase } from "./picker-source-adapter-base";
import { DeleteEntityProps } from "../picker.models";
import { FieldDataSourceFactoryService } from "../factories/field-data-source-factory.service";
import { StringFieldDataSource } from "../data-sources/string-field-data-source";
import { EavLogger } from 'projects/eav-ui/src/app/shared/logging/eav-logger';

const logThis = false;

export class PickerStringSourceAdapter extends PickerSourceAdapterBase {
  private stringFieldDataSource: StringFieldDataSource;

  constructor(
    public disableAddNew$: BehaviorSubject<boolean> = new BehaviorSubject(true),
    public fieldsSettingsService: FieldsSettingsService,

    // Below this is needed for base class
    public settings$: BehaviorSubject<FieldSettings> = new BehaviorSubject(null),
    public entityCacheService: EntityCacheService,
    public entityService: EntityService,
    public eavService: EavService,
    public editRoutingService: EditRoutingService,
    translate: TranslateService,
    public fieldDataSourceFactoryService: FieldDataSourceFactoryService,
    protected config: FieldConfigSet,
    protected group: FormGroup,
    public snackBar: MatSnackBar,
    public control: AbstractControl,
    // public fetchAvailableEntities: (clearAvailableItemsAndOnlyUpdateCache: boolean) => void,
    public deleteCallback: (props: DeleteEntityProps) => void,
  ) {
    super(
      translate,
      deleteCallback,
      new EavLogger('PickerStringSourceAdapter', logThis),
    );
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

  setOverrideData(missingData: string[]): void {
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