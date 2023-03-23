import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, map } from 'rxjs';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { FieldMask } from '../../../../shared/helpers';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { PickerAdapterFactoryService } from '../../picker/picker-adapter-factory.service';
import { ReorderIndexes } from '../../picker/picker-list/picker-list.models';
import { PickerComponent } from '../../picker/picker.component';
import { filterGuids } from '../entity-default/entity-default.helpers';
import { EntityDefaultLogic } from './entity-default-logic';

@Component({
  selector: InputTypeConstants.EntityDefault,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
})
@FieldMetadata({})
export class EntityDefaultComponent extends PickerComponent implements OnInit, OnDestroy {
  private paramsMask: FieldMask;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    entityService: EntityService,
    translate: TranslateService,
    editRoutingService: EditRoutingService,
    snackBar: MatSnackBar,
    entityCacheService: EntityCacheService,
    stringQueryCacheService: StringQueryCacheService,
    private pickerAdapterFactoryService: PickerAdapterFactoryService,
  ) {
    super(
      eavService,
      fieldsSettingsService,
      entityService,
      translate,
      editRoutingService,
      snackBar,
      entityCacheService,
      stringQueryCacheService,
    );
    EntityDefaultLogic.importMe();
    this.isQuery = false;
  }

  ngOnInit(): void {
    super.ngOnInit();

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
            // Re-Trigger fetch data, but only on type-based pickers, not Queries
            // for EntityQuery we don't have to refetch entities because entities come from settings.Query, not settings.EntityType
            if (!this.isQuery) {
              this.availableEntities$.next(null);
            }
            this.updateAddNew();
          },
          null,
          this.eavService.eavConfig,
        );

        this.availableEntities$.next(null);
        this.updateAddNew();
      })
    );

    this.pickerSourceAdapter = this.pickerAdapterFactoryService.fillPickerSourceAdapter(
      this.pickerSourceAdapter,
      this.group,
      this.availableEntities$,
      (entity: { entityGuid: string, entityId: number }) => this.editEntity(entity),
      (entity: { index: number, entityGuid: string }) => this.deleteEntity(entity),
      (clearAvailableEntitiesAndOnlyUpdateCache: boolean) => this.fetchEntities(clearAvailableEntitiesAndOnlyUpdateCache)
    );

    this.pickerStateAdapter = this.pickerAdapterFactoryService.fillPickerStateAdapter(
      this.pickerStateAdapter,
      this.config,
      this.freeTextMode$,
      this.disableAddNew$,
      this.controlStatus$,
      this.error$,
      this.selectedEntities$,
      this.label$,
      this.placeholder$,
      this.required$,
      (action: 'add' | 'delete' | 'reorder', value: string | number | ReorderIndexes) => this.updateValue(action, value),
      () => this.toggleFreeTextMode()
    );
  }

  ngOnDestroy(): void {
    this.paramsMask?.destroy();
    super.ngOnDestroy();
  }

  private updateAddNew(): void {
    const contentTypeName = this.contentTypeMask.resolve();
    this.disableAddNew$.next(!contentTypeName);
  }

  /** WARNING! Overrides function in superclass */
  fetchEntities(clearAvailableEntitiesAndOnlyUpdateCache: boolean): void {
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

    // 2dm 2023-01-22 #maybeSupportIncludeParentApps
    // const includeParentApps = this.settings$.value?.IncludeParentApps == true;
    this.entityService.getAvailableEntities(contentTypeName, entitiesFilter/*, includeParentApps */).subscribe(items => {
      this.entityCacheService.loadEntities(items);
      if (!clearAvailableEntitiesAndOnlyUpdateCache) {
        this.availableEntities$.next(items);
      }
    });
  }
}
