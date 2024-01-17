import { FormGroup, AbstractControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
import { FieldSettings, PickerItem } from "projects/edit-types";
import { BehaviorSubject, Observable, combineLatest } from "rxjs";
import { EntityService, EavService, EditRoutingService, FieldsSettingsService } from "../../../../shared/services";
import { EntityCacheService } from "../../../../shared/store/ngrx-data";
import { FieldConfigSet } from "../../../builder/fields-builder/field-config-set.model";
import { DeleteEntityProps } from "../picker.models";
import { EntityFieldDataSource } from "../data-sources/entity-field-data-source";
import { FieldDataSourceFactoryService } from "../factories/field-data-source-factory.service";
import { PickerSourceEntityAdapterBase } from "./picker-source-entity-adapter-base";

export class PickerEntitySourceAdapter extends PickerSourceEntityAdapterBase {
  private entityFieldDataSource: EntityFieldDataSource;

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
      disableAddNew$,
      settings$,
      entityCacheService,
      entityService,
      eavService,
      editRoutingService,
      translate,
      config,
      group,
      snackBar,
      control,
      // fetchAvailableEntities,
      deleteCallback,
    );
  }

  init(): void {
    super.init();

    this.entityFieldDataSource = this.fieldDataSourceFactoryService.createEntityFieldDataSource(this.settings$);

    this.subscriptions.add(combineLatest([
      this.entityFieldDataSource.data$,
      this.entityFieldDataSource.loading$,
      this.deletedItemGuids$,
    ]).subscribe(([data, loading, deleted]) => {
      const items = data.filter(item => !deleted.some(guid => guid === item.Value));
      if (loading) {
        this.availableItems$.next([{
          Text: this.translate.instant('Fields.Entity.Loading'),
          Value: null,
          _disableSelect: true,
          _disableDelete: true,
          _disableEdit: true,
        }, ...items]);
      } else {
        this.availableItems$.next(items);
      }
    }));
  }

  onAfterViewInit(): void {
    super.onAfterViewInit();
    this.entityFieldDataSource.contentType(this.contentType);
  }

  getDataFromSource(): Observable<PickerItem[]> {
    return this.entityFieldDataSource.data$;
  }

  setPrefetchData(missingData: string[]): void {
    this.entityFieldDataSource.prefetchEntityGuids(missingData);
  }

  setOverrideData(missingData: string[]): void {
    this.entityFieldDataSource.entityGuids(missingData);
  }

  destroy(): void {
    this.contentTypeMask.destroy();
    this.entityFieldDataSource.destroy();

    super.destroy();
  }

  fetchItems(): void {
    this.contentType = this.contentTypeMask.resolve();
    this.entityFieldDataSource.contentType(this.contentType);
    this.entityFieldDataSource.getAll();
  }
}