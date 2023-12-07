import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { EavService, EditRoutingService, EntityService, FieldsSettingsService } from '../../../../shared/services';
import { EntityCacheService, StringQueryCacheService } from '../../../../shared/store/ngrx-data';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { PickerSourceAdapterFactoryService } from '../../picker/factories/picker-source-adapter-factory.service';
import { PickerStateAdapterFactoryService } from '../../picker/factories/picker-state-adapter-factory.service';
import { PickerComponent } from '../../picker/picker.component';
import { EntityContentBlocksLogic } from './entity-content-blocks-logic';
import { DeleteEntityProps } from '../../picker/picker.models';
import { PickerEntitySourceAdapter } from '../../picker/adapters/picker-entity-source-adapter';

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
    entityCacheService: EntityCacheService,
    stringQueryCacheService: StringQueryCacheService,
    private pickerSourceAdapterFactoryService: PickerSourceAdapterFactoryService,
    private pickerStateAdapterFactoryService: PickerStateAdapterFactoryService,
  ) {
    super(
      eavService,
      fieldsSettingsService,
      entityService, translate,
      editRoutingService,
      entityCacheService,
      stringQueryCacheService,
    );
    EntityContentBlocksLogic.importMe();
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.createPickerAdapters();
    this.createViewModel();
  }

  ngAfterViewInit(): void {
    super.ngAfterViewInit();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  private createPickerAdapters(): void {
    this.pickerStateAdapter = this.pickerStateAdapterFactoryService.createPickerStateAdapter(
      this.control,
      this.config,
      this.settings$,
      this.editRoutingService,
      this.controlStatus$,
      this.label$,
      this.placeholder$,
      this.required$,
      () => this.focusOnSearchComponent,
    );

    this.pickerSourceAdapter = this.pickerSourceAdapterFactoryService.createPickerEntitySourceAdapter(
      this.pickerStateAdapter.disableAddNew$,
      this.fieldsSettingsService,

      this.pickerStateAdapter.control,
      this.config,
      this.pickerStateAdapter.settings$,
      this.editRoutingService,
      this.group,
      // (clearAvailableItemsAndOnlyUpdateCache: boolean) => this.fetchEntities(clearAvailableItemsAndOnlyUpdateCache),
      (props: DeleteEntityProps) => this.pickerStateAdapter.doAfterDelete(props)
    );

    this.pickerStateAdapterFactoryService.init(this.pickerStateAdapter);
    this.pickerSourceAdapterFactoryService.initEntity(this.pickerSourceAdapter as PickerEntitySourceAdapter);
  }
}
