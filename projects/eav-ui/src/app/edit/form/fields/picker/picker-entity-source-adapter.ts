import { FormGroup, AbstractControl } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
import { DropdownOption, EntityInfo, FieldSettings } from "projects/edit-types";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import { EntityService, EavService, EditRoutingService, FieldsSettingsService } from "../../../shared/services";
import { EntityCacheService } from "../../../shared/store/ngrx-data";
import { FieldConfigSet } from "../../builder/fields-builder/field-config-set.model";
import { PickerSourceAdapter } from "./picker-source-adapter";
import { DeleteEntityProps } from "./picker.models";
import { filterGuids } from "./picker.helpers";
import { FieldMask } from "../../../shared/helpers";

export class PickerEntitySourceAdapter extends PickerSourceAdapter {
  constructor(
    public disableAddNew$: BehaviorSubject<boolean> = new BehaviorSubject(true),

    public fieldsSettingsService: FieldsSettingsService,

    public isString: boolean,

    // Below this is needed for base class
    public settings$: BehaviorSubject<FieldSettings> = new BehaviorSubject(null),

    public entityCacheService: EntityCacheService,
    public entityService: EntityService,
    public eavService: EavService,
    public editRoutingService: EditRoutingService,
    public translate: TranslateService,

    protected config: FieldConfigSet,
    protected group: FormGroup,

    public snackBar: MatSnackBar,
    public control: AbstractControl,

    // public fetchAvailableEntities: (clearAvailableEntitiesAndOnlyUpdateCache: boolean) => void,
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
          this.isString ? null : entityType,
          this.group.controls,
          () => {
            this.availableEntities$.next(null);
            this.updateAddNew();
          },
          null,
          this.eavService.eavConfig,
        );
        this.availableEntities$.next(null);
        this.updateAddNew();
      })
    );
  }

  onAfterViewInit(): void {
    this.contentType = this.contentTypeMask.resolve();
  }

  destroy(): void {
    this.contentTypeMask.destroy();

    super.destroy();
  }

  updateAddNew(): void {
    const contentTypeName = this.contentTypeMask.resolve();
    this.disableAddNew$.next(!contentTypeName);
  }

  fetchEntities(clearAvailableEntitiesAndOnlyUpdateCache: boolean): void {
    if (this.isString) { 
      this.settings$.pipe(map(settings => settings._options.map(option => this.stringEntityMapping(option))), distinctUntilChanged())
        .subscribe(items => {
          return this.availableEntities$.next(items);
        });
      return;
    }

    if (clearAvailableEntitiesAndOnlyUpdateCache) {
      this.availableEntities$.next(null);
    }

    const contentTypeName = this.contentTypeMask.resolve();
    const entitiesFilter: string[] = (clearAvailableEntitiesAndOnlyUpdateCache || !this.settings$.value.EnableAddExisting)
      ? filterGuids(
        this.fieldsSettingsService.getContentTypeSettings()._itemTitle,
        this.config.fieldName,
        (this.control.value as string[]).filter(guid => !!guid),
      )
      : null;

    // @2SDV TODO: Talk with @2DM about this, more data is needed, send settings.moreFields as parameter so objects with more parameters will be returned
    // 2dm 2023-01-22 #maybeSupportIncludeParentApps
    // const includeParentApps = this.settings$.value?.IncludeParentApps == true;
    this.entityService.getAvailableEntities(contentTypeName, entitiesFilter/*, includeParentApps */).subscribe(items => {
      this.entityCacheService.loadEntities(items);
      if (!clearAvailableEntitiesAndOnlyUpdateCache) {
        this.availableEntities$.next(items);
      }
    });
  }

  stringEntityMapping(dropdownOption: DropdownOption): EntityInfo {
    const entityInfo: EntityInfo = {
      Value: dropdownOption.value as string,
      Text: dropdownOption.label,
    };
    return entityInfo;
  }
}