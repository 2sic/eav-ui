import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { PickerAdapterFactoryService } from '../../picker/picker-adapter-factory.service';
import { ReorderIndexes } from '../../picker/picker-list/picker-list.models';
import { PickerComponent } from '../../picker/picker.component';
import { EntityContentBlocksLogic } from './entity-content-blocks-logic';

@Component({
  selector: InputTypeConstants.EntityContentBlocks,
  templateUrl: '../../picker/picker.component.html',
  styleUrls: ['../../picker/picker.component.scss'],
})
@FieldMetadata({})
export class EntityContentBlockComponent extends PickerComponent implements OnInit, OnDestroy {

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
      entityService, translate,
      editRoutingService,
      snackBar,
      entityCacheService,
      stringQueryCacheService,
    );
    EntityContentBlocksLogic.importMe();
  }

  ngOnInit(): void {
    super.ngOnInit();

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
    super.ngOnDestroy();
  }
}
