import { FormGroup, AbstractControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
import { FieldSettings } from "projects/edit-types";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import { EntityService, EavService, EditRoutingService, FieldsSettingsService } from "../../../../shared/services";
import { EntityCacheService } from "../../../../shared/store/ngrx-data";
import { FieldConfigSet } from "../../../builder/fields-builder/field-config-set.model";
import { PickerSourceAdapter } from "./picker-source-adapter";
import { DeleteEntityProps } from "../picker.models";
import { filterGuids } from "../picker.helpers";
import { FieldMask } from "../../../../shared/helpers";
import { EntityFieldDataSource } from "../data-sources/entity-field-data-source";
import { FieldDataSourceFactoryService } from "../factories/field-data-source-factory.service";

export class PickerEntitySourceAdapter extends PickerSourceAdapter {
  private contentTypeMask: FieldMask;

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

    // Update/Build Content-Type Mask which is used for loading the data/new etc.
    this.subscription.add(
      this.settings$.pipe(
        map(settings => settings.EntityType),
        distinctUntilChanged(),
      ).subscribe(entityType => {
        this.contentTypeMask?.destroy();
        this.contentTypeMask = new FieldMask(
          entityType,
          this.group.controls,
          () => {
            this.availableItems$.next(null);
            this.updateAddNew();
          },
          null,
          this.eavService.eavConfig,
        );
        this.availableItems$.next(null);
        this.updateAddNew();
      })
    );

    this.pickerDataSource = this.fieldDataSourceFactoryService.createEntityFieldDataSource();

    this.subscription.add(
      this.pickerDataSource.data$.subscribe(this.availableItems$)
    );
  }

  onAfterViewInit(): void {
    this.contentType = this.contentTypeMask.resolve();
    this.contentType$.next(this.contentType);
  }

  destroy(): void {
    this.contentTypeMask.destroy();
    this.pickerDataSource.destroy();

    super.destroy();
  }

  updateAddNew(): void {
    const contentTypeName = this.contentTypeMask.resolve();
    this.disableAddNew$.next(!contentTypeName);
  }

  fetchItems(clearAvailableItemsAndOnlyUpdateCache: boolean): void {
    if (clearAvailableItemsAndOnlyUpdateCache) {
      this.availableItems$.next(null);
    }

    const contentTypeName = this.contentTypeMask.resolve();
    (this.pickerDataSource as EntityFieldDataSource).contentType(contentTypeName);

    const entitiesFilter: string[] = (clearAvailableItemsAndOnlyUpdateCache || !this.settings$.value.EnableAddExisting)
      ? filterGuids(
        this.fieldsSettingsService.getContentTypeSettings()._itemTitle,
        this.config.fieldName,
        (this.control.value as string[]).filter(guid => !!guid),
      )
      : null;
    (this.pickerDataSource as EntityFieldDataSource).entityGuids(entitiesFilter);

    this.pickerDataSource.getAll();
    if (!clearAvailableItemsAndOnlyUpdateCache) {
      this.subscription.add(this.pickerDataSource.data$.subscribe((items) => {
        this.availableItems$.next(items);
      }));
    }
  }
}