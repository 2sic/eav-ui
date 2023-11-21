import { FormGroup, AbstractControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
import { FieldSettings } from "projects/edit-types";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import { EntityService, EavService, EditRoutingService, FieldsSettingsService } from "../../../shared/services";
import { EntityCacheService } from "../../../shared/store/ngrx-data";
import { FieldConfigSet } from "../../builder/fields-builder/field-config-set.model";
import { PickerSourceAdapter } from "./picker-source-adapter";
import { DeleteEntityProps } from "./picker.models";
import { filterGuids } from "./picker.helpers";
import { FieldMask } from "../../../shared/helpers";
import { StringFieldDataSource } from "./string-field-data-source";
import { EntityFieldDataSource } from "./entity-field-data-source";
import { FieldDataSourceFactoryService } from "./field-data-source-factory.service";

export class PickerEntitySourceAdapter extends PickerSourceAdapter {
  private entityFieldDataSource: EntityFieldDataSource;
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

  contentTypeMask: FieldMask;

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

    this.entityFieldDataSource = this.fieldDataSourceFactoryService.createEntityFieldDataSource();

    this.subscription.add(
      this.entityFieldDataSource.data$.subscribe(this.availableItems$)
    );
  }

  onAfterViewInit(): void {
    this.contentType = this.contentTypeMask.resolve();
  }

  destroy(): void {
    this.contentTypeMask.destroy();
    this.entityFieldDataSource.destroy();

    super.destroy();
  }

  updateAddNew(): void {
    const contentTypeName = this.contentTypeMask.resolve();
    this.disableAddNew$.next(!contentTypeName);
  }

  // @2SDV TODO: Split this adapter into two separate adapters for string and entity
  fetchItems(clearAvailableItemsAndOnlyUpdateCache: boolean): void {
    if (clearAvailableItemsAndOnlyUpdateCache) {
      this.availableItems$.next(null);
    }

    const contentTypeName = this.contentTypeMask.resolve();
    this.entityFieldDataSource.contentType(contentTypeName);

    const entitiesFilter: string[] = (clearAvailableItemsAndOnlyUpdateCache || !this.settings$.value.EnableAddExisting)
      ? filterGuids(
        this.fieldsSettingsService.getContentTypeSettings()._itemTitle,
        this.config.fieldName,
        (this.control.value as string[]).filter(guid => !!guid),
      )
      : null;
    this.entityFieldDataSource.entityGuids(entitiesFilter);

    this.entityFieldDataSource.getAll();
    if (!clearAvailableItemsAndOnlyUpdateCache) {
      this.subscription.add(this.entityFieldDataSource.data$.subscribe((items) => {
        this.availableItems$.next(items);
      }));
    }
  }
}