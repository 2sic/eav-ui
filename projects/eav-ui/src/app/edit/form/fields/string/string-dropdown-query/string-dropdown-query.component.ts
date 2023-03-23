import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { distinctUntilChanged, map } from 'rxjs';
import { EntityInfo } from '../../../../../../../../edit-types';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService, QueryService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { EntityQueryComponent } from '../../entity/entity-query/entity-query.component';
import { QueryEntity } from '../../entity/entity-query/entity-query.models';
import { ReorderIndexes } from '../../picker/picker-list/picker-list.models';
import { PickerSourceAdapterFactoryService } from '../../picker/picker-source-adapter-factory.service';
import { PickerStateAdapterFactoryService } from '../../picker/picker-state-adapter-factory.service';
import { StringDropdownQueryLogic } from './string-dropdown-query-logic';

@Component({
  selector: InputTypeConstants.StringDropdownQuery,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
})
@FieldMetadata({})
export class StringDropdownQueryComponent extends EntityQueryComponent implements OnInit, OnDestroy {

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    entityService: EntityService,
    translate: TranslateService,
    editRoutingService: EditRoutingService,
    snackBar: MatSnackBar,
    entityCacheService: EntityCacheService,
    stringQueryCacheService: StringQueryCacheService,
    queryService: QueryService,
    pickerSourceAdapterFactoryService: PickerSourceAdapterFactoryService,
    pickerStateAdapterFactoryService: PickerStateAdapterFactoryService,
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
      queryService,
      pickerSourceAdapterFactoryService,
      pickerStateAdapterFactoryService
    );
    StringDropdownQueryLogic.importMe();
    this.isStringQuery = true;
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.subscription.add(
      this.settings$.pipe(
        map(settings => ({
          Value: settings.Value,
          Label: settings.Label,
        })),
        distinctUntilChanged(GeneralHelpers.objectsEqual),
      ).subscribe(() => {
        this.availableEntities$.next(null);
      })
    );

    this.pickerSourceAdapter = this.pickerSourceAdapterFactoryService.fillPickerSourceAdapter(
      this.pickerSourceAdapter,
      this.group,
      this.availableEntities$,
      (entity: { entityGuid: string, entityId: number }) => this.editEntity(entity),
      (entity: { index: number, entityGuid: string }) => this.deleteEntity(entity),
      (clearAvailableEntitiesAndOnlyUpdateCache: boolean) => this.fetchEntities(clearAvailableEntitiesAndOnlyUpdateCache)
    );

    this.pickerStateAdapter = this.pickerStateAdapterFactoryService.fillPickerStateAdapter(
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
    super.ngOnDestroy();
  }

  /** WARNING! Overrides function in superclass */
  queryEntityMapping(entity: QueryEntity): EntityInfo {
    const settings = this.settings$.value;
    const entityInfo: EntityInfo = {
      Id: entity.Id,
      Value: entity[settings.Value] ? `${entity[settings.Value]}` : entity[settings.Value],
      Text: entity[settings.Label] ? `${entity[settings.Label]}` : entity[settings.Label],
    };
    return entityInfo;
  }
}
