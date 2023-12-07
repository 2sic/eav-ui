import { FormGroup, AbstractControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
import { FieldSettings } from "projects/edit-types";
import { BehaviorSubject } from "rxjs";
import { EntityService, EavService, EditRoutingService, FieldsSettingsService } from "../../../../shared/services";
import { EntityCacheService } from "../../../../shared/store/ngrx-data";
import { FieldConfigSet } from "../../../builder/fields-builder/field-config-set.model";
import { PickerSourceAdapterBase } from "./picker-source-adapter-base";
import { DeleteEntityProps } from "../picker.models";
import { FieldDataSourceFactoryService } from "../factories/field-data-source-factory.service";

export class PickerStringSourceAdapter extends PickerSourceAdapterBase {
  constructor(
    public disableAddNew$: BehaviorSubject<boolean> = new BehaviorSubject(true),
    public fieldsSettingsService: FieldsSettingsService,

    // Below this is needed for base class
    public settings$: BehaviorSubject<FieldSettings> = new BehaviorSubject(null),
    public entityCacheService: EntityCacheService,
    public entityService: EntityService,
    public eavService: EavService,
    public editRoutingService: EditRoutingService,
    public translate: TranslateService,
    public fieldDataSourceFactoryService: FieldDataSourceFactoryService,
    protected config: FieldConfigSet,
    protected group: FormGroup,
    public snackBar: MatSnackBar,
    public control: AbstractControl,
    // public fetchAvailableEntities: (clearAvailableItemsAndOnlyUpdateCache: boolean) => void,
    public deleteCallback: (props: DeleteEntityProps) => void,
  ) {
    super(
      deleteCallback,
    );
  }

  init(): void {
    super.init();

    this.pickerDataSource = this.fieldDataSourceFactoryService.createStringFieldDataSource(this.settings$);
    this.subscription.add(
      this.pickerDataSource.data$.subscribe(this.availableItems$)
    );
  }

  destroy(): void {
    this.pickerDataSource.destroy();

    super.destroy();
  }

  fetchItems(): void {
    this.pickerDataSource.getAll();
    this.subscription.add(this.pickerDataSource.data$.subscribe(this.availableItems$));
  }
}